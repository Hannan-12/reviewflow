export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { cookies } from 'next/headers'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { CommandPaletteLoader } from '@/components/command-palette-loader'
import { SpeedInsights } from '@vercel/speed-insights/next'
import NextTopLoader from 'nextjs-toploader'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'GoHighReview — Google Review Management',
  description:
    'Monitor, respond to, and manage your Google Business Profile reviews with AI-powered tools.',
}

const RTL_LANGS = new Set(['ar'])

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const lang = cookieStore.get('app_lang')?.value ?? 'de'
  const dir = RTL_LANGS.has(lang) ? 'rtl' : 'ltr'

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased font-sans`} suppressHydrationWarning>
        <ThemeProvider>
          <NextTopLoader color="#F5C518" showSpinner={false} height={3} />
          {children}
          <CommandPaletteLoader />
          <Toaster richColors closeButton />
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
