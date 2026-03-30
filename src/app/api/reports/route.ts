import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET /api/reports?profileId=xxx&range=30
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const profileId = searchParams.get('profileId')
  const range = parseInt(searchParams.get('range') ?? '30')

  const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString()

  let query = supabase
    .from('reviews')
    .select('id, rating, reply, review_date, profile_id, sentiment, profiles!inner(business_name)')
    .eq('user_id', user.id)
    .gte('review_date', since)
    .order('review_date', { ascending: true })

  if (profileId) query = query.eq('profile_id', profileId)

  const { data: reviews, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // All-time reviews for response rate, distribution, leaderboard, sentiment
  let totalQuery = supabase
    .from('reviews')
    .select('id, rating, reply, profile_id, sentiment, profiles!inner(business_name)')
    .eq('user_id', user.id)
  if (profileId) totalQuery = totalQuery.eq('profile_id', profileId)
  const { data: allReviews } = await totalQuery

  // --- Rating trend: group by day ---
  const dayMap = new Map<string, { total: number; sum: number; count: number }>()
  for (const r of reviews ?? []) {
    const day = r.review_date.slice(0, 10)
    const existing = dayMap.get(day) ?? { total: 0, sum: 0, count: 0 }
    dayMap.set(day, {
      total: existing.total + 1,
      sum: existing.sum + r.rating,
      count: existing.count + 1,
    })
  }
  const ratingTrend = Array.from(dayMap.entries()).map(([date, v]) => ({
    date,
    avgRating: parseFloat((v.sum / v.count).toFixed(2)),
    count: v.total,
  }))

  // --- Rating distribution (all time) ---
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const r of allReviews ?? []) dist[r.rating] = (dist[r.rating] ?? 0) + 1
  const ratingDistribution = [5, 4, 3, 2, 1].map((r) => ({ rating: r, count: dist[r] }))

  // --- Response rate (all time) ---
  const total = allReviews?.length ?? 0
  const replied = allReviews?.filter((r) => r.reply).length ?? 0
  const responseRate = total > 0 ? Math.round((replied / total) * 100) : 0

  // --- Summary stats ---
  const periodReviews = reviews ?? []
  const periodTotal = periodReviews.length
  const periodAvg = periodTotal > 0
    ? parseFloat((periodReviews.reduce((s, r) => s + r.rating, 0) / periodTotal).toFixed(1))
    : null

  // --- Sentiment breakdown (all time) ---
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0, unanalyzed: 0 }
  for (const r of allReviews ?? []) {
    if (r.sentiment === 'positive') sentimentCounts.positive++
    else if (r.sentiment === 'neutral') sentimentCounts.neutral++
    else if (r.sentiment === 'negative') sentimentCounts.negative++
    else sentimentCounts.unanalyzed++
  }

  // --- Leaderboard: top profiles by avg rating (all time, only when no profileId filter) ---
  let leaderboard: { profileId: string; businessName: string; avgRating: number; total: number; replied: number }[] = []
  if (!profileId) {
    const profileMap = new Map<string, { name: string; sum: number; count: number; replied: number }>()
    for (const r of allReviews ?? []) {
      const name = (r.profiles as unknown as { business_name: string })?.business_name ?? 'Unknown'
      const existing = profileMap.get(r.profile_id) ?? { name, sum: 0, count: 0, replied: 0 }
      existing.sum += r.rating
      existing.count++
      if (r.reply) existing.replied++
      profileMap.set(r.profile_id, existing)
    }
    leaderboard = Array.from(profileMap.entries())
      .map(([pid, v]) => ({
        profileId: pid,
        businessName: v.name,
        avgRating: parseFloat((v.sum / v.count).toFixed(2)),
        total: v.count,
        replied: v.replied,
      }))
      .sort((a, b) => b.avgRating - a.avgRating || b.total - a.total)
      .slice(0, 10)
  }

  return NextResponse.json({
    ratingTrend,
    ratingDistribution,
    responseRate,
    sentimentCounts,
    leaderboard,
    summary: {
      periodTotal,
      periodAvg,
      allTimeTotal: total,
      allTimeReplied: replied,
    },
  })
}
