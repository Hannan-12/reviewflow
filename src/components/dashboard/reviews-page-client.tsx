'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ReviewsTable } from '@/components/dashboard/reviews-table'
import { ReviewDetailModal } from '@/components/dashboard/review-detail-modal'
import { ProfileSwitcher } from '@/components/dashboard/profile-switcher'
import { useDashboardLang } from '@/components/dashboard/lang-context'

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
  lastSyncedAt: string | null
  isLimitedByPlan?: boolean
  planName?: string
}

export function ReviewsPageClient({
  reviews,
  profiles,
  currentRating,
  currentProfile,
  lastSyncedAt,
  isLimitedByPlan = false,
  planName = 'free',
}: ReviewsPageClientProps) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useDashboardLang()

  const handleReviewClick = (review: Review) => {
    setSelectedReview(review)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedReview(null)
  }

  const handleProfileSelect = (profileId: string | null) => {
    const params = new URLSearchParams()
    if (currentRating) params.set('rating', currentRating)
    if (profileId) params.set('profile', profileId)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <>
      <ProfileSwitcher
        profiles={profiles}
        currentProfile={currentProfile}
        allLabel={t.rev_all_profiles}
        onSelect={handleProfileSelect}
      />

      {isLimitedByPlan && (
        <a href={planName === 'pro' ? '/agency' : '/billing'} className="block">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#F5C51820', borderColor: '#F5C51860', color: '#92710a' }}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#F5C518' }} />
            {planName === 'pro' ? t.rev_limit_banner_pro : t.rev_limit_banner}
          </div>
        </a>
      )}

      <ReviewsTable
        reviews={reviews}
        profiles={profiles}
        currentRating={currentRating}
        currentProfile={currentProfile}
        lastSyncedAt={lastSyncedAt}
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
