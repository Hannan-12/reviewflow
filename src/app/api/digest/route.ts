import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendDigestEmail } from '@/lib/resend/client'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// GET /api/digest — called daily by Vercel Cron at 08:00 UTC
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getAdmin()
  const now = new Date()
  let digestsSent = 0
  let errors = 0

  // Fetch all non-instant email preferences
  const { data: prefs, error } = await admin
    .from('notification_preferences')
    .select(`
      id, user_id, profile_id,
      email_digest_frequency, last_digest_sent_at, email_enabled,
      user:users(email, full_name),
      profile:profiles(business_name)
    `)
    .eq('email_enabled', true)
    .in('email_digest_frequency', ['daily', 'weekly'])

  if (error) {
    console.error('[digest] failed to fetch preferences:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }

  if (!prefs?.length) {
    return NextResponse.json({ success: true, sent: 0 })
  }

  for (const pref of prefs) {
    const lastSent = pref.last_digest_sent_at ? new Date(pref.last_digest_sent_at) : new Date(0)
    const hoursSinceLast = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60)
    // Allow a small buffer (23h for daily, 167h for weekly) to avoid drift
    const threshold = pref.email_digest_frequency === 'daily' ? 23 : 167

    if (hoursSinceLast < threshold) continue

    // Reviews since last digest
    const { data: reviews } = await admin
      .from('reviews')
      .select('id, reviewer_name, rating, comment, review_date')
      .eq('profile_id', pref.profile_id)
      .eq('user_id', pref.user_id)
      .gt('review_date', lastSent.toISOString())
      .order('review_date', { ascending: false })

    if (!reviews?.length) {
      // No new reviews — still update timestamp so we don't check again too soon
      await admin
        .from('notification_preferences')
        .update({ last_digest_sent_at: now.toISOString() })
        .eq('id', pref.id)
      continue
    }

    try {
      const user = pref.user as any
      const profile = pref.profile as any

      await sendDigestEmail({
        userEmail: user.email,
        userName: user.full_name || 'there',
        profileName: profile.business_name,
        profileId: pref.profile_id,
        reviews: reviews.map((r) => ({
          reviewId: r.id,
          reviewerName: r.reviewer_name || 'Anonymous',
          rating: r.rating,
          comment: r.comment || '',
          reviewDate: new Date(r.review_date).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          }),
        })),
        frequency: pref.email_digest_frequency as 'daily' | 'weekly',
      })

      await admin
        .from('notification_preferences')
        .update({ last_digest_sent_at: now.toISOString() })
        .eq('id', pref.id)

      digestsSent++
    } catch (err) {
      console.error(`[digest] failed for pref ${pref.id}:`, err)
      errors++
    }
  }

  console.log(`[digest] sent=${digestsSent} errors=${errors}`)
  return NextResponse.json({ success: true, sent: digestsSent, errors })
}
