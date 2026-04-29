import type { Metadata } from 'next';
import { Security } from '../../components/Security';
import { JsonLd } from '../../lib/schema';
import { buildHreflang, canonicalFor } from '../../lib/i18n';

const securityPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Security & Privacy | Direct Booking Health Score',
  url: 'https://directbookinghealthscore.com/security',
  description:
    'Security and privacy information for the Direct Booking Health Score hotel audit tool.',
  publisher: {
    '@type': 'Organization',
    name: 'Bookassist',
    url: 'https://bookassist.org',
  },
};

export const metadata: Metadata = {
  title: 'Security & Privacy | Direct Booking Health Score',
  description:
    'Security and privacy information for the Direct Booking Health Score hotel audit tool by Bookassist.',
  alternates: { canonical: canonicalFor('en', '/security'), languages: buildHreflang('/security') },
  openGraph: {
    title: 'Security & Privacy | Direct Booking Health Score',
    description: 'Security and privacy information for the Direct Booking Health Score audit tool.',
    url: 'https://directbookinghealthscore.com/security',
    siteName: 'Direct Booking Health Score',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function SecurityPage() {
  return (
    <>
      <JsonLd schema={securityPageSchema} />
      <Security />
    </>
  );
}
