import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ profileId: string }> },
) {
  const { profileId } = await params
  const admin = getAdmin()

  const [{ data: profile }, { data: config }] = await Promise.all([
    admin.from('profiles').select('business_name').eq('id', profileId).single(),
    admin.from('widget_configs').select('*').eq('profile_id', profileId).maybeSingle(),
  ])

  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const minRating   = config?.min_rating  ?? 1
  const maxReviews  = config?.max_reviews ?? 6

  const { data: reviews } = await admin
    .from('reviews')
    .select('id, rating, comment, reviewer_name, reviewer_photo_url, review_date')
    .eq('profile_id', profileId)
    .gte('rating', minRating)
    .order('review_date', { ascending: false })
    .limit(maxReviews)

  return NextResponse.json({
    profile,
    config: config ?? { theme: 'light', accent_color: '#6366f1', show_dates: true, max_reviews: 6, min_rating: 1 },
    reviews: reviews ?? [],
  })
}
