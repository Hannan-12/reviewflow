'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { useDashboardLang } from '@/components/dashboard/lang-context'

export function ManageSubscriptionButton() {
  const { t } = useDashboardLang()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        router.push(data.url)
      } else {
        toast.error(data.error ?? t.bill_err_generic)
        setLoading(false)
      }
    } catch {
      toast.error(t.bill_err_portal)
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={loading}>
      <ExternalLink className="w-4 h-4 mr-2" />
      {loading ? t.bill_loading : t.bill_manage}
    </Button>
  )
}
