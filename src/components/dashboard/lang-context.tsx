'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { dashboardT, type DashboardLang, type DashboardT } from '@/lib/i18n/dashboard'

interface LangContextValue {
  lang: DashboardLang
  t: DashboardT
  setLang: (l: DashboardLang) => void
}

const LangContext = createContext<LangContextValue>({
  lang: 'en',
  t: dashboardT.en,
  setLang: () => {},
})

export function DashboardLangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<DashboardLang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('app_lang') as DashboardLang | null
    if (saved && saved in dashboardT) {
      setLangState(saved)
      document.cookie = `app_lang=${saved}; path=/; max-age=31536000; SameSite=Lax`
    }
  }, [])

  const setLang = (l: DashboardLang) => {
    setLangState(l)
    localStorage.setItem('app_lang', l)
    document.cookie = `app_lang=${l}; path=/; max-age=31536000; SameSite=Lax`
  }

  return (
    <LangContext.Provider value={{ lang, t: dashboardT[lang] as DashboardT, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export const useDashboardLang = () => useContext(LangContext)
