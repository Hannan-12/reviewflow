'use client'

import { useState } from 'react'
import { ReviewsTable } from '@/components/dashboard/reviews-table'
import { ReviewDetailModal } from '@/components/dashboard/review-detail-modal'
import type { ReviewsTable as ReviewsTableType } from '@/components/dashboard/reviews-table'

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

interface ReviewsPageClientProps {
  reviews: Review[]
  profiles: Profile[]
  currentRating: string | null
  currentProfile: string | null
}

export function ReviewsPageClient({
  reviews,
  profiles,
  currentRating,
  currentProfile,
}: ReviewsPageClientProps) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleReviewClick = (review: Review) => {
    setSelectedReview(review)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedReview(null)
  }

  return (
    <>
      <ReviewsTable
        reviews={reviews}
        profiles={profiles}
        currentRating={currentRating}
        currentProfile={currentProfile}
        onReviewClick={handleReviewClick}
      />

      <ReviewDetailModal
        review={selectedReview}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}
