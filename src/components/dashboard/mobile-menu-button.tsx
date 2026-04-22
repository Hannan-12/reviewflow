'use client'

import { Menu } from 'lucide-react'
import { useSidebar } from './sidebar-context'

export function MobileMenuButton() {
  const { toggleMobile } = useSidebar()
  return (
    <button
      onClick={toggleMobile}
      className="lg:hidden mr-1 w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
      aria-label="Open menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  )
}
