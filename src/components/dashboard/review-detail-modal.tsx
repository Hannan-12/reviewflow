'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ReplyPanel } from './reply-panel'
import { NotificationPreferences } from './notification-preferences'
import { TagPicker } from './tag-picker'
import { Bell, Star, Pencil, CheckCircle2, Clock } from 'lucide-react'
import { useDashboardLang } from './lang-context'

interface Review {
  id: string
  rating: number
  comment: string | null
  reviewer_name: string | null
  review_date: string
  profile_id: string
  reply?: string | null
  replied_at?: string | null
}

interface ReviewDetailModalProps {
  review: Review | null
  isOpen: boolean
  onClose: () => void
  onReplySubmitted?: () => void
}

export function ReviewDetailModal({
  review,
  isOpen,
  onClose,
  onReplySubmitted,
}: ReviewDetailModalProps) {
  const { t } = useDashboardLang()
  const [showPreferences, setShowPreferences] = useState(false)
  const [editingReply, setEditingReply] = useState(false)

  if (!review) return null

  const hasReply = !!review.reply
  const showReplyPanel = !hasReply || editingReply

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setEditingReply(false); onClose() } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.modal_title}</DialogTitle>
          <DialogDescription>
            {review.reviewer_name || t.modal_anonymous}&apos;s {review.rating}★ review
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Review content */}
          <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">{review.reviewer_name || t.modal_anonymous}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.review_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => setShowPreferences(v => !v)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground h-8 text-xs"
              >
                <Bell className="w-3.5 h-3.5 mr-1.5" />
                {t.modal_notifications}
              </Button>
            </div>
            <p className="text-sm leading-relaxed">{review.comment || t.modal_no_comment}</p>
            <div className="pt-1">
              <TagPicker reviewId={review.id} />
            </div>
          </div>

          {/* Notification preferences (collapsible) */}
          {showPreferences && (
            <div className="border border-border rounded-xl p-4">
              <NotificationPreferences
                profileId={review.profile_id}
                onSaved={() => setShowPreferences(false)}
              />
            </div>
          )}

          {/* Existing reply — shown when not editing */}
          {hasReply && !editingReply && (
            <div className="border border-primary/20 bg-primary/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">{t.modal_your_reply}</p>
                </div>
                <div className="flex items-center gap-2">
                  {review.replied_at && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(review.replied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs text-muted-foreground hover:text-foreground px-2"
                    onClick={() => setEditingReply(true)}
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
              <p className="text-sm leading-relaxed">{review.reply}</p>
            </div>
          )}

          {/* Reply panel — shown when no reply yet, or when editing */}
          {showReplyPanel && (
            <ReplyPanel
              reviewId={review.id}
              profileId={review.profile_id}
              reviewerName={review.reviewer_name || 'Customer'}
              rating={review.rating}
              comment={review.comment || ''}
              existingReply={editingReply ? review.reply ?? undefined : undefined}
              onReplySubmitted={() => {
                setEditingReply(false)
                onReplySubmitted?.()
                onClose()
              }}
              onCancel={editingReply ? () => setEditingReply(false) : undefined}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
