'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ReplyPanel } from './reply-panel'
import { NotificationPreferences } from './notification-preferences'
import { TagPicker } from './tag-picker'
import { Bell } from 'lucide-react'

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
  const [showPreferences, setShowPreferences] = useState(false)

  if (!review) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Details</DialogTitle>
          <DialogDescription>
            {review.reviewer_name || 'Anonymous'}'s {review.rating}★ review
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Review Content */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{review.reviewer_name || 'Anonymous'}</p>
                <p className="text-sm text-gray-600">
                  ⭐ {review.rating}/5 • {new Date(review.review_date).toLocaleDateString()}
                </p>
              </div>
              <Button
                onClick={() => setShowPreferences(!showPreferences)}
                variant="ghost"
                size="sm"
                className="text-gray-600"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
            </div>

            <p className="text-gray-800">{review.comment || '(No comment)'}</p>

            {/* Tags */}
            <div className="pt-1">
              <TagPicker reviewId={review.id} />
            </div>
          </div>

          {/* Notification Preferences (collapsible) */}
          {showPreferences && (
            <div className="border rounded-lg p-4">
              <NotificationPreferences
                profileId={review.profile_id}
                onSaved={() => setShowPreferences(false)}
              />
            </div>
          )}

          {/* Reply Panel */}
          <ReplyPanel
            reviewId={review.id}
            profileId={review.profile_id}
            reviewerName={review.reviewer_name || 'Customer'}
            rating={review.rating}
            comment={review.comment || ''}
            onReplySubmitted={() => {
              onReplySubmitted?.()
              onClose()
            }}
          />

          {/* Existing Reply */}
          {review.reply && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">✓ Your Reply</p>
              <p className="text-sm text-blue-800">{review.reply}</p>
              <p className="text-xs text-blue-600 mt-2">
                Posted: {new Date(review.replied_at || '').toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
