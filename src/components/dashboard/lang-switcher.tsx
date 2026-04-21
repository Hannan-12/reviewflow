'use client'

import { useState } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { useDashboardLang } from './lang-context'
import type { DashboardLang } from '@/lib/i18n/dashboard'

const languages: { code: DashboardLang; label: string; rtl?: boolean }[] = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
  { code: 'ar', label: 'العربية', rtl: true },
  { code: 'zh', label: '中文' },
  { code: 'hi', label: 'हिन्दी' },
]

export function DashboardLangSwitcher() {
  const { lang, setLang } = useDashboardLang()
  const [open, setOpen] = useState(false)
  const current = languages.find(l => l.code === lang) ?? languages[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground border border-border hover:border-border/80 transition-colors"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{current.label}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 rounded-xl border border-border bg-popover shadow-lg overflow-hidden min-w-36">
          {languages.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false) }}
              className="w-full px-3 py-2 text-xs text-left hover:bg-muted transition-colors"
              style={{ color: lang === l.code ? 'hsl(var(--primary))' : undefined, direction: l.rtl ? 'rtl' : 'ltr' }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
