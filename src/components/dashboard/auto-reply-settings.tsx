'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Zap } from 'lucide-react'

interface AutoReplySettingsProps {
  profileId: string
}

export function AutoReplySettings({ profileId }: AutoReplySettingsProps) {
  const [enabled, setEnabled] = useState(false)
  const [minRating, setMinRating] = useState<string>('')
  const [maxRating, setMaxRating] = useState<string>('')
  const [customInstructions, setCustomInstructions] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/auto-reply?profileId=${profileId}`)
      .then(r => r.json())
      .then(d => {
        setEnabled(d.enabled ?? false)
        setMinRating(d.min_rating != null ? String(d.min_rating) : '')
        setMaxRating(d.max_rating != null ? String(d.max_rating) : '')
        setCustomInstructions(d.custom_instructions ?? '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [profileId])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/auto-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId,
        enabled,
        minRating: minRating ? parseInt(minRating) : null,
        maxRating: maxRating ? parseInt(maxRating) : null,
        customInstructions,
      }),
    })
    if (res.ok) toast.success('Auto-reply settings saved')
    else toast.error('Failed to save settings')
    setSaving(false)
  }

  if (loading) return (
    <div className="h-16 rounded-xl bg-muted animate-pulse" />
  )

  return (
    <div className="space-y-4">
      {/* Enable toggle */}
      <div className="flex items-center gap-3">
        <button
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled(v => !v)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            enabled ? 'bg-primary' : 'bg-muted-foreground/30'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              enabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
        <div>
          <p className="text-sm font-medium">Enable AI Auto-Reply</p>
          <p className="text-xs text-muted-foreground">
            Automatically post AI-generated replies to new Google reviews
          </p>
        </div>
      </div>

      {enabled && (
        <div className="space-y-3 pl-12">
          {/* Rating filter */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Min rating (optional)
              </label>
              <select
                value={minRating}
                onChange={e => setMinRating(e.target.value)}
                className="w-full h-8 text-sm rounded-lg border border-border bg-card px-2 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Any</option>
                {[1,2,3,4,5].map(r => <option key={r} value={r}>{r}★</option>)}
              </select>
              <p className="text-[10px] text-muted-foreground mt-0.5">Only auto-reply if rating ≥ this</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Max rating (optional)
              </label>
              <select
                value={maxRating}
                onChange={e => setMaxRating(e.target.value)}
                className="w-full h-8 text-sm rounded-lg border border-border bg-card px-2 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Any</option>
                {[1,2,3,4,5].map(r => <option key={r} value={r}>{r}★</option>)}
              </select>
              <p className="text-[10px] text-muted-foreground mt-0.5">Only auto-reply if rating ≤ this</p>
            </div>
          </div>

          {/* Custom instructions */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Custom instructions (optional)
            </label>
            <textarea
              value={customInstructions}
              onChange={e => setCustomInstructions(e.target.value)}
              placeholder="e.g. Always mention our loyalty programme. Keep tone friendly and informal."
              rows={3}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex items-start gap-2 bg-amber-500/8 border border-amber-500/20 rounded-lg px-3 py-2">
            <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Auto-replies are posted during the hourly sync. You can edit or delete any auto-posted reply from the Reviews page.
            </p>
          </div>
        </div>
      )}

      <Button size="sm" onClick={handleSave} disabled={saving} className="font-semibold">
        Save auto-reply settings
      </Button>
    </div>
  )
}
