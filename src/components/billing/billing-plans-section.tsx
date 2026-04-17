'use client'

import { useState } from 'react'
import { PlanCard } from './plan-card'
import { BillingToggle } from './billing-toggle'

export interface PlanData {
  key: string
  name: string
  price: number
  priceAnnual: number
  priceId: string
  priceIdAnnual: string
  description: string
  features: readonly string[]
}

interface BillingPlansSectionProps {
  plans: PlanData[]
  currentPlanKey: string
  isSubscribed: boolean
}

export function BillingPlansSection({ plans, currentPlanKey, isSubscribed }: BillingPlansSectionProps) {
  const [annual, setAnnual] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-base">{isSubscribed ? 'Change your plan' : 'Choose a plan'}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Cancel anytime. Upgrade or downgrade whenever you need.</p>
        </div>
        <BillingToggle onChange={setAnnual} />
      </div>

      {annual && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-4 font-medium">
          Billed annually — you save 20% vs monthly pricing.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.key}
            name={plan.name}
            price={annual ? plan.priceAnnual : plan.price}
            annual={annual}
            description={plan.description}
            features={plan.features}
            priceId={annual ? plan.priceIdAnnual : plan.priceId}
            isCurrentPlan={currentPlanKey === plan.key && isSubscribed}
            isPopular={plan.key === 'pro'}
            isAgency={plan.key === 'agency'}
          />
        ))}
      </div>
    </div>
  )
}
