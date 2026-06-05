'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Star, Zap, Lock } from 'lucide-react'
import { useDashboardLang } from './lang-context'

interface AutoReplySettingsProps {
  profileId: string
  planName: string
}

const ALL_RATINGS = [1, 2, 3, 4, 5]

export function AutoReplySettings({ profileId, planName }: AutoReplySettingsProps) {
  const { t } = useDashboardLang()
  const canUseAutoReply = planName === 'pro' || planName === 'agency'
  const [enabled, setEnabled] = useState(false)
  const [selectedRatings, setSelectedRatings] = useState<number[]>([])
  const [customInstructions, setCustomInstructions] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/auto-reply?profileId=${profileId}`)
      .then(r => r.json())
      .then(d => {
        setEnabled(d.enabled ?? false)
        if (d.reply_to_ratings?.length) {
          setSelectedRatings(d.reply_to_ratings)
        } else if (d.min_rating != null || d.max_rating != null) {
          // Migrate legacy min/max to explicit list
          const min = d.min_rating ?? 1
          const max = d.max_rating ?? 5
          setSelectedRatings(ALL_RATINGS.filter(r => r >= min && r <= max))
        } else {
          setSelectedRatings([])
        }
        setCustomInstructions(d.custom_instructions ?? '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [profileId])

  const toggleRating = (r: number) => {
    setSelectedRatings(prev =>
      prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r].sort()
    )
  }

  const allSelected = selectedRatings.length === 0

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/auto-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId,
        enabled,
        replyToRatings: selectedRatings.length ? selectedRatings : null,
        customInstructions,
      }),
    })
    if (res.ok) toast.success(t.ar_saved)
    else toast.error(t.ar_save_failed)
    setSaving(false)
  }

  if (!canUseAutoReply) return (
    <div className="flex flex-col items-center gap-3 py-5 px-4 rounded-xl bg-muted/50 border border-border text-center">
      <Lock className="w-5 h-5 text-muted-foreground" />
      <div>
        <p className="text-sm font-semibold">{t.auto_reply_pro_title}</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">{t.auto_reply_pro_desc}</p>
      </div>
      <a href="/billing">
        <Button size="sm" className="font-bold gap-1.5" style={{ backgroundColor: '#F5C518', color: '#000' }}>
          {t.auto_reply_upgrade}
        </Button>
      </a>
    </div>
  )

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
          <p className="text-sm font-medium">{t.ar_enable_label}</p>
          <p className="text-xs text-muted-foreground">{t.ar_enable_desc}</p>
        </div>
      </div>

      {enabled && (
        <div className="space-y-4 pl-12">
          {/* Star rating checkboxes */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{t.ar_ratings_label}</p>
            <div className="flex flex-wrap gap-2">
              {/* All button */}
              <button
                onClick={() => setSelectedRatings([])}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  allSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:border-primary/40'
                }`}
              >
                {t.ar_all}
              </button>
              {ALL_RATINGS.map(r => {
                const active = selectedRatings.includes(r)
                return (
                  <button
                    key={r}
                    onClick={() => toggleRating(r)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      active
                        ? 'bg-amber-400/20 text-amber-700 dark:text-amber-400 border-amber-400/60'
                        : 'bg-muted text-muted-foreground border-border hover:border-amber-400/40'
                    }`}
                  >
                    {r}
                    <Star className={`w-3 h-3 ${active ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                )
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {allSelected ? t.ar_replying_all : t.ar_replying_selected.replace('{ratings}', selectedRatings.join('★, '))}
            </p>
          </div>

          {/* Custom AI prompt */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              {t.ar_instructions_label}
            </label>
            <textarea
              value={customInstructions}
              onChange={e => setCustomInstructions(e.target.value)}
              placeholder={t.ar_instructions_placeholder}
              rows={3}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <p className="text-[10px] text-muted-foreground mt-1">{t.ar_instructions_hint}</p>
          </div>

          <div className="flex items-start gap-2 bg-amber-500/8 border border-amber-500/20 rounded-lg px-3 py-2">
            <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              {t.ar_info}
            </p>
          </div>
        </div>
      )}

      <Button size="sm" onClick={handleSave} disabled={saving} className="font-semibold">
        {t.ar_save}
      </Button>
    </div>
  )
}
