'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Star, ArrowLeft, CheckCircle2, Building2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AgencyPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', company: '', phone: '',
    profiles: '', currentSetup: '', message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/agency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      setSubmitted(true)
    } catch {
      toast.error('Something went wrong. Please email us directly at hello@gohighreview.de')
    } finally {
      setLoading(false)
    }
  }

  const field = 'w-full h-9 text-sm rounded-lg border border-border bg-background px-3 focus:outline-none focus:ring-1 focus:ring-primary'

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Star className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">GoHighReview</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors ml-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-primary/10 text-primary mb-4">
              <Building2 className="w-3.5 h-3.5" />
              Agency Plan
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Get a custom quote for your agency
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Managing 11 or more Google Business Profiles? We&apos;ll put together a tailored plan with pricing, onboarding support, and a dedicated account manager.
            </p>

            <div className="space-y-4 mb-10">
              {[
                'Unlimited Google Business Profiles',
                'Custom AI reply prompts for your brand',
                'Sentiment analysis across all locations',
                'Magic review links & QR codes',
                'Priority support & dedicated account manager',
                'Custom onboarding and team training',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>

            <div className="p-5 bg-muted/50 rounded-2xl border border-border">
              <p className="text-sm font-semibold mb-1">Smaller team?</p>
              <p className="text-sm text-muted-foreground mb-3">
                If you manage fewer than 11 profiles, our Lite or Pro plan is a better fit.
              </p>
              <Link href="/billing">
                <Button size="sm" variant="outline" className="font-semibold">View plans</Button>
              </Link>
            </div>
          </div>

          {/* Right — Form */}
          <div className="bg-card border border-border rounded-2xl p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">Inquiry received!</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  We&apos;ll get back to you within 1 business day with a custom quote.
                </p>
                <Link href="/">
                  <Button variant="outline" size="sm">Back to homepage</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-bold text-lg mb-2">Contact us for Agency plan</h2>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Full name *</label>
                    <input required type="text" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Jane Smith" className={field} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Work email *</label>
                    <input required type="email" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="you@company.com" className={field} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Company / Agency name *</label>
                    <input required type="text" value={form.company}
                      onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                      placeholder="Acme Agency" className={field} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Phone number</label>
                    <input type="tel" value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+49 …" className={field} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">How many Google Business Profiles? *</label>
                  <select required value={form.profiles}
                    onChange={e => setForm(f => ({ ...f, profiles: e.target.value }))}
                    className="w-full h-9 text-sm rounded-lg border border-border bg-background px-2 focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="">Select range…</option>
                    <option value="11–20">11–20 profiles</option>
                    <option value="21–50">21–50 profiles</option>
                    <option value="51–100">51–100 profiles</option>
                    <option value="100+">100+ profiles</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">How do you currently manage reviews?</label>
                  <select value={form.currentSetup}
                    onChange={e => setForm(f => ({ ...f, currentSetup: e.target.value }))}
                    className="w-full h-9 text-sm rounded-lg border border-border bg-background px-2 focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="">Select…</option>
                    <option value="Manually via Google">Manually via Google</option>
                    <option value="Another tool">Another tool / software</option>
                    <option value="Not managing yet">Not managing yet</option>
                    <option value="In-house team">In-house team</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Anything specific you need?</label>
                  <textarea value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={3} placeholder="Custom integrations, specific features, onboarding timeline…"
                    className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                </div>

                <Button type="submit" className="w-full font-semibold" disabled={loading}>
                  {loading ? 'Sending…' : 'Get custom quote'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  We typically respond within 1 business day.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
