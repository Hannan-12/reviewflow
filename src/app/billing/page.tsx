export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PLANS } from '@/lib/stripe/config'
import { getStripe } from '@/lib/stripe/client'
import { ManageSubscriptionButton } from '@/components/billing/manage-subscription-button'
import { BillingSuccessBanner } from '@/components/billing/billing-success-banner'
import { Header } from '@/components/dashboard/header'
import { Sidebar } from '@/components/dashboard/sidebar'
import { BillingPlansSection } from '@/components/billing/billing-plans-section'
import { SidebarProvider } from '@/components/dashboard/sidebar-context'
import {
  AlertCircle, CreditCard, Calendar,
  Zap, HelpCircle, ExternalLink, Check, X,
} from 'lucide-react'

export const metadata = { title: 'Billing — Reviewup' }

const faqItems = [
  { q: 'When does billing start?', a: 'After your 14-day free trial ends. No charge during the trial — cancel before it ends and you will never be billed.' },
  { q: 'Can I change plans?', a: 'Yes — upgrade or downgrade any time. Changes are prorated automatically by Stripe.' },
  { q: 'Can I cancel?', a: 'Yes — cancel any time from the billing portal. You keep full access until the end of your current billing period.' },
  { q: 'What payment methods are accepted?', a: 'All major credit and debit cards (Visa, Mastercard, Amex). Powered by Stripe.' },
]

const comparisonFeatures = [
  { label: 'Google Business Profiles', lite: '3', pro: '15', agency: 'Unlimited' },
  { label: 'Review dashboard', lite: true, pro: true, agency: true },
  { label: 'Email alerts', lite: true, pro: true, agency: true },
  { label: 'CSV export', lite: true, pro: true, agency: true },
  { label: 'Basic reports', lite: true, pro: true, agency: true },
  { label: 'Slack notifications', lite: false, pro: true, agency: true },
  { label: 'AI reply suggestions', lite: false, pro: true, agency: true },
  { label: 'Advanced reports', lite: false, pro: true, agency: true },
  { label: 'Review auto-tagging', lite: false, pro: true, agency: true },
  { label: 'Review widget', lite: false, pro: true, agency: true },
  { label: 'AI auto-reply agents', lite: false, pro: false, agency: true },
  { label: 'Magic review links', lite: false, pro: false, agency: true },
  { label: 'Sentiment analysis', lite: false, pro: false, agency: true },
  { label: 'Custom AI prompts', lite: false, pro: false, agency: true },
  { label: 'Priority support', lite: false, pro: false, agency: true },
]

function FeatureValue({ val }: { val: boolean | string }) {
  if (val === true)  return <Check className="w-4 h-4 text-emerald-500 mx-auto" />
  if (val === false) return <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
  return <span className="text-sm font-semibold text-foreground">{val}</span>
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string; expired?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('plan_name, subscription_status, trial_ends_at, current_period_end, stripe_customer_id, stripe_price_id, stripe_subscription_id')
    .eq('id', user.id)
    .single()

  const { success, canceled, expired } = await searchParams

  const isSubscribed = userData?.subscription_status === 'active' || userData?.subscription_status === 'trialing'
  const isTrialing = userData?.subscription_status === 'trialing'
  const hasStripeAccount = !!userData?.stripe_customer_id
  const currentPlanKey = userData?.plan_name ?? 'free'
  const currentPlan = PLANS[currentPlanKey as keyof typeof PLANS]
  const isAnnual = Object.values(PLANS).some(p => p.priceIdAnnual === userData?.stripe_price_id)
  const displayPrice = isAnnual ? currentPlan?.priceAnnual : currentPlan?.price

  const trialDaysLeft = userData?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(userData.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0
  const trialTotal = 14
  const trialProgress = Math.min(100, Math.round(((trialTotal - trialDaysLeft) / trialTotal) * 100))

  const { count: profilesCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
  const profilesConnected = profilesCount ?? 0

  // For Agency, show the Stripe subscription quantity (profiles they're paying for)
  let agencySubscribedQuantity = 0
  if (currentPlanKey === 'agency' && userData?.stripe_subscription_id) {
    try {
      const sub = await getStripe().subscriptions.retrieve(userData.stripe_subscription_id)
      agencySubscribedQuantity = sub.items.data[0]?.quantity ?? 0
    } catch { /* ignore */ }
  }

  const profilesUsed = currentPlanKey === 'agency' ? agencySubscribedQuantity : profilesConnected
  const profileLimit = currentPlan?.profileLimit === -1 ? null : (currentPlan?.profileLimit ?? 3)

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-muted/20">
        <Sidebar planName={currentPlanKey} />
        <main className="flex-1 overflow-y-auto">
          <Header title="Billing" />

          <div className="max-w-5xl mx-auto p-5 space-y-6 page-animate">

            {/* Banners */}
            {expired === 'true' && (
              <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-4 text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Your free trial has ended</p>
                  <p className="text-sm opacity-80 mt-0.5">Choose a plan below to restore access to your dashboard.</p>
                </div>
              </div>
            )}
            {success === 'true' && <BillingSuccessBanner />}
            {canceled === 'true' && (
              <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3.5 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-sm font-medium">Checkout was canceled. No charge was made.</p>
              </div>
            )}

            {/* Current plan hero */}
            {isSubscribed && (
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
                <div className="h-1 w-full bg-linear-to-r from-primary/60 via-primary to-primary/60" />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-lg capitalize">{currentPlanKey} Plan</p>
                          <span className={`text-[10px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5 ${
                            isTrialing
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {isTrialing ? 'Trial' : 'Active'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {isTrialing
                            ? `Free trial — ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} remaining`
                            : userData?.current_period_end
                            ? `Renews ${new Date(userData.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                            : 'Active subscription'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {currentPlan && (
                        <p className="text-2xl font-bold hidden sm:block">
                          €{displayPrice}<span className="text-sm font-normal text-muted-foreground">{currentPlanKey === 'agency' ? '/profile/mo' : '/mo'}</span>
                        </p>
                      )}
                      {hasStripeAccount && <ManageSubscriptionButton />}
                    </div>
                  </div>

                  {/* Trial progress */}
                  {isTrialing && (
                    <div className="mt-5 pt-5 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Trial progress</span>
                        <span className="text-xs font-semibold">{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left of {trialTotal}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${trialProgress}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Trial ends {new Date(userData?.trial_ends_at ?? '').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}. Upgrade to keep access.
                      </p>
                    </div>
                  )}

                  {/* Plan stats */}
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Plan</p>
                        <p className="text-sm font-semibold capitalize">{currentPlanKey}</p>
                      </div>
                    </div>
                    {/* Usage meter */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Profiles connected</p>
                          <p className="text-sm font-semibold">
                            {profilesUsed}{profileLimit !== null ? ` / ${profileLimit}` : currentPlanKey === 'agency' ? ` (€${profilesUsed * 5}/mo)` : ' / ∞'}
                          </p>
                        </div>
                      </div>
                      {profileLimit !== null && profilesUsed > 0 && (
                        <div className="h-1 rounded-full bg-muted overflow-hidden ml-6">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${Math.min(100, (profilesUsed / profileLimit) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Billing</p>
                        <p className="text-sm font-semibold">{isAnnual ? 'Annual' : 'Monthly'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Plan selection */}
            <BillingPlansSection
              plans={Object.entries(PLANS).map(([key, plan]) => ({
                key,
                name: plan.name,
                price: plan.price,
                priceAnnual: plan.priceAnnual,
                priceId: plan.priceId,
                priceIdAnnual: plan.priceIdAnnual,
                description: plan.description,
                features: plan.features,
              }))}
              currentPlanKey={currentPlanKey}
              isSubscribed={isSubscribed}
            />

            {/* Feature comparison table */}
            <div>
              <h3 className="font-bold text-base mb-4">Compare plans</h3>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-4 border-b border-border">
                  <div className="p-4 text-sm font-semibold text-muted-foreground">Feature</div>
                  {['Lite', 'Pro', 'Agency'].map((p) => (
                    <div key={p} className={`p-4 text-center text-sm font-bold ${p === 'Pro' ? 'bg-primary/5 text-primary' : ''}`}>
                      {p}
                      {p === 'Pro' && <span className="ml-1 text-[9px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-bold">Popular</span>}
                    </div>
                  ))}
                </div>
                {comparisonFeatures.map((row, i) => (
                  <div
                    key={row.label}
                    className={`grid grid-cols-4 border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/30'}`}
                  >
                    <div className="p-3.5 text-sm text-muted-foreground">{row.label}</div>
                    <div className="p-3.5 text-center"><FeatureValue val={row.lite} /></div>
                    <div className="p-3.5 text-center bg-primary/3"><FeatureValue val={row.pro} /></div>
                    <div className="p-3.5 text-center"><FeatureValue val={row.agency} /></div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-bold text-base">Billing FAQ</h3>
              </div>
              <div className="grid gap-2">
                {faqItems.map((item) => (
                  <div key={item.q} className="bg-card border border-border rounded-xl px-5 py-4 hover:border-border/60 transition-colors">
                    <p className="font-semibold text-sm mb-1">{item.q}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-4">
                <ExternalLink className="w-3 h-3" />
                Payments are securely processed by Stripe. We never store your card details.
              </p>
            </div>

          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
