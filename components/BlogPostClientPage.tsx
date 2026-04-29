'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BlogPost } from './BlogPost';
import { useContent } from '../contexts/ContentContext';
import { localePrefix } from '../lib/i18n';
import type { BlogPostContent } from '../lib/blog';

interface Props {
  slug: string;
  contentEn: BlogPostContent | null;
  contentIt: BlogPostContent | null;
  contentEs: BlogPostContent | null;
  contentPl: BlogPostContent | null;
  contentFr: BlogPostContent | null;
  contentDe: BlogPostContent | null;
  contentCs: BlogPostContent | null;
}

export const BlogPostClientPage: React.FC<Props> = ({ slug, contentEn, contentIt, contentEs, contentPl, contentFr, contentDe, contentCs }) => {
  const { language } = useContent();
  const router = useRouter();

  const contentByLang: Record<string, BlogPostContent | null> = {
    en: contentEn,
    it: contentIt,
    es: contentEs,
    pl: contentPl,
    fr: contentFr,
    de: contentDe,
    cs: contentCs,
  };
  const content = contentByLang[language] ?? contentEn;
  const prefix = localePrefix(language);

  return (
    <BlogPost
      slug={slug}
      content={content}
      onBack={() => router.push(`${prefix}/blog`)}
      onStartAudit={() => router.push(`${prefix}/hotel-audit`)}
    />
  );
};
