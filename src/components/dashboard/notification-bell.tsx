'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Star, ExternalLink, Loader, CheckCheck } from 'lucide-react'
import Link from 'next/link'

interface RawNotification {
  id: string
  notification_type: string
  status: string
  sent_at: string
  review_id: string | null
  profile_id: string | null
  reviews: { reviewer_name: string | null; rating: number; comment: string | null } | null
  profiles: { business_name: string } | null
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex gap-px">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="w-2.5 h-2.5"
          style={{ fill: i < rating ? '#F5C518' : 'transparent', color: i < rating ? '#F5C518' : '#555' }}
        />
      ))}
    </span>
  )
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<RawNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [seen, setSeen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Fetch when opening
  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch('/api/notifications/recent')
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications ?? []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [open])

  const hasUnread = notifications.length > 0 && !seen

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen((v) => !v); setSeen(true) }}
        className="relative w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
      >
        <Bell className="w-4 h-4" />
        {!seen && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary border-2 border-background" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold">Notifications</span>
            {notifications.length > 0 && (
              <button
                onClick={() => setSeen(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <Bell className="w-6 h-6 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">New reviews will appear here</p>
              </div>
            ) : (
              notifications.map((n) => {
                const review = n.reviews
                const profile = n.profiles
                const href = n.review_id && n.profile_id
                  ? `/dashboard/reviews?profileId=${n.profile_id}&reviewId=${n.review_id}`
                  : '/dashboard/reviews'

                return (
                  <Link
                    key={n.id}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                  >
                    {/* Rating badge */}
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{review?.rating ?? '?'}★</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <StarRow rating={review?.rating ?? 0} />
                        <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{timeAgo(n.sent_at)}</span>
                      </div>
                      <p className="text-xs font-medium text-foreground truncate">
                        {review?.reviewer_name ?? 'Anonymous'}
                        {profile?.business_name && (
                          <span className="text-muted-foreground font-normal"> · {profile.business_name}</span>
                        )}
                      </p>
                      {review?.comment && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>

                    <ExternalLink className="w-3 h-3 text-muted-foreground/40 shrink-0 mt-1" />
                  </Link>
                )
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-border">
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="text-xs text-primary hover:underline"
              >
                Notification settings →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
