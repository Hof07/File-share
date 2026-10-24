'use client';

/**
 * UploadForm (Share.io style)
 *
 * Same design system as the landing page: hairline rules, one accent colour,
 * 6px radius, no cards, left-aligned, sentence case.
 *
 * Also picks up files handed over from the landing page dropzone
 * (`window.__shareioPendingFiles`).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/app/lib/superbaseClient';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import JSZip from 'jszip';
import { useUser } from '@clerk/nextjs';
import { Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google';
import generateCode from '@/app/_components/generateCode';
import { MagneticDropZone } from '@/components/MagneticDropZone';

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

const MAX_FILE_SIZE = 2 * 1024 * 1024; // free plan limit per file
const BUCKET = 'uploads';

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

.sio-form :focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}

.sio-form .sio-check {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  accent-color: var(--signal);
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

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  const rounded =
    exponent === 0
      ? Math.round(value)
      : Number(value.toFixed(value >= 10 ? 0 : 1));
  return `${rounded} ${units[exponent]}`;
}

function fileKey(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}

// Supabase storage keys reject many characters (spaces, unicode, slashes).
function safeStorageName(name) {
  return name
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '_')
    .slice(-120);
}

function cleanZipName(name) {
  return name
    .trim()
    .replace(/\.zip$/i, '')
    .replace(/[^\w\- ]+/g, '_')
    .trim();
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

function UploadForm({ onUploadSuccess }) {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  const [files, setFiles] = useState([]);
  const [asZip, setAsZip] = useState(true);
  const [zipName, setZipName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null); // { count, url }
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef(null);

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const willZip = files.length > 1 && asZip;

  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  /* ---- adding / removing files ------------------------------------------ */

  const addFiles = useCallback((incoming) => {
    const list = Array.from(incoming || []);
    const tooBig = list.filter((file) => file.size > MAX_FILE_SIZE);
    const ok = list.filter((file) => file.size <= MAX_FILE_SIZE);

    if (tooBig.length > 0) {
      const label =
        tooBig.length === 1 ? tooBig[0].name : `${tooBig.length} files`;
      toast.error(`${label} over ${formatBytes(MAX_FILE_SIZE)} and skipped.`);
    }
    if (ok.length === 0) return;

    setFiles((previous) => {
      const seen = new Set(previous.map(fileKey));
      return [...previous, ...ok.filter((file) => !seen.has(fileKey(file)))];
    });
    setResult(null);
  }, []);

  // Pick up files handed over from the landing page dropzone.
  useEffect(() => {
    const pending = window.__shareioPendingFiles;
    if (Array.isArray(pending) && pending.length > 0) {
      delete window.__shareioPendingFiles;
      addFiles(pending);
    }
  }, [addFiles]);

  const removeFile = (key) => {
    setFiles((previous) => previous.filter((file) => fileKey(file) !== key));
  };

  /* ---- uploading -------------------------------------------------------- */

  // Uploads one file or blob to storage, then records it in the `files` table.
  // Returns the public URL, or null if anything failed.
  const storeFile = async (body, displayName) => {
    const storageName = `${Date.now()}_${safeStorageName(displayName)}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storageName, body);

    if (uploadError) {
      toast.error(`Upload failed: ${uploadError.message}`);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storageName);
    const publicURL = publicData.publicUrl;

    const { data, error } = await supabase
      .from('files')
      .insert([
        {
          name: displayName,
          url: publicURL,
          uploaded_at: new Date().toISOString(),
          email,
          random_id: generateCode(),
        },
      ])
      .select()
      .single();

    if (error) {
      // Don't leave an orphaned file in storage.
      await supabase.storage.from(BUCKET).remove([storageName]);
      toast.error(`Could not save ${displayName}: ${error.message}`);
      return null;
    }

    if (onUploadSuccess) {
      setTimeout(() => {
        onUploadSuccess(data.id);
      }, 4000);
    }

    return publicURL;
  };

  const buildZip = async () => {
    const zip = new JSZip();
    const used = new Map();

    files.forEach((file) => {
      const count = used.get(file.name) || 0;
      used.set(file.name, count + 1);
      // Two files with the same name would overwrite each other in the ZIP.
      const entry =
        count === 0
          ? file.name
          : file.name.replace(/(\.[^./]*)?$/, `-${count}$1`);
      zip.file(entry, file);
    });

    return zip.generateAsync({ type: 'blob' });
  };

  const handleUpload = async () => {
    if (files.length === 0 || uploading) return;

    if (!email) {
      toast.error('Sign in to upload files.');
      return;
    }

    const zipBase = cleanZipName(zipName);
    if (willZip && !zipBase) {
      toast.error('Enter a name for the ZIP file.');
      return;
    }

    setUploading(true);

    try {
      if (willZip) {
        const blob = await buildZip();
        const url = await storeFile(blob, `${zipBase}.zip`);

        if (url) {
          setResult({ count: 1, url });
          setFiles([]);
          setZipName('');
          toast.success('ZIP file uploaded.');
        }
      } else {
        const done = new Set();
        const urls = [];

        for (const file of files) {
          const url = await storeFile(file, file.name);
          if (url) {
            urls.push(url);
            done.add(fileKey(file));
          }
        }

        // Keep only the files that failed, so a retry won't upload twice.
        setFiles((previous) => previous.filter((f) => !done.has(fileKey(f))));

        if (done.size === files.length) {
          setResult({
            count: urls.length,
            url: urls.length === 1 ? urls[0] : null,
          });
          toast.success(
            urls.length === 1 ? 'File uploaded.' : 'All files uploaded.'
          );
        } else if (done.size > 0) {
          const failed = files.length - done.size;
          toast.error(
            `${failed} ${pluralize(failed, 'file', 'files')} failed. ${
              failed === 1 ? 'It is' : 'They are'
            } still in the list.`
          );
        }
      }
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const copyLink = async () => {
    if (!result?.url) return;
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy. Select the link and copy it manually.');
    }
  };

  const uploadMore = () => {
    setResult(null);
    setCopied(false);
  };

  /* ---- render ----------------------------------------------------------- */

  return (
    <div className={`sio-form ${displayFont.variable} ${bodyFont.variable}`}>
      <style>{STYLES}</style>
      <ToastContainer position="top-center" />

      <div className="mx-auto w-full max-w-[720px] px-5 py-10 sm:px-8 sm:py-14">
        {result ? (
          <section aria-labelledby="done-title" role="status">
            <h2 id="done-title" className="sio-h2">
              {result.count === 1 ? 'Your file is uploaded' : `${result.count} files uploaded`}
            </h2>

            {result.url ? (
              <>
                <p className="sio-text-muted sio-prose mt-4">
                  Copy the link and send it. If you added a password, send that
                  in a separate message.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <input
                    readOnly
                    value={result.url}
                    aria-label="Share link"
                    className="sio-input sio-mono min-w-0 flex-1 text-[0.9375rem]"
                    onFocus={(event) => event.target.select()}
                  />
                  <button
                    type="button"
                    className="sio-btn sio-btn-primary sm:w-[120px]"
                    onClick={copyLink}
                  >
                    {copied ? 'Copied' : 'Copy link'}
                  </button>
                </div>
              </>
            ) : (
              <p className="sio-text-muted sio-prose mt-4">
                Each file has its own link in your file list.
              </p>
            )}

            <div className="mt-8">
              <button type="button" className="sio-btn sio-btn-ghost" onClick={uploadMore}>
                Upload more files
              </button>
            </div>
          </section>
        ) : (
          <>
            <header>
              <h2 className="sio-h2">Upload files</h2>
              <p className="sio-text-muted sio-prose mt-4">
                Add your files, then upload to get a link you can share. Each
                file can be up to {formatBytes(MAX_FILE_SIZE)}.
              </p>
            </header>

            <div className="mt-8">
              <MagneticDropZone
                multiple
                maxSize={MAX_FILE_SIZE}
                disabled={uploading}
                onFilesChange={addFiles}
              />
            </div>

            {files.length > 0 && (
              <section className="mt-10" aria-labelledby="queue-title">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 id="queue-title" className="sio-h3">
                    Ready to upload
                  </h3>
                  <p className="sio-small sio-text-muted">
                    {files.length} {pluralize(files.length, 'file', 'files')},{' '}
                    {formatBytes(totalSize)}
                  </p>
                </div>

                <ul className="sio-rule mt-4 max-h-[320px] overflow-y-auto border-t">
                  {files.map((file) => {
                    const key = fileKey(file);
                    return (
                      <li
                        key={key}
                        className="sio-rule flex min-h-[52px] items-center justify-between gap-4 border-b"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[1rem] font-medium" title={file.name}>
                            {file.name}
                          </p>
                          <p className="sio-small sio-text-muted">
                            {formatBytes(file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="sio-text-btn shrink-0"
                          aria-label={`Remove ${file.name}`}
                          disabled={uploading}
                          onClick={() => removeFile(key)}
                        >
                          Remove
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {files.length > 1 && (
                  <div className="mt-6 space-y-4">
                    <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        className="sio-check"
                        checked={asZip}
                        onChange={() => setAsZip((value) => !value)}
                        disabled={uploading}
                      />
                      <span className="font-medium">Upload as one ZIP file</span>
                    </label>

                    {asZip && (
                      <div className="max-w-[420px]">
                        <label htmlFor="zip-name" className="sio-small sio-text-muted mb-2 block">
                          ZIP file name
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            id="zip-name"
                            type="text"
                            className="sio-input"
                            placeholder="project-files"
                            value={zipName}
                            onChange={(event) => setZipName(event.target.value)}
                            disabled={uploading}
                            autoComplete="off"
                          />
                          <span className="sio-text-muted sio-mono shrink-0 text-[0.9375rem]">
                            .zip
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <button
                    type="button"
                    className="sio-btn sio-btn-primary w-full sm:w-auto"
                    onClick={handleUpload}
                    disabled={uploading}
                    aria-busy={uploading}
                  >
                    {uploading
                      ? 'Uploading…'
                      : willZip
                        ? 'Upload as ZIP'
                        : `Upload ${files.length} ${pluralize(files.length, 'file', 'files')}`}
                  </button>
                  <button
                    type="button"
                    className="sio-text-btn"
                    onClick={() => setFiles([])}
                    disabled={uploading}
                  >
                    Clear all
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UploadForm;