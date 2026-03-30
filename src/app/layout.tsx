import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { CommandPalette } from '@/components/command-palette'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ReviewFlow — Google Review Management',
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
          {children}
          <CommandPalette />
          <Toaster richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
