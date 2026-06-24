'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Activity, Menu, X, Globe, ArrowUpRight, ChevronDown, Home, Sparkles, TrendingUp } from 'lucide-react';
import { EditableText } from './Editable';
import { CookieBanner } from './CookieBanner';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const langWrapperRef = useRef<HTMLDivElement | null>(null);
  const { language, setLanguage } = useContent();
  const router = useRouter();
  const pathname = usePathname();

  const openLang = () => {
    if (langCloseTimer.current) clearTimeout(langCloseTimer.current);
    setLangOpen(true);
  };
  const closeLangSoon = () => {
    if (langCloseTimer.current) clearTimeout(langCloseTimer.current);
    langCloseTimer.current = setTimeout(() => setLangOpen(false), 150);
  };

  // Close the dropdown when clicking outside.
  useEffect(() => {
    if (!langOpen) return;
    const handler = (e: MouseEvent) => {
      if (langWrapperRef.current && !langWrapperRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [langOpen]);

  // Strip the leading locale segment from pathname (if present) so isActive
  // works the same on /hotel-audit and /it/hotel-audit.
  const localePrefix = language === 'en' ? '' : `/${language}`;
  const pathWithoutLocale = (() => {
    if (!pathname) return '/';
    const segs = pathname.split('/').filter(Boolean);
    if (segs[0] && ['it','es','pl','fr','de','cs'].includes(segs[0])) {
      return '/' + segs.slice(1).join('/');
    }
    return pathname;
  })();

  const navigateTo = (path: string) => {
    const target = path === '/' ? (localePrefix || '/') : `${localePrefix}${path}`;
    router.push(target);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const isActive = (path: string) => {
    if (path === '/blog') return pathWithoutLocale.startsWith('/blog');
    return pathWithoutLocale === path;
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'it', label: 'Italiano' },
    { code: 'es', label: 'Español' },
    { code: 'pl', label: 'Polski' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'cs', label: 'Čeština' },
  ];

  // Revenue Simulator is English-only for now, so the label stays in English
  // across every locale until we localise the page.
  const headerLabels: Record<
    Language,
    {
      contact: string;
      hotelAudit: string;
      aiAudit: string;
      revenueSimulator: string;
      hotelAuditDesc: string;
      aiAuditDesc: string;
      revenueSimulatorDesc: string;
    }
  > = {
    en: {
      contact: 'Contact Us',
      hotelAudit: 'Hotel Tech Audit',
      aiAudit: 'AI Visibility Audit',
      revenueSimulator: 'Revenue Simulator',
      hotelAuditDesc: 'Check your booking, marketing, analytics and SEO stack in 15 questions.',
      aiAuditDesc: 'Submit your URL for a scored AI and GEO search readiness report.',
      revenueSimulatorDesc: 'See the net revenue gain from shifting more bookings direct.',
    },
    it: {
      contact: 'Contattaci',
      hotelAudit: 'Audit Tecnologico',
      aiAudit: 'Audit Visibilità AI',
      revenueSimulator: 'Revenue Simulator',
      hotelAuditDesc: 'Valuta in 15 domande il tuo stack di prenotazioni, marketing, analytics e SEO.',
      aiAuditDesc: 'Invia il tuo URL per un report con punteggio sulla prontezza alla ricerca AI e GEO.',
      revenueSimulatorDesc: 'Scopri il guadagno netto di fatturato spostando più prenotazioni sul diretto.',
    },
    es: {
      contact: 'Contáctanos',
      hotelAudit: 'Auditoría Técnica',
      aiAudit: 'Auditoría Visibilidad IA',
      revenueSimulator: 'Revenue Simulator',
      hotelAuditDesc: 'Evalúa en 15 preguntas tu stack de reservas, marketing, analítica y SEO.',
      aiAuditDesc: 'Envía tu URL y recibe un informe puntuado de preparación para búsqueda con IA y GEO.',
      revenueSimulatorDesc: 'Descubre la ganancia neta de ingresos al pasar más reservas a directo.',
    },
    pl: {
      contact: 'Kontakt',
      hotelAudit: 'Audyt Techniczny',
      aiAudit: 'Audyt Widoczności AI',
      revenueSimulator: 'Revenue Simulator',
      hotelAuditDesc: 'Sprawdź w 15 pytaniach swój system rezerwacji, marketingu, analityki i SEO.',
      aiAuditDesc: 'Prześlij adres URL i otrzymaj oceniony raport gotowości na wyszukiwanie AI i GEO.',
      revenueSimulatorDesc: 'Zobacz wzrost przychodów netto dzięki przeniesieniu większej liczby rezerwacji na bezpośrednie.',
    },
    fr: {
      contact: 'Contactez-nous',
      hotelAudit: 'Audit Technique',
      aiAudit: 'Audit Visibilité IA',
      revenueSimulator: 'Revenue Simulator',
      hotelAuditDesc: 'Évaluez en 15 questions votre stack réservation, marketing, analytics et SEO.',
      aiAuditDesc: 'Soumettez votre URL pour un rapport noté de préparation à la recherche IA et GEO.',
      revenueSimulatorDesc: 'Visualisez le gain net de revenus en basculant plus de réservations en direct.',
    },
    de: {
      contact: 'Kontakt',
      hotelAudit: 'Technologie-Audit',
      aiAudit: 'KI-Sichtbarkeitsaudit',
      revenueSimulator: 'Revenue Simulator',
      hotelAuditDesc: 'Prüfen Sie in 15 Fragen Ihre Technik für Buchung, Marketing, Analytics und SEO.',
      aiAuditDesc: 'Senden Sie Ihre URL für einen bewerteten Bericht zur Bereitschaft für KI und GEO Suche.',
      revenueSimulatorDesc: 'Sehen Sie, wie viel Umsatz Sie netto gewinnen, wenn Sie mehr Buchungen direkt holen.',
    },
    cs: {
      contact: 'Kontakt',
      hotelAudit: 'Technický audit',
      aiAudit: 'Audit AI viditelnosti',
      revenueSimulator: 'Revenue Simulator',
      hotelAuditDesc: 'Zkontrolujte v 15 otázkách svůj systém rezervací, marketingu, analytiky a SEO.',
      aiAuditDesc: 'Zadejte URL a získejte hodnocenou zprávu o připravenosti na AI a GEO vyhledávání.',
      revenueSimulatorDesc: 'Zjistěte čistý nárůst tržeb při přesunu více rezervací na přímé.',
    },
  };

  const labels = headerLabels[language];

  // Header tool pills — each tool shows its own solid brand colour on every
  // page (including home). The pill for the page you're on gets a ring + dot.
  const tools = [
    {
      path: '/hotel-audit',
      label: labels.hotelAudit,
      desc: labels.hotelAuditDesc,
      color: 'bg-brand-blue hover:bg-blue-900',
      ring: 'ring-brand-blue',
      swatch: 'bg-brand-blue',
      Icon: Activity,
    },
    {
      path: '/ai-visibility-audit',
      label: labels.aiAudit,
      desc: labels.aiAuditDesc,
      color: 'bg-brand-success hover:bg-teal-700',
      ring: 'ring-brand-success',
      swatch: 'bg-brand-success',
      Icon: Sparkles,
    },
    {
      path: '/revenue-simulator',
      label: labels.revenueSimulator,
      desc: labels.revenueSimulatorDesc,
      color: 'bg-brand-accent hover:bg-red-700',
      ring: 'ring-brand-accent',
      swatch: 'bg-brand-accent',
      Icon: TrendingUp,
    },
  ];

  return (
    <div className="relative isolate min-h-screen supports-[height:100dvh]:min-h-[100dvh] bg-[#F4F6F8] font-sans text-gray-900 flex flex-col print:bg-white print:h-auto print:min-h-0">
      {/* Site-wide dotted background — sits behind every page */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 pointer-events-none print:hidden [background-image:radial-gradient(circle,rgba(15,23,42,0.10)_1px,transparent_1px)] [background-size:22px_22px]"
      />

      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200 print:static print:shadow-none print:border-b-2 print:border-brand-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Left — logo + Blog */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 min-w-0">
          <div
            className="flex items-center gap-3 cursor-pointer active:opacity-80 transition-opacity flex-shrink-0"
            onClick={() => navigateTo('/')}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-blue rounded-lg flex items-center justify-center shadow-md flex-shrink-0 print:shadow-none">
              <Activity className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-lg sm:text-xl font-bold text-brand-blue tracking-tight leading-none">
                <EditableText id="app.header.title" defaultText="Hotel Health Clinic" as="span" />
              </h1>
              <p className="hidden sm:block text-xs text-gray-500 uppercase tracking-widest font-semibold mt-1 print:block">
                Powered by{' '}
                <a
                  href="https://bookassist.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="group relative inline-flex items-center gap-1 text-gray-500 hover:text-brand-blue transition-colors print:text-gray-500"
                >
                  <span className="relative">
                    Bookassist
                    <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-brand-blue transition-all duration-300 ease-out group-hover:w-full print:hidden" />
                  </span>
                  <ArrowUpRight
                    size={12}
                    className="opacity-0 -translate-x-1 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0 print:hidden"
                  />
                </a>
              </p>
            </div>
          </div>

            <button
              onClick={() => navigateTo('/')}
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${isActive('/') ? 'bg-brand-blue/10 text-brand-blue' : 'text-gray-700 hover:bg-brand-blue/5 hover:text-brand-blue'}`}
            >
              <Home size={16} />
              Home
            </button>
            <button
              onClick={() => navigateTo('/blog')}
              className={`hidden sm:inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold transition-colors ${isActive('/blog') ? 'bg-brand-blue/10 text-brand-blue' : 'text-gray-700 hover:bg-brand-blue/5 hover:text-brand-blue'}`}
            >
              Blog
            </button>
          </div>

          {/* Right — tool pills (desktop) + hamburger (mobile) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 print:hidden">
              {tools.map(tool => {
                const active = isActive(tool.path);
                const Icon = tool.Icon;
                return (
                  <div key={tool.path} className="relative group">
                    <button
                      onClick={() => navigateTo(tool.path)}
                      className={`inline-flex items-center gap-2 px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-semibold text-white whitespace-nowrap shadow-sm transition-colors ${tool.color} ${active ? `ring-2 ring-offset-2 ${tool.ring}` : ''}`}
                    >
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      {tool.label}
                    </button>

                    {/* Hover preview — fades + slides in on hover */}
                    <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full pt-2 w-64 z-50 opacity-0 invisible translate-y-1 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 motion-reduce:transition-none">
                      <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-3">
                        <div className="flex items-start gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tool.swatch}`}>
                            <Icon size={16} className="text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-brand-blue">{tool.label}</div>
                            <div className="text-xs text-gray-500 mt-0.5 leading-snug">{tool.desc}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Language switcher (desktop) */}
            <div
              ref={langWrapperRef}
              onMouseEnter={openLang}
              onMouseLeave={closeLangSoon}
              className="relative hidden md:block print:hidden"
            >
              <button
                type="button"
                onClick={() => setLangOpen(o => !o)}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                aria-label="Choose language"
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:text-brand-blue hover:border-brand-blue transition-colors"
              >
                <Globe size={14} className="text-gray-400" />
                <span>{(languages.find(l => l.code === language) ?? languages[0]).label}</span>
                <ChevronDown size={14} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <ul
                  role="listbox"
                  className="absolute top-full right-0 mt-1 min-w-[10rem] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
                >
                  {languages
                    .filter(l => l.code !== language)
                    .map(lang => (
                      <li key={lang.code}>
                        <button
                          type="button"
                          onClick={() => {
                            setLanguage(lang.code);
                            setLangOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-blue"
                        >
                          {lang.label}
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div className="md:hidden flex items-center print:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-16 sm:top-20 bottom-0 z-40 bg-white border-t border-gray-100 shadow-xl overflow-y-auto print:hidden">
            <div className="px-4 py-6 space-y-3 flex flex-col pb-20">
              <button
                onClick={() => navigateTo('/blog')}
                className={`text-left px-4 py-4 rounded-lg text-lg ${isActive('/blog') ? 'bg-blue-50 text-brand-blue font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Blog
              </button>
              <button
                onClick={() => navigateTo('/security')}
                className={`text-left px-4 py-4 rounded-lg text-lg ${isActive('/security') ? 'bg-blue-50 text-brand-blue font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Security & Privacy
              </button>
              <div className="pt-4 border-t border-gray-100 mt-2 space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4 flex items-center gap-2">
                  <Globe size={12} /> Language
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsMenuOpen(false);
                      }}
                      className={`px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                        language === lang.code
                          ? 'bg-brand-blue text-white shadow-sm'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-2 space-y-3">
                <button
                  onClick={() => navigateTo('/hotel-audit')}
                  className="w-full bg-brand-blue text-white px-4 py-4 rounded-xl text-lg font-medium shadow-md active:scale-[0.98] transition-transform"
                >
                  {labels.hotelAudit}
                </button>
                <button
                  onClick={() => navigateTo('/ai-visibility-audit')}
                  className="w-full bg-brand-success text-white px-4 py-4 rounded-xl text-lg font-medium shadow-md active:scale-[0.98] transition-transform"
                >
                  {labels.aiAudit}
                </button>
                <button
                  onClick={() => navigateTo('/revenue-simulator')}
                  className="w-full bg-brand-accent text-white px-4 py-4 rounded-xl text-lg font-medium shadow-md active:scale-[0.98] transition-transform"
                >
                  {labels.revenueSimulator}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow flex flex-col items-center justify-start w-full pb-12 print:pt-4 print:pb-0">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 sm:py-12 mt-auto print:border-t-0 print:py-4 print:mt-4 break-inside-avoid">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Direct Booking Health Score. All rights reserved.</p>
          <p className="mt-2 text-xs uppercase tracking-widest text-gray-300 print:text-gray-500">
            Powered by{' '}
            <a
              href="https://bookassist.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-1 text-gray-300 hover:text-brand-blue transition-colors print:text-gray-500"
            >
              <span className="relative">
                Bookassist
                <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-brand-blue transition-all duration-300 ease-out group-hover:w-full print:hidden" />
              </span>
              <ArrowUpRight
                size={12}
                className="opacity-0 -translate-x-1 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0 print:hidden"
              />
            </a>
          </p>
          <div className="mt-4 flex justify-center gap-6 text-xs">
            <button
              onClick={() => navigateTo('/security')}
              className="text-gray-400 hover:text-brand-blue transition-colors"
            >
              Security & Privacy
            </button>
            <a
              href="https://bookassist.com/book-a-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-brand-blue transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </footer>

      <CookieBanner />
    </div>
  );
};
