'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';
import type { BlogPostContent } from '../lib/blog';

interface BlogPostProps {
  slug: string;
  content: BlogPostContent | null;
  onBack: () => void;
  onStartAudit: () => void;
}

export const BlogPost: React.FC<BlogPostProps> = ({ slug, content, onBack, onStartAudit }) => {
  const { language } = useContent();

  const labels: Record<Language, { back: string; cta: string; ctaBtn: string }> = {
    en: { back: 'Back to Blog', cta: 'Book a Demo to Improve Your Hotel Score', ctaBtn: 'Book a Demo' },
    it: { back: 'Torna al Blog', cta: 'Prenota una Demo per Migliorare il Punteggio del Tuo Hotel', ctaBtn: 'Prenota una Demo' },
    es: { back: 'Volver al Blog', cta: 'Reserva una Demo para Mejorar la Puntuación de tu Hotel', ctaBtn: 'Reservar una Demo' },
    pl: { back: 'Powrót do Bloga', cta: 'Zamów Prezentację, aby Poprawić Wynik Swojego Hotelu', ctaBtn: 'Zamów Prezentację' },
  };
  const l = labels[language];

  if (!content) {
    return (
      <div className="w-full max-w-3xl px-4 py-12 mx-auto text-center">
        <p className="text-gray-400">Post not found.</p>
        <button onClick={onBack} className="mt-4 text-brand-blue font-bold">{l.back}</button>
      </div>
    );
  }

  const { data, body } = content;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const localeMap: Record<Language, string> = { en: 'en-GB', it: 'it-IT', es: 'es-ES', pl: 'pl-PL' };
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
        <a
          href="https://bookassist.org/book-a-demo"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center bg-white text-brand-blue px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
        >
          Book a Demo <ArrowRight size={16} className="inline ml-2" />
        </a>
      </div>
    </div>
  );
};
