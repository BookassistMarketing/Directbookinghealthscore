'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Globe, Loader2, AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from './Button';
import { ConsentModal, ConsentDeclinedScreen } from './ConsentModal';
import { LeadCapture } from './LeadCapture';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';
import { generateAiReadinessReport } from '../services/aiService';

const CONSENT_KEY = 'hhc_gemini_consent';

type ViewState = 'idle' | 'form_gate' | 'loading' | 'done';

const labelsMap: Record<Language, {
  eyebrow: string;
  heading: string;
  sub: string;
  inputLabel: string;
  placeholder: string;
  submit: string;
  invalidUrl: string;
  loading: string;
  loadingSub: string;
  errorTitle: string;
  errorBody: string;
  retry: string;
  reportHeading: string;
  another: string;
  disclosure: string;
}> = {
  en: {
    eyebrow: 'AI Visibility Audit',
    heading: 'How visible is your hotel to AI search?',
    sub: 'Paste your hotel website URL. We analyse it against the AI Readiness scoring framework and return a structured report — typically within 30 seconds.',
    inputLabel: 'Hotel website URL',
    placeholder: 'yourhotel.com',
    submit: 'Run AI audit',
    invalidUrl: 'Please enter a valid website URL.',
    loading: 'Analysing your site…',
    loadingSub: 'Checking structured data, crawlability, semantic coverage, booking pathways and more.',
    errorTitle: "We couldn't complete the audit",
    errorBody: 'Something went wrong analysing this site. Please try again or check the URL is correct.',
    retry: 'Try again',
    reportHeading: 'Your AI Readiness Report',
    another: 'Audit another site',
    disclosure: 'Your URL is sent to Google Gemini for analysis. We do not store it.',
  },
  it: {
    eyebrow: 'Audit di Visibilità AI',
    heading: 'Quanto è visibile il tuo hotel alla ricerca AI?',
    sub: "Incolla l'URL del tuo sito web. Lo analizziamo secondo il framework AI Readiness e restituiamo un report strutturato — solitamente entro 30 secondi.",
    inputLabel: "URL del sito dell'hotel",
    placeholder: 'tuohotel.com',
    submit: 'Esegui audit AI',
    invalidUrl: 'Inserisci un URL valido.',
    loading: 'Stiamo analizzando il tuo sito…',
    loadingSub: 'Controllo dati strutturati, crawlability, copertura semantica, percorsi di prenotazione e altro.',
    errorTitle: "Non siamo riusciti a completare l'audit",
    errorBody: "Qualcosa è andato storto durante l'analisi. Riprova o verifica che l'URL sia corretto.",
    retry: 'Riprova',
    reportHeading: 'Il tuo Report di AI Readiness',
    another: 'Audit di un altro sito',
    disclosure: "Il tuo URL viene inviato a Google Gemini per l'analisi. Non lo conserviamo.",
  },
  es: {
    eyebrow: 'Auditoría de Visibilidad IA',
    heading: '¿Qué tan visible es tu hotel para la búsqueda con IA?',
    sub: 'Pega la URL del sitio web de tu hotel. La analizamos con el marco de AI Readiness y te devolvemos un informe estructurado — normalmente en 30 segundos.',
    inputLabel: 'URL del sitio del hotel',
    placeholder: 'tuhotel.com',
    submit: 'Ejecutar auditoría IA',
    invalidUrl: 'Introduce una URL válida.',
    loading: 'Analizando tu sitio…',
    loadingSub: 'Comprobando datos estructurados, rastreabilidad, cobertura semántica, rutas de reserva y más.',
    errorTitle: 'No pudimos completar la auditoría',
    errorBody: 'Algo salió mal al analizar este sitio. Inténtalo de nuevo o comprueba que la URL es correcta.',
    retry: 'Reintentar',
    reportHeading: 'Tu Informe de AI Readiness',
    another: 'Auditar otro sitio',
    disclosure: 'Tu URL se envía a Google Gemini para el análisis. No la almacenamos.',
  },
  pl: {
    eyebrow: 'Audyt Widoczności AI',
    heading: 'Jak widoczny jest Twój hotel dla wyszukiwania AI?',
    sub: 'Wklej adres URL swojego hotelu. Analizujemy go w oparciu o framework AI Readiness i zwracamy ustrukturyzowany raport — zwykle w ciągu 30 sekund.',
    inputLabel: 'Adres URL strony hotelu',
    placeholder: 'twojhotel.com',
    submit: 'Uruchom audyt AI',
    invalidUrl: 'Wprowadź prawidłowy adres URL.',
    loading: 'Analizujemy Twoją stronę…',
    loadingSub: 'Sprawdzamy dane strukturalne, indeksowalność, pokrycie semantyczne, ścieżki rezerwacji i więcej.',
    errorTitle: 'Nie udało się ukończyć audytu',
    errorBody: 'Coś poszło nie tak podczas analizy. Spróbuj ponownie lub sprawdź, czy adres URL jest poprawny.',
    retry: 'Spróbuj ponownie',
    reportHeading: 'Twój Raport AI Readiness',
    another: 'Audyt innej strony',
    disclosure: 'Twój URL jest wysyłany do Google Gemini w celu analizy. Nie przechowujemy go.',
  },
  fr: {
    eyebrow: 'Audit Visibilité IA',
    heading: "Dans quelle mesure votre hôtel est-il visible pour la recherche IA ?",
    sub: "Collez l'URL du site web de votre hôtel. Nous l'analysons selon le cadre d'évaluation AI Readiness et vous renvoyons un rapport structuré — généralement en moins de 30 secondes.",
    inputLabel: "URL du site web de l'hôtel",
    placeholder: 'votrehotel.com',
    submit: "Lancer l'audit IA",
    invalidUrl: 'Veuillez saisir une URL de site web valide.',
    loading: 'Analyse de votre site en cours…',
    loadingSub: 'Vérification des données structurées, de la crawlabilité, de la couverture sémantique, des parcours de réservation et plus encore.',
    errorTitle: "Nous n'avons pas pu terminer l'audit",
    errorBody: "Une erreur s'est produite lors de l'analyse de ce site. Veuillez réessayer ou vérifier que l'URL est correcte.",
    retry: 'Réessayer',
    reportHeading: 'Votre rapport AI Readiness',
    another: 'Auditer un autre site',
    disclosure: "Votre URL est envoyée à Google Gemini pour analyse. Nous ne la conservons pas.",
  },
  de: {
    eyebrow: 'KI-Sichtbarkeitsaudit',
    heading: 'Wie sichtbar ist Ihr Hotel für die KI-Suche?',
    sub: 'Fügen Sie die URL Ihrer Hotel-Website ein. Wir analysieren sie anhand des AI-Readiness-Bewertungsframeworks und liefern Ihnen einen strukturierten Bericht — in der Regel innerhalb von 30 Sekunden.',
    inputLabel: 'URL der Hotel-Website',
    placeholder: 'ihrhotel.com',
    submit: 'KI-Audit starten',
    invalidUrl: 'Bitte geben Sie eine gültige Website-URL ein.',
    loading: 'Ihre Website wird analysiert…',
    loadingSub: 'Wir prüfen strukturierte Daten, Crawlbarkeit, semantische Abdeckung, Buchungspfade und mehr.',
    errorTitle: 'Wir konnten den Audit nicht abschließen',
    errorBody: 'Bei der Analyse dieser Website ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder prüfen Sie, ob die URL korrekt ist.',
    retry: 'Erneut versuchen',
    reportHeading: 'Ihr AI-Readiness-Bericht',
    another: 'Eine andere Website auditieren',
    disclosure: 'Ihre URL wird zur Analyse an Google Gemini gesendet. Wir speichern sie nicht.',
  },
  cs: {
    eyebrow: 'Audit AI viditelnosti',
    heading: 'Jak je váš hotel viditelný pro vyhledávání AI?',
    sub: 'Vložte URL webových stránek vašeho hotelu. Analyzujeme je podle rámce AI Readiness a vrátíme strukturovanou zprávu — obvykle do 30 sekund.',
    inputLabel: 'URL webu hotelu',
    placeholder: 'vasehotel.cz',
    submit: 'Spustit AI audit',
    invalidUrl: 'Zadejte platnou URL adresu webu.',
    loading: 'Analyzujeme vaše stránky…',
    loadingSub: 'Kontrolujeme strukturovaná data, indexovatelnost, sémantické pokrytí, rezervační cesty a další.',
    errorTitle: 'Audit se nepodařilo dokončit',
    errorBody: 'Při analýze tohoto webu se něco pokazilo. Zkuste to prosím znovu nebo zkontrolujte správnost URL.',
    retry: 'Zkusit znovu',
    reportHeading: 'Vaše zpráva AI Readiness',
    another: 'Auditovat jiný web',
    disclosure: 'Vaše URL se odesílá k analýze do Google Gemini. Neukládáme ji.',
  },
};

function normaliseUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(withProtocol);
    if (!u.hostname.includes('.')) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export const AiAudit: React.FC = () => {
  const { language } = useContent();
  const router = useRouter();
  const l = labelsMap[language];

  const [consentChecked, setConsentChecked] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [consentDeclined, setConsentDeclined] = useState(false);

  const [view, setView] = useState<ViewState>('idle');
  const [rawUrl, setRawUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [report, setReport] = useState('');
  const [auditedUrl, setAuditedUrl] = useState('');
  const [requestError, setRequestError] = useState<string | null>(null);

  // Bot defence: honeypot field (real users never see it) + timestamp of when
  // the form was rendered. Bots fill all fields including hidden ones, and
  // submit instantly. Both signals are checked server-side in /api/ai-audit.
  const [honeypot, setHoneypot] = useState('');
  const formRenderedAt = useRef<number>(Date.now());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setConsentAccepted(sessionStorage.getItem(CONSENT_KEY) === 'accepted');
    setConsentChecked(true);
    formRenderedAt.current = Date.now();
  }, []);

  const handleConsentAccept = () => {
    if (typeof window !== 'undefined') sessionStorage.setItem(CONSENT_KEY, 'accepted');
    setConsentAccepted(true);
  };
  const handleConsentDecline = () => setConsentDeclined(true);
  const handleConsentReconsider = () => setConsentDeclined(false);
  const handleConsentGoHome = () => router.push('/');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    setRequestError(null);

    const normalised = normaliseUrl(rawUrl);
    if (!normalised) {
      setUrlError(l.invalidUrl);
      return;
    }

    setAuditedUrl(normalised);
    setView('form_gate');
  };

  const runAnalysis = async () => {
    setView('loading');
    const formAgeMs = Date.now() - formRenderedAt.current;
    try {
      const result = await generateAiReadinessReport(auditedUrl, language, {
        honeypot,
        formAgeMs,
      });
      setReport(result);
      setView('done');
    } catch (err) {
      console.error('[AiAudit] Audit failed:', err);
      setRequestError(l.errorBody);
      setView('idle');
    }
  };

  const reset = () => {
    setRawUrl('');
    setUrlError(null);
    setRequestError(null);
    setReport('');
    setAuditedUrl('');
    setView('idle');
  };

  if (consentDeclined) {
    return (
      <ConsentDeclinedScreen
        onReconsider={handleConsentReconsider}
        onGoHome={handleConsentGoHome}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-12 lg:px-8">
      {consentChecked && !consentAccepted && (
        <ConsentModal onAccept={handleConsentAccept} onDecline={handleConsentDecline} />
      )}

      {view === 'form_gate' && (
        <LeadCapture onUnlock={runAnalysis} />
      )}

      {view === 'idle' && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-brand-blue text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" /> {l.eyebrow}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4 leading-tight">
            {l.heading}
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 mb-10 leading-relaxed">
            {l.sub}
          </p>

          <form onSubmit={submit} className="max-w-xl mx-auto">
            <label htmlFor="ai-audit-url" className="sr-only">{l.inputLabel}</label>
            {/* Honeypot — hidden from real users, attractive to bots */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
              <label htmlFor="website_url_extra">Website URL (leave blank)</label>
              <input
                id="website_url_extra"
                type="text"
                name="website_url_extra"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
              />
            </div>
            <div className="relative">
              <Globe
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                id="ai-audit-url"
                type="text"
                inputMode="url"
                autoComplete="url"
                value={rawUrl}
                onChange={e => setRawUrl(e.target.value)}
                placeholder={l.placeholder}
                className="w-full pl-12 pr-4 py-4 text-base sm:text-lg bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                aria-invalid={Boolean(urlError)}
                aria-describedby={urlError ? 'ai-audit-url-error' : undefined}
              />
            </div>
            {urlError && (
              <p id="ai-audit-url-error" className="mt-3 text-sm text-brand-accent text-left">
                {urlError}
              </p>
            )}
            {requestError && (
              <div className="mt-4 flex items-start gap-2 text-sm text-brand-accent text-left bg-rose-50 border border-rose-200 rounded-lg p-3">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{requestError}</span>
              </div>
            )}
            <Button type="submit" className="w-full sm:w-auto mt-6 px-10 py-4 text-base shadow-lg">
              {l.submit} <ArrowRight size={18} className="ml-2 inline-block" />
            </Button>
            <p className="mt-4 text-xs text-gray-400">{l.disclosure}</p>
          </form>
        </div>
      )}

      {view === 'loading' && (
        <div className="text-center py-20 sm:py-32">
          <Loader2 className="w-12 h-12 text-brand-blue mx-auto mb-6 animate-spin" />
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">{l.loading}</h2>
          <p className="text-base text-gray-500 max-w-md mx-auto">{l.loadingSub}</p>
        </div>
      )}

      {view === 'done' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-brand-blue text-xs font-bold uppercase tracking-widest mb-3">
                <Sparkles className="w-3.5 h-3.5" /> {l.eyebrow}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {l.reportHeading}
              </h1>
              <p className="text-sm text-gray-500 mt-1 break-all">{auditedUrl}</p>
            </div>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:border-brand-blue hover:text-brand-blue transition-colors"
            >
              <RotateCcw size={14} /> {l.another}
            </button>
          </div>

          <article className="prose prose-slate max-w-none bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
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
                  <th className="text-left p-3 border border-gray-200 font-semibold text-gray-900">
                    {children}
                  </th>
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
              {report}
            </ReactMarkdown>
          </article>
        </div>
      )}
    </div>
  );
};
