import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { NotificationBell } from './notification-bell'

interface HeaderProps {
  title: string
  breadcrumbs?: { label: string; href?: string }[]
}

export async function Header({ title, breadcrumbs }: HeaderProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: userData } = await supabase
    .from('users')
    .select('plan_name, subscription_status, trial_ends_at')
    .eq('id', user?.id ?? '')
    .single()

  const isTrialing = userData?.subscription_status === 'trialing'
  const trialDaysLeft = userData?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(userData.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0

  const initials = (user?.email ?? 'RF').slice(0, 2).toUpperCase()
  const isUrgent = isTrialing && trialDaysLeft <= 3

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm px-5 flex items-center justify-between shrink-0 sticky top-0 z-10">
      {/* Left: breadcrumbs */}
      <div className="flex items-center gap-1.5 text-sm min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5 min-w-0">
                {crumb.href ? (
                  <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors truncate">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-muted-foreground truncate">{crumb.label}</span>
                )}
                {i < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                )}
              </span>
            ))}
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
            <span className="font-semibold text-foreground truncate">{title}</span>
          </>
        ) : (
          <span className="font-semibold text-foreground">{title}</span>
        )}
      </div>

      {/* Right: trial badge + bell + avatar */}
      <div className="flex items-center gap-2 shrink-0">
        {isTrialing && trialDaysLeft > 0 && (
          <Link href="/billing">
            <span className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 cursor-pointer transition-colors ${
              isUrgent
                ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/15'
                : 'bg-primary/8 text-primary border border-primary/20 hover:bg-primary/12'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isUrgent ? 'bg-red-500' : 'bg-primary'}`} />
              {trialDaysLeft}d left in trial
            </span>
          </Link>
        )}

        <NotificationBell />

        {/* Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-border ml-1">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-sm">
            <span className="text-[10px] font-bold text-white">{initials}</span>
          </div>
          <span className="text-xs text-muted-foreground hidden md:block max-w-35 truncate">
            {user?.email}
          </span>
        </div>
      </div>
    </header>
  )
}
