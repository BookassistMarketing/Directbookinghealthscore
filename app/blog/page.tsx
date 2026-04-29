import type { Metadata } from 'next';
import { getAllPosts } from '../../lib/blog';
import { BlogClientPage } from '../../components/BlogClientPage';
import { JsonLd, blogListingSchema } from '../../lib/schema';
import { buildHreflang, canonicalFor } from '../../lib/i18n';

export const metadata: Metadata = {
  title: 'Direct Booking Insights | Hotel Revenue & Technology Blog',
  description:
    'Weekly strategy and technology advice for hotels reducing OTA dependency and growing direct bookings. Expert analysis from Bookassist.',
  alternates: { canonical: canonicalFor('en', '/blog'), languages: buildHreflang('/blog') },
  openGraph: {
    title: 'Direct Booking Insights | Hotel Revenue & Technology Blog',
    description:
      'Weekly strategy and technology advice for hotels reducing OTA dependency.',
    url: 'https://directbookinghealthscore.com/blog',
    siteName: 'Direct Booking Health Score',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Direct Booking Insights | Hotel Revenue & Technology Blog',
    description: 'Weekly strategy and technology advice for hotels reducing OTA dependency.',
  },
  robots: { index: true, follow: true },
};

export default function BlogPage() {
  const postsEn = getAllPosts('en');
  const postsIt = getAllPosts('it');
  const postsEs = getAllPosts('es');
  const postsPl = getAllPosts('pl');
  const postsFr = getAllPosts('fr');
  const postsDe = getAllPosts('de');
  const postsCs = getAllPosts('cs');

  return (
    <>
      <JsonLd schema={blogListingSchema} />
      <BlogClientPage
        postsEn={postsEn}
        postsIt={postsIt}
        postsEs={postsEs}
        postsPl={postsPl}
        postsFr={postsFr}
        postsDe={postsDe}
        postsCs={postsCs}
      />
    </>
  );
}
