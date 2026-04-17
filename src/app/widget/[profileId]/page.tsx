import { createClient } from '@supabase/supabase-js'
import { Star } from 'lucide-react'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

interface WidgetPageProps {
  params: Promise<{ profileId: string }>
}

export default async function WidgetPage({ params }: WidgetPageProps) {
  const { profileId } = await params
  const admin = getAdmin()

  const [{ data: profile }, { data: config }] = await Promise.all([
    admin.from('profiles').select('business_name').eq('id', profileId).single(),
    admin.from('widget_configs').select('*').eq('profile_id', profileId).maybeSingle(),
  ])

  if (!profile) notFound()

  const theme       = config?.theme       ?? 'light'
  const accentColor = config?.accent_color ?? '#6366f1'
  const minRating   = config?.min_rating   ?? 1
  const maxReviews  = config?.max_reviews  ?? 6
  const showDates   = config?.show_dates   ?? true

  const { data: reviews } = await admin
    .from('reviews')
    .select('id, rating, comment, reviewer_name, reviewer_photo_url, review_date')
    .eq('profile_id', profileId)
    .gte('rating', minRating)
    .order('review_date', { ascending: false })
    .limit(maxReviews)

  const isDark = theme === 'dark'
  const bg     = isDark ? '#0f172a' : '#ffffff'
  const card   = isDark ? '#1e293b' : '#f8fafc'
  const text   = isDark ? '#f1f5f9' : '#0f172a'
  const muted  = isDark ? '#94a3b8' : '#64748b'

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{profile.business_name} Reviews</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: ${bg}; color: ${text}; padding: 16px; }
          .header { text-align: center; margin-bottom: 20px; }
          .business-name { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
          .summary { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 6px; }
          .avg { font-size: 28px; font-weight: 800; color: ${accentColor}; }
          .stars { display: flex; gap: 2px; }
          .star { width: 16px; height: 16px; }
          .star-filled { fill: #f59e0b; color: #f59e0b; }
          .star-empty  { fill: none; color: #d1d5db; }
          .count { font-size: 12px; color: ${muted}; }
          .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
          .card { background: ${card}; border-radius: 12px; padding: 14px; }
          .card-stars { display: flex; gap: 2px; margin-bottom: 8px; }
          .card-star { width: 12px; height: 12px; }
          .comment { font-size: 13px; line-height: 1.5; color: ${text}; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
          .reviewer { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
          .avatar { width: 28px; height: 28px; border-radius: 50%; background: ${accentColor}20; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: ${accentColor}; overflow: hidden; flex-shrink: 0; }
          .avatar img { width: 100%; height: 100%; object-fit: cover; }
          .reviewer-name { font-size: 12px; font-weight: 600; }
          .review-date { font-size: 11px; color: ${muted}; }
          .empty { text-align: center; padding: 40px; color: ${muted}; font-size: 14px; }
          .powered { text-align: center; margin-top: 16px; font-size: 10px; color: ${muted}; }
          .powered a { color: ${accentColor}; text-decoration: none; }
        `}</style>
      </head>
      <body>
        <div className="header">
          <div className="business-name">{profile.business_name}</div>
          {avgRating && (
            <div className="summary">
              <span className="avg">{avgRating}</span>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className="star" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <polygon
                      points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                      className={parseFloat(avgRating) >= s ? 'star-filled' : 'star-empty'}
                    />
                  </svg>
                ))}
              </div>
              <span className="count">{reviews?.length ?? 0} reviews</span>
            </div>
          )}
        </div>

        {reviews && reviews.length > 0 ? (
          <div className="grid">
            {reviews.map((r) => {
              const initials = (r.reviewer_name ?? '?').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
              const dateStr  = showDates && r.review_date
                ? new Date(r.review_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : null

              return (
                <div key={r.id} className="card">
                  <div className="card-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="card-star" viewBox="0 0 24 24">
                        <polygon
                          points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                          fill={r.rating >= s ? '#f59e0b' : '#e5e7eb'}
                        />
                      </svg>
                    ))}
                  </div>
                  {r.comment && <p className="comment">{r.comment}</p>}
                  <div className="reviewer">
                    <div className="avatar">
                      {r.reviewer_photo_url
                        ? <img src={r.reviewer_photo_url} alt={r.reviewer_name ?? ''} />
                        : initials}
                    </div>
                    <div>
                      <div className="reviewer-name">{r.reviewer_name ?? 'Anonymous'}</div>
                      {dateStr && <div className="review-date">{dateStr}</div>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="empty">No reviews yet</div>
        )}

        <div className="powered">
          Powered by <a href="https://reviewflow.app" target="_blank" rel="noopener noreferrer">Reviewup</a>
        </div>
      </body>
    </html>
  )
}
