'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useDashboardLang } from '@/components/dashboard/lang-context'

const STORAGE_KEY = 'rf-onboarding-done'

interface Props {
  /** Steps auto-detected as complete by the server */
  serverCompleted: string[]
}

export function OnboardingChecklist({ serverCompleted }: Props) {
  const { t } = useDashboardLang()
  const [checked, setChecked] = useState<string[]>(serverCompleted)
  const [collapsed, setCollapsed] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.dismissed) { setDismissed(true); return }
        if (parsed.collapsed) setCollapsed(parsed.collapsed)
      }
    } catch {}
    // Always merge server-detected completions (they take priority)
    setChecked((prev) => Array.from(new Set([...prev, ...serverCompleted])))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = (next: { collapsed?: boolean; dismissed?: boolean }) => {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...next }))
    } catch {}
  }

  const dismiss = () => {
    setDismissed(true)
    save({ dismissed: true })
  }

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    save({ collapsed: next })
  }

  const STEPS = [
    { id: 'account',       label: t.onboard_step_account,  href: null },
    { id: 'profile',       label: t.onboard_step_profile,  href: '/dashboard/profiles' },
    { id: 'notifications', label: t.onboard_step_alerts,   href: '/dashboard/notifications' },
    { id: 'reply',         label: t.onboard_step_reply,    href: '/dashboard/reviews' },
    { id: 'billing',       label: t.onboard_step_plan,     href: '/billing' },
  ]

  if (dismissed) return null

  const completedCount = checked.length
  const totalCount = STEPS.length
  const progress = Math.round((completedCount / totalCount) * 100)
  const allDone = completedCount === totalCount

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={toggleCollapse}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold">
              {allDone ? t.onboard_all_done : t.onboard_title}
            </p>
            <p className="text-xs text-muted-foreground">
              {t.onboard_steps_done.replace('{n}', String(completedCount)).replace('{total}', String(totalCount))}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress ring */}
          <div className="relative w-8 h-8 shrink-0">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
              <circle
                cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 12}`}
                strokeDashoffset={`${2 * Math.PI * 12 * (1 - progress / 100)}`}
                className="text-primary transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-primary">
              {progress}%
            </span>
          </div>
          {collapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Steps */}
      {!collapsed && (
        <div className="px-5 pb-4 space-y-1 border-t border-border pt-3">
          {STEPS.map((step, i) => {
            const isDone = checked.includes(step.id)
            const isAutoDetected = serverCompleted.includes(step.id)

            const content = (
              <div
                key={step.id}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
                  isDone ? 'opacity-60' : 'hover:bg-muted cursor-pointer',
                )}
              >
                <div className="shrink-0">
                  {isDone
                    ? <CheckCircle2 className="w-4.5 h-4.5 text-primary" />
                    : <Circle className="w-4.5 h-4.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  }
                </div>
                <span className={cn('text-sm flex-1', isDone && 'line-through text-muted-foreground')}>
                  {step.label}
                </span>
                {isAutoDetected && isDone && (
                  <span className="text-[9px] font-semibold text-primary/60 uppercase tracking-widest bg-primary/8 rounded-full px-2 py-0.5">
                    {t.onboard_done_badge}
                  </span>
                )}
                {!isAutoDetected && (
                  <span className="text-[10px] text-muted-foreground/50 font-mono">{i + 1}/{totalCount}</span>
                )}
              </div>
            )

            return step.href && !isDone
              ? <Link key={step.id} href={step.href}>{content}</Link>
              : <div key={step.id}>{content}</div>
          })}

          <div className="flex justify-end pt-1">
            <button
              onClick={dismiss}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.onboard_dismiss}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
