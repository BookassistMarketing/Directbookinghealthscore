'use client';

import { useRouter } from 'next/navigation';
import { Home } from './Home';
import { useContent } from '../contexts/ContentContext';
import { localePrefix } from '../lib/i18n';
import type { BlogPostMeta } from '../lib/blog';

interface HomeClientProps {
  recentEn: BlogPostMeta[];
  recentIt: BlogPostMeta[];
  recentEs: BlogPostMeta[];
  recentPl: BlogPostMeta[];
  recentFr: BlogPostMeta[];
  recentDe: BlogPostMeta[];
  recentCs: BlogPostMeta[];
}

export function HomeClient({ recentEn, recentIt, recentEs, recentPl, recentFr, recentDe, recentCs }: HomeClientProps) {
  const router = useRouter();
  const { language } = useContent();
  return (
    <Home
      onStart={() => router.push(`${localePrefix(language)}/hotel-audit`)}
      recentEn={recentEn}
      recentIt={recentIt}
      recentEs={recentEs}
      recentPl={recentPl}
      recentFr={recentFr}
      recentDe={recentDe}
      recentCs={recentCs}
    />
  );
}
