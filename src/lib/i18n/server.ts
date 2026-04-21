import { cookies } from 'next/headers'
import { dashboardT, type DashboardLang, type DashboardT } from './dashboard'

export async function getServerT(): Promise<DashboardT> {
  const cookieStore = await cookies()
  const lang = cookieStore.get('app_lang')?.value as DashboardLang | undefined
  if (lang && lang in dashboardT) return dashboardT[lang] as DashboardT
  return dashboardT.en as DashboardT
}
