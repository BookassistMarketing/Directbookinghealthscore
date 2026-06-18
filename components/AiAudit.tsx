'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Globe, Loader2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from './Button';
import { ConsentModal, ConsentDeclinedScreen } from './ConsentModal';
import { LeadCapture } from './LeadCapture';
import { AiReadinessReport } from './AiReadinessReport';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';
import { generateAiReadinessReport } from '../services/aiService';
import { checkStaffBypass } from '../lib/staffBypass';

const CONSENT_KEY = 'hhc_gemini_consent';

type ViewState = 'idle' | 'loading' | 'preview' | 'form_gate' | 'done';

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
  seeMore: string;
  ctaTitle: string;
  ctaSub: string;
  ctaButton: string;
  didYouKnow: string;
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
    seeMore: 'See full report',
    ctaTitle: 'Improve your AI Visibility today',
    ctaSub: 'Book a free consultation with a Bookassist strategist',
    ctaButton: 'Book a Demo',
    didYouKnow: 'Did you know?',
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
    seeMore: 'Visualizza il report completo',
    ctaTitle: 'Migliora la tua visibilità AI oggi',
    ctaSub: 'Prenota una consulenza gratuita con uno stratega Bookassist',
    ctaButton: 'Prenota una Demo',
    didYouKnow: 'Lo sapevi?',
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
    seeMore: 'Ver informe completo',
    ctaTitle: 'Mejora tu visibilidad en IA hoy',
    ctaSub: 'Reserva una consulta gratuita con un estratega de Bookassist',
    ctaButton: 'Reservar una Demo',
    didYouKnow: '¿Sabías que?',
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
    seeMore: 'Zobacz pełny raport',
    ctaTitle: 'Popraw swoją widoczność AI już dziś',
    ctaSub: 'Umów bezpłatną konsultację ze strategiem Bookassist',
    ctaButton: 'Zamów Demo',
    didYouKnow: 'Czy wiedziałeś?',
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
    seeMore: 'Voir le rapport complet',
    ctaTitle: "Améliorez votre visibilité IA aujourd'hui",
    ctaSub: 'Réservez une consultation gratuite avec un stratège Bookassist',
    ctaButton: 'Réserver une Démo',
    didYouKnow: 'Le saviez-vous ?',
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
    seeMore: 'Vollständigen Bericht anzeigen',
    ctaTitle: 'Verbessern Sie Ihre KI-Sichtbarkeit noch heute',
    ctaSub: 'Buchen Sie eine kostenlose Beratung mit einem Bookassist-Strategen',
    ctaButton: 'Demo buchen',
    didYouKnow: 'Wussten Sie?',
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
    seeMore: 'Zobrazit celý přehled',
    ctaTitle: 'Zlepšete svou AI viditelnost ještě dnes',
    ctaSub: 'Rezervujte si bezplatnou konzultaci se strategem Bookassist',
    ctaButton: 'Rezervovat demo',
    didYouKnow: 'Věděli jste?',
  },
};

const FACTS: Record<string, { text: string; category: string }[]> = {
  en: [
    { text: "Hotels that invest in direct booking technology see up to **30% lower distribution costs** compared to OTA-dependent properties.", category: "Revenue" },
    { text: "**AI-powered search tools** like ChatGPT and Perplexity now influence over 20% of hotel discovery journeys.", category: "AI Search" },
    { text: "Hotels with structured data markup are **3x more likely** to appear in AI-generated travel recommendations.", category: "GEO" },
    { text: "The average OTA commission is **15–25% per booking** — direct bookings cost a fraction of that.", category: "Strategy" },
    { text: "Hotels with an **llms.txt file** give AI crawlers explicit content permissions, improving generative search visibility.", category: "Technology" },
    { text: "A **1% shift from OTA to direct** bookings can increase net revenue per booking by up to 20%.", category: "Revenue" },
    { text: "Over **60% of travellers** visit a hotel's own website before booking — but fewer than 40% complete their reservation there.", category: "Direct Booking" },
    { text: "Google AI Overviews now appear in **over 30% of hotel-related searches** — structured data is your ticket in.", category: "AI Search" },
    { text: "Hotels using **FAQ schema markup** are significantly more likely to be cited directly in AI-generated answers.", category: "GEO" },
    { text: "Measuring your **direct booking KPIs** on a regular basis is the first step to reducing OTA dependency.", category: "Strategy" },
  ],
  it: [
    { text: "Gli hotel che investono nella tecnologia di prenotazione diretta registrano fino al **30% in meno di costi di distribuzione** rispetto a quelli dipendenti dalle OTA.", category: "Ricavi" },
    { text: "**Strumenti di ricerca basati sull'IA** come ChatGPT e Perplexity influenzano oggi oltre il 20% dei percorsi di scoperta degli hotel.", category: "Ricerca AI" },
    { text: "Gli hotel con markup di dati strutturati hanno **3 volte più probabilità** di apparire nelle raccomandazioni generate dall'IA.", category: "GEO" },
    { text: "La commissione media delle OTA è del **15–25% per prenotazione** — le prenotazioni dirette costano una frazione di questo.", category: "Strategia" },
    { text: "Gli hotel con un **file llms.txt** forniscono ai crawler AI autorizzazioni esplicite sui contenuti, migliorando la visibilità nella ricerca generativa.", category: "Tecnologia" },
    { text: "Un **aumento dell'1% dal canale OTA a quello diretto** può incrementare il ricavo netto per prenotazione fino al 20%.", category: "Ricavi" },
    { text: "Oltre il **60% dei viaggiatori** visita il sito dell'hotel prima di prenotare — ma meno del 40% completa la prenotazione lì.", category: "Prenotazione Diretta" },
    { text: "Google AI Overviews appaiono in **oltre il 30% delle ricerche relative agli hotel** — i dati strutturati sono il tuo biglietto d'ingresso.", category: "Ricerca AI" },
    { text: "Gli hotel che utilizzano il **markup dello schema FAQ** hanno molte più probabilità di essere citati nelle risposte generate dall'IA.", category: "GEO" },
    { text: "Monitorare regolarmente i tuoi **KPI di prenotazione diretta** è il primo passo per ridurre la dipendenza dalle OTA.", category: "Strategia" },
  ],
  es: [
    { text: "Los hoteles que invierten en tecnología de reserva directa ven hasta un **30% menos en costes de distribución** en comparación con los dependientes de las OTA.", category: "Ingresos" },
    { text: "**Herramientas de búsqueda con IA** como ChatGPT y Perplexity influyen ahora en más del 20% de los viajes de descubrimiento de hoteles.", category: "Búsqueda IA" },
    { text: "Los hoteles con marcado de datos estructurados tienen **3 veces más probabilidades** de aparecer en recomendaciones generadas por IA.", category: "GEO" },
    { text: "La comisión media de las OTA es del **15–25% por reserva** — las reservas directas cuestan una fracción de eso.", category: "Estrategia" },
    { text: "Los hoteles con un **archivo llms.txt** dan a los rastreadores de IA permisos explícitos de contenido, mejorando la visibilidad en la búsqueda generativa.", category: "Tecnología" },
    { text: "Un **aumento del 1% de OTA a directo** puede incrementar el ingreso neto por reserva hasta un 20%.", category: "Ingresos" },
    { text: "Más del **60% de los viajeros** visita el sitio web del hotel antes de reservar — pero menos del 40% completa su reserva allí.", category: "Reserva Directa" },
    { text: "Los AI Overviews de Google aparecen en **más del 30% de las búsquedas relacionadas con hoteles** — los datos estructurados son tu entrada.", category: "Búsqueda IA" },
    { text: "Los hoteles que usan el **marcado de esquema FAQ** tienen muchas más probabilidades de ser citados en las respuestas generadas por IA.", category: "GEO" },
    { text: "Medir regularmente tus **KPIs de reserva directa** es el primer paso para reducir la dependencia de las OTA.", category: "Estrategia" },
  ],
  pl: [
    { text: "Hotele inwestujące w technologię bezpośrednich rezerwacji osiągają nawet **30% niższe koszty dystrybucji** w porównaniu z hotelami zależnymi od OTA.", category: "Przychody" },
    { text: "**Narzędzia wyszukiwania oparte na AI**, takie jak ChatGPT i Perplexity, wpływają na ponad 20% podróży odkrywania hoteli.", category: "Wyszukiwanie AI" },
    { text: "Hotele z oznaczeniem danych strukturalnych mają **3 razy większe szanse** na pojawienie się w rekomendacjach generowanych przez AI.", category: "GEO" },
    { text: "Średnia prowizja OTA wynosi **15–25% za rezerwację** — bezpośrednie rezerwacje kosztują ułamek tego.", category: "Strategia" },
    { text: "Hotele z **plikiem llms.txt** dają crawlerom AI wyraźne uprawnienia do treści, poprawiając widoczność w wyszukiwaniu generatywnym.", category: "Technologia" },
    { text: "**1% przesunięcia z OTA na bezpośrednie** rezerwacje może zwiększyć przychód netto na rezerwację nawet o 20%.", category: "Przychody" },
    { text: "Ponad **60% podróżnych** odwiedza stronę hotelu przed rezerwacją — ale mniej niż 40% finalizuje tam rezerwację.", category: "Rezerwacja Bezpośrednia" },
    { text: "Google AI Overviews pojawiają się w **ponad 30% wyszukiwań związanych z hotelami** — dane strukturalne to Twój bilet wstępu.", category: "Wyszukiwanie AI" },
    { text: "Hotele używające **oznaczenia schematu FAQ** mają znacznie większe szanse na cytowanie w odpowiedziach generowanych przez AI.", category: "GEO" },
    { text: "Regularne mierzenie **KPI bezpośrednich rezerwacji** to pierwszy krok do zmniejszenia zależności od OTA.", category: "Strategia" },
  ],
  fr: [
    { text: "Les hôtels qui investissent dans la technologie de réservation directe enregistrent jusqu'à **30% de coûts de distribution en moins** par rapport aux propriétés dépendantes des OTA.", category: "Revenus" },
    { text: "**Les outils de recherche alimentés par l'IA**, comme ChatGPT et Perplexity, influencent désormais plus de 20% des parcours de découverte hôtelière.", category: "Recherche IA" },
    { text: "Les hôtels avec un balisage de données structurées ont **3 fois plus de chances** d'apparaître dans les recommandations générées par l'IA.", category: "GEO" },
    { text: "La commission OTA moyenne est de **15 à 25% par réservation** — les réservations directes coûtent une fraction de cela.", category: "Stratégie" },
    { text: "Les hôtels dotés d'un **fichier llms.txt** donnent aux robots IA des autorisations explicites sur le contenu, améliorant la visibilité dans la recherche générative.", category: "Technologie" },
    { text: "Un **glissement de 1% des OTA vers le direct** peut augmenter le revenu net par réservation jusqu'à 20%.", category: "Revenus" },
    { text: "Plus de **60% des voyageurs** visitent le site web d'un hôtel avant de réserver — mais moins de 40% finalisent leur réservation là-bas.", category: "Réservation Directe" },
    { text: "Google AI Overviews apparaît dans **plus de 30% des recherches liées aux hôtels** — les données structurées sont votre sésame.", category: "Recherche IA" },
    { text: "Les hôtels utilisant le **balisage de schéma FAQ** sont beaucoup plus susceptibles d'être cités dans les réponses générées par l'IA.", category: "GEO" },
    { text: "Mesurer régulièrement vos **KPIs de réservation directe** est la première étape pour réduire la dépendance aux OTA.", category: "Stratégie" },
  ],
  de: [
    { text: "Hotels, die in Direktbuchungstechnologie investieren, verzeichnen bis zu **30% niedrigere Vertriebskosten** im Vergleich zu OTA-abhängigen Häusern.", category: "Umsatz" },
    { text: "**KI-gestützte Suchwerkzeuge** wie ChatGPT und Perplexity beeinflussen inzwischen über 20% der Hotel-Entdeckungsreisen.", category: "KI-Suche" },
    { text: "Hotels mit strukturierten Daten-Markups haben eine **3-fach höhere Chance**, in KI-generierten Reiseempfehlungen zu erscheinen.", category: "GEO" },
    { text: "Die durchschnittliche OTA-Provision beträgt **15–25% pro Buchung** — Direktbuchungen kosten einen Bruchteil davon.", category: "Strategie" },
    { text: "Hotels mit einer **llms.txt-Datei** geben KI-Crawlern explizite Inhaltsberechtigungen und verbessern so die Sichtbarkeit in der generativen Suche.", category: "Technologie" },
    { text: "Eine **1%-Verschiebung von OTA zu Direkt** kann den Nettoumsatz pro Buchung um bis zu 20% steigern.", category: "Umsatz" },
    { text: "Über **60% der Reisenden** besuchen die Hotel-Website vor der Buchung — aber weniger als 40% schließen die Buchung dort ab.", category: "Direktbuchung" },
    { text: "Google AI Overviews erscheinen in **über 30% der hotelbezogenen Suchanfragen** — strukturierte Daten sind Ihr Eintrittspunkt.", category: "KI-Suche" },
    { text: "Hotels mit **FAQ-Schema-Markup** werden deutlich häufiger direkt in KI-generierten Antworten zitiert.", category: "GEO" },
    { text: "Die regelmäßige Messung Ihrer **Direktbuchungs-KPIs** ist der erste Schritt zur Reduzierung der OTA-Abhängigkeit.", category: "Strategie" },
  ],
  cs: [
    { text: "Hotely investující do technologie přímých rezervací dosahují až **o 30% nižší distribuční náklady** ve srovnání s hotely závislými na OTA.", category: "Příjmy" },
    { text: "**Nástroje vyhledávání poháněné AI**, jako ChatGPT a Perplexity, nyní ovlivňují více než 20% cest za objevováním hotelů.", category: "Vyhledávání AI" },
    { text: "Hotely se strukturovanými daty mají **3x vyšší pravděpodobnost** zobrazení v doporučeních generovaných AI.", category: "GEO" },
    { text: "Průměrná provize OTA je **15–25% za rezervaci** — přímé rezervace stojí zlomek toho.", category: "Strategie" },
    { text: "Hotely se **souborem llms.txt** dávají AI crawlerům explicitní oprávnění k obsahu, čímž zlepšují viditelnost v generativním vyhledávání.", category: "Technologie" },
    { text: "**1% přesun z OTA na přímé** rezervace může zvýšit čistý příjem na rezervaci až o 20%.", category: "Příjmy" },
    { text: "Více než **60% cestujících** navštíví webové stránky hotelu před rezervací — ale méně než 40% tam rezervaci dokončí.", category: "Přímá rezervace" },
    { text: "Google AI Overviews se zobrazují v **více než 30% vyhledávání souvisejících s hotely** — strukturovaná data jsou vaší vstupenkou.", category: "Vyhledávání AI" },
    { text: "Hotely používající **značkování schématu FAQ** mají výrazně vyšší pravděpodobnost přímého citování v odpovědích generovaných AI.", category: "GEO" },
    { text: "Pravidelné měření vašich **KPI přímých rezervací** je prvním krokem ke snížení závislosti na OTA.", category: "Strategie" },
  ],
};

function renderFact(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1
      ? <span key={i} className="text-yellow-300 font-black">{part}</span>
      : <span key={i}>{part}</span>
  );
}

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
  const [factIndex, setFactIndex] = useState(0);
  const [isStaffBypass, setIsStaffBypass] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setConsentAccepted(sessionStorage.getItem(CONSENT_KEY) === 'accepted');
    setConsentChecked(true);
    formRenderedAt.current = Date.now();
    let cancelled = false;
    checkStaffBypass().then(ok => {
      if (!cancelled) setIsStaffBypass(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (view !== 'loading') return;
    const facts = FACTS[language] ?? FACTS.en;
    setFactIndex(Math.floor(Math.random() * facts.length));
    const id = setInterval(() => setFactIndex(i => (i + 1) % facts.length), 7000);
    return () => clearInterval(id);
  }, [view, language]);

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
    runAnalysis(normalised);
  };

  const runAnalysis = async (url: string) => {
    setView('loading');
    const formAgeMs = Date.now() - formRenderedAt.current;
    try {
      const result = await generateAiReadinessReport(url, language, {
        honeypot,
        formAgeMs,
      });
      setReport(result);
      // Staff bypass: skip the blurred preview teaser and go straight to the
      // full dashboard. Real users see the preview → form_gate (or done if
      // they unlock) flow.
      setView(isStaffBypass ? 'done' : 'preview');
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

      {isStaffBypass && (
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow text-gray-900 text-xs font-bold uppercase tracking-widest shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" />
          Bookassist Staff Mode
        </div>
      )}

      {view === 'form_gate' && !isStaffBypass && (
        <LeadCapture onUnlock={() => setView('done')} />
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
        <div className="text-center py-12 sm:py-20">
          <Loader2 className="w-10 h-10 text-brand-blue mx-auto mb-5 animate-spin" />
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">{l.loading}</h2>
          <p className="text-base text-gray-500 max-w-md mx-auto mb-10">{l.loadingSub}</p>

          <div className="max-w-sm mx-auto">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">{l.didYouKnow}</p>
            {(() => {
              const facts = FACTS[language] ?? FACTS.en;
              const fact = facts[factIndex % facts.length];
              return (
                <div
                  key={factIndex}
                  className="bg-brand-success rounded-2xl p-6 text-left shadow-lg"
                  style={{ animation: 'factFadeIn 0.5s ease-out' }}
                >
                  <p className="text-white text-base sm:text-lg font-semibold leading-relaxed">
                    {renderFact(fact.text)}
                  </p>
                  <div className="mt-5 flex justify-end">
                    <span className="bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                      {fact.category}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          <style>{`
            @keyframes factFadeIn {
              from { opacity: 0; transform: translateY(8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      {view === 'preview' && (
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
          </div>

          <div className="relative">
            <article className="prose prose-slate max-w-none bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 max-h-72 overflow-hidden">
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
                {report}
              </ReactMarkdown>
            </article>
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent rounded-b-2xl pointer-events-none" />
          </div>

          <div className="text-center mt-8">
            <Button
              onClick={() => setView(isStaffBypass ? 'done' : 'form_gate')}
              className="px-10 py-4 text-base shadow-lg"
            >
              {l.seeMore} <ArrowRight size={18} className="ml-2 inline-block" />
            </Button>
          </div>
        </div>
      )}

      {view === 'done' && (
        <AiReadinessReport
          markdown={report}
          auditedUrl={auditedUrl}
          language={language}
          onReset={reset}
        />
      )}
    </div>
  );
};
