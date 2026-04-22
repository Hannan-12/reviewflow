'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { dashboardT, type DashboardLang, type DashboardT } from '@/lib/i18n/dashboard'

interface LangContextValue {
  lang: DashboardLang
  t: DashboardT
  setLang: (l: DashboardLang) => void
}

const LangContext = createContext<LangContextValue>({
  lang: 'de',
  t: dashboardT.de as DashboardT,
  setLang: () => {},
})

interface ProviderProps {
  children: React.ReactNode
  initialLang?: DashboardLang
}

export function DashboardLangProvider({ children, initialLang = 'de' }: ProviderProps) {
  const [lang, setLangState] = useState<DashboardLang>(initialLang)
  const router = useRouter()

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (l: DashboardLang) => {
    setLangState(l)
    localStorage.setItem('app_lang', l)
    document.cookie = `app_lang=${l}; path=/; max-age=31536000; SameSite=Lax`
    router.refresh()
  }

  return (
    <LangContext.Provider value={{ lang, t: dashboardT[lang] as DashboardT, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export const useDashboardLang = () => useContext(LangContext)
