import type { Metadata } from 'next';
import { AiAudit } from '../../../components/AiAudit';
import { JsonLd, aiAuditSchema } from '../../../lib/schema';
import { buildHreflang, canonicalFor } from '../../../lib/i18n';
import type { Language } from '../../../types';

const localizedMeta: Record<Language, { title: string; description: string }> = {
  en: {
    title: 'AI Visibility Audit for Hotels | Direct Booking Health Score',
    description: 'Free AI Readiness Report for hotel websites. Paste your URL and see exactly how visible your site is to ChatGPT, Perplexity and Gemini — with a scored breakdown and recommended fixes.',
  },
  it: {
    title: 'Audit di Visibilità AI per Hotel | Direct Booking Health Score',
    description: "Report gratuito di AI Readiness per siti hotel. Incolla il tuo URL e scopri esattamente quanto è visibile il tuo sito per ChatGPT, Perplexity e Gemini — con punteggio dettagliato e correzioni consigliate.",
  },
  es: {
    title: 'Auditoría de Visibilidad IA para Hoteles | Direct Booking Health Score',
    description: 'Informe gratuito de AI Readiness para sitios hoteleros. Pega tu URL y descubre exactamente la visibilidad de tu sitio para ChatGPT, Perplexity y Gemini — con desglose puntuado y correcciones recomendadas.',
  },
  pl: {
    title: 'Audyt Widoczności AI dla Hoteli | Direct Booking Health Score',
    description: 'Bezpłatny raport AI Readiness dla stron hotelowych. Wklej URL i zobacz dokładnie, jak widoczna jest Twoja strona dla ChatGPT, Perplexity i Gemini — z punktowanym podziałem i zalecanymi poprawkami.',
  },
  fr: {
    title: "Audit de Visibilité IA pour Hôtels | Direct Booking Health Score",
    description: "Rapport AI Readiness gratuit pour sites hôteliers. Collez votre URL et voyez exactement la visibilité de votre site pour ChatGPT, Perplexity et Gemini — avec une analyse notée et des correctifs recommandés.",
  },
  de: {
    title: 'KI-Sichtbarkeitsaudit für Hotels | Direct Booking Health Score',
    description: 'Kostenloser AI-Readiness-Bericht für Hotel-Websites. Fügen Sie Ihre URL ein und sehen Sie genau, wie sichtbar Ihre Seite für ChatGPT, Perplexity und Gemini ist — mit bewerteter Aufschlüsselung und empfohlenen Korrekturen.',
  },
  cs: {
    title: 'Audit AI viditelnosti pro hotely | Direct Booking Health Score',
    description: 'Bezplatná zpráva AI Readiness pro hotelové weby. Vložte URL a zjistěte přesně, jak viditelný je váš web pro ChatGPT, Perplexity a Gemini — s bodovaným rozborem a doporučenými opravami.',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const meta = localizedMeta[lang as Language] ?? localizedMeta.en;
  const canonical = canonicalFor(lang as Language, '/ai-visibility-audit');
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical, languages: buildHreflang('/ai-visibility-audit') },
    openGraph: { title: meta.title, description: meta.description, url: canonical, siteName: 'Direct Booking Health Score', type: 'website' },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description },
    robots: { index: true, follow: true },
  };
}

export default function LocalizedAiAuditPage() {
  return (
    <>
      <JsonLd schema={aiAuditSchema} />
      <AiAudit />
    </>
  );
}
