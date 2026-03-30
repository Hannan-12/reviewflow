import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/dashboard/header'
import { Sidebar } from '@/components/dashboard/sidebar'
import { SidebarProvider } from '@/components/dashboard/sidebar-context'
import { SettingsClient } from '@/components/dashboard/settings-client'

export const metadata = { title: 'Settings — ReviewFlow' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('full_name, plan_name, subscription_status')
    .eq('id', user.id)
    .single()

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-muted/20">
        <Sidebar planName={userData?.plan_name ?? 'free'} />
        <main className="flex-1 overflow-y-auto">
          <Header title="Settings" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }]} />
          <div className="p-5 page-animate">
            <SettingsClient
              email={user.email ?? ''}
              fullName={userData?.full_name ?? null}
              planName={userData?.plan_name ?? null}
              subscriptionStatus={userData?.subscription_status ?? null}
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
