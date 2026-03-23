import React, { useMemo } from 'react';
import { ArrowLeft, Calendar, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';

function parseFrontmatter(content: string): { data: Record<string, string>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: content };
  const data: Record<string, string> = {};
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim().replace(/^"|"$/g, '');
    data[key] = value;
  });
  return { data, body: match[2] };
}

const rawFiles = import.meta.glob('/blog/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

interface BlogPostProps {
  slug: string;
  onBack: () => void;
  onStartAudit: () => void;
}

export const BlogPost: React.FC<BlogPostProps> = ({ slug, onBack, onStartAudit }) => {
  const { language } = useContent();

  const labels: Record<Language, any> = {
    en: { back: 'Back to Blog', cta: 'Find out how your hotel scores', ctaBtn: 'Take the Free Audit' },
    it: { back: 'Torna al Blog', cta: 'Scopri il punteggio del tuo hotel', ctaBtn: 'Fai l\'Audit Gratuito' },
    es: { back: 'Volver al Blog', cta: 'Descubre cómo puntúa tu hotel', ctaBtn: 'Haz el Audit Gratuito' },
  };
  const l = labels[language];

  const { data, body } = useMemo(() => {
    // Group files by base slug and find matching post
    const postVersions: Record<string, string> = {};

    Object.entries(rawFiles).forEach(([path, raw]) => {
      const filename = path.replace(/.*\//, '').replace('.md', '');
      const langMatch = filename.match(/^(.+)\.(it|es)$/);
      const baseSlug = langMatch ? langMatch[1] : filename;
      const fileLang = langMatch ? langMatch[2] : 'en';

      // Check if this file matches the requested slug
      const parsed = parseFrontmatter(raw);
      const fileSlug = parsed.data.slug || baseSlug;

      if (fileSlug === slug || baseSlug.includes(slug)) {
        postVersions[fileLang] = raw;
      }
    });

    // Prefer current language, fallback to English
    const selectedRaw = postVersions[language] || postVersions['en'];
    if (!selectedRaw) return { data: {}, body: 'Post not found.' };
    return parseFrontmatter(selectedRaw);
  }, [slug, language]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const localeMap: Record<Language, string> = { en: 'en-GB', it: 'it-IT', es: 'es-ES' };
    return new Date(dateStr).toLocaleDateString(localeMap[language], { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="w-full max-w-3xl px-4 sm:px-6 py-12 mx-auto">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-brand-blue font-bold text-xs uppercase tracking-widest mb-10 transition-colors"
      >
        <ArrowLeft size={14} /> {l.back}
      </button>

      {/* Featured Image */}
      {data.image && (
        <div className="w-full h-64 sm:h-96 rounded-[24px] overflow-hidden mb-10">
          <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
        <Calendar size={12} /> {formatDate(data.date)}
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-8 leading-tight">{data.title}</h1>

      {/* Content */}
      <div className="prose prose-lg max-w-none
        prose-headings:font-black prose-headings:text-gray-900
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
        prose-p:text-gray-600 prose-p:leading-relaxed
        prose-strong:text-gray-900 prose-strong:font-black
        prose-li:text-gray-600
        prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline">
        <ReactMarkdown>{body}</ReactMarkdown>
      </div>

      {/* CTA */}
      <div className="mt-16 bg-brand-blue rounded-[24px] p-10 text-center text-white">
        <h3 className="text-2xl font-black mb-6">{l.cta}</h3>
        <button
          onClick={onStartAudit}
          className="bg-white text-brand-blue px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
        >
          {l.ctaBtn} <ArrowRight size={16} className="inline ml-2" />
        </button>
      </div>
    </div>
  );
};
