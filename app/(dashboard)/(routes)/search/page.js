'use client';

/**
 * Search (Share.io style)
 *
 * Find a file by its 5-character code. Same design system as the rest of the
 * app: hairline rules, one accent colour, 6px radius, left-aligned.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google';
import { supabase } from '@/app/lib/superbaseClient';

const CODE_LENGTH = 5;

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
.sio-form {
  --paper: #FFFFFF;
  --ink: #1A2030;
  --graphite: #525B68;
  --rule: #CDD3D9;
  --signal: #2B3FE8;
  --signal-deep: #1F2FC4;
  --radius: 6px;

  color: var(--ink);
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.sio-form .sio-text-muted { color: var(--graphite); }
.sio-form .sio-rule-ink { border-color: var(--ink); }
.sio-form .sio-prose { max-width: 58ch; }
.sio-form .sio-small { font-size: 0.9375rem; line-height: 1.5; }
.sio-form .sio-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.sio-form .sio-error { color: #B42318; }

.sio-form .sio-h2 {
  font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif;
  font-weight: 650;
  font-size: clamp(1.875rem, 1.4rem + 2vw, 3rem);
  line-height: 1.08;
  letter-spacing: -0.025em;
}

.sio-form .sio-h3 {
  font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif;
  font-weight: 600;
  font-size: 1.25rem;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.sio-form .sio-btn {
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
.sio-form .sio-btn-primary { background: var(--signal); color: #FFFFFF; }
.sio-form .sio-btn-primary:hover { background: var(--signal-deep); }
.sio-form .sio-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.sio-form .sio-input {
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
.sio-form .sio-input:disabled { opacity: 0.5; cursor: not-allowed; }
.sio-form .sio-input[aria-invalid="true"] { border-color: #B42318; }
.sio-form .sio-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 1.25rem;
  letter-spacing: 0.2em;
}

.sio-form :focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .sio-form * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
`;

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

function Search() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [fileId, setFileId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    // Whitespace (for example from a paste) is dropped silently. Anything else
    // that isn't a letter or number is removed, with a short explanation.
    const raw = event.target.value.replace(/\s/g, '');
    const cleaned = raw.replace(/[^A-Za-z0-9]/g, '');

    setCode(cleaned.slice(0, CODE_LENGTH));
    setError(
      cleaned.length !== raw.length ? 'Codes use only letters and numbers.' : ''
    );
    setFileId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    setError('');
    setFileId(null);

    if (code.length !== CODE_LENGTH) {
      setError(`Enter the full ${CODE_LENGTH}-character code.`);
      return;
    }

    setLoading(true);

    try {
      // Only the id is needed. The file's URL and password hash stay on the server.
      const { data, error: searchError } = await supabase
        .from('files')
        .select('id')
        .eq('random_id', code)
        .maybeSingle();

      if (searchError) {
        setError('Something went wrong. Please try again.');
      } else if (!data) {
        setError('No file matches that code. Check it and try again.');
      } else {
        setFileId(data.id);
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className={`sio-form ${displayFont.variable} ${bodyFont.variable}`}>
      <style>{STYLES}</style>

      <div className="mx-auto w-full max-w-[560px] px-5 py-10 sm:px-8 sm:py-16">
        <h1 className="sio-h2">Find a file</h1>
        <p className="sio-text-muted sio-prose mt-4">
          Enter the {CODE_LENGTH}-character code the sender gave you.
        </p>

        <form onSubmit={handleSubmit} className="mt-8" noValidate>
          <label htmlFor="file-code" className="sio-small sio-text-muted mb-2 block">
            File code
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="file-code"
              type="text"
              value={code}
              onChange={handleChange}
              placeholder="A1b2C"
              maxLength={CODE_LENGTH}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="sio-input sio-code min-w-0 flex-1"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'code-error' : 'code-hint'}
              disabled={loading}
            />
            <button
              type="submit"
              className="sio-btn sio-btn-primary sm:w-[140px]"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? 'Searching…' : 'Find file'}
            </button>
          </div>

          {error ? (
            <p id="code-error" role="alert" className="sio-small sio-error mt-2">
              {error}
            </p>
          ) : (
            <p id="code-hint" className="sio-small sio-text-muted mt-2">
              Letters and numbers. Upper and lower case count as different.
            </p>
          )}
        </form>

        {fileId && (
          <div
            role="status"
            className="sio-rule-ink mt-10 flex flex-col gap-4 border-y py-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <h2 className="sio-h3">File found</h2>
            <Link href={`/f/${fileId}`} className="sio-btn sio-btn-primary">
              Open file
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;