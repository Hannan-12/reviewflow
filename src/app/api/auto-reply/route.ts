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
    custom_instructions: null,
  })
}

// POST /api/auto-reply — upsert rule for a profile
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { profileId, enabled, minRating, maxRating, customInstructions } = body

  if (!profileId) return NextResponse.json({ error: 'profileId is required' }, { status: 400 })

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
    min_rating: minRating ?? null,
    max_rating: maxRating ?? null,
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
