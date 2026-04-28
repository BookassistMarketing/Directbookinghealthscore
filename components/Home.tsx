'use client';

import React from 'react';
import { Button } from './Button';
import { ShieldCheck, BarChart2, Globe, Zap, ArrowRight } from 'lucide-react';
import { EditableText } from './Editable';
import { RecentBlogs } from './RecentBlogs';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';
import type { BlogPostMeta } from '../lib/blog';

interface HomeProps {
  onStart: () => void;
  recentEn: BlogPostMeta[];
  recentIt: BlogPostMeta[];
  recentEs: BlogPostMeta[];
  recentPl: BlogPostMeta[];
}

export const Home: React.FC<HomeProps> = ({ onStart, recentEn, recentIt, recentEs, recentPl }) => {
  const { language } = useContent();

  const labelsMap: Record<Language, any> = {
    en: { eyebrow: 'Hotel Tech Diagnostics', trustMicro: 'Free • 3 minutes • No signup required', title: 'Maximise Your <span class="text-brand-blue">Digital Revenue</span> Potential', subtitle: "The Direct Booking Health Score is the industry standard for assessing hospitality technology infrastructure. We analyse your <strong>Direct Booking Strategy</strong>, <strong>Metasearch Connectivity</strong>, and <strong>Marketing ROI</strong> to identify critical performance gaps.", cta: "Launch Free Tech Audit", f1t: "Secure Your Data", f1d: "In an era of privacy-first browsing, legacy tracking destroys attribution. Our audit checks for <strong>GA4 implementation</strong> and <strong>First-Party Data compliance</strong>.", f2t: "Dominate Metasearch", f2d: "Are you bidding on parity-loss dates? <strong>Metasearch Optimisation</strong> requires granular inventory management and real-time rate parity checks.", f3t: "High-Conversion Engines", f3d: "Friction kills conversion. From <strong>Digital Wallets</strong> to dynamic multi-currency, modern travellers demand a seamless experience.", f4t: "AI-Driven Personalisation", f4d: "Leverage <strong>Predictive Analytics</strong> and <strong>Dynamic Content Personalisation</strong> to serve the right offer to the right guest.", bt: "Ready to diagnose your digital health?", bd: "Join thousands of hoteliers optimising their revenue strategy. The audit takes less than 3 minutes.", bcta: "Start Assessment Now" },
    it: { eyebrow: 'Diagnostica Tech Alberghiera', trustMicro: 'Gratis • 3 minuti • Nessuna registrazione', title: 'Massimizza il tuo <span class="text-brand-blue">Potenziale di Ricavo</span> Digitale', subtitle: "Il Direct Booking Health Score è lo standard del settore per valutare l'infrastruttura tecnologica alberghiera. Analizziamo la tua <strong>Strategia di Prenotazione Diretta</strong> e il <strong>ROI del Marketing</strong>.", cta: "Lancia l'Audit Gratuito", f1t: "Proteggi i Tuoi Dati", f1d: "In un'era incentrata sulla privacy, il tracciamento legacy distrugge l'attribuzione. Verifichiamo la <strong>conformità ai dati di prima parte</strong>.", f2t: "Domina i Metamotori", f2d: "Stai puntando su date in perdita di parità? L'<strong>Ottimizzazione dei Metamotori</strong> richiede una gestione granulare dell'inventario.", f3t: "Motori ad Alta Conversione", f3d: "La frizione uccide la conversione. Dai <strong>Portafogli Digitali</strong> alle multi-valute dinamiche, i viaggiatori esigono fluidità.", f4t: "Personalizzazione AI", f4d: "Sfrutta l'<strong>Analisi Predittiva</strong> e la <strong>Personalizzazione dei Contenuti</strong> per servire l'offerta giusta all'ospite giusto.", bt: "Pronto a diagnosticare la tua salute digitale?", bd: "Unisciti a migliaia di albergatori che ottimizzano la loro strategia. L'audit richiede meno di 3 minuti.", bcta: "Inizia la Valutazione" },
    es: { eyebrow: 'Diagnóstico Tech Hotelero', trustMicro: 'Gratis • 3 minutos • Sin registro', title: 'Maximiza tu <span class="text-brand-blue">Potencial de Ingresos</span> Digitales', subtitle: "Direct Booking Health Score es el estándar de la industria para evaluar la infraestructura tecnológica hotelera. Analizamos tu <strong>Estrategia de Reserva Directa</strong> y el <strong>ROI de Marketing</strong>.", cta: "Iniciar Auditoría Gratuita", f1t: "Asegura tus Datos", f1d: "En la era de la privacidad, el seguimiento heredado destruye la atribución. Comprobamos la <strong>implementación de GA4</strong> y el cumplimiento de datos.", f2t: "Domina los Metabuscadores", f2d: "¿Estás pujando en fechas sin paridad? La <strong>Optimización de Metabuscadores</strong> requiere gestión de inventario en tiempo real.", f3t: "Motores de Alta Conversión", f3d: "La fricción mata la conversión. Desde <strong>Billeteras Digitales</strong> hasta multidivisa dinámica, el viajero exige fluidez.", f4t: "Personalización con IA", f4d: "Utiliza <strong>Analítica Predictiva</strong> y <strong>Personalización de Contenido</strong> para ofrecer la oferta adecuada al huésped adecuado.", bt: "¿Listo para diagnosticar tu salud digital?", bd: "Únete a miles de hoteleros que optimizan su estrategia. La auditoría toma menos de 3 minutos.", bcta: "Iniciar Evaluación Ahora" },
    pl: { eyebrow: 'Diagnostyka Tech Hotelowa', trustMicro: 'Darmowe • 3 minuty • Bez rejestracji', title: 'Zmaksymalizuj swój <span class="text-brand-blue">Potencjał Przychodów</span> Cyfrowych', subtitle: "Direct Booking Health Score to standard branżowy w ocenie infrastruktury technologicznej w hotelarstwie. Analizujemy Twoją <strong>Strategię Rezerwacji Bezpośrednich</strong> i <strong>ROI Marketingu</strong>, aby zidentyfikować kluczowe luki wydajności.", cta: "Uruchom Bezpłatny Audyt Technologiczny", f1t: "Zabezpiecz Swoje Dane", f1d: "W erze przeglądania zorientowanego na prywatność, starsze metody śledzenia niszczą atrybucję. Nasz audyt sprawdza <strong>wdrożenie GA4</strong> i <strong>zgodność z danymi własnymi</strong>.", f2t: "Zdominuj Metawyszukiwarki", f2d: "Czy licytujesz w dniach utraty parytetu? <strong>Optymalizacja Metawyszukiwarek</strong> wymaga precyzyjnego zarządzania inwentarzem i weryfikacji parytetu cen w czasie rzeczywistym.", f3t: "Silniki o Wysokiej Konwersji", f3d: "Tarcie zabija konwersję. Od <strong>Portfeli Cyfrowych</strong> po dynamiczną obsługę wielu walut, nowocześni podróżni oczekują płynnego doświadczenia.", f4t: "Personalizacja oparta na AI", f4d: "Wykorzystaj <strong>Analitykę Predykcyjną</strong> i <strong>Dynamiczną Personalizację Treści</strong>, aby dostarczać właściwą ofertę właściwemu gościowi.", bt: "Gotowy, by zdiagnozować swoje cyfrowe zdrowie?", bd: "Dołącz do tysięcy hotelarzy optymalizujących swoją strategię przychodów. Audyt zajmuje mniej niż 3 minuty.", bcta: "Rozpocznij Ocenę Teraz" }
  };

  const l = labelsMap[language];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
      {/* Hero — Ternio-inspired: bold typography, geometric graphics, dot grid backdrop */}
      <section className="relative isolate overflow-hidden mb-12 sm:mb-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 print:overflow-visible">
        {/* Ambient atmosphere */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 print:hidden">
          {/* Soft radial glow behind heading */}
          <div className="absolute -top-40 left-1/4 w-[1100px] h-[700px] bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.18),rgba(37,99,235,0.04)_45%,transparent_70%)] blur-2xl" />
          {/* Subtle dot grid */}
          <div className="absolute inset-0 [background-image:radial-gradient(circle,rgba(15,23,42,0.10)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center min-h-[600px] py-10 sm:py-16 lg:py-20">
          {/* Left: copy column */}
          <div className="lg:col-span-7 space-y-7 sm:space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-100 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75 animate-ping"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-blue"></span>
              </span>
              <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-brand-blue">
                <EditableText id="home.hero.eyebrow" as="span" defaultText={l.eyebrow} />
              </span>
            </div>

            <EditableText
              id="home.hero.title"
              as="h1"
              defaultText={l.title}
              className="text-4xl sm:text-6xl lg:text-7xl xl:text-[88px] font-black tracking-[-0.03em] leading-[0.98] text-gray-900"
            />

            <EditableText
              id="home.hero.subtitle"
              as="p"
              multiline
              defaultText={l.subtitle}
              className="text-base sm:text-lg lg:text-xl text-gray-500 leading-relaxed max-w-2xl"
            />

            <div className="flex flex-col sm:flex-row gap-4 sm:items-center pt-2 print:hidden">
              <button
                onClick={onStart}
                className="group inline-flex items-center justify-center gap-2 bg-brand-blue text-white px-8 py-4 rounded-full text-sm font-black uppercase tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all w-full sm:w-auto"
              >
                <EditableText id="home.hero.cta" defaultText={l.cta} as="span" />
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
              <span className="text-xs text-gray-400 font-medium tracking-wide">
                <EditableText id="home.hero.trustMicro" as="span" defaultText={l.trustMicro} />
              </span>
            </div>
          </div>

          {/* Right: geometric graphic */}
          <div className="lg:col-span-5 relative aspect-square max-w-[460px] mx-auto w-full print:hidden" aria-hidden="true">
            <HeroCrystal />
          </div>
        </div>

      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-12 mb-12 sm:mb-20">
        <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 break-inside-avoid">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4"><ShieldCheck className="w-6 h-6 text-brand-blue" /></div>
          <EditableText id="home.feat1.title" as="h3" defaultText={l.f1t} className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" />
          <EditableText id="home.feat1.desc" as="p" multiline defaultText={l.f1d} className="text-sm sm:text-base text-gray-600 leading-relaxed" />
        </div>
        <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 break-inside-avoid">
          <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4"><Globe className="w-6 h-6 text-brand-success" /></div>
          <EditableText id="home.feat2.title" as="h3" defaultText={l.f2t} className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" />
          <EditableText id="home.feat2.desc" as="p" multiline defaultText={l.f2d} className="text-sm sm:text-base text-gray-600 leading-relaxed" />
        </div>
        <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 break-inside-avoid">
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4"><Zap className="w-6 h-6 text-indigo-600" /></div>
          <EditableText id="home.feat3.title" as="h3" defaultText={l.f3t} className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" />
          <EditableText id="home.feat3.desc" as="p" multiline defaultText={l.f3d} className="text-sm sm:text-base text-gray-600 leading-relaxed" />
        </div>
        <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 break-inside-avoid">
          <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center mb-4"><BarChart2 className="w-6 h-6 text-brand-accent" /></div>
          <EditableText id="home.feat4.title" as="h3" defaultText={l.f4t} className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" />
          <EditableText id="home.feat4.desc" as="p" multiline defaultText={l.f4d} className="text-sm sm:text-base text-gray-600 leading-relaxed" />
        </div>
      </div>

      <RecentBlogs
        recentEn={recentEn}
        recentIt={recentIt}
        recentEs={recentEs}
        recentPl={recentPl}
      />

      <div className="bg-brand-blue rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center text-white relative overflow-hidden print:hidden">
        <div className="relative z-10">
          <EditableText id="home.bottom.title" as="h2" defaultText={l.bt} className="text-2xl sm:text-3xl font-bold mb-4" />
          <EditableText id="home.bottom.desc" as="p" defaultText={l.bd} className="text-blue-100 mb-8 max-w-2xl mx-auto text-sm sm:text-base" />
          <Button onClick={onStart} variant="secondary" className="w-full sm:w-auto mx-auto px-8 py-3 text-lg font-semibold">
            <EditableText id="home.bottom.cta" defaultText={l.bcta} as="span" />
          </Button>
        </div>
        <div className="absolute top-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>
      </div>
    </div>
  );
};

/**
 * HeroCrystal — abstract crystalline geometry inspired by Ternio's hero,
 * adapted for a light theme. Suggests data-precision/diagnostics rather
 * than blockchain. Pure SVG with CSS-animated floating motion.
 */
const HeroCrystal: React.FC = () => (
  <div className="relative w-full h-full">
    <style>{`
      @keyframes hc-float-a { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-14px) rotate(1.2deg); } }
      @keyframes hc-float-b { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(10px) rotate(-1.5deg); } }
      @keyframes hc-float-c { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(2deg); } }
      @keyframes hc-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .hc-float-a { animation: hc-float-a 7s ease-in-out infinite; transform-origin: center; }
      .hc-float-b { animation: hc-float-b 9s ease-in-out infinite; transform-origin: center; }
      .hc-float-c { animation: hc-float-c 6s ease-in-out infinite; transform-origin: center; }
      .hc-spin-slow { animation: hc-spin 40s linear infinite; transform-origin: center; }
      @media (prefers-reduced-motion: reduce) { .hc-float-a, .hc-float-b, .hc-float-c, .hc-spin-slow { animation: none; } }
    `}</style>

    {/* Soft halo glow */}
    <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.18),transparent_70%)] blur-2xl" />

    {/* Slowly rotating concentric ring */}
    <svg viewBox="0 0 500 500" className="absolute inset-0 w-full h-full hc-spin-slow">
      <circle cx="250" cy="250" r="218" fill="none" stroke="rgba(37,99,235,0.12)" strokeWidth="1" strokeDasharray="2 7" />
      <circle cx="250" cy="250" r="180" fill="none" stroke="rgba(37,99,235,0.18)" strokeWidth="1" strokeDasharray="1 5" />
    </svg>

    {/* Main crystal */}
    <svg viewBox="0 0 500 500" className="relative w-full h-full">
      <defs>
        <linearGradient id="hc-grad-main" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="55%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="hc-grad-facet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DBEAFE" />
          <stop offset="100%" stopColor="#93C5FD" />
        </linearGradient>
        <linearGradient id="hc-grad-sat" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <filter id="hc-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#1E3A8A" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Connecting dotted lines (drawn before crystals so they sit behind) */}
      <line x1="285" y1="180" x2="385" y2="115" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2 4" opacity="0.45" />
      <line x1="205" y1="320" x2="120" y2="365" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2 4" opacity="0.45" />

      {/* Main hexagonal crystal */}
      <g className="hc-float-a" filter="url(#hc-shadow)">
        <g transform="translate(250 250)">
          {/* base hexagon */}
          <polygon points="0,-140 121,-70 121,70 0,140 -121,70 -121,-70" fill="url(#hc-grad-main)" />
          {/* upper-left facet (lighter) */}
          <polygon points="0,-140 121,-70 0,0 -121,-70" fill="url(#hc-grad-facet)" opacity="0.92" />
          {/* lower-right facet (darker accent for depth) */}
          <polygon points="0,0 121,-70 121,70 0,140" fill="#1E3A8A" opacity="0.20" />
          {/* central spine */}
          <line x1="0" y1="-140" x2="0" y2="140" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
          <line x1="-121" y1="-70" x2="121" y2="-70" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          {/* outline */}
          <polygon points="0,-140 121,-70 121,70 0,140 -121,70 -121,-70" fill="none" stroke="white" strokeWidth="1.5" opacity="0.85" />
          {/* pulsing core dot */}
          <circle cx="0" cy="-30" r="5" fill="white">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="r" values="4;6;4" dur="2.4s" repeatCount="indefinite" />
          </circle>
        </g>
      </g>

      {/* Top-right satellite — diamond */}
      <g className="hc-float-b" filter="url(#hc-shadow)">
        <g transform="translate(395 105)">
          <polygon points="0,-32 32,0 0,32 -32,0" fill="url(#hc-grad-sat)" />
          <polygon points="0,-32 32,0 0,0" fill="#DBEAFE" opacity="0.85" />
          <polygon points="0,-32 32,0 0,32 -32,0" fill="none" stroke="white" strokeWidth="1.5" opacity="0.9" />
        </g>
      </g>

      {/* Bottom-left satellite — small triangle/diamond */}
      <g className="hc-float-c" filter="url(#hc-shadow)">
        <g transform="translate(105 380)">
          <polygon points="0,-22 22,0 0,22 -22,0" fill="url(#hc-grad-sat)" opacity="0.95" />
          <polygon points="0,-22 22,0 0,22 -22,0" fill="none" stroke="white" strokeWidth="1.5" opacity="0.9" />
        </g>
      </g>

      {/* Scattered particle dots */}
      <g opacity="0.55">
        <circle cx="60" cy="180" r="2" fill="#3B82F6" />
        <circle cx="440" cy="260" r="2.5" fill="#60A5FA" />
        <circle cx="180" cy="60" r="1.5" fill="#3B82F6" />
        <circle cx="430" cy="380" r="1.5" fill="#3B82F6" />
        <circle cx="80" cy="450" r="2" fill="#60A5FA" />
      </g>
    </svg>
  </div>
);