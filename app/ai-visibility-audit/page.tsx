import type { Metadata } from 'next';
import { AiAudit } from '../../components/AiAudit';
import { JsonLd, aiAuditSchema } from '../../lib/schema';
import { buildHreflang, canonicalFor } from '../../lib/i18n';

export const metadata: Metadata = {
  title: 'AI Visibility Audit for Hotels | Direct Booking Health Score',
  description:
    'Free AI Readiness Report for hotel websites. Paste your URL and see exactly how visible your site is to ChatGPT, Perplexity and Gemini — with a scored breakdown and recommended fixes.',
  alternates: { canonical: canonicalFor('en', '/ai-visibility-audit'), languages: buildHreflang('/ai-visibility-audit') },
  openGraph: {
    title: 'AI Visibility Audit for Hotels',
    description:
      'How visible is your hotel to AI search? Get a structured AI Readiness Report in under a minute.',
    url: 'https://directbookinghealthscore.com/ai-visibility-audit',
    siteName: 'Direct Booking Health Score',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Visibility Audit for Hotels',
    description: 'How visible is your hotel to AI search? Get a structured AI Readiness Report.',
  },
  robots: { index: true, follow: true },
};

export default function AiVisibilityAuditPage() {
  return (
    <>
      <JsonLd schema={aiAuditSchema} />
      <AiAudit />
    </>
  );
}
