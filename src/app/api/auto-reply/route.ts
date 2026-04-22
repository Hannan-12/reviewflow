export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/auto-reply?profileId=xxx
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profileId = new URL(request.url).searchParams.get('profileId')
  if (!profileId) return NextResponse.json({ error: 'profileId is required' }, { status: 400 })

  const { data } = await supabase
    .from('auto_reply_rules')
    .select('*')
    .eq('user_id', user.id)
    .eq('profile_id', profileId)
    .single()

  // Return defaults if no rule exists yet
  return NextResponse.json(data ?? {
    enabled: false,
    min_rating: null,
    max_rating: null,
    reply_to_ratings: null,
    custom_instructions: null,
  })
}

// POST /api/auto-reply — upsert rule for a profile
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { profileId, enabled, replyToRatings, customInstructions } = body

  if (!profileId) return NextResponse.json({ error: 'profileId is required' }, { status: 400 })

  // Block Lite/free users from enabling auto-reply
  if (enabled) {
    const { data: userData } = await supabase
      .from('users')
      .select('plan_name')
      .eq('id', user.id)
      .single()
    const plan = userData?.plan_name ?? 'free'
    if (plan !== 'pro' && plan !== 'agency') {
      return NextResponse.json({ error: 'Auto-Reply requires a Pro or Agency plan.' }, { status: 403 })
    }
  }

  const { data: existing } = await supabase
    .from('auto_reply_rules')
    .select('id')
    .eq('user_id', user.id)
    .eq('profile_id', profileId)
    .single()

  const record = {
    user_id: user.id,
    profile_id: profileId,
    enabled: enabled ?? false,
    reply_to_ratings: Array.isArray(replyToRatings) && replyToRatings.length ? replyToRatings : null,
    custom_instructions: customInstructions?.trim() || null,
  }

  if (existing) {
    const { error } = await supabase
      .from('auto_reply_rules')
      .update(record)
      .eq('id', existing.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase.from('auto_reply_rules').insert(record)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
