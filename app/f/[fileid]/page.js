'use client';

/**
 * FileDownloadPage (Share.io style)
 *
 * The page a recipient opens from a share link (/f/[fileid]).
 * Same design system as the landing page, upload form and share page:
 * chalk background, hairline rules, one accent colour, 6px radius, left-aligned.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google';
import { supabase } from '@/app/lib/superbaseClient';

/* -------------------------------------------------------------------------- */
/*  Fonts                                                                     */
/* -------------------------------------------------------------------------- */

const displayFont = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const bodyFont = Hanken_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

/* -------------------------------------------------------------------------- */
/*  Styles (same tokens and class names as the rest of the app)               */
/* -------------------------------------------------------------------------- */

const STYLES = `
.sio-page {
  --chalk: #F2F4F2;
  --paper: #FFFFFF;
  --ink: #1A2030;
  --graphite: #525B68;
  --rule: #CDD3D9;
  --signal: #2B3FE8;
  --signal-deep: #1F2FC4;
  --radius: 6px;

  min-height: 100vh;
  background: var(--chalk);
  color: var(--ink);
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.sio-page .sio-text-muted { color: var(--graphite); }
.sio-page .sio-rule { border-color: var(--rule); }
.sio-page .sio-rule-ink { border-color: var(--ink); }
.sio-page .sio-prose { max-width: 58ch; }
.sio-page .sio-small { font-size: 0.9375rem; line-height: 1.5; }
.sio-page .sio-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.sio-page .sio-error { color: #B42318; }

.sio-page .sio-display { font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif; }

.sio-page .sio-h2 {
  font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif;
  font-weight: 650;
  font-size: clamp(1.875rem, 1.4rem + 2vw, 3rem);
  line-height: 1.08;
  letter-spacing: -0.025em;
}

.sio-page .sio-h3 {
  font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif;
  font-weight: 600;
  font-size: 1.25rem;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.sio-page .sio-link {
  color: inherit;
  text-decoration: underline;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 4px;
}
.sio-page .sio-link:hover { color: var(--signal); }

.sio-page .sio-btn {
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
.sio-page .sio-btn-primary { background: var(--signal); color: #FFFFFF; }
.sio-page .sio-btn-primary:hover { background: var(--signal-deep); }
.sio-page .sio-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.sio-page .sio-input {
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  background: var(--paper);
  color: var(--ink);
  border: 1.5px solid var(--ink);
  border-radius: var(--radius);
  font: inherit;
  font-size: 1rem;
}
.sio-page .sio-input:disabled { opacity: 0.5; cursor: not-allowed; }

.sio-page :focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}

/* File type glyph: the extension in a 6px outlined box */
.sio-ext {
  display: inline-flex;
  min-width: 56px;
  height: 56px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  background: var(--paper);
  border: 1.5px solid var(--ink);
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 600;
}

@media (prefers-reduced-motion: reduce) {
  .sio-page * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
`;

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                              */
/* -------------------------------------------------------------------------- */

function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 no-underline"
      aria-label="Share.io home"
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
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function FileDownloadPage() {
  const { fileid } = useParams();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [checking, setChecking] = useState(false);

  // The hash is only needed for the comparison, so it stays out of render state.
  const passwordHash = useRef(null);

  useEffect(() => {
    async function fetchFile() {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('files')
          .select('id, name, url, password, uploaded_at')
          .eq('id', fileid)
          .single();

        if (error || !data) {
          setFile(null);
        } else {
          passwordHash.current = data.password || null;
          const { password, ...publicFile } = data;
          setFile(publicFile);
          setPasswordRequired(Boolean(password));
          setAccessGranted(!password);
        }
      } catch (e) {
        setFile(null);
      }

      setLoading(false);
    }

    if (fileid) fetchFile();
  }, [fileid]);

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!passwordHash.current) return;

    setChecking(true);
    setPasswordError('');

    try {
      const isMatch = await bcrypt.compare(passwordInput, passwordHash.current);
      if (isMatch) {
        setAccessGranted(true);
        setPasswordInput('');
      } else {
        setPasswordError('That password is not correct. Try again.');
      }
    } catch (e) {
      setPasswordError('Could not check the password. Try again.');
    }

    setChecking(false);
  };

  const shell = (content) => (
    <div className={`sio-page ${displayFont.variable} ${bodyFont.variable}`}>
      <style>{STYLES}</style>
      <div className="mx-auto w-full max-w-[560px] px-5 py-10 sm:px-8 sm:py-16">
        <Logo />
        {content}
      </div>
    </div>
  );

  if (loading) {
    return shell(
      <p role="status" className="sio-text-muted mt-12">
        Loading file…
      </p>
    );
  }

  if (!file) {
    return shell(
      <div role="alert" className="mt-12">
        <h1 className="sio-h2">File not found</h1>
        <p className="sio-text-muted sio-prose mt-4">
          The link may be wrong, or the file was removed.
        </p>
        <p className="mt-8">
          <Link href="/" className="sio-link font-semibold">
            Go to Share.io
          </Link>
        </p>
      </div>
    );
  }

  const hasExtension = file.name.includes('.');
  const fileExt = hasExtension ? file.name.split('.').pop().toLowerCase() : '';

  const uploadedAt = new Date(file.uploaded_at);
  const uploadedLabel = Number.isNaN(uploadedAt.getTime())
    ? null
    : uploadedAt.toLocaleDateString(undefined, { dateStyle: 'medium' });

  return shell(
    <>
      <h1 className="sio-h2 mt-12">A file was shared with you</h1>

      <div className="sio-rule-ink mt-8 border-y">
        {/* File */}
        <div className="sio-rule flex items-center gap-4 border-b py-6">
          <span className="sio-ext sio-mono" aria-hidden="true">
            {hasExtension ? `.${fileExt}` : 'file'}
          </span>
          <div className="min-w-0">
            <p className="sio-h3 [overflow-wrap:anywhere]">{file.name}</p>
            {uploadedLabel && (
              <p className="sio-small sio-text-muted mt-1">
                Uploaded {uploadedLabel}
              </p>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="py-6">
          {passwordRequired && !accessGranted ? (
            <form onSubmit={handlePasswordSubmit}>
              <p className="sio-text-muted sio-prose">
                This file is password protected. Ask the sender for the password.
              </p>

              <label htmlFor="file-password" className="sio-small sio-text-muted mb-2 mt-5 block">
                Password
              </label>
              <input
                id="file-password"
                type="password"
                autoComplete="off"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="sio-input"
                aria-invalid={Boolean(passwordError)}
                aria-describedby={passwordError ? 'password-error' : undefined}
                disabled={checking}
                required
              />

              {passwordError && (
                <p id="password-error" role="alert" className="sio-small sio-error mt-2">
                  {passwordError}
                </p>
              )}

              <button
                type="submit"
                className="sio-btn sio-btn-primary mt-5 w-full sm:w-auto"
                disabled={checking}
                aria-busy={checking}
              >
                {checking ? 'Checking…' : 'Unlock file'}
              </button>
            </form>
          ) : file.url ? (
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="sio-btn sio-btn-primary w-full sm:w-auto"
            >
              Download file
            </a>
          ) : (
            <p role="alert" className="sio-error">
              The file link is missing. Ask the sender to share it again.
            </p>
          )}
        </div>
      </div>

      <p className="sio-small sio-text-muted mt-8">
        Sent with{' '}
        <Link href="/" className="sio-link">
          Share.io
        </Link>
        . Share files with a link and an optional password.
      </p>
    </>
  );
}