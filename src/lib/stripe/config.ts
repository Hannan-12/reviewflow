export type PlanKey = 'lite' | 'pro' | 'premium'

export interface PlanConfig {
  name: string
  priceId: string
  priceIdAnnual: string
  price: number
  priceAnnual: number
  profileLimit: number
  description: string
  features: string[]
}

function buildPlans(): Record<PlanKey, PlanConfig> {
  return {
    lite: {
      name: 'Lite',
      priceId: process.env.STRIPE_PRICE_LITE_MONTHLY ?? '',
      priceIdAnnual: process.env.STRIPE_PRICE_LITE_YEARLY ?? '',
      price: 20,
      priceAnnual: 16,
      profileLimit: 3,
      description: 'Perfect for small businesses',
      features: [
        '3 Google Business Profiles',
        'Review notifications (email)',
        'Review dashboard with filters',
        'CSV export',
        'Basic reports',
      ],
    },
    pro: {
      name: 'Pro',
      priceId: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
      priceIdAnnual: process.env.STRIPE_PRICE_PRO_YEARLY ?? '',
      price: 35,
      priceAnnual: 28,
      profileLimit: 10,
      description: 'For growing businesses',
      features: [
        '10 Google Business Profiles',
        'Everything in Lite',
        'Slack notifications',
        'AI reply suggestions',
        'Advanced reports + scheduling',
        'Review auto-tagging',
      ],
    },
    premium: {
      name: 'Premium',
      priceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? '',
      priceIdAnnual: process.env.STRIPE_PRICE_PREMIUM_YEARLY ?? '',
      price: 40,
      priceAnnual: 32,
      profileLimit: -1,
      description: 'For agencies & enterprises',
      features: [
        'Unlimited Google Business Profiles',
        'Everything in Pro',
        'AI auto-reply agents',
        'Embeddable review widgets',
        'Magic review collection links',
        'Sentiment analysis',
        'White-label ready',
      ],
    },
  }
}

// Lazy getter — reads env vars at runtime, not build time
export function getPlans(): Record<PlanKey, PlanConfig> {
  return buildPlans()
}

// Backward-compatible export for components that import PLANS
export const PLANS = new Proxy({} as Record<PlanKey, PlanConfig>, {
  get(_, prop: string) {
    return buildPlans()[prop as PlanKey]
  },
  ownKeys() {
    return ['lite', 'pro', 'premium']
  },
  getOwnPropertyDescriptor(_, prop) {
    if (['lite', 'pro', 'premium'].includes(prop as string)) {
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
  if (planKey in plans) {
    return plans[planKey as PlanKey].profileLimit
  }
  return 0
}
