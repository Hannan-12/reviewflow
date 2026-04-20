'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const OPTIONS = [
  { label: '1–3 profiles', sub: 'Lite — EUR 19,90/mo', value: 'lite' },
  { label: '4–10 profiles', sub: 'Pro — EUR 59/mo', value: 'pro' },
  { label: '11+ profiles', sub: 'Agency — contact us', value: 'agency' },
]

export default function OnboardingPage() {
  const router = useRouter()

  const handleSelect = async (value: string) => {
    if (value === 'agency') {
      router.push('/agency')
      return
    }
    const supabase = createClient()
    await supabase.auth.updateUser({ data: { intended_plan: value } })
    router.push(`/billing?checkout=${value}`)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">GoHighReview</span>
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">How many Google profiles do you manage?</h1>
        <p className="text-sm text-muted-foreground text-center mb-7">We'll recommend the right plan for you.</p>
        <div className="space-y-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary transition-colors text-left"
            >
              <div>
                <p className="font-semibold text-sm">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.sub}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
