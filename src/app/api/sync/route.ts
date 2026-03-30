import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { getValidAccessToken, listAllReviews, starToNumber, replyToReview } from '@/lib/google/api'
import { notifyNewReview } from '@/lib/notifications/service'
import { generateReplyFromAI, analyzeSentiment, suggestTagsForReview } from '@/lib/openai/client'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function runAutoReply(
  review: { id: string; google_review_name: string | null; rating: number; comment: string | null; reviewer_name: string | null },
  profile: { id: string; business_name: string },
  userId: string,
  token: string,
  admin: ReturnType<typeof getAdmin>,
) {
  const { data: rule } = await admin
    .from('auto_reply_rules')
    .select('enabled, min_rating, max_rating, custom_instructions')
    .eq('user_id', userId)
    .eq('profile_id', profile.id)
    .single()

  if (!rule?.enabled) return
  if (rule.min_rating != null && review.rating < rule.min_rating) return
  if (rule.max_rating != null && review.rating > rule.max_rating) return
  if (!review.google_review_name) return

  const aiReply = await generateReplyFromAI({
    reviewerName: review.reviewer_name || 'Anonymous',
    rating: review.rating,
    comment: review.comment || '',
    businessName: profile.business_name,
    businessType: rule.custom_instructions ?? undefined,
  })

  await replyToReview(review.google_review_name, aiReply, token)

  await admin
    .from('reviews')
    .update({ reply: aiReply, replied_at: new Date().toISOString(), reply_synced_to_gbp: true })
    .eq('id', review.id)
}

async function runSentimentAndAutoTag(
  review: { id: string; rating: number; comment: string | null },
  userId: string,
  admin: ReturnType<typeof getAdmin>,
) {
  // Sentiment analysis
  const { sentiment, score } = await analyzeSentiment(review.comment ?? '', review.rating)
  await admin
    .from('reviews')
    .update({ sentiment, sentiment_score: score, sentiment_at: new Date().toISOString() })
    .eq('id', review.id)

  // Auto-tagging — fetch user's tags and suggest
  const { data: userTags } = await admin
    .from('review_tags')
    .select('id, name')
    .eq('user_id', userId)

  if (userTags?.length) {
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
}

async function syncUser(userId: string, admin: ReturnType<typeof getAdmin>) {
  const token = await getValidAccessToken(userId)

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, location_name, business_name')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (!profiles?.length) return 0
  let synced = 0

  for (const profile of profiles) {
    if (!profile.location_name) continue
    const reviews = await listAllReviews(profile.location_name, token)

    if (!reviews.length) {
      await admin.from('profiles').update({ last_synced_at: new Date().toISOString() }).eq('id', profile.id)
      continue
    }

    const rows = reviews.map((r) => ({
      profile_id:         profile.id,
      user_id:            userId,
      google_review_id:   r.reviewId,
      reviewer_name:      r.reviewer.isAnonymous ? 'Anonymous' : (r.reviewer.displayName ?? 'Unknown'),
      reviewer_photo_url: r.reviewer.profilePhotoUrl ?? null,
      rating:             starToNumber(r.starRating),
      comment:            r.comment ?? null,
      google_review_name: r.name,
      reply:              r.reviewReply?.comment ?? null,
      replied_at:         r.reviewReply?.updateTime ?? null,
      review_date:        r.createTime,
    }))

    const { data: existing } = await admin.from('reviews').select('google_review_id').eq('profile_id', profile.id)
    const existingIds = new Set(existing?.map((r) => r.google_review_id) || [])
    const newIds = rows.filter((row) => !existingIds.has(row.google_review_id)).map((row) => row.google_review_id)

    const { error } = await admin.from('reviews').upsert(rows, { onConflict: 'profile_id,google_review_id' })

    if (!error) {
      synced += rows.length
      if (newIds.length > 0) {
        const { data: newReviews } = await admin
          .from('reviews')
          .select('id, google_review_id, google_review_name, reviewer_name, rating, comment, review_date, reviewer_photo_url')
          .eq('profile_id', profile.id)
          .in('google_review_id', newIds)
        for (const nr of newReviews || []) {
          try {
            await notifyNewReview(nr.id, profile.id, userId, {
              reviewerName: nr.reviewer_name,
              rating: nr.rating,
              comment: nr.comment,
              review_date: nr.review_date,
              reviewer_photo_url: nr.reviewer_photo_url,
            })
          } catch (e) {
            console.error(`[cron-sync] notification error for review ${nr.id}:`, e)
          }
          try {
            await runAutoReply(nr, profile, userId, token, admin)
          } catch (e) {
            console.error(`[cron-sync] auto-reply error for review ${nr.id}:`, e)
          }
          try {
            await runSentimentAndAutoTag(nr, userId, admin)
          } catch (e) {
            console.error(`[cron-sync] sentiment error for review ${nr.id}:`, e)
          }
        }
      }
    }

    await admin.from('profiles').update({ last_synced_at: new Date().toISOString() }).eq('id', profile.id)
  }

  return synced
}

// GET /api/sync — called by Vercel Cron every hour
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getAdmin()

  // Find all users with a Google refresh token
  const { data: users } = await admin
    .from('users')
    .select('id')
    .not('google_refresh_token', 'is', null)

  if (!users?.length) return NextResponse.json({ success: true, synced: 0 })

  let totalSynced = 0
  let errors = 0

  for (const { id: userId } of users) {
    try {
      totalSynced += await syncUser(userId, admin)
    } catch (e) {
      console.error(`[cron-sync] error for user ${userId}:`, e)
      errors++
    }
  }

  console.log(`[cron-sync] synced=${totalSynced} errors=${errors}`)
  return NextResponse.json({ success: true, synced: totalSynced, errors })
}

/**
 * POST /api/sync
 * Body: { profileId?: string }  — if omitted, syncs all profiles for the user
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { profileId } = body as { profileId?: string }

  // Fetch the relevant profiles
  const profileQuery = supabase
    .from('profiles')
    .select('id, location_name, business_name')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (profileId) profileQuery.eq('id', profileId)

  const { data: profiles } = await profileQuery

  if (!profiles?.length) {
    return NextResponse.json({ error: 'No profiles found' }, { status: 404 })
  }

  try {
    const token = await getValidAccessToken(user.id)
    const admin = getAdmin()
    let totalSynced = 0

    for (const profile of profiles) {
      if (!profile.location_name) continue

      const reviews = await listAllReviews(profile.location_name, token)

      if (reviews.length === 0) {
        // Still update last_synced_at
        await admin
          .from('profiles')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', profile.id)
        continue
      }

      const rows = reviews.map((r) => ({
        profile_id:         profile.id,
        user_id:            user.id,
        google_review_id:   r.reviewId,
        reviewer_name:      r.reviewer.isAnonymous ? 'Anonymous' : (r.reviewer.displayName ?? 'Unknown'),
        reviewer_photo_url: r.reviewer.profilePhotoUrl ?? null,
        rating:             starToNumber(r.starRating),
        comment:            r.comment ?? null,
        google_review_name: r.name,
        reply:              r.reviewReply?.comment ?? null,
        replied_at:         r.reviewReply?.updateTime ?? null,
        review_date:        r.createTime,
      }))

      // Get existing Google review IDs to detect new reviews
      const { data: existingReviews } = await admin
        .from('reviews')
        .select('google_review_id')
        .eq('profile_id', profile.id)

      const existingGoogleIds = new Set(
        existingReviews?.map((r) => r.google_review_id) || []
      )

      const newReviewGoogleIds = rows
        .filter((row) => !existingGoogleIds.has(row.google_review_id))
        .map((row) => row.google_review_id)

      // Upsert — update reply/rating if changed
      const { error } = await admin
        .from('reviews')
        .upsert(rows, { onConflict: 'profile_id,google_review_id' })

      if (error) {
        console.error(`[sync] upsert error for profile ${profile.id}:`, error)
      } else {
        totalSynced += rows.length

        // Send notifications for new reviews
        if (newReviewGoogleIds.length > 0) {
          const { data: newReviews } = await admin
            .from('reviews')
            .select('id, google_review_id, reviewer_name, rating, comment, review_date, reviewer_photo_url')
            .eq('profile_id', profile.id)
            .in('google_review_id', newReviewGoogleIds)

          for (const newReview of newReviews || []) {
            try {
              await notifyNewReview(
                newReview.id,
                profile.id,
                user.id,
                {
                  reviewerName: newReview.reviewer_name,
                  rating: newReview.rating,
                  comment: newReview.comment,
                  review_date: newReview.review_date,
                  reviewer_photo_url: newReview.reviewer_photo_url,
                }
              )
            } catch (notificationError) {
              console.error(
                `[sync] notification error for review ${newReview.id}:`,
                notificationError
              )
            }
            try {
              await runSentimentAndAutoTag(newReview, user.id, admin)
            } catch (sentimentError) {
              console.error(
                `[sync] sentiment error for review ${newReview.id}:`,
                sentimentError
              )
            }
          }
        }
      }

      await admin
        .from('profiles')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', profile.id)
    }

    return NextResponse.json({ success: true, synced: totalSynced })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (message.includes('No Google account connected')) {
      return NextResponse.json({ error: 'not_connected' }, { status: 400 })
    }
    console.error('[sync]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
