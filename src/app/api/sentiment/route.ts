import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { analyzeSentiment, suggestTagsForReview } from '@/lib/openai/client'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// GET /api/sentiment — Vercel Cron nightly batch: analyze sentiment + auto-tag unprocessed reviews
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getAdmin()

  // Process up to 100 reviews without sentiment per run (avoids timeout)
  const { data: reviews, error } = await admin
    .from('reviews')
    .select('id, user_id, rating, comment')
    .is('sentiment', null)
    .limit(100)

  if (error) {
    console.error('[sentiment-cron] fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!reviews?.length) {
    return NextResponse.json({ success: true, processed: 0 })
  }

  // Fetch all user tags grouped by user_id for auto-tagging
  const userIds = [...new Set(reviews.map((r) => r.user_id))]
  const { data: allTags } = await admin
    .from('review_tags')
    .select('user_id, id, name')
    .in('user_id', userIds)

  const tagsByUser = new Map<string, { id: string; name: string }[]>()
  for (const tag of allTags ?? []) {
    const existing = tagsByUser.get(tag.user_id) ?? []
    existing.push({ id: tag.id, name: tag.name })
    tagsByUser.set(tag.user_id, existing)
  }

  let processed = 0
  let errors = 0

  for (const review of reviews) {
    try {
      // 1. Sentiment
      const { sentiment, score } = await analyzeSentiment(
        review.comment ?? '',
        review.rating,
      )

      await admin
        .from('reviews')
        .update({
          sentiment,
          sentiment_score: score,
          sentiment_at: new Date().toISOString(),
        })
        .eq('id', review.id)

      // 2. Auto-tagging — only if user has tags configured
      const userTags = tagsByUser.get(review.user_id) ?? []
      if (userTags.length) {
        const suggestedNames = await suggestTagsForReview(
          review.comment ?? '',
          review.rating,
          userTags.map((t) => t.name),
        )

        if (suggestedNames.length) {
          const tagIds = suggestedNames
            .map((name) => userTags.find((t) => t.name.toLowerCase() === name.toLowerCase())?.id)
            .filter(Boolean) as string[]

          if (tagIds.length) {
            await admin
              .from('review_tag_assignments')
              .upsert(
                tagIds.map((tag_id) => ({ review_id: review.id, tag_id })),
                { onConflict: 'review_id,tag_id', ignoreDuplicates: true },
              )
          }
        }
      }

      processed++
    } catch (e) {
      console.error(`[sentiment-cron] error for review ${review.id}:`, e)
      errors++
    }
  }

  console.log(`[sentiment-cron] processed=${processed} errors=${errors}`)
  return NextResponse.json({ success: true, processed, errors })
}

// POST /api/sentiment — manually trigger for a single review (authenticated user)
export async function POST(request: NextRequest) {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reviewId } = await request.json()
  if (!reviewId) return NextResponse.json({ error: 'reviewId is required' }, { status: 400 })

  const { data: review, error } = await supabase
    .from('reviews')
    .select('id, rating, comment')
    .eq('id', reviewId)
    .eq('user_id', user.id)
    .single()

  if (error || !review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })

  const result = await analyzeSentiment(review.comment ?? '', review.rating)

  await supabase
    .from('reviews')
    .update({
      sentiment: result.sentiment,
      sentiment_score: result.score,
      sentiment_at: new Date().toISOString(),
    })
    .eq('id', review.id)

  return NextResponse.json(result)
}
