export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { SidebarProvider } from '@/components/dashboard/sidebar-context'
import { reconcileUserWithStripe } from '@/lib/stripe/sync'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let { data: userData } = await supabase
    .from('users')
    .select('plan_name, subscription_status, trial_ends_at, stripe_customer_id, current_period_end, stripe_price_id, stripe_subscription_id')
    .eq('id', user.id)
    .single()

  // Self-heal stale subscription state by re-fetching from Stripe.
  // Handles the case where a webhook failed to flip trialing → active.
  if (userData) {
    try {
      userData = await reconcileUserWithStripe(user.id, userData)
    } catch (err) {
      console.error('[dashboard] stripe reconcile failed:', err)
    }
  }

  const status = userData?.subscription_status
  const trialExpired =
    status === 'trialing' &&
    userData?.trial_ends_at &&
    new Date(userData.trial_ends_at) < new Date()
  const hasAccess = (status === 'active' || status === 'trialing') && !trialExpired

  if (!hasAccess) {
    redirect('/billing?expired=true')
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-muted/20">
        <Sidebar planName={userData?.plan_name ?? 'free'} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </SidebarProvider>
  )
}
