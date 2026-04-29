import { MetadataRoute } from 'next';
import { getAllPostSlugs } from '../lib/blog';
import { LOCALES, BASE_URL, localePrefix, buildHreflang } from '../lib/i18n';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // Static page slugs (relative paths). Empty string = home.
  type StaticPage = {
    slug: string;
    changeFrequency: 'weekly' | 'monthly' | 'yearly';
    priority: number;
  };
  const staticPages: StaticPage[] = [
    { slug: '/', changeFrequency: 'weekly', priority: 1.0 },
    { slug: '/hotel-audit', changeFrequency: 'monthly', priority: 0.9 },
    { slug: '/ai-visibility-audit', changeFrequency: 'monthly', priority: 0.9 },
    { slug: '/blog', changeFrequency: 'weekly', priority: 0.8 },
    { slug: '/security', changeFrequency: 'yearly', priority: 0.3 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap(page =>
    LOCALES.map(lang => {
      const tail = page.slug === '/' ? '' : page.slug;
      const url = `${BASE_URL}${localePrefix(lang)}${tail || '/'}`;
      return {
        url,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: { languages: buildHreflang(page.slug) },
      };
    })
  );

  const blogSlugs = getAllPostSlugs();
  const blogEntries: MetadataRoute.Sitemap = blogSlugs.flatMap(({ slug }) =>
    LOCALES.map(lang => {
      const tail = `/blog/${slug}`;
      const url = `${BASE_URL}${localePrefix(lang)}${tail}`;
      return {
        url,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        alternates: { languages: buildHreflang(tail) },
      };
    })
  );

  return [...staticEntries, ...blogEntries];
}
