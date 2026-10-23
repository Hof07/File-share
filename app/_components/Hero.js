"use client";

/**
 * Share.io landing page
 *
 * Design notes (so future edits stay consistent):
 * - One accent colour (--signal). Dark section uses --night, never pure black.
 * - One radius (6px) for controls and the dropzone. Cards are not used; structure
 *   comes from hairline rules between rows.
 * - Two typefaces: Bricolage Grotesque (display) and Hanken Grotesk (body).
 * - Motion: one hero entrance sequence, plus responses to user actions
 *   (dragging a file, adding/removing a file, opening a FAQ). Nothing else moves.
 * - No fake numbers, testimonials, addresses or phone numbers. Every claim on the
 *   page comes from what the product actually does.
 *
 * Hand-off from the hero dropzone:
 * The files picked here are placed on `window.__shareioPendingFiles` and the user
 * is sent to /upload. Read that value on the upload page (see bottom of this file).
 */

import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import "../globals.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import { Riffle } from "@lucasmarkes/hairline/react";
import PricingCards from "../(dashboard)/(routes)/upgrade/_components/Card";
import AuraCard from "./AURA";

/* -------------------------------------------------------------------------- */
/*  Fonts                                                                     */
/* -------------------------------------------------------------------------- */

const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const bodyFont = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const SUPPORT_EMAIL = "support@share.io";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const FEATURES = [
  {
    title: "Drag and drop uploads",
    body: "Drop files onto the page or pick them from your device. There is nothing to install.",
  },
  {
    title: "Optional passwords",
    body: "Add a password to any file. Anyone who opens the link has to enter it before they can download.",
  },
  {
    title: "Share by link",
    body: "Every upload gets a link you can paste into a chat, a ticket or an email.",
  },
  {
    title: "Send by email",
    body: "Type an address and Share.io emails the link for you, so you don't have to write the message yourself.",
  },
  {
    title: "Any file type",
    body: "Documents, images, video, code and archives all upload the same way.",
  },
  {
    title: "Stays up to date",
    body: "Your file list refreshes on its own. Sign-in, storage and live updates run on Supabase.",
  },
];

const FILE_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".xlsx",
  ".pptx",
  ".png",
  ".jpg",
  ".mp4",
  ".mov",
  ".zip",
  ".js",
  ".py",
  ".sql",
];

const STEPS = [
  {
    title: "Sign in",
    body: "Create an account or log in. Uploads belong to your account, so you can find and manage them later.",
  },
  {
    title: "Upload",
    body: "Drop your files on the upload page. If a file is sensitive, add a password before you continue.",
  },
  {
    title: "Share",
    body: "Copy the link, or enter an email address and let Share.io send it for you.",
  },
];

const FAQS = [
  {
    question: "Do I need an account?",
    answer:
      "Yes. You sign in before you upload. Once you're in, you can upload and share right away.",
  },
  {
    question: "Can I put a password on a file?",
    answer:
      "Yes, passwords are optional and set per file. Send the password separately from the link, for example in a different message.",
  },
  {
    question: "What file types can I upload?",
    answer:
      "Documents, images, video, code files, archives and most other formats.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "Free accounts have a limit per file. Blaze removes it. The pricing section above shows how the plans differ.",
  },
  {
    question: "How does the other person get the file?",
    answer:
      "You either copy the link and send it yourself, or enter their email address and Share.io sends it.",
  },
  {
    question: "Where are my files stored?",
    answer:
      "Accounts and storage are handled by Supabase. Password-protected files ask for the password before they open.",
  },
];

const FOOTER_GROUPS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    heading: "App",
    links: [
      { label: "Upload files", href: "/upload" },
      { label: "Upgrade to Blaze", href: "/upgrade" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Styles                                                                    */
/*  Tokens and the few shared classes live here so the markup below stays     */
/*  readable and every section pulls from the same system.                    */
/* -------------------------------------------------------------------------- */

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
  --night-text: #C9CFF2;
  --night-accent: #9FAAFF;
  --night-rule: #34417F;
  --radius: 6px;

  background: var(--chalk);
  color: var(--ink);
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}

/* Colour helpers */
.sio-bg-chalk { background: var(--chalk); }
.sio-bg-paper { background: var(--paper); }
.sio-bg-night { background: var(--night); color: #FFFFFF; }
.sio-text-muted { color: var(--graphite); }
.sio-text-signal { color: var(--signal); }
.sio-rule { border-color: var(--rule); }
.sio-rule-night { border-color: var(--night-rule); }
.sio-rule-ink { border-color: var(--ink); }

/* Type scale */
.sio-display { font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif; }

.sio-h1 {
  font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(2.5rem, 1.55rem + 4.4vw, 4.75rem);
  line-height: 1.02;
  letter-spacing: -0.035em;
}

.sio-h2 {
  font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif;
  font-weight: 650;
  font-size: clamp(1.875rem, 1.4rem + 2vw, 3rem);
  line-height: 1.08;
  letter-spacing: -0.025em;
}

.sio-h3 {
  font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif;
  font-weight: 600;
  font-size: 1.25rem;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.sio-lede {
  font-size: clamp(1.0625rem, 1rem + 0.3vw, 1.25rem);
  line-height: 1.55;
  max-width: 50ch;
}

.sio-prose { max-width: 58ch; }
.sio-small { font-size: 0.9375rem; line-height: 1.5; }

/* Links */
.sio-link {
  color: inherit;
  text-decoration: underline;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 4px;
}
.sio-link:hover { color: var(--signal); }

/* Buttons: two variants on light, one on dark. Same shape everywhere. */
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
.sio-btn-light { background: #FFFFFF; color: var(--night); }
.sio-btn-light:hover { background: var(--signal-wash); }
.sio-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Text-style button used for small actions inside the dropzone */
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

/* Focus is always visible, never removed */
.shareio :focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}
.sio-bg-night :focus-visible { outline-color: #FFFFFF; }

/* Skip link */
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

/* Dropzone */
.sio-drop {
  background: var(--paper);
  border: 1.5px dashed var(--ink);
  border-radius: var(--radius);
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.sio-drop[data-dragging="true"] {
  background: var(--signal-wash);
  border-style: solid;
  border-color: var(--signal);
}

/* FAQ built on native details/summary */
.sio-faq summary { list-style: none; cursor: pointer; }
.sio-faq summary::-webkit-details-marker { display: none; }
.sio-faq-mark {
  display: inline-block;
  font-size: 1.75rem;
  line-height: 1;
  font-weight: 400;
  transition: transform 0.2s ease;
}
.sio-faq details[open] .sio-faq-mark { transform: rotate(45deg); }

@media (prefers-reduced-motion: reduce) {
  .shareio * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
`;

/* -------------------------------------------------------------------------- */
/*  Layout constants                                                          */
/*  One container width and one section rhythm for the whole page.            */
/* -------------------------------------------------------------------------- */

const CONTAINER = "mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10";
const SECTION_SPACING = "py-16 sm:py-20 lg:py-28";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  const rounded = value >= 10 || exponent === 0 ? Math.round(value) : value.toFixed(1);
  return `${rounded} ${units[exponent]}`;
}

function fileKey(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}

/* -------------------------------------------------------------------------- */
/*  Small shared components                                                   */
/* -------------------------------------------------------------------------- */

function Logo({ onDark = false }) {
  return (
    <Link
      href="#top"
      className="inline-flex items-center gap-2.5 no-underline"
      aria-label="Share.io home"
      style={{ color: onDark ? "#FFFFFF" : "var(--ink)" }}
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="26" height="26" rx="6" fill={onDark ? "#FFFFFF" : "var(--signal)"} />
        <path
          d="M8 15.5 13 10l5 5.5"
          fill="none"
          stroke={onDark ? "var(--night)" : "#FFFFFF"}
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

function ButtonLink({ href, variant = "primary", children, className = "" }) {
  return (
    <Link href={href} className={`sio-btn sio-btn-${variant} ${className}`}>
      {children}
    </Link>
  );
}

function SectionHeading({ id, children, className = "" }) {
  return (
    <h2 id={id} className={`sio-h2 ${className}`}>
      {children}
    </h2>
  );
}

/* -------------------------------------------------------------------------- */
/*  Header                                                                    */
/* -------------------------------------------------------------------------- */

function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sio-bg-chalk sio-rule sticky top-0 z-50 border-b">
      <div className={`${CONTAINER} flex h-16 items-center justify-between`}>
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="sio-small font-medium no-underline hover:underline hover:underline-offset-4"
            >
              {item.label}
            </a>
          ))}
          <ButtonLink href="/upload" className="!min-h-[40px] !px-4 !text-[0.9375rem]">
            Open app
          </ButtonLink>
        </nav>

        <button
          type="button"
          className="sio-text-btn md:!hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="sio-bg-chalk sio-rule border-t md:hidden"
        >
          <ul className={`${CONTAINER} flex flex-col py-2`}>
            {NAV_LINKS.map((item) => (
              <li key={item.href} className="sio-rule border-b last:border-b-0">
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[52px] items-center text-[1.0625rem] font-medium no-underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="py-4">
              <ButtonLink href="/upload" className="w-full">
                Open app
              </ButtonLink>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero dropzone                                                             */
/*  A working file picker. It reads real File objects, lists them, lets the   */
/*  user remove them, then hands them to /upload.                             */
/* -------------------------------------------------------------------------- */

function Dropzone() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const inputId = useId();
  const titleId = useId();
  const inputRef = useRef(null);
  const dragDepth = useRef(0);

  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  const addFiles = useCallback((fileList) => {
    const incoming = Array.from(fileList || []);
    if (incoming.length === 0) return;
    setFiles((previous) => {
      const seen = new Set(previous.map(fileKey));
      const fresh = incoming.filter((file) => !seen.has(fileKey(file)));
      return [...previous, ...fresh];
    });
  }, []);

  const removeFile = useCallback((key) => {
    setFiles((previous) => previous.filter((file) => fileKey(file) !== key));
  }, []);

  const openPicker = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const handleInputChange = (event) => {
    addFiles(event.target.files);
    // Reset so choosing the same file again still fires onChange.
    event.target.value = "";
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const handleContinue = () => {
    // The upload page reads this value. See the note at the bottom of this file.
    if (files.length > 0) {
      window.__shareioPendingFiles = files;
    }
    router.push("/upload");
  };

  const rowMotion = reduceMotion
    ? {}
    : {
      initial: { opacity: 0, y: -6 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0 },
      transition: { duration: 0.18 },
    };

  return (
    <div
      role="group"
      aria-labelledby={titleId}
      className="sio-drop p-5 sm:p-7"
      data-dragging={dragging}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={handleInputChange}
      />

      <div className="flex items-baseline justify-between gap-4">
        <h2 id={titleId} className="sio-h3">
          {files.length === 0 ? "Add files" : "Ready to upload"}
        </h2>
        {files.length > 0 && (
          <p className="sio-small sio-text-muted">
            {files.length} {pluralize(files.length, "file", "files")},{" "}
            {formatBytes(totalSize)}
          </p>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {files.length} {pluralize(files.length, "file", "files")} selected
      </p>

      {files.length === 0 ? (
        <div className="mt-6">
          <p className="sio-small sio-text-muted max-w-[34ch]">
            Drag files into this box, or choose them from your device.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              type="button"
              className="sio-btn sio-btn-primary"
              onClick={openPicker}
            >
              Choose files
            </button>
            <Link href="/upload" className="sio-link sio-small font-medium">
              Go to the upload page
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <ul className="sio-rule max-h-[248px] overflow-y-auto border-t">
            <AnimatePresence initial={false}>
              {files.map((file) => {
                const key = fileKey(file);
                return (
                  <motion.li
                    key={key}
                    {...rowMotion}
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
                      onClick={() => removeFile(key)}
                    >
                      Remove
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="button"
              className="sio-btn sio-btn-primary"
              onClick={handleContinue}
            >
              Continue with {files.length} {pluralize(files.length, "file", "files")}
            </button>
            <button type="button" className="sio-text-btn" onClick={openPicker}>
              Add more
            </button>
            <button type="button" className="sio-text-btn" onClick={() => setFiles([])}>
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/*  The single orchestrated page-load moment lives here.                      */
/* -------------------------------------------------------------------------- */

function Hero() {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.1 } },
  };

  const item = {
    hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
<section
  aria-labelledby="hero-title"
  className="sio-rule border-b py-16 sm:py-20 lg:py-24"
  style={{
    background: "var(--chalk)",
    borderColor: "var(--rule)",
  }}
>
  <motion.div
    className={`${CONTAINER} grid items-center gap-10 lg:grid-cols-12 lg:gap-12`}
    variants={container}
    initial="hidden"
    animate="show"
  >
    {/* Left: Original typography preserved */}
    <div className="lg:col-span-7">
      <motion.p
        variants={item}
        className="mb-5 text-xs font-semibold uppercase tracking-[0.18em]"
        style={{ color: "var(--signal)" }}
      >
        File sharing, simplified
      </motion.p>

      <motion.h1
        id="hero-title"
        variants={item}
        className="sio-h1 max-w-[14ch]"
      >
        Send a file with a link. Lock it with a password.
      </motion.h1>

      <motion.p
        variants={item}
        className="sio-lede sio-text-muted mt-6 max-w-xl"
      >
        Upload your files, create a shareable link, and add password
        protection when you need it. Simple sharing, without the clutter.
      </motion.p>

      <motion.div
        variants={item}
        className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4"
      >
        <ButtonLink href="/upload">Upload a file</ButtonLink>

        <a href="#how-it-works" className="sio-link font-medium">
          See how it works
        </a>
      </motion.div>

      <motion.p
        variants={item}
        className="sio-small sio-text-muted mt-5"
      >
        You sign in once before uploading. Plans and limits are in the pricing section.
      </motion.p>
    </div>

    {/* Right: Riffle */}
    <motion.div
      variants={item}
      className="min-w-0 lg:col-span-5"
    >
      <div
        className="flex min-h-[520px] relative bottom-20 items-center justify-center overflow-hidden rounded-2xl border p-4 sm:min-h-[400px] sm:p-6"
        style={{
          background: "var(--paper)",
          borderColor: "var(--rule)",
          boxShadow: "0 16px 40px rgba(26, 32, 48, 0.05)",
        }}
      >
        <div className="w-full">
          <Riffle />
        </div>
      </div>
    </motion.div>
  </motion.div>
</section>

  );
}

/* -------------------------------------------------------------------------- */
/*  File types                                                                */
/* -------------------------------------------------------------------------- */

function FileTypes() {
  return (
    <section
      aria-labelledby="file-types-title"
      className="sio-bg-paper sio-rule border-b py-12 sm:py-16"
    >
      <div className={`${CONTAINER} grid gap-6 lg:grid-cols-12 lg:gap-10`}>
        <h2
          id="file-types-title"
          className="sio-h2 lg:col-span-7"
          style={{ fontSize: "clamp(1.625rem, 1.3rem + 1.4vw, 2.375rem)" }}
        >
          Spreadsheets, photos, video, archives and source code all go through the
          same upload.
        </h2>
        <p
          className="sio-text-muted text-[0.9375rem] leading-[2] lg:col-span-5"
          style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}
        >
          {FILE_EXTENSIONS.join("   ")}
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Features                                                                  */
/*  Heading on the left, rows on the right. Rules separate the rows.          */
/* -------------------------------------------------------------------------- */

function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className={`scroll-mt-16 ${SECTION_SPACING}`}
    >
      <div className={`${CONTAINER} grid gap-10 lg:grid-cols-12 lg:gap-10`}>
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionHeading id="features-title">What Share.io does</SectionHeading>
            <p className="sio-text-muted sio-prose mt-5">
              Upload, protect and send. Each step is one action, and you can skip the
              ones you don't need.
            </p>
          </div>
        </div>

        <ul className="lg:col-span-8">
          {FEATURES.map((feature, index) => (
            <li
              key={feature.title}
              className={`sio-rule-ink grid gap-2 border-t py-6 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:gap-8 ${index === FEATURES.length - 1 ? "border-b" : ""
                }`}
            >
              <h3 className="sio-h3">{feature.title}</h3>
              <p className="sio-text-muted max-w-[52ch]">{feature.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  How it works                                                              */
/*  Numbers are used here because the content is a real sequence.             */
/* -------------------------------------------------------------------------- */

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="scroll-mt-16 border-b py-20 sm:py-24 lg:py-28"
      style={{
        background: "var(--paper)",
        borderColor: "var(--rule)",
      }}
    >
      <div className={CONTAINER}>
        {/* Section heading */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p
              className="mb-4 text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--signal)" }}
            >
              Simple by design
            </p>

            <SectionHeading id="how-title">How it works</SectionHeading>

            <p className="sio-text-muted mt-4 max-w-lg text-base leading-7 sm:text-lg">
              From your device to someone else's, in three simple steps. No
              complicated setup. Just share.
            </p>
          </div>

          <span
            className="hidden pb-1 text-sm md:block"
            style={{ color: "var(--graphite)" }}
          >
            Upload. Share. Done.
          </span>
        </div>

        {/* Steps */}
        <ol className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="group relative rounded-xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:p-8"
              style={{
                background: "var(--chalk)",
                borderColor: "var(--rule)",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="flex size-10 items-center justify-center rounded-lg border text-sm font-semibold"
                  style={{
                    color: "var(--signal)",
                    background: "var(--paper)",
                    borderColor: "var(--rule)",
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span
                  className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: "var(--graphite)" }}
                >
                  Step {index + 1}
                </span>
              </div>

              <h3 className="sio-h3 mt-8">{step.title}</h3>

              <p className="sio-text-muted mt-3 max-w-sm text-sm leading-7 sm:text-base">
                {step.body}
              </p>

              <div
                className="mt-8 h-px w-full transition-colors duration-200 group-hover:bg-[var(--signal)]"
                style={{ background: "var(--rule)" }}
              />
            </li>
          ))}
        </ol>

        {/* CTA */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="sio-text-muted text-sm">Ready to share your first file?</p>

          <ButtonLink href="/upload">Start uploading</ButtonLink>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Riffle                                                                    */
/*  Same container and rhythm as the other sections. If Riffle breaks during  */
/*  server rendering, swap the import for next/dynamic with { ssr: false }.   */
/* -------------------------------------------------------------------------- */


function RiffleSection() {
  return (
    <section
      id="riffle"
      aria-label="Riffle"
      className={`sio-rule scroll-mt-16 border-b ${SECTION_SPACING}`}
      style={{
        background: "var(--chalk)",
        borderColor: "var(--rule)",
      }}
    >
      <div className={CONTAINER}>
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Left content */}
          <div className="max-w-lg">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium"
              style={{
                background: "var(--paper)",
                borderColor: "var(--rule)",
                color: "var(--signal)",
              }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: "var(--signal)" }}
              />
              Built for easy sharing
            </span>

            <h2
              className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
              style={{
                color: "var(--ink)",
                lineHeight: 1.1,
              }}
            >
              Sharing files,
              <br />
              <span style={{ color: "var(--signal)" }}>
                without the hassle.
              </span>
            </h2>

            <p
              className="mt-5 max-w-md text-base leading-7"
              style={{ color: "var(--graphite)" }}
            >
              A simpler way to send files. Create a shareable link,
              keep control of your files, and get them where they need
              to go.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Share files through a simple link",
                "Keep the experience clean and straightforward",
                "Spend less time managing file transfers",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full text-xs"
                    style={{
                      background: "var(--signal-wash)",
                      color: "var(--signal)",
                    }}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <span
                    className="text-sm leading-6"
                    style={{ color: "var(--ink)" }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="/upload"
              className="mt-9 inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-75"
              style={{ color: "var(--signal)" }}
            >
              Try Share.io
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          {/* Right visual */}
          <div className="min-w-0 lg:translate-x-4">
            <div
              className="overflow-hidden rounded-2xl border p-3 sm:p-5"
              style={{
                background: "var(--paper)",
                borderColor: "var(--rule)",
                boxShadow: "0 16px 48px rgba(26, 32, 48, 0.06)",
              }}
            >
              <Riffle />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


/* -------------------------------------------------------------------------- */
/*  Aura                                                                      */
/*  Your existing AuraCard, unchanged, given the same container and rhythm.   */
/* -------------------------------------------------------------------------- */

// function AuraSection() {
//   return (
//     <section id="aura" aria-label="Aura" className={`scroll-mt-16 ${SECTION_SPACING}`}>
//       <div className={CONTAINER}>
//         <AuraCard delay={0.2} />
//       </div>
//     </section>
//   );
// }

/* -------------------------------------------------------------------------- */
/*  Pricing                                                                   */
/* -------------------------------------------------------------------------- */

function Pricing() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className={`sio-bg-paper sio-rule scroll-mt-16 border-y ${SECTION_SPACING}`}
    >
      <div className={CONTAINER}>
        <div className="max-w-[640px]">
          <SectionHeading id="pricing-title">Pricing</SectionHeading>
          <p className="sio-text-muted sio-prose mt-5">
            Compare the plans below. Blaze removes the per-file size limit that applies
            to free accounts.
          </p>
        </div>

        <div className="mt-12">
          <PricingCards />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                       */
/*  Native <details> keeps this keyboard and screen-reader friendly with no   */
/*  extra state.                                                              */
/* -------------------------------------------------------------------------- */

function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className={`scroll-mt-16 ${SECTION_SPACING}`}
    >
      <div className={CONTAINER}>
        <SectionHeading id="faq-title">
          Questions people ask before uploading
        </SectionHeading>

        <div className="sio-faq mt-10 max-w-[820px] lg:mt-14">
          {FAQS.map((entry, index) => (
            <details
              key={entry.question}
              className={`sio-rule-ink border-t ${index === FAQS.length - 1 ? "border-b" : ""
                }`}
            >
              <summary className="flex min-h-[64px] items-center justify-between gap-6 py-4">
                <span className="sio-h3">{entry.question}</span>
                <span className="sio-faq-mark" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="sio-text-muted sio-prose pb-6 pr-10">{entry.answer}</p>
            </details>
          ))}
        </div>

        <p className="mt-10">
          Something else?{" "}
          <a className="sio-link font-semibold" href={`mailto:${SUPPORT_EMAIL}`}>
            Email {SUPPORT_EMAIL}
          </a>
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Closing call to action                                                    */
/* -------------------------------------------------------------------------- */

function ClosingCta() {
  return (
    <section
      aria-labelledby="closing-title"
      className="sio-rule-ink border-t-2 py-16 sm:py-20"
    >
      <div
        className={`${CONTAINER} flex flex-col items-start justify-between gap-8 md:flex-row md:items-center`}
      >
        <h2 id="closing-title" className="sio-h2 max-w-[18ch]">
          Got a file to send?
        </h2>
        <ButtonLink href="/upload">Upload a file</ButtonLink>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                    */
/* -------------------------------------------------------------------------- */

function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="sio-bg-night py-14 sm:py-16">
      <div className={CONTAINER}>
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Logo onDark />
            <p className="mt-5 max-w-[34ch]" style={{ color: "var(--night-text)" }}>
              File sharing with links, optional passwords and email delivery, built on
              Supabase.
            </p>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <nav
              key={group.heading}
              aria-label={group.heading}
              className="md:col-span-2"
            >
              <h2 className="sio-h3" style={{ fontSize: "1rem" }}>
                {group.heading}
              </h2>
              <ul className="mt-4 space-y-1">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-[40px] items-center no-underline hover:underline hover:underline-offset-4"
                      style={{ color: "var(--night-text)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="md:col-span-3">
            <h2 className="sio-h3" style={{ fontSize: "1rem" }}>
              Contact
            </h2>
            <p className="mt-4">
              <a
                className="sio-link"
                href={`mailto:${SUPPORT_EMAIL}`}
                style={{ color: "var(--night-text)" }}
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        </div>

        <div
          className="sio-rule-night mt-12 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
          style={{ color: "var(--night-text)" }}
        >
          <p className="sio-small">&copy; {year} Share.io</p>
          <a href="#top" className="sio-link sio-small">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function FullLandingPage() {
  // Overflow debugging. This used to run at module level, which crashes during
  // server rendering because `document` doesn't exist there. Inside an effect it
  // only runs in the browser. Delete this block once the layout is fixed.
  useEffect(() => {
    const vw = document.documentElement.clientWidth;
    console.log(
      "wider than viewport:",
      [...document.querySelectorAll("*")].filter(
        (el) => el.getBoundingClientRect().right > vw + 1
      )
    );
    console.log(
      "scroll containers:",
      [...document.querySelectorAll("*")].filter((el) => {
        const s = getComputedStyle(el);
        return /(auto|scroll)/.test(s.overflowX) && el.scrollWidth > el.clientWidth;
      })
    );
  }, []);

  return (
    <div
      id="top"
      className={`shareio ${displayFont.variable} ${bodyFont.variable}`}
    >
      <style>{STYLES}</style>

      <a href="#main" className="sio-skip">
        Skip to content
      </a>

      <SiteHeader />

      <main id="main">
        <Hero />
        <FileTypes />
        <Features />
        <HowItWorks />
        {/* <RiffleSection /> */}
        {/* <AuraSection /> */}
        {/* <Pricing /> */}
        <Faq />
        <ClosingCta />
      </main>

      <SiteFooter />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Using the hero hand-off on your /upload page                              */
/*                                                                            */
/*  In your upload component (client component), after mount:                 */
/*                                                                            */
/*    useEffect(() => {                                                       */
/*      const pending = window.__shareioPendingFiles;                         */
/*      if (pending && pending.length) {                                      */
/*        handleFiles(pending);          // your existing "files selected"    */
/*        window.__shareioPendingFiles = undefined;                           */
/*      }                                                                     */
/*    }, []);                                                                 */
/*                                                                            */
/*  This works for in-app navigation (router.push). If the user reloads       */
/*  /upload directly, there is nothing pending and the page behaves as usual. */
/* -------------------------------------------------------------------------- */