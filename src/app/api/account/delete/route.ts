export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe/client'

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdmin()

  // Fetch user data for Stripe cleanup
  const { data: userData } = await admin
    .from('users')
    .select('stripe_customer_id, stripe_subscription_id')
    .eq('id', user.id)
    .single()

  // Cancel active Stripe subscription so they aren't billed again
  if (userData?.stripe_subscription_id) {
    try {
      await getStripe().subscriptions.cancel(userData.stripe_subscription_id)
    } catch (e) {
      console.error('[account/delete] stripe subscription cancel error:', e)
      // Non-fatal — continue with deletion
    }
  }

  // Delete all user data in dependency order
  // First get the user's review IDs to clean up tag assignments
  const { data: userReviews } = await admin
    .from('reviews')
    .select('id')
    .eq('user_id', user.id)
  if (userReviews?.length) {
    const reviewIds = userReviews.map(r => r.id)
    await admin.from('review_tag_assignments').delete().in('review_id', reviewIds)
  }

  await admin.from('auto_reply_rules').delete().eq('user_id', user.id)
  await admin.from('notification_preferences').delete().eq('user_id', user.id)
  await admin.from('notifications').delete().eq('user_id', user.id)
  await admin.from('widget_configs').delete().eq('user_id', user.id)
  await admin.from('review_collection_links').delete().eq('user_id', user.id)
  await admin.from('review_templates').delete().eq('user_id', user.id)
  await admin.from('review_tags').delete().eq('user_id', user.id)
  await admin.from('reviews').delete().eq('user_id', user.id)
  await admin.from('profiles').delete().eq('user_id', user.id)
  await admin.from('users').delete().eq('id', user.id)

  // Delete the auth user — must be last, uses service role
  const { error: authDeleteError } = await admin.auth.admin.deleteUser(user.id)
  if (authDeleteError) {
    console.error('[account/delete] auth delete error:', authDeleteError)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
