'use client'

import dynamic from 'next/dynamic'

const BillingPlansSection = dynamic(
  () => import('@/components/billing/billing-plans-section').then((m) => m.BillingPlansSection),
  { ssr: false }
)

export { BillingPlansSection }
