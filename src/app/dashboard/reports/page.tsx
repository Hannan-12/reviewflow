import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/dashboard/header'
import { Sidebar } from '@/components/dashboard/sidebar'
import { SidebarProvider } from '@/components/dashboard/sidebar-context'
import { ReportsClient } from '@/components/dashboard/reports-client'

export const metadata = { title: 'Reports — Reviewup' }

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: userData }, { data: profiles }] = await Promise.all([
    supabase.from('users').select('plan_name').eq('id', user.id).single(),
    supabase
      .from('profiles')
      .select('id, business_name')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true }),
  ])

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-muted/20">
        <Sidebar planName={userData?.plan_name ?? 'free'} />
        <main className="flex-1 overflow-y-auto">
          <Header title="Reports" />
          <div className="max-w-5xl mx-auto p-5 space-y-5 page-animate">
            <ReportsClient profiles={profiles ?? []} />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
