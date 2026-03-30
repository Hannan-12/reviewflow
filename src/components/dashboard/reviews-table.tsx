'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Star, MessageSquare, RefreshCw, Filter, Reply, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Review {
  id: string
  rating: number
  comment: string | null
  reviewer_name: string | null
  reviewer_photo_url: string | null
  review_date: string
  reply: string | null
  replied_at: string | null
  business_name: string
  profile_id: string
}

interface Profile {
  id: string
  business_name: string
}

interface Props {
  reviews: Review[]
  profiles: Profile[]
  currentRating: string | null
  currentProfile: string | null
  onReviewClick?: (review: Review) => void
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20'}`} />
      ))}
    </div>
  )
}

export function ReviewsTable({ reviews, profiles, currentRating, currentProfile, onReviewClick }: Props) {
  const router  = useRouter()
  const pathname = usePathname()
  const [syncing, setSyncing] = useState(false)
  const [exporting, setExporting] = useState(false)

  const exportCsv = async () => {
    setExporting(true)
    const params = new URLSearchParams()
    if (currentProfile) params.set('profileId', currentProfile)
    const res = await fetch(`/api/reviews/export?${params.toString()}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reviews-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams()
    if (key !== 'rating'  && currentRating)  params.set('rating',  currentRating)
    if (key !== 'profile' && currentProfile) params.set('profile', currentProfile)
    if (value) params.set(key, value)
    router.replace(`${pathname}?${params.toString()}`)
  }

  const syncAll = async () => {
    setSyncing(true)
    await fetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
    setSyncing(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />

        {/* Rating filter */}
        <div className="flex gap-1">
          {[null, '5', '4', '3', '2', '1'].map((r) => (
            <button
              key={r ?? 'all'}
              onClick={() => setFilter('rating', r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                currentRating === r
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              {r ? `${r}★` : 'All'}
            </button>
          ))}
        </div>

        {/* Profile filter */}
        {profiles.length > 1 && (
          <select
            value={currentProfile ?? ''}
            onChange={e => setFilter('profile', e.target.value || null)}
            className="text-xs bg-muted border-0 rounded-lg px-2.5 py-1 text-muted-foreground focus:ring-0 focus:outline-none"
          >
            <option value="">All profiles</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.business_name}</option>
            ))}
          </select>
        )}

        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" disabled={exporting} onClick={exportCsv}>
            <Download className="w-3 h-3" />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" disabled={syncing} onClick={syncAll}>
            <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync all'}
          </Button>
        </div>
      </div>

      {/* Review list */}
      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card flex flex-col items-center justify-center py-12 text-center gap-2">
          <MessageSquare className="w-8 h-8 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">No reviews found</p>
          <p className="text-xs text-muted-foreground">Try syncing or adjusting your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card border border-border rounded-2xl p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  {review.reviewer_photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={review.reviewer_photo_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {(review.reviewer_name ?? 'A')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">{review.reviewer_name ?? 'Anonymous'}</p>
                    <p className="text-[10px] text-muted-foreground">{review.business_name}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Stars rating={review.rating} />
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(review.review_date).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {review.comment && (
                <p className="text-sm text-foreground/80 leading-relaxed">{review.comment}</p>
              )}

              {review.reply && (
                <div className="ml-4 pl-3 border-l-2 border-primary/20">
                  <p className="text-[10px] font-semibold text-primary mb-0.5">Owner reply</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{review.reply}</p>
                </div>
              )}

              {/* Reply Button */}
              <div className="pt-2 border-t border-border">
                <Button
                  onClick={() => onReviewClick?.(review)}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-1.5"
                >
                  <Reply className="w-3.5 h-3.5" />
                  {review.reply ? 'View Reply' : 'Reply to Review'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
