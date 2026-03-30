'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Star, Bell, BarChart3,
  MessageSquare, CreditCard, Settings,
  LogOut, Moon, Sun, Search,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const commands = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, href: '/dashboard', group: 'Navigate' },
  { id: 'reviews', label: 'Go to Reviews', icon: Star, href: '/dashboard/reviews', group: 'Navigate' },
  { id: 'notifications', label: 'Go to Notifications', icon: Bell, href: '/dashboard/notifications', group: 'Navigate' },
  { id: 'reports', label: 'Go to Reports', icon: BarChart3, href: '/dashboard/reports', group: 'Navigate' },
  { id: 'replies', label: 'Go to Replies', icon: MessageSquare, href: '/dashboard/replies', group: 'Navigate' },
  { id: 'billing', label: 'Go to Billing', icon: CreditCard, href: '/billing', group: 'Navigate' },
  { id: 'settings', label: 'Go to Settings', icon: Settings, href: '/dashboard/settings', group: 'Navigate' },
  { id: 'theme-light', label: 'Switch to Light mode', icon: Sun, href: null, group: 'Theme' },
  { id: 'theme-dark', label: 'Switch to Dark mode', icon: Moon, href: null, group: 'Theme' },
  { id: 'signout', label: 'Sign out', icon: LogOut, href: null, group: 'Account' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const router = useRouter()
  const { setTheme } = useTheme()

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  )

  const runCommand = useCallback(async (cmd: typeof commands[0]) => {
    setOpen(false)
    setQuery('')
    if (cmd.href) { router.push(cmd.href); return }
    if (cmd.id === 'theme-light') { setTheme('light'); return }
    if (cmd.id === 'theme-dark') { setTheme('dark'); return }
    if (cmd.id === 'signout') {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    }
  }, [router, setTheme])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
        setQuery('')
        setSelected(0)
      }
      if (!open) return
      if (e.key === 'Escape') { setOpen(false); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)); return }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); return }
      if (e.key === 'Enter' && filtered[selected]) { runCommand(filtered[selected]); return }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, filtered, selected, runCommand])

  useEffect(() => { setSelected(0) }, [query])

  if (!open) return null

  const groups = [...new Set(filtered.map((c) => c.group))]

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] font-mono bg-muted text-muted-foreground rounded px-1.5 py-0.5 border border-border">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No results for &ldquo;{query}&rdquo;</p>
          ) : (
            groups.map((group) => {
              const items = filtered.filter((c) => c.group === group)
              return (
                <div key={group} className="mb-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1.5">
                    {group}
                  </p>
                  {items.map((cmd) => {
                    const Icon = cmd.icon
                    const idx = filtered.indexOf(cmd)
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => runCommand(cmd)}
                        onMouseEnter={() => setSelected(idx)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors',
                          idx === selected ? 'bg-primary text-white' : 'text-foreground hover:bg-muted'
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {cmd.label}
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span><kbd className="font-mono bg-muted px-1 rounded border border-border">↑↓</kbd> Navigate</span>
          <span><kbd className="font-mono bg-muted px-1 rounded border border-border">↵</kbd> Select</span>
          <span><kbd className="font-mono bg-muted px-1 rounded border border-border">ESC</kbd> Close</span>
          <span className="ml-auto flex items-center gap-1">
            <kbd className="font-mono bg-muted px-1 rounded border border-border">⌘K</kbd> to open
          </span>
        </div>
      </div>
    </div>
  )
}
