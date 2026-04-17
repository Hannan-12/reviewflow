export const dynamic = 'force-dynamic'
import { Header } from '@/components/dashboard/header'
import { createClient } from '@/lib/supabase/server'
import { CollectionLinksManager } from '@/components/dashboard/collection-links-manager'

export const metadata = { title: 'Collect Reviews — Reviewup' }

export default async function CollectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, business_name')
    .eq('user_id', user?.id ?? '')
    .order('created_at', { ascending: true })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return (
    <div className="flex flex-col h-full min-h-0">
      <Header
        title="Collect Reviews"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }]}
      />
      <div className="flex-1 overflow-y-auto bg-muted/20 p-5 page-animate">
        <div className="max-w-2xl">
          <CollectionLinksManager profiles={profiles ?? []} appUrl={appUrl} />
        </div>
      </div>
    </div>
  )
}
