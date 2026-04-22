export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { SidebarProvider } from '@/components/dashboard/sidebar-context'
import { DashboardLangProvider } from '@/components/dashboard/lang-context'
import { dashboardT, type DashboardLang } from '@/lib/i18n/dashboard'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const cookieStore = await cookies()
  const cookieLang = cookieStore.get('app_lang')?.value as DashboardLang | undefined
  const initialLang: DashboardLang = (cookieLang && cookieLang in dashboardT) ? cookieLang : 'de'

  const { data: userData } = await supabase
    .from('users')
    .select('plan_name, subscription_status, trial_ends_at, stripe_customer_id')
    .eq('id', user.id)
    .single()

  const status = userData?.subscription_status
  const hasStripeCustomer = !!userData?.stripe_customer_id

  const trialExpired =
    status === 'trialing' &&
    userData?.trial_ends_at &&
    new Date(userData.trial_ends_at) < new Date()

  // Allow access if:
  // - Active subscription
  // - Still in trial
  // - Trial expired but has a Stripe customer (webhook lag — they likely paid;
  //   the webhook will correct the status asynchronously)
  const hasAccess =
    status === 'active' ||
    (status === 'trialing' && !trialExpired) ||
    (trialExpired && hasStripeCustomer)

  if (!hasAccess) {
    redirect('/billing?expired=true')
  }

  return (
    <DashboardLangProvider initialLang={initialLang}>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden bg-muted/20">
          <Sidebar planName={userData?.plan_name ?? 'free'} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </SidebarProvider>
    </DashboardLangProvider>
  )
}
