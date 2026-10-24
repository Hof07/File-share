'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import useUploadCount from '../(routes)/upload/_components/useUploadCount'
import Logo from './Logo'
import { MENU_LIST } from './nav-items.js'

const MAX_UPLOADS = 5

/**
 * onNavigate: called after a link is clicked (closes the mobile drawer).
 * onClose: when given, a "Close" button is shown in the header (mobile drawer only).
 */
function SideNav({ onNavigate, onClose }) {
  const pathname = usePathname() || ''
  const { count: uploadCount } = useUploadCount()

  const used = Math.min(uploadCount, MAX_UPLOADS)
  const percent = (used / MAX_UPLOADS) * 100
  const atLimit = uploadCount >= MAX_UPLOADS

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Logo row. Same height as the top header so the rules line up. */}
        <div
          className="flex h-16 items-center justify-between border-b px-5"
          style={{ borderColor: 'var(--rule)' }}
        >
          <Logo />
          {onClose && (
            <button type="button" className="sio-text-btn" onClick={onClose}>
              Close
            </button>
          )}
        </div>

        <nav aria-label="App" className="p-3">
          <ul className="flex flex-col gap-1">
            {MENU_LIST.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.path)

              return (
                <li key={item.id}>
                  <Link
                    href={item.path}
                    onClick={onNavigate}
                    className="sio-nav-link"
                    aria-current={isActive ? 'page' : undefined}
                    data-active={isActive}
                  >
                    <span className="sio-nav-icon">
                      <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Upload usage: a small card, like the "How it works" steps */}
      <div className="p-3">
        <div
          className="rounded-xl border p-4"
          style={{ background: 'var(--chalk)', borderColor: 'var(--rule)' }}
        >
          <div className="flex items-center justify-between gap-3">
            <p
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: 'var(--signal)' }}
            >
              Uploads
            </p>
            <p className="sio-small sio-text-muted">
              {used} of {MAX_UPLOADS}
            </p>
          </div>

          <div
            role="progressbar"
            aria-label="Uploads used"
            aria-valuemin={0}
            aria-valuemax={MAX_UPLOADS}
            aria-valuenow={used}
            className="mt-3 h-2 w-full overflow-hidden rounded-full"
            style={{ background: 'var(--rule)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${percent}%`,
                background: 'var(--signal)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          <p className="sio-small sio-text-muted mt-3">
            {atLimit ? "You've used all your uploads." : 'Upgrade for unlimited uploads.'}
          </p>

          <Link
            href="/upgrade"
            onClick={onNavigate}
            className="sio-btn sio-btn-primary mt-4 w-full !min-h-[40px] !text-[0.9375rem]"
          >
            Upgrade to Blaze
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SideNav