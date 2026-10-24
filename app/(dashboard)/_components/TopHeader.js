'use client'

import { UserButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import React from 'react'
import Logo from './Logo'
import { MENU_LIST } from './nav-items.js'

function TopHeader({ menuOpen = false, onMenuClick }) {
  const pathname = usePathname() || ''
  const current = MENU_LIST.find((item) => pathname.startsWith(item.path))
  const title = current ? current.name : 'Dashboard'

  return (
    <header
      className="sticky top-0 z-20 border-b"
      style={{ background: 'var(--chalk)', borderColor: 'var(--rule)' }}
    >
      <div className="flex h-16 items-center justify-between px-5 sm:px-8">
        {/* Mobile: menu button + logo. The sidebar is hidden below md. */}
        <div className="flex items-center gap-5 md:hidden">
          <button
            type="button"
            className="sio-text-btn"
            aria-expanded={menuOpen}
            aria-controls="mobile-sidebar"
            onClick={onMenuClick}
          >
            Menu
          </button>
          <Logo />
        </div>

        {/* Desktop: current page, as the same pill badge used on the landing page */}
        <span
          className="hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium md:inline-flex"
          style={{
            background: 'var(--paper)',
            borderColor: 'var(--rule)',
            color: 'var(--signal)',
          }}
        >
          <span className="size-1.5 rounded-full" style={{ background: 'var(--signal)' }} />
          {title}
        </span>

        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  )
}

export default TopHeader