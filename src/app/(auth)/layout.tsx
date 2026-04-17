import Link from 'next/link'
import { Star, CheckCircle2 } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const benefits = [
  'Monitor all your Google reviews in real time',
  'Instant email & Slack alerts for new reviews',
  'AI-powered reply suggestions in one click',
  'Ratings, sentiment & trend analytics',
  '14-day free trial — no credit card required',
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-115 xl:w-130 flex-col bg-primary shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 bg-linear-to-br from-transparent via-transparent to-black/10" />

        <div className="relative z-10 p-10 flex flex-col h-full">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-white text-lg">GoHighReview</span>
          </Link>

          <div className="flex-1 flex flex-col justify-center mt-16">
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
              Take control of your Google reviews
            </h2>
            <p className="text-white/65 leading-relaxed mb-10">
              Monitor, respond, and grow your reputation — all from one powerful dashboard.
            </p>
            <ul className="space-y-3.5">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4.5 h-4.5 text-white/80 shrink-0 mt-0.5" />
                  <span className="text-white/75 text-sm leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-white/85 text-sm leading-relaxed mb-4">
              &ldquo;Our average rating went from 4.1 to 4.7 in just 6 weeks. GoHighReview changed everything for us.&rdquo;
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-xs">S</div>
              <div>
                <p className="text-white text-sm font-semibold">Sarah M.</p>
                <p className="text-white/50 text-xs">Owner, The Bake House</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-border">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <Star className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="font-bold text-sm">GoHighReview</span>
          </Link>
          <div className="lg:hidden" />
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-100">{children}</div>
        </div>
      </div>
    </div>
  )
}
