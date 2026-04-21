export const dynamic = 'force-dynamic'
import { Header } from '@/components/dashboard/header'
import { createClient } from '@/lib/supabase/server'
import { WidgetConfigurator } from '@/components/dashboard/widget-configurator'
import { getServerT } from '@/lib/i18n/server'

export const metadata = { title: 'Review Widget — GoHighReview' }

export default async function WidgetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const t = await getServerT()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, business_name')
    .eq('user_id', user?.id ?? '')
    .order('created_at', { ascending: true })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return (
    <div className="flex flex-col h-full min-h-0">
      <Header
        title={t.nav_widget}
        breadcrumbs={[{ label: t.nav_dashboard, href: '/dashboard' }]}
      />
      <div className="flex-1 overflow-y-auto bg-muted/20 p-5 page-animate">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm text-muted-foreground mb-4">
            {t.widget_desc}
          </p>
          <WidgetConfigurator profiles={profiles ?? []} appUrl={appUrl} />
        </div>
      </div>
    </div>
  )
}
