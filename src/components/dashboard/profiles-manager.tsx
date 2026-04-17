'use client'

import { useState, useEffect } from 'react'
import { MapPin, Plus, Trash2, RefreshCw, CheckCircle, AlertCircle, Link2, Star, Building2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AutoReplySettings } from './auto-reply-settings'

interface Profile {
  id: string
  business_name: string
  address: string | null
  location_name: string | null
  last_synced_at: string | null
  is_active: boolean
}

interface GBPLocation {
  name: string
  title: string
  accountName: string
  storefrontAddress?: { addressLines?: string[]; locality?: string; regionCode?: string }
  phoneNumbers?: { primaryPhone?: string }
  websiteUri?: string
}

interface Props {
  profiles: Profile[]
  isGoogleConnected: boolean
  profileLimit: number
  planName: string
  connected: boolean
  googleError: string | null
}

export function ProfilesManager({ profiles: initial, isGoogleConnected, profileLimit, connected, googleError }: Props) {
  const [profiles, setProfiles]         = useState(initial)
  const [locations, setLocations]       = useState<GBPLocation[]>([])
  const [loadingLocs, setLoadingLocs]   = useState(false)
  const [showPicker, setShowPicker]     = useState(false)
  const [syncing, setSyncing]           = useState<string | null>(null)
  const [deleting, setDeleting]         = useState<string | null>(null)
  const [adding, setAdding]             = useState<string | null>(null)
  const [toast, setToast]               = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [expandedAutoReply, setExpandedAutoReply] = useState<string | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Load GBP locations when picker is opened
  useEffect(() => {
    if (!showPicker || !isGoogleConnected) return
    setLoadingLocs(true)
    fetch('/api/google/locations')
      .then(r => r.json())
      .then(d => setLocations(d.locations ?? []))
      .catch(() => showToast('Failed to load locations from Google', 'error'))
      .finally(() => setLoadingLocs(false))
  }, [showPicker, isGoogleConnected])

  const addProfile = async (loc: GBPLocation) => {
    setAdding(loc.name)
    const address = [
      ...(loc.storefrontAddress?.addressLines ?? []),
      loc.storefrontAddress?.locality,
      loc.storefrontAddress?.regionCode,
    ].filter(Boolean).join(', ')

    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location_name: loc.name,
        account_id:    loc.accountName,
        business_name: loc.title,
        address:       address || null,
        phone:         loc.phoneNumbers?.primaryPhone ?? null,
        website:       loc.websiteUri ?? null,
      }),
    })
    const data = await res.json()
    setAdding(null)

    if (!res.ok) {
      showToast(data.error ?? 'Failed to add profile', 'error')
      return
    }

    setProfiles(p => [...p, data.profile])
    setShowPicker(false)
    showToast(`${loc.title} added!`, 'success')

    // Kick off initial sync
    syncProfile(data.profile.id)
  }

  const syncProfile = async (profileId: string) => {
    setSyncing(profileId)
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId }),
    })
    const data = await res.json()
    setSyncing(null)

    if (!res.ok) {
      showToast(data.error ?? 'Sync failed', 'error')
      return
    }

    // Update last_synced_at in local state
    setProfiles(p => p.map(pr =>
      pr.id === profileId
        ? { ...pr, last_synced_at: new Date().toISOString() }
        : pr
    ))
    showToast(`Synced ${data.synced} review${data.synced !== 1 ? 's' : ''}`, 'success')
  }

  const deleteProfile = async (id: string) => {
    setDeleting(id)
    await fetch(`/api/profiles/${id}`, { method: 'DELETE' })
    setDeleting(null)
    setProfiles(p => p.filter(pr => pr.id !== id))
    showToast('Profile removed', 'success')
  }

  const atLimit = profileLimit !== -1 && profiles.length >= profileLimit && profileLimit !== 0

  // Filter out already-added locations
  const addedLocationNames = new Set(profiles.map(p => p.location_name))
  const availableLocations = locations.filter(l => !addedLocationNames.has(l.name))

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border ${
          toast.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            : 'bg-destructive/10 text-destructive border-destructive/20'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* URL param banners */}
      {connected && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Google Business account connected! You can now add your profiles below.
        </div>
      )}
      {googleError && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {googleError === 'google_denied' ? 'Google authorization was denied.' : 'Failed to connect Google. Please try again.'}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-base">Google Business Profiles</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {profileLimit === -1
              ? `${profiles.length} profile${profiles.length !== 1 ? 's' : ''} connected`
              : profileLimit === 0
              ? 'Subscribe to a plan to add profiles'
              : `${profiles.length} / ${profileLimit} profile${profileLimit !== 1 ? 's' : ''} connected`}
          </p>
        </div>

        {!isGoogleConnected ? (
          <a href="/api/google/connect">
            <Button size="sm" className="font-semibold text-xs h-8 gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              Connect Google Business
            </Button>
          </a>
        ) : !atLimit && profileLimit !== 0 ? (
          <Button size="sm" className="font-semibold text-xs h-8 gap-1.5" onClick={() => setShowPicker(v => !v)}>
            <Plus className="w-3.5 h-3.5" />
            Add Profile
          </Button>
        ) : atLimit ? (
          <a href="/billing">
            <Button size="sm" variant="outline" className="font-semibold text-xs h-8 gap-1.5">
              Upgrade to add more
            </Button>
          </a>
        ) : null}
      </div>

      {/* Connect Google CTA */}
      {!isGoogleConnected && (
        <div className="rounded-2xl border border-dashed border-border bg-card flex flex-col items-center justify-center py-14 px-6 text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Link2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-base mb-1">Connect your Google Business account</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Authorize GoHighReview to access your Google Business Profiles so we can sync reviews automatically.
            </p>
          </div>
          <a href="/api/google/connect">
            <Button className="font-semibold gap-2">
              <Link2 className="w-4 h-4" />
              Connect Google Business
            </Button>
          </a>
        </div>
      )}

      {/* Location picker */}
      {showPicker && isGoogleConnected && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="text-sm font-semibold">Select a location to add</p>
            <button onClick={() => setShowPicker(false)} className="text-xs text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>
          {loadingLocs ? (
            <div className="p-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading locations…
            </div>
          ) : availableLocations.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {locations.length === 0
                ? 'No Google Business locations found on this account.'
                : 'All your locations are already added.'}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {availableLocations.map((loc) => {
                const addr = [
                  ...(loc.storefrontAddress?.addressLines ?? []),
                  loc.storefrontAddress?.locality,
                ].filter(Boolean).join(', ')
                return (
                  <div key={loc.name} className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{loc.title}</p>
                        {addr && <p className="text-xs text-muted-foreground truncate">{addr}</p>}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="text-xs h-7 shrink-0"
                      disabled={adding === loc.name}
                      onClick={() => addProfile(loc)}
                    >
                      {adding === loc.name ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Add'}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Profile cards */}
      {isGoogleConnected && profiles.length > 0 && (
        <div className="space-y-3">
          {profiles.map((profile) => (
            <div key={profile.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{profile.business_name}</p>
                {profile.address && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{profile.address}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">
                  {profile.last_synced_at
                    ? `Last synced ${new Date(profile.last_synced_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                    : 'Never synced'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  title="Sync reviews"
                  disabled={syncing === profile.id}
                  onClick={() => syncProfile(profile.id)}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing === profile.id ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:border-destructive/40"
                  title="Remove profile"
                  disabled={deleting === profile.id}
                  onClick={() => deleteProfile(profile.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Auto-reply toggle */}
              <div className="w-full border-t border-border pt-3 mt-1">
                <button
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
                  onClick={() => setExpandedAutoReply(expandedAutoReply === profile.id ? null : profile.id)}
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedAutoReply === profile.id ? 'rotate-180' : ''}`} />
                  AI Auto-Reply settings
                </button>
                {expandedAutoReply === profile.id && (
                  <div className="mt-3">
                    <AutoReplySettings profileId={profile.id} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state when connected but no profiles */}
      {isGoogleConnected && profiles.length === 0 && !showPicker && (
        <div className="rounded-2xl border border-dashed border-border bg-card flex flex-col items-center justify-center py-14 px-6 text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Star className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-base mb-1">Add your first profile</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Click &quot;Add Profile&quot; to connect a Google Business location and start syncing reviews.
            </p>
          </div>
          {profileLimit !== 0 && (
            <Button className="font-semibold gap-2" onClick={() => setShowPicker(true)}>
              <Plus className="w-4 h-4" /> Add Profile
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
