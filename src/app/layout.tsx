import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
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
  title: 'Reviewup — Google Review Management',
  description:
    'Monitor, respond to, and manage your Google Business Profile reviews with AI-powered tools.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
