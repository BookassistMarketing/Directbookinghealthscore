import type { Metadata } from 'next';
import { AuditTool } from '../../../components/AuditTool';
import { JsonLd, softwareApplicationSchema, serviceSchema } from '../../../lib/schema';
import { buildHreflang, canonicalFor } from '../../../lib/i18n';
import type { Language } from '../../../types';

const localizedMeta: Record<Language, { title: string; description: string }> = {
  en: {
    title: 'Hotel Direct Booking Audit Tool | Direct Booking Health Score',
    description: 'Free AI-powered hotel technology audit. Answer questions about your booking engine, metasearch, CRM and analytics to get an instant scored report.',
  },
  it: {
    title: 'Strumento di Audit per Prenotazioni Dirette Hotel | Direct Booking Health Score',
    description: "Audit gratuito basato su IA della tecnologia alberghiera. Rispondi alle domande sul tuo booking engine, metasearch, CRM e analisi per ottenere un report punteggiato istantaneo.",
  },
  es: {
    title: 'Herramienta de Auditoría de Reserva Directa para Hoteles | Direct Booking Health Score',
    description: 'Auditoría gratuita con IA de tecnología hotelera. Responde preguntas sobre tu motor de reservas, metasearch, CRM y analítica y obtén un informe puntuado al instante.',
  },
  pl: {
    title: 'Narzędzie Audytu Rezerwacji Bezpośrednich dla Hoteli | Direct Booking Health Score',
    description: 'Bezpłatny audyt technologii hotelowej oparty na AI. Odpowiedz na pytania o silnik rezerwacyjny, metasearch, CRM i analitykę i otrzymaj natychmiastowy raport z wynikiem.',
  },
  fr: {
    title: "Outil d'Audit de Réservation Directe pour Hôtels | Direct Booking Health Score",
    description: "Audit gratuit de technologie hôtelière alimenté par l'IA. Répondez à des questions sur votre moteur de réservation, Metasearch, CRM et analytique pour obtenir un rapport noté instantanément.",
  },
  de: {
    title: 'Hotel-Direktbuchungs-Audit-Tool | Direct Booking Health Score',
    description: 'Kostenloser KI-gestützter Hotel-Tech-Audit. Beantworten Sie Fragen zu Ihrer Buchungsmaschine, Metasearch, CRM und Analytik und erhalten Sie sofort einen bewerteten Bericht.',
  },
  cs: {
    title: 'Nástroj pro audit přímých rezervací hotelu | Direct Booking Health Score',
    description: 'Bezplatný AI audit hotelové technologie. Odpovězte na otázky o rezervačním systému, metasearch, CRM a analytice a získejte okamžitý bodovaný report.',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const meta = localizedMeta[lang as Language] ?? localizedMeta.en;
  const canonical = canonicalFor(lang as Language, '/hotel-audit');
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical, languages: buildHreflang('/hotel-audit') },
    openGraph: { title: meta.title, description: meta.description, url: canonical, siteName: 'Direct Booking Health Score', type: 'website' },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description },
    robots: { index: true, follow: true },
  };
}

export default function LocalizedHotelAuditPage() {
  return (
    <>
      <JsonLd schema={[softwareApplicationSchema, serviceSchema]} />
      <AuditTool />
    </>
  );
}
