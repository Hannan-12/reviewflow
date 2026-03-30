import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Star, Bell, BarChart3, MessageSquare, Zap, Shield,
  ArrowRight, CheckCircle2, TrendingUp, Users, Play,
} from 'lucide-react'

const features = [
  { icon: Bell, title: 'Instant alerts', desc: 'Email and Slack notifications the moment a review lands — never miss a response window.', color: 'bg-blue-500/10 text-blue-500' },
  { icon: MessageSquare, title: 'AI reply suggestions', desc: 'GPT-4 powered responses tailored to your brand. Edit, approve, and send in seconds.', color: 'bg-violet-500/10 text-violet-500' },
  { icon: BarChart3, title: 'Analytics & reports', desc: 'Ratings over time, sentiment trends, review volume — all in a clean dashboard.', color: 'bg-emerald-500/10 text-emerald-500' },
  { icon: Star, title: 'Multi-location', desc: 'Manage every Google Business Profile in one place. No tab switching.', color: 'bg-amber-500/10 text-amber-500' },
  { icon: Zap, title: 'Auto-reply agents', desc: 'Set up AI agents to reply automatically based on rating, keywords, or custom rules.', color: 'bg-primary/10 text-primary' },
  { icon: Shield, title: 'Review widgets', desc: 'Embed your best reviews on any website with a single line of code.', color: 'bg-rose-500/10 text-rose-500' },
]

const testimonials = [
  { quote: 'ReviewFlow cut our response time from 3 days to 3 minutes. Our rating jumped from 4.1 to 4.7 in 6 weeks.', author: 'Sarah M.', role: 'Owner, The Bake House', stars: 5 },
  { quote: 'The AI suggestions are genuinely good. I barely edit them before hitting send. Saves me an hour every day.', author: 'James K.', role: 'Marketing Manager, FitLife Studios', stars: 5 },
  { quote: 'Managing 12 locations used to be chaos. Now it takes 20 minutes a week.', author: 'Priya R.', role: 'Head of Operations, Nosh Group', stars: 5 },
]

const plans = [
  { name: 'Lite', price: '$20', desc: 'For single-location businesses', features: ['3 Google profiles', 'Email alerts', 'AI reply suggestions', 'Basic reports', 'CSV export'], highlight: false },
  { name: 'Pro', price: '$35', desc: 'For teams managing multiple locations', features: ['10 Google profiles', 'Email + Slack alerts', 'AI auto-reply agents', 'Advanced reports', 'Review widgets', 'Review auto-tagging'], highlight: true },
  { name: 'Premium', price: '$40', desc: 'For agencies and enterprise brands', features: ['Unlimited profiles', 'Everything in Pro', 'Custom AI prompts', 'Sentiment analysis', 'Magic review links', 'Priority support'], highlight: false },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Star className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">ReviewFlow</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/features" className="hover:text-foreground transition-colors">Features</Link>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <Link href="/demo" className="hover:text-foreground transition-colors">Demo</Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm font-medium">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="text-sm font-semibold shadow-sm">Start free trial</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-background to-background pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-150 h-75 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <Link href="/signup" className="inline-flex items-center gap-2 bg-primary/8 text-primary rounded-full px-4 py-1.5 text-xs font-semibold mb-8 border border-primary/20 hover:bg-primary/12 transition-colors">
            <Zap className="w-3 h-3" />
            Now with AI auto-reply agents
            <ArrowRight className="w-3 h-3" />
          </Link>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Review management for
            <br />
            <span className="text-primary">teams that move fast</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
            Monitor every Google Business Profile review in one dashboard.
            Get instant alerts, reply with AI, and automate your entire review workflow.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-shadow">
                Start 14-day free trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/demo" className="flex items-center gap-2 h-12 px-6 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all border border-border">
              <Play className="w-3.5 h-3.5" />
              Watch demo
            </Link>
          </div>

          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            No credit card required · Cancel anytime · Setup in 5 minutes
          </p>

          {/* Social proof logos */}
          <div className="mt-16 pt-10 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
              Trusted by 500+ business locations
            </p>
            <div className="flex items-center justify-center gap-10 flex-wrap">
              {['Moss', 'Lugg', 'Bounce', 'Nory', 'Brevo', 'Pepper'].map((b) => (
                <span key={b} className="text-sm font-bold text-muted-foreground/40 tracking-widest uppercase">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {[
            { icon: Star, value: '+0.6★', label: 'Average rating improvement in 60 days' },
            { icon: TrendingUp, value: '3×', label: 'Faster review response time' },
            { icon: Users, value: '500+', label: 'Business locations monitored' },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="flex flex-col items-center text-center gap-1 py-6 md:py-0 px-8">
                <Icon className="w-5 h-5 text-primary mb-2" />
                <span className="text-3xl font-bold">{s.value}</span>
                <span className="text-sm text-muted-foreground">{s.label}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Everything your review workflow needs
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            From monitoring to AI replies — your entire review operation in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon
            const [bg, text] = f.color.split(' ')
            return (
              <div key={f.title} className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${text}`} />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-y border-border bg-muted/20 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Loved by business owners</h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">4.9/5 from 200+ reviews</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.author} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5 text-foreground">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {t.author[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
          <p className="text-lg text-muted-foreground">All plans include a 14-day free trial. No credit card required.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {plans.map((p) => (
            <div key={p.name} className={`relative rounded-2xl border p-7 flex flex-col ${p.highlight ? 'border-primary bg-primary text-white shadow-xl shadow-primary/30 scale-[1.02]' : 'border-border bg-card'}`}>
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-primary text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1 shadow-sm">
                  Most popular
                </div>
              )}
              <p className={`font-bold mb-1 ${p.highlight ? 'text-white' : ''}`}>{p.name}</p>
              <div className="flex items-end gap-1 mb-1">
                <span className={`text-4xl font-bold ${p.highlight ? 'text-white' : ''}`}>{p.price}</span>
                <span className={`text-sm mb-1.5 ${p.highlight ? 'text-white/60' : 'text-muted-foreground'}`}>/mo</span>
              </div>
              <p className={`text-sm mb-6 ${p.highlight ? 'text-white/70' : 'text-muted-foreground'}`}>{p.desc}</p>
              <ul className="space-y-2.5 flex-1 mb-7">
                {p.features.map((f) => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${p.highlight ? 'text-white/90' : ''}`}>
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${p.highlight ? 'text-white' : 'text-primary'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button className={`w-full font-semibold ${p.highlight ? 'bg-white text-primary hover:bg-white/90' : ''}`} variant={p.highlight ? 'secondary' : 'default'}>
                  Start free trial
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="relative overflow-hidden bg-primary rounded-3xl px-10 py-16 text-center">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to take control of your reviews?
            </h2>
            <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
              Join hundreds of businesses using ReviewFlow to respond faster and grow their reputation.
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8 h-12 text-base shadow-lg">
                Start your free trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-white/50 mt-4">14-day free trial · No credit card required</p>
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
            <span className="font-bold text-sm">ReviewFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 ReviewFlow. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="flex gap-5 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
