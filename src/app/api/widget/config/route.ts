import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profileId = new URL(req.url).searchParams.get('profileId')
  if (!profileId) return NextResponse.json({ error: 'profileId required' }, { status: 400 })

  // Verify user owns the profile before returning its config
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', profileId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data } = await supabase
    .from('widget_configs')
    .select('*')
    .eq('profile_id', profileId)
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json(data ?? {
    theme: 'light', max_reviews: 6, min_rating: 1, show_dates: true, accent_color: '#6366f1',
  })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { profileId, theme, maxReviews, minRating, showDates, accentColor } = body

  // Verify user owns the profile before writing
  const { data: ownedProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', profileId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!ownedProfile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await getAdmin()
    .from('widget_configs')
    .upsert({
      user_id:     user.id,
      profile_id:  profileId,
      theme,
      max_reviews: maxReviews,
      min_rating:  minRating,
      show_dates:  showDates,
      accent_color: accentColor,
      updated_at:  new Date().toISOString(),
    }, { onConflict: 'profile_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
