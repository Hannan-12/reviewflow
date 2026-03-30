'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'

export function BillingSuccessBanner() {
  const router = useRouter()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      router.replace('/billing')
    }, 4000)
    return () => clearTimeout(timer)
  }, [router])

  if (!visible) return null

  return (
    <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3.5 text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 className="w-4 h-4 shrink-0" />
      <p className="text-sm font-medium">Subscription activated! Your plan is now live.</p>
    </div>
  )
}
