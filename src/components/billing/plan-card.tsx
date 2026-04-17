'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function AgencyCalculator({ isPopular }: { isPopular?: boolean }) {
  const [raw, setRaw] = useState('20')
  const parsed = parseInt(raw) || 0
  const hasError = raw !== '' && parsed < 16
  const profiles = Math.max(16, parsed)
  const price = profiles * 5
  return (
    <div className="mt-1 mb-4 p-3 rounded-xl border border-border bg-muted/40">
      <p className={cn('text-[10px] font-bold uppercase tracking-widest mb-0.5', isPopular ? 'text-white/60' : 'text-muted-foreground')}>
        Number of profiles
      </p>
      <p className={cn('text-[10px] mb-2', isPopular ? 'text-white/40' : 'text-muted-foreground/60')}>
        Minimum 16 profiles for an Agency account
      </p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={(e) => setRaw(e.target.value.replace(/[^0-9]/g, ''))}
          onBlur={() => setRaw(String(Math.max(16, parseInt(raw) || 16)))}
          className={cn(
            'w-20 px-2 py-1.5 rounded-lg text-sm font-bold text-center border outline-none focus:ring-1 focus:ring-primary transition-colors',
            isPopular ? 'bg-white/15 text-white' : 'bg-background text-foreground',
            hasError ? 'border-red-500' : isPopular ? 'border-white/30' : 'border-border'
          )}
        />
        <span className={cn('font-bold text-sm', isPopular ? 'text-white' : 'text-foreground')}>
          = €{price}/mo
        </span>
      </div>
      {hasError
        ? <p className="text-[10px] text-red-500 mt-1.5">Minimum 16 profiles required</p>
        : <p className={cn('text-[10px] mt-1.5', isPopular ? 'text-white/40' : 'text-muted-foreground/60')}>
            20 profiles = €100/mo · 50 profiles = €250/mo
          </p>
      }
    </div>
  )
}

interface PlanCardProps {
  name: string
  price: number
  annual?: boolean
  description: string
  features: readonly string[]
  priceId: string
  isCurrentPlan: boolean
  isPopular?: boolean
  isAgency?: boolean
}

export function PlanCard({ name, price, annual, description, features, priceId, isCurrentPlan, isPopular, isAgency }: PlanCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSelect = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) {
        router.push(data.url)
      } else {
        toast.error(data.error ?? 'Something went wrong')
        setLoading(false)
      }
    } catch {
      toast.error('Failed to start checkout')
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border p-6 transition-all',
        isPopular
          ? 'border-primary bg-primary text-white shadow-xl shadow-primary/25 scale-[1.02]'
          : 'border-border bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/5',
        isCurrentPlan && !isPopular && 'border-primary/50 ring-1 ring-primary/20'
      )}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white text-primary text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1 shadow-sm">
          <Sparkles className="w-2.5 h-2.5" />
          Most popular
        </div>
      )}

      {/* Current plan badge */}
      {isCurrentPlan && (
        <div className={cn(
          'absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1',
          isPopular ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
        )}>
          Current plan
        </div>
      )}

      {/* Plan name & price */}
      <div className="mb-5">
        <p className={cn('font-bold text-base mb-3', isPopular ? 'text-white' : '')}>{name}</p>
        <div className="flex items-end gap-1 mb-1.5">
          <span className={cn('text-4xl font-bold tracking-tight', isPopular ? 'text-white' : '')}>
            €{price}
          </span>
          <span className={cn('text-sm mb-1.5', isPopular ? 'text-white/60' : 'text-muted-foreground')}>
            {isAgency ? '/profile/mo' : annual ? '/mo*' : '/mo'}
          </span>
        </div>
        <p className={cn('text-sm', isPopular ? 'text-white/65' : 'text-muted-foreground')}>{description}</p>
        {annual && !isAgency && (
          <p className={cn('text-xs mt-1', isPopular ? 'text-white/50' : 'text-muted-foreground/70')}>
            * billed as €{price * 12}/yr
          </p>
        )}
      </div>

      {/* Divider */}
      <div className={cn('h-px mb-5', isPopular ? 'bg-white/15' : 'bg-border')} />

      {/* Agency calculator */}
      {isAgency && <AgencyCalculator isPopular={isPopular} />}

      {/* Features */}
      <ul className="space-y-2.5 flex-1 mb-6">
        {features.map((f) => (
          <li key={f} className={cn('flex items-start gap-2.5 text-sm', isPopular ? 'text-white/85' : '')}>
            <Check className={cn('w-4 h-4 shrink-0 mt-0.5', isPopular ? 'text-white' : 'text-primary')} />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        className={cn(
          'w-full font-semibold h-10',
          isPopular ? 'bg-white text-primary hover:bg-white/90 shadow-none' : ''
        )}
        variant={isCurrentPlan ? 'outline' : isPopular ? 'secondary' : 'default'}
        disabled={isCurrentPlan || loading}
        onClick={handleSelect}
      >
        {isCurrentPlan ? 'Current plan' : loading ? 'Redirecting…' : `Get ${name}`}
      </Button>
    </div>
  )
}
