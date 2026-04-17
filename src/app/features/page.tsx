import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Star, Bell, MessageSquare, BarChart3, Zap, Shield, Link2, ArrowRight, CheckCircle2 } from 'lucide-react'

export const metadata = { title: 'Features — GoHighReview' }

const features = [
  {
    icon: Bell,
    color: 'bg-blue-500/10 text-blue-500',
    title: 'Instant Review Alerts',
    desc: 'Never miss a new review. Get notified by email or Slack the moment a review is posted to any of your Google Business Profiles.',
    points: [
      'Email notifications via Resend',
      'Slack notifications to any channel',
      'Per-profile filter rules (e.g. only 1–3 star reviews)',
      'Daily and weekly digest options',
      'Minimum rating thresholds',
    ],
  },
  {
    icon: MessageSquare,
    color: 'bg-violet-500/10 text-violet-500',
    title: 'AI Reply Suggestions',
    desc: 'Reply to reviews in seconds with AI-generated suggestions tailored to your brand, tone, and business type.',
    points: [
      'Powered by Anthropic Claude',
      'Context-aware replies based on rating and review content',
      'Edit before posting',
      'Reply templates library',
      'Replies sync back to Google Business Profile',
    ],
  },
  {
    icon: Zap,
    color: 'bg-primary/10 text-primary',
    title: 'AI Auto-Reply Agents',
    desc: 'Set up intelligent agents that automatically reply to reviews based on your rules — no manual action needed.',
    points: [
      'Custom rules per profile',
      'Rating-based triggers (e.g. auto-reply to 5-star reviews)',
      'Custom AI prompt per agent',
      'Enable/disable per profile',
      'Full audit trail of auto-replies',
    ],
  },
  {
    icon: BarChart3,
    color: 'bg-emerald-500/10 text-emerald-500',
    title: 'Analytics & Reports',
    desc: 'Understand your review performance with beautiful charts, sentiment trends, and profile leaderboards.',
    points: [
      'Ratings over time chart',
      'Review volume by day',
      'Positive / neutral / negative sentiment split',
      'Profile leaderboard by average rating',
      'Filter by date range and profile',
    ],
  },
  {
    icon: Shield,
    color: 'bg-rose-500/10 text-rose-500',
    title: 'Embeddable Review Widget',
    desc: 'Showcase your best Google reviews on your website with a single line of embed code.',
    points: [
      'One-line iframe embed',
      'Light and dark theme',
      'Configurable accent colour',
      'Filter by minimum rating',
      'Responsive on all screen sizes',
    ],
  },
  {
    icon: Link2,
    color: 'bg-amber-500/10 text-amber-500',
    title: 'Magic Review Collection Links',
    desc: 'Share a branded link with customers to collect more Google reviews — with a QR code for physical locations.',
    points: [
      'Custom title and message per link',
      'QR code generator for print',
      'Click tracking and analytics',
      'Social proof on landing page',
      'Direct link to Google review form',
    ],
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Star className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">GoHighReview</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/demo" className="hover:text-foreground transition-colors">Demo</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm font-medium">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="text-sm font-semibold">Start free trial</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-10 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Everything you need to manage<br />
          <span className="text-primary">Google reviews at scale</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          From instant alerts to AI auto-replies — GoHighReview handles your entire review workflow so you can focus on running your business.
        </p>
        <Link href="/signup">
          <Button size="lg" className="h-12 px-8 font-semibold shadow-lg shadow-primary/25">
            Start 14-day free trial <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-20">
        {features.map((f, i) => {
          const Icon = f.icon
          const [bg, text] = f.color.split(' ')
          const isEven = i % 2 === 0

          return (
            <div key={f.title} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>
              <div className="flex-1">
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 ${text}`} />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-3">{f.title}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">{f.desc}</p>
                <ul className="space-y-2.5">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1">
                <div className={`h-64 rounded-2xl ${bg} border border-border flex items-center justify-center`}>
                  <Icon className={`w-20 h-20 ${text} opacity-30`} />
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-primary rounded-3xl px-10 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">14-day free trial. No credit card required. Setup in 5 minutes.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold h-12 px-8">
                Start free trial <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-8">
                Book a demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <Star className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="font-bold text-sm">GoHighReview</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 GoHighReview. All rights reserved.</p>
          <div className="flex gap-5 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
