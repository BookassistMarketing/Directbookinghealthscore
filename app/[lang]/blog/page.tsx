import type { Metadata } from 'next';
import { getAllPosts } from '../../../lib/blog';
import { BlogClientPage } from '../../../components/BlogClientPage';
import { JsonLd, blogListingSchema } from '../../../lib/schema';
import { buildHreflang, canonicalFor } from '../../../lib/i18n';
import type { Language } from '../../../types';

const localizedMeta: Record<Language, { title: string; description: string }> = {
  en: {
    title: 'Direct Booking Insights | Hotel Revenue & Technology Blog',
    description: 'Weekly strategy and technology advice for hotels reducing OTA dependency and growing direct bookings. Expert analysis from Bookassist.',
  },
  it: {
    title: 'Insights sul Direct Booking | Blog su Ricavi e Tecnologia Alberghiera',
    description: "Consigli settimanali su strategia e tecnologia per hotel che riducono la dipendenza dalle OTA e aumentano le prenotazioni dirette. Analisi degli esperti di Bookassist.",
  },
  es: {
    title: 'Perspectivas de Reserva Directa | Blog de Ingresos y Tecnología Hotelera',
    description: 'Consejos semanales de estrategia y tecnología para hoteles que reducen su dependencia de las OTA y aumentan sus reservas directas. Análisis experto de Bookassist.',
  },
  pl: {
    title: 'Spostrzeżenia o Rezerwacjach Bezpośrednich | Blog o Przychodach i Technologii Hotelowej',
    description: 'Cotygodniowe porady strategiczne i technologiczne dla hoteli zmniejszających zależność od OTA i rozwijających rezerwacje bezpośrednie. Ekspercka analiza Bookassist.',
  },
  fr: {
    title: 'Insights sur la Réservation Directe | Blog Revenus & Technologie Hôteliers',
    description: "Conseils hebdomadaires en stratégie et technologie pour les hôtels qui réduisent leur dépendance aux OTA et développent leurs réservations directes. Analyse experte de Bookassist.",
  },
  de: {
    title: 'Direct-Booking-Insights | Blog über Hotelumsatz und Technologie',
    description: 'Wöchentliche Strategie- und Technologie-Tipps für Hotels, die ihre OTA-Abhängigkeit reduzieren und Direktbuchungen steigern. Experten-Analyse von Bookassist.',
  },
  cs: {
    title: 'Postřehy o přímých rezervacích | Blog o hotelových příjmech a technologii',
    description: 'Týdenní strategické a technologické rady pro hotely snižující závislost na OTA a rozvíjející přímé rezervace. Odborná analýza od Bookassist.',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const meta = localizedMeta[lang as Language] ?? localizedMeta.en;
  const canonical = canonicalFor(lang as Language, '/blog');
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical, languages: buildHreflang('/blog') },
    openGraph: { title: meta.title, description: meta.description, url: canonical, siteName: 'Direct Booking Health Score', type: 'website' },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description },
    robots: { index: true, follow: true },
  };
}

export default function LocalizedBlogPage() {
  const postsEn = getAllPosts('en');
  const postsIt = getAllPosts('it');
  const postsEs = getAllPosts('es');
  const postsPl = getAllPosts('pl');
  const postsFr = getAllPosts('fr');
  const postsDe = getAllPosts('de');
  const postsCs = getAllPosts('cs');

  return (
    <>
      <JsonLd schema={blogListingSchema} />
      <BlogClientPage
        postsEn={postsEn}
        postsIt={postsIt}
        postsEs={postsEs}
        postsPl={postsPl}
        postsFr={postsFr}
        postsDe={postsDe}
        postsCs={postsCs}
      />
    </>
  );
}
