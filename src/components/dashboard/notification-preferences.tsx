'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Mail, Hash, Bell, ChevronDown } from 'lucide-react'
import { useDashboardLang } from './lang-context'

interface NotificationSettings {
  emailEnabled: boolean
  emailOnAllReviews: boolean
  emailMinRating: number | null
  slackEnabled: boolean
  slackWebhookUrl: string
  slackOnAllReviews: boolean
  slackMinRating: number | null
  emailDigestFrequency: 'instant' | 'daily' | 'weekly'
}

interface NotificationPreferencesProps {
  profileId: string
  onSaved?: () => void
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
        checked ? 'bg-primary' : 'bg-muted-foreground/30'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

const RATINGS = [1, 2, 3, 4, 5]

export function NotificationPreferences({ profileId, onSaved }: NotificationPreferencesProps) {
  const { t } = useDashboardLang()
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    emailOnAllReviews: true,
    emailMinRating: null,
    slackEnabled: false,
    slackWebhookUrl: '',
    slackOnAllReviews: true,
    slackMinRating: null,
    emailDigestFrequency: 'instant',
  })
  const [loading, setLoading] = useState(false)
  const [webhookSaving, setWebhookSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/notifications/preferences?profileId=${profileId}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setSettings(prev => ({
            ...prev,
            emailEnabled:          data.email_enabled          ?? data.emailEnabled          ?? prev.emailEnabled,
            emailOnAllReviews:     data.email_on_all_reviews   ?? data.emailOnAllReviews     ?? prev.emailOnAllReviews,
            emailMinRating:        data.email_min_rating       ?? data.emailMinRating        ?? prev.emailMinRating,
            slackEnabled:          data.slack_enabled          ?? data.slackEnabled          ?? prev.slackEnabled,
            slackWebhookUrl:       data.slack_webhook_url      ?? data.slackWebhookUrl       ?? prev.slackWebhookUrl,
            slackOnAllReviews:     data.slack_on_all_reviews   ?? data.slackOnAllReviews     ?? prev.slackOnAllReviews,
            slackMinRating:        data.slack_min_rating       ?? data.slackMinRating        ?? prev.slackMinRating,
            emailDigestFrequency:  data.email_digest_frequency ?? data.emailDigestFrequency  ?? prev.emailDigestFrequency,
          }))
        }
      })
      .catch(() => {})
  }, [profileId])

  const set = <K extends keyof NotificationSettings>(key: K, val: NotificationSettings[K]) =>
    setSettings(prev => ({ ...prev, [key]: val }))

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, ...settings }),
      })
      if (!res.ok) throw new Error()
      toast.success(t.notif_pref_saved)
      onSaved?.()
    } catch {
      toast.error(t.notif_pref_failed)
    } finally {
      setLoading(false)
    }
  }

  const handleSlackWebhookSave = async () => {
    if (!settings.slackWebhookUrl.trim()) {
      toast.error(t.notif_slack_invalid)
      return
    }
    setWebhookSaving(true)
    try {
      const res = await fetch('/api/notifications/slack-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, webhookUrl: settings.slackWebhookUrl }),
      })
      if (!res.ok) throw new Error()
      toast.success(t.notif_slack_ok)
      onSaved?.()
    } catch {
      toast.error(t.notif_slack_failed)
    } finally {
      setWebhookSaving(false)
    }
  }

  return (
    <div className="space-y-4">

      {/* ── Email ── */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-sm font-semibold">{t.notif_email_title}</p>
          </div>
          <Toggle checked={settings.emailEnabled} onChange={v => set('emailEnabled', v)} />
        </div>

        {settings.emailEnabled && (
          <div className="space-y-3 pl-10">
            {/* All reviews toggle */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{t.notif_all_reviews}</p>
              <Toggle checked={settings.emailOnAllReviews} onChange={v => set('emailOnAllReviews', v)} />
            </div>

            {/* Min rating (shown when not all reviews) */}
            {!settings.emailOnAllReviews && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">{t.notif_min_rating}</p>
                <div className="flex gap-1.5">
                  {RATINGS.map(r => (
                    <button
                      key={r}
                      onClick={() => set('emailMinRating', settings.emailMinRating === r ? null : r)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                        settings.emailMinRating === r
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-muted-foreground border-border hover:border-primary/40'
                      }`}
                    >
                      {r}★
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Frequency */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">{t.notif_frequency}</p>
              <div className="relative">
                <select
                  value={settings.emailDigestFrequency}
                  onChange={e => set('emailDigestFrequency', e.target.value as NotificationSettings['emailDigestFrequency'])}
                  className="w-full h-9 text-sm rounded-lg border border-border bg-card px-3 pr-8 focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                >
                  <option value="instant">{t.notif_instant}</option>
                  <option value="daily">{t.notif_daily}</option>
                  <option value="weekly">{t.notif_weekly}</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Slack ── */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#4A154B]/10 flex items-center justify-center">
              <Hash className="w-3.5 h-3.5 text-[#4A154B] dark:text-[#E01E5A]" />
            </div>
            <p className="text-sm font-semibold">{t.notif_slack_title}</p>
          </div>
          <Toggle checked={settings.slackEnabled} onChange={v => set('slackEnabled', v)} />
        </div>

        {settings.slackEnabled && (
          <div className="space-y-3 pl-10">
            {/* Webhook URL */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">{t.notif_slack_url}</p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={settings.slackWebhookUrl}
                  onChange={e => set('slackWebhookUrl', e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="flex-1 h-9 text-sm rounded-lg border border-border bg-background px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button size="sm" onClick={handleSlackWebhookSave} disabled={webhookSaving} className="font-semibold shrink-0">
                  {webhookSaving ? t.notif_saving : t.notif_save_webhook}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{t.notif_slack_hint}</p>
            </div>

            {/* All reviews toggle */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{t.notif_all_reviews}</p>
              <Toggle checked={settings.slackOnAllReviews} onChange={v => set('slackOnAllReviews', v)} />
            </div>

            {/* Min rating */}
            {!settings.slackOnAllReviews && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">{t.notif_min_rating}</p>
                <div className="flex gap-1.5">
                  {RATINGS.map(r => (
                    <button
                      key={r}
                      onClick={() => set('slackMinRating', settings.slackMinRating === r ? null : r)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                        settings.slackMinRating === r
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-muted-foreground border-border hover:border-primary/40'
                      }`}
                    >
                      {r}★
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full font-semibold">
        <Bell className="w-3.5 h-3.5 mr-2" />
        {loading ? t.notif_saving : t.notif_save_all}
      </Button>
    </div>
  )
}
