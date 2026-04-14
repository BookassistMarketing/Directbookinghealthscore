import type { Metadata } from 'next';
import { AuditTool } from '../../components/AuditTool';
import { JsonLd, softwareApplicationSchema, serviceSchema } from '../../lib/schema';

export const metadata: Metadata = {
  title: 'Hotel Direct Booking Audit Tool | Direct Booking Health Score',
  description:
    'Free AI-powered hotel technology audit. Answer 20 questions about your booking engine, metasearch, CRM, and analytics to get an instant scored report.',
  alternates: { canonical: 'https://directbookinghealthscore.com/hotel-audit' },
  openGraph: {
    title: 'Hotel Direct Booking Audit Tool',
    description:
      'Free AI-powered audit of your hotel direct booking infrastructure. Takes under 3 minutes.',
    url: 'https://directbookinghealthscore.com/hotel-audit',
    siteName: 'Direct Booking Health Score',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Direct Booking Audit Tool',
    description: 'Free AI-powered audit of your hotel direct booking infrastructure.',
  },
  robots: { index: true, follow: true },
};

export default function HotelAuditPage() {
  return (
    <>
      <JsonLd schema={[softwareApplicationSchema, serviceSchema]} />
      <AuditTool />
    </>
  );
}
