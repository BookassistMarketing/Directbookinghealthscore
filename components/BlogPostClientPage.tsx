'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BlogPost } from './BlogPost';
import { useContent } from '../contexts/ContentContext';
import type { BlogPostContent } from '../lib/blog';

interface Props {
  slug: string;
  contentEn: BlogPostContent | null;
  contentIt: BlogPostContent | null;
  contentEs: BlogPostContent | null;
  contentPl: BlogPostContent | null;
}

export const BlogPostClientPage: React.FC<Props> = ({ slug, contentEn, contentIt, contentEs, contentPl }) => {
  const { language } = useContent();
  const router = useRouter();

  const contentByLang: Record<string, BlogPostContent | null> = {
    en: contentEn,
    it: contentIt,
    es: contentEs,
    pl: contentPl,
  };
  const content = contentByLang[language] ?? contentEn;

  return (
    <BlogPost
      slug={slug}
      content={content}
      onBack={() => router.push('/blog')}
      onStartAudit={() => router.push('/hotel-audit')}
    />
  );
};
