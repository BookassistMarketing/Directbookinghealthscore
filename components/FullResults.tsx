'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  Activity, Download, Loader2, RotateCcw, AlertCircle,
  ArrowRight, ExternalLink,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Answer, AnswerValue, Language, type DynamicQuestion } from '../types';
import { useContent } from '../contexts/ContentContext';
import { checkStaffBypass, clearStaffToken, type StaffRole } from '../lib/staffBypass';
import { StaffBadge } from './StaffBadge';

// Duplicated from components/AiAudit.tsx. Inject a <script> tag if the
// expected global isn't already present. Polls for up to 3 seconds after the
// load event because some CDN bundles (jsPDF in particular) defer setting
// their global until after `load`. The `loadedFlag` argument lets us force-
// load a script even when a same-named global already exists (we use this
// for html2canvas-pro, which has to override the older html2canvas that
// app/layout.tsx still preloads for the original PDF flow).
function ensureScript<T>(
  src: string,
  getGlobal: () => T,
  loadedFlag?: string,
): Promise<T | undefined> {
  return new Promise((resolve) => {
    const w = window as any;
    if (loadedFlag && w[loadedFlag]) { resolve(getGlobal()); return; }
    if (!loadedFlag) {
      const existing = getGlobal();
      if (existing) { resolve(existing); return; }
    }
    if (typeof document === 'undefined') { resolve(undefined); return; }

    const pollUntilReady = () => {
      const start = Date.now();
      const tick = () => {
        const value = getGlobal();
        if (value) {
          if (loadedFlag) w[loadedFlag] = true;
          resolve(value);
          return;
        }
        if (Date.now() - start > 3000) { resolve(undefined); return; }
        setTimeout(tick, 50);
      };
      tick();
    };

    const previous = document.querySelector(`script[data-pdf-src="${src}"]`);
    if (previous) {
      previous.addEventListener('load', pollUntilReady, { once: true });
      previous.addEventListener('error', () => resolve(undefined), { once: true });
      return;
    }
    const tag = document.createElement('script');
    tag.src = src;
    tag.async = true;
    tag.dataset.pdfSrc = src;
    tag.addEventListener('load', pollUntilReady, { once: true });
    tag.addEventListener('error', () => resolve(undefined), { once: true });
    document.head.appendChild(tag);
  });
}

interface FullResultsProps {
  questions: DynamicQuestion[];
  answers: Answer[];
  analysis: string;
  analysisLoading: boolean;
  analysisError: string | null;
  onReset: () => void;
  siteUrl: string | null;
}

const labelsMap: Record<Language, {
  eyebrow: string;
  reportHeading: string;
  retake: string;
  pdfDownload: string;
  pdfExporting: string;
  ctaTitle: string;
  ctaSub: string;
  ctaButton: string;
  analyzing: string;
  analysisError: string;
  passingLabel: string;
  gapsLabel: string;
  statusCritical: string;
  statusRisk: string;
  statusOptimised: string;
  subCritical: string;
  subRisk: string;
  subOptimised: string;
}> = {
  en: {
    eyebrow: 'Hotel Tech Audit',
    reportHeading: 'Your Tech Audit Report',
    retake: 'Retake audit',
    pdfDownload: 'Download PDF',
    pdfExporting: 'Exporting…',
    ctaTitle: 'Improve your Tech Score today',
    ctaSub: 'Book a free consultation with a Bookassist strategist',
    ctaButton: 'Book a Demo',
    analyzing: 'AI is analysing your tech stack…',
    analysisError: 'Analysis generation failed. Please retake the audit.',
    passingLabel: 'passed',
    gapsLabel: 'critical gaps',
    statusCritical: 'Critical Condition',
    statusRisk: 'Digital Risk',
    statusOptimised: 'Optimised',
    subCritical: 'Highly vulnerable to OTA dominance.',
    subRisk: 'Missing profit-driving automation.',
    subOptimised: 'Performing well against industry benchmarks.',
  },
  it: {
    eyebrow: 'Audit Tecnologico Hotel',
    reportHeading: 'Il tuo Report di Audit Tecnologico',
    retake: "Rifai l'audit",
    pdfDownload: 'Scarica PDF',
    pdfExporting: 'Esportazione…',
    ctaTitle: 'Migliora il tuo Tech Score oggi',
    ctaSub: 'Prenota una consulenza gratuita con uno stratega Bookassist',
    ctaButton: 'Prenota una Demo',
    analyzing: "L'IA sta analizzando la tua tecnologia…",
    analysisError: "Generazione dell'analisi fallita. Riprova l'audit.",
    passingLabel: 'superati',
    gapsLabel: 'lacune critiche',
    statusCritical: 'Condizione Critica',
    statusRisk: 'Rischio Digitale',
    statusOptimised: 'Ottimizzato',
    subCritical: 'Altamente vulnerabile al dominio delle OTA.',
    subRisk: "Manca l'automazione che genera profitto.",
    subOptimised: 'Ottime prestazioni rispetto ai benchmark di settore.',
  },
  es: {
    eyebrow: 'Auditoría Tecnológica Hotelera',
    reportHeading: 'Tu Informe de Auditoría Tecnológica',
    retake: 'Repetir auditoría',
    pdfDownload: 'Descargar PDF',
    pdfExporting: 'Exportando…',
    ctaTitle: 'Mejora tu Tech Score hoy',
    ctaSub: 'Reserva una consulta gratuita con un estratega de Bookassist',
    ctaButton: 'Reservar una Demo',
    analyzing: 'La IA está analizando tu tecnología…',
    analysisError: 'La generación del análisis falló. Por favor, repite la auditoría.',
    passingLabel: 'superadas',
    gapsLabel: 'brechas críticas',
    statusCritical: 'Estado Crítico',
    statusRisk: 'Riesgo Digital',
    statusOptimised: 'Optimizado',
    subCritical: 'Altamente vulnerable al dominio de las OTA.',
    subRisk: 'Falta automatización que genere beneficios.',
    subOptimised: 'Buen desempeño frente a los estándares de la industria.',
  },
  pl: {
    eyebrow: 'Audyt Technologiczny Hotelu',
    reportHeading: 'Twój Raport Audytu Technologicznego',
    retake: 'Powtórz audyt',
    pdfDownload: 'Pobierz PDF',
    pdfExporting: 'Eksportowanie…',
    ctaTitle: 'Popraw swój Tech Score już dziś',
    ctaSub: 'Umów bezpłatną konsultację ze strategiem Bookassist',
    ctaButton: 'Zamów Demo',
    analyzing: 'AI analizuje Twój stos technologiczny…',
    analysisError: 'Generowanie analizy nie powiodło się. Spróbuj powtórzyć audyt.',
    passingLabel: 'zaliczone',
    gapsLabel: 'krytyczne luki',
    statusCritical: 'Stan Krytyczny',
    statusRisk: 'Ryzyko Cyfrowe',
    statusOptimised: 'Zoptymalizowany',
    subCritical: 'Wysoce narażony na dominację OTA.',
    subRisk: 'Brak automatyzacji generującej zyski.',
    subOptimised: 'Dobre wyniki w zestawieniu ze standardami branżowymi.',
  },
  fr: {
    eyebrow: 'Audit Tech Hôtelier',
    reportHeading: "Votre Rapport d'Audit Tech",
    retake: "Refaire l'audit",
    pdfDownload: 'Télécharger PDF',
    pdfExporting: 'Exportation…',
    ctaTitle: "Améliorez votre Tech Score dès aujourd'hui",
    ctaSub: 'Réservez une consultation gratuite avec un stratège Bookassist',
    ctaButton: 'Réserver une Démo',
    analyzing: "L'IA analyse votre stack technologique…",
    analysisError: "La génération de l'analyse a échoué. Veuillez refaire l'audit.",
    passingLabel: 'réussis',
    gapsLabel: 'lacunes critiques',
    statusCritical: 'État Critique',
    statusRisk: 'Risque Numérique',
    statusOptimised: 'Optimisé',
    subCritical: 'Hautement vulnérable à la domination des OTA.',
    subRisk: "Manque d'automatisation génératrice de profits.",
    subOptimised: 'Bonnes performances par rapport aux références du secteur.',
  },
  de: {
    eyebrow: 'Hotel-Tech-Audit',
    reportHeading: 'Ihr Tech-Audit-Bericht',
    retake: 'Audit wiederholen',
    pdfDownload: 'PDF herunterladen',
    pdfExporting: 'Export läuft…',
    ctaTitle: 'Verbessern Sie Ihren Tech Score noch heute',
    ctaSub: 'Buchen Sie eine kostenlose Beratung mit einem Bookassist-Strategen',
    ctaButton: 'Demo buchen',
    analyzing: 'Die KI analysiert Ihren Tech-Stack…',
    analysisError: 'Die Analyse konnte nicht erstellt werden. Bitte wiederholen Sie den Audit.',
    passingLabel: 'bestanden',
    gapsLabel: 'kritische Lücken',
    statusCritical: 'Kritischer Zustand',
    statusRisk: 'Digitales Risiko',
    statusOptimised: 'Optimiert',
    subCritical: 'Hochgradig anfällig für die OTA-Dominanz.',
    subRisk: 'Profitfördernde Automatisierung fehlt.',
    subOptimised: 'Gute Leistung im Vergleich zu Branchen-Benchmarks.',
  },
  cs: {
    eyebrow: 'Technologický audit hotelu',
    reportHeading: 'Vaše zpráva z technologického auditu',
    retake: 'Opakovat audit',
    pdfDownload: 'Stáhnout PDF',
    pdfExporting: 'Exportování…',
    ctaTitle: 'Zlepšete svůj Tech Score ještě dnes',
    ctaSub: 'Rezervujte si bezplatnou konzultaci se strategem Bookassist',
    ctaButton: 'Rezervovat demo',
    analyzing: 'AI analyzuje váš technologický stack…',
    analysisError: 'Generování analýzy se nezdařilo. Zopakujte prosím audit.',
    passingLabel: 'splněné',
    gapsLabel: 'kritické mezery',
    statusCritical: 'Kritický stav',
    statusRisk: 'Digitální riziko',
    statusOptimised: 'Optimalizováno',
    subCritical: 'Vysoce zranitelný vůči dominanci OTA.',
    subRisk: 'Chybí automatizace generující zisk.',
    subOptimised: 'Dobrý výkon ve srovnání s oborovými benchmarky.',
  },
};

export const FullResults: React.FC<FullResultsProps> = ({
  questions, answers, analysis, analysisLoading, analysisError, onReset, siteUrl,
}) => {
  const { language } = useContent();
  const l = labelsMap[language];

  // Score arithmetic (preserved from previous version).
  const maxScore = questions.reduce((acc, q) => acc + q.weight, 0);
  const score = answers.reduce((acc, ans) => {
    if (ans.value === AnswerValue.YES) {
      const q = questions.find(q => q.id === ans.questionId);
      return acc + (q ? q.weight : 0);
    }
    return acc;
  }, 0);
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const missingCount = answers.filter(a => a.value === AnswerValue.NO).length;
  const passingCount = answers.length - missingCount;

  // Tier mapping. Thresholds intentionally differ from the AI Audit because
  // Tech Audit's score is a weighted-quiz percentage, not Gemini's 0–100
  // rating, so the same numeric value carries a different meaning.
  let status: string, color: string, subtext: string;
  if (percentage >= 70) {
    status = l.statusOptimised; color = '#2A9D8F'; subtext = l.subOptimised;
  } else if (percentage >= 40) {
    status = l.statusRisk; color = '#F59E0B'; subtext = l.subRisk;
  } else {
    status = l.statusCritical; color = '#E63946'; subtext = l.subCritical;
  }

  const hostname = (() => {
    if (!siteUrl) return null;
    try { return new URL(siteUrl).hostname.replace(/^www\./, ''); }
    catch { return null; }
  })();

  const data = [{ name: 'Score', value: score }, { name: 'Gap', value: maxScore - score }];

  // Staff bypass — same detection as AiAudit so the Book a Demo CTA stays
  // hidden when staff are previewing/exporting the report for a lead.
  const [staffRole, setStaffRole] = useState<StaffRole | null>(null);
  const isStaffBypass = staffRole !== null;

  const pdfCaptureRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    checkStaffBypass().then(role => {
      if (!cancelled) setStaffRole(role);
    });
    return () => { cancelled = true; };
  }, []);

  const handleDownloadFullPdf = async () => {
    if (isGeneratingPdf || analysisLoading || !!analysisError || !pdfCaptureRef.current) return;
    setIsGeneratingPdf(true);
    setPdfError(null);
    try {
      // html2canvas-pro: maintained fork that supports Tailwind v4's oklch()
      // colour function. The older html2canvas (still preloaded by
      // app/layout.tsx for the legacy PDF flow) throws on oklch — force-load
      // pro and track with a flag so we override the global cleanly.
      const html2canvas = await ensureScript(
        'https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.8/dist/html2canvas-pro.min.js',
        () => (window as any).html2canvas,
        '__html2canvasProLoaded',
      );
      const jsPDFConstructor = await ensureScript(
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
        () => (window as any).jspdf?.jsPDF || (window as any).jsPDF,
      );
      if (!html2canvas || !jsPDFConstructor) {
        console.warn('[FullResults] PDF libs missing — falling back to print');
        setPdfError("Couldn't load the PDF library. Opening your browser's print dialog as a fallback — choose 'Save as PDF' there.");
        window.print();
        return;
      }

      // Atomic blocks: each direct child of pdfCaptureRef, with the markdown
      // article's children expanded so headings, tables, and paragraphs land
      // on the PDF as independent units that can respect page boundaries.
      const root = pdfCaptureRef.current;
      const blocks: HTMLElement[] = [];
      for (const child of Array.from(root.children) as HTMLElement[]) {
        if (child.tagName === 'ARTICLE') {
          for (const grand of Array.from(child.children) as HTMLElement[]) {
            blocks.push(grand);
          }
        } else {
          blocks.push(child);
        }
      }
      if (blocks.length === 0) {
        setPdfError('Nothing to export.');
        return;
      }

      const captureOpts = {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      };

      const pdf = new jsPDFConstructor({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 8;
      const marginY = 10;
      const targetWidth = pageWidth - marginX * 2;
      const usablePageHeightMm = pageHeight - marginY * 2;

      let yCursor = marginY;
      let pageIndex = 0;

      const paintPageBackground = () => {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      };

      const startNewPage = () => {
        if (pageIndex > 0) pdf.addPage();
        paintPageBackground();
        yCursor = marginY;
        pageIndex += 1;
      };

      startNewPage();

      // Page-1 letterhead — identical to AI Audit so both exports share the
      // same brand surface. Preload the Bookassist logo so html2canvas
      // captures the image rather than an empty <img>; fall back to a
      // logo-less letterhead if the file is missing.
      const BOOKASSIST_LOGO_URL = '/Bookassist%20-%20Logo.png';
      const bookassistLogoLoaded = await new Promise<boolean>((resolve) => {
        const preload = new Image();
        preload.onload = () => resolve(true);
        preload.onerror = () => resolve(false);
        preload.src = BOOKASSIST_LOGO_URL;
      });

      const letterhead = document.createElement('div');
      letterhead.style.cssText = [
        'position: absolute',
        'left: -9999px',
        'top: 0',
        'width: 800px',
        'background: #ffffff',
        'border-radius: 16px',
        'border: 1px solid #f3f4f6',
        'padding: 28px 32px',
        'display: flex',
        'align-items: center',
        'gap: 20px',
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      ].join(';');
      letterhead.innerHTML = `
        <div style="width: 64px; height: 64px; background: #003366; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.5.5 0 0 1-.96 0L9.68 3.18a.5.5 0 0 0-.96 0l-2.35 8.36A2 2 0 0 1 4.44 13H2"/>
          </svg>
        </div>
        <div style="line-height: 1.2;">
          <div style="font-size: 24px; font-weight: 700; color: #003366; letter-spacing: -0.02em;">Hotel Health Clinic</div>
          <div style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 6px;">Powered by Bookassist</div>
        </div>
        ${bookassistLogoLoaded ? `
          <img
            src="${BOOKASSIST_LOGO_URL}"
            alt="Bookassist"
            style="height: 52px; width: auto; margin-left: auto; display: block; flex-shrink: 0;"
          />
        ` : ''}
      `;
      document.body.appendChild(letterhead);
      try {
        const lhCanvas = await html2canvas(letterhead, captureOpts);
        const lhHeightMm = (lhCanvas.height * targetWidth) / lhCanvas.width;
        pdf.addImage(
          lhCanvas.toDataURL('image/jpeg', 0.92),
          'JPEG',
          marginX,
          yCursor,
          targetWidth,
          lhHeightMm,
        );
        pdf.link(marginX, yCursor, targetWidth, lhHeightMm, { url: 'https://bookassist.com' });
        yCursor += lhHeightMm + 6;
      } finally {
        document.body.removeChild(letterhead);
      }

      // Per-block capture with keep-with-next protection. Mirrors AI Audit.
      const estimateBlockHeightMm = (el: HTMLElement): number => {
        if (el.offsetWidth === 0 || el.offsetHeight === 0) return 0;
        return (el.offsetHeight * targetWidth) / el.offsetWidth;
      };
      const KEEP_WITH_NEXT_MAX_MM = 40;

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        if (block.offsetHeight === 0) continue;
        const canvas = await html2canvas(block, captureOpts);
        const pxToMm = targetWidth / canvas.width;
        const blockHeightMm = canvas.height * pxToMm;
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        // If this block is an anchor tag (e.g. the Book a Demo CTA card at
        // the bottom of the report), capture its href so we can attach a
        // PDF link annotation at the same coordinates as the image. Without
        // this the CTA renders as a static picture in the PDF.
        const blockHref = block.tagName === 'A' ? (block as HTMLAnchorElement).href : null;

        if (blockHeightMm <= usablePageHeightMm) {
          let nextHeightMm = 0;
          for (let j = i + 1; j < blocks.length; j++) {
            if (blocks[j].offsetHeight > 0) {
              nextHeightMm = estimateBlockHeightMm(blocks[j]);
              break;
            }
          }
          const wouldOrphanNext =
            blockHeightMm < KEEP_WITH_NEXT_MAX_MM &&
            nextHeightMm > 0 &&
            nextHeightMm <= usablePageHeightMm &&
            yCursor + blockHeightMm + 4 + nextHeightMm > pageHeight - marginY;

          if (wouldOrphanNext || yCursor + blockHeightMm > pageHeight - marginY) {
            startNewPage();
          }
          pdf.addImage(imgData, 'JPEG', marginX, yCursor, targetWidth, blockHeightMm);
          if (blockHref) {
            pdf.link(marginX, yCursor, targetWidth, blockHeightMm, { url: blockHref });
          }
          yCursor += blockHeightMm + 4;
        } else {
          if (yCursor > marginY) startNewPage();
          let consumedPx = 0;
          const totalPx = canvas.height;
          while (consumedPx < totalPx - 0.5) {
            const sliceMm = Math.min(usablePageHeightMm, (totalPx - consumedPx) * pxToMm);
            const sliceHeightPx = sliceMm / pxToMm;
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = Math.ceil(sliceHeightPx);
            const ctx = sliceCanvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
              ctx.drawImage(canvas, 0, -consumedPx);
            }
            const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.92);
            pdf.addImage(sliceData, 'JPEG', marginX, marginY, targetWidth, sliceMm);
            consumedPx += sliceHeightPx;
            if (consumedPx < totalPx - 0.5) {
              startNewPage();
            } else {
              yCursor = marginY + sliceMm + 4;
            }
          }
        }
      }

      const filenameSuffix = hostname || `${percentage}pct`;
      pdf.save(`Hotel-Tech-Audit-${filenameSuffix}.pdf`);
    } catch (err) {
      console.error('[FullResults] PDF generation failed', err);
      const message = err instanceof Error ? err.message : 'unknown error';
      setPdfError(`PDF generation failed (${message}). Opening your browser's print dialog as a fallback — choose 'Save as PDF' there.`);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-12 lg:px-8">
      {staffRole && (
        <StaffBadge
          role={staffRole}
          onSignOut={() => {
            clearStaffToken();
            setStaffRole(null);
          }}
          className="mb-4"
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          {/* Eyebrow uses Activity (heartbeat) + "Hotel Tech Audit" — the
              distinct signal vs AI Audit's Sparkles + "AI Visibility Audit". */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-brand-blue text-xs font-bold uppercase tracking-widest mb-3">
            <Activity className="w-3.5 h-3.5" /> {l.eyebrow}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {l.reportHeading}
          </h1>
          {hostname && (
            <p className="text-sm text-gray-500 mt-1 break-all">{hostname}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadFullPdf}
            disabled={isGeneratingPdf || analysisLoading || !!analysisError}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-blue hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {isGeneratingPdf ? l.pdfExporting : l.pdfDownload}
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:border-brand-blue hover:text-brand-blue transition-colors"
          >
            <RotateCcw size={14} /> {l.retake}
          </button>
        </div>
      </div>

      {pdfError && (
        <div className="mb-6 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{pdfError}</span>
        </div>
      )}

      <div ref={pdfCaptureRef}>
        {/* Score card: tier-tinted compact donut, mirrors AI Audit layout.
            The stats row (passing / critical gaps) is the Tech-Audit-specific
            addition — quiz-driven counts that don't have an AI Audit
            equivalent. */}
        <div
          className="rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6"
          style={{ backgroundColor: `${color}1A` }}
        >
          <div className="p-8 sm:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-shrink-0 relative w-40 h-40 sm:w-48 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
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
                    <Cell fill={color} />
                    <Cell fill="#F3F4F6" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl sm:text-5xl font-black" style={{ color }}>{percentage}%</span>
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Tech Score</span>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest mb-3"
                style={{ backgroundColor: `${color}26`, color }}
              >
                {status}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                {l.reportHeading}
              </h2>
              {hostname && (
                <p className="text-sm text-gray-500 mt-2 break-all">
                  <span className="text-brand-blue font-semibold">{hostname}</span>
                </p>
              )}
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{subtext}</p>
              <div className="flex gap-3 mt-4 items-center justify-center md:justify-start">
                <span className="inline-flex items-baseline gap-1.5">
                  <span className="font-black text-lg text-gray-900">{passingCount}</span>
                  <span className="text-gray-500 uppercase tracking-widest font-semibold text-[10px]">{l.passingLabel}</span>
                </span>
                <span className="text-gray-300">·</span>
                <span className="inline-flex items-baseline gap-1.5">
                  <span className="font-black text-lg text-brand-accent">{missingCount}</span>
                  <span className="text-red-400 uppercase tracking-widest font-semibold text-[10px]">{l.gapsLabel}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Strategic Assessment — white markdown article, same body
            styling as AI Audit done view. Loading and error states render
            inside the same shell so the layout doesn't jump when Gemini
            resolves. */}
        <article className="prose prose-slate max-w-none bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
          {analysisLoading ? (
            <div className="not-prose flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-brand-blue" />
              <p className="text-base text-gray-500 font-medium">{l.analyzing}</p>
            </div>
          ) : analysisError ? (
            <div className="not-prose flex flex-col items-center justify-center py-16 space-y-4">
              <AlertCircle className="w-8 h-8 text-brand-accent" />
              <p className="text-base text-gray-700">{l.analysisError}</p>
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ children }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="w-full border-collapse text-sm">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-blue-50">{children}</thead>,
                th: ({ children }) => (
                  <th className="text-left p-3 border border-gray-200 font-semibold text-gray-900">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="p-3 border border-gray-200 align-top">{children}</td>
                ),
                h1: ({ children }) => (
                  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{children}</h2>
                ),
                h2: ({ children }) => (
                  <h3 className="text-xl font-bold text-brand-blue mt-8 mb-3">{children}</h3>
                ),
                h3: ({ children }) => (
                  <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2">{children}</h4>
                ),
              }}
            >
              {analysis}
            </ReactMarkdown>
          )}
        </article>

        {/* Book a Demo CTA — hidden in staff mode, identical to AI Audit. */}
        {!isStaffBypass && (
          <a
            href="https://bookassist.com/book-a-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col md:flex-row items-center gap-6 bg-brand-blue text-white p-8 rounded-2xl shadow-xl mt-6 transition-all hover:scale-[1.01] no-underline"
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
        )}
      </div>
    </div>
  );
};
