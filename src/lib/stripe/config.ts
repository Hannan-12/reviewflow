export const PLANS = {
  lite: {
    name: 'Lite',
    priceId: process.env.STRIPE_PRICE_LITE_MONTHLY!,
    priceIdAnnual: process.env.STRIPE_PRICE_LITE_YEARLY!,
    price: 20,
    priceAnnual: 16, // $192/yr billed annually
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
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    priceIdAnnual: process.env.STRIPE_PRICE_PRO_YEARLY!,
    price: 35,
    priceAnnual: 28, // $336/yr billed annually
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
    priceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY!,
    priceIdAnnual: process.env.STRIPE_PRICE_PREMIUM_YEARLY!,
    price: 40,
    priceAnnual: 32, // $384/yr billed annually
    profileLimit: -1, // -1 = unlimited
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
} as const

export type PlanKey = keyof typeof PLANS

export function getPlanByPriceId(priceId: string): PlanKey | null {
  const entry = Object.entries(PLANS).find(
    ([, plan]) => plan.priceId === priceId || plan.priceIdAnnual === priceId
  )
  return entry ? (entry[0] as PlanKey) : null
}

export function getPlanProfileLimit(planKey: PlanKey | string): number {
  if (planKey in PLANS) {
    return PLANS[planKey as PlanKey].profileLimit
  }
  return 0
}
