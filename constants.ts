import { Question, Language } from './types';

export const CATEGORY_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Direct Booking': { en: 'Direct Booking', it: 'Prenotazione Diretta', es: 'Reserva Directa' },
  'Metasearch': { en: 'Metasearch', it: 'Metamotori', es: 'Metabuscadores' },
  'Analytics': { en: 'Analytics', it: 'Analisi', es: 'Analítica' },
  'CRM': { en: 'CRM', it: 'CRM', es: 'CRM' }
};

export const QUESTIONS: Question[] = [
  {
    id: 1,
    translations: {
      en: { text: "Is your website your main source of revenue?", subtext: "Relying heavily on OTAs significantly reduces your bottom-line profit margins due to high commission costs." },
      it: { text: "Il tuo sito web è la tua principale fonte di reddito?", subtext: "Affidarsi pesantemente alle OTA riduce significativamente i margini di profitto a causa degli elevati costi di commissione." },
      es: { text: "¿Es tu sitio web tu principal fuente de ingresos?", subtext: "Depender en gran medida de las OTA reduce significativamente tus márgenes de beneficio debido a los altos costes de comisión." }
    },
    category: 'Direct Booking',
    weight: 12
  },
  {
    id: 2,
    translations: {
      en: { text: "Does your booking engine automatically upgrade a guest to a superior room if their selected standard room is sold out?", subtext: "Losing a confirmed booking because the base room is full while suites are empty is a preventable revenue leak." },
      it: { text: "Il tuo motore di prenotazione offre upgrade automatici se la camera standard è esaurita?", subtext: "Perdere una prenotazione perché la camera base è piena mentre le suite sono vuote è una perdita di ricavi evitabile." },
      es: { text: "¿Tu motor de reservas ofrece mejoras automáticas si la habitación estándar está agotada?", subtext: "Perder una reserva confirmada porque la habitación base está llena mientras las suites están vacías es una fuga de ingresos evitable." }
    },
    category: 'Direct Booking',
    weight: 10
  },
  {
    id: 3,
    translations: {
      en: { text: "Does your booking engine have a mechanism to prioritise and highlight the most relevant rate plans?", subtext: "Overwhelming guests with too many unorganised options decreases conversion rates; smart prioritization is key." },
      it: { text: "Il tuo motore di prenotazione evidenzia i piani tariffari più rilevanti?", subtext: "Sopraffare gli ospiti con troppe opzioni disorganizzate riduce i tassi di conversione; la prioritizzazione intelligente è fondamentale." },
      es: { text: "¿Tu motor de reservas destaca los planes de tarifas más relevantes?", subtext: "Abrumar a los huéspedes con demasiadas opciones desorganizadas reduce las tasas de conversión; la priorización inteligente es clave." }
    },
    category: 'Direct Booking',
    weight: 8
  },
  {
    id: 4,
    translations: {
      en: { text: "Are you using dynamic 'Meal Plan' bundling to create unique packages that OTAs cannot match?", subtext: "Exclusive bundled content is your strongest technical weapon against strict OTA rate parity agreements." },
      it: { text: "Usi pacchetti dinamici (es. Cena + B&B) che le OTA non possono eguagliare?", subtext: "Il contenuto esclusivo in pacchetto è la tua arma tecnica più forte contro gli accordi di parità tariffaria delle OTA." },
      es: { text: "¿Utilizas paquetes dinámicos (p. ej., Cena + B&B) que las OTA no pueden igualar?", subtext: "El contenido exclusivo en paquetes es tu arma técnica más fuerte contra los acuerdos de paridad de tarifas de las OTA." }
    },
    category: 'Direct Booking',
    weight: 12
  },
  {
    id: 5,
    translations: {
      en: { text: "Are you running active 'Brand Protection' PPC campaigns to stop OTAs from bidding on your hotel's name?", subtext: "If you don't bid on your own brand name, OTAs will capture that traffic and sell your own customer back to you at a commission." },
      it: { text: "Fai campagne PPC di 'Brand Protection' per impedire alle OTA di puntare sul nome del tuo hotel?", subtext: "Se non investi sul tuo nome, le OTA cattureranno quel traffico rivendendoti il tuo stesso cliente a commissione." },
      es: { text: "¿Realizas campañas de PPC de 'Protección de Marca' para evitar que las OTA pujen por el nombre de tu hotel?", subtext: "Si no pujas por tu propio nombre de marca, las OTA capturarán ese tráfico y te revenderán tu propio cliente bajo comisión." }
    },
    category: 'Metasearch',
    weight: 10
  },
  {
    id: 6,
    translations: {
      en: { text: "Are you running Metasearch campaigns (Google/Trivago) on a guaranteed CPA model?", subtext: "Standard CPC models risk wasted budget on clicks that don't convert; a CPA model guarantees ROI on every booking." },
      it: { text: "Fai campagne sui Metamotori (Google/Trivago) con un modello CPA garantito?", subtext: "I modelli CPC standard rischiano sprechi su clic non convertiti; un modello CPA garantisce il ROI su ogni prenotazione." },
      es: { text: "¿Realizas campañas en Metabuscadores (Google/Trivago) con un modelo de CPA garantizado?", subtext: "Los modelos CPC estándar corren el riesgo de desperdiciar presupuesto; un modelo CPA garantiza el ROI en cada reserva." }
    },
    category: 'Metasearch',
    weight: 10
  },
  {
    id: 7,
    translations: {
      en: { text: "Do you run specific 'Win-Back' retargeting campaigns for guests who visited but didn't book?", subtext: "97% of visitors leave to compare rates. Retargeting is essential to bring them back to book direct." },
      it: { text: "Fai campagne di retargeting 'Win-Back' per chi ha visitato il sito senza prenotare?", subtext: "Il 97% dei visitatori esce per confrontare i prezzi. Il retargeting è essenziale per riportarli a prenotare diretto." },
      es: { text: "¿Realizas campañas de retargeting 'Win-Back' para quienes visitaron el sitio sin reservar?", subtext: "El 97% de los visitantes sale para comparar precios. El retargeting es esencial para que vuelvan a reservar directo." }
    },
    category: 'Analytics',
    weight: 10
  },
  {
    id: 8,
    translations: {
      en: { text: "Is your website built on a 'Mobile-First' CMS architected for 2026 Core Web Vitals?", subtext: "Site speed is now a primary ranking factor for Google and a critical conversion factor for mobile guests." },
      it: { text: "Il tuo sito è costruito su un CMS 'Mobile-First' ottimizzato per i Core Web Vitals 2026?", subtext: "La velocità del sito è un fattore di ranking primario per Google e critico per la conversione mobile." },
      es: { text: "¿Tu sitio está construido sobre un CMS 'Mobile-First' optimizado para los Core Web Vitals 2026?", subtext: "La velocidad del sitio es un factor de ranking primario para Google y crítico para la conversión móvil." }
    },
    category: 'Direct Booking',
    weight: 10
  },
  {
    id: 9,
    translations: {
      en: { text: "Does your website automatically personalise content based on the visitor’s country (Geo-Targeting)?", subtext: "Relevance drives revenue. Domestic and international guests require different messaging and offers to convert." },
      it: { text: "Il tuo sito personalizza i contenuti in base al paese del visitatore (Geo-Targeting)?", subtext: "La rilevanza genera entrate. Gli ospiti nazionali e internazionali richiedono messaggi diversi per convertire." },
      es: { text: "¿Tu sitio personaliza el contenido según el país del visitante (Geo-Targeting)?", subtext: "La relevancia genera ingresos. Los huéspedes nacionales e internacionales requieren mensajes diferentes para convertir." }
    },
    category: 'Direct Booking',
    weight: 8
  },
  {
    id: 10,
    translations: {
      en: { text: "Do you track your 'True Cost of Acquisition' (Direct vs OTA) across all channels?", subtext: "You cannot effectively optimise net profit if you only measure top-line revenue without factoring in commission costs." },
      it: { text: "Monitori il 'Vero Costo di Acquisizione' (Diretto vs OTA) su tutti i canali?", subtext: "Non puoi ottimizzare il profitto netto se misuri solo i ricavi lordi senza calcolare i costi delle commissioni." },
      es: { text: "¿Monitoreas el 'Costo Real de Adquisición' (Directo vs OTA) en todos los canales?", subtext: "No puedes optimizar el beneficio neto si solo mides los ingresos brutos sin calcular los costos de comisión." }
    },
    category: 'Analytics',
    weight: 12
  },
  {
    id: 11,
    translations: {
      en: { text: "Does your strategy involve a dedicated human expert who reviews performance data monthly?", subtext: "Automated reports are just data; human interpretation is required to turn that data into a profitable strategy." },
      it: { text: "La tua strategia prevede un esperto umano che analizzi i dati mensilmente con te?", subtext: "I report automatici sono solo dati; serve l'interpretazione umana per trasformarli in strategia redditizia." },
      es: { text: "¿Tu estrategia incluye un experto humano que analice los datos mensualmente contigo?", subtext: "Los informes automáticos son solo datos; se necesita interpretación humana para convertirlos en estrategia rentable." }
    },
    category: 'CRM',
    weight: 10
  },
  {
    id: 12,
    translations: {
      en: { text: "Does your tech provider use AI for the benefit of your hotel and its direct strategy?", subtext: "AI should be actively reducing your workload and increasing your conversion, not just used as a buzzword." },
      it: { text: "Il tuo fornitore tecnologico usa l'IA a vantaggio della strategia diretta del tuo hotel?", subtext: "L'IA dovrebbe ridurre il tuo carico di lavoro e aumentare le conversioni, non essere solo una parola di moda." },
      es: { text: "¿Tu proveedor tecnológico utiliza IA en beneficio de la estrategia directa de tu hotel?", subtext: "La IA debería reducir tu carga de trabajo y aumentar las conversiones, no ser solo una palabra de moda." }
    },
    category: 'Analytics',
    weight: 8
  },
  {
    id: 13,
    translations: {
      en: { text: "Does your marketing technology automatically stop spending on dates where your hotel is sold out?", subtext: "Advertising unavailable rooms is the fastest way to waste budget and frustrate potential guests." },
      it: { text: "Il tuo marketing si ferma automaticamente nelle date in cui l'hotel è al completo?", subtext: "Pubblicizzare camere non disponibili è il modo più rapido per sprecare budget e frustrare i potenziali ospiti." },
      es: { text: "¿Tu marketing se detiene automáticamente en las fechas en las que el hotel está completo?", subtext: "Publicitar habitaciones no disponibles es la forma más rápida de desperdiciar presupuesto y frustrar a los huéspedes." }
    },
    category: 'Metasearch',
    weight: 12
  },
  {
    id: 14,
    translations: {
      en: { text: "Is your website specifically optimised for AI Search (GEO) in addition to traditional SEO?", subtext: "Generative Engine Optimisation (GEO) is the future of how guests will find hotels via AI assistants." },
      it: { text: "Il tuo sito è ottimizzato per la Ricerca AI (GEO) oltre alla SEO tradizionale?", subtext: "La Generative Engine Optimisation (GEO) è il futuro di come gli ospiti troveranno hotel tramite assistenti AI." },
      es: { text: "¿Tu sitio está optimizado para la Búsqueda AI (GEO) además del SEO tradicional?", subtext: "La Generative Engine Optimisation (GEO) es el futuro de cómo los huéspedes encontrarán hoteles mediante asistentes IA." }
    },
    category: 'Direct Booking',
    weight: 10
  },
  {
    id: 15,
    translations: {
      en: { text: "Does your tech provider use an AI-powered Bidding Strategy with Dynamic Budget Management?", subtext: "Manual bidding cannot compete with real-time, algorithmic market adjustments that react instantly to demand." },
      it: { text: "Il tuo fornitore usa strategie di bidding basate su IA con gestione dinamica del budget?", subtext: "Il bidding manuale non può competere con le regolazioni algoritmiche in tempo reale che reagiscono alla domanda." },
      es: { text: "¿Tu proveedor utiliza estrategias de puja basadas en IA con gestión dinámica del presupuesto?", subtext: "La puja manual no puede competir con los ajustes algorítmicos en tiempo real que reaccionan a la demanda." }
    },
    category: 'Metasearch',
    weight: 10
  }
];

export const MAX_SCORE = QUESTIONS.reduce((acc, q) => acc + q.weight, 0);