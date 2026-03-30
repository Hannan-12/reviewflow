'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Star, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', company: '', phone: '', locations: '', message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production: send to your email/CRM
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Star className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">ReviewFlow</span>
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
            <p className="text-sm font-semibold text-primary mb-3">Book a demo</p>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              See ReviewFlow in action
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Get a personalised walkthrough of how ReviewFlow can automate your Google review management — tailored to your business size and goals.
            </p>

            <div className="space-y-4">
              {[
                'Live demo of the full dashboard',
                'AI reply suggestions and auto-reply setup',
                'Review widget and magic link walkthrough',
                'Pricing and plan recommendation',
                'Q&A with our team',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 p-5 bg-muted/50 rounded-2xl border border-border">
              <p className="text-sm font-semibold mb-1">Prefer to start immediately?</p>
              <p className="text-sm text-muted-foreground mb-3">Start your 14-day free trial — no credit card required.</p>
              <Link href="/signup">
                <Button size="sm" className="font-semibold">Start free trial</Button>
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
                <h2 className="text-xl font-bold mb-2">Request received!</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  We'll be in touch within 1 business day to schedule your demo.
                </p>
                <Link href="/">
                  <Button variant="outline" size="sm">Back to homepage</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-bold text-lg mb-2">Request a demo</h2>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Full name *</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full h-9 text-sm rounded-lg border border-border bg-background px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Work email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full h-9 text-sm rounded-lg border border-border bg-background px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Company name *</label>
                  <input
                    required
                    type="text"
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    className="w-full h-9 text-sm rounded-lg border border-border bg-background px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Phone number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full h-9 text-sm rounded-lg border border-border bg-background px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">How many business locations?</label>
                  <select
                    value={form.locations}
                    onChange={e => setForm(f => ({ ...f, locations: e.target.value }))}
                    className="w-full h-9 text-sm rounded-lg border border-border bg-background px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select...</option>
                    <option value="1">1 location</option>
                    <option value="2-5">2–5 locations</option>
                    <option value="6-20">6–20 locations</option>
                    <option value="20+">20+ locations</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Anything specific you'd like to see?</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={3}
                    className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                <Button type="submit" className="w-full font-semibold">
                  Request demo
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
