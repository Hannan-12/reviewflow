'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useDashboardLang } from '@/components/dashboard/lang-context'

interface QuickCheckoutPlan {
  key: string
  name: string
  price: number
  priceAnnual: number
  priceId: string
  priceIdAnnual: string
}

interface QuickCheckoutSectionProps {
  plans: QuickCheckoutPlan[]
  annual: boolean
}

function AppleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.459 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zm3.378-3.066c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z" />
    </svg>
  )
}

function GooglePayLogo() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 120 48" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M60.3 24.8c0 3.4-2.6 5.9-5.9 5.9s-5.9-2.5-5.9-5.9 2.6-5.9 5.9-5.9 5.9 2.6 5.9 5.9zm-2.6 0c0-2.1-1.5-3.6-3.3-3.6s-3.3 1.5-3.3 3.6 1.5 3.6 3.3 3.6 3.3-1.5 3.3-3.6z" fill="#EA4335"/>
      <path d="M73.6 24.8c0 3.4-2.6 5.9-5.9 5.9s-5.9-2.5-5.9-5.9 2.6-5.9 5.9-5.9 5.9 2.6 5.9 5.9zm-2.6 0c0-2.1-1.5-3.6-3.3-3.6s-3.3 1.5-3.3 3.6 1.5 3.6 3.3 3.6 3.3-1.5 3.3-3.6z" fill="#FBBC05"/>
      <path d="M86.4 19.3v10.9c0 4.5-2.6 6.3-5.7 6.3-2.9 0-4.7-2-5.4-3.6l2.3-.9c.4 1 1.4 2.2 3.1 2.2 2 0 3.3-1.2 3.3-3.6v-.9h-.1c-.6.7-1.7 1.4-3.2 1.4-3 0-5.8-2.6-5.8-6s2.8-6 5.8-6c1.4 0 2.6.6 3.2 1.4h.1v-1h2.4zm-2.3 5.5c0-2-.1-3.6-3.2-3.6s-3.3 1.6-3.3 3.6 1.3 3.5 3.3 3.5c1.9 0 3.2-1.5 3.2-3.5z" fill="#4285F4"/>
      <path d="M91 11.4v19.1h-2.6V11.4H91z" fill="#34A853"/>
      <path d="M101.9 26.9l2 1.3c-.6 1-2.2 2.6-4.9 2.6-3.3 0-5.8-2.6-5.8-5.9 0-3.5 2.5-5.9 5.5-5.9 3.1 0 4.6 2.5 5.1 3.8l.3.7-7.8 3.2c.6 1.2 1.5 1.8 2.8 1.8 1.3 0 2.2-.6 2.8-1.6zm-6.1-2.1l5.2-2.2c-.3-.7-1.1-1.2-2-1.2-1.3.1-3.1 1.1-3.2 3.4z" fill="#EA4335"/>
      <path d="M14.6 22.5v-2.4h8.1c.1.4.1.8.1 1.3 0 1.6-.4 3.5-1.8 5-1.3 1.4-3 2.2-5.3 2.2-4.2 0-7.7-3.4-7.7-7.6s3.5-7.6 7.7-7.6c2.3 0 3.9.9 5.1 2l-1.4 1.4c-.9-.8-2.1-1.5-3.7-1.5-3 0-5.4 2.5-5.4 5.6s2.4 5.6 5.4 5.6c1.9 0 3-.8 3.7-1.5.6-.6 1-1.4 1.1-2.5h-5.9z" fill="#4285F4"/>
    </svg>
  )
}

export function QuickCheckoutSection({ plans, annual }: QuickCheckoutSectionProps) {
  const { t } = useDashboardLang()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('pro')

  const checkoutPlans = plans.filter(p => p.key !== 'agency')

  const startCheckout = async (method: 'apple' | 'google') => {
    const plan = checkoutPlans.find(p => p.key === selectedPlan)
    if (!plan) return
    const priceId = annual ? plan.priceIdAnnual : plan.priceId
    if (!priceId) {
      toast.error(t.bill_err_plan)
      return
    }

    setLoading(method)
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
        toast.error(data.error ?? t.bill_err_generic)
        setLoading(null)
      }
    } catch {
      toast.error(t.bill_err_checkout)
      setLoading(null)
    }
  }

  const selected = checkoutPlans.find(p => p.key === selectedPlan)
  const displayPrice = selected
    ? (annual ? selected.priceAnnual : selected.price)
    : null

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden mb-5">
      <div className="px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-center mb-4">
          {t.bill_quick_checkout}
        </p>

        {/* Payment method buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Apple Pay */}
          <button
            onClick={() => startCheckout('apple')}
            disabled={!!loading}
            className="relative flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
            style={{ background: '#000', color: '#fff' }}
          >
            {loading === 'apple' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <AppleIcon />
                <span>{t.bill_pay}</span>
              </>
            )}
          </button>

          {/* Google Pay */}
          <button
            onClick={() => startCheckout('google')}
            disabled={!!loading}
            className="relative flex items-center justify-center h-12 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-100 disabled:opacity-60 cursor-pointer"
            style={{ background: '#fff', border: '1px solid #dadce0' }}
          >
            {loading === 'google' ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
            ) : (
              <GooglePayLogo />
            )}
          </button>
        </div>
      </div>

      {/* Plan + billing selector */}
      <div className="border-t border-border bg-muted/30 px-5 py-3 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
          {checkoutPlans.map(p => {
            const price = annual ? p.priceAnnual : p.price
            return (
              <button
                key={p.key}
                onClick={() => setSelectedPlan(p.key)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  selectedPlan === p.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {p.name} — €{price % 1 === 0 ? price : price.toFixed(2).replace('.', ',')}/mo
              </button>
            )
          })}
        </div>
        <p className="text-[10px] text-muted-foreground sm:ml-auto shrink-0">
          {t.bill_apple_google_note}
        </p>
      </div>
    </div>
  )
}
