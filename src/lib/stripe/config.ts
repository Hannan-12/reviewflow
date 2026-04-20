export type PlanKey = 'lite' | 'pro' | 'agency'

export interface PlanConfig {
  name: string
  priceId: string
  priceIdAnnual: string
  price: number        // monthly EUR
  priceAnnual: number  // monthly EUR when billed annually
  profileLimit: number // -1 = unlimited
  description: string
  features: string[]
}

function buildPlans(): Record<PlanKey, PlanConfig> {
  return {
    lite: {
      name: 'Lite',
      priceId: process.env.STRIPE_PRICE_LITE_MONTHLY ?? '',
      priceIdAnnual: process.env.STRIPE_PRICE_LITE_YEARLY ?? '',
      price: 19.9,
      priceAnnual: 15.83, // EUR 190/year ÷ 12
      profileLimit: 3,
      description: 'For solo businesses',
      features: [
        '1–3 Google Business Profiles',
        'Email alerts',
        'AI reply suggestions',
        'AI auto-reply agents',
        'Basic reports',
        'CSV export',
      ],
    },
    pro: {
      name: 'Pro',
      priceId: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
      priceIdAnnual: process.env.STRIPE_PRICE_PRO_YEARLY ?? '',
      price: 59,
      priceAnnual: 47.17, // EUR 566/year ÷ 12
      profileLimit: 10,
      description: 'For teams & small chains',
      features: [
        'Everything in Lite',
        '4–10 Google Business Profiles',
        'Email + Slack alerts',
        'Advanced reports',
        'Review widgets',
        'Review auto-tagging',
      ],
    },
    agency: {
      name: 'Agency',
      priceId: process.env.STRIPE_PRICE_AGENCY_MONTHLY ?? '',
      priceIdAnnual: process.env.STRIPE_PRICE_AGENCY_YEARLY ?? '',
      price: 0,
      priceAnnual: 0,
      profileLimit: -1,
      description: 'For agencies & franchises',
      features: [
        'Everything in Pro',
        'Unlimited profiles',
        'Custom AI prompts',
        'Sentiment analysis',
        'Magic review links',
        'Priority support',
        'Dedicated account manager',
      ],
    },
  }
}

export function getPlans(): Record<PlanKey, PlanConfig> {
  return buildPlans()
}

export const PLANS = new Proxy({} as Record<PlanKey, PlanConfig>, {
  get(_, prop: string) {
    return buildPlans()[prop as PlanKey]
  },
  ownKeys() {
    return ['lite', 'pro', 'agency']
  },
  getOwnPropertyDescriptor(_, prop) {
    if (['lite', 'pro', 'agency'].includes(prop as string)) {
      return { configurable: true, enumerable: true, value: buildPlans()[prop as PlanKey] }
    }
  },
})

export function getPlanByPriceId(priceId: string): PlanKey | null {
  const plans = buildPlans()
  const entry = Object.entries(plans).find(
    ([, plan]) => plan.priceId === priceId || plan.priceIdAnnual === priceId
  )
  return entry ? (entry[0] as PlanKey) : null
}

export function getPlanProfileLimit(planKey: PlanKey | string): number {
  const plans = buildPlans()
  if (planKey in plans) return plans[planKey as PlanKey].profileLimit
  return 0
}
