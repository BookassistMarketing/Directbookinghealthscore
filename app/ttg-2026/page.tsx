import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { TtgStandAudit } from '../../components/TtgStandAudit';
import './ttg.css';

// Hidden stand page for TTG Travel Experience 2026 (Rimini, 14 to 16 Oct).
// Runs on Susanna's iPad: the hotelier fills in the HubSpot form, Fabien gets
// the notification, runs the AI Visibility Audit in staff mode and sends the PDF.
// Not linked anywhere, not in the sitemap, noindex. Italian only.

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--ttg-head',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TTG 2026 · Audit gratuito',
  robots: { index: false, follow: false },
};

export default function TtgStandPage() {
  return (
    <div className={montserrat.variable}>
      <TtgStandAudit />
    </div>
  );
}
