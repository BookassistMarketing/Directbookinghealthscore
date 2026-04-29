import type { Metadata } from 'next';
import { Security } from '../../../components/Security';
import { JsonLd } from '../../../lib/schema';
import { buildHreflang, canonicalFor } from '../../../lib/i18n';
import type { Language } from '../../../types';

const localizedMeta: Record<Language, { title: string; description: string }> = {
  en: { title: 'Security & Privacy | Direct Booking Health Score', description: 'Security and privacy information for the Direct Booking Health Score hotel audit tool by Bookassist.' },
  it: { title: 'Sicurezza e Privacy | Direct Booking Health Score', description: "Informazioni su sicurezza e privacy per lo strumento di audit alberghiero Direct Booking Health Score di Bookassist." },
  es: { title: 'Seguridad y Privacidad | Direct Booking Health Score', description: 'Información de seguridad y privacidad para la herramienta de auditoría hotelera Direct Booking Health Score de Bookassist.' },
  pl: { title: 'Bezpieczeństwo i Prywatność | Direct Booking Health Score', description: 'Informacje o bezpieczeństwie i prywatności narzędzia audytu hotelowego Direct Booking Health Score od Bookassist.' },
  fr: { title: 'Sécurité et Confidentialité | Direct Booking Health Score', description: "Informations sur la sécurité et la confidentialité de l'outil d'audit hôtelier Direct Booking Health Score de Bookassist." },
  de: { title: 'Sicherheit & Datenschutz | Direct Booking Health Score', description: 'Sicherheits- und Datenschutzinformationen für das Hotel-Audit-Tool Direct Booking Health Score von Bookassist.' },
  cs: { title: 'Bezpečnost a soukromí | Direct Booking Health Score', description: 'Informace o bezpečnosti a soukromí pro nástroj hotelového auditu Direct Booking Health Score od Bookassist.' },
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const meta = localizedMeta[lang as Language] ?? localizedMeta.en;
  const canonical = canonicalFor(lang as Language, '/security');
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical, languages: buildHreflang('/security') },
    openGraph: { title: meta.title, description: meta.description, url: canonical, siteName: 'Direct Booking Health Score', type: 'website' },
    robots: { index: true, follow: true },
  };
}

export default async function LocalizedSecurityPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const canonical = canonicalFor(lang as Language, '/security');
  const meta = localizedMeta[lang as Language] ?? localizedMeta.en;
  const securityPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: meta.title,
    url: canonical,
    description: meta.description,
    inLanguage: lang,
    publisher: { '@type': 'Organization', name: 'Bookassist', url: 'https://bookassist.org' },
  };
  return (
    <>
      <JsonLd schema={securityPageSchema} />
      <Security />
    </>
  );
}
