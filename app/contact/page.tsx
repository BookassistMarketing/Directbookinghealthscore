import type { Metadata } from 'next';
import { Contact } from '../../components/Contact';
import { JsonLd, contactPageSchema, organizationSchema } from '../../lib/schema';

export const metadata: Metadata = {
  title: 'Contact Us | Direct Booking Health Score',
  description:
    'Contact the Bookassist team to learn how to improve your hotel direct booking strategy and reduce OTA dependency.',
  alternates: { canonical: 'https://directbookinghealthscore.com/contact' },
  openGraph: {
    title: 'Contact Us | Direct Booking Health Score',
    description: 'Contact the Bookassist team to grow your direct bookings.',
    url: 'https://directbookinghealthscore.com/contact',
    siteName: 'Direct Booking Health Score',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Direct Booking Health Score',
    description: 'Contact the Bookassist team to grow your direct bookings.',
  },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd schema={[contactPageSchema, organizationSchema]} />
      <Contact />
    </>
  );
}
