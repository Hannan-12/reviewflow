'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export function BillingToggle({ onChange }: { onChange?: (annual: boolean) => void }) {
  const [annual, setAnnual] = useState(false)

  const toggle = (val: boolean) => {
    setAnnual(val)
    onChange?.(val)
  }

  return (
    <div className="flex items-center gap-3">
      <span className={cn('text-sm font-medium transition-colors', !annual ? 'text-foreground' : 'text-muted-foreground')}>
        Monthly
      </span>
      <button
        onClick={() => toggle(!annual)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-200',
          annual ? 'bg-primary' : 'bg-muted border border-border'
        )}
      >
        <span className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200',
          annual ? 'translate-x-5' : 'translate-x-0'
        )} />
      </button>
      <span className={cn('text-sm font-medium transition-colors', annual ? 'text-foreground' : 'text-muted-foreground')}>
        Annual
        <span className="ml-1.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full px-2 py-0.5">
          Save 20%
        </span>
      </span>
    </div>
  )
}
