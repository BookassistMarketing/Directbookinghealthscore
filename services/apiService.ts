import { Answer, AnswerValue, Language } from '../types';
import { QUESTIONS, STATIC_MAX_SCORE } from '../constants';

// ─── Configuration ────────────────────────────────────────────────────────────
// Set USE_MOCK to false once your backend endpoint is ready
const USE_MOCK = true;
const BACKEND_URL = 'https://YOUR-API-GATEWAY-URL/assess';

// ─── Types ────────────────────────────────────────────────────────────────────
interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  timezone: string;
}

export interface AssessmentPayload {
  answers: {
    questionId: number;
    value: string;
    category: string;
    weight: number;
  }[];
  language: Language;
  scoreRaw: number;
  scorePercent: number;
  completedAt: string;
  geolocation: GeoLocation;
}

// ─── Mock Responses by Score Bracket ─────────────────────────────────────────
const MOCK_ANALYSIS_CRITICAL = `## Strategic Assessment: Critical Infrastructure Failure

Your Digital Health Score places your property in the bottom tier of direct booking readiness. This is not a marginal underperformance — it is a structural problem that is actively transferring revenue to OTAs on every booking your hotel generates.

### What This Score Means in Practice

At this level, the majority of your bookings are being captured by third-party channels. Revenue that should flow directly to your property is instead being intermediated by OTAs, with commission costs attached to each transaction. The core issue is an absence of the infrastructure required to compete for direct bookings effectively.

### Primary Failure Points

- **No high-intent direct capture mechanism:** Your property lacks the technical infrastructure to intercept guests at the moment of booking intent. Without a conversion-optimised booking engine and rate parity enforcement, OTAs will consistently win that transaction — they are better resourced, better optimised, and more visible at the point of decision.

- **Metasearch invisibility:** Google Hotel Ads, Trivago, and Kayak aggregate price-comparison searches from guests who are actively ready to book. Properties not present in these channels are absent from one of the most commercially valuable moments in the guest journey. That traffic defaults to OTA listings by default.

- **No CRM or guest data ownership:** Without a direct relationship infrastructure, there is no mechanism to market to past guests, build repeat booking behaviour, or reduce acquisition cost over time. Each new guest is acquired from scratch, through a channel that takes a commission and retains the guest relationship.

- **Analytics blind spots:** Without visibility into channel performance, booking window behaviour, and conversion data, commercial decisions are made without evidence. This makes it impossible to identify where revenue is being lost or to prioritise corrective action.

### Next Steps

The gaps identified in your audit represent the foundational layer of a direct booking strategy. Without addressing these areas, OTA dependency will remain the default commercial position for your property.

---
*Bookassist Digital Health Strategist — Algorithmic Assessment*`;

const MOCK_ANALYSIS_HIGH_RISK = `## Strategic Assessment: High Revenue Leakage Detected

Your Digital Health Score indicates that your property has partial infrastructure in place, but critical gaps remain across multiple revenue categories. You are capturing some direct business — but a significant share is being lost to OTAs that could and should be retained.

### What This Score Means in Practice

Properties in this bracket are in a transitional state. Some of the foundational systems exist, but they are either not fully deployed, not optimised, or not operating as an integrated strategy. The result is that OTAs continue to absorb a disproportionate share of bookings — along with the commission costs that come with them.

### Key Gaps Identified

- **Booking engine underperformance:** A booking engine exists, but the audit suggests it is not fully optimised — whether for mobile conversion, rate presentation, or integration with a rate intelligence tool that ensures your direct price is always competitive against your own OTA listings. A booking engine that exists but underconverts is not providing the commercial return it should.

- **Incomplete metasearch presence:** Partial metasearch activity leaves gaps in your price-comparison visibility. Guests who search on Google Hotel Ads and encounter no direct option — or a weaker one — will default to the OTA result. Every booking lost at that moment carries a commission cost that could have been avoided.

- **CRM gaps:** Guest data is likely being collected inconsistently, or is not being activated for remarketing and retention. Without a functioning CRM strategy, repeat booking behaviour is left to chance rather than managed as a commercial asset.

### Next Steps

The infrastructure exists in outline — the issue is completeness and integration. Addressing the gaps identified here would shift your property from partial direct capability to a cohesive direct booking strategy.

---
*Bookassist Digital Health Strategist — Algorithmic Assessment*`;

const MOCK_ANALYSIS_MODERATE = `## Strategic Assessment: Moderate Performance — Optimisation Required

Your Digital Health Score reflects a property with solid direct booking foundations but identifiable gaps that are suppressing performance. Your infrastructure maturity is ahead of many competitors — but specific weaknesses are limiting the commercial return on the investments already made.

### What This Score Means in Practice

At this level, meaningful investment has been made in direct booking technology. The core systems are in place. However, the audit has identified areas where those systems are either not fully integrated, not actively managed, or not performing at the level required to maximise direct revenue share against OTA competition.

### Areas Requiring Attention

- **Rate intelligence and parity management:** Having a booking engine is only part of the equation. If direct rates are not consistently competitive — or if rate parity is being eroded by OTA promotional pricing — guests will choose the OTA path even when they find you directly. Automated rate intelligence is what closes this gap systematically rather than reactively.

- **Metasearch optimisation:** A metasearch presence may exist, but the quality of that presence matters as much as its existence. Bid strategy, campaign structure, and budget allocation require active management. A metasearch campaign that is live but not optimised will underdeliver relative to its cost.

- **Guest data activation:** CRM infrastructure may be in place, but the question is whether guest data is being used actively — for pre-arrival communication, post-stay remarketing, and retention incentives. These are high-margin touchpoints that are frequently underdeveloped even in otherwise well-structured operations.

### Next Steps

The foundation is there. The opportunity lies in ensuring that the systems already in place are performing at full capacity — and that the remaining gaps are closed before they compound into a structural disadvantage.

---
*Bookassist Digital Health Strategist — Algorithmic Assessment*`;

const MOCK_ANALYSIS_STRONG = `## Strategic Assessment: Strong Foundation — Competitive Refinement Advised

Your Digital Health Score places your property in the top tier of direct booking readiness. Your technical infrastructure is well-developed and your approach to direct revenue management is more sophisticated than the majority of independent hotels. This is a strong commercial position — but it requires active maintenance to remain so.

### What This Score Means in Practice

High-scoring properties have made deliberate investments in booking technology, metasearch presence, and guest data strategy. The risks at this level are different in nature: not structural failure, but competitive erosion if systems are not continuously maintained, benchmarked, and adapted to a market that does not stand still.

### Areas to Monitor and Refine

- **Booking engine conversion quality:** Even well-configured booking engines have optimisation headroom. Rate presentation, room type ordering, upsell sequencing, and mobile experience all influence conversion — and the cumulative effect of marginal improvements across these areas is commercially meaningful at scale.

- **Metasearch bid strategy efficiency:** At high performance levels, the focus shifts from presence to precision. Ensuring that cost-per-acquisition across metasearch channels is optimised — and that budget allocation responds to demand signals rather than running on fixed parameters — is what separates strong performance from best-in-class.

- **CRM depth and segmentation:** Strong performers often have CRM in place but have not fully activated segmented communication, pre-arrival personalisation, or structured retention incentives. These are the tools that convert one-time direct bookers into repeat guests — a booking segment that carries significantly lower acquisition cost than new business.

### Maintaining Your Position

The direct booking landscape is not static. OTAs continue to invest in guest acquisition and loyalty infrastructure. Sustaining a high Health Score requires treating direct booking as an ongoing commercial discipline rather than a completed project.

---
*Bookassist Digital Health Strategist — Algorithmic Assessment*`;

// ─── Polish (PL) Mock Responses ──────────────────────────────────────────────
const MOCK_ANALYSIS_CRITICAL_PL = `## Ocena Strategiczna: Krytyczna Awaria Infrastruktury

Twój Digital Health Score sytuuje Twój obiekt w najniższym przedziale gotowości do rezerwacji bezpośrednich. Nie jest to marginalne niedociągnięcie — to strukturalny problem, który aktywnie przekazuje przychody do OTA przy każdej rezerwacji generowanej przez Twój hotel.

### Co Ten Wynik Oznacza w Praktyce

Na tym poziomie większość rezerwacji jest przechwytywana przez kanały zewnętrzne. Przychody, które powinny trafiać bezpośrednio do Twojego obiektu, są pośredniczone przez OTA, z kosztami prowizji naliczonymi do każdej transakcji. Podstawowym problemem jest brak infrastruktury wymaganej do skutecznej konkurencji o rezerwacje bezpośrednie.

### Główne Punkty Awarii

- **Brak mechanizmu przechwytywania gości o wysokiej intencji:** Twój obiekt nie posiada infrastruktury technicznej niezbędnej do przechwytywania gości w momencie intencji rezerwacji. Bez silnika rezerwacyjnego zoptymalizowanego pod konwersję i egzekwowania parytetu cenowego, OTA będą konsekwentnie wygrywać tę transakcję — mają większe zasoby, są lepiej zoptymalizowane i bardziej widoczne w momencie decyzji.

- **Niewidoczność w metawyszukiwarkach:** Google Hotel Ads, Trivago i Kayak agregują wyszukiwania porównywarek cenowych od gości aktywnie gotowych do rezerwacji. Obiekty nieobecne w tych kanałach są nieobecne w jednym z najbardziej wartościowych komercyjnie momentów w podróży gościa. Ten ruch domyślnie trafia do ofert OTA.

- **Brak CRM lub własności danych gościa:** Bez infrastruktury bezpośredniej relacji nie ma mechanizmu prowadzenia marketingu wobec byłych gości, budowania zachowań ponownej rezerwacji ani obniżania kosztu pozyskania w czasie. Każdy nowy gość jest pozyskiwany od zera, przez kanał pobierający prowizję i zachowujący relację z gościem.

- **Luki w analityce:** Bez wglądu w wydajność kanałów, zachowania w oknie rezerwacyjnym i dane konwersji, decyzje komercyjne są podejmowane bez dowodów. Uniemożliwia to identyfikację miejsc utraty przychodów lub priorytetyzację działań naprawczych.

### Następne Kroki

Luki zidentyfikowane w Twoim audycie stanowią fundamentalną warstwę strategii rezerwacji bezpośrednich. Bez zaadresowania tych obszarów zależność od OTA pozostanie domyślną pozycją komercyjną Twojego obiektu.

---
*Bookassist Digital Health Strategist — Ocena Algorytmiczna*`;

const MOCK_ANALYSIS_HIGH_RISK_PL = `## Ocena Strategiczna: Wykryto Wysoką Utratę Przychodów

Twój Digital Health Score wskazuje, że Twój obiekt posiada częściową infrastrukturę, ale krytyczne luki pozostają w wielu kategoriach przychodów. Zdobywasz część bezpośredniego biznesu — ale znacząca część jest tracona na rzecz OTA, którą można i należy zatrzymać.

### Co Ten Wynik Oznacza w Praktyce

Obiekty w tym przedziale znajdują się w stanie przejściowym. Niektóre fundamentalne systemy istnieją, ale nie są w pełni wdrożone, niezoptymalizowane lub nie działają jako zintegrowana strategia. Rezultatem jest to, że OTA w dalszym ciągu pochłaniają nieproporcjonalną część rezerwacji — wraz z kosztami prowizji, które się z nimi wiążą.

### Zidentyfikowane Kluczowe Luki

- **Słaba wydajność silnika rezerwacyjnego:** Silnik rezerwacyjny istnieje, ale audyt sugeruje, że nie jest w pełni zoptymalizowany — czy to pod konwersję mobilną, prezentację cen, czy integrację z narzędziem inteligencji cenowej, które zapewnia, że Twoja cena bezpośrednia jest zawsze konkurencyjna względem Twoich własnych ofert OTA. Silnik rezerwacyjny, który istnieje, ale słabo konwertuje, nie dostarcza zwrotu komercyjnego, jaki powinien.

- **Niekompletna obecność w metawyszukiwarkach:** Częściowa aktywność w metawyszukiwarkach pozostawia luki w widoczności porównania cen. Goście, którzy szukają w Google Hotel Ads i nie napotykają opcji bezpośredniej — lub znajdują słabszą — trafiają domyślnie do wyniku OTA. Każda rezerwacja stracona w tym momencie niesie ze sobą koszt prowizji, którego można było uniknąć.

- **Luki w CRM:** Dane gości są prawdopodobnie zbierane niekonsekwentnie lub nie są aktywowane do remarketingu i retencji. Bez działającej strategii CRM zachowania ponownej rezerwacji są pozostawiane przypadkowi, zamiast być zarządzane jako aktywo komercyjne.

### Następne Kroki

Infrastruktura istnieje w zarysie — problemem jest kompletność i integracja. Zaadresowanie luk zidentyfikowanych tutaj przesunęłoby Twój obiekt z częściowej zdolności bezpośredniej do spójnej strategii rezerwacji bezpośrednich.

---
*Bookassist Digital Health Strategist — Ocena Algorytmiczna*`;

const MOCK_ANALYSIS_MODERATE_PL = `## Ocena Strategiczna: Umiarkowana Wydajność — Wymagana Optymalizacja

Twój Digital Health Score odzwierciedla obiekt z solidnymi fundamentami rezerwacji bezpośrednich, ale z możliwymi do zidentyfikowania lukami, które ograniczają wydajność. Dojrzałość Twojej infrastruktury wyprzedza wielu konkurentów — ale konkretne słabości ograniczają zwrot komercyjny z już dokonanych inwestycji.

### Co Ten Wynik Oznacza w Praktyce

Na tym poziomie dokonano znaczących inwestycji w technologię rezerwacji bezpośrednich. Kluczowe systemy są na miejscu. Jednak audyt zidentyfikował obszary, w których te systemy nie są w pełni zintegrowane, nie są aktywnie zarządzane lub nie działają na poziomie wymaganym do maksymalizacji udziału przychodów bezpośrednich w konkurencji z OTA.

### Obszary Wymagające Uwagi

- **Inteligencja cenowa i zarządzanie parytetem:** Posiadanie silnika rezerwacyjnego to tylko część równania. Jeśli ceny bezpośrednie nie są konsekwentnie konkurencyjne — lub jeśli parytet cenowy jest podważany przez promocyjne ceny OTA — goście wybiorą ścieżkę OTA nawet wtedy, gdy znajdą Cię bezpośrednio. Zautomatyzowana inteligencja cenowa jest tym, co systemowo zamyka tę lukę, zamiast reaktywnie.

- **Optymalizacja metawyszukiwarek:** Obecność w metawyszukiwarkach może istnieć, ale jakość tej obecności jest równie ważna, jak samo jej istnienie. Strategia licytacji, struktura kampanii i alokacja budżetu wymagają aktywnego zarządzania. Kampania w metawyszukiwarce, która jest aktywna, ale niezoptymalizowana, będzie dostarczać wyniki poniżej swojego kosztu.

- **Aktywacja danych gości:** Infrastruktura CRM może być na miejscu, ale pytanie brzmi, czy dane gości są aktywnie wykorzystywane — do komunikacji przed przyjazdem, remarketingu po pobycie i zachęt retencyjnych. Są to wysokomarżowe punkty styku, które często są niedopracowane nawet w dobrze zorganizowanych operacjach.

### Następne Kroki

Fundament jest zbudowany. Szansa leży w zapewnieniu, że systemy już istniejące działają z pełną wydajnością — i że pozostałe luki są zamknięte, zanim złożą się w strukturalną niekorzyść.

---
*Bookassist Digital Health Strategist — Ocena Algorytmiczna*`;

const MOCK_ANALYSIS_STRONG_PL = `## Ocena Strategiczna: Silne Fundamenty — Zalecane Konkurencyjne Dopracowanie

Twój Digital Health Score sytuuje Twój obiekt w najwyższym przedziale gotowości do rezerwacji bezpośrednich. Twoja infrastruktura techniczna jest dobrze rozwinięta, a Twoje podejście do zarządzania bezpośrednimi przychodami jest bardziej zaawansowane niż u większości niezależnych hoteli. To silna pozycja komercyjna — ale wymaga aktywnego utrzymywania, by taka pozostała.

### Co Ten Wynik Oznacza w Praktyce

Obiekty o wysokim wyniku dokonały przemyślanych inwestycji w technologię rezerwacyjną, obecność w metawyszukiwarkach i strategię danych gości. Ryzyka na tym poziomie mają inny charakter: nie strukturalna awaria, ale erozja konkurencyjna, jeśli systemy nie są ciągle utrzymywane, porównywane i dostosowywane do rynku, który nie stoi w miejscu.

### Obszary do Monitorowania i Dopracowania

- **Jakość konwersji silnika rezerwacyjnego:** Nawet dobrze skonfigurowane silniki rezerwacyjne mają przestrzeń do optymalizacji. Prezentacja cen, kolejność typów pokoi, sekwencja upsellingu i doświadczenie mobilne — wszystko to wpływa na konwersję — a skumulowany efekt marginalnych ulepszeń w tych obszarach jest znaczący komercyjnie w skali.

- **Efektywność strategii licytacji w metawyszukiwarkach:** Na wysokich poziomach wydajności fokus przesuwa się z obecności na precyzję. Zapewnienie, że CPA w kanałach metawyszukiwania jest zoptymalizowany — a alokacja budżetu reaguje na sygnały popytu, zamiast działać na stałych parametrach — to właśnie odróżnia silną wydajność od najlepszej w klasie.

- **Głębokość i segmentacja CRM:** Silnie działające obiekty często mają CRM, ale nie w pełni aktywowały segmentowaną komunikację, personalizację przed przyjazdem lub ustrukturyzowane zachęty retencyjne. Są to narzędzia, które przekształcają jednorazowych gości bezpośrednich w powracających — segment rezerwacji, który wiąże się ze znacznie niższym kosztem pozyskania niż nowy biznes.

### Utrzymanie Twojej Pozycji

Krajobraz rezerwacji bezpośrednich nie jest statyczny. OTA kontynuują inwestycje w pozyskiwanie gości i infrastrukturę lojalnościową. Utrzymanie wysokiego Health Score wymaga traktowania rezerwacji bezpośrednich jako stałej dyscypliny komercyjnej, a nie zakończonego projektu.

---
*Bookassist Digital Health Strategist — Ocena Algorytmiczna*`;

// ─── Italian (IT) Mock Responses ─────────────────────────────────────────────
const MOCK_ANALYSIS_CRITICAL_IT = `## Valutazione Strategica: Guasto Infrastrutturale Critico

Il tuo Digital Health Score colloca il tuo hotel nella fascia più bassa di prontezza per la prenotazione diretta. Non si tratta di un sottorendimento marginale — è un problema strutturale che sta attivamente trasferendo ricavi alle OTA su ogni prenotazione generata dal tuo hotel.

### Cosa Significa Questo Punteggio in Pratica

A questo livello, la maggior parte delle tue prenotazioni viene intercettata da canali terzi. I ricavi che dovrebbero affluire direttamente al tuo hotel vengono invece mediati dalle OTA, con costi di commissione applicati a ogni transazione. Il problema centrale è l'assenza dell'infrastruttura necessaria per competere efficacemente per le prenotazioni dirette.

### Principali Punti di Guasto

- **Nessun meccanismo di cattura diretta ad alta intenzione:** Il tuo hotel non dispone dell'infrastruttura tecnica per intercettare gli ospiti nel momento dell'intenzione di prenotazione. Senza un motore di prenotazione ottimizzato per la conversione e l'applicazione del parity tariffario, le OTA vinceranno costantemente quella transazione — sono meglio finanziate, meglio ottimizzate e più visibili nel momento della decisione.

- **Invisibilità sui metamotori:** Google Hotel Ads, Trivago e Kayak aggregano le ricerche di comparazione prezzi da ospiti attivamente pronti a prenotare. Gli hotel non presenti in questi canali sono assenti in uno dei momenti commercialmente più preziosi del customer journey. Quel traffico va per impostazione predefinita alle inserzioni OTA.

- **Nessun CRM o proprietà dei dati dell'ospite:** Senza un'infrastruttura di relazione diretta, non c'è un meccanismo per fare marketing agli ospiti passati, costruire comportamenti di prenotazione ripetuta o ridurre il costo di acquisizione nel tempo. Ogni nuovo ospite viene acquisito da zero, attraverso un canale che prende commissione e mantiene la relazione con l'ospite.

- **Punti ciechi analitici:** Senza visibilità sulla performance dei canali, sul comportamento della booking window e sui dati di conversione, le decisioni commerciali vengono prese senza evidenze. Questo rende impossibile identificare dove si stanno perdendo ricavi o prioritizzare le azioni correttive.

### Prossimi Passi

Le lacune identificate nel tuo audit rappresentano lo strato fondamentale di una strategia di prenotazione diretta. Senza affrontare queste aree, la dipendenza dalle OTA rimarrà la posizione commerciale predefinita del tuo hotel.

---
*Bookassist Digital Health Strategist — Valutazione Algoritmica*`;

const MOCK_ANALYSIS_HIGH_RISK_IT = `## Valutazione Strategica: Rilevata Elevata Perdita di Ricavi

Il tuo Digital Health Score indica che il tuo hotel ha un'infrastruttura parziale, ma rimangono lacune critiche in più categorie di ricavi. Stai catturando parte del business diretto — ma una quota significativa viene persa a favore delle OTA che potrebbe e dovrebbe essere trattenuta.

### Cosa Significa Questo Punteggio in Pratica

Gli hotel in questa fascia sono in uno stato di transizione. Alcuni sistemi fondamentali esistono, ma non sono completamente implementati, non ottimizzati o non operano come strategia integrata. Il risultato è che le OTA continuano ad assorbire una quota sproporzionata di prenotazioni — insieme ai costi di commissione associati.

### Principali Lacune Identificate

- **Sottoperformance del motore di prenotazione:** Esiste un motore di prenotazione, ma l'audit suggerisce che non è completamente ottimizzato — sia per la conversione mobile, la presentazione tariffaria o l'integrazione con uno strumento di intelligence tariffaria che assicuri che il tuo prezzo diretto sia sempre competitivo rispetto alle tue stesse inserzioni OTA. Un motore di prenotazione che esiste ma converte poco non sta fornendo il rendimento commerciale che dovrebbe.

- **Presenza metamotore incompleta:** Un'attività metamotore parziale lascia lacune nella tua visibilità di confronto prezzi. Gli ospiti che cercano su Google Hotel Ads e non incontrano un'opzione diretta — o ne incontrano una più debole — andranno per default al risultato OTA. Ogni prenotazione persa in quel momento comporta un costo di commissione che si sarebbe potuto evitare.

- **Lacune CRM:** I dati degli ospiti vengono probabilmente raccolti in modo incoerente o non vengono attivati per il remarketing e la retention. Senza una strategia CRM funzionante, il comportamento di prenotazione ripetuta è lasciato al caso piuttosto che gestito come asset commerciale.

### Prossimi Passi

L'infrastruttura esiste a grandi linee — il problema è la completezza e l'integrazione. Affrontare le lacune qui identificate sposterebbe il tuo hotel da una capacità diretta parziale a una strategia di prenotazione diretta coesa.

---
*Bookassist Digital Health Strategist — Valutazione Algoritmica*`;

const MOCK_ANALYSIS_MODERATE_IT = `## Valutazione Strategica: Performance Moderata — Ottimizzazione Richiesta

Il tuo Digital Health Score riflette un hotel con solide fondamenta di prenotazione diretta ma con lacune identificabili che stanno sopprimendo la performance. La maturità della tua infrastruttura è in vantaggio rispetto a molti concorrenti — ma specifiche debolezze stanno limitando il ritorno commerciale sugli investimenti già fatti.

### Cosa Significa Questo Punteggio in Pratica

A questo livello, sono stati effettuati investimenti significativi in tecnologia di prenotazione diretta. I sistemi core sono in atto. Tuttavia, l'audit ha identificato aree in cui quei sistemi o non sono pienamente integrati, o non sono attivamente gestiti, o non performano al livello richiesto per massimizzare la quota di ricavi diretti rispetto alla concorrenza OTA.

### Aree che Richiedono Attenzione

- **Intelligence tariffaria e gestione del parity:** Avere un motore di prenotazione è solo parte dell'equazione. Se le tariffe dirette non sono costantemente competitive — o se il parity tariffario viene eroso dal pricing promozionale delle OTA — gli ospiti sceglieranno il percorso OTA anche quando ti trovano direttamente. L'intelligence tariffaria automatizzata è ciò che colma sistematicamente questa lacuna piuttosto che reattivamente.

- **Ottimizzazione metamotore:** Una presenza metamotore può esistere, ma la qualità di quella presenza conta tanto quanto la sua esistenza. Strategia di bid, struttura della campagna e allocazione del budget richiedono gestione attiva. Una campagna metamotore attiva ma non ottimizzata sottoperformerà rispetto al suo costo.

- **Attivazione dei dati dell'ospite:** L'infrastruttura CRM può essere in atto, ma la domanda è se i dati degli ospiti vengono utilizzati attivamente — per la comunicazione pre-arrivo, il remarketing post-stay e gli incentivi di retention. Questi sono punti di contatto ad alto margine che sono spesso sottosviluppati anche in operazioni altrimenti ben strutturate.

### Prossimi Passi

Le fondamenta ci sono. L'opportunità risiede nel garantire che i sistemi già in atto performino a piena capacità — e che le lacune rimanenti siano colmate prima che si aggravino in uno svantaggio strutturale.

---
*Bookassist Digital Health Strategist — Valutazione Algoritmica*`;

const MOCK_ANALYSIS_STRONG_IT = `## Valutazione Strategica: Fondamenta Solide — Raffinamento Competitivo Consigliato

Il tuo Digital Health Score colloca il tuo hotel nella fascia più alta di prontezza per la prenotazione diretta. La tua infrastruttura tecnica è ben sviluppata e il tuo approccio alla gestione dei ricavi diretti è più sofisticato di quello della maggior parte degli hotel indipendenti. Questa è una forte posizione commerciale — ma richiede manutenzione attiva per rimanere tale.

### Cosa Significa Questo Punteggio in Pratica

Gli hotel con punteggio alto hanno fatto investimenti deliberati in tecnologia di prenotazione, presenza metamotore e strategia dei dati dell'ospite. I rischi a questo livello sono di natura diversa: non un fallimento strutturale, ma erosione competitiva se i sistemi non vengono continuamente mantenuti, confrontati e adattati a un mercato che non sta fermo.

### Aree da Monitorare e Raffinare

- **Qualità della conversione del motore di prenotazione:** Anche motori di prenotazione ben configurati hanno margine di ottimizzazione. La presentazione tariffaria, l'ordinamento dei tipi di camera, la sequenza di upsell e l'esperienza mobile influenzano tutti la conversione — e l'effetto cumulativo di miglioramenti marginali in queste aree è commercialmente significativo su scala.

- **Efficienza della strategia di bid metamotore:** Ai livelli di performance alti, il focus si sposta dalla presenza alla precisione. Garantire che il CPA tra i canali metamotore sia ottimizzato — e che l'allocazione del budget risponda ai segnali di domanda piuttosto che funzionare su parametri fissi — è ciò che separa la performance forte dalla best-in-class.

- **Profondità e segmentazione CRM:** I performer forti spesso hanno CRM in atto ma non hanno pienamente attivato la comunicazione segmentata, la personalizzazione pre-arrivo o gli incentivi di retention strutturati. Questi sono gli strumenti che convertono i prenotatori diretti occasionali in ospiti ricorrenti — un segmento di prenotazione che comporta un costo di acquisizione significativamente inferiore rispetto al nuovo business.

### Mantenere la Tua Posizione

Il panorama della prenotazione diretta non è statico. Le OTA continuano a investire in acquisizione ospiti e infrastruttura di loyalty. Sostenere un Health Score elevato richiede di trattare la prenotazione diretta come una disciplina commerciale continua piuttosto che un progetto completato.

---
*Bookassist Digital Health Strategist — Valutazione Algoritmica*`;

// ─── Spanish (ES) Mock Responses ─────────────────────────────────────────────
const MOCK_ANALYSIS_CRITICAL_ES = `## Evaluación Estratégica: Fallo Crítico de Infraestructura

Tu Digital Health Score sitúa a tu hotel en el nivel más bajo de preparación para la reserva directa. No se trata de un bajo rendimiento marginal — es un problema estructural que está transfiriendo activamente ingresos a las OTA en cada reserva que genera tu hotel.

### Qué Significa Esta Puntuación en la Práctica

A este nivel, la mayoría de tus reservas están siendo capturadas por canales externos. Los ingresos que deberían fluir directamente a tu hotel están siendo intermediados por OTA, con costes de comisión asociados a cada transacción. El problema central es la ausencia de la infraestructura necesaria para competir eficazmente por las reservas directas.

### Principales Puntos de Fallo

- **Sin mecanismo de captura directa de alta intención:** Tu hotel carece de la infraestructura técnica para interceptar a los huéspedes en el momento de la intención de reserva. Sin un motor de reservas optimizado para la conversión y el cumplimiento de la paridad tarifaria, las OTA ganarán sistemáticamente esa transacción — están mejor financiadas, mejor optimizadas y son más visibles en el punto de decisión.

- **Invisibilidad en metabuscadores:** Google Hotel Ads, Trivago y Kayak agregan búsquedas de comparación de precios de huéspedes activamente listos para reservar. Los hoteles no presentes en estos canales están ausentes de uno de los momentos comercialmente más valiosos del customer journey. Ese tráfico se dirige por defecto a los listados de OTA.

- **Sin CRM o propiedad de los datos del huésped:** Sin una infraestructura de relación directa, no hay un mecanismo para hacer marketing a huéspedes pasados, construir un comportamiento de reserva repetida o reducir el coste de adquisición con el tiempo. Cada nuevo huésped se adquiere desde cero, a través de un canal que cobra comisión y retiene la relación con el huésped.

- **Puntos ciegos analíticos:** Sin visibilidad sobre el rendimiento de los canales, el comportamiento de la booking window y los datos de conversión, las decisiones comerciales se toman sin evidencias. Esto hace imposible identificar dónde se pierden ingresos o priorizar acciones correctivas.

### Próximos Pasos

Las brechas identificadas en tu audit representan la capa fundamental de una estrategia de reserva directa. Sin abordar estas áreas, la dependencia de las OTA seguirá siendo la posición comercial predeterminada de tu hotel.

---
*Bookassist Digital Health Strategist — Evaluación Algorítmica*`;

const MOCK_ANALYSIS_HIGH_RISK_ES = `## Evaluación Estratégica: Alta Pérdida de Ingresos Detectada

Tu Digital Health Score indica que tu hotel tiene infraestructura parcial, pero persisten brechas críticas en múltiples categorías de ingresos. Estás capturando parte del negocio directo — pero una parte significativa se está perdiendo a favor de las OTA que podría y debería retenerse.

### Qué Significa Esta Puntuación en la Práctica

Los hoteles en este rango están en un estado de transición. Algunos sistemas fundamentales existen, pero no están totalmente desplegados, ni optimizados, ni operan como una estrategia integrada. El resultado es que las OTA siguen absorbiendo una cuota desproporcionada de reservas — junto con los costes de comisión que conllevan.

### Principales Brechas Identificadas

- **Bajo rendimiento del motor de reservas:** Existe un motor de reservas, pero el audit sugiere que no está totalmente optimizado — ya sea para la conversión móvil, la presentación tarifaria o la integración con una herramienta de intelligence tarifaria que asegure que tu precio directo sea siempre competitivo frente a tus propios listados OTA. Un motor de reservas que existe pero convierte poco no está aportando el retorno comercial que debería.

- **Presencia incompleta en metabuscadores:** La actividad parcial en metabuscadores deja brechas en tu visibilidad de comparación de precios. Los huéspedes que buscan en Google Hotel Ads y no encuentran una opción directa — o encuentran una más débil — recurrirán por defecto al resultado OTA. Cada reserva perdida en ese momento conlleva un coste de comisión que podría haberse evitado.

- **Brechas de CRM:** Los datos de los huéspedes probablemente se recopilan de forma inconsistente o no se activan para remarketing y retención. Sin una estrategia de CRM funcional, el comportamiento de reserva repetida queda al azar en lugar de gestionarse como un activo comercial.

### Próximos Pasos

La infraestructura existe a grandes rasgos — el problema es la integridad y la integración. Abordar las brechas aquí identificadas desplazaría a tu hotel de una capacidad directa parcial a una estrategia de reserva directa cohesionada.

---
*Bookassist Digital Health Strategist — Evaluación Algorítmica*`;

const MOCK_ANALYSIS_MODERATE_ES = `## Evaluación Estratégica: Rendimiento Moderado — Optimización Requerida

Tu Digital Health Score refleja un hotel con bases sólidas de reserva directa pero con brechas identificables que están limitando el rendimiento. La madurez de tu infraestructura está por delante de muchos competidores — pero debilidades específicas están limitando el retorno comercial sobre las inversiones ya realizadas.

### Qué Significa Esta Puntuación en la Práctica

A este nivel, se ha realizado una inversión significativa en tecnología de reserva directa. Los sistemas centrales están en su lugar. Sin embargo, el audit ha identificado áreas donde esos sistemas no están completamente integrados, no se gestionan activamente o no rinden al nivel requerido para maximizar la cuota de ingresos directos frente a la competencia OTA.

### Áreas que Requieren Atención

- **Intelligence tarifaria y gestión de paridad:** Tener un motor de reservas es sólo parte de la ecuación. Si las tarifas directas no son consistentemente competitivas — o si la paridad tarifaria se está erosionando por la fijación de precios promocionales de las OTA — los huéspedes elegirán el camino OTA incluso cuando te encuentren directamente. La intelligence tarifaria automatizada es lo que cierra esta brecha de forma sistemática en lugar de reactiva.

- **Optimización de metabuscadores:** Puede existir una presencia en metabuscadores, pero la calidad de esa presencia importa tanto como su existencia. La estrategia de puja, la estructura de campaña y la asignación de presupuesto requieren gestión activa. Una campaña en metabuscadores que está activa pero no optimizada rendirá por debajo de su coste.

- **Activación de datos del huésped:** La infraestructura CRM puede estar en su lugar, pero la pregunta es si los datos de los huéspedes se utilizan activamente — para comunicación pre-estancia, remarketing post-estancia e incentivos de retención. Estos son puntos de contacto de alto margen que frecuentemente están infradesarrollados incluso en operaciones bien estructuradas.

### Próximos Pasos

La base está ahí. La oportunidad reside en asegurar que los sistemas ya en su lugar rindan a plena capacidad — y que las brechas restantes se cierren antes de que se agraven en una desventaja estructural.

---
*Bookassist Digital Health Strategist — Evaluación Algorítmica*`;

const MOCK_ANALYSIS_STRONG_ES = `## Evaluación Estratégica: Base Sólida — Refinamiento Competitivo Aconsejado

Tu Digital Health Score sitúa a tu hotel en el nivel más alto de preparación para la reserva directa. Tu infraestructura técnica está bien desarrollada y tu enfoque de la gestión de ingresos directos es más sofisticado que el de la mayoría de los hoteles independientes. Es una posición comercial fuerte — pero requiere mantenimiento activo para seguir siéndolo.

### Qué Significa Esta Puntuación en la Práctica

Los hoteles con puntuaciones altas han realizado inversiones deliberadas en tecnología de reservas, presencia en metabuscadores y estrategia de datos del huésped. Los riesgos a este nivel son de naturaleza diferente: no fallo estructural, sino erosión competitiva si los sistemas no se mantienen, comparan y adaptan continuamente a un mercado que no se queda quieto.

### Áreas a Monitorizar y Refinar

- **Calidad de conversión del motor de reservas:** Incluso los motores de reservas bien configurados tienen margen de optimización. La presentación tarifaria, el orden de tipos de habitación, la secuencia de upsell y la experiencia móvil influyen todos en la conversión — y el efecto acumulado de mejoras marginales en estas áreas es comercialmente significativo a escala.

- **Eficiencia de la estrategia de puja en metabuscadores:** En niveles de alto rendimiento, el foco se desplaza de la presencia a la precisión. Asegurar que el CPA a través de los canales de metabuscadores esté optimizado — y que la asignación de presupuesto responda a señales de demanda en lugar de funcionar con parámetros fijos — es lo que separa el rendimiento fuerte del best-in-class.

- **Profundidad y segmentación del CRM:** Los que rinden fuerte suelen tener CRM en su lugar pero no han activado completamente la comunicación segmentada, la personalización pre-estancia o los incentivos de retención estructurados. Estas son las herramientas que convierten a los reservadores directos ocasionales en huéspedes recurrentes — un segmento de reserva con un coste de adquisición significativamente menor que el nuevo negocio.

### Mantener Tu Posición

El panorama de la reserva directa no es estático. Las OTA continúan invirtiendo en adquisición de huéspedes e infraestructura de fidelización. Mantener un Health Score alto requiere tratar la reserva directa como una disciplina comercial continua en lugar de como un proyecto completado.

---
*Bookassist Digital Health Strategist — Evaluación Algorítmica*`;

function getMockAnalysis(scorePercent: number, lang: Language): string {
  const bracket: 'critical' | 'highRisk' | 'moderate' | 'strong' =
    scorePercent <= 25 ? 'critical' :
    scorePercent <= 50 ? 'highRisk' :
    scorePercent <= 75 ? 'moderate' : 'strong';

  const byLang: Record<Language, Record<typeof bracket, string>> = {
    en: { critical: MOCK_ANALYSIS_CRITICAL, highRisk: MOCK_ANALYSIS_HIGH_RISK, moderate: MOCK_ANALYSIS_MODERATE, strong: MOCK_ANALYSIS_STRONG },
    it: { critical: MOCK_ANALYSIS_CRITICAL_IT, highRisk: MOCK_ANALYSIS_HIGH_RISK_IT, moderate: MOCK_ANALYSIS_MODERATE_IT, strong: MOCK_ANALYSIS_STRONG_IT },
    es: { critical: MOCK_ANALYSIS_CRITICAL_ES, highRisk: MOCK_ANALYSIS_HIGH_RISK_ES, moderate: MOCK_ANALYSIS_MODERATE_ES, strong: MOCK_ANALYSIS_STRONG_ES },
    pl: { critical: MOCK_ANALYSIS_CRITICAL_PL, highRisk: MOCK_ANALYSIS_HIGH_RISK_PL, moderate: MOCK_ANALYSIS_MODERATE_PL, strong: MOCK_ANALYSIS_STRONG_PL },
  };

  return byLang[lang][bracket];
}

// ─── Geolocation ─────────────────────────────────────────────────────────────
async function detectGeolocation(): Promise<GeoLocation> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return {
        country: data.country_name,
        region: data.region,
        city: data.city,
        timezone,
      };
    }
  } catch {
    // Fall through to timezone-only fallback
  }
  return { timezone };
}

// ─── Payload Builder ──────────────────────────────────────────────────────────
function buildPayload(answers: Answer[], lang: Language, geolocation: GeoLocation): AssessmentPayload {
  const scoreRaw = answers.reduce((sum, a) => {
    if (a.value !== AnswerValue.YES) return sum;
    const q = QUESTIONS.find(q => q.id === a.questionId);
    return sum + (q?.weight ?? 0);
  }, 0);

  const scorePercent = Math.round((scoreRaw / STATIC_MAX_SCORE) * 100);

  return {
    answers: answers.map(a => {
      const q = QUESTIONS.find(q => q.id === a.questionId);
      return {
        questionId: a.questionId,
        value: a.value,
        category: q?.category ?? '',
        weight: q?.weight ?? 0,
      };
    }),
    language: lang,
    scoreRaw,
    scorePercent,
    completedAt: new Date().toISOString(),
    geolocation,
  };
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export async function submitAssessment(answers: Answer[], lang: Language, siteUrl: string | null = null): Promise<string> {
  const geolocation = await detectGeolocation();
  const payload = buildPayload(answers, lang, geolocation);

  if (USE_MOCK) {
    // Simulate realistic API latency
    await new Promise(r => setTimeout(r, 1200));
    console.log('[apiService] Mock mode — payload that would be sent to backend:', { ...payload, siteUrl });
    return getMockAnalysis(payload.scorePercent, lang);
  }

  const res = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, siteUrl }),
  });

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status}`);
  }

  const data = await res.json();
  if (!data.analysis) {
    throw new Error('EMPTY_RESPONSE');
  }
  return data.analysis as string;
}
