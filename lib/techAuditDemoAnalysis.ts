import type { Language } from '../types';

// Static demo strategic analysis used by the marketing-only "Preview full
// results" shortcut on the Hotel Tech Audit. 7 localised variants so staff
// can preview the FullResults rendering and PDF capture in any language
// without burning a Gemini call. Keep in lockstep with the Gemini output
// structure produced by generateStrategicAnalysis() — see
// services/geminiService.ts.

const EN = `## Tech Score reveals significant revenue leakage

Your hotel is missing high-impact automations that quietly reroute high-margin demand toward commission-heavy channels every month.

### Critical Gaps

- **Missing Brand Protection PPC**: OTAs are intercepting brand-name searches and reselling your own demand back to you at 15–25% commission per booking.
- **No CPA-guaranteed Metasearch**: Standard CPC spending wastes budget on clicks that never convert, eroding ROI across every Google Hotel Ads and Trivago impression.

### Financial Exposure

Left unresolved, these gaps typically translate to an estimated 18–22% of total room revenue routed through OTA channels at full commission — a five- to six-figure annual margin loss for a property of your size.

---

*Contact a Bookassist strategist for a tailored direct revenue recovery plan.*`;

const IT = `## Il Tech Score rivela una significativa perdita di entrate

Il tuo hotel è privo di automazioni ad alto impatto che ogni mese reindirizzano silenziosamente la domanda ad alto margine verso canali con commissioni elevate.

### Lacune critiche

- **Brand Protection PPC assente**: le OTA intercettano le ricerche del tuo marchio e ti rivendono la tua stessa domanda con commissioni del 15–25% per prenotazione.
- **Nessun Metasearch CPA-guaranteed**: la spesa CPC standard spreca budget su clic che non convertono, erodendo il ROI su ogni impression di Google Hotel Ads e Trivago.

### Esposizione finanziaria

Se non risolte, queste lacune si traducono solitamente in una stima del 18–22% delle entrate totali da camere instradate verso i canali OTA a piena commissione — una perdita di margine annuale a cinque o sei cifre per una struttura delle tue dimensioni.

---

*Contatta uno stratega Bookassist per un piano personalizzato di recupero delle entrate dirette.*`;

const ES = `## El Tech Score revela una fuga significativa de ingresos

A tu hotel le faltan automatizaciones de alto impacto que cada mes redirigen silenciosamente la demanda de alto margen hacia canales con altas comisiones.

### Brechas críticas

- **Falta de Brand Protection PPC**: las OTA interceptan las búsquedas de tu marca y te revenden tu propia demanda con un 15–25% de comisión por reserva.
- **Sin Metasearch con CPA garantizado**: el gasto CPC estándar desperdicia presupuesto en clics que no convierten, erosionando el ROI en cada impresión de Google Hotel Ads y Trivago.

### Exposición financiera

Si no se resuelven, estas brechas suelen traducirse en un estimado del 18–22% de los ingresos totales por habitación canalizados a través de OTA con comisión completa — una pérdida anual de margen de cinco o seis cifras para una propiedad de tu tamaño.

---

*Contacta a un estratega de Bookassist para un plan personalizado de recuperación de ingresos directos.*`;

const PL = `## Tech Score ujawnia znaczący wyciek przychodów

Twojemu hotelowi brakuje wysoko wpływowych automatyzacji, które co miesiąc po cichu przekierowują wysokomarżowy popyt do kanałów z wysokimi prowizjami.

### Krytyczne luki

- **Brak Brand Protection PPC**: OTA przechwytują wyszukiwania Twojej marki i odsprzedają Ci Twój własny popyt z prowizją 15–25% za rezerwację.
- **Brak Metasearch z gwarancją CPA**: standardowe wydatki CPC marnują budżet na kliknięcia, które nigdy się nie konwertują, niszcząc ROI w każdej odsłonie Google Hotel Ads i Trivago.

### Ekspozycja finansowa

Niewyeliminowane, te luki zazwyczaj przekładają się na szacunkowo 18–22% całkowitych przychodów z pokoi kierowanych przez OTA z pełną prowizją — pięcio- lub sześciocyfrowa roczna utrata marży dla obiektu Twojej wielkości.

---

*Skontaktuj się ze strategiem Bookassist, aby uzyskać dostosowany plan odzyskiwania bezpośrednich przychodów.*`;

const FR = `## Le Tech Score révèle une fuite significative de revenus

Il manque à votre hôtel des automatisations à fort impact qui détournent discrètement chaque mois la demande à forte marge vers des canaux à forte commission.

### Lacunes critiques

- **Brand Protection PPC absente** : les OTA interceptent les recherches sur votre marque et vous revendent votre propre demande avec 15 à 25 % de commission par réservation.
- **Pas de Metasearch CPA garanti** : les dépenses CPC standard gaspillent le budget sur des clics qui ne convertissent jamais, érodant le ROI sur chaque impression Google Hotel Ads et Trivago.

### Exposition financière

Sans correction, ces lacunes représentent généralement entre 18 et 22 % du revenu chambres total acheminé via les OTA à pleine commission — une perte de marge annuelle à cinq ou six chiffres pour un établissement de votre taille.

---

*Contactez un stratège Bookassist pour un plan personnalisé de récupération des revenus directs.*`;

const DE = `## Der Tech Score zeigt erheblichen Umsatzverlust auf

Ihrem Hotel fehlen hochwirksame Automatisierungen, die monatlich nachfragestarke Direktbuchungen leise an provisionsstarke Kanäle umlenken.

### Kritische Lücken

- **Brand Protection PPC fehlt**: OTAs fangen Markensuchen ab und verkaufen Ihnen Ihre eigene Nachfrage mit 15–25 % Provision pro Buchung zurück.
- **Kein CPA-garantiertes Metasearch**: Standard-CPC-Ausgaben verschwenden Budget auf Klicks ohne Conversion und schwächen den ROI bei jeder Google Hotel Ads- und Trivago-Impression.

### Finanzielles Risiko

Ungelöst übersetzen sich diese Lücken in der Regel in geschätzte 18–22 % des gesamten Zimmerumsatzes, der mit voller Provision über OTA-Kanäle läuft — ein fünf- bis sechsstelliger jährlicher Margenverlust für ein Haus Ihrer Größe.

---

*Wenden Sie sich an einen Bookassist-Strategen für einen maßgeschneiderten Plan zur Rückgewinnung von Direktumsatz.*`;

const CS = `## Tech Score odhaluje významný únik příjmů

Vašemu hotelu chybí vysoce účinné automatizace, které každý měsíc tiše přesměrovávají poptávku s vysokou marží do kanálů s vysokými provizemi.

### Kritické mezery

- **Chybí Brand Protection PPC**: OTA zachytávají vyhledávání vaší značky a prodávají vám zpět vaši vlastní poptávku s provizí 15–25 % za rezervaci.
- **Žádný Metasearch s garantovaným CPA**: standardní CPC výdaje plýtvají rozpočtem na kliky, které nikdy nekonvertují, a oslabují ROI u každé imprese Google Hotel Ads a Trivago.

### Finanční expozice

Bez řešení tyto mezery obvykle představují odhadem 18–22 % celkových příjmů z pokojů směrovaných přes OTA s plnou provizí — pětimístná až šestimístná roční ztráta marže pro objekt vaší velikosti.

---

*Obraťte se na stratéga Bookassist a získejte přizpůsobený plán obnovy přímých příjmů.*`;

export const DEMO_ANALYSES: Record<Language, string> = {
  en: EN,
  it: IT,
  es: ES,
  pl: PL,
  fr: FR,
  de: DE,
  cs: CS,
};
