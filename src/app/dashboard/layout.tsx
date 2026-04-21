import { DashboardLangProvider } from '@/components/dashboard/lang-context'

export default function DashboardSubLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLangProvider>{children}</DashboardLangProvider>
}
