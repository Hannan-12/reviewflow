'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Copy, Trash2, Plus, Link2, QrCode, MousePointerClick } from 'lucide-react'

interface Profile {
  id: string
  business_name: string
}

interface CollectionLink {
  id: string
  slug: string
  title: string
  message: string | null
  google_review_url: string | null
  is_active: boolean
  click_count: number
  created_at: string
  profiles: { business_name: string } | null
}

interface CollectionLinksManagerProps {
  profiles: Profile[]
  appUrl: string
}

export function CollectionLinksManager({ profiles, appUrl }: CollectionLinksManagerProps) {
  const [links, setLinks] = useState<CollectionLink[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [qrLink, setQrLink] = useState<string | null>(null)

  const [form, setForm] = useState({
    profileId:        profiles[0]?.id ?? '',
    title:            'Leave us a review!',
    message:          'Your feedback means the world to us. It only takes 30 seconds!',
    googleReviewUrl:  '',
  })

  const fetchLinks = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/collection-links')
    if (res.ok) setLinks(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchLinks() }, [fetchLinks])

  const handleCreate = async () => {
    if (!form.profileId) { toast.error('Select a profile'); return }
    setCreating(true)
    const res = await fetch('/api/collection-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success('Collection link created!')
      setShowForm(false)
      fetchLinks()
    } else {
      toast.error('Failed to create link')
    }
    setCreating(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this link?')) return
    const res = await fetch(`/api/collection-links?id=${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Link deleted'); fetchLinks() }
    else toast.error('Failed to delete')
  }

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${appUrl}/collect/${slug}`)
    toast.success('Link copied!')
  }

  const qrUrl = (slug: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`${appUrl}/collect/${slug}`)}&size=300x300&margin=10`

  if (profiles.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <p className="text-muted-foreground text-sm">No profiles yet. Add a Google Business Profile first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Share these links with customers to collect more Google reviews.
        </p>
        <Button size="sm" onClick={() => setShowForm(v => !v)} className="gap-1.5 font-semibold">
          <Plus className="w-3.5 h-3.5" />
          New link
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-sm">Create collection link</h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Profile</label>
            <select
              value={form.profileId}
              onChange={e => setForm(f => ({ ...f, profileId: e.target.value }))}
              className="w-full h-9 text-sm rounded-lg border border-border bg-card px-2 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {profiles.map(p => <option key={p.id} value={p.id}>{p.business_name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Page title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full h-9 text-sm rounded-lg border border-border bg-card px-3 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Message to customer</label>
            <textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              rows={2}
              className="w-full text-sm rounded-lg border border-border bg-card px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Google review URL <span className="text-muted-foreground/60">(paste from GBP dashboard)</span>
            </label>
            <input
              type="url"
              value={form.googleReviewUrl}
              onChange={e => setForm(f => ({ ...f, googleReviewUrl: e.target.value }))}
              placeholder="https://search.google.com/local/writereview?placeid=..."
              className="w-full h-9 text-sm rounded-lg border border-border bg-card px-3 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={creating} className="font-semibold">
              {creating ? 'Creating...' : 'Create link'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Links list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : links.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <Link2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No collection links yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div key={link.id} className="glass-card rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm truncate">{link.title}</p>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                      {(link.profiles as { business_name: string } | null)?.business_name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {appUrl}/collect/{link.slug}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <MousePointerClick className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{link.click_count} clicks</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => copyLink(link.slug)} className="h-8 w-8 p-0">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQrLink(qrLink === link.slug ? null : link.slug)}
                    className="h-8 w-8 p-0"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(link.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* QR code */}
              {qrLink === link.slug && (
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-4">
                  <img
                    src={qrUrl(link.slug)}
                    alt="QR Code"
                    width={100}
                    height={100}
                    className="rounded-lg border border-border"
                  />
                  <div className="space-y-1">
                    <p className="text-xs font-medium">QR Code</p>
                    <p className="text-xs text-muted-foreground">Print and place at your location for customers to scan and leave a review.</p>
                    <a
                      href={qrUrl(link.slug)}
                      download={`qr-${link.slug}.png`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="h-7 text-xs mt-1">
                        Download QR
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
