'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Globe, Loader2, AlertCircle, ArrowRight, RotateCcw, ExternalLink, ShieldCheck, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from './Button';
import { ConsentModal, ConsentDeclinedScreen } from './ConsentModal';
import { LeadCapture } from './LeadCapture';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';
import { generateAiReadinessReport } from '../services/aiService';
import { checkStaffBypass, type StaffRole } from '../lib/staffBypass';

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

// Sample Gemini AI Readiness Report used by the "Preview end page" link that
// appears on the idle view for signed-in staff. Lets us iterate on the
// rendering without burning Gemini credits on every reload.
const DEMO_REPORT = `ai visibility & optimization summary
The Grand Harbour Hotel, Galway
overall score: 62 / 100 — Near AI-ready
url analyzed: https://grandharbour-demo.example.com

What we observed
The Grand Harbour Hotel maintains a clean, brand-aligned presentation with strong booking pathways and solid metadata coverage. AI assistants can readily identify the property and its booking surface, but several structural signals — notably FAQPage schema, SpeakableSpecification, and entity-level @id linking — are absent. These gaps prevent the site from reaching the AI-optimised tier and limit visibility in generative search experiences such as ChatGPT, Perplexity, and Google AI Overviews.

Weighted scoring breakdown
| Category | Weight | Score |
| --- | --- | --- |
| Structured Data Completeness | 25 | 14 |
| Technical Crawlability | 9 | 9 |
| Local Entity Linking | 10 | 7 |
| FAQ/Q&A Presence | 10 | 0 |
| Semantic Coverage | 15 | 10 |
| Booking Pathway Clarity | 12 | 12 |
| Metadata Diversity | 6 | 6 |
| Persona & Use-Case Mapping | 5 | 2 |
| Media/ALT Optimisation | 2 | 2 |
| Voice-Search Readiness | 6 | 0 |

Recurring issues across the website
| Issue | Impact | Pages Affected |
| --- | --- | --- |
| Missing FAQPage schema | AI assistants cannot extract structured Q&A pairs | Homepage, Rooms, Contact |
| No SpeakableSpecification | Voice assistants skip the site entirely | All pages |
| Thin @id graph linking | Entities not connected as a knowledge graph | Homepage, Rooms |
| Limited persona-targeted content | AI search cannot match the property to specific traveller intents | Landing pages |
| No nearby attraction references in schema | Local AI search downranks the property | Homepage, Location |

Estimated score uplift if issues are resolved
| Fix | Estimated Score Increase |
| --- | --- |
| Add FAQPage schema with 8 location and booking questions | +10 points |
| Add SpeakableSpecification to top 3 landing pages | +3 points |
| Reinforce @id graph linking across Hotel + LocalBusiness entities | +4 points |
| Add "For Business" and "For Families" intent blocks | +3 points |
| Expand nearby attractions narrative on Location page | +3 points |

Projected Score After Fixes: 85 / 100

Strategic Advantage for Bookassist
Bookassist's AI Readiness programme directly closes every gap surfaced above. Our structured-data automation populates FAQPage, SpeakableSpecification, and @id graph relationships in a single deployment, while our content optimisation surfaces persona blocks and local-entity references that elevate the property in generative search. Hotels onboarded with Bookassist typically reach AI-optimised status within 90 days, translating to material lifts in direct-booking visibility across ChatGPT, Perplexity, and Google AI Overviews.`;

// Inject a <script> tag if the expected global isn't already present. Polls
// for up to 3 seconds after the load event fires because some CDN bundles
// (jsPDF in particular) defer setting their global until after `load`. The
// `loadedFlag` argument lets us force-load a script even when a same-named
// global already exists (we use this for html2canvas-pro, which has to
// override the older html2canvas that app/layout.tsx still preloads).
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

function safeHostnameForFilename(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '').replace(/[^a-z0-9.-]+/gi, '');
  } catch {
    return 'report';
  }
}

// Walk upwards from idealY looking for a thick strip of background-coloured
// pixels (the gap between cards), not just a single clean row. A 1-2px clean
// row would match the internal borders between table cells — slicing there
// still cuts the table in half, which is what we're trying to avoid. We
// require N consecutive clean rows so we only break on real "between cards"
// gaps. Returns the Y at the bottom of the found strip, or idealY if no
// suitable strip exists within `maxSearchUpPx`.
function findSafePageBreakY(
  canvas: HTMLCanvasElement,
  idealY: number,
  maxSearchUpPx: number,
): number {
  const ctx = canvas.getContext('2d');
  if (!ctx) return idealY;
  const width = canvas.width;
  const sampleEvery = Math.max(2, Math.floor(width / 200));
  const requiredCleanStripPx = Math.max(15, Math.floor(canvas.height / 80));

  // Pull the whole canvas in one ImageData call instead of one per row —
  // ~100x faster for tall canvases.
  const imageData = ctx.getImageData(0, 0, width, canvas.height).data;

  const isCleanRow = (y: number): boolean => {
    if (y < 0 || y >= canvas.height) return false;
    const rowStart = y * width * 4;
    let nonBackground = 0;
    for (let x = 0; x < width; x += sampleEvery) {
      const i = rowStart + x * 4;
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      // Background is page bg #F4F6F8 (244,246,248) or card white. Anything
      // darker than ~230 on any channel is content.
      if (r < 230 || g < 230 || b < 230) {
        nonBackground += 1;
        if (nonBackground > 2) return false;
      }
    }
    return true;
  };

  // Walk upwards from idealY. For each candidate end-of-page Y, verify that
  // the strip immediately above it (last requiredCleanStripPx rows) is all
  // background. If so, that's a real gap — break there.
  for (let dy = 0; dy <= maxSearchUpPx; dy += 1) {
    const candidateY = idealY - dy;
    let strip = 0;
    for (let s = 0; s < requiredCleanStripPx; s += 1) {
      if (isCleanRow(candidateY - s)) strip += 1;
      else break;
    }
    if (strip >= requiredCleanStripPx) return candidateY;
  }
  return idealY;
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
  const [staffRole, setStaffRole] = useState<StaffRole | null>(null);
  const isStaffBypass = staffRole !== null;
  const isMarketing = staffRole === 'marketing';

  const pdfCaptureRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf || !pdfCaptureRef.current) return;
    setIsGeneratingPdf(true);
    setPdfError(null);
    try {
      // html2canvas-pro: a maintained fork that supports the oklch() color
      // function Tailwind v4 ships in its CSS variables. The older
      // html2canvas (still preloaded by app/layout.tsx for the Hotel Tech
      // Audit's PDF export) throws on oklch — we override window.html2canvas
      // here by force-loading pro and tracking it with a flag.
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
        console.warn('[AiAudit] PDF libs missing — falling back to print', {
          html2canvas: !!html2canvas,
          jsPDF: !!jsPDFConstructor,
        });
        setPdfError("Couldn't load the PDF library. Opening your browser's print dialog as a fallback — choose 'Save as PDF' there.");
        window.print();
        return;
      }

      const canvas = await html2canvas(pdfCaptureRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#F4F6F8',
      });

      const pdf = new jsPDFConstructor({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 8;
      const marginY = 10;
      const targetWidth = pageWidth - marginX * 2;
      const pxToMm = targetWidth / canvas.width;
      const totalHeightMm = canvas.height * pxToMm;
      const usablePageHeightMm = pageHeight - marginY * 2;

      let consumedMm = 0;
      let pageIndex = 0;
      // Pull the page break up to a clean (background-only) row when possible,
      // so tables and cards don't get sliced mid-content. Search window is
      // ~30% of a page — enough to step over a tall card without skipping
      // whole pages.
      const maxSearchUpPx = Math.floor(usablePageHeightMm * 0.3 / pxToMm);
      while (consumedMm < totalHeightMm - 0.5) {
        if (pageIndex > 0) pdf.addPage();
        pdf.setFillColor(244, 246, 248);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        const remainingMm = totalHeightMm - consumedMm;
        let sliceMm: number;
        if (remainingMm <= usablePageHeightMm) {
          // Final page — take everything left, no break-point search needed.
          sliceMm = remainingMm;
        } else {
          const idealEndYPx = Math.floor((consumedMm + usablePageHeightMm) / pxToMm);
          const safeEndYPx = findSafePageBreakY(canvas, idealEndYPx, maxSearchUpPx);
          const candidateSliceMm = safeEndYPx * pxToMm - consumedMm;
          // Never produce a page < 50% of usable height (would waste paper if
          // the search jumped too aggressively).
          sliceMm =
            candidateSliceMm >= usablePageHeightMm * 0.5
              ? candidateSliceMm
              : usablePageHeightMm;
        }
        const sliceCanvasY = consumedMm / pxToMm;
        const sliceCanvasH = sliceMm / pxToMm;

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.ceil(sliceCanvasH);
        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#F4F6F8';
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          ctx.drawImage(canvas, 0, -sliceCanvasY);
        }

        const imgData = sliceCanvas.toDataURL('image/jpeg', 0.92);
        pdf.addImage(imgData, 'JPEG', marginX, marginY, targetWidth, sliceMm);

        consumedMm += sliceMm;
        pageIndex += 1;
      }

      const hostname = safeHostnameForFilename(auditedUrl);
      pdf.save(`AI-Readiness-${hostname}.pdf`);
    } catch (err) {
      console.error('[AiAudit] PDF generation failed', err);
      const message = err instanceof Error ? err.message : 'unknown error';
      setPdfError(`PDF generation failed (${message}). Opening your browser's print dialog as a fallback — choose 'Save as PDF' there.`);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Extract just the overall score + tier label from the Gemini markdown to
  // power the score-preview donut card at the top of the done view. The
  // markdown body itself is rendered untouched below the card; this regex
  // only reads, never rewrites.
  const scorePreview = useMemo(() => {
    if (!report) return null;
    const m = report.match(/\b(\d{1,3})\s*\/\s*100\b(?:\s*[—–-]\s*([^\n]+))?/);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    if (!Number.isFinite(n) || n < 0 || n > 100) return null;
    const tierLabel = m[2] ? m[2].replace(/[*`_]/g, '').trim() : null;
    const color =
      n >= 80 ? '#2A9D8F' :
      n >= 60 ? '#F59E0B' :
      n >= 40 ? '#FF8F1B' : '#E63946';
    return { score: n, tierLabel, color };
  }, [report]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setConsentAccepted(sessionStorage.getItem(CONSENT_KEY) === 'accepted');
    setConsentChecked(true);
    formRenderedAt.current = Date.now();
    let cancelled = false;
    checkStaffBypass().then(role => {
      if (!cancelled) setStaffRole(role);
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
      // Skip the blurred preview teaser for staff (any role) and land on
      // the full report. Re-check the bypass in case the mount-time fetch
      // hasn't resolved yet for fast submitters.
      let activeRole: StaffRole | null = staffRole;
      if (!activeRole) {
        activeRole = await checkStaffBypass();
        if (activeRole) setStaffRole(activeRole);
      }
      setView(activeRole ? 'done' : 'preview');
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

  // Staff-only shortcut: skip the URL submit + Gemini call and jump straight
  // to the done view using a static sample report. Useful for iterating on
  // the rendering without burning Gemini credits each reload.
  const loadDemoReport = () => {
    setUrlError(null);
    setRequestError(null);
    setAuditedUrl('https://grandharbour-demo.example.com');
    setReport(DEMO_REPORT);
    setView('done');
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
            {isMarketing && (
              <button
                type="button"
                onClick={loadDemoReport}
                className="mt-6 text-xs font-bold uppercase tracking-widest text-brand-blue hover:underline"
              >
                Preview end page with sample report (marketing only — no Gemini call)
              </button>
            )}
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
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-blue hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                {isGeneratingPdf ? 'Exporting…' : 'Download PDF'}
              </button>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:border-brand-blue hover:text-brand-blue transition-colors"
              >
                <RotateCcw size={14} /> {l.another}
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

          {scorePreview && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6">
              <div className="p-8 sm:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="flex-shrink-0 relative w-40 h-40 sm:w-48 sm:h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Score', value: scorePreview.score },
                          { name: 'Gap', value: 100 - scorePreview.score },
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
                        <Cell fill={scorePreview.color} />
                        <Cell fill="#F3F4F6" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-black" style={{ color: scorePreview.color }}>
                      {scorePreview.score}
                    </span>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                      / 100
                    </span>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  {scorePreview.tierLabel && (
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest mb-3"
                      style={{ backgroundColor: `${scorePreview.color}1A`, color: scorePreview.color }}
                    >
                      {scorePreview.tierLabel}
                    </div>
                  )}
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                    {l.reportHeading}
                  </h2>
                  <p className="text-sm text-gray-500 mt-2 break-all">
                    <span className="text-brand-blue font-semibold">{auditedUrl}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

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
      )}
    </div>
  );
};
