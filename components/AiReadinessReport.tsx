'use client';

import React, { useMemo, useRef, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  Eye,
  Gauge,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Download,
  Loader2,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  FileText,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  parseAiReadinessReport,
  tierFromScore,
  tierColor,
  type TierKey,
} from '../lib/parseAiReport';
import type { Language } from '../types';
import { Button } from './Button';

interface AiReadinessReportProps {
  markdown: string;
  auditedUrl: string;
  language: Language;
  onReset: () => void;
}

interface UiStrings {
  eyebrow: string;
  reportHeading: string;
  reportFor: string;
  observed: string;
  scoring: string;
  category: string;
  weight: string;
  score: string;
  issues: string;
  impact: string;
  pages: string;
  uplift: string;
  fix: string;
  pointsLift: string;
  current: string;
  projected: string;
  pointsBetter: string;
  strategic: string;
  download: string;
  generating: string;
  another: string;
  ctaTitle: string;
  ctaSub: string;
  ctaButton: string;
  tier: Record<TierKey, string>;
  outOf: string;
  noScore: string;
}

const labels: Record<Language, UiStrings> = {
  en: {
    eyebrow: 'AI Visibility Audit',
    reportHeading: 'Your AI Readiness Report',
    reportFor: 'Report for',
    observed: 'What we observed',
    scoring: 'Weighted scoring breakdown',
    category: 'Category',
    weight: 'Weight',
    score: 'Score',
    issues: 'Recurring issues',
    impact: 'Impact on AI search',
    pages: 'Pages affected',
    uplift: 'Estimated score uplift',
    fix: 'Recommended fix',
    pointsLift: 'Score lift',
    current: 'Current',
    projected: 'After fixes',
    pointsBetter: 'point gain',
    strategic: 'Strategic advantage with Bookassist',
    download: 'Download PDF',
    generating: 'Exporting…',
    another: 'Audit another site',
    ctaTitle: 'Improve your AI Visibility today',
    ctaSub: 'Book a free consultation with a Bookassist strategist',
    ctaButton: 'Book a Demo',
    tier: {
      optimised: 'AI-optimised',
      near: 'Near AI-ready',
      below: 'Below AI-ready threshold',
      low: 'Low AI visibility',
    },
    outOf: 'of 100',
    noScore: 'Score not detected',
  },
  it: {
    eyebrow: 'Audit di Visibilità AI',
    reportHeading: 'Il tuo Report di AI Readiness',
    reportFor: 'Report per',
    observed: 'Cosa abbiamo osservato',
    scoring: 'Punteggio ponderato',
    category: 'Categoria',
    weight: 'Peso',
    score: 'Punteggio',
    issues: 'Problemi ricorrenti',
    impact: 'Impatto sulla ricerca AI',
    pages: 'Pagine interessate',
    uplift: 'Potenziale incremento del punteggio',
    fix: 'Correzione consigliata',
    pointsLift: 'Punti guadagnati',
    current: 'Attuale',
    projected: 'Dopo le correzioni',
    pointsBetter: 'punti in più',
    strategic: 'Vantaggio strategico con Bookassist',
    download: 'Scarica PDF',
    generating: 'Esportazione…',
    another: 'Audit di un altro sito',
    ctaTitle: 'Migliora la tua visibilità AI oggi',
    ctaSub: 'Prenota una consulenza gratuita con uno stratega Bookassist',
    ctaButton: 'Prenota una Demo',
    tier: {
      optimised: 'Ottimizzato per AI',
      near: 'Quasi AI-ready',
      below: 'Sotto la soglia AI-ready',
      low: 'Bassa visibilità AI',
    },
    outOf: 'su 100',
    noScore: 'Punteggio non rilevato',
  },
  es: {
    eyebrow: 'Auditoría de Visibilidad IA',
    reportHeading: 'Tu Informe de AI Readiness',
    reportFor: 'Informe para',
    observed: 'Lo que hemos observado',
    scoring: 'Puntuación ponderada',
    category: 'Categoría',
    weight: 'Peso',
    score: 'Puntuación',
    issues: 'Problemas recurrentes',
    impact: 'Impacto en la búsqueda IA',
    pages: 'Páginas afectadas',
    uplift: 'Mejora potencial de la puntuación',
    fix: 'Corrección recomendada',
    pointsLift: 'Puntos ganados',
    current: 'Actual',
    projected: 'Tras las correcciones',
    pointsBetter: 'puntos más',
    strategic: 'Ventaja estratégica con Bookassist',
    download: 'Descargar PDF',
    generating: 'Exportando…',
    another: 'Auditar otro sitio',
    ctaTitle: 'Mejora tu visibilidad IA hoy',
    ctaSub: 'Reserva una consulta gratuita con un estratega de Bookassist',
    ctaButton: 'Reservar una Demo',
    tier: {
      optimised: 'Optimizado para IA',
      near: 'Cerca de AI-ready',
      below: 'Por debajo del umbral AI-ready',
      low: 'Baja visibilidad IA',
    },
    outOf: 'sobre 100',
    noScore: 'Puntuación no detectada',
  },
  pl: {
    eyebrow: 'Audyt Widoczności AI',
    reportHeading: 'Twój Raport AI Readiness',
    reportFor: 'Raport dla',
    observed: 'Co zauważyliśmy',
    scoring: 'Ważona punktacja',
    category: 'Kategoria',
    weight: 'Waga',
    score: 'Punkty',
    issues: 'Powtarzające się problemy',
    impact: 'Wpływ na wyszukiwanie AI',
    pages: 'Dotknięte strony',
    uplift: 'Potencjalny wzrost punktacji',
    fix: 'Rekomendowana poprawka',
    pointsLift: 'Wzrost punktów',
    current: 'Obecnie',
    projected: 'Po poprawkach',
    pointsBetter: 'punktów więcej',
    strategic: 'Strategiczna przewaga z Bookassist',
    download: 'Pobierz PDF',
    generating: 'Eksportowanie…',
    another: 'Audyt innej strony',
    ctaTitle: 'Popraw swoją widoczność AI już dziś',
    ctaSub: 'Umów bezpłatną konsultację ze strategiem Bookassist',
    ctaButton: 'Zamów Demo',
    tier: {
      optimised: 'Zoptymalizowany pod AI',
      near: 'Prawie AI-ready',
      below: 'Poniżej progu AI-ready',
      low: 'Niska widoczność AI',
    },
    outOf: 'na 100',
    noScore: 'Nie wykryto punktacji',
  },
  fr: {
    eyebrow: 'Audit Visibilité IA',
    reportHeading: 'Votre rapport AI Readiness',
    reportFor: 'Rapport pour',
    observed: 'Ce que nous avons observé',
    scoring: 'Note pondérée',
    category: 'Catégorie',
    weight: 'Poids',
    score: 'Note',
    issues: 'Problèmes récurrents',
    impact: 'Impact sur la recherche IA',
    pages: 'Pages concernées',
    uplift: 'Gain de score estimé',
    fix: 'Correction recommandée',
    pointsLift: 'Gain de points',
    current: 'Actuel',
    projected: 'Après corrections',
    pointsBetter: 'points de mieux',
    strategic: 'Avantage stratégique avec Bookassist',
    download: 'Télécharger le PDF',
    generating: 'Exportation…',
    another: 'Auditer un autre site',
    ctaTitle: "Améliorez votre visibilité IA aujourd'hui",
    ctaSub: 'Réservez une consultation gratuite avec un stratège Bookassist',
    ctaButton: 'Réserver une Démo',
    tier: {
      optimised: 'Optimisé pour IA',
      near: 'Presque AI-ready',
      below: 'Sous le seuil AI-ready',
      low: 'Faible visibilité IA',
    },
    outOf: 'sur 100',
    noScore: 'Score non détecté',
  },
  de: {
    eyebrow: 'KI-Sichtbarkeitsaudit',
    reportHeading: 'Ihr AI-Readiness-Bericht',
    reportFor: 'Bericht für',
    observed: 'Was wir beobachtet haben',
    scoring: 'Gewichtete Bewertung',
    category: 'Kategorie',
    weight: 'Gewicht',
    score: 'Punkte',
    issues: 'Wiederkehrende Probleme',
    impact: 'Auswirkung auf KI-Suche',
    pages: 'Betroffene Seiten',
    uplift: 'Geschätztes Punkte-Plus',
    fix: 'Empfohlene Korrektur',
    pointsLift: 'Punkte-Gewinn',
    current: 'Aktuell',
    projected: 'Nach Korrekturen',
    pointsBetter: 'Punkte mehr',
    strategic: 'Strategischer Vorteil mit Bookassist',
    download: 'PDF herunterladen',
    generating: 'Export läuft…',
    another: 'Andere Website auditieren',
    ctaTitle: 'Verbessern Sie Ihre KI-Sichtbarkeit noch heute',
    ctaSub: 'Buchen Sie eine kostenlose Beratung mit einem Bookassist-Strategen',
    ctaButton: 'Demo buchen',
    tier: {
      optimised: 'KI-optimiert',
      near: 'Fast KI-bereit',
      below: 'Unter KI-Bereitschaftsschwelle',
      low: 'Niedrige KI-Sichtbarkeit',
    },
    outOf: 'von 100',
    noScore: 'Punktzahl nicht erkannt',
  },
  cs: {
    eyebrow: 'Audit AI viditelnosti',
    reportHeading: 'Vaše zpráva AI Readiness',
    reportFor: 'Zpráva pro',
    observed: 'Co jsme pozorovali',
    scoring: 'Vážené bodování',
    category: 'Kategorie',
    weight: 'Váha',
    score: 'Body',
    issues: 'Opakující se problémy',
    impact: 'Dopad na AI vyhledávání',
    pages: 'Dotčené stránky',
    uplift: 'Odhadovaný nárůst bodů',
    fix: 'Doporučená oprava',
    pointsLift: 'Nárůst bodů',
    current: 'Aktuálně',
    projected: 'Po opravách',
    pointsBetter: 'bodů navíc',
    strategic: 'Strategická výhoda s Bookassist',
    download: 'Stáhnout PDF',
    generating: 'Exportování…',
    another: 'Audit jiného webu',
    ctaTitle: 'Zlepšete svou AI viditelnost ještě dnes',
    ctaSub: 'Rezervujte si bezplatnou konzultaci se strategem Bookassist',
    ctaButton: 'Rezervovat demo',
    tier: {
      optimised: 'AI-optimalizováno',
      near: 'Téměř AI-ready',
      below: 'Pod prahem AI-ready',
      low: 'Nízká AI viditelnost',
    },
    outOf: 'ze 100',
    noScore: 'Skóre nebylo zjištěno',
  },
};

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export const AiReadinessReport: React.FC<AiReadinessReportProps> = ({
  markdown,
  auditedUrl,
  language,
  onReset,
}) => {
  const l = labels[language] ?? labels.en;
  const parsed = useMemo(() => parseAiReadinessReport(markdown), [markdown]);
  const tier = tierFromScore(parsed.overallScore);
  const accent = tierColor(tier);

  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const parsedSomething =
    parsed.overallScore !== null ||
    parsed.observedParagraph !== null ||
    parsed.scoringRows !== null ||
    parsed.issuesRows !== null ||
    parsed.fixesRows !== null ||
    parsed.strategicAdvantage !== null;

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf || !dashboardRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const html2pdf = (window as any).html2pdf;
      const hostname = safeHostname(auditedUrl);
      const filename = `AI-Readiness-${hostname}-${parsed.overallScore ?? 'report'}.pdf`;
      if (html2pdf) {
        await html2pdf()
          .from(dashboardRef.current)
          .set({
            margin: [10, 8, 10, 8],
            filename,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#F4F6F8' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'], avoid: ['.pdf-avoid-break'] },
          })
          .save();
      } else {
        window.print();
      }
    } catch {
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const hotelDisplay = parsed.hotelName || safeHostname(auditedUrl);
  const projectedScore = parsed.projectedScore ?? null;
  const pointGain =
    parsed.overallScore !== null && projectedScore !== null
      ? Math.max(0, projectedScore - parsed.overallScore)
      : null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-12 lg:px-8">
      {/* Top bar — eyebrow + buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 no-print">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-brand-blue text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" /> {l.eyebrow}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {l.reportHeading}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleDownloadPdf}
            variant="outline"
            disabled={isGeneratingPdf}
            className="px-5 py-3 text-sm"
          >
            {isGeneratingPdf ? <Loader2 size={16} className="animate-spin mr-2" /> : <Download size={16} className="mr-2" />}
            {isGeneratingPdf ? l.generating : l.download}
          </Button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:border-brand-blue hover:text-brand-blue transition-colors"
          >
            <RotateCcw size={14} /> {l.another}
          </button>
        </div>
      </div>

      {/* DASHBOARD — captured into PDF */}
      <div ref={dashboardRef} className="flex flex-col gap-6">

        {/* HERO SCORE */}
        <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden pdf-avoid-break">
          <div className="p-8 sm:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-shrink-0 relative w-40 h-40 sm:w-48 sm:h-48">
              {parsed.overallScore !== null ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Score', value: parsed.overallScore },
                          { name: 'Gap', value: 100 - parsed.overallScore },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius="80%"
                        outerRadius="100%"
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                        isAnimationActive={false}
                      >
                        <Cell fill={accent} />
                        <Cell fill="#F3F4F6" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-black" style={{ color: accent }}>
                      {parsed.overallScore}
                    </span>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                      {l.outOf}
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-center text-xs text-gray-400 font-bold uppercase tracking-widest px-4">
                  {l.noScore}
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              {tier && (
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest mb-4"
                  style={{ backgroundColor: `${accent}1A`, color: accent }}
                >
                  <Gauge className="w-3.5 h-3.5" />
                  {l.tier[tier]}
                </div>
              )}
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-2">
                {hotelDisplay}
              </h2>
              <p className="text-sm text-gray-500 break-all">
                <span className="font-semibold text-gray-400 mr-1">{l.reportFor}:</span>
                <span className="text-brand-blue font-semibold">{safeHostname(auditedUrl)}</span>
              </p>
              {pointGain !== null && pointGain > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-xs text-gray-400 font-black uppercase tracking-widest">{l.current}</span>
                    <span className="text-lg font-black text-gray-900">{parsed.overallScore}</span>
                  </div>
                  <ArrowRight size={16} className="text-gray-300" />
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl border" style={{ backgroundColor: `${accent}10`, borderColor: `${accent}33` }}>
                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>{l.projected}</span>
                    <span className="text-lg font-black" style={{ color: accent }}>{projectedScore}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-500">+{pointGain} {l.pointsBetter}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* WHAT WE OBSERVED */}
        {parsed.observedParagraph && (
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden pdf-avoid-break">
            <div className="px-6 sm:px-10 pt-6 pb-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">{l.observed}</h3>
            </div>
            <div className="px-6 sm:px-10 pb-8 prose prose-slate max-w-none prose-p:text-gray-700 prose-p:text-base sm:prose-p:text-lg prose-p:leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.observedParagraph}</ReactMarkdown>
            </div>
          </section>
        )}

        {/* SCORING BREAKDOWN */}
        {parsed.scoringRows && parsed.scoringRows.length > 0 && (
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden pdf-avoid-break">
            <div className="px-6 sm:px-10 pt-6 pb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Gauge className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">{l.scoring}</h3>
              </div>
            </div>
            <div className="px-6 sm:px-10 pb-8 space-y-4">
              {parsed.scoringRows.map((row, i) => {
                const ratio = row.weight > 0 ? Math.max(0, Math.min(1, row.score / row.weight)) : 0;
                const barColor =
                  ratio >= 0.8 ? '#2A9D8F' :
                  ratio >= 0.5 ? '#F59E0B' :
                  ratio > 0 ? '#FF8F1B' : '#E63946';
                return (
                  <div key={i}>
                    <div className="flex items-baseline justify-between gap-4 mb-1.5">
                      <span className="text-sm sm:text-base font-semibold text-gray-800 leading-tight">{row.category}</span>
                      <span className="text-sm font-black text-gray-900 whitespace-nowrap">
                        {row.score}<span className="text-gray-400 font-normal"> / {row.weight}</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${ratio * 100}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* RECURRING ISSUES */}
        {parsed.issuesRows && parsed.issuesRows.length > 0 && (
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden pdf-avoid-break">
            <div className="px-6 sm:px-10 pt-6 pb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-brand-accent flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">{l.issues}</h3>
            </div>
            <div className="px-6 sm:px-10 pb-8 space-y-3">
              {parsed.issuesRows.map((row, i) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-rose-200 transition-colors"
                >
                  <div className="md:w-2/5">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">{l.issues}</p>
                    <p className="text-sm font-bold text-gray-900 leading-snug">{row.issue}</p>
                  </div>
                  <div className="md:w-2/5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{l.impact}</p>
                    <p className="text-sm text-gray-700 leading-snug">{row.impact}</p>
                  </div>
                  <div className="md:w-1/5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{l.pages}</p>
                    <p className="text-sm text-gray-600 leading-snug">{row.pagesAffected || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SCORE UPLIFT */}
        {parsed.fixesRows && parsed.fixesRows.length > 0 && (
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden pdf-avoid-break">
            <div className="px-6 sm:px-10 pt-6 pb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">{l.uplift}</h3>
            </div>
            <div className="px-6 sm:px-10 pb-8">
              <div className="space-y-2 mb-6">
                {parsed.fixesRows.map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50/50"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">
                        {i + 1}
                      </div>
                      <span className="text-sm text-gray-800 leading-snug">{row.fix}</span>
                    </div>
                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black tracking-wide">
                      +{row.pointsIncrease}
                    </span>
                  </div>
                ))}
              </div>

              {projectedScore !== null && parsed.overallScore !== null && (
                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6">
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div>
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">{l.projected}</p>
                      <p className="text-4xl font-black text-emerald-700 leading-none">
                        {projectedScore}<span className="text-2xl text-emerald-400 font-normal"> / 100</span>
                      </p>
                    </div>
                    <div className="flex-1 min-w-[180px]">
                      <div className="h-3 w-full bg-emerald-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${projectedScore}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] mt-1.5 font-bold text-emerald-700/70 uppercase tracking-widest">
                        <span>{l.current}: {parsed.overallScore}</span>
                        <span>+{projectedScore - parsed.overallScore} {l.pointsBetter}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* STRATEGIC ADVANTAGE */}
        {parsed.strategicAdvantage && (
          <section className="bg-brand-blue text-white rounded-3xl shadow-2xl overflow-hidden pdf-avoid-break">
            <div className="px-6 sm:px-10 pt-6 pb-4 flex items-center gap-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold tracking-tight">{l.strategic}</h3>
            </div>
            <div className="px-6 sm:px-10 py-8 prose prose-invert max-w-none prose-p:text-blue-50 prose-p:text-base sm:prose-p:text-lg prose-p:leading-relaxed prose-strong:text-white">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.strategicAdvantage}</ReactMarkdown>
            </div>
          </section>
        )}

        {/* Unrecognised extra sections — fallback so we never silently drop content */}
        {parsed.unrecognisedSections.map((sec, i) => (
          <section key={i} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden pdf-avoid-break">
            <div className="px-6 sm:px-10 pt-6 pb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">{sec.heading}</h3>
            </div>
            <div className="px-6 sm:px-10 pb-8 prose prose-slate max-w-none prose-p:text-gray-700">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{sec.body}</ReactMarkdown>
            </div>
          </section>
        ))}

        {/* If nothing parsed at all, render the raw markdown so the user still sees their report. */}
        {!parsedSomething && (
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden pdf-avoid-break">
            <div className="px-6 sm:px-10 py-8 prose prose-slate max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
          </section>
        )}

        {/* CTA — kept inside the dashboard so it shows on the PDF too */}
        <a
          href="https://bookassist.com/book-a-demo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col md:flex-row items-center gap-6 bg-brand-blue text-white p-8 rounded-3xl shadow-xl transition-all hover:scale-[1.01] no-underline pdf-avoid-break"
        >
          <div className="flex-shrink-0 w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
            <ExternalLink className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-xl sm:text-2xl font-black leading-tight tracking-tight text-white">{l.ctaTitle}</p>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mt-1">{l.ctaSub}</p>
          </div>
          <div className="flex items-center gap-2 bg-white text-brand-blue px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-md whitespace-nowrap flex-shrink-0">
            {l.ctaButton} <ArrowRight size={16} className="ml-1" />
          </div>
        </a>
      </div>
    </div>
  );
};
