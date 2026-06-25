'use client';

import React, { useMemo, useState } from 'react';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';

const DEFAULTS = {
  gross: 5_000_000,
  cur: 40,
  tgt: 60,
  ota: 18,
  dirCom: 2.15,
  mkt: 2.8,
  svc: 2800,
};

const INDUSTRY_BENCHMARK_CPA = 13; // % — Bookassist managed-client target

// Compact figures — "k rather than '000s" (180000 -> €180k, 5000000 -> €5m).
// Keeps the result tiles readable and uncramped on mobile.
const compactNum = (n: number): string => {
  const a = Math.abs(n);
  if (a >= 1_000_000) { const m = a / 1_000_000; return (m >= 10 ? Math.round(m) : +m.toFixed(1)) + 'm'; }
  if (a >= 1_000)     { const k = a / 1_000;     return (k >= 100 ? Math.round(k) : +k.toFixed(1)) + 'k'; }
  return String(Math.round(a));
};
const fmtEUR = (n: number) => '€' + compactNum(n);
const fmtSignedEUR = (n: number) => (n < 0 ? '−' : '+') + fmtEUR(n);

type RSLabels = {
  eyebrow: string;
  titleLead: string;
  titleHighlight: string;
  subtitle: string;
  hotelInputs: string;
  reset: string;
  totalRevenue: string;
  totalRevenueHint: string;
  currentShare: string;
  channelEconomics: string;
  otaCommission: string;
  directCommission: string;
  mktReinvestment: string;
  serviceFees: string;
  channelHint: string;
  targetShare: string;
  benchmark: string;
  newCpa: string;
  cpaBadge: (val: string, below: boolean) => string;
  cpaTargetSuffix: (b: number) => string;
  upliftTitle: string;
  upliftZero: string;
  shifting: (cur: number, tgt: number, grossStr: string) => string;
  cpaVsCurrent: string;
  fromCpa: (cpaStr: string) => string;
  otaSavedLabel: string;
  vsCurrentScenario: string;
  directMktReinvested: string;
  newDirectSpend: string;
  bookingMixShift: string;
  now: string;
  after: string;
  directWord: string;
  benchPrefix: (tgt: number) => string;
  benchAbove: (eur: string) => string;
  benchBelow: (eur: string) => string;
  benchPar: string;
  benchSuffix: (b: number) => string;
  ctaEyebrow: string;
  ctaTitle: string;
  ctaBody: string;
  bookDemo: string;
  disclaimer: string;
};

const LABELS: Record<Language, RSLabels> = {
  en: {
    eyebrow: 'Revenue Simulator',
    titleLead: 'What if your hotel shifted',
    titleHighlight: 'more bookings direct?',
    subtitle:
      "Fill in the hotel's annual figures. Drag the slider to see the net revenue, CPA, and OTA commission impact of moving more share to direct.",
    hotelInputs: 'Hotel inputs',
    reset: 'Reset',
    totalRevenue: 'Total online revenue (€)',
    totalRevenueHint: 'Annual gross revenue from all online channels combined.',
    currentShare: 'Current direct share',
    channelEconomics: 'Channel economics',
    otaCommission: 'OTA commission %',
    directCommission: 'Direct booking commission %',
    mktReinvestment: 'Marketing reinvestment %',
    serviceFees: 'Service fees (€)',
    channelHint:
      'Defaults reflect typical figures from Bookassist managed clients. OTA commission is the blended rate paid to Booking.com / Expedia / etc.',
    targetShare: 'Target direct share',
    benchmark: 'Industry benchmark: 40%+',
    newCpa: 'New Total CPA',
    cpaBadge: (v, below) => `${v} pts ${below ? 'below' : 'above'}`,
    cpaTargetSuffix: b => `the ${b}% industry target`,
    upliftTitle: 'Annual net revenue uplift',
    upliftZero: 'Set a target above current to see the uplift.',
    shifting: (cur, tgt, g) => `Shifting ${cur}% → ${tgt}% direct on €${g} gross.`,
    cpaVsCurrent: 'CPA vs current',
    fromCpa: c => `from ${c}%`,
    otaSavedLabel: 'OTA commission saved',
    vsCurrentScenario: 'vs current scenario',
    directMktReinvested: 'Direct marketing reinvested',
    newDirectSpend: 'new direct spend',
    bookingMixShift: 'Booking mix shift',
    now: 'Now',
    after: 'After',
    directWord: 'direct',
    benchPrefix: tgt => `At ${tgt}% direct, net revenue is `,
    benchAbove: e => `${e} above`,
    benchBelow: e => `${e} below`,
    benchPar: 'on par with',
    benchSuffix: b => ` the ${b}% CPA industry benchmark.`,
    ctaEyebrow: 'How Bookassist gets you there',
    ctaTitle: 'Booking engine, metasearch, and direct campaigns, managed end to end.',
    ctaBody:
      'We deliver the booking engine, the paid search and metasearch spend, and the website itself: the three levers that move the share above.',
    bookDemo: 'Book a Demo',
    disclaimer:
      'Estimates derived from the inputs above. Directional planning tool; actual results vary with demand mix, channel cost, conversion rate, and seasonality.',
  },
  it: {
    eyebrow: 'Revenue Simulatore',
    titleLead: 'E se il tuo hotel spostasse',
    titleHighlight: 'più prenotazioni sul diretto?',
    subtitle:
      "Inserisci i dati annuali dell'hotel. Trascina il cursore per vedere l'impatto su fatturato netto, CPA e commissioni OTA spostando più quota sul diretto.",
    hotelInputs: 'Dati hotel',
    reset: 'Reimposta',
    totalRevenue: 'Fatturato online totale (€)',
    totalRevenueHint: 'Fatturato lordo annuo da tutti i canali online combinati.',
    currentShare: 'Quota diretta attuale',
    channelEconomics: 'Economia dei canali',
    otaCommission: 'Commissione OTA %',
    directCommission: 'Commissione prenotazione diretta %',
    mktReinvestment: 'Reinvestimento marketing %',
    serviceFees: 'Costi di servizio (€)',
    channelHint:
      'I valori predefiniti riflettono cifre tipiche dei clienti gestiti da Bookassist. La commissione OTA è la tariffa media pagata a Booking.com / Expedia / ecc.',
    targetShare: 'Quota diretta obiettivo',
    benchmark: 'Benchmark di settore: 40%+',
    newCpa: 'Nuovo CPA totale',
    cpaBadge: (v, below) => `${v} pts ${below ? 'sotto' : 'sopra'}`,
    cpaTargetSuffix: b => `il target di settore del ${b}%`,
    upliftTitle: 'Incremento ricavo netto annuo',
    upliftZero: "Imposta un obiettivo superiore all'attuale per vedere l'incremento.",
    shifting: (cur, tgt, g) => `Dal ${cur}% al ${tgt}% diretto su €${g} di fatturato.`,
    cpaVsCurrent: 'CPA vs attuale',
    fromCpa: c => `da ${c}%`,
    otaSavedLabel: 'Commissioni OTA risparmiate',
    vsCurrentScenario: 'vs scenario attuale',
    directMktReinvested: 'Marketing diretto reinvestito',
    newDirectSpend: 'nuova spesa diretta',
    bookingMixShift: 'Spostamento del mix di prenotazioni',
    now: 'Ora',
    after: 'Dopo',
    directWord: 'diretto',
    benchPrefix: tgt => `Al ${tgt}% diretto, il ricavo netto è `,
    benchAbove: e => `${e} sopra`,
    benchBelow: e => `${e} sotto`,
    benchPar: 'in linea con',
    benchSuffix: b => ` il benchmark di settore CPA del ${b}%.`,
    ctaEyebrow: 'Come Bookassist ti porta lì',
    ctaTitle: 'Booking engine, metasearch e campagne dirette, gestiti end to end.',
    ctaBody:
      'Forniamo il booking engine, la spesa per paid search e metasearch e il sito stesso: le tre leve che muovono la quota qui sopra.',
    bookDemo: 'Prenota una demo',
    disclaimer:
      'Stime derivate dai dati inseriti sopra. Strumento di pianificazione indicativo; i risultati reali variano con il mix di domanda, il costo dei canali, il tasso di conversione e la stagionalità.',
  },
  es: {
    eyebrow: 'Revenue Simulador',
    titleLead: '¿Y si tu hotel moviera',
    titleHighlight: 'más reservas a directo?',
    subtitle:
      'Introduce las cifras anuales del hotel. Arrastra el control para ver el impacto en ingresos netos, CPA y comisiones OTA al mover más cuota a directo.',
    hotelInputs: 'Datos del hotel',
    reset: 'Restablecer',
    totalRevenue: 'Ingresos online totales (€)',
    totalRevenueHint: 'Ingresos brutos anuales de todos los canales online combinados.',
    currentShare: 'Cuota directa actual',
    channelEconomics: 'Economía de canales',
    otaCommission: 'Comisión OTA %',
    directCommission: 'Comisión de reserva directa %',
    mktReinvestment: 'Reinversión en marketing %',
    serviceFees: 'Tarifas de servicio (€)',
    channelHint:
      'Los valores por defecto reflejan cifras típicas de clientes gestionados por Bookassist. La comisión OTA es la tarifa media pagada a Booking.com / Expedia / etc.',
    targetShare: 'Cuota directa objetivo',
    benchmark: 'Referencia del sector: 40%+',
    newCpa: 'Nuevo CPA total',
    cpaBadge: (v, below) => `${v} pts ${below ? 'por debajo' : 'por encima'}`,
    cpaTargetSuffix: b => `del objetivo del sector del ${b}%`,
    upliftTitle: 'Aumento de ingresos netos anuales',
    upliftZero: 'Fija un objetivo superior al actual para ver el aumento.',
    shifting: (cur, tgt, g) => `Del ${cur}% al ${tgt}% directo sobre €${g} brutos.`,
    cpaVsCurrent: 'CPA vs actual',
    fromCpa: c => `desde ${c}%`,
    otaSavedLabel: 'Comisión OTA ahorrada',
    vsCurrentScenario: 'vs escenario actual',
    directMktReinvested: 'Marketing directo reinvertido',
    newDirectSpend: 'nuevo gasto directo',
    bookingMixShift: 'Cambio en el mix de reservas',
    now: 'Ahora',
    after: 'Después',
    directWord: 'directo',
    benchPrefix: tgt => `Al ${tgt}% directo, el ingreso neto está `,
    benchAbove: e => `${e} por encima`,
    benchBelow: e => `${e} por debajo`,
    benchPar: 'a la par con',
    benchSuffix: b => ` la referencia del sector de CPA del ${b}%.`,
    ctaEyebrow: 'Cómo Bookassist te lleva allí',
    ctaTitle: 'Motor de reservas, metasearch y campañas directas, gestionados de principio a fin.',
    ctaBody:
      'Aportamos el motor de reservas, la inversión en paid search y metasearch, y el propio sitio web: las tres palancas que mueven la cuota de arriba.',
    bookDemo: 'Reserva una demo',
    disclaimer:
      'Estimaciones derivadas de los datos anteriores. Herramienta de planificación orientativa; los resultados reales varían según el mix de demanda, el coste de canal, la tasa de conversión y la estacionalidad.',
  },
  pl: {
    eyebrow: 'Revenue Symulator',
    titleLead: 'A gdyby Twój hotel przeniósł',
    titleHighlight: 'więcej rezerwacji na bezpośrednie?',
    subtitle:
      'Wprowadź roczne dane hotelu. Przeciągnij suwak, aby zobaczyć wpływ na przychód netto, CPA i prowizje OTA przy przeniesieniu większej części na bezpośrednie.',
    hotelInputs: 'Dane hotelu',
    reset: 'Resetuj',
    totalRevenue: 'Całkowity przychód online (€)',
    totalRevenueHint: 'Roczny przychód brutto ze wszystkich kanałów online łącznie.',
    currentShare: 'Obecny udział bezpośredni',
    channelEconomics: 'Ekonomia kanałów',
    otaCommission: 'Prowizja OTA %',
    directCommission: 'Prowizja za rezerwację bezpośrednią %',
    mktReinvestment: 'Reinwestycja w marketing %',
    serviceFees: 'Opłaty serwisowe (€)',
    channelHint:
      'Wartości domyślne odzwierciedlają typowe dane klientów obsługiwanych przez Bookassist. Prowizja OTA to średnia stawka płacona Booking.com / Expedia / itp.',
    targetShare: 'Docelowy udział bezpośredni',
    benchmark: 'Benchmark branżowy: 40%+',
    newCpa: 'Nowy całkowity CPA',
    cpaBadge: (v, below) => `${v} pts ${below ? 'poniżej' : 'powyżej'}`,
    cpaTargetSuffix: b => `celu branżowego ${b}%`,
    upliftTitle: 'Roczny wzrost przychodu netto',
    upliftZero: 'Ustaw cel wyższy niż obecny, aby zobaczyć wzrost.',
    shifting: (cur, tgt, g) => `Z ${cur}% na ${tgt}% bezpośrednio przy €${g} brutto.`,
    cpaVsCurrent: 'CPA vs obecny',
    fromCpa: c => `z ${c}%`,
    otaSavedLabel: 'Zaoszczędzona prowizja OTA',
    vsCurrentScenario: 'vs obecny scenariusz',
    directMktReinvested: 'Reinwestowany marketing bezpośredni',
    newDirectSpend: 'nowe wydatki bezpośrednie',
    bookingMixShift: 'Zmiana miksu rezerwacji',
    now: 'Teraz',
    after: 'Po',
    directWord: 'bezpośrednie',
    benchPrefix: tgt => `Przy ${tgt}% bezpośrednich przychód netto jest `,
    benchAbove: e => `${e} powyżej`,
    benchBelow: e => `${e} poniżej`,
    benchPar: 'na równi z',
    benchSuffix: b => ` benchmarku branżowego CPA ${b}%.`,
    ctaEyebrow: 'Jak Bookassist Cię tam doprowadzi',
    ctaTitle: 'Silnik rezerwacyjny, metasearch i kampanie bezpośrednie, zarządzane kompleksowo.',
    ctaBody:
      'Dostarczamy silnik rezerwacyjny, wydatki na paid search i metasearch oraz samą stronę: trzy dźwignie, które poruszają udział powyżej.',
    bookDemo: 'Zamów prezentację',
    disclaimer:
      'Szacunki na podstawie powyższych danych. Narzędzie planowania poglądowego; rzeczywiste wyniki różnią się w zależności od miksu popytu, kosztu kanału, współczynnika konwersji i sezonowości.',
  },
  fr: {
    eyebrow: 'Revenue Simulateur',
    titleLead: 'Et si votre hôtel basculait',
    titleHighlight: 'plus de réservations en direct ?',
    subtitle:
      "Renseignez les chiffres annuels de l'hôtel. Déplacez le curseur pour voir l'impact sur le revenu net, le CPA et les commissions OTA en basculant plus de part vers le direct.",
    hotelInputs: "Données de l'hôtel",
    reset: 'Réinitialiser',
    totalRevenue: 'Revenu en ligne total (€)',
    totalRevenueHint: 'Revenu brut annuel de tous les canaux en ligne combinés.',
    currentShare: 'Part directe actuelle',
    channelEconomics: 'Économie des canaux',
    otaCommission: 'Commission OTA %',
    directCommission: 'Commission de réservation directe %',
    mktReinvestment: 'Réinvestissement marketing %',
    serviceFees: 'Frais de service (€)',
    channelHint:
      'Les valeurs par défaut reflètent des chiffres typiques de clients gérés par Bookassist. La commission OTA est le taux moyen payé à Booking.com / Expedia / etc.',
    targetShare: 'Part directe cible',
    benchmark: 'Référence du secteur : 40%+',
    newCpa: 'Nouveau CPA total',
    cpaBadge: (v, below) => `${v} pts ${below ? 'sous' : 'de plus que'}`,
    cpaTargetSuffix: b => `l'objectif sectoriel de ${b}%`,
    upliftTitle: 'Gain de revenu net annuel',
    upliftZero: "Définissez une cible supérieure à l'actuel pour voir le gain.",
    shifting: (cur, tgt, g) => `Du ${cur}% au ${tgt}% en direct sur €${g} brut.`,
    cpaVsCurrent: 'CPA vs actuel',
    fromCpa: c => `depuis ${c}%`,
    otaSavedLabel: 'Commission OTA économisée',
    vsCurrentScenario: 'vs scénario actuel',
    directMktReinvested: 'Marketing direct réinvesti',
    newDirectSpend: 'nouvelle dépense directe',
    bookingMixShift: 'Évolution du mix de réservations',
    now: 'Maintenant',
    after: 'Après',
    directWord: 'direct',
    benchPrefix: tgt => `À ${tgt}% en direct, le revenu net est `,
    benchAbove: e => `${e} de plus que`,
    benchBelow: e => `${e} de moins que`,
    benchPar: 'au niveau de',
    benchSuffix: b => ` la référence sectorielle de CPA de ${b}%.`,
    ctaEyebrow: 'Comment Bookassist vous y amène',
    ctaTitle: 'Booking engine, metasearch et campagnes directes, gérés de bout en bout.',
    ctaBody:
      "Nous fournissons le booking engine, les dépenses paid search et metasearch, et le site lui-même : les trois leviers qui font bouger la part ci-dessus.",
    bookDemo: 'Réserver une démo',
    disclaimer:
      "Estimations issues des données ci-dessus. Outil de planification indicatif ; les résultats réels varient selon le mix de demande, le coût des canaux, le taux de conversion et la saisonnalité.",
  },
  de: {
    eyebrow: 'Revenue Simulator',
    titleLead: 'Was wäre, wenn Ihr Hotel mehr',
    titleHighlight: 'Buchungen direkt erzielt?',
    subtitle:
      'Tragen Sie die Jahreszahlen des Hotels ein. Ziehen Sie den Regler, um die Wirkung auf Nettoumsatz, CPA und OTA Provisionen zu sehen, wenn Sie mehr Anteil auf direkt verlagern.',
    hotelInputs: 'Hoteldaten',
    reset: 'Zurücksetzen',
    totalRevenue: 'Gesamter Online Umsatz (€)',
    totalRevenueHint: 'Jährlicher Bruttoumsatz aus allen Online Kanälen zusammen.',
    currentShare: 'Aktueller Direktanteil',
    channelEconomics: 'Kanalökonomie',
    otaCommission: 'OTA Provision %',
    directCommission: 'Provision Direktbuchung %',
    mktReinvestment: 'Marketing Reinvestition %',
    serviceFees: 'Servicegebühren (€)',
    channelHint:
      'Die Standardwerte entsprechen typischen Zahlen von Kunden, die Bookassist betreut. Die OTA Provision ist der durchschnittliche Satz, der an Booking.com / Expedia / usw. gezahlt wird.',
    targetShare: 'Ziel Direktanteil',
    benchmark: 'Branchen Benchmark: 40%+',
    newCpa: 'Neuer Gesamt CPA',
    cpaBadge: (v, below) => `${v} pts ${below ? 'unter' : 'über'}`,
    cpaTargetSuffix: b => `dem Branchenziel von ${b}%`,
    upliftTitle: 'Jährlicher Nettoumsatz Zuwachs',
    upliftZero: 'Setzen Sie ein Ziel über dem aktuellen Wert, um den Zuwachs zu sehen.',
    shifting: (cur, tgt, g) => `Von ${cur}% auf ${tgt}% direkt bei €${g} brutto.`,
    cpaVsCurrent: 'CPA vs aktuell',
    fromCpa: c => `von ${c}%`,
    otaSavedLabel: 'Gesparte OTA Provision',
    vsCurrentScenario: 'vs aktuelles Szenario',
    directMktReinvested: 'Reinvestiertes Direktmarketing',
    newDirectSpend: 'neue Direktausgaben',
    bookingMixShift: 'Verschiebung des Buchungsmix',
    now: 'Jetzt',
    after: 'Danach',
    directWord: 'direkt',
    benchPrefix: tgt => `Bei ${tgt}% direkt liegt der Nettoumsatz `,
    benchAbove: e => `${e} über`,
    benchBelow: e => `${e} unter`,
    benchPar: 'gleichauf mit',
    benchSuffix: b => ` dem CPA Branchen Benchmark von ${b}%.`,
    ctaEyebrow: 'So bringt Bookassist Sie dorthin',
    ctaTitle: 'Booking Engine, Metasearch und Direktkampagnen, durchgängig betreut.',
    ctaBody:
      'Wir liefern die Booking Engine, die Ausgaben für Paid Search und Metasearch sowie die Website selbst: die drei Hebel, die den Anteil oben bewegen.',
    bookDemo: 'Eine Demo buchen',
    disclaimer:
      'Schätzungen auf Basis der obigen Eingaben. Richtungsweisendes Planungstool; die tatsächlichen Ergebnisse variieren je nach Nachfragemix, Kanalkosten, Konversionsrate und Saisonalität.',
  },
  cs: {
    eyebrow: 'Revenue Simulátor',
    titleLead: 'Co kdyby váš hotel získal',
    titleHighlight: 'více přímých rezervací?',
    subtitle:
      'Zadejte roční čísla hotelu. Tažením posuvníku uvidíte dopad na čistý příjem, CPA a provize OTA při přesunu většího podílu na přímé.',
    hotelInputs: 'Údaje hotelu',
    reset: 'Obnovit',
    totalRevenue: 'Celkový online příjem (€)',
    totalRevenueHint: 'Roční hrubý příjem ze všech online kanálů dohromady.',
    currentShare: 'Aktuální přímý podíl',
    channelEconomics: 'Ekonomika kanálů',
    otaCommission: 'Provize OTA %',
    directCommission: 'Provize za přímou rezervaci %',
    mktReinvestment: 'Reinvestice do marketingu %',
    serviceFees: 'Servisní poplatky (€)',
    channelHint:
      'Výchozí hodnoty odpovídají typickým číslům klientů, které spravuje Bookassist. Provize OTA je průměrná sazba placená Booking.com / Expedia / atd.',
    targetShare: 'Cílový přímý podíl',
    benchmark: 'Oborový benchmark: 40%+',
    newCpa: 'Nové celkové CPA',
    cpaBadge: (v, below) => `${v} pts ${below ? 'pod' : 'nad'}`,
    cpaTargetSuffix: b => `oborovým cílem ${b}%`,
    upliftTitle: 'Roční nárůst čistého příjmu',
    upliftZero: 'Nastavte cíl vyšší než aktuální, abyste viděli nárůst.',
    shifting: (cur, tgt, g) => `Z ${cur}% na ${tgt}% přímo při €${g} hrubého.`,
    cpaVsCurrent: 'CPA vs aktuální',
    fromCpa: c => `z ${c}%`,
    otaSavedLabel: 'Ušetřená provize OTA',
    vsCurrentScenario: 'vs aktuální scénář',
    directMktReinvested: 'Reinvestovaný přímý marketing',
    newDirectSpend: 'nové přímé výdaje',
    bookingMixShift: 'Změna mixu rezervací',
    now: 'Nyní',
    after: 'Poté',
    directWord: 'přímé',
    benchPrefix: tgt => `Při ${tgt}% přímých je čistý příjem `,
    benchAbove: e => `${e} nad`,
    benchBelow: e => `${e} pod`,
    benchPar: 'na úrovni',
    benchSuffix: b => ` oborového benchmarku CPA ${b}%.`,
    ctaEyebrow: 'Jak vás tam Bookassist dostane',
    ctaTitle: 'Rezervační systém, metasearch a přímé kampaně, spravované od začátku do konce.',
    ctaBody:
      'Dodáváme rezervační systém, výdaje na paid search a metasearch i samotný web: tři páky, které hýbou podílem výše.',
    bookDemo: 'Rezervujte si ukázku',
    disclaimer:
      'Odhady odvozené z výše uvedených údajů. Orientační plánovací nástroj; skutečné výsledky se liší podle mixu poptávky, nákladů kanálu, míry konverze a sezónnosti.',
  },
};

function metrics(
  gross: number,
  sharePct: number,
  otaPct: number,
  dirComPct: number,
  mktPct: number,
  svcFees: number,
) {
  const directShare = sharePct / 100;
  const otaShare = (100 - sharePct) / 100;
  const directRev = gross * directShare;
  const otaRev = gross * otaShare;
  const mktSpend = directRev * (mktPct / 100);
  const directCost = directRev * (dirComPct / 100) + mktSpend + svcFees;
  const otaCost = otaRev * (otaPct / 100);
  const totalCost = directCost + otaCost;
  const netRevenue = gross - totalCost;
  const totalCPA = gross > 0 ? (totalCost / gross) * 100 : 0;
  return { directRev, otaRev, mktSpend, directCost, otaCost, totalCost, netRevenue, totalCPA };
}

export const RevenueSimulator: React.FC = () => {
  const { language } = useContent();
  const t = LABELS[language] ?? LABELS.en;

  const [gross, setGross] = useState(DEFAULTS.gross);
  const [cur, setCur] = useState(DEFAULTS.cur);
  const [tgt, setTgt] = useState(DEFAULTS.tgt);
  const [otaPct, setOtaPct] = useState(DEFAULTS.ota);
  const [dirCom, setDirCom] = useState(DEFAULTS.dirCom);
  const [mktPct, setMktPct] = useState(DEFAULTS.mkt);
  const [svcFees, setSvcFees] = useState(DEFAULTS.svc);

  const current = useMemo(
    () => metrics(gross, cur, otaPct, dirCom, mktPct, svcFees),
    [gross, cur, otaPct, dirCom, mktPct, svcFees],
  );
  const target = useMemo(
    () => metrics(gross, tgt, otaPct, dirCom, mktPct, svcFees),
    [gross, tgt, otaPct, dirCom, mktPct, svcFees],
  );

  const uplift = target.netRevenue - current.netRevenue;
  const cpaDeltaPts = target.totalCPA - current.totalCPA;
  const otaSaved = current.otaCost - target.otaCost;
  const mktDelta = target.mktSpend - current.mktSpend;
  const benchmarkNet = gross * (1 - INDUSTRY_BENCHMARK_CPA / 100);
  const benchmarkDiff = target.netRevenue - benchmarkNet;

  const reset = () => {
    setGross(DEFAULTS.gross);
    setCur(DEFAULTS.cur);
    setTgt(DEFAULTS.tgt);
    setOtaPct(DEFAULTS.ota);
    setDirCom(DEFAULTS.dirCom);
    setMktPct(DEFAULTS.mkt);
    setSvcFees(DEFAULTS.svc);
  };

  // Slider track gradient — teal up to thumb, slate after.
  const trackBg = (pct: number) =>
    `linear-gradient(to right, #2A9D8F ${pct}%, #E2E8F0 ${pct}%)`;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <style>{`
        .rs-range { -webkit-appearance: none; appearance: none; background: transparent; width: 100%; }
        .rs-range::-webkit-slider-runnable-track { height: 6px; border-radius: 9999px; }
        .rs-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          height: 22px; width: 22px; border-radius: 9999px;
          background: white; border: 3px solid #003366;
          margin-top: -8px; cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.18);
        }
        .rs-range::-moz-range-track { height: 6px; border-radius: 9999px; }
        .rs-range::-moz-range-thumb {
          height: 22px; width: 22px; border-radius: 9999px;
          background: white; border: 3px solid #003366;
          cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.18);
        }
        .num-tabular { font-variant-numeric: tabular-nums; }
      `}</style>

      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-success/10 text-brand-success text-xs font-bold tracking-wider uppercase mb-4">
          {t.eyebrow}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-brand-blue leading-tight">
          {t.titleLead}{' '}
          <span className="text-brand-success">{t.titleHighlight}</span>
        </h1>
        <p className="text-slate-600 mt-3 max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:items-start">
        {/* INPUTS */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              {t.hotelInputs}
            </h2>
            <button
              type="button"
              onClick={reset}
              className="text-xs font-semibold text-slate-500 hover:text-brand-blue underline"
            >
              {t.reset}
            </button>
          </div>

          <div>
            <label
              className="block text-sm font-semibold text-slate-700 mb-1.5"
              htmlFor="rs-gross"
            >
              {t.totalRevenue}
            </label>
            <input
              id="rs-gross"
              type="number"
              min={0}
              step={100000}
              value={gross}
              onChange={e => setGross(Math.max(0, +e.target.value || 0))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-lg font-semibold text-brand-blue num-tabular focus:outline-none focus:ring-2 focus:ring-brand-success"
            />
            <div className="text-xs text-slate-400 mt-1">{t.totalRevenueHint}</div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label
                className="text-sm font-semibold text-slate-700"
                htmlFor="rs-cur"
              >
                {t.currentShare}
              </label>
              <span className="text-lg font-black text-brand-blue num-tabular">
                {cur}%
              </span>
            </div>
            <input
              id="rs-cur"
              type="range"
              min={0}
              max={100}
              value={cur}
              onChange={e => setCur(+e.target.value)}
              className="rs-range"
              style={{ background: trackBg(cur) }}
            />
          </div>

          <details className="text-xs text-slate-500" open>
            <summary className="cursor-pointer select-none hover:text-brand-blue font-semibold mb-2">
              {t.channelEconomics}
            </summary>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <label className="flex flex-col justify-end">
                <span className="text-slate-600 font-medium mb-1">{t.otaCommission}</span>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={0.1}
                  value={otaPct}
                  onChange={e => setOtaPct(+e.target.value || 0)}
                  className="w-full rounded border border-slate-300 px-2 py-1.5 num-tabular focus:outline-none focus:ring-2 focus:ring-brand-success"
                />
              </label>
              <label className="flex flex-col justify-end">
                <span className="text-slate-600 font-medium mb-1">
                  {t.directCommission}
                </span>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={0.01}
                  value={dirCom}
                  onChange={e => setDirCom(+e.target.value || 0)}
                  className="w-full rounded border border-slate-300 px-2 py-1.5 num-tabular focus:outline-none focus:ring-2 focus:ring-brand-success"
                />
              </label>
              <label className="flex flex-col justify-end">
                <span className="text-slate-600 font-medium mb-1">{t.mktReinvestment}</span>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={0.01}
                  value={mktPct}
                  onChange={e => setMktPct(+e.target.value || 0)}
                  className="w-full rounded border border-slate-300 px-2 py-1.5 num-tabular focus:outline-none focus:ring-2 focus:ring-brand-success"
                />
              </label>
              <label className="flex flex-col justify-end">
                <span className="text-slate-600 font-medium mb-1">{t.serviceFees}</span>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={svcFees}
                  onChange={e => setSvcFees(Math.max(0, +e.target.value || 0))}
                  className="w-full rounded border border-slate-300 px-2 py-1.5 num-tabular focus:outline-none focus:ring-2 focus:ring-brand-success"
                />
              </label>
            </div>
            <p className="text-slate-400 mt-2 leading-relaxed">{t.channelHint}</p>
          </details>
        </section>

        {/* OUTPUT */}
        <section className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              {t.targetShare}
            </h2>
            <span className="text-2xl font-black text-brand-success num-tabular">
              {tgt}%
            </span>
          </div>
          <input
            id="rs-tgt"
            type="range"
            min={0}
            max={100}
            value={tgt}
            onChange={e => setTgt(+e.target.value)}
            className="rs-range mb-2"
            style={{ background: trackBg(tgt) }}
          />
          <div className="flex justify-between text-xs text-slate-400 font-medium mb-6">
            <span>0%</span>
            <span className="text-brand-success">{t.benchmark}</span>
            <span>100%</span>
          </div>

          {/* Headline — CPA left, net revenue right */}
          <div
            className="rounded-2xl p-5 sm:p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-0 sm:divide-x divide-white/20"
            style={{ background: 'linear-gradient(135deg, #003366 0%, #2A9D8F 100%)' }}
          >
            <div className="sm:pr-6">
              <div className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                {t.newCpa}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white num-tabular leading-none whitespace-nowrap tracking-tight">
                {target.totalCPA.toFixed(2)}%
              </div>
              <div className="text-white/85 text-sm mt-2.5">
                {target.totalCPA <= INDUSTRY_BENCHMARK_CPA ? (
                  <>
                    <span className="font-bold text-white">
                      {t.cpaBadge((INDUSTRY_BENCHMARK_CPA - target.totalCPA).toFixed(2), true)}
                    </span>{' '}
                    {t.cpaTargetSuffix(INDUSTRY_BENCHMARK_CPA)}
                  </>
                ) : (
                  <>
                    <span className="font-bold text-white">
                      {t.cpaBadge((target.totalCPA - INDUSTRY_BENCHMARK_CPA).toFixed(2), false)}
                    </span>{' '}
                    {t.cpaTargetSuffix(INDUSTRY_BENCHMARK_CPA)}
                  </>
                )}
              </div>
            </div>
            <div className="sm:pl-6">
              <div className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                {t.upliftTitle}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white num-tabular leading-none whitespace-nowrap tracking-tight">
                {fmtSignedEUR(uplift)}
              </div>
              <div className="text-white/85 text-sm mt-2.5">
                {tgt <= cur
                  ? t.upliftZero
                  : t.shifting(cur, tgt, compactNum(gross))}
              </div>
            </div>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-xl bg-brand-light p-3 sm:p-4 min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {t.cpaVsCurrent}
              </div>
              <div
                className={`text-base sm:text-xl font-black num-tabular whitespace-nowrap ${
                  cpaDeltaPts <= 0 ? 'text-brand-success' : 'text-brand-accent'
                }`}
              >
                {cpaDeltaPts <= 0 ? '−' : '+'}
                {Math.abs(cpaDeltaPts).toFixed(2)} pts
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {t.fromCpa(current.totalCPA.toFixed(2))}
              </div>
            </div>
            <div className="rounded-xl bg-brand-light p-3 sm:p-4 min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {t.otaSavedLabel}
              </div>
              <div
                className={`text-base sm:text-xl font-black num-tabular whitespace-nowrap ${
                  otaSaved >= 0 ? 'text-brand-success' : 'text-brand-accent'
                }`}
              >
                {(otaSaved >= 0 ? '+' : '−') + fmtEUR(otaSaved)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{t.vsCurrentScenario}</div>
            </div>
            <div className="rounded-xl bg-brand-light p-3 sm:p-4 min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {t.directMktReinvested}
              </div>
              <div
                className="text-base sm:text-xl font-black num-tabular whitespace-nowrap"
                style={{ color: '#F4A261' }}
              >
                {(mktDelta >= 0 ? '+' : '−') + fmtEUR(mktDelta)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{t.newDirectSpend}</div>
            </div>
          </div>

          {/* Mix bar */}
          <div className="mt-6">
            <div className="text-xs font-semibold text-slate-500 mb-2">{t.bookingMixShift}</div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">{t.now}</span>
                  <span className="num-tabular">
                    {cur}% {t.directWord} · {100 - cur}% OTA
                  </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden flex bg-slate-100">
                  <div className="bg-brand-blue h-full" style={{ width: `${cur}%` }} />
                  <div className="bg-slate-300 h-full flex-1" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-brand-success font-semibold">{t.after}</span>
                  <span className="num-tabular">
                    {tgt}% {t.directWord} · {100 - tgt}% OTA
                  </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden flex bg-slate-100">
                  <div
                    className="bg-brand-success h-full"
                    style={{ width: `${tgt}%` }}
                  />
                  <div className="bg-slate-300 h-full flex-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Industry benchmark line */}
          {gross > 0 && (
            <div className="text-xs text-slate-500 mt-4 text-center">
              {t.benchPrefix(tgt)}
              {benchmarkDiff > 0 ? (
                <span className="text-brand-success font-semibold">
                  {t.benchAbove(fmtEUR(benchmarkDiff))}
                </span>
              ) : benchmarkDiff < 0 ? (
                <span className="text-brand-accent font-semibold">
                  {t.benchBelow(fmtEUR(benchmarkDiff))}
                </span>
              ) : (
                <span className="font-semibold">{t.benchPar}</span>
              )}
              {t.benchSuffix(INDUSTRY_BENCHMARK_CPA)}
            </div>
          )}
        </section>
      </div>

      {/* CTA */}
      <div
        className="mt-8 rounded-2xl p-6 sm:p-8 text-white"
        style={{ background: 'linear-gradient(135deg, #003366 0%, #002244 100%)' }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1">
              {t.ctaEyebrow}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">{t.ctaTitle}</h3>
            <p className="text-white/70 text-sm mt-1 max-w-2xl">{t.ctaBody}</p>
          </div>
          <a
            href="https://bookassist.com/book-a-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-brand-blue font-bold hover:bg-brand-light transition"
          >
            {t.bookDemo}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-8 max-w-2xl mx-auto">{t.disclaimer}</p>
    </div>
  );
};
