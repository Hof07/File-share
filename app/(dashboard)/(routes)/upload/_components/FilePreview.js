'use client';

/**
 * FilePreview (Share.io style)
 *
 * The page an owner sees after uploading: share link, password, send by email.
 * Same design system as the landing page and upload form: hairline rows (the
 * same pattern as the Features section), one accent colour, 6px radius, no cards.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google';
import { supabase } from '@/app/lib/superbaseClient';
import { renderShareEmail } from '@/app/actions/renderShareEmail';

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

// Set NEXT_PUBLIC_SITE_URL in your env. The fallback is your current deployment.
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://file-share-seven-silk.vercel.app'
).replace(/\/$/, '');

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
/*  Styles (same tokens and class names as the landing page)                  */
/* -------------------------------------------------------------------------- */

const STYLES = `
.sio-form {
  --paper: #FFFFFF;
  --ink: #1A2030;
  --graphite: #525B68;
  --rule: #CDD3D9;
  --signal: #2B3FE8;
  --signal-deep: #1F2FC4;
  --signal-wash: #E9ECFD;
  --radius: 6px;

  color: var(--ink);
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.sio-form .sio-text-muted { color: var(--graphite); }
.sio-form .sio-rule { border-color: var(--rule); }
.sio-form .sio-rule-ink { border-color: var(--ink); }
.sio-form .sio-prose { max-width: 58ch; }
.sio-form .sio-small { font-size: 0.9375rem; line-height: 1.5; }
.sio-form .sio-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }

.sio-form .sio-h2 {
  font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif;
  font-weight: 650;
  font-size: clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem);
  line-height: 1.1;
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
.sio-form .sio-btn-ghost { background: transparent; color: var(--ink); border-color: var(--ink); }
.sio-form .sio-btn-ghost:hover { background: var(--ink); color: #FFFFFF; }
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
.sio-form .sio-text-btn:disabled { opacity: 0.5; cursor: not-allowed; color: var(--graphite); }

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
.sio-form .sio-input[readonly] { background: transparent; }

.sio-form :focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}

/* File preview: image, or the file extension when it isn't an image */
.sio-preview {
  display: flex;
  width: 100%;
  max-width: 240px;
  aspect-ratio: 1 / 1;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--paper);
  border: 1px solid var(--rule);
  border-radius: var(--radius);
}
.sio-preview img { width: 100%; height: 100%; object-fit: contain; }
.sio-ext {
  padding: 8px 14px;
  border: 1.5px solid var(--ink);
  border-radius: var(--radius);
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
}

@media (prefers-reduced-motion: reduce) {
  .sio-form * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
`;

/* -------------------------------------------------------------------------- */
/*  Layout pieces                                                             */
/* -------------------------------------------------------------------------- */

const CONTAINER = 'mx-auto w-full max-w-[1000px] px-5 py-10 sm:px-8 sm:py-14';

// One row: title on the left, content on the right. Hairline rules between rows.
function Row({ title, hint, last = false, children }) {
  return (
    <section
      className={`sio-rule-ink grid gap-3 border-t py-6 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-8 ${
        last ? 'border-b' : ''
      }`}
    >
      <div>
        <h3 className="sio-h3">{title}</h3>
        {hint && <p className="sio-small sio-text-muted mt-1">{hint}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

function FilePreview() {
  const { fileid } = useParams();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageFailed, setImageFailed] = useState(false);

  const [hasPassword, setHasPassword] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [removingPassword, setRemovingPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [sendingMail, setSendingMail] = useState(false);

  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef(null);

  const shareUrl = `${SITE_URL}/f/${fileid}`;

  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  useEffect(() => {
    async function fetchFile() {
      setLoading(true);
      setError('');
      setImageFailed(false);

      try {
        const { data, error: fetchError } = await supabase
          .from('files')
          .select('*')
          .eq('id', fileid)
          .single();

        if (fetchError || !data) {
          setError('File not found.');
          setFile(null);
        } else {
          setFile(data);
          setHasPassword(Boolean(data.password));
          setEditingPassword(false);
          setPassword('');
        }
      } catch (e) {
        setError('Something went wrong. Try reloading the page.');
        setFile(null);
      }

      setLoading(false);
    }

    if (fileid) fetchFile();
  }, [fileid]);

  /* ---- share link ------------------------------------------------------- */

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy. Select the link and copy it manually.');
    }
  };

  /* ---- password --------------------------------------------------------- */

  const savePassword = async () => {
    if (!password) {
      toast.error('Enter a password.');
      return;
    }

    setSavingPassword(true);
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const { error: updateError } = await supabase
        .from('files')
        .update({ password: hashedPassword })
        .eq('id', fileid);

      if (updateError) {
        toast.error(`Could not save the password: ${updateError.message}`);
      } else {
        toast.success('Password saved.');
        setHasPassword(true);
        setEditingPassword(false);
        setPassword('');
      }
    } catch (err) {
      toast.error('Could not save the password.');
    }
    setSavingPassword(false);
  };

  const removePassword = async () => {
    const confirmed = window.confirm(
      'Remove the password? Anyone with the link will be able to open this file.'
    );
    if (!confirmed) return;

    setRemovingPassword(true);
    try {
      const { error: updateError } = await supabase
        .from('files')
        .update({ password: null })
        .eq('id', fileid);

      if (updateError) {
        toast.error(`Could not remove the password: ${updateError.message}`);
      } else {
        toast.success('Password removed.');
        setHasPassword(false);
        setEditingPassword(false);
        setPassword('');
      }
    } catch (err) {
      toast.error('Could not remove the password.');
    }
    setRemovingPassword(false);
  };

  const cancelPasswordEdit = () => {
    setEditingPassword(false);
    setPassword('');
  };

  /* ---- send by email ---------------------------------------------------- */

  const sendEmail = async (event) => {
    event.preventDefault();

    const recipient = email.trim();
    if (!EMAIL_PATTERN.test(recipient)) {
      toast.error('Enter a valid email address.');
      return;
    }
    if (!file) {
      toast.error('File data is missing.');
      return;
    }

    setSendingMail(true);

    try {
      const html = await renderShareEmail({
        fileName: file.name,
        fileId: fileid,
        passwordProtected: hasPassword,
      });

      const text = [
        `File shared: ${file.name}`,
        `Download: ${shareUrl}`,
        hasPassword
          ? 'This file is password protected. The sender will give you the password separately.'
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      const res = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          subject: `File shared: ${file.name}`,
          html,
          text,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to send email');

      toast.success('Email sent.');
      setEmail('');
    } catch (err) {
      toast.error(`Could not send the email: ${err.message}`);
    } finally {
      setSendingMail(false);
    }
  };

  /* ---- render ----------------------------------------------------------- */

  const shell = (content) => (
    <div className={`sio-form ${displayFont.variable} ${bodyFont.variable}`}>
      <style>{STYLES}</style>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className={CONTAINER}>{content}</div>
    </div>
  );

  if (loading) {
    return shell(
      <p role="status" className="sio-text-muted">
        Loading file…
      </p>
    );
  }

  if (error || !file) {
    return shell(
      <div role="alert">
        <h2 className="sio-h2">{error || 'File not found.'}</h2>
        <p className="sio-text-muted sio-prose mt-4">
          Check the link, or go back to your uploads.
        </p>
      </div>
    );
  }

  const hasExtension = file.name.includes('.');
  const fileExt = hasExtension ? file.name.split('.').pop().toLowerCase() : '';
  const isImage = IMAGE_EXTENSIONS.includes(fileExt);

  const uploadedAt = new Date(file.uploaded_at);
  const uploadedLabel = Number.isNaN(uploadedAt.getTime())
    ? null
    : uploadedAt.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

  return shell(
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      {/* Left: what was uploaded */}
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <div className="sio-preview">
            {isImage && !imageFailed ? (
              <img
                src={file.url}
                alt={file.name}
                onError={() => setImageFailed(true)}
              />
            ) : (
              <span className="sio-ext sio-mono" aria-hidden="true">
                {hasExtension ? `.${fileExt}` : 'file'}
              </span>
            )}
          </div>

          <h2 className="sio-h2 mt-6 [overflow-wrap:anywhere]">{file.name}</h2>
          {uploadedLabel && (
            <p className="sio-small sio-text-muted mt-2">
              Uploaded {uploadedLabel}
            </p>
          )}
        </div>
      </div>

      {/* Right: what you can do with it */}
      <div className="lg:col-span-8">
        <Row title="Share link" hint="Anyone with this link can open the file page.">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              readOnly
              value={shareUrl}
              aria-label="Share link"
              className="sio-input sio-mono min-w-0 flex-1 text-[0.9375rem]"
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              className="sio-btn sio-btn-primary sm:w-[120px]"
              onClick={copyLink}
            >
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </Row>

        <Row
          title="Password"
          hint="Optional. Send it separately from the link."
        >
          {hasPassword && !editingPassword && (
            <div>
              <p>
                Password protection is on. Anyone opening the link has to enter
                it first.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
                <button
                  type="button"
                  className="sio-text-btn"
                  onClick={() => setEditingPassword(true)}
                  disabled={removingPassword}
                >
                  Change password
                </button>
                <button
                  type="button"
                  className="sio-text-btn"
                  onClick={removePassword}
                  disabled={removingPassword}
                >
                  {removingPassword ? 'Removing…' : 'Remove password'}
                </button>
              </div>
            </div>
          )}

          {!hasPassword && !editingPassword && (
            <div>
              <p className="sio-text-muted">
                This file has no password. Anyone with the link can open it.
              </p>
              <button
                type="button"
                className="sio-btn sio-btn-ghost mt-4"
                onClick={() => setEditingPassword(true)}
              >
                Add a password
              </button>
            </div>
          )}

          {editingPassword && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                savePassword();
              }}
            >
              <label htmlFor="file-password" className="sio-small sio-text-muted mb-2 block">
                {hasPassword ? 'New password' : 'Password'}
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="file-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="sio-input min-w-0 flex-1"
                  disabled={savingPassword}
                />
                <button
                  type="submit"
                  className="sio-btn sio-btn-primary sm:w-[120px]"
                  disabled={savingPassword}
                >
                  {savingPassword ? 'Saving…' : 'Save'}
                </button>
              </div>
              <button
                type="button"
                className="sio-text-btn mt-1"
                onClick={cancelPasswordEdit}
                disabled={savingPassword}
              >
                Cancel
              </button>
            </form>
          )}
        </Row>

        <Row
          title="Send by email"
          hint="We email the link for you."
        >
          <form onSubmit={sendEmail}>
            <label htmlFor="recipient-email" className="sio-small sio-text-muted mb-2 block">
              Recipient's email
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="recipient-email"
                type="email"
                autoComplete="off"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="sio-input min-w-0 flex-1"
                disabled={sendingMail}
              />
              <button
                type="submit"
                className="sio-btn sio-btn-primary sm:w-[120px]"
                disabled={sendingMail}
                aria-busy={sendingMail}
              >
                {sendingMail ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        </Row>

        <Row title="File ID" hint="For support requests." last>
          <input
            type="text"
            readOnly
            value={file.random_id ?? ''}
            aria-label="File ID"
            className="sio-input sio-mono text-[0.9375rem]"
            onFocus={(e) => e.target.select()}
          />
        </Row>
      </div>
    </div>
  );
}

export default FilePreview;