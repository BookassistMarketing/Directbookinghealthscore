import type { Metadata } from 'next';
import { HomeClient } from '../../components/HomeClient';
import { JsonLd, organizationSchema, webSiteSchema } from '../../lib/schema';
import { getAllPosts } from '../../lib/blog';
import { buildHreflang, canonicalFor } from '../../lib/i18n';
import type { Language } from '../../types';

const localizedHomeMeta: Record<Language, { title: string; description: string; ogDescription: string }> = {
  en: {
    title: 'Direct Booking Health Score | Free Hotel Tech Audit',
    description: 'The industry standard hotel technology audit. Assess your direct booking strategy, metasearch connectivity, and marketing ROI in under 3 minutes.',
    ogDescription: 'Identify revenue leakage from OTAs. Free AI-powered audit of your hotel direct booking infrastructure.',
  },
  it: {
    title: 'Direct Booking Health Score | Audit Tecnologico Gratuito per Hotel',
    description: 'Lo standard del settore per la valutazione della tecnologia alberghiera. Analizza la strategia di prenotazione diretta, la connettività metasearch e il ROI marketing in meno di 3 minuti.',
    ogDescription: 'Identifica le perdite di ricavo a favore delle OTA. Audit gratuito basato su IA della tua infrastruttura di prenotazione diretta.',
  },
  es: {
    title: 'Direct Booking Health Score | Auditoría Técnica Gratuita para Hoteles',
    description: 'El estándar de la industria para auditar la tecnología hotelera. Evalúa tu estrategia de reserva directa, conectividad metasearch y ROI de marketing en menos de 3 minutos.',
    ogDescription: 'Identifica las fugas de ingresos hacia las OTA. Auditoría gratuita con IA de tu infraestructura de reserva directa.',
  },
  pl: {
    title: 'Direct Booking Health Score | Bezpłatny Audyt Technologii Hotelowej',
    description: 'Standard branżowy w audycie technologii hotelowej. Oceń strategię rezerwacji bezpośrednich, łączność metasearch i ROI marketingu w mniej niż 3 minuty.',
    ogDescription: 'Zidentyfikuj utratę przychodów na rzecz OTA. Bezpłatny audyt infrastruktury rezerwacji bezpośrednich oparty na AI.',
  },
  fr: {
    title: 'Direct Booking Health Score | Audit Technologique Hôtelier Gratuit',
    description: 'La référence du secteur pour auditer la technologie hôtelière. Évaluez votre stratégie de réservation directe, votre connectivité Metasearch et votre ROI marketing en moins de 3 minutes.',
    ogDescription: "Identifiez les fuites de revenus vers les OTA. Audit gratuit alimenté par l'IA de votre infrastructure de réservation directe.",
  },
  de: {
    title: 'Direct Booking Health Score | Kostenloser Hotel-Tech-Audit',
    description: 'Der Branchenstandard für Hotel-Tech-Audits. Bewerten Sie Ihre Direktbuchungsstrategie, Metasearch-Anbindung und Marketing-ROI in unter 3 Minuten.',
    ogDescription: 'Identifizieren Sie Umsatzverluste an OTAs. Kostenloser KI-gestützter Audit Ihrer Direktbuchungs-Infrastruktur.',
  },
  cs: {
    title: 'Direct Booking Health Score | Bezplatný hotelový tech audit',
    description: 'Oborový standard pro audit hotelové technologie. Vyhodnoťte strategii přímých rezervací, metasearch konektivitu a marketingovou ROI za méně než 3 minuty.',
    ogDescription: 'Identifikujte úniky příjmů ve prospěch OTA. Bezplatný AI audit vaší infrastruktury přímých rezervací.',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const meta = localizedHomeMeta[lang as Language] ?? localizedHomeMeta.en;
  const canonical = canonicalFor(lang as Language, '/');
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical, languages: buildHreflang('/') },
    openGraph: {
      title: meta.title,
      description: meta.ogDescription,
      url: canonical,
      siteName: 'Direct Booking Health Score',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.ogDescription,
    },
    robots: { index: true, follow: true },
  };
}

export default function LocalizedHomePage() {
  const recentEn = getAllPosts('en').slice(0, 3);
  const recentIt = getAllPosts('it').slice(0, 3);
  const recentEs = getAllPosts('es').slice(0, 3);
  const recentPl = getAllPosts('pl').slice(0, 3);
  const recentFr = getAllPosts('fr').slice(0, 3);
  const recentDe = getAllPosts('de').slice(0, 3);
  const recentCs = getAllPosts('cs').slice(0, 3);

  return (
    <>
      <JsonLd schema={[organizationSchema, webSiteSchema]} />
      <HomeClient
        recentEn={recentEn}
        recentIt={recentIt}
        recentEs={recentEs}
        recentPl={recentPl}
        recentFr={recentFr}
        recentDe={recentDe}
        recentCs={recentCs}
      />
    </>
  );
}
