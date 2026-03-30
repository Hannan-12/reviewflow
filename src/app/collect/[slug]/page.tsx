import { createClient } from '@supabase/supabase-js'
import { Star, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

interface CollectPageProps {
  params: Promise<{ slug: string }>
}

export default async function CollectPage({ params }: CollectPageProps) {
  const { slug } = await params
  const admin = getAdmin()

  const { data: link } = await admin
    .from('review_collection_links')
    .select('*, profiles(business_name)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!link) notFound()

  // Increment click count
  await admin
    .from('review_collection_links')
    .update({ click_count: (link.click_count ?? 0) + 1 })
    .eq('id', link.id)

  // Fetch recent reviews for social proof
  const { data: reviews } = await admin
    .from('reviews')
    .select('id, rating, comment, reviewer_name, review_date')
    .eq('profile_id', link.profile_id)
    .gte('rating', 4)
    .order('review_date', { ascending: false })
    .limit(3)

  const businessName = (link.profiles as { business_name: string } | null)?.business_name ?? 'Us'
  const title   = link.title   ?? `Leave us a review!`
  const message = link.message ?? `Your feedback helps us improve and helps others find us. It only takes 30 seconds!`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className="bg-indigo-600 px-8 py-10 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white fill-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
            <p className="text-indigo-100 text-sm">{businessName}</p>
          </div>

          {/* Body */}
          <div className="px-8 py-7">
            <p className="text-gray-600 text-center text-sm leading-relaxed mb-6">{message}</p>

            {link.google_review_url ? (
              <a
                href={link.google_review_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-3.5 transition-colors"
              >
                <Star className="w-4 h-4 fill-white" />
                Leave a Google Review
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            ) : (
              <div className="w-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-semibold rounded-xl py-3.5 text-center text-sm">
                Review link coming soon
              </div>
            )}

            {/* Social proof */}
            {reviews && reviews.length > 0 && (
              <div className="mt-7">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-3">
                  What others say
                </p>
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-0.5 mb-1">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      {r.comment && (
                        <p className="text-xs text-gray-600 line-clamp-2">{r.comment}</p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">{r.reviewer_name ?? 'Anonymous'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Powered by{' '}
          <Link href="/" className="text-indigo-400 hover:text-indigo-600">ReviewFlow</Link>
        </p>
      </div>
    </div>
  )
}
