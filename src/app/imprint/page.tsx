import Link from 'next/link'
import { Star } from 'lucide-react'

export const metadata = { title: 'Imprint — Reviewup' }

export default function ImprintPage() {
  return (
    <div style={{ background: '#1A1A1A', color: '#fff', minHeight: '100vh' }}>
      <nav className="sticky top-0 z-50" style={{ background: 'rgba(26,26,26,0.95)', borderBottom: '1px solid #333', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#F5C518' }}>
              <Star className="w-3.5 h-3.5" style={{ color: '#1A1A1A', fill: '#1A1A1A' }} />
            </div>
            <span className="font-bold text-sm text-white">Reviewup</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-8">Imprint / Legal Notice</h1>

        <div className="space-y-6 text-gray-400 text-sm leading-relaxed">
          <div>
            <h2 className="text-white font-semibold text-base mb-2">Information according to § 5 TMG</h2>
            {/* Replace with real company details */}
            <p>Company Name GmbH<br />
            Street Address 1<br />
            12345 City, Germany</p>
          </div>

          <div>
            <h2 className="text-white font-semibold text-base mb-2">Contact</h2>
            <p>Email: <a href="mailto:hello@reviewup.de" style={{ color: '#F5C518' }}>hello@reviewup.de</a></p>
          </div>

          <div>
            <h2 className="text-white font-semibold text-base mb-2">Register entry</h2>
            <p>Registration court: Amtsgericht [City]<br />
            Registration number: HRB XXXXX</p>
          </div>

          <div>
            <h2 className="text-white font-semibold text-base mb-2">VAT ID</h2>
            <p>VAT identification number according to § 27a UStG: DE XXXXXXXXX</p>
          </div>

          <div>
            <h2 className="text-white font-semibold text-base mb-2">Responsible for content according to § 55 Abs. 2 RStV</h2>
            <p>Name Surname<br />
            Address as above</p>
          </div>

          <div className="pt-4" style={{ borderTop: '1px solid #333' }}>
            <p className="text-gray-600 text-xs">Please fill in the actual company details before publishing.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
