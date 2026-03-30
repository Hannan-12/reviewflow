'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

export function ManageSubscriptionButton() {
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
        toast.error(data.error ?? 'Something went wrong')
        setLoading(false)
      }
    } catch {
      toast.error('Failed to open billing portal')
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={loading}>
      <ExternalLink className="w-4 h-4 mr-2" />
      {loading ? 'Loading…' : 'Manage subscription'}
    </Button>
  )
}
