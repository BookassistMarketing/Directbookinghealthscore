'use client';

import { useRouter } from 'next/navigation';
import { Home } from './Home';
import type { BlogPostMeta } from '../lib/blog';

interface HomeClientProps {
  recentEn: BlogPostMeta[];
  recentIt: BlogPostMeta[];
  recentEs: BlogPostMeta[];
  recentPl: BlogPostMeta[];
}

export function HomeClient({ recentEn, recentIt, recentEs, recentPl }: HomeClientProps) {
  const router = useRouter();
  return (
    <Home
      onStart={() => router.push('/hotel-audit')}
      recentEn={recentEn}
      recentIt={recentIt}
      recentEs={recentEs}
      recentPl={recentPl}
    />
  );
}
