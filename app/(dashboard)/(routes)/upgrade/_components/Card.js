/**
 * PricingCards (Share.io style)
 *
 * Despite the name there are no cards: each plan is a column with a rule on top
 * and hairline rows, the same pattern as the Features section on the landing page.
 * Starter is marked with the accent colour on its top rule and a primary button.
 *
 * Self-contained: no styled-components, and it loads its own fonts and tokens, so it
 * looks the same on the landing page and on /upgrade.
 *
 * Place it where the old one was:
 *   app/(dashboard)/(routes)/upgrade/_components/Card.jsx
 */

import Link from 'next/link';
import { Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google';

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

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    duration: 'Lifetime',
    features: [
      'Single file upload',
      '2 MB upload limit',
      '5 file upload limit',
      'Sending shares by email not included',
    ],
    cta: 'Get started',
    href: '/upload',
    variant: 'ghost',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '49',
    duration: 'Lifetime',
    features: [
      'Multiple file upload',
      'Automatic ZIP conversion',
      'Unlimited file uploads',
      'Send shares by email',
    ],
    cta: 'Buy Starter',
    href: '/upgrade/buy?plan=starter',
    variant: 'primary',
    featured: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '120',
    duration: 'Lifetime',
    features: [
      'Everything in Starter',
      'No file size limit',
      'Golden name tag in shares',
      'Customizable share template',
    ],
    cta: 'Buy Premium',
    href: '/upgrade/buy?plan=premium',
    variant: 'ghost',
  },
];

const STYLES = `
.sio-plans {
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

.sio-plans .sio-text-muted { color: var(--graphite); }
.sio-plans .sio-small { font-size: 0.9375rem; line-height: 1.5; }

.sio-plans .sio-display {
  font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif;
}

.sio-plans .sio-h3 {
  font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif;
  font-weight: 600;
  font-size: 1.25rem;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.sio-plans .sio-plan {
  display: flex;
  flex-direction: column;
  border-top: 2px solid var(--ink);
  padding-top: 24px;
}
.sio-plans .sio-plan[data-featured="true"] { border-top: 4px solid var(--signal); }

.sio-plans .sio-feature {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-height: 52px;
  padding: 12px 0;
  border-bottom: 1px solid var(--rule);
}
.sio-plans .sio-feature svg { flex-shrink: 0; margin-top: 5px; }

.sio-plans .sio-btn {
  display: inline-flex;
  width: 100%;
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
.sio-plans .sio-btn-primary { background: var(--signal); color: #FFFFFF; }
.sio-plans .sio-btn-primary:hover { background: var(--signal-deep); }
.sio-plans .sio-btn-ghost { background: transparent; color: var(--ink); border-color: var(--ink); }
.sio-plans .sio-btn-ghost:hover { background: var(--ink); color: #FFFFFF; }

.sio-plans :focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .sio-plans * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
`;

function Check() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 8.5 6.5 12 13 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PricingCards() {
  return (
    <div className={`sio-plans ${displayFont.variable} ${bodyFont.variable}`}>
      <style>{STYLES}</style>

      <div className="grid gap-12 md:grid-cols-3 md:gap-8">
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className="sio-plan"
            data-featured={plan.featured ? 'true' : 'false'}
            aria-labelledby={`plan-${plan.id}`}
          >
            <h3 id={`plan-${plan.id}`} className="sio-h3">
              {plan.name}
            </h3>

            <p className="mt-4 flex items-baseline gap-2">
              <span
                className="sio-display text-[2.5rem] font-semibold leading-none tracking-[-0.02em]"
                aria-label={`${plan.price} rupees`}
              >
                ₹{plan.price}
              </span>
              <span className="sio-small sio-text-muted">{plan.duration}</span>
            </p>

            <ul className="mt-6 border-t" style={{ borderColor: 'var(--rule)' }}>
              {plan.features.map((feature) => (
                <li key={feature} className="sio-feature">
                  <Check />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link href={plan.href} className={`sio-btn sio-btn-${plan.variant}`}>
                {plan.cta}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}