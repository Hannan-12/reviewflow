export const dynamic = 'force-dynamic'
import { cookies } from 'next/headers'
import { DashboardLangProvider } from '@/components/dashboard/lang-context'
import { dashboardT, type DashboardLang } from '@/lib/i18n/dashboard'

export default async function DashboardSubLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const cookieLang = cookieStore.get('app_lang')?.value as DashboardLang | undefined
  const initialLang: DashboardLang = (cookieLang && cookieLang in dashboardT) ? cookieLang : 'de'

  return <DashboardLangProvider initialLang={initialLang}>{children}</DashboardLangProvider>
}
