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
import { useEffect, useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: 'G D' },
  { href: '/dashboard/profiles', label: 'Profiles', icon: MapPin, shortcut: 'G L' },
  { href: '/dashboard/reviews', label: 'Reviews', icon: Star, shortcut: 'G R' },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, shortcut: 'G N' },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3, shortcut: 'G A' },
  { href: '/dashboard/replies', label: 'Replies', icon: MessageSquare, shortcut: 'G P' },
  { href: '/dashboard/widget', label: 'Widget', icon: Code2, shortcut: 'G W' },
  { href: '/dashboard/collect', label: 'Collect Reviews', icon: Link2, shortcut: 'G C' },
]

const accountItems = [
  { href: '/billing', label: 'Billing', icon: CreditCard, shortcut: 'G B' },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, shortcut: 'G S' },
]

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  const planColor = PLAN_COLORS[planName ?? 'free'] ?? PLAN_COLORS.free

  if (!mounted) return (
    <aside className="w-[220px] border-r border-border bg-sidebar shrink-0 h-screen" />
  )

  return (
    <aside
      className={cn(
        'sidebar-gradient flex flex-col border-r border-border h-screen sticky top-0 shrink-0 transition-all duration-300 ease-in-out overflow-hidden',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}
    >
      {/* Logo + collapse button */}
      <div className={cn('h-14 flex items-center border-b border-border shrink-0 transition-all', collapsed ? 'px-3 justify-center' : 'px-4 justify-between')}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm shrink-0">
              <Star className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">Reviewup</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Star className="w-3.5 h-3.5 text-white fill-white" />
            </div>
          </Link>
        )}
        {!collapsed && (
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
        {!collapsed && (
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-2 pb-1.5">
            Main
          </p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}>
              <span className={cn(
                'flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer group relative',
                collapsed ? 'justify-center p-2' : 'px-2.5 py-2',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}>
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && (
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

        <div className={cn('pt-3', !collapsed && 'mt-1')}>
          {!collapsed && (
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-2 pb-1.5">
              Account
            </p>
          )}
          {accountItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}>
                <span className={cn(
                  'flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer group',
                  collapsed ? 'justify-center p-2' : 'px-2.5 py-2',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && (
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
        {/* Plan badge */}
        {!collapsed && planName && planName !== 'free' && (
          <div className={cn('flex items-center gap-2 px-2.5 py-1.5 rounded-lg mb-1', planColor)}>
            <Star className="w-3 h-3 shrink-0" />
            <span className="text-xs font-bold capitalize">{planName} Plan</span>
          </div>
        )}

        {/* Theme + Expand */}
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between px-1')}>
          {!collapsed && <span className="text-xs text-muted-foreground font-medium ml-1.5">Theme</span>}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {collapsed && (
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
          title={collapsed ? 'Sign out' : undefined}
          className={cn(
            'flex items-center gap-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all w-full',
            collapsed ? 'justify-center p-2' : 'px-2.5 py-2'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && 'Sign out'}
        </button>
      </div>
    </aside>
  )
}
