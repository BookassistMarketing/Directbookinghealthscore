import React, { useMemo } from 'react';
import { ArrowRight, Calendar, BookOpen } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';

interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  raw: string;
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const data: Record<string, string> = {};
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim().replace(/^"|"$/g, '');
    data[key] = value;
  });
  return data;
}

const rawFiles = import.meta.glob('/blog/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

function loadPosts(): Post[] {
  return Object.entries(rawFiles)
    .map(([path, raw]) => {
      const data = parseFrontmatter(raw);
      return {
        slug: data.slug || path.replace(/.*\//, '').replace('.md', ''),
        title: data.title || 'Untitled',
        date: data.date || '',
        excerpt: data.excerpt || '',
        image: data.image || '',
        raw,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

interface BlogProps {
  onSelectPost: (slug: string) => void;
  onStartAudit: () => void;
}

export const Blog: React.FC<BlogProps> = ({ onSelectPost, onStartAudit }) => {
  const { language } = useContent();
  const posts = useMemo(() => loadPosts(), []);

  const labels: Record<Language, any> = {
    en: { heading: 'Direct Booking Insights', sub: 'Weekly strategy and technology advice for hotels reducing OTA dependency.', readMore: 'Read Article', cta: 'Audit Your Hotel\'s Direct Booking Health', ctaSub: 'Free 5-minute assessment — get your Tech Score instantly.' },
    it: { heading: 'Approfondimenti sul Direct Booking', sub: 'Consigli settimanali su strategia e tecnologia per hotel che riducono la dipendenza dalle OTA.', readMore: 'Leggi Articolo', cta: 'Verifica la Salute del Tuo Direct Booking', ctaSub: 'Valutazione gratuita in 5 minuti — ottieni subito il tuo Tech Score.' },
    es: { heading: 'Perspectivas de Reserva Directa', sub: 'Consejos semanales de estrategia y tecnología para hoteles que reducen su dependencia de las OTA.', readMore: 'Leer Artículo', cta: 'Audita la Salud de tu Reserva Directa', ctaSub: 'Evaluación gratuita en 5 minutos — obtén tu Tech Score al instante.' },
  };
  const l = labels[language];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="w-full max-w-5xl px-4 sm:px-6 py-12 mx-auto">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue text-[10px] font-black tracking-widest uppercase mb-5">
          <BookOpen size={12} /> Weekly Insights
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">{l.heading}</h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">{l.sub}</p>
      </div>

      {/* Post Grid */}
      {posts.length === 0 ? (
        <p className="text-center text-gray-400 py-20">No posts yet — check back next week.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {posts.map((post, i) => (
            <button
              key={post.slug}
              onClick={() => onSelectPost(post.slug)}
              className={`text-left bg-white rounded-[24px] shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col ${i === 0 ? 'md:col-span-2' : ''}`}
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
                <h2 className={`font-black text-gray-900 mb-3 leading-tight ${i === 0 ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>{post.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-5">{post.excerpt}</p>
                <span className="inline-flex items-center gap-2 text-brand-blue font-black text-xs uppercase tracking-widest">
                  {l.readMore} <ArrowRight size={14} />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* CTA Banner */}
      <div className="bg-brand-blue rounded-[28px] p-10 text-center text-white">
        <h3 className="text-2xl sm:text-3xl font-black mb-3">{l.cta}</h3>
        <p className="text-blue-200 mb-7">{l.ctaSub}</p>
        <button
          onClick={onStartAudit}
          className="bg-white text-brand-blue px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
        >
          Start Free Audit <ArrowRight size={16} className="inline ml-2" />
        </button>
      </div>
    </div>
  );
};
