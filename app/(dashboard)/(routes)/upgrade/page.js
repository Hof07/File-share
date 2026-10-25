// app/(dashboard)/(routes)/upgrade/page.jsx

import { Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google';
import PricingCards from './_components/Card';

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

const STYLES = `
.sio-upgrade {
  --ink: #1A2030;
  --graphite: #525B68;

  color: var(--ink);
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.sio-upgrade .sio-h2 {
  font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif;
  font-weight: 650;
  font-size: clamp(1.875rem, 1.4rem + 2vw, 3rem);
  line-height: 1.08;
  letter-spacing: -0.025em;
}

.sio-upgrade .sio-lede {
  max-width: 58ch;
  color: var(--graphite);
}
`;

export default function UpgradePage() {
  return (
    <div className={`sio-upgrade ${displayFont.variable} ${bodyFont.variable}`}>
      <style>{STYLES}</style>

      <div className="mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <h1 className="sio-h2">Choose your plan</h1>
        <p className="sio-lede mt-4">Compare the plans below.</p>

        <div className="mt-12">
          <PricingCards />
        </div>
      </div>
    </div>
  );
}