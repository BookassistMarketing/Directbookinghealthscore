'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Blog } from './Blog';
import { useContent } from '../contexts/ContentContext';
import { localePrefix } from '../lib/i18n';
import type { BlogPostMeta } from '../lib/blog';

interface Props {
  postsEn: BlogPostMeta[];
  postsIt: BlogPostMeta[];
  postsEs: BlogPostMeta[];
  postsPl: BlogPostMeta[];
  postsFr: BlogPostMeta[];
  postsDe: BlogPostMeta[];
  postsCs: BlogPostMeta[];
}

export const BlogClientPage: React.FC<Props> = ({ postsEn, postsIt, postsEs, postsPl, postsFr, postsDe, postsCs }) => {
  const { language } = useContent();
  const router = useRouter();

  const postsByLang: Record<string, BlogPostMeta[]> = {
    en: postsEn,
    it: postsIt,
    es: postsEs,
    pl: postsPl,
    fr: postsFr,
    de: postsDe,
    cs: postsCs,
  };
  const posts = postsByLang[language] ?? postsEn;
  const prefix = localePrefix(language);

  return (
    <Blog
      posts={posts}
      onSelectPost={(slug) => router.push(`${prefix}/blog/${slug}`)}
      onStartAudit={() => router.push(`${prefix}/hotel-audit`)}
    />
  );
};
