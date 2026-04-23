import type { Metadata } from 'next';
import { HomeClient } from '../components/HomeClient';
import { JsonLd, organizationSchema, webSiteSchema } from '../lib/schema';
import { getAllPosts } from '../lib/blog';

export const metadata: Metadata = {
  title: 'Direct Booking Health Score | Free Hotel Tech Audit',
  description:
    'The industry standard hotel technology audit. Assess your direct booking strategy, metasearch connectivity, and marketing ROI in under 3 minutes.',
  alternates: { canonical: 'https://directbookinghealthscore.com' },
  openGraph: {
    title: 'Direct Booking Health Score | Free Hotel Tech Audit',
    description:
      'Identify revenue leakage from OTAs. Free AI-powered audit of your hotel direct booking infrastructure.',
    url: 'https://directbookinghealthscore.com',
    siteName: 'Direct Booking Health Score',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Direct Booking Health Score | Free Hotel Tech Audit',
    description:
      'Identify revenue leakage from OTAs. Free AI-powered audit of your hotel direct booking infrastructure.',
  },
  robots: { index: true, follow: true },
};

export default function HomePage() {
  const recentEn = getAllPosts('en').slice(0, 3);
  const recentIt = getAllPosts('it').slice(0, 3);
  const recentEs = getAllPosts('es').slice(0, 3);
  const recentPl = getAllPosts('pl').slice(0, 3);

  return (
    <>
      <JsonLd schema={[organizationSchema, webSiteSchema]} />
      <HomeClient
        recentEn={recentEn}
        recentIt={recentIt}
        recentEs={recentEs}
        recentPl={recentPl}
      />
    </>
  );
}
