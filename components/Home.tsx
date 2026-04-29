'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './Button';
import { ShieldCheck, BarChart2, Globe, Zap } from 'lucide-react';
import { EditableText } from './Editable';
import { RecentBlogs } from './RecentBlogs';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';
import { localePrefix } from '../lib/i18n';
import type { BlogPostMeta } from '../lib/blog';

interface HomeProps {
  onStart: () => void;
  recentEn: BlogPostMeta[];
  recentIt: BlogPostMeta[];
  recentEs: BlogPostMeta[];
  recentPl: BlogPostMeta[];
  recentFr: BlogPostMeta[];
  recentDe: BlogPostMeta[];
  recentCs: BlogPostMeta[];
}

export const Home: React.FC<HomeProps> = ({ onStart, recentEn, recentIt, recentEs, recentPl, recentFr, recentDe, recentCs }) => {
  const { language } = useContent();
  const router = useRouter();
  const [hbActive, setHbActive] = useState(false);
  const [hbKey, setHbKey] = useState(0);

  const labelsMap: Record<Language, any> = {
    en: { eyebrow: 'Hotel Tech Diagnostics', trustMicro: 'Free • 3 minutes', title: 'Maximise Your <span class="text-brand-blue">Digital Revenue</span> Potential', subtitle: "The Direct Booking Health Score is the industry standard for assessing hospitality technology infrastructure. We analyse your <strong>Direct Booking Strategy</strong>, <strong>Metasearch Connectivity</strong>, and <strong>Marketing ROI</strong> to identify critical performance gaps.", cta: "Launch Free Tech Audit", cta1: "Launch Hotel Tech Audit", cta2: "Launch AI Visibility Audit", f1t: "Secure Your Data", f1d: "In an era of privacy-first browsing, legacy tracking destroys attribution. Our audit checks for <strong>GA4 implementation</strong> and <strong>First-Party Data compliance</strong>.", f2t: "Dominate Metasearch", f2d: "Are you bidding on parity-loss dates? <strong>Metasearch Optimisation</strong> requires granular inventory management and real-time rate parity checks.", f3t: "High-Conversion Engines", f3d: "Friction kills conversion. From <strong>Digital Wallets</strong> to dynamic multi-currency, modern travellers demand a seamless experience.", f4t: "AI-Driven Personalisation", f4d: "Leverage <strong>Predictive Analytics</strong> and <strong>Dynamic Content Personalisation</strong> to serve the right offer to the right guest.", bt: "Ready to diagnose your digital health?", bd: "Join thousands of hoteliers optimising their revenue strategy. The audit takes less than 3 minutes.", bcta: "Start Assessment Now" },
    it: { eyebrow: 'Diagnostica Tech Alberghiera', trustMicro: 'Gratis • 3 minuti', title: 'Massimizza il tuo <span class="text-brand-blue">Potenziale di Ricavo</span> Digitale', subtitle: "Il Direct Booking Health Score è lo standard del settore per valutare l'infrastruttura tecnologica alberghiera. Analizziamo la tua <strong>Strategia di Prenotazione Diretta</strong> e il <strong>ROI del Marketing</strong>.", cta: "Lancia l'Audit Gratuito", cta1: "Avvia Audit Tecnologico", cta2: "Avvia Audit di Visibilità AI", f1t: "Proteggi i Tuoi Dati", f1d: "In un'era incentrata sulla privacy, il tracciamento legacy distrugge l'attribuzione. Verifichiamo la <strong>conformità ai dati di prima parte</strong>.", f2t: "Domina i Metamotori", f2d: "Stai puntando su date in perdita di parità? L'<strong>Ottimizzazione dei Metamotori</strong> richiede una gestione granulare dell'inventario.", f3t: "Motori ad Alta Conversione", f3d: "La frizione uccide la conversione. Dai <strong>Portafogli Digitali</strong> alle multi-valute dinamiche, i viaggiatori esigono fluidità.", f4t: "Personalizzazione AI", f4d: "Sfrutta l'<strong>Analisi Predittiva</strong> e la <strong>Personalizzazione dei Contenuti</strong> per servire l'offerta giusta all'ospite giusto.", bt: "Pronto a diagnosticare la tua salute digitale?", bd: "Unisciti a migliaia di albergatori che ottimizzano la loro strategia. L'audit richiede meno di 3 minuti.", bcta: "Inizia la Valutazione" },
    es: { eyebrow: 'Diagnóstico Tech Hotelero', trustMicro: 'Gratis • 3 minutos', title: 'Maximiza tu <span class="text-brand-blue">Potencial de Ingresos</span> Digitales', subtitle: "Direct Booking Health Score es el estándar de la industria para evaluar la infraestructura tecnológica hotelera. Analizamos tu <strong>Estrategia de Reserva Directa</strong> y el <strong>ROI de Marketing</strong>.", cta: "Iniciar Auditoría Gratuita", cta1: "Iniciar Auditoría Técnica", cta2: "Iniciar Auditoría de Visibilidad IA", f1t: "Asegura tus Datos", f1d: "En la era de la privacidad, el seguimiento heredado destruye la atribución. Comprobamos la <strong>implementación de GA4</strong> y el cumplimiento de datos.", f2t: "Domina los Metabuscadores", f2d: "¿Estás pujando en fechas sin paridad? La <strong>Optimización de Metabuscadores</strong> requiere gestión de inventario en tiempo real.", f3t: "Motores de Alta Conversión", f3d: "La fricción mata la conversión. Desde <strong>Billeteras Digitales</strong> hasta multidivisa dinámica, el viajero exige fluidez.", f4t: "Personalización con IA", f4d: "Utiliza <strong>Analítica Predictiva</strong> y <strong>Personalización de Contenido</strong> para ofrecer la oferta adecuada al huésped adecuado.", bt: "¿Listo para diagnosticar tu salud digital?", bd: "Únete a miles de hoteleros que optimizan su estrategia. La auditoría toma menos de 3 minutos.", bcta: "Iniciar Evaluación Ahora" },
    pl: { eyebrow: 'Diagnostyka Tech Hotelowa', trustMicro: 'Darmowe • 3 minuty', title: 'Zmaksymalizuj swój <span class="text-brand-blue">Potencjał Przychodów</span> Cyfrowych', subtitle: "Direct Booking Health Score to standard branżowy w ocenie infrastruktury technologicznej w hotelarstwie. Analizujemy Twoją <strong>Strategię Rezerwacji Bezpośrednich</strong> i <strong>ROI Marketingu</strong>, aby zidentyfikować kluczowe luki wydajności.", cta: "Uruchom Bezpłatny Audyt Technologiczny", cta1: "Uruchom Audyt Techniczny", cta2: "Uruchom Audyt Widoczności AI", f1t: "Zabezpiecz Swoje Dane", f1d: "W erze przeglądania zorientowanego na prywatność, starsze metody śledzenia niszczą atrybucję. Nasz audyt sprawdza <strong>wdrożenie GA4</strong> i <strong>zgodność z danymi własnymi</strong>.", f2t: "Zdominuj Metawyszukiwarki", f2d: "Czy licytujesz w dniach utraty parytetu? <strong>Optymalizacja Metawyszukiwarek</strong> wymaga precyzyjnego zarządzania inwentarzem i weryfikacji parytetu cen w czasie rzeczywistym.", f3t: "Silniki o Wysokiej Konwersji", f3d: "Tarcie zabija konwersję. Od <strong>Portfeli Cyfrowych</strong> po dynamiczną obsługę wielu walut, nowocześni podróżni oczekują płynnego doświadczenia.", f4t: "Personalizacja oparta na AI", f4d: "Wykorzystaj <strong>Analitykę Predykcyjną</strong> i <strong>Dynamiczną Personalizację Treści</strong>, aby dostarczać właściwą ofertę właściwemu gościowi.", bt: "Gotowy, by zdiagnozować swoje cyfrowe zdrowie?", bd: "Dołącz do tysięcy hotelarzy optymalizujących swoją strategię przychodów. Audyt zajmuje mniej niż 3 minuty.", bcta: "Rozpocznij Ocenę Teraz" },
    fr: { eyebrow: 'Diagnostic Tech Hôtelier', trustMicro: 'Gratuit • 3 minutes', title: 'Maximisez votre <span class="text-brand-blue">Potentiel de Revenus</span> Numériques', subtitle: "Le Direct Booking Health Score est la référence du secteur pour évaluer l'infrastructure technologique hôtelière. Nous analysons votre <strong>Stratégie de Réservation Directe</strong>, votre <strong>Connectivité Metasearch</strong> et votre <strong>ROI Marketing</strong> pour identifier les lacunes critiques de performance.", cta: "Lancer l'Audit Tech Gratuit", cta1: "Lancer l'Audit Technique", cta2: "Lancer l'Audit Visibilité IA", f1t: "Sécurisez vos Données", f1d: "À l'ère de la navigation centrée sur la confidentialité, le tracking hérité détruit l'attribution. Notre audit vérifie l'<strong>implémentation de GA4</strong> et la <strong>conformité des données First-Party</strong>.", f2t: "Dominez les Metasearch", f2d: "Enchérissez-vous sur des dates en perte de parité ? L'<strong>Optimisation des Metasearch</strong> requiert une gestion granulaire de l'inventaire et des vérifications de parité tarifaire en temps réel.", f3t: "Moteurs à Haute Conversion", f3d: "La friction tue la conversion. Des <strong>Portefeuilles Numériques</strong> au multi-devises dynamique, les voyageurs modernes exigent une expérience fluide.", f4t: "Personnalisation Pilotée par l'IA", f4d: "Tirez parti de l'<strong>Analyse Prédictive</strong> et de la <strong>Personnalisation Dynamique du Contenu</strong> pour servir la bonne offre au bon client.", bt: "Prêt à diagnostiquer votre santé numérique ?", bd: "Rejoignez des milliers d'hôteliers qui optimisent leur stratégie de revenus. L'audit prend moins de 3 minutes.", bcta: "Commencer l'Évaluation Maintenant" },
    de: { eyebrow: 'Hotel-Tech-Diagnostik', trustMicro: 'Kostenlos • 3 Minuten', title: 'Maximieren Sie Ihr <span class="text-brand-blue">digitales Umsatzpotenzial</span>', subtitle: "Der Direct Booking Health Score ist der Branchenstandard zur Bewertung der Hotel-Tech-Infrastruktur. Wir analysieren Ihre <strong>Direktbuchungsstrategie</strong>, Ihre <strong>Metasearch-Anbindung</strong> und Ihren <strong>Marketing-ROI</strong>, um kritische Leistungslücken zu identifizieren.", cta: "Kostenlosen Tech-Audit starten", cta1: "Hotel-Tech-Audit starten", cta2: "KI-Sichtbarkeitsaudit starten", f1t: "Schützen Sie Ihre Daten", f1d: "Im Zeitalter des Privacy-First-Browsings zerstört Legacy-Tracking die Attribution. Unser Audit prüft die <strong>GA4-Implementierung</strong> und die <strong>First-Party-Daten-Compliance</strong>.", f2t: "Dominieren Sie Metasearch", f2d: "Bieten Sie auf Daten mit Paritätsverlust? <strong>Metasearch-Optimierung</strong> erfordert granulares Inventarmanagement und Echtzeit-Ratenparitätsprüfungen.", f3t: "Hochkonvertierende Booking Engines", f3d: "Reibung tötet die Konversion. Von <strong>Digitalen Wallets</strong> bis zu dynamischen Multi-Währungen — moderne Reisende erwarten ein nahtloses Erlebnis.", f4t: "KI-gestützte Personalisierung", f4d: "Nutzen Sie <strong>Predictive Analytics</strong> und <strong>dynamische Content-Personalisierung</strong>, um dem richtigen Gast das richtige Angebot zu unterbreiten.", bt: "Bereit, Ihre digitale Gesundheit zu diagnostizieren?", bd: "Schließen Sie sich Tausenden von Hoteliers an, die ihre Umsatzstrategie optimieren. Der Audit dauert weniger als 3 Minuten.", bcta: "Bewertung jetzt starten" },
    cs: { eyebrow: 'Hotelová Tech Diagnostika', trustMicro: 'Zdarma • 3 minuty', title: 'Maximalizujte svůj <span class="text-brand-blue">potenciál digitálních příjmů</span>', subtitle: "Direct Booking Health Score je oborovým standardem pro hodnocení hotelové technologické infrastruktury. Analyzujeme vaši <strong>strategii přímých rezervací</strong>, <strong>metasearch konektivitu</strong> a <strong>marketingovou návratnost</strong> a identifikujeme kritické mezery ve výkonu.", cta: "Spustit bezplatný Tech audit", cta1: "Spustit hotelový Tech audit", cta2: "Spustit audit AI viditelnosti", f1t: "Chraňte svá data", f1d: "V éře prohlížení s důrazem na soukromí starší tracking ničí atribuci. Náš audit kontroluje <strong>implementaci GA4</strong> a <strong>shodu s first-party daty</strong>.", f2t: "Ovládněte metasearch", f2d: "Přihazujete v dnech ztráty parity? <strong>Optimalizace metasearch</strong> vyžaduje detailní správu inventáře a kontrolu cenové parity v reálném čase.", f3t: "Booking enginy s vysokou konverzí", f3d: "Tření zabíjí konverzi. Od <strong>digitálních peněženek</strong> po dynamické vícenárodní měny — moderní cestovatelé očekávají bezešvý zážitek.", f4t: "Personalizace řízená AI", f4d: "Využijte <strong>prediktivní analytiku</strong> a <strong>dynamickou personalizaci obsahu</strong>, abyste správnému hostovi nabídli správnou nabídku.", bt: "Připraveni diagnostikovat své digitální zdraví?", bd: "Připojte se k tisícům hoteliérů, kteří optimalizují svou strategii příjmů. Audit zabere méně než 3 minuty.", bcta: "Spustit hodnocení nyní" }
  };

  const l = labelsMap[language];

  return (
    <div className="relative w-full">
      {/* Hero — full viewport width; only the radial blue glow lives here.
          The dotted background is now provided site-wide by AppShell. */}
      <section
        className="relative w-full isolate overflow-hidden mb-12 sm:mb-20 print:overflow-visible"
        onMouseEnter={() => { setHbActive(true); setHbKey(k => k + 1); }}
        onMouseLeave={() => setHbActive(false)}
      >
        {/* Ambient atmosphere — hero-specific radial glow only */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 print:hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[140vw] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.12),rgba(37,99,235,0.03)_45%,transparent_70%)] blur-2xl" />
        </div>

        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heartbeat — anchored to the content wrapper so it starts at the heading's left edge */}
          <Heartbeat isActive={hbActive} animKey={hbKey} />
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center min-h-[560px] py-6 sm:py-10 lg:py-14">
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

            <div className="flex flex-col sm:flex-row gap-3 pt-2 print:hidden">
              <button
                onClick={onStart}
                className="inline-flex items-center justify-center gap-2 bg-brand-blue text-white px-7 py-4 rounded-full text-sm font-black uppercase tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all w-full sm:w-auto"
              >
                <EditableText id="home.hero.cta1" defaultText={l.cta1} as="span" />
              </button>
              <button
                onClick={() => router.push(`${localePrefix(language)}/ai-visibility-audit`)}
                className="group inline-flex items-center justify-center gap-2 bg-brand-success text-white px-7 py-4 rounded-full text-sm font-black uppercase tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all w-full sm:w-auto"
              >
                <img src="/ai-logo.svg" alt="" width={22} height={22} className="flex-shrink-0 transition-transform group-hover:scale-110" />
                <EditableText id="home.hero.cta2" defaultText={l.cta2} as="span" />
              </button>
            </div>
          </div>

          {/* Right: kept for grid balance; heartbeat overlays the section */}
            <div className="hidden lg:block lg:col-span-5" aria-hidden="true" />
          </div>
        </div>
      </section>

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-12">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-12 mb-12 sm:mb-20">
        <style>{`
          .flip-card { perspective: 1200px; }
          .flip-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
            transform-style: preserve-3d;
          }
          .flip-card:hover .flip-card-inner,
          .flip-card:focus-within .flip-card-inner { transform: rotateY(180deg); }
          .flip-card-face {
            position: absolute;
            inset: 0;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            border-radius: 1rem;
          }
          .flip-card-back { transform: rotateY(180deg); }
          @media (prefers-reduced-motion: reduce) { .flip-card-inner { transition: none; } }
        `}</style>

        <div className="flip-card relative min-h-[240px] sm:min-h-[260px] break-inside-avoid">
          <div className="flip-card-inner">
            <div className="flip-card-face flip-card-front bg-white p-6 sm:p-10 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-5"><ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-brand-blue" /></div>
              <EditableText id="home.feat1.title" as="h3" defaultText={l.f1t} className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight" />
            </div>
            <div className="flip-card-face flip-card-back bg-brand-blue text-white p-5 sm:p-8 shadow-md flex items-center">
              <EditableText id="home.feat1.desc" as="p" multiline defaultText={l.f1d} className="text-base sm:text-lg text-blue-50 leading-relaxed" />
            </div>
          </div>
        </div>

        <div className="flip-card relative min-h-[240px] sm:min-h-[260px] break-inside-avoid">
          <div className="flip-card-inner">
            <div className="flip-card-face flip-card-front bg-white p-6 sm:p-10 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-50 rounded-2xl flex items-center justify-center mb-5"><Globe className="w-8 h-8 sm:w-10 sm:h-10 text-brand-success" /></div>
              <EditableText id="home.feat2.title" as="h3" defaultText={l.f2t} className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight" />
            </div>
            <div className="flip-card-face flip-card-back bg-brand-blue text-white p-5 sm:p-8 shadow-md flex items-center">
              <EditableText id="home.feat2.desc" as="p" multiline defaultText={l.f2d} className="text-base sm:text-lg text-blue-50 leading-relaxed" />
            </div>
          </div>
        </div>

        <div className="flip-card relative min-h-[240px] sm:min-h-[260px] break-inside-avoid">
          <div className="flip-card-inner">
            <div className="flip-card-face flip-card-front bg-white p-6 sm:p-10 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5"><Zap className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" /></div>
              <EditableText id="home.feat3.title" as="h3" defaultText={l.f3t} className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight" />
            </div>
            <div className="flip-card-face flip-card-back bg-brand-blue text-white p-5 sm:p-8 shadow-md flex items-center">
              <EditableText id="home.feat3.desc" as="p" multiline defaultText={l.f3d} className="text-base sm:text-lg text-blue-50 leading-relaxed" />
            </div>
          </div>
        </div>

        <div className="flip-card relative min-h-[240px] sm:min-h-[260px] break-inside-avoid">
          <div className="flip-card-inner">
            <div className="flip-card-face flip-card-front bg-white p-6 sm:p-10 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 rounded-2xl flex items-center justify-center mb-5"><BarChart2 className="w-8 h-8 sm:w-10 sm:h-10 text-brand-accent" /></div>
              <EditableText id="home.feat4.title" as="h3" defaultText={l.f4t} className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight" />
            </div>
            <div className="flip-card-face flip-card-back bg-brand-blue text-white p-5 sm:p-8 shadow-md flex items-center">
              <EditableText id="home.feat4.desc" as="p" multiline defaultText={l.f4d} className="text-base sm:text-lg text-blue-50 leading-relaxed" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <RecentBlogs
          recentEn={recentEn}
          recentIt={recentIt}
          recentEs={recentEs}
          recentPl={recentPl}
          recentFr={recentFr}
          recentDe={recentDe}
          recentCs={recentCs}
        />
      </section>

      <section className="bg-brand-blue rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center text-white relative overflow-hidden print:hidden">
        <div className="relative z-10">
          <EditableText id="home.bottom.title" as="h2" defaultText={l.bt} className="text-2xl sm:text-3xl font-bold mb-4" />
          <EditableText id="home.bottom.desc" as="p" defaultText={l.bd} className="text-blue-100 mb-8 max-w-2xl mx-auto text-sm sm:text-base" />
          <Button onClick={onStart} variant="secondary" className="w-full sm:w-auto mx-auto px-8 py-3 text-lg font-semibold">
            <EditableText id="home.bottom.cta" defaultText={l.bcta} as="span" />
          </Button>
        </div>
        <div className="absolute top-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>
      </section>
      </div>
    </div>
  );
};

/**
 * Heartbeat — ECG-style continuous line that underlines the heading on
 * the left and launches into a dramatic R-spike in the right "dead
 * space". Animates like a live heart-rate monitor: the trace
 * continuously redraws left-to-right with a glowing leading-edge dot.
 *
 * The stroke path uses a 1200x400 viewBox. A horizontal baseline at y=240
 * runs the full width; the QRS-T complex fires between x=620 and x=900
 * (visually the right column on lg+). A small T-wave bump follows.
 */
const Heartbeat: React.FC<{ isActive: boolean; animKey: number }> = ({ isActive, animKey }) => {
  const { language } = useContent();
  // Spike X position is fixed (right-column dead space) so it looks the same
  // in every language. Baseline Y is per-language because Italian and Spanish
  // titles wrap with a trailing word (Digitale / Digitales) at the row where
  // the default baseline sits — pushing baseline down for those locales keeps
  // the line under the words instead of cutting through them.
  const baselineByLanguage: Record<Language, number> = {
    en: 230,
    it: 190,
    es: 194,
    pl: 230,
    fr: 230,
    de: 230,
    cs: 230,
  };
  const b = baselineByLanguage[language] ?? 230;
  const s = b - 230; // shift applied to all spike y-coordinates

  const PATH_D =
    `M 0 ${b} ` +
    `L 760 ${b} ` +                                  // flat baseline
    `Q 772 ${b} 778 ${238 + s} ` +                   // soft turn into Q wave
    `L 790 ${250 + s} ` +
    `Q 798 ${252 + s} 804 ${242 + s} ` +             // soft turn up
    `L 820 ${70 + s} ` +                             // R wave (peak in dead space centre)
    `Q 828 ${62 + s} 836 ${70 + s} ` +               // rounded apex
    `L 852 ${390 + s} ` +                            // S wave deep overshoot
    `Q 860 ${400 + s} 870 ${390 + s} ` +             // rounded bottom
    `L 888 ${b} ` +                                  // return to baseline
    `L 970 ${b} ` +                                  // flat after main complex
    `Q 982 ${b} 988 ${218 + s} ` +                   // T wave up
    `L 1000 ${208 + s} ` +
    `Q 1010 ${208 + s} 1016 ${220 + s} ` +           // T wave down
    `L 1030 ${b} ` +
    `L 1200 ${b}`;                                   // trail to right edge

  return (
    <div
      aria-hidden="true"
      className="hidden lg:block absolute inset-y-0 left-8 right-[calc(36rem-50vw)] -z-[1] pointer-events-none print:hidden"
    >
      <style>{`
        @keyframes hb-trace {
          0% { stroke-dashoffset: 2400; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes hb-fade-trail {
          0%, 100% { opacity: 0.18; }
          50% { opacity: 0.35; }
        }
        .hb-line {
          stroke-dasharray: 1200 1200;
          stroke-dashoffset: 2400;
          animation: hb-trace 2.6s linear infinite;
          animation-play-state: ${isActive ? 'running' : 'paused'};
        }
        .hb-trail {
          animation: hb-fade-trail 2.6s ease-in-out infinite;
          animation-play-state: ${isActive ? 'running' : 'paused'};
        }
        @media (prefers-reduced-motion: reduce) {
          .hb-line, .hb-trail { animation-duration: 8s; }
        }
      `}</style>

      <svg
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <filter id="hb-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="hb-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0B1E47" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
        </defs>

        {/* Faint persistent trail (so the line doesn't fully disappear between cycles) */}
        <path
          key={`trail-${animKey}`}
          d={PATH_D}
          fill="none"
          stroke="#1E3A8A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="hb-trail"
        />

        {/* Bright leading edge — the actively drawing line */}
        <path
          key={`line-${animKey}`}
          d={PATH_D}
          fill="none"
          stroke="url(#hb-grad)"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          filter="url(#hb-glow)"
          className="hb-line"
        />
      </svg>
    </div>
  );
};

