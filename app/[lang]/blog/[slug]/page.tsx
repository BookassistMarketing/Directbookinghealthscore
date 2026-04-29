import type { Metadata } from 'next';
import { getAllPostSlugs, getPostContent } from '../../../../lib/blog';
import { BlogPostClientPage } from '../../../../components/BlogPostClientPage';
import { JsonLd, articleSchema, breadcrumbSchema } from '../../../../lib/schema';
import { buildHreflang, canonicalFor, LOCALIZED_LOCALES } from '../../../../lib/i18n';
import type { Language } from '../../../../types';

export function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return LOCALIZED_LOCALES.flatMap(lang => slugs.map(({ slug }) => ({ lang, slug })));
}

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const content = getPostContent(slug, lang) ?? getPostContent(slug, 'en');
  const title = content?.data?.title || 'Blog Post';
  const description = content?.data?.metaDescription || content?.data?.excerpt || '';
  const image = content?.data?.image || '';
  const canonical = canonicalFor(lang as Language, `/blog/${slug}`);

  return {
    title: `${title} | Direct Booking Health Score`,
    description,
    alternates: { canonical, languages: buildHreflang(`/blog/${slug}`) },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Direct Booking Health Score',
      type: 'article',
      publishedTime: content?.data?.date,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocalizedBlogPostPage({ params }: Props) {
  const { slug } = await params;

  const contentEn = getPostContent(slug, 'en');
  const contentIt = getPostContent(slug, 'it');
  const contentEs = getPostContent(slug, 'es');
  const contentPl = getPostContent(slug, 'pl');
  const contentFr = getPostContent(slug, 'fr');
  const contentDe = getPostContent(slug, 'de');
  const contentCs = getPostContent(slug, 'cs');

  const post = {
    title: contentEn?.data?.title || '',
    excerpt: contentEn?.data?.excerpt || '',
    date: contentEn?.data?.date || '',
    image: contentEn?.data?.image || '',
    slug,
  };

  const schemas = [
    articleSchema(post),
    breadcrumbSchema([
      { name: 'Home', url: 'https://directbookinghealthscore.com' },
      { name: 'Blog', url: 'https://directbookinghealthscore.com/blog' },
      { name: post.title, url: `https://directbookinghealthscore.com/blog/${slug}` },
    ]),
  ];

  return (
    <>
      <JsonLd schema={schemas} />
      <BlogPostClientPage
        slug={slug}
        contentEn={contentEn}
        contentIt={contentIt}
        contentEs={contentEs}
        contentPl={contentPl}
        contentFr={contentFr}
        contentDe={contentDe}
        contentCs={contentCs}
      />
    </>
  );
}
