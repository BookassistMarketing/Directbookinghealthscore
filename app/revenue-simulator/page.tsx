import type { Metadata } from 'next';
import { RevenueSimulator } from '../../components/RevenueSimulator';
import { JsonLd, softwareApplicationSchema, serviceSchema } from '../../lib/schema';
import { buildHreflang, canonicalFor } from '../../lib/i18n';

// English (default-locale) entry. Localised versions live under
// app/[lang]/revenue-simulator; hreflang alternates point at all locales.
export const metadata: Metadata = {
  title: 'Direct Booking Revenue Simulator | Direct Booking Health Score',
  description:
    'Free interactive calculator. Enter the hotel’s annual online revenue and channel costs, then drag the slider to see the net revenue impact of moving more share to direct.',
  alternates: {
    canonical: canonicalFor('en', '/revenue-simulator'),
    languages: buildHreflang('/revenue-simulator'),
  },
  openGraph: {
    title: 'Direct Booking Revenue Simulator',
    description:
      'Calculate the net revenue impact of moving more bookings direct. Free interactive sales tool.',
    url: canonicalFor('en', '/revenue-simulator'),
    siteName: 'Direct Booking Health Score',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Direct Booking Revenue Simulator',
    description: 'Calculate the net revenue impact of moving more bookings direct.',
  },
  robots: { index: true, follow: true },
};

export default function RevenueSimulatorPage() {
  return (
    <>
      <JsonLd schema={[softwareApplicationSchema, serviceSchema]} />
      <RevenueSimulator />
    </>
  );
}
