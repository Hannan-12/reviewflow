import Link from 'next/link'
import { Star } from 'lucide-react'

export const metadata = { title: 'Privacy Policy — Reviewup' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Star className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">Reviewup</span>
          </Link>
          <div className="flex gap-5 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: March 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-bold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">We collect information you provide directly to us, including your name, email address, and payment information when you create an account or subscribe to a plan. We also collect data from your connected Google Business Profile accounts, including review content, reviewer names, ratings, and timestamps.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Provide, maintain, and improve our services</li>
              <li>Process payments and manage your subscription</li>
              <li>Send you review alerts, digest emails, and service notifications</li>
              <li>Generate AI reply suggestions using your review data</li>
              <li>Analyse review sentiment and generate reports</li>
              <li>Respond to your support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Google Data</h2>
            <p className="text-muted-foreground leading-relaxed">Reviewup connects to your Google Business Profile via OAuth. We access your review data, business location information, and post replies on your behalf only when authorised by you. We do not sell or share your Google data with third parties. You can revoke access at any time from your Google Account settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Data Storage & Security</h2>
            <p className="text-muted-foreground leading-relaxed">Your data is stored in Supabase (PostgreSQL) with row-level security enforced. All data in transit is encrypted with TLS. Review data is stored per user account with strict isolation — no user can access another user's data. Payment information is handled by Stripe and never stored on our servers.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. AI Processing</h2>
            <p className="text-muted-foreground leading-relaxed">We use Anthropic Claude AI to generate reply suggestions and perform sentiment analysis on your reviews. Review content is sent to Anthropic's API for processing. Anthropic's privacy policy governs the handling of this data. We do not use your review data to train AI models.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">We use the following third-party services: Stripe (payments), Resend (email delivery), Supabase (database and auth), and Anthropic (AI processing). Each service has its own privacy policy governing data they receive.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">We retain your data for as long as your account is active. If you cancel your subscription, your data is retained for 30 days before deletion. You can request immediate deletion by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">You have the right to access, correct, or delete your personal data at any time. You can export your review data as CSV from the dashboard. To request data deletion or a full data export, contact us at the email below.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">If you have questions about this Privacy Policy, contact us at <a href="mailto:privacy@reviewflow.app" className="text-primary hover:underline">privacy@reviewflow.app</a>.</p>
          </section>
        </div>
      </div>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>© 2026 Reviewup. All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
