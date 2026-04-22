'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface SidebarContextValue {
  collapsed: boolean
  toggle: () => void
  mobileOpen: boolean
  toggleMobile: () => void
  closeMobile: () => void
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggle: () => {},
  mobileOpen: false,
  toggleMobile: () => {},
  closeMobile: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rf-sidebar-collapsed')
      if (saved !== null) setCollapsed(JSON.parse(saved))
    } catch {}
  }, [])

  // Close mobile drawer on route change (navigation)
  useEffect(() => {
    if (mobileOpen) setMobileOpen(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem('rf-sidebar-collapsed', JSON.stringify(next)) } catch {}
      return next
    })
  }

  const toggleMobile = () => setMobileOpen(p => !p)
  const closeMobile = () => setMobileOpen(false)

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, mobileOpen, toggleMobile, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)
