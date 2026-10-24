import Link from 'next/link'

/** Same mark as the landing page, so the app and the site read as one product. */
function Logo({ href = '/' }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 no-underline"
      aria-label="Share.io home"
      style={{ color: 'var(--ink)' }}
    >
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true" focusable="false">
        <rect width="26" height="26" rx="6" fill="var(--signal)" />
        <path
          d="M8 15.5 13 10l5 5.5"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sio-display text-[1.25rem] font-bold tracking-[-0.02em]">
        Share.io
      </span>
    </Link>
  )
}

export default Logo