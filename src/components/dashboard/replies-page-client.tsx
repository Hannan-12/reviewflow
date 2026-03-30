'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, CheckCircle2, Clock, ChevronDown, Sparkles } from 'lucide-react'
import { ReviewDetailModal } from '@/components/dashboard/review-detail-modal'

interface Reply {
  id: string
  rating: number
  comment: string | null
  reviewer_name: string | null
  reviewer_photo_url: string | null
  review_date: string
  reply: string | null
  replied_at: string | null
  reply_synced_to_gbp: boolean
  user_accepted_ai: boolean
  business_name: string
  profile_id: string
}

interface Profile {
  id: string
  business_name: string
}

interface RepliesPageClientProps {
  replies: Reply[]
  profiles: Profile[]
  currentProfile: string | null
  currentStatus: string | null
}

export function RepliesPageClient({
  replies,
  profiles,
  currentProfile,
  currentStatus,
}: RepliesPageClientProps) {
  const router = useRouter()
  const [selectedReview, setSelectedReview] = useState<Reply | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleReviewClick = (reply: Reply) => {
    setSelectedReview(reply)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedReview(null)
    router.refresh()
  }

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search)
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/dashboard/replies?${params.toString()}`)
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Profile filter */}
        <div className="relative">
          <select
            value={currentProfile ?? ''}
            onChange={(e) => updateParam('profile', e.target.value || null)}
            className="h-8 text-sm rounded-lg border border-border bg-card px-3 pr-8 focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
          >
            <option value="">All profiles</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.business_name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {[
            { label: 'All', value: null },
            { label: 'AI-Assisted', value: 'ai' },
            { label: 'Manual', value: 'manual' },
            { label: 'Synced', value: 'synced' },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => updateParam('status', opt.value)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                currentStatus === opt.value
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Replies list */}
      {replies.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center text-sm text-muted-foreground">
          No replies match the current filters.
        </div>
      ) : (
        <div className="space-y-3">
          {replies.map((reply) => (
            <div
              key={reply.id}
              onClick={() => handleReviewClick(reply)}
              className="bg-card border border-border rounded-2xl p-4 cursor-pointer hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0 overflow-hidden">
                  {reply.reviewer_photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={reply.reviewer_photo_url} alt={reply.reviewer_name ?? ''} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(reply.reviewer_name ?? 'A')[0].toUpperCase()}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Top row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{reply.reviewer_name ?? 'Anonymous'}</span>
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {reply.business_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {reply.user_accepted_ai && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3" /> AI
                        </span>
                      )}
                      {reply.reply_synced_to_gbp ? (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Synced
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> Pending sync
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= reply.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                  </div>

                  {/* Review comment */}
                  {reply.comment && (
                    <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{reply.comment}</p>
                  )}

                  {/* Reply */}
                  <div className="mt-2.5 pl-3 border-l-2 border-primary/30">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-0.5">Your reply</p>
                    <p className="text-sm line-clamp-2">{reply.reply}</p>
                    {reply.replied_at && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(reply.replied_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReviewDetailModal
        review={selectedReview}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}
