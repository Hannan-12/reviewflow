'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Star, Bell, BarChart3,
  Settings, CreditCard, LogOut, MessageSquare,
  ChevronLeft, ChevronRight, MapPin, Code2, Link2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { useSidebar } from './sidebar-context'
import { useDashboardLang } from './lang-context'
import { useEffect, useState } from 'react'

const PLAN_COLORS: Record<string, string> = {
  lite: 'bg-primary/10 text-primary',
  pro: 'bg-primary/15 text-primary',
  agency: 'bg-primary/20 text-primary',
  free: 'bg-muted text-muted-foreground',
}

export function Sidebar({ planName }: { planName?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const { collapsed, toggle } = useSidebar()
  const { t } = useDashboardLang()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const navItems = [
    { href: '/dashboard', label: t.nav_dashboard, icon: LayoutDashboard, shortcut: 'G D' },
    { href: '/dashboard/profiles', label: t.nav_profiles, icon: MapPin, shortcut: 'G L' },
    { href: '/dashboard/reviews', label: t.nav_reviews, icon: Star, shortcut: 'G R' },
    { href: '/dashboard/notifications', label: t.nav_notifications, icon: Bell, shortcut: 'G N' },
    { href: '/dashboard/reports', label: t.nav_reports, icon: BarChart3, shortcut: 'G A' },
    { href: '/dashboard/replies', label: t.nav_replies, icon: MessageSquare, shortcut: 'G P' },
    { href: '/dashboard/widget', label: t.nav_widget, icon: Code2, shortcut: 'G W' },
    { href: '/dashboard/collect', label: t.nav_collect, icon: Link2, shortcut: 'G C' },
  ]

  const accountItems = [
    { href: '/billing', label: t.nav_billing, icon: CreditCard, shortcut: 'G B' },
    { href: '/dashboard/settings', label: t.nav_settings, icon: Settings, shortcut: 'G S' },
  ]

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  const planColor = PLAN_COLORS[planName ?? 'free'] ?? PLAN_COLORS.free

  const { mobileOpen, closeMobile } = useSidebar()

  if (!mounted) return (
    <aside className="hidden lg:block w-55 border-r border-border bg-sidebar shrink-0 h-screen" />
  )

  const navContent = (isMobile: boolean) => (
    <>
      {/* Logo + collapse button */}
      <div className={cn('h-14 flex items-center border-b border-border shrink-0 transition-all', isMobile ? 'px-4 justify-between' : collapsed ? 'px-3 justify-center' : 'px-4 justify-between')}>
        <Link href="/dashboard" className="flex items-center gap-2" onClick={isMobile ? closeMobile : undefined}>
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm shrink-0">
            <Star className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          {(!collapsed || isMobile) && <span className="font-bold text-sm tracking-tight">GoHighReview</span>}
        </Link>
        {(!collapsed || isMobile) && !isMobile && (
          <button
            onClick={toggle}
            className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {(!collapsed || isMobile) && (
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-2 pb-1.5">
            {t.nav_main}
          </p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} title={(collapsed && !isMobile) ? item.label : undefined} onClick={isMobile ? closeMobile : undefined}>
              <span className={cn(
                'flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer group relative',
                (collapsed && !isMobile) ? 'justify-center p-2' : 'px-2.5 py-2',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}>
                <Icon className="w-4 h-4 shrink-0" />
                {(!collapsed || isMobile) && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    <span className="text-[9px] text-muted-foreground/50 font-mono hidden group-hover:block">
                      {item.shortcut}
                    </span>
                  </>
                )}
              </span>
            </Link>
          )
        })}

        <div className={cn('pt-3', (!collapsed || isMobile) && 'mt-1')}>
          {(!collapsed || isMobile) && (
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-2 pb-1.5">
              {t.nav_account}
            </p>
          )}
          {accountItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link key={item.href} href={item.href} title={(collapsed && !isMobile) ? item.label : undefined} onClick={isMobile ? closeMobile : undefined}>
                <span className={cn(
                  'flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer group',
                  (collapsed && !isMobile) ? 'justify-center p-2' : 'px-2.5 py-2',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {(!collapsed || isMobile) && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      <span className="text-[9px] text-muted-foreground/50 font-mono hidden group-hover:block">
                        {item.shortcut}
                      </span>
                    </>
                  )}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-2 py-2 border-t border-border space-y-0.5 shrink-0">
        {(!collapsed || isMobile) && planName && planName !== 'free' && (
          <div className={cn('flex items-center gap-2 px-2.5 py-1.5 rounded-lg mb-1', planColor)}>
            <Star className="w-3 h-3 shrink-0" />
            <span className="text-xs font-bold capitalize">{planName} {t.plan_badge}</span>
          </div>
        )}
        <div className={cn('flex items-center', (collapsed && !isMobile) ? 'justify-center' : 'justify-between px-1')}>
          {(!collapsed || isMobile) && <span className="text-xs text-muted-foreground font-medium ml-1.5">{t.nav_theme}</span>}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {(collapsed && !isMobile) && (
              <button
                onClick={toggle}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          title={(collapsed && !isMobile) ? 'Sign out' : undefined}
          className={cn(
            'flex items-center gap-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all w-full',
            (collapsed && !isMobile) ? 'justify-center p-2' : 'px-2.5 py-2'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!collapsed || isMobile) && t.nav_signout}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile overlay + drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 sidebar-gradient flex flex-col border-r border-border z-50 lg:hidden overflow-hidden">
            {navContent(true)}
          </div>
        </>
      )}

      {/* Desktop sidebar — hidden on mobile */}
      <aside
        className={cn(
          'sidebar-gradient hidden lg:flex flex-col border-r border-border h-screen sticky top-0 shrink-0 transition-all duration-300 ease-in-out overflow-hidden',
          collapsed ? 'w-15' : 'w-55'
        )}
      >
        {navContent(false)}
      </aside>
    </>
  )
}
