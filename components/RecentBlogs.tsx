'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, BookOpen } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';
import type { BlogPostMeta } from '../lib/blog';

interface RecentBlogsProps {
  recentEn: BlogPostMeta[];
  recentIt: BlogPostMeta[];
  recentEs: BlogPostMeta[];
  recentPl: BlogPostMeta[];
}

export const RecentBlogs: React.FC<RecentBlogsProps> = ({
  recentEn,
  recentIt,
  recentEs,
  recentPl,
}) => {
  const { language } = useContent();

  const postsByLanguage: Record<Language, BlogPostMeta[]> = {
    en: recentEn,
    it: recentIt,
    es: recentEs,
    pl: recentPl,
  };
  const posts = postsByLanguage[language] ?? recentEn;

  if (posts.length === 0) return null;

  const labels: Record<Language, { eyebrow: string; heading: string; sub: string; readMore: string; viewAll: string }> = {
    en: {
      eyebrow: 'Latest Insights',
      heading: 'Direct Booking Insights',
      sub: 'Expert advice on direct booking strategy and hotel technology.',
      readMore: 'Read Article',
      viewAll: 'View All Articles',
    },
    it: {
      eyebrow: 'Ultimi Approfondimenti',
      heading: 'Approfondimenti sul Direct Booking',
      sub: 'Consigli di esperti su strategia di prenotazione diretta e tecnologia alberghiera.',
      readMore: 'Leggi Articolo',
      viewAll: 'Vedi Tutti gli Articoli',
    },
    es: {
      eyebrow: 'Últimas Perspectivas',
      heading: 'Perspectivas de Reserva Directa',
      sub: 'Consejos de expertos sobre estrategia de reserva directa y tecnología hotelera.',
      readMore: 'Leer Artículo',
      viewAll: 'Ver Todos los Artículos',
    },
    pl: {
      eyebrow: 'Najnowsze Spostrzeżenia',
      heading: 'Spostrzeżenia o Rezerwacjach Bezpośrednich',
      sub: 'Porady ekspertów dotyczące strategii rezerwacji bezpośrednich i technologii hotelowej.',
      readMore: 'Czytaj Artykuł',
      viewAll: 'Zobacz Wszystkie Artykuły',
    },
  };
  const l = labels[language];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const localeMap: Record<Language, string> = { en: 'en-GB', it: 'it-IT', es: 'es-ES', pl: 'pl-PL' };
    return new Date(dateStr).toLocaleDateString(localeMap[language], {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const gridLayout =
    posts.length === 1
      ? 'grid-cols-1 max-w-md mx-auto'
      : posts.length === 2
        ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
        : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';

  return (
    <section className="mb-12 sm:mb-20 print:hidden">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue text-[10px] font-black tracking-widest uppercase mb-5">
          <BookOpen size={12} /> {l.eyebrow}
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">{l.heading}</h2>
        <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">{l.sub}</p>
      </div>

      <div className={`grid gap-6 sm:gap-8 mb-10 ${gridLayout}`}>
        {posts.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group text-left bg-white rounded-[24px] shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col"
          >
            {post.image && (
              <div className="w-full h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">
                <Calendar size={12} />
                {formatDate(post.date)}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-3 leading-tight">
                {post.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-5">{post.excerpt}</p>
              <span className="inline-flex items-center gap-2 text-brand-blue font-black text-xs uppercase tracking-widest">
                {l.readMore} <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-brand-blue font-black text-sm uppercase tracking-widest hover:gap-3 transition-all"
        >
          {l.viewAll} <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};
