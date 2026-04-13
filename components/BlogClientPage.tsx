'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Blog } from './Blog';
import { useContent } from '../contexts/ContentContext';
import type { BlogPostMeta } from '../lib/blog';

interface Props {
  postsEn: BlogPostMeta[];
  postsIt: BlogPostMeta[];
  postsEs: BlogPostMeta[];
}

export const BlogClientPage: React.FC<Props> = ({ postsEn, postsIt, postsEs }) => {
  const { language } = useContent();
  const router = useRouter();

  const postsByLang: Record<string, BlogPostMeta[]> = { en: postsEn, it: postsIt, es: postsEs };
  const posts = postsByLang[language] ?? postsEn;

  return (
    <Blog
      posts={posts}
      onSelectPost={(slug) => router.push(`/blog/${slug}`)}
      onStartAudit={() => router.push('/hotel-audit')}
    />
  );
};
