import { Question, Language } from './types';

export const CATEGORY_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Direct Booking': { en: 'Direct Booking', it: 'Prenotazione Diretta', es: 'Reserva Directa', pl: 'Rezerwacje Bezpośrednie', fr: 'Réservation Directe', de: 'Direktbuchung', cs: 'Přímé rezervace' },
  'Metasearch': { en: 'Metasearch', it: 'Metamotori', es: 'Metabuscadores', pl: 'Metawyszukiwarki', fr: 'Metasearch', de: 'Metasearch', cs: 'Metasearch' },
  'Analytics': { en: 'Analytics', it: 'Analisi', es: 'Analítica', pl: 'Analityka', fr: 'Analytique', de: 'Analytik', cs: 'Analytika' },
  'CRM': { en: 'CRM', it: 'CRM', es: 'CRM', pl: 'CRM', fr: 'CRM', de: 'CRM', cs: 'CRM' },
  'SEO & AI Search': {
    en: 'SEO & AI Search',
    it: 'SEO e Ricerca AI',
    es: 'SEO y Búsqueda con IA',
    pl: 'SEO i Wyszukiwanie AI',
    fr: 'SEO et Recherche IA',
    de: 'SEO & KI-Suche',
    cs: 'SEO a AI vyhledávání',
  },
};

export const QUESTIONS: Question[] = [
  {
    id: 1,
    translations: {
      en: { text: "Is your website your main source of revenue?", subtext: "Relying heavily on OTAs significantly reduces your bottom-line profit margins due to high commission costs." },
      it: { text: "Il tuo sito web è la tua principale fonte di reddito?", subtext: "Affidarsi pesantemente alle OTA riduce significativamente i margini di profitto a causa degli elevati costi di commissione." },
      es: { text: "¿Es tu sitio web tu principal fuente de ingresos?", subtext: "Depender en gran medida de las OTA reduce significativamente tus márgenes de beneficio debido a los altos costes de comisión." },
      pl: { text: "Czy Twoja strona internetowa jest głównym źródłem przychodów?", subtext: "Nadmierne poleganie na OTA znacząco obniża marże zysku netto z powodu wysokich kosztów prowizji." },
      fr: { text: "Votre site web est-il votre principale source de revenus ?", subtext: "Une dépendance excessive aux OTA réduit considérablement vos marges nettes en raison des coûts de commission élevés." },
      de: { text: "Ist Ihre Website Ihre Haupteinnahmequelle?", subtext: "Eine starke Abhängigkeit von OTAs reduziert Ihre Nettomargen aufgrund hoher Provisionskosten erheblich." },
      cs: { text: "Jsou vaše webové stránky vaším hlavním zdrojem příjmů?", subtext: "Silná závislost na OTA výrazně snižuje vaše čisté marže kvůli vysokým provizním nákladům." }
    },
    category: 'Direct Booking',
    weight: 12
  },
  {
    id: 2,
    translations: {
      en: { text: "Does your booking engine automatically upgrade a guest to a superior room if their selected standard room is sold out?", subtext: "Losing a confirmed booking because the base room is full while suites are empty is a preventable revenue leak." },
      it: { text: "Il tuo motore di prenotazione offre upgrade automatici se la camera standard è esaurita?", subtext: "Perdere una prenotazione perché la camera base è piena mentre le suite sono vuote è una perdita di ricavi evitabile." },
      es: { text: "¿Tu motor de reservas ofrece mejoras automáticas si la habitación estándar está agotada?", subtext: "Perder una reserva confirmada porque la habitación base está llena mientras las suites están vacías es una fuga de ingresos evitable." },
      pl: { text: "Czy Twój silnik rezerwacyjny automatycznie oferuje upgrade do lepszego pokoju, gdy wybrany pokój standardowy jest wyprzedany?", subtext: "Utrata potwierdzonej rezerwacji, gdy pokój bazowy jest pełny, a apartamenty pozostają puste, to możliwa do uniknięcia utrata przychodów." },
      fr: { text: "Votre moteur de réservation propose-t-il un surclassement automatique vers une chambre supérieure lorsque la chambre standard sélectionnée est complète ?", subtext: "Perdre une réservation confirmée parce que la chambre de base est complète alors que les suites sont vides est une fuite de revenus évitable." },
      de: { text: "Bietet Ihre Buchungsmaschine automatisch ein Upgrade in ein höherwertiges Zimmer an, wenn das gewählte Standardzimmer ausgebucht ist?", subtext: "Eine bestätigte Buchung zu verlieren, weil das Basiszimmer voll ist, während Suiten leer stehen, ist ein vermeidbarer Umsatzverlust." },
      cs: { text: "Nabízí váš rezervační systém automaticky upgrade na vyšší pokoj, pokud je zvolený standardní pokoj vyprodaný?", subtext: "Ztratit potvrzenou rezervaci, protože je základní pokoj plný a apartmány zůstávají prázdné, je odstranitelná ztráta příjmů." }
    },
    category: 'Direct Booking',
    weight: 10
  },
  {
    id: 3,
    translations: {
      en: { text: "Does your booking engine have a mechanism to prioritise and highlight the most relevant rate plans?", subtext: "Overwhelming guests with too many unorganised options decreases conversion rates; smart prioritization is key." },
      it: { text: "Il tuo motore di prenotazione evidenzia i piani tariffari più rilevanti?", subtext: "Sopraffare gli ospiti con troppe opzioni disorganizzate riduce i tassi di conversione; la prioritizzazione intelligente è fondamentale." },
      es: { text: "¿Tu motor de reservas destaca los planes de tarifas más relevantes?", subtext: "Abrumar a los huéspedes con demasiadas opciones desorganizadas reduce las tasas de conversión; la priorización inteligente es clave." },
      pl: { text: "Czy Twój silnik rezerwacyjny posiada mechanizm priorytetyzacji i wyróżniania najbardziej odpowiednich planów taryfowych?", subtext: "Przytłaczanie gości zbyt wieloma nieuporządkowanymi opcjami obniża wskaźniki konwersji; inteligentna priorytetyzacja jest kluczowa." },
      fr: { text: "Votre moteur de réservation dispose-t-il d'un mécanisme pour prioriser et mettre en avant les plans tarifaires les plus pertinents ?", subtext: "Submerger les clients avec trop d'options désorganisées diminue les taux de conversion ; la priorisation intelligente est essentielle." },
      de: { text: "Verfügt Ihre Buchungsmaschine über einen Mechanismus zur Priorisierung und Hervorhebung der relevantesten Ratenpläne?", subtext: "Gäste mit zu vielen unorganisierten Optionen zu überfordern senkt die Konversionsraten; intelligente Priorisierung ist entscheidend." },
      cs: { text: "Má váš rezervační systém mechanismus pro prioritizaci a zvýraznění nejrelevantnějších tarifních plánů?", subtext: "Zahlcení hostů příliš mnoha neuspořádanými možnostmi snižuje míru konverze; chytrá prioritizace je klíčová." }
    },
    category: 'Direct Booking',
    weight: 8
  },
  {
    id: 4,
    translations: {
      en: { text: "Are you using dynamic 'Meal Plan' bundling to create unique packages that OTAs cannot match?", subtext: "Exclusive bundled content is your strongest technical weapon against strict OTA rate parity agreements." },
      it: { text: "Usi pacchetti dinamici (es. Cena + B&B) che le OTA non possono eguagliare?", subtext: "Il contenuto esclusivo in pacchetto è la tua arma tecnica più forte contro gli accordi di parità tariffaria delle OTA." },
      es: { text: "¿Utilizas paquetes dinámicos (p. ej., Cena + B&B) que las OTA no pueden igualar?", subtext: "El contenido exclusivo en paquetes es tu arma técnica más fuerte contra los acuerdos de paridad de tarifas de las OTA." },
      pl: { text: "Czy stosujesz dynamiczne pakiety 'Meal Plan' (np. Kolacja + B&B), aby tworzyć unikalne oferty, którym OTA nie mogą dorównać?", subtext: "Ekskluzywne treści pakietowe to Twoja najmocniejsza broń techniczna przeciwko rygorystycznym umowom parytetu cenowego OTA." },
      fr: { text: "Utilisez-vous le bundling dynamique 'Meal Plan' pour créer des forfaits uniques que les OTA ne peuvent égaler ?", subtext: "Le contenu groupé exclusif est votre arme technique la plus forte contre les accords stricts de parité tarifaire des OTA." },
      de: { text: "Nutzen Sie dynamisches 'Meal Plan'-Bundling, um einzigartige Pakete zu schnüren, die OTAs nicht abbilden können?", subtext: "Exklusive gebündelte Inhalte sind Ihre stärkste technische Waffe gegen strenge OTA-Ratenparitätsvereinbarungen." },
      cs: { text: "Používáte dynamický 'Meal Plan' bundling k vytvoření jedinečných balíčků, které OTA nemohou nabídnout?", subtext: "Exkluzivní balíčkový obsah je vaší nejsilnější technickou zbraní proti přísným dohodám OTA o cenové paritě." }
    },
    category: 'Direct Booking',
    weight: 12
  },
  {
    id: 5,
    translations: {
      en: { text: "Are you running active 'Brand Protection' PPC campaigns to stop OTAs from bidding on your hotel's name?", subtext: "If you don't bid on your own brand name, OTAs will capture that traffic and sell your own customer back to you at a commission." },
      it: { text: "Fai campagne PPC di 'Brand Protection' per impedire alle OTA di puntare sul nome del tuo hotel?", subtext: "Se non investi sul tuo nome, le OTA cattureranno quel traffico rivendendoti il tuo stesso cliente a commissione." },
      es: { text: "¿Realizas campañas de PPC de 'Protección de Marca' para evitar que las OTA pujen por el nombre de tu hotel?", subtext: "Si no pujas por tu propio nombre de marca, las OTA capturarán ese tráfico y te revenderán tu propio cliente bajo comisión." },
      pl: { text: "Czy prowadzisz aktywne kampanie PPC typu 'Brand Protection', aby powstrzymać OTA przed licytowaniem nazwy Twojego hotelu?", subtext: "Jeśli nie licytujesz własnej nazwy marki, OTA przechwycą ten ruch i odsprzedadzą Ci Twojego własnego klienta z prowizją." },
      fr: { text: "Menez-vous des campagnes PPC actives de 'Brand Protection' pour empêcher les OTA d'enchérir sur le nom de votre hôtel ?", subtext: "Si vous n'enchérissez pas sur votre propre marque, les OTA captureront ce trafic et vous revendront votre propre client moyennant commission." },
      de: { text: "Führen Sie aktive 'Brand Protection'-PPC-Kampagnen durch, um zu verhindern, dass OTAs auf den Namen Ihres Hotels bieten?", subtext: "Wenn Sie nicht auf Ihren eigenen Markennamen bieten, schnappen sich OTAs diesen Traffic und verkaufen Ihnen Ihren eigenen Kunden gegen Provision zurück." },
      cs: { text: "Provozujete aktivní PPC kampaně 'Brand Protection', které brání OTA v licitování na název vašeho hotelu?", subtext: "Pokud nelicituje na vlastní značku, OTA tento provoz zachytí a prodají vám zpět vašeho vlastního zákazníka s provizí." }
    },
    category: 'Metasearch',
    weight: 10
  },
  {
    id: 6,
    translations: {
      en: { text: "Are you running Metasearch campaigns (Google/Trivago) on a guaranteed CPA model?", subtext: "Standard CPC models risk wasted budget on clicks that don't convert; a CPA model guarantees ROI on every booking." },
      it: { text: "Fai campagne sui Metamotori (Google/Trivago) con un modello CPA garantito?", subtext: "I modelli CPC standard rischiano sprechi su clic non convertiti; un modello CPA garantisce il ROI su ogni prenotazione." },
      es: { text: "¿Realizas campañas en Metabuscadores (Google/Trivago) con un modelo de CPA garantizado?", subtext: "Los modelos CPC estándar corren el riesgo de desperdiciar presupuesto; un modelo CPA garantiza el ROI en cada reserva." },
      pl: { text: "Czy prowadzisz kampanie w metawyszukiwarkach (Google/Trivago) w gwarantowanym modelu CPA?", subtext: "Standardowe modele CPC ryzykują marnowanie budżetu na kliknięcia, które nie konwertują; model CPA gwarantuje ROI z każdej rezerwacji." },
      fr: { text: "Menez-vous des campagnes sur les Metasearch (Google/Trivago) selon un modèle CPA garanti ?", subtext: "Les modèles CPC standard risquent de gaspiller le budget sur des clics qui ne convertissent pas ; un modèle CPA garantit le ROI sur chaque réservation." },
      de: { text: "Führen Sie Metasearch-Kampagnen (Google/Trivago) mit einem garantierten CPA-Modell durch?", subtext: "Standard-CPC-Modelle riskieren verschwendetes Budget für Klicks, die nicht konvertieren; ein CPA-Modell garantiert ROI bei jeder Buchung." },
      cs: { text: "Provozujete Metasearch kampaně (Google/Trivago) na garantovaném CPA modelu?", subtext: "Standardní CPC modely riskují plýtvání rozpočtem na nekonvertující kliknutí; CPA model zaručuje ROI u každé rezervace." }
    },
    category: 'Metasearch',
    weight: 10
  },
  {
    id: 7,
    translations: {
      en: { text: "Do you run specific 'Win-Back' retargeting campaigns for guests who visited but didn't book?", subtext: "97% of visitors leave to compare rates. Retargeting is essential to bring them back to book direct." },
      it: { text: "Fai campagne di retargeting 'Win-Back' per chi ha visitato il sito senza prenotare?", subtext: "Il 97% dei visitatori esce per confrontare i prezzi. Il retargeting è essenziale per riportarli a prenotare diretto." },
      es: { text: "¿Realizas campañas de retargeting 'Win-Back' para quienes visitaron el sitio sin reservar?", subtext: "El 97% de los visitantes sale para comparar precios. El retargeting es esencial para que vuelvan a reservar directo." },
      pl: { text: "Czy prowadzisz dedykowane kampanie retargetingowe 'Win-Back' dla gości, którzy odwiedzili stronę, ale nie zarezerwowali?", subtext: "97% odwiedzających opuszcza stronę, aby porównać ceny. Retargeting jest niezbędny, aby sprowadzić ich z powrotem i rezerwować bezpośrednio." },
      fr: { text: "Menez-vous des campagnes de retargeting 'Win-Back' spécifiques pour les visiteurs qui n'ont pas réservé ?", subtext: "97 % des visiteurs partent comparer les tarifs. Le retargeting est essentiel pour les ramener vers la réservation directe." },
      de: { text: "Führen Sie spezifische 'Win-Back'-Retargeting-Kampagnen für Gäste durch, die Ihre Website besucht, aber nicht gebucht haben?", subtext: "97 % der Besucher verlassen die Seite, um Preise zu vergleichen. Retargeting ist essenziell, um sie zur Direktbuchung zurückzuholen." },
      cs: { text: "Provozujete specifické retargetingové kampaně 'Win-Back' pro hosty, kteří navštívili web, ale nerezervovali?", subtext: "97 % návštěvníků odchází porovnávat ceny. Retargeting je nezbytný, aby se vrátili a rezervovali přímo." }
    },
    category: 'Analytics',
    weight: 10
  },
  {
    id: 8,
    translations: {
      en: { text: "Is your website built on a 'Mobile-First' CMS architected for 2026 Core Web Vitals?", subtext: "Site speed is now a primary ranking factor for Google and a critical conversion factor for mobile guests." },
      it: { text: "Il tuo sito è costruito su un CMS 'Mobile-First' ottimizzato per i Core Web Vitals 2026?", subtext: "La velocità del sito è un fattore di ranking primario per Google e critico per la conversione mobile." },
      es: { text: "¿Tu sitio está construido sobre un CMS 'Mobile-First' optimizado para los Core Web Vitals 2026?", subtext: "La velocidad del sitio es un factor de ranking primario para Google y crítico para la conversión móvil." },
      pl: { text: "Czy Twoja strona jest zbudowana na CMS typu 'Mobile-First', zaprojektowanym pod Core Web Vitals 2026?", subtext: "Szybkość strony jest obecnie głównym czynnikiem rankingowym Google i krytycznym czynnikiem konwersji dla gości mobilnych." },
      fr: { text: "Votre site est-il construit sur un CMS 'Mobile-First' architecturé pour les Core Web Vitals 2026 ?", subtext: "La vitesse du site est désormais un facteur de classement primaire pour Google et un facteur de conversion critique pour les clients mobiles." },
      de: { text: "Ist Ihre Website auf einem 'Mobile-First'-CMS aufgebaut, das für die Core Web Vitals 2026 ausgelegt ist?", subtext: "Die Seitengeschwindigkeit ist heute ein primärer Ranking-Faktor für Google und ein kritischer Konversionsfaktor für mobile Gäste." },
      cs: { text: "Je váš web postaven na 'Mobile-First' CMS navrženém pro Core Web Vitals 2026?", subtext: "Rychlost webu je nyní hlavním faktorem hodnocení Google a kritickým faktorem konverze pro mobilní hosty." }
    },
    category: 'Direct Booking',
    weight: 10
  },
  {
    id: 9,
    translations: {
      en: { text: "Does your website automatically personalise content based on the visitor’s country (Geo-Targeting)?", subtext: "Relevance drives revenue. Domestic and international guests require different messaging and offers to convert." },
      it: { text: "Il tuo sito personalizza i contenuti in base al paese del visitatore (Geo-Targeting)?", subtext: "La rilevanza genera entrate. Gli ospiti nazionali e internazionali richiedono messaggi diversi per convertire." },
      es: { text: "¿Tu sitio personaliza el contenido según el país del visitante (Geo-Targeting)?", subtext: "La relevancia genera ingresos. Los huéspedes nacionales e internacionales requieren mensajes diferentes para convertir." },
      pl: { text: "Czy Twoja strona automatycznie personalizuje treści na podstawie kraju odwiedzającego (Geo-Targeting)?", subtext: "Trafność napędza przychody. Goście krajowi i międzynarodowi wymagają różnych komunikatów i ofert, aby dokonać konwersji." },
      fr: { text: "Votre site personnalise-t-il automatiquement le contenu en fonction du pays du visiteur (Geo-Targeting) ?", subtext: "La pertinence génère du revenu. Les clients nationaux et internationaux nécessitent des messages et des offres différents pour convertir." },
      de: { text: "Personalisiert Ihre Website Inhalte automatisch basierend auf dem Land des Besuchers (Geo-Targeting)?", subtext: "Relevanz treibt Umsatz. Inländische und internationale Gäste benötigen unterschiedliche Botschaften und Angebote, um zu konvertieren." },
      cs: { text: "Personalizuje váš web automaticky obsah podle země návštěvníka (Geo-Targeting)?", subtext: "Relevance generuje příjmy. Domácí a zahraniční hosté vyžadují odlišné zprávy a nabídky pro konverzi." }
    },
    category: 'Direct Booking',
    weight: 8
  },
  {
    id: 10,
    translations: {
      en: { text: "Do you track your 'True Cost of Acquisition' (Direct vs OTA) across all channels?", subtext: "You cannot effectively optimise net profit if you only measure top-line revenue without factoring in commission costs." },
      it: { text: "Monitori il 'Vero Costo di Acquisizione' (Diretto vs OTA) su tutti i canali?", subtext: "Non puoi ottimizzare il profitto netto se misuri solo i ricavi lordi senza calcolare i costi delle commissioni." },
      es: { text: "¿Monitoreas el 'Costo Real de Adquisición' (Directo vs OTA) en todos los canales?", subtext: "No puedes optimizar el beneficio neto si solo mides los ingresos brutos sin calcular los costos de comisión." },
      pl: { text: "Czy monitorujesz 'Prawdziwy Koszt Pozyskania' (Bezpośredni vs OTA) we wszystkich kanałach?", subtext: "Nie można skutecznie optymalizować zysku netto, mierząc jedynie przychody brutto bez uwzględnienia kosztów prowizji." },
      fr: { text: "Suivez-vous votre 'Coût Réel d'Acquisition' (Direct vs OTA) sur tous les canaux ?", subtext: "Vous ne pouvez pas optimiser efficacement le profit net si vous ne mesurez que le chiffre d'affaires brut sans tenir compte des coûts de commission." },
      de: { text: "Verfolgen Sie Ihre 'wahren Akquisitionskosten' (Direkt vs. OTA) über alle Kanäle?", subtext: "Sie können den Nettogewinn nicht effektiv optimieren, wenn Sie nur den Bruttoumsatz messen, ohne Provisionskosten einzubeziehen." },
      cs: { text: "Sledujete své 'skutečné náklady na akvizici' (přímé vs. OTA) napříč všemi kanály?", subtext: "Nemůžete efektivně optimalizovat čistý zisk, pokud měříte pouze hrubé příjmy bez započtení provizních nákladů." }
    },
    category: 'Analytics',
    weight: 12
  },
  {
    id: 11,
    translations: {
      en: { text: "Does your strategy involve a dedicated human expert who reviews performance data monthly?", subtext: "Automated reports are just data; human interpretation is required to turn that data into a profitable strategy." },
      it: { text: "La tua strategia prevede un esperto umano che analizzi i dati mensilmente con te?", subtext: "I report automatici sono solo dati; serve l'interpretazione umana per trasformarli in strategia redditizia." },
      es: { text: "¿Tu estrategia incluye un experto humano que analice los datos mensualmente contigo?", subtext: "Los informes automáticos son solo datos; se necesita interpretación humana para convertirlos en estrategia rentable." },
      pl: { text: "Czy Twoja strategia obejmuje dedykowanego eksperta, który co miesiąc analizuje dane o wynikach?", subtext: "Zautomatyzowane raporty to tylko dane; do przekształcenia ich w rentowną strategię potrzebna jest ludzka interpretacja." },
      fr: { text: "Votre stratégie implique-t-elle un expert humain dédié qui analyse les données de performance chaque mois ?", subtext: "Les rapports automatisés ne sont que des données ; l'interprétation humaine est nécessaire pour transformer ces données en stratégie rentable." },
      de: { text: "Beinhaltet Ihre Strategie einen dedizierten menschlichen Experten, der die Performance-Daten monatlich überprüft?", subtext: "Automatisierte Berichte sind nur Daten; menschliche Interpretation ist nötig, um daraus eine profitable Strategie zu machen." },
      cs: { text: "Zahrnuje vaše strategie dedikovaného odborníka, který měsíčně vyhodnocuje výkonnostní data?", subtext: "Automatizované zprávy jsou jen data; pro jejich přeměnu v rentabilní strategii je nutná lidská interpretace." }
    },
    category: 'CRM',
    weight: 10
  },
  {
    id: 12,
    translations: {
      en: { text: "Does your tech provider use AI for the benefit of your hotel and its direct strategy?", subtext: "AI should be actively reducing your workload and increasing your conversion, not just used as a buzzword." },
      it: { text: "Il tuo fornitore tecnologico usa l'IA a vantaggio della strategia diretta del tuo hotel?", subtext: "L'IA dovrebbe ridurre il tuo carico di lavoro e aumentare le conversioni, non essere solo una parola di moda." },
      es: { text: "¿Tu proveedor tecnológico utiliza IA en beneficio de la estrategia directa de tu hotel?", subtext: "La IA debería reducir tu carga de trabajo y aumentar las conversiones, no ser solo una palabra de moda." },
      pl: { text: "Czy Twój dostawca technologii wykorzystuje AI na korzyść Twojego hotelu i jego strategii bezpośredniej?", subtext: "AI powinno aktywnie zmniejszać Twoje obciążenie pracą i zwiększać konwersję, a nie być jedynie modnym słowem." },
      fr: { text: "Votre fournisseur technologique utilise-t-il l'IA au profit de votre hôtel et de sa stratégie directe ?", subtext: "L'IA devrait activement réduire votre charge de travail et augmenter vos conversions, et non être utilisée comme un simple buzzword." },
      de: { text: "Setzt Ihr Tech-Anbieter KI zugunsten Ihres Hotels und seiner Direktstrategie ein?", subtext: "KI sollte Ihre Arbeitslast aktiv reduzieren und Ihre Konversion steigern — nicht nur als Buzzword verwendet werden." },
      cs: { text: "Využívá váš technologický partner AI ve prospěch vašeho hotelu a jeho přímé strategie?", subtext: "AI by měla aktivně snižovat vaši pracovní zátěž a zvyšovat konverzi, ne být jen buzzwordem." }
    },
    category: 'Analytics',
    weight: 8
  },
  {
    id: 13,
    translations: {
      en: { text: "Does your marketing technology automatically stop spending on dates where your hotel is sold out?", subtext: "Advertising unavailable rooms is the fastest way to waste budget and frustrate potential guests." },
      it: { text: "Il tuo marketing si ferma automaticamente nelle date in cui l'hotel è al completo?", subtext: "Pubblicizzare camere non disponibili è il modo più rapido per sprecare budget e frustrare i potenziali ospiti." },
      es: { text: "¿Tu marketing se detiene automáticamente en las fechas en las que el hotel está completo?", subtext: "Publicitar habitaciones no disponibles es la forma más rápida de desperdiciar presupuesto y frustrar a los huéspedes." },
      pl: { text: "Czy Twoja technologia marketingowa automatycznie wstrzymuje wydatki w dniach, w których hotel jest wyprzedany?", subtext: "Reklamowanie niedostępnych pokoi to najszybszy sposób na marnowanie budżetu i frustrowanie potencjalnych gości." },
      fr: { text: "Votre technologie marketing arrête-t-elle automatiquement les dépenses sur les dates où votre hôtel est complet ?", subtext: "Faire la publicité de chambres indisponibles est le moyen le plus rapide de gaspiller votre budget et de frustrer les clients potentiels." },
      de: { text: "Stoppt Ihre Marketing-Technologie automatisch die Ausgaben an Daten, an denen Ihr Hotel ausgebucht ist?", subtext: "Werbung für nicht verfügbare Zimmer ist der schnellste Weg, Budget zu verschwenden und potenzielle Gäste zu frustrieren." },
      cs: { text: "Zastavuje vaše marketingová technologie automaticky výdaje v termínech, kdy je hotel vyprodaný?", subtext: "Reklama na nedostupné pokoje je nejrychlejší způsob, jak plýtvat rozpočtem a frustrovat potenciální hosty." }
    },
    category: 'Metasearch',
    weight: 12
  },
  {
    id: 14,
    translations: {
      en: { text: "Is your website specifically optimised for AI Search (GEO) in addition to traditional SEO?", subtext: "Generative Engine Optimisation (GEO) is the future of how guests will find hotels via AI assistants." },
      it: { text: "Il tuo sito è ottimizzato per la Ricerca AI (GEO) oltre alla SEO tradizionale?", subtext: "La Generative Engine Optimisation (GEO) è il futuro di come gli ospiti troveranno hotel tramite assistenti AI." },
      es: { text: "¿Tu sitio está optimizado para la Búsqueda AI (GEO) además del SEO tradicional?", subtext: "La Generative Engine Optimisation (GEO) es el futuro de cómo los huéspedes encontrarán hoteles mediante asistentes IA." },
      pl: { text: "Czy Twoja strona jest specjalnie zoptymalizowana pod wyszukiwanie AI (GEO) oprócz tradycyjnego SEO?", subtext: "Generative Engine Optimisation (GEO) to przyszłość tego, jak goście będą znajdować hotele za pośrednictwem asystentów AI." },
      fr: { text: "Votre site est-il spécifiquement optimisé pour la Recherche IA (GEO) en plus du SEO traditionnel ?", subtext: "La Generative Engine Optimisation (GEO) est l'avenir de la manière dont les clients trouveront les hôtels via les assistants IA." },
      de: { text: "Ist Ihre Website speziell für die KI-Suche (GEO) zusätzlich zum klassischen SEO optimiert?", subtext: "Generative Engine Optimisation (GEO) ist die Zukunft, wie Gäste Hotels über KI-Assistenten finden werden." },
      cs: { text: "Je váš web specificky optimalizován pro AI vyhledávání (GEO) navíc k tradičnímu SEO?", subtext: "Generative Engine Optimisation (GEO) je budoucností toho, jak hosté budou hledat hotely prostřednictvím AI asistentů." }
    },
    category: 'Direct Booking',
    weight: 10
  },
  {
    id: 15,
    translations: {
      en: { text: "Does your tech provider use an AI-powered Bidding Strategy with Dynamic Budget Management?", subtext: "Manual bidding cannot compete with real-time, algorithmic market adjustments that react instantly to demand." },
      it: { text: "Il tuo fornitore usa strategie di bidding basate su IA con gestione dinamica del budget?", subtext: "Il bidding manuale non può competere con le regolazioni algoritmiche in tempo reale che reagiscono alla domanda." },
      es: { text: "¿Tu proveedor utiliza estrategias de puja basadas en IA con gestión dinámica del presupuesto?", subtext: "La puja manual no puede competir con los ajustes algorítmicos en tiempo real que reaccionan a la demanda." },
      pl: { text: "Czy Twój dostawca technologii stosuje strategię licytacji opartą na AI z dynamicznym zarządzaniem budżetem?", subtext: "Ręczna licytacja nie może konkurować z algorytmicznymi dostosowaniami rynku w czasie rzeczywistym, które reagują natychmiast na popyt." },
      fr: { text: "Votre fournisseur technologique utilise-t-il une stratégie d'enchères pilotée par l'IA avec gestion dynamique du budget ?", subtext: "Les enchères manuelles ne peuvent pas rivaliser avec des ajustements algorithmiques en temps réel qui réagissent instantanément à la demande." },
      de: { text: "Setzt Ihr Tech-Anbieter eine KI-gesteuerte Bidding-Strategie mit dynamischem Budget-Management ein?", subtext: "Manuelles Bidding kann nicht mit algorithmischen Marktanpassungen in Echtzeit mithalten, die sofort auf die Nachfrage reagieren." },
      cs: { text: "Používá váš technologický partner AI bidding strategii s dynamickou správou rozpočtu?", subtext: "Manuální bidding nemůže konkurovat algoritmickým úpravám trhu v reálném čase, které reagují okamžitě na poptávku." }
    },
    category: 'Metasearch',
    weight: 10
  }
];

export const STATIC_MAX_SCORE = QUESTIONS.reduce((acc, q) => acc + q.weight, 0);