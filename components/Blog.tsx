'use client';

import React from 'react';
import { ArrowRight, Calendar, BookOpen } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';
import type { BlogPostMeta } from '../lib/blog';

interface BlogProps {
  posts: BlogPostMeta[];
  onSelectPost: (slug: string) => void;
  onStartAudit: () => void;
}

export const Blog: React.FC<BlogProps> = ({ posts, onSelectPost, onStartAudit }) => {
  const { language } = useContent();

  const labels: Record<Language, { heading: string; sub: string; readMore: string; cta: string; ctaSub: string }> = {
    en: {
      heading: 'Direct Booking Insights',
      sub: 'Weekly strategy and technology advice for hotels reducing OTA dependency.',
      readMore: 'Read Article',
      cta: 'Book a Demo to Improve Your Hotel Score',
      ctaSub: 'Speak with an expert and find out how to grow your direct bookings.',
    },
    it: {
      heading: 'Approfondimenti sul Direct Booking',
      sub: 'Consigli settimanali su strategia e tecnologia per hotel che riducono la dipendenza dalle OTA.',
      readMore: 'Leggi Articolo',
      cta: 'Prenota una Demo per Migliorare il Punteggio del Tuo Hotel',
      ctaSub: 'Parla con un esperto e scopri come aumentare le prenotazioni dirette.',
    },
    es: {
      heading: 'Perspectivas de Reserva Directa',
      sub: 'Consejos semanales de estrategia y tecnología para hoteles que reducen su dependencia de las OTA.',
      readMore: 'Leer Artículo',
      cta: 'Reserva una Demo para Mejorar la Puntuación de tu Hotel',
      ctaSub: 'Habla con un experto y descubre cómo aumentar tus reservas directas.',
    },
  };
  const l = labels[language];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const localeMap: Record<Language, string> = { en: 'en-GB', it: 'it-IT', es: 'es-ES' };
    return new Date(dateStr).toLocaleDateString(localeMap[language], {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="w-full max-w-5xl px-4 sm:px-6 py-12 mx-auto">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue text-[10px] font-black tracking-widest uppercase mb-5">
          <BookOpen size={12} /> Weekly Insights
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">{l.heading}</h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">{l.sub}</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-gray-400 py-20">No posts yet — check back next week.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {posts.map((post, i) => (
            <button
              key={post.slug}
              onClick={() => onSelectPost(post.slug)}
              className={`text-left bg-white rounded-[24px] shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col ${
                i === 0 ? 'md:col-span-2' : ''
              }`}
            >
              {post.image && (
                <div className={`w-full overflow-hidden ${i === 0 ? 'h-64 sm:h-80' : 'h-48'}`}>
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-7 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">
                  <Calendar size={12} />
                  {formatDate(post.date)}
                </div>
                <h2
                  className={`font-black text-gray-900 mb-3 leading-tight ${
                    i === 0 ? 'text-2xl sm:text-3xl' : 'text-xl'
                  }`}
                >
                  {post.title}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-5">{post.excerpt}</p>
                <span className="inline-flex items-center gap-2 text-brand-blue font-black text-xs uppercase tracking-widest">
                  {l.readMore} <ArrowRight size={14} />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="bg-brand-blue rounded-[28px] p-10 text-center text-white">
        <h3 className="text-2xl sm:text-3xl font-black mb-3">{l.cta}</h3>
        <p className="text-blue-200 mb-7">{l.ctaSub}</p>
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
