'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Copy, ExternalLink, Code2 } from 'lucide-react'

interface Profile {
  id: string
  business_name: string
}

interface WidgetConfig {
  theme: 'light' | 'dark'
  max_reviews: number
  min_rating: number
  show_dates: boolean
  accent_color: string
}

interface WidgetConfiguratorProps {
  profiles: Profile[]
  appUrl: string
}

export function WidgetConfigurator({ profiles, appUrl }: WidgetConfiguratorProps) {
  const [selectedProfile, setSelectedProfile] = useState<string>(profiles[0]?.id ?? '')
  const [config, setConfig] = useState<WidgetConfig>({
    theme: 'light', max_reviews: 6, min_rating: 4, show_dates: true, accent_color: '#6366f1',
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedProfile) return
    setLoading(true)
    fetch(`/api/widget/config?profileId=${selectedProfile}`)
      .then(r => r.json())
      .then(d => {
        if (d && Object.keys(d).length > 0) {
          setConfig({
            theme:        d.theme        ?? 'light',
            max_reviews:  d.max_reviews  ?? 6,
            min_rating:   d.min_rating   ?? 4,
            show_dates:   d.show_dates   ?? true,
            accent_color: d.accent_color ?? '#6366f1',
          })
        }
      })
      .finally(() => setLoading(false))
  }, [selectedProfile])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/widget/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId:   selectedProfile,
        theme:       config.theme,
        maxReviews:  config.max_reviews,
        minRating:   config.min_rating,
        showDates:   config.show_dates,
        accentColor: config.accent_color,
      }),
    })
    if (res.ok) toast.success('Widget settings saved')
    else toast.error('Failed to save settings')
    setSaving(false)
  }

  const widgetUrl  = `${appUrl}/widget/${selectedProfile}`
  const embedCode  = `<iframe src="${widgetUrl}" width="100%" height="500" frameborder="0" style="border-radius:12px;"></iframe>`
  const previewUrl = `${widgetUrl}`

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode)
    toast.success('Embed code copied!')
  }

  if (profiles.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <p className="text-muted-foreground text-sm">No profiles yet. Add a Google Business Profile first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Profile selector */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold text-sm">Widget Settings</h2>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Profile</label>
          <select
            value={selectedProfile}
            onChange={e => setSelectedProfile(e.target.value)}
            className="w-full h-9 text-sm rounded-lg border border-border bg-card px-2 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.business_name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="h-32 rounded-xl bg-muted animate-pulse" />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Theme */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Theme</label>
              <select
                value={config.theme}
                onChange={e => setConfig(c => ({ ...c, theme: e.target.value as 'light' | 'dark' }))}
                className="w-full h-9 text-sm rounded-lg border border-border bg-card px-2 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            {/* Max reviews */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Max reviews shown</label>
              <select
                value={config.max_reviews}
                onChange={e => setConfig(c => ({ ...c, max_reviews: Number(e.target.value) }))}
                className="w-full h-9 text-sm rounded-lg border border-border bg-card px-2 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {[3, 4, 5, 6, 8, 10, 12].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Min rating */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Minimum rating to show</label>
              <select
                value={config.min_rating}
                onChange={e => setConfig(c => ({ ...c, min_rating: Number(e.target.value) }))}
                className="w-full h-9 text-sm rounded-lg border border-border bg-card px-2 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n}★ and above</option>
                ))}
              </select>
            </div>

            {/* Accent color */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Accent color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.accent_color}
                  onChange={e => setConfig(c => ({ ...c, accent_color: e.target.value }))}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-card p-0.5"
                />
                <span className="text-sm font-mono text-muted-foreground">{config.accent_color}</span>
              </div>
            </div>

            {/* Show dates */}
            <div className="space-y-1 col-span-2">
              <div className="flex items-center gap-3">
                <button
                  role="switch"
                  aria-checked={config.show_dates}
                  onClick={() => setConfig(c => ({ ...c, show_dates: !c.show_dates }))}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${config.show_dates ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${config.show_dates ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
                <span className="text-sm">Show review dates</span>
              </div>
            </div>
          </div>
        )}

        <Button size="sm" onClick={handleSave} disabled={saving} className="font-semibold">
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Embed code */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">Embed on your website</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Copy and paste this code anywhere on your website to display your reviews.
        </p>
        <div className="bg-muted rounded-xl p-3 font-mono text-xs text-muted-foreground break-all">
          {embedCode}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={copyEmbed} className="gap-1.5">
            <Copy className="w-3.5 h-3.5" />
            Copy embed code
          </Button>
          <a href={previewUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              Preview widget
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
