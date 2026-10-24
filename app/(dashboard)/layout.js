'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google'
import SideNav from './_components/SideNav'
import TopHeader from './_components/TopHeader'

/* Same fonts as the landing page */
const displayFont = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

const bodyFont = Hanken_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

/*
 * Tokens and shared classes, copied from the landing page so the app matches it.
 * If you'd rather not duplicate this, move the tokens block and these classes
 * into globals.css and delete this string.
 */
const STYLES = `
.shareio {
  --chalk: #F2F4F2;
  --paper: #FFFFFF;
  --ink: #1A2030;
  --graphite: #525B68;
  --rule: #CDD3D9;
  --signal: #2B3FE8;
  --signal-deep: #1F2FC4;
  --signal-wash: #E9ECFD;
  --night: #0F1B4C;
  --radius: 6px;

  background: var(--chalk);
  color: var(--ink);
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.sio-display { font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif; }
.sio-text-muted { color: var(--graphite); }
.sio-small { font-size: 0.9375rem; line-height: 1.5; }

.sio-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 22px;
  border: 1.5px solid transparent;
  border-radius: var(--radius);
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.sio-btn-primary { background: var(--signal); color: #FFFFFF; }
.sio-btn-primary:hover { background: var(--signal-deep); }
.sio-btn-ghost { background: transparent; color: var(--ink); border-color: var(--ink); }
.sio-btn-ghost:hover { background: var(--ink); color: #FFFFFF; }

.sio-text-btn {
  background: none;
  border: 0;
  padding: 0;
  min-height: 44px;
  font: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--graphite);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.sio-text-btn:hover { color: var(--signal); }

/* Sidebar rows: rounded pills, same language as the landing page cards */
.sio-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 6px 10px;
  border-radius: 10px;
  color: var(--graphite);
  font-size: 0.9375rem;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.sio-nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border: 1px solid var(--rule);
  border-radius: 8px;
  background: var(--paper);
  color: var(--graphite);
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.sio-nav-link:hover { background: var(--chalk); color: var(--ink); }
.sio-nav-link:hover .sio-nav-icon { border-color: var(--signal); color: var(--signal); }
.sio-nav-link[data-active="true"] {
  background: var(--signal-wash);
  color: var(--ink);
  font-weight: 600;
}
.sio-nav-link[data-active="true"] .sio-nav-icon {
  background: var(--signal);
  border-color: var(--signal);
  color: #FFFFFF;
}

.shareio :focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}

.sio-skip {
  position: absolute;
  left: 12px;
  top: -64px;
  z-index: 100;
  padding: 12px 18px;
  background: var(--ink);
  color: #FFFFFF;
  border-radius: var(--radius);
  font-weight: 600;
  text-decoration: none;
}
.sio-skip:focus { top: 12px; }

@media (prefers-reduced-motion: reduce) {
  .shareio * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
`

function Layout({ children }) {
  const reduceMotion = useReducedMotion()
  const [menuOpen, setMenuOpen] = useState(false)
  const drawerRef = useRef(null)

  // Mobile drawer: Escape closes it, page scroll is locked while it's open,
  // and it closes if the window grows to desktop width.
  useEffect(() => {
    if (!menuOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
    if (drawerRef.current) drawerRef.current.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className={`shareio ${displayFont.variable} ${bodyFont.variable} flex min-h-screen`}>
      <style>{STYLES}</style>

      <a href="#main" className="sio-skip">
        Skip to content
      </a>

      {/* Sidebar - fixed on the left, desktop only */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r md:block"
        style={{ background: 'var(--paper)', borderColor: 'var(--rule)' }}
      >
        <SideNav />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <div className="md:hidden">
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-40 cursor-default"
              style={{ background: 'rgba(26, 32, 48, 0.4)' }}
              initial={{ opacity: reduceMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: reduceMotion ? 1 : 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.15 }}
              onClick={closeMenu}
            />
            <motion.div
              id="mobile-sidebar"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              tabIndex={-1}
              className="fixed inset-y-0 left-0 z-50 w-[18rem] max-w-[85vw] overflow-y-auto border-r"
              style={{ background: 'var(--paper)', borderColor: 'var(--rule)' }}
              initial={{ x: reduceMotion ? 0 : -24, opacity: reduceMotion ? 1 : 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: reduceMotion ? 0 : -24, opacity: reduceMotion ? 1 : 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.18 }}
            >
              <SideNav onNavigate={closeMenu} onClose={closeMenu} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex min-w-0 w-full flex-1 flex-col md:ml-64">
        <TopHeader menuOpen={menuOpen} onMenuClick={() => setMenuOpen((value) => !value)} />
        <main id="main" className="flex-1 p-5 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout