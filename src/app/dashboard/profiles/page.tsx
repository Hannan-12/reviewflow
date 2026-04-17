import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/dashboard/header'
import { Sidebar } from '@/components/dashboard/sidebar'
import { SidebarProvider } from '@/components/dashboard/sidebar-context'
import { ProfilesManager } from '@/components/dashboard/profiles-manager'

export const metadata = { title: 'Profiles — Reviewup' }

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: userData }, { data: profiles }] = await Promise.all([
    supabase
      .from('users')
      .select('plan_name, profile_limit, subscription_status, google_access_token, google_refresh_token')
      .eq('id', user.id)
      .single(),
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
  ])

  const { connected, error } = await searchParams
  const isGoogleConnected = !!(userData?.google_refresh_token)
  // Give trialing users Lite-tier limit (3 profiles) so they can test during trial.
  // Active subscribers with a missing/zero profile_limit (e.g. webhook lag) default
  // to the Lite minimum (3) so they are never silently blocked.
  const isTrialing = userData?.subscription_status === 'trialing'
  const isActive = userData?.subscription_status === 'active'
  const rawLimit = userData?.profile_limit ?? 0
  const limit = rawLimit === 0 && (isTrialing || isActive) ? 3 : rawLimit

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-muted/20">
        <Sidebar planName={userData?.plan_name ?? 'free'} />
        <main className="flex-1 overflow-y-auto">
          <Header title="Profiles" />
          <div className="max-w-4xl mx-auto p-5 space-y-5 page-animate">
            <ProfilesManager
              profiles={profiles ?? []}
              isGoogleConnected={isGoogleConnected}
              profileLimit={limit}
              planName={userData?.plan_name ?? 'free'}
              connected={connected === 'true'}
              googleError={error ?? null}
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
