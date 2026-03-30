import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/dashboard/header'
import { Sidebar } from '@/components/dashboard/sidebar'
import { SidebarProvider } from '@/components/dashboard/sidebar-context'
import { ReviewsPageClient } from '@/components/dashboard/reviews-page-client'
import { Star } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Reviews — ReviewFlow' }

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ rating?: string; profile?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { rating, profile: profileFilter } = await searchParams

  const { data: userData } = await supabase
    .from('users')
    .select('plan_name')
    .eq('id', user.id)
    .single()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, business_name')
    .eq('user_id', user.id)
    .eq('is_active', true)

  // Build reviews query
  let reviewsQuery = supabase
    .from('reviews')
    .select(`
      id, rating, comment, reviewer_name, reviewer_photo_url,
      review_date, reply, replied_at,
      profiles!inner(id, business_name)
    `)
    .eq('user_id', user.id)
    .order('review_date', { ascending: false })
    .limit(100)

  if (rating) reviewsQuery = reviewsQuery.eq('rating', parseInt(rating))
  if (profileFilter) reviewsQuery = reviewsQuery.eq('profile_id', profileFilter)

  const { data: reviews } = await reviewsQuery

  // Stats
  const { data: statsRows } = await supabase
    .from('reviews')
    .select('rating')
    .eq('user_id', user.id)

  const totalCount = statsRows?.length ?? 0
  const avgRating  = totalCount > 0
    ? (statsRows!.reduce((s, r) => s + r.rating, 0) / totalCount).toFixed(1)
    : null

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count:  statsRows?.filter(s => s.rating === r).length ?? 0,
  }))

  const hasProfiles = (profiles?.length ?? 0) > 0

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-muted/20">
        <Sidebar planName={userData?.plan_name ?? 'free'} />
        <main className="flex-1 overflow-y-auto">
          <Header title="Reviews" />
          <div className="max-w-5xl mx-auto p-5 space-y-5 page-animate">

            {!hasProfiles ? (
              <div className="rounded-2xl border border-dashed border-border bg-card flex flex-col items-center justify-center py-16 text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1">No profiles connected yet</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Connect a Google Business Profile to start syncing and viewing reviews.
                  </p>
                </div>
                <Link href="/dashboard/profiles">
                  <Button className="font-semibold">Go to Profiles</Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Rating stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Total Reviews</p>
                    <p className="text-2xl font-bold tabular-nums">{totalCount}</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Avg. Rating</p>
                    <p className="text-2xl font-bold tabular-nums flex items-center gap-1.5">
                      {avgRating ?? '—'}
                      {avgRating && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-4 col-span-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Rating breakdown</p>
                    <div className="space-y-1">
                      {ratingDist.map(({ rating: r, count }) => (
                        <div key={r} className="flex items-center gap-2">
                          <span className="text-xs w-4 text-right text-muted-foreground">{r}</span>
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-400 transition-all"
                              style={{ width: totalCount > 0 ? `${(count / totalCount) * 100}%` : '0%' }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-6 tabular-nums">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reviews table */}
                <ReviewsPageClient
                  reviews={(reviews ?? []).map(r => ({
                    id:                 r.id,
                    rating:             r.rating,
                    comment:            r.comment,
                    reviewer_name:      r.reviewer_name,
                    reviewer_photo_url: r.reviewer_photo_url,
                    review_date:        r.review_date,
                    reply:              r.reply,
                    replied_at:         r.replied_at,
                    business_name:      (r.profiles as unknown as { business_name: string })?.business_name ?? '',
                    profile_id:         (r.profiles as unknown as { id: string })?.id ?? '',
                  }))}
                  profiles={profiles ?? []}
                  currentRating={rating ?? null}
                  currentProfile={profileFilter ?? null}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
