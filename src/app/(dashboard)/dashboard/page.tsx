export const dynamic = 'force-dynamic'
import { Header } from '@/components/dashboard/header'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Star, Bell, BarChart3, Plus, ArrowRight, Zap, TrendingUp, MessageSquare, MapPin } from 'lucide-react'
import Link from 'next/link'
import { OnboardingChecklist } from '@/components/onboarding-checklist'

export const metadata = { title: 'Dashboard — GoHighReview' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: userData },
    { data: allReviews },
    { data: weekReviews },
    { data: profiles },
    { data: notifPrefs },
    { data: repliedReview },
  ] = await Promise.all([
    supabase
      .from('users')
      .select('full_name, plan_name, subscription_status, trial_ends_at, profile_limit')
      .eq('id', user?.id ?? '')
      .single(),
    supabase
      .from('reviews')
      .select('rating, reply')
      .eq('user_id', user?.id ?? ''),
    supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user?.id ?? '')
      .gte('review_date', new Date(Date.now() - 7 * 86400000).toISOString()),
    // Onboarding: check if user has connected a GBP
    supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user?.id ?? '')
      .limit(1),
    // Onboarding: check if notifications configured
    supabase
      .from('notification_preferences')
      .select('id')
      .eq('user_id', user?.id ?? '')
      .limit(1),
    // Onboarding: check if replied to any review
    supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user?.id ?? '')
      .not('reply', 'is', null)
      .limit(1),
  ])

  // Detect which onboarding steps are actually complete
  const serverCompleted = ['account']
  if ((profiles?.length ?? 0) > 0) serverCompleted.push('profile')
  if ((notifPrefs?.length ?? 0) > 0) serverCompleted.push('notifications')
  if ((repliedReview?.length ?? 0) > 0) serverCompleted.push('reply')
  if (userData?.plan_name && userData.plan_name !== 'free' && userData?.subscription_status === 'active') {
    serverCompleted.push('billing')
  }

  const isTrialing = userData?.subscription_status === 'trialing'
  const hasPlan = userData?.plan_name && userData.plan_name !== 'free'
  const trialDaysLeft = userData?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(userData.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0

  const firstName = userData?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const totalReviews = allReviews?.length ?? 0
  const newThisWeek  = weekReviews?.length ?? 0
  const avgRating    = totalReviews > 0
    ? (allReviews!.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1)
    : '—'
  const withReply  = allReviews?.filter(r => r.reply).length ?? 0
  const replyRate  = totalReviews > 0 ? `${Math.round((withReply / totalReviews) * 100)}%` : '0%'

  const stats = [
    { label: 'Total Reviews',   value: String(totalReviews), icon: Star,          iconBg: 'bg-amber-500/10',  iconColor: 'text-amber-500'   },
    { label: 'New This Week',   value: String(newThisWeek),  icon: TrendingUp,    iconBg: 'bg-primary/10',    iconColor: 'text-primary'     },
    { label: 'Avg. Rating',     value: avgRating,            icon: BarChart3,     iconBg: 'bg-emerald-500/10',iconColor: 'text-emerald-500' },
    { label: 'Reply Rate',      value: replyRate,            icon: MessageSquare, iconBg: 'bg-violet-500/10', iconColor: 'text-violet-500'  },
  ]

  return (
    <div className="flex flex-col h-full min-h-0">
      <Header title="Dashboard" />
      <div className="flex-1 overflow-y-auto bg-muted/20 p-5 space-y-4 page-animate">

        {/* Greeting */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold">{greeting}, {firstName} 👋</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Here&apos;s your review activity at a glance.</p>
          </div>
          <Link href="/dashboard/profiles">
            <Button size="sm" className="font-semibold text-xs h-8">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Profile
            </Button>
          </Link>
        </div>

        {/* Trial banner */}
        {isTrialing && !hasPlan && (
          <div className="relative overflow-hidden rounded-2xl bg-primary px-5 py-4 flex items-center justify-between gap-4">
            <div className="absolute right-0 top-0 w-48 h-full opacity-10 pointer-events-none">
              <div className="absolute top-2 right-6 w-20 h-20 rounded-full border-2 border-white" />
              <div className="absolute -bottom-4 right-0 w-36 h-36 rounded-full border-2 border-white" />
            </div>
            <div className="relative flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left in your free trial</p>
                <p className="text-white/65 text-xs mt-0.5">Choose a plan to keep access when it ends.</p>
              </div>
            </div>
            <Link href="/billing" className="relative shrink-0">
              <Button size="sm" className="bg-white text-primary hover:bg-white/90 font-semibold shadow-none h-8 text-xs px-3">
                View plans <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="glass-card rounded-2xl p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${s.iconColor}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight tabular-nums">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Empty state */}
          <div className="lg:col-span-2 bg-card border border-dashed border-border rounded-2xl flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="relative mb-5">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-7 h-7 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </div>
            <h3 className="font-bold text-base mb-1.5">Connect your first Google Business Profile</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-xs">
              Add a profile to start monitoring reviews, getting alerts, and replying with AI — all in real time.
            </p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {['Monitor reviews', 'AI replies', 'Instant alerts'].map((t) => (
                <span key={t} className="flex items-center gap-1 bg-muted rounded-full px-2.5 py-1 text-xs">
                  <Star className="w-3 h-3 text-primary" />{t}
                </span>
              ))}
            </div>
            <Link href="/dashboard/profiles">
              <Button size="sm" className="font-semibold text-xs gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Profile
              </Button>
            </Link>
          </div>

          {/* Quick actions */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Quick actions</p>
            </div>
            <div className="p-2 space-y-0.5">
              {[
                { icon: Bell,         title: 'Notifications',    desc: 'Email & Slack alerts',    href: '/dashboard/notifications', color: 'text-primary',     bg: 'bg-primary/8'      },
                { icon: BarChart3,    title: 'Analytics',        desc: 'Ratings & sentiment',     href: '/dashboard/reports',       color: 'text-emerald-500', bg: 'bg-emerald-500/8'  },
                { icon: MessageSquare,title: 'AI Replies',       desc: 'Reply faster with GPT-4', href: '/dashboard/replies',       color: 'text-violet-500',  bg: 'bg-violet-500/8'   },
                { icon: Star,         title: 'Review Widget',    desc: 'Embed on your website',   href: '/billing',                 color: 'text-amber-500',   bg: 'bg-amber-500/8'    },
              ].map((a) => {
                const Icon = a.icon
                return (
                  <Link key={a.title} href={a.href}>
                    <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-muted transition-colors group cursor-pointer">
                      <div className={`w-8 h-8 rounded-lg ${a.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${a.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-none mb-0.5">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.desc}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0 transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Onboarding checklist */}
        <OnboardingChecklist serverCompleted={serverCompleted} />

      </div>
    </div>
  )
}
