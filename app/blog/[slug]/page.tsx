import { getAllPostSlugs, getPostContent } from '../../../lib/blog';
import { BlogPostClientPage } from '../../../components/BlogPostClientPage';

export function generateStaticParams() {
  return getAllPostSlugs();
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const contentEn = getPostContent(slug, 'en');
  const contentIt = getPostContent(slug, 'it');
  const contentEs = getPostContent(slug, 'es');

  return (
    <BlogPostClientPage
      slug={slug}
      contentEn={contentEn}
      contentIt={contentIt}
      contentEs={contentEs}
    />
  );
}
