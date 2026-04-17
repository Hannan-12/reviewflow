export const dynamic = 'force-dynamic'
import { Header } from '@/components/dashboard/header'
import { createClient } from '@/lib/supabase/server'
import { NotificationsClient } from './notifications-client'

export const metadata = { title: 'Notifications — Reviewup' }

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, business_name')
    .eq('user_id', user?.id ?? '')
    .order('created_at', { ascending: true })

  return (
    <div className="flex flex-col h-full min-h-0">
      <Header
        title="Notifications"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }]}
      />
      <div className="flex-1 overflow-y-auto bg-muted/20 p-5 page-animate">
        <NotificationsClient profiles={profiles ?? []} />
      </div>
    </div>
  )
}
