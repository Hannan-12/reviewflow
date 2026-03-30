import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// GET /api/reviews/export?profileId=xxx
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const profileId = searchParams.get('profileId')

  const admin = getAdmin()
  let query = admin
    .from('reviews')
    .select('reviewer_name, rating, comment, review_date, reply, replied_at, profile:profiles(business_name)')
    .eq('user_id', user.id)
    .order('review_date', { ascending: false })

  if (profileId) query = query.eq('profile_id', profileId)

  const { data: reviews, error } = await query

  if (error) return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })

  const header = ['Reviewer', 'Rating', 'Comment', 'Date', 'Reply', 'Replied At', 'Profile']
  const rows = (reviews ?? []).map((r) => {
    const profile = r.profile as any
    return [
      r.reviewer_name ?? 'Anonymous',
      r.rating,
      r.comment ?? '',
      r.review_date ? new Date(r.review_date).toLocaleDateString('en-US') : '',
      r.reply ?? '',
      r.replied_at ? new Date(r.replied_at).toLocaleDateString('en-US') : '',
      profile?.business_name ?? '',
    ]
  })

  const csv = [header, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const filename = `reviews-${new Date().toISOString().split('T')[0]}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
