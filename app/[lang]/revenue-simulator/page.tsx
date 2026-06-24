import type { Metadata } from 'next';
import { RevenueSimulator } from '../../../components/RevenueSimulator';
import { JsonLd, softwareApplicationSchema, serviceSchema } from '../../../lib/schema';
import { buildHreflang, canonicalFor } from '../../../lib/i18n';
import type { Language } from '../../../types';

const localizedMeta: Record<Language, { title: string; description: string }> = {
  en: {
    title: 'Direct Booking Revenue Simulator | Direct Booking Health Score',
    description:
      'Free interactive calculator. Enter the hotel’s annual online revenue and channel costs, then drag the slider to see the net revenue impact of moving more share to direct.',
  },
  it: {
    title: 'Simulatore di Ricavi da Prenotazioni Dirette | Direct Booking Health Score',
    description:
      "Calcolatore interattivo gratuito. Inserisci il fatturato online annuo e i costi dei canali, poi trascina il cursore per vedere l'impatto sul ricavo netto spostando più quota sul diretto.",
  },
  es: {
    title: 'Simulador de Ingresos de Reserva Directa | Direct Booking Health Score',
    description:
      'Calculadora interactiva gratuita. Introduce los ingresos online anuales y los costes de canal y arrastra el control para ver el impacto en los ingresos netos al mover más cuota a directo.',
  },
  pl: {
    title: 'Symulator Przychodów z Rezerwacji Bezpośrednich | Direct Booking Health Score',
    description:
      'Bezpłatny interaktywny kalkulator. Wprowadź roczny przychód online i koszty kanałów, a następnie przeciągnij suwak, aby zobaczyć wpływ na przychód netto przy przeniesieniu większej części na bezpośrednie.',
  },
  fr: {
    title: 'Simulateur de Revenus en Réservation Directe | Direct Booking Health Score',
    description:
      "Calculateur interactif gratuit. Saisissez le revenu en ligne annuel et les coûts de canaux, puis déplacez le curseur pour voir l'impact sur le revenu net en basculant plus de part vers le direct.",
  },
  de: {
    title: 'Direktbuchungs Umsatzsimulator | Direct Booking Health Score',
    description:
      'Kostenloser interaktiver Rechner. Geben Sie den jährlichen Online Umsatz und die Kanalkosten ein und ziehen Sie den Regler, um die Wirkung auf den Nettoumsatz zu sehen, wenn Sie mehr Anteil auf direkt verlagern.',
  },
  cs: {
    title: 'Simulátor příjmů z přímých rezervací | Direct Booking Health Score',
    description:
      'Bezplatná interaktivní kalkulačka. Zadejte roční online příjem a náklady kanálů a tažením posuvníku uvidíte dopad na čistý příjem při přesunu většího podílu na přímé.',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const meta = localizedMeta[lang as Language] ?? localizedMeta.en;
  const canonical = canonicalFor(lang as Language, '/revenue-simulator');
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical, languages: buildHreflang('/revenue-simulator') },
    openGraph: { title: meta.title, description: meta.description, url: canonical, siteName: 'Direct Booking Health Score', type: 'website' },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description },
    robots: { index: true, follow: true },
  };
}

export default function LocalizedRevenueSimulatorPage() {
  return (
    <>
      <JsonLd schema={[softwareApplicationSchema, serviceSchema]} />
      <RevenueSimulator />
    </>
  );
}
