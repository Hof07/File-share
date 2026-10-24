'use client';

/**
 * FilesPage (Share.io style)
 *
 * The signed-in user's uploads. Same design system as the rest of the app:
 * hairline rows instead of cards, one accent colour, 6px radius, left-aligned.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';
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
.sio-form .sio-text-signal { color: var(--signal); }
.sio-form .sio-rule { border-color: var(--rule); }
.sio-form .sio-rule-ink { border-color: var(--ink); }
.sio-form .sio-prose { max-width: 58ch; }
.sio-form .sio-small { font-size: 0.9375rem; line-height: 1.5; }
.sio-form .sio-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }

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
.sio-form .sio-btn-sm { min-height: 40px; padding: 0 16px; font-size: 0.9375rem; }
.sio-form .sio-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.sio-form .sio-text-btn {
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
.sio-form .sio-text-btn:hover { color: var(--signal); }
.sio-form .sio-text-btn-danger:hover { color: #B42318; }
.sio-form .sio-text-btn:disabled { opacity: 0.5; cursor: not-allowed; color: var(--graphite); }

.sio-form .sio-link {
  color: inherit;
  text-decoration: underline;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 4px;
}
.sio-form .sio-link:hover { color: var(--signal); }

.sio-form .sio-tag {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border: 1.5px solid var(--signal);
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--signal);
  vertical-align: middle;
}

.sio-form .sio-notice {
  padding: 12px 14px;
  border: 1.5px solid #B42318;
  border-radius: var(--radius);
  color: #B42318;
  font-size: 0.9375rem;
  line-height: 1.5;
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
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function extensionOf(name) {
  return name && name.includes('.') ? name.split('.').pop().toLowerCase() : '';
}

// The upload form stores the public URL, not the storage path, so the path is
// read back from the URL: .../object/public/uploads/<path>
function storagePath(file) {
  if (file.file_path) return file.file_path;
  try {
    const { pathname } = new URL(file.url);
    const marker = '/uploads/';
    const index = pathname.indexOf(marker);
    return index === -1
      ? null
      : decodeURIComponent(pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function FilesPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [notice, setNotice] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const copiedTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return undefined;

    if (!isSignedIn || !email) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function fetchFilesAndCheckSub() {
      setLoading(true);
      setNotice('');

      // Premium status
      const { data: subData, error: subError } = await supabase
        .from('payment_subscriptions')
        .select('id')
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle();

      if (cancelled) return;
      if (subError) {
        console.error('Subscription check error:', subError.message);
      } else {
        setIsPremium(Boolean(subData));
      }

      // Files, newest first. The password hash is dropped; only "protected" is kept.
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('email', email)
        .order('uploaded_at', { ascending: false });

      if (cancelled) return;
      if (error) {
        console.error('Files fetch error:', error.message);
        setNotice('Could not load your files. Try reloading the page.');
      } else {
        setFiles(
          (data || []).map(({ password, ...rest }) => ({
            ...rest,
            protected: Boolean(password),
          }))
        );
      }

      setLoading(false);
    }

    fetchFilesAndCheckSub();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, email]);

  /* ---- actions ---------------------------------------------------------- */

  const copyLink = async (file) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/f/${file.id}`);
      setCopiedId(file.id);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setNotice('Could not copy the link. Open the file and copy it from there.');
    }
  };

  const handleRemove = async (file) => {
    if (!user || !email || removingId) return;

    const confirmed = window.confirm(
      `Remove ${file.name}? Its share link will stop working.`
    );
    if (!confirmed) return;

    setRemovingId(file.id);
    setNotice('');

    try {
      const path = storagePath(file);

      if (path) {
        const { error: storageError } = await supabase.storage
          .from('uploads')
          .remove([path]);

        if (storageError) {
          console.error('Storage delete error:', storageError.message);
          setNotice(`Could not remove ${file.name}: ${storageError.message}`);
          return;
        }
      }

      const { error: deleteError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id)
        .eq('email', email);

      if (deleteError) {
        console.error('Delete error:', deleteError.message);
        setNotice(`Could not remove ${file.name}: ${deleteError.message}`);
        return;
      }

      // The file is gone, so take it off the list now. The counter below is
      // bookkeeping and must not leave a deleted file on screen if it fails.
      setFiles((previous) => previous.filter((f) => f.id !== file.id));

      const { data: userData, error: userError } = await supabase
        .from('user_uploads')
        .select('upload_count')
        .eq('id', user.id)
        .maybeSingle();

      if (userError) {
        console.error('Upload count fetch error:', userError.message);
      } else if (userData) {
        const newCount = Math.max((userData.upload_count || 1) - 1, 0);
        const { error: updateError } = await supabase
          .from('user_uploads')
          .update({ upload_count: newCount })
          .eq('id', user.id);

        if (updateError) {
          console.error('Upload count update error:', updateError.message);
        }
      }
    } finally {
      setRemovingId(null);
    }
  };

  /* ---- render ----------------------------------------------------------- */

  const shell = (content) => (
    <div className={`sio-form ${displayFont.variable} ${bodyFont.variable}`}>
      <style>{STYLES}</style>
      <div className="mx-auto w-full max-w-[1000px] px-5 py-10 sm:px-8 sm:py-14">
        {content}
      </div>
    </div>
  );

  if (!isLoaded) {
    return shell(
      <p role="status" className="sio-text-muted">
        Loading…
      </p>
    );
  }

  if (!isSignedIn) {
    return shell(
      <div>
        <h1 className="sio-h2">Your files</h1>
        <p className="sio-text-muted sio-prose mt-4">
          Sign in to see the files you have uploaded.
        </p>
        <div className="mt-8">
          <SignInButton mode="modal">
            <button type="button" className="sio-btn sio-btn-primary">
              Sign in
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return shell(
    <>
      {/* Header */}
      <header className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="sio-h2">
            Your files
            {isPremium && (
              <span className="sio-tag ml-4">Blaze</span>
            )}
          </h1>
          <p className="sio-text-muted mt-3">
            {loading
              ? 'Loading your files…'
              : `${files.length} ${pluralize(files.length, 'file', 'files')} uploaded${
                  user.firstName ? ` by ${user.firstName}` : ''
                }`}
          </p>
        </div>
        {/* <UserButton afterSignOutUrl="/" /> */}
      </header>

      {notice && (
        <p role="alert" className="sio-notice mt-6">
          {notice}
        </p>
      )}

      {/* List */}
      <div className="mt-10">
        {loading ? (
          <p role="status" className="sio-text-muted">
            Loading your files…
          </p>
        ) : files.length === 0 ? (
          <div className="sio-rule-ink border-y py-10">
            <h2 className="sio-h3">No files yet</h2>
            <p className="sio-text-muted sio-prose mt-2">
              Files you upload show up here, with their share links.
            </p>
            <Link href="/upload" className="sio-btn sio-btn-primary mt-6">
              Upload a file
            </Link>
          </div>
        ) : (
          <ul className="sio-rule-ink border-y">
            {files.map((file) => {
              const ext = extensionOf(file.name);
              const uploaded = formatDate(file.uploaded_at);
              const removing = removingId === file.id;

              return (
                <li
                  key={file.id}
                  className="sio-rule grid gap-4 border-b py-5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8"
                >
                  <div className="min-w-0">
                    <h2 className="sio-h3 truncate" title={file.name}>
                      {file.name}
                    </h2>
                    <p className="sio-small sio-text-muted mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                      {ext && <span className="sio-mono">.{ext}</span>}
                      {uploaded && <span>Uploaded {uploaded}</span>}
                      {file.protected && <span>Password protected</span>}
                    </p>
                    {file.random_id && (
                      <p className="sio-small sio-text-muted sio-mono mt-0.5">
                        ID:-  {file.random_id}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sio-btn sio-btn-primary sio-btn-sm"
                    >
                      Download
                    </a>
                    <button
                      type="button"
                      className="sio-text-btn"
                      onClick={() => copyLink(file)}
                    >
                      {copiedId === file.id ? 'Copied' : 'Copy link'}
                    </button>
                    <button
                      type="button"
                      className="sio-text-btn sio-text-btn-danger"
                      onClick={() => handleRemove(file)}
                      disabled={removing}
                      aria-label={`Remove ${file.name}`}
                    >
                      {removing ? 'Removing…' : 'Remove'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}