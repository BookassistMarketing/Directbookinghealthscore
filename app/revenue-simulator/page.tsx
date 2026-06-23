import type { Metadata } from 'next';
import { RevenueSimulator } from '../../components/RevenueSimulator';
import { BASE_URL } from '../../lib/i18n';

// English-only for now. We do NOT emit hreflang alternates for other locales
// because there is no localised version of this page yet. /<locale>/revenue-simulator
// is redirected to /revenue-simulator by middleware.ts.
export const metadata: Metadata = {
  title: 'Direct Booking Revenue Simulator | Direct Booking Health Score',
  description:
    'Free interactive calculator. Enter the hotel’s annual online revenue and channel costs, then drag the slider to see the net revenue impact of moving more share to direct.',
  alternates: {
    canonical: `${BASE_URL}/revenue-simulator`,
    languages: {
      en: `${BASE_URL}/revenue-simulator`,
      'x-default': `${BASE_URL}/revenue-simulator`,
    },
  },
  openGraph: {
    title: 'Direct Booking Revenue Simulator',
    description:
      'Calculate the net revenue impact of moving more bookings direct. Free interactive sales tool.',
    url: `${BASE_URL}/revenue-simulator`,
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
  return <RevenueSimulator />;
}
