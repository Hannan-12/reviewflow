import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/dashboard/header'
import { Sidebar } from '@/components/dashboard/sidebar'
import { SidebarProvider } from '@/components/dashboard/sidebar-context'
import { RepliesPageClient } from '@/components/dashboard/replies-page-client'
import { MessageSquare } from 'lucide-react'

export const metadata = { title: 'Replies — ReviewFlow' }

export default async function RepliesPage({
  searchParams,
}: {
  searchParams: Promise<{ profile?: string; status?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { profile: profileFilter, status } = await searchParams

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

  // Fetch reviews that have replies
  let repliesQuery = supabase
    .from('reviews')
    .select(`
      id, rating, comment, reviewer_name, reviewer_photo_url,
      review_date, reply, replied_at, reply_synced_to_gbp, user_accepted_ai,
      profiles!inner(id, business_name)
    `)
    .eq('user_id', user.id)
    .not('reply', 'is', null)
    .order('replied_at', { ascending: false })
    .limit(100)

  if (profileFilter) repliesQuery = repliesQuery.eq('profile_id', profileFilter)
  if (status === 'ai') repliesQuery = repliesQuery.eq('user_accepted_ai', true)
  if (status === 'manual') repliesQuery = repliesQuery.eq('user_accepted_ai', false)
  if (status === 'synced') repliesQuery = repliesQuery.eq('reply_synced_to_gbp', true)
  if (status === 'pending') repliesQuery = repliesQuery.eq('reply_synced_to_gbp', false)

  const { data: replies } = await repliesQuery

  // Stats
  const { data: allReplies } = await supabase
    .from('reviews')
    .select('reply_synced_to_gbp, user_accepted_ai')
    .eq('user_id', user.id)
    .not('reply', 'is', null)

  const totalReplied = allReplies?.length ?? 0
  const aiCount = allReplies?.filter((r) => r.user_accepted_ai).length ?? 0
  const syncedCount = allReplies?.filter((r) => r.reply_synced_to_gbp).length ?? 0

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-muted/20">
        <Sidebar planName={userData?.plan_name ?? 'free'} />
        <main className="flex-1 overflow-y-auto">
          <Header title="Replies" />
          <div className="max-w-5xl mx-auto p-5 space-y-5 page-animate">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Total Replied</p>
                <p className="text-2xl font-bold tabular-nums">{totalReplied}</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Synced to Google</p>
                <p className="text-2xl font-bold tabular-nums text-green-600">{syncedCount}</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">AI-Assisted</p>
                <p className="text-2xl font-bold tabular-nums text-primary">{aiCount}</p>
              </div>
            </div>

            {totalReplied === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card flex flex-col items-center justify-center py-16 text-center gap-3">
                <MessageSquare className="w-8 h-8 text-muted-foreground/40" />
                <div>
                  <p className="font-semibold text-sm">No replies yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reply to reviews from the Reviews page to see them here.
                  </p>
                </div>
              </div>
            ) : (
              <RepliesPageClient
                replies={(replies ?? []).map((r) => ({
                  id: r.id,
                  rating: r.rating,
                  comment: r.comment,
                  reviewer_name: r.reviewer_name,
                  reviewer_photo_url: r.reviewer_photo_url,
                  review_date: r.review_date,
                  reply: r.reply,
                  replied_at: r.replied_at,
                  reply_synced_to_gbp: r.reply_synced_to_gbp,
                  user_accepted_ai: r.user_accepted_ai,
                  business_name: (r.profiles as unknown as { business_name: string })?.business_name ?? '',
                  profile_id: (r.profiles as unknown as { id: string })?.id ?? '',
                }))}
                profiles={profiles ?? []}
                currentProfile={profileFilter ?? null}
                currentStatus={status ?? null}
              />
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
