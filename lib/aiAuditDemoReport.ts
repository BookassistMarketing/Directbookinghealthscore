import type { Language } from '../types';

// Static markdown demo reports used by the marketing-only "Preview end page"
// shortcut on the AI Visibility Audit. Lets staff iterate on rendering and
// PDF capture in any of the 7 supported languages without burning Gemini
// credits. Keep these in lockstep with the real Gemini output structure
// (see services/geminiService.ts AI_READINESS_SYSTEM_PROMPT).

const EN = `# AI Visibility & Optimisation Summary

**The Grand Harbour Hotel, Galway**

Overall score: 62 / 100 — Near AI-ready

URL analysed: https://grandharbour-demo.example.com

## What we observed

The Grand Harbour Hotel maintains a clean, brand-aligned presentation with strong booking pathways and solid metadata coverage. AI assistants can readily identify the property and its booking surface, but several structural signals — notably FAQPage schema, SpeakableSpecification, and entity-level @id linking — are absent. These gaps prevent the site from reaching the AI-optimised tier and limit visibility in generative search experiences such as ChatGPT, Perplexity, and Google AI Overviews.

## Weighted scoring breakdown

| Category | Weight | Score |
| --- | --- | --- |
| Structured Data Completeness | 25 | 14 |
| Technical Crawlability | 9 | 9 |
| Local Entity Linking | 10 | 7 |
| FAQ/Q&A Presence | 10 | 0 |
| Semantic Coverage | 15 | 10 |
| Booking Pathway Clarity | 12 | 12 |
| Metadata Diversity | 6 | 6 |
| Persona & Use-Case Mapping | 5 | 2 |
| Media/ALT Optimisation | 2 | 2 |
| Voice-Search Readiness | 6 | 0 |

## Recurring issues across the website

| Issue | Impact | Pages Affected |
| --- | --- | --- |
| Missing FAQPage schema | AI assistants cannot extract structured Q&A pairs | Homepage, Rooms, Contact |
| No SpeakableSpecification | Voice assistants skip the site entirely | All pages |
| Thin @id graph linking | Entities not connected as a knowledge graph | Homepage, Rooms |
| Limited persona-targeted content | AI search cannot match the property to specific traveller intents | Landing pages |
| No nearby attraction references in schema | Local AI search downranks the property | Homepage, Location |

## Estimated score uplift if issues are resolved

| Fix | Estimated Score Increase |
| --- | --- |
| Add FAQPage schema with 8 location and booking questions | +10 points |
| Add SpeakableSpecification to top 3 landing pages | +3 points |
| Reinforce @id graph linking across Hotel + LocalBusiness entities | +4 points |
| Add "For Business" and "For Families" intent blocks | +3 points |
| Expand nearby attractions narrative on Location page | +3 points |

**Projected Score After Fixes: 85 / 100**

## Strategic Advantage for Bookassist

Bookassist's AI Readiness programme directly closes every gap surfaced above. Our structured-data automation populates FAQPage, SpeakableSpecification, and @id graph relationships in a single deployment, while our content optimisation surfaces persona blocks and local-entity references that elevate the property in generative search. Hotels onboarded with Bookassist typically reach AI-optimised status within 90 days, translating to material lifts in direct-booking visibility across ChatGPT, Perplexity, and Google AI Overviews.`;

const IT = `# Riepilogo Visibilità e Ottimizzazione AI

**The Grand Harbour Hotel, Galway**

Punteggio complessivo: 62 / 100 — Quasi pronto per l'AI

URL analizzato: https://grandharbour-demo.example.com

## Cosa abbiamo osservato

The Grand Harbour Hotel mantiene una presentazione pulita e coerente con il brand, con percorsi di prenotazione solidi e una buona copertura dei metadati. Gli assistenti AI possono identificare facilmente la struttura e la sua interfaccia di prenotazione, ma diversi segnali strutturali — in particolare lo schema FAQPage, SpeakableSpecification e il collegamento delle entità tramite @id — sono assenti. Queste lacune impediscono al sito di raggiungere il livello AI-optimised e limitano la visibilità nelle esperienze di ricerca generativa come ChatGPT, Perplexity e Google AI Overviews.

## Ripartizione del punteggio ponderato

| Categoria | Peso | Punteggio |
| --- | --- | --- |
| Completezza dei dati strutturati | 25 | 14 |
| Crawlability tecnica | 9 | 9 |
| Collegamento di entità locali | 10 | 7 |
| Presenza FAQ/Q&A | 10 | 0 |
| Copertura semantica | 15 | 10 |
| Chiarezza del percorso di prenotazione | 12 | 12 |
| Diversità dei metadati | 6 | 6 |
| Mappatura persona e casi d'uso | 5 | 2 |
| Ottimizzazione media/ALT | 2 | 2 |
| Pronto per la ricerca vocale | 6 | 0 |

## Problemi ricorrenti nel sito

| Problema | Impatto | Pagine interessate |
| --- | --- | --- |
| Schema FAQPage assente | Gli assistenti AI non possono estrarre coppie Q&A strutturate | Homepage, Camere, Contatti |
| SpeakableSpecification assente | Gli assistenti vocali ignorano completamente il sito | Tutte le pagine |
| Collegamento @id graph debole | Entità non connesse come knowledge graph | Homepage, Camere |
| Contenuti targettizzati per persona limitati | La ricerca AI non riesce ad associare la struttura a intenti di viaggio specifici | Pagine di destinazione |
| Nessun riferimento alle attrazioni vicine nello schema | La ricerca AI locale penalizza la struttura | Homepage, Posizione |

## Aumento stimato del punteggio se i problemi vengono risolti

| Correzione | Aumento di punteggio stimato |
| --- | --- |
| Aggiungere schema FAQPage con 8 domande su località e prenotazione | +10 punti |
| Aggiungere SpeakableSpecification alle 3 principali landing page | +3 punti |
| Rafforzare il collegamento @id graph tra entità Hotel + LocalBusiness | +4 punti |
| Aggiungere blocchi di intento "Per Business" e "Per Famiglie" | +3 punti |
| Espandere la narrazione delle attrazioni vicine nella pagina Posizione | +3 punti |

**Punteggio previsto dopo le correzioni: 85 / 100**

## Vantaggio strategico per Bookassist

Il programma AI Readiness di Bookassist chiude direttamente ogni lacuna evidenziata sopra. La nostra automazione dei dati strutturati popola FAQPage, SpeakableSpecification e le relazioni @id graph in un'unica implementazione, mentre la nostra ottimizzazione dei contenuti fa emergere blocchi di persona e riferimenti a entità locali che elevano la struttura nella ricerca generativa. Gli hotel onboarded con Bookassist raggiungono in genere lo status AI-optimised entro 90 giorni, traducendosi in aumenti significativi della visibilità delle prenotazioni dirette su ChatGPT, Perplexity e Google AI Overviews.`;

const ES = `# Resumen de Visibilidad y Optimización de IA

**The Grand Harbour Hotel, Galway**

Puntuación total: 62 / 100 — Cerca de listo para IA

URL analizada: https://grandharbour-demo.example.com

## Lo que observamos

The Grand Harbour Hotel mantiene una presentación limpia y alineada con la marca, con rutas de reserva sólidas y una cobertura de metadatos consistente. Los asistentes de IA pueden identificar fácilmente la propiedad y su superficie de reserva, pero varias señales estructurales — en particular el esquema FAQPage, SpeakableSpecification y la vinculación de entidades a nivel de @id — están ausentes. Estas brechas impiden que el sitio alcance el nivel AI-optimised y limitan la visibilidad en experiencias de búsqueda generativa como ChatGPT, Perplexity y Google AI Overviews.

## Desglose de puntuación ponderada

| Categoría | Peso | Puntuación |
| --- | --- | --- |
| Completitud de datos estructurados | 25 | 14 |
| Rastreabilidad técnica | 9 | 9 |
| Vinculación de entidades locales | 10 | 7 |
| Presencia de FAQ/Q&A | 10 | 0 |
| Cobertura semántica | 15 | 10 |
| Claridad de la ruta de reserva | 12 | 12 |
| Diversidad de metadatos | 6 | 6 |
| Mapeo de personas y casos de uso | 5 | 2 |
| Optimización de medios/ALT | 2 | 2 |
| Preparación para búsqueda por voz | 6 | 0 |

## Problemas recurrentes en el sitio

| Problema | Impacto | Páginas afectadas |
| --- | --- | --- |
| Falta esquema FAQPage | Los asistentes de IA no pueden extraer pares Q&A estructurados | Inicio, Habitaciones, Contacto |
| Sin SpeakableSpecification | Los asistentes de voz omiten el sitio por completo | Todas las páginas |
| Vinculación @id graph débil | Entidades no conectadas como knowledge graph | Inicio, Habitaciones |
| Contenido enfocado a personas limitado | La búsqueda con IA no asocia la propiedad a intenciones de viaje específicas | Páginas de destino |
| Sin referencias a atracciones cercanas en el esquema | La búsqueda con IA local penaliza la propiedad | Inicio, Ubicación |

## Aumento estimado de puntuación si se resuelven los problemas

| Solución | Aumento estimado de puntuación |
| --- | --- |
| Añadir esquema FAQPage con 8 preguntas de ubicación y reserva | +10 puntos |
| Añadir SpeakableSpecification a las 3 principales páginas de destino | +3 puntos |
| Reforzar la vinculación @id graph entre entidades Hotel + LocalBusiness | +4 puntos |
| Añadir bloques de intención "Para Empresas" y "Para Familias" | +3 puntos |
| Ampliar la narrativa de atracciones cercanas en la página de Ubicación | +3 puntos |

**Puntuación prevista tras correcciones: 85 / 100**

## Ventaja estratégica para Bookassist

El programa AI Readiness de Bookassist cierra directamente cada brecha mencionada arriba. Nuestra automatización de datos estructurados completa FAQPage, SpeakableSpecification y las relaciones @id graph en un solo despliegue, mientras que nuestra optimización de contenido hace emerger bloques de persona y referencias a entidades locales que elevan la propiedad en la búsqueda generativa. Los hoteles incorporados con Bookassist normalmente alcanzan el estado AI-optimised en 90 días, lo que se traduce en aumentos materiales de la visibilidad de reserva directa en ChatGPT, Perplexity y Google AI Overviews.`;

const PL = `# Podsumowanie Widoczności i Optymalizacji AI

**The Grand Harbour Hotel, Galway**

Wynik ogólny: 62 / 100 — Prawie gotowy na AI

Przeanalizowany URL: https://grandharbour-demo.example.com

## Co zaobserwowaliśmy

The Grand Harbour Hotel utrzymuje czystą, spójną z marką prezentację z mocnymi ścieżkami rezerwacji i solidnym pokryciem metadanych. Asystenci AI łatwo identyfikują obiekt i jego powierzchnię rezerwacyjną, jednak kilka sygnałów strukturalnych — w szczególności schemat FAQPage, SpeakableSpecification oraz powiązanie encji na poziomie @id — jest nieobecnych. Te luki uniemożliwiają witrynie osiągnięcie poziomu AI-optimised i ograniczają widoczność w generatywnych doświadczeniach wyszukiwania, takich jak ChatGPT, Perplexity i Google AI Overviews.

## Szczegóły wyników ważonych

| Kategoria | Waga | Wynik |
| --- | --- | --- |
| Kompletność danych strukturalnych | 25 | 14 |
| Indeksowalność techniczna | 9 | 9 |
| Powiązanie encji lokalnych | 10 | 7 |
| Obecność FAQ/Q&A | 10 | 0 |
| Pokrycie semantyczne | 15 | 10 |
| Przejrzystość ścieżki rezerwacji | 12 | 12 |
| Różnorodność metadanych | 6 | 6 |
| Mapowanie person i przypadków użycia | 5 | 2 |
| Optymalizacja mediów/ALT | 2 | 2 |
| Gotowość do wyszukiwania głosowego | 6 | 0 |

## Powtarzające się problemy w serwisie

| Problem | Wpływ | Dotyczy stron |
| --- | --- | --- |
| Brak schematu FAQPage | Asystenci AI nie mogą wyodrębnić ustrukturyzowanych par Q&A | Strona główna, Pokoje, Kontakt |
| Brak SpeakableSpecification | Asystenci głosowi pomijają witrynę całkowicie | Wszystkie strony |
| Słabe powiązanie @id graph | Encje nieskonsolidowane jako knowledge graph | Strona główna, Pokoje |
| Ograniczone treści ukierunkowane na persony | Wyszukiwanie AI nie dopasowuje obiektu do konkretnych intencji podróżnych | Strony docelowe |
| Brak odniesień do pobliskich atrakcji w schemacie | Lokalne wyszukiwanie AI obniża pozycję obiektu | Strona główna, Lokalizacja |

## Szacowany wzrost wyniku po usunięciu problemów

| Poprawka | Szacowany wzrost wyniku |
| --- | --- |
| Dodaj schemat FAQPage z 8 pytaniami o lokalizację i rezerwację | +10 punktów |
| Dodaj SpeakableSpecification do 3 głównych stron docelowych | +3 punkty |
| Wzmocnij powiązanie @id graph między encjami Hotel + LocalBusiness | +4 punkty |
| Dodaj bloki intencji "Dla Biznesu" i "Dla Rodzin" | +3 punkty |
| Rozszerz narrację o pobliskich atrakcjach na stronie Lokalizacja | +3 punkty |

**Prognozowany wynik po poprawkach: 85 / 100**

## Strategiczna przewaga Bookassist

Program AI Readiness Bookassist bezpośrednio zamyka każdą lukę wskazaną powyżej. Nasza automatyzacja danych strukturalnych wypełnia FAQPage, SpeakableSpecification i relacje @id graph w pojedynczym wdrożeniu, podczas gdy nasza optymalizacja treści wydobywa bloki person i odniesienia do lokalnych encji, które wzmacniają obiekt w wyszukiwaniu generatywnym. Hotele wdrożone z Bookassist zwykle osiągają status AI-optimised w ciągu 90 dni, co przekłada się na istotne wzrosty widoczności bezpośrednich rezerwacji w ChatGPT, Perplexity i Google AI Overviews.`;

const FR = `# Synthèse Visibilité & Optimisation IA

**The Grand Harbour Hotel, Galway**

Score global : 62 / 100 — Presque prêt pour l'IA

URL analysée : https://grandharbour-demo.example.com

## Ce que nous avons observé

The Grand Harbour Hotel maintient une présentation soignée et alignée à la marque, avec des parcours de réservation solides et une bonne couverture des métadonnées. Les assistants IA peuvent facilement identifier l'établissement et sa surface de réservation, mais plusieurs signaux structurels — notamment le schéma FAQPage, SpeakableSpecification et la liaison d'entités au niveau @id — sont absents. Ces lacunes empêchent le site d'atteindre le niveau AI-optimised et limitent la visibilité dans les expériences de recherche générative telles que ChatGPT, Perplexity et Google AI Overviews.

## Détail du score pondéré

| Catégorie | Poids | Score |
| --- | --- | --- |
| Complétude des données structurées | 25 | 14 |
| Crawlabilité technique | 9 | 9 |
| Liaison d'entités locales | 10 | 7 |
| Présence FAQ/Q&A | 10 | 0 |
| Couverture sémantique | 15 | 10 |
| Clarté du parcours de réservation | 12 | 12 |
| Diversité des métadonnées | 6 | 6 |
| Cartographie des personas et cas d'usage | 5 | 2 |
| Optimisation médias/ALT | 2 | 2 |
| Préparation à la recherche vocale | 6 | 0 |

## Problèmes récurrents sur le site

| Problème | Impact | Pages concernées |
| --- | --- | --- |
| Schéma FAQPage manquant | Les assistants IA ne peuvent extraire de paires Q&A structurées | Accueil, Chambres, Contact |
| Pas de SpeakableSpecification | Les assistants vocaux ignorent entièrement le site | Toutes les pages |
| Liaison @id graph faible | Entités non connectées en knowledge graph | Accueil, Chambres |
| Contenu ciblé personas limité | La recherche IA ne relie pas l'établissement à des intentions de voyage spécifiques | Pages d'atterrissage |
| Aucune référence aux attractions à proximité dans le schéma | La recherche IA locale pénalise l'établissement | Accueil, Localisation |

## Augmentation estimée du score si les problèmes sont résolus

| Correctif | Augmentation estimée du score |
| --- | --- |
| Ajouter un schéma FAQPage avec 8 questions sur la localisation et la réservation | +10 points |
| Ajouter SpeakableSpecification aux 3 principales pages d'atterrissage | +3 points |
| Renforcer la liaison @id graph entre les entités Hotel + LocalBusiness | +4 points |
| Ajouter les blocs d'intention « Pour les Entreprises » et « Pour les Familles » | +3 points |
| Étoffer le récit des attractions à proximité sur la page Localisation | +3 points |

**Score projeté après corrections : 85 / 100**

## Avantage stratégique pour Bookassist

Le programme AI Readiness de Bookassist comble directement chaque lacune mise en évidence ci-dessus. Notre automatisation des données structurées renseigne FAQPage, SpeakableSpecification et les relations @id graph en un seul déploiement, tandis que notre optimisation de contenu fait émerger les blocs personas et les références aux entités locales qui élèvent l'établissement dans la recherche générative. Les hôtels onboardés avec Bookassist atteignent généralement le statut AI-optimised en 90 jours, ce qui se traduit par des hausses significatives de la visibilité des réservations directes sur ChatGPT, Perplexity et Google AI Overviews.`;

const DE = `# Zusammenfassung KI-Sichtbarkeit & Optimierung

**The Grand Harbour Hotel, Galway**

Gesamtpunktzahl: 62 / 100 — Nahezu KI-bereit

Analysierte URL: https://grandharbour-demo.example.com

## Was wir beobachtet haben

The Grand Harbour Hotel präsentiert sich sauber und markenkonform, mit starken Buchungspfaden und solider Metadaten-Abdeckung. KI-Assistenten können das Haus und seine Buchungsfläche problemlos identifizieren, doch mehrere strukturelle Signale — insbesondere das FAQPage-Schema, SpeakableSpecification und die Verknüpfung von Entitäten auf @id-Ebene — fehlen. Diese Lücken verhindern, dass die Website den AI-optimised-Status erreicht, und schränken die Sichtbarkeit in generativen Suchumgebungen wie ChatGPT, Perplexity und Google AI Overviews ein.

## Gewichtete Punkteverteilung

| Kategorie | Gewichtung | Punkte |
| --- | --- | --- |
| Vollständigkeit strukturierter Daten | 25 | 14 |
| Technische Crawlbarkeit | 9 | 9 |
| Verknüpfung lokaler Entitäten | 10 | 7 |
| FAQ/Q&A-Präsenz | 10 | 0 |
| Semantische Abdeckung | 15 | 10 |
| Klarheit des Buchungspfads | 12 | 12 |
| Metadatenvielfalt | 6 | 6 |
| Persona- und Use-Case-Mapping | 5 | 2 |
| Medien-/ALT-Optimierung | 2 | 2 |
| Bereitschaft für Sprachsuche | 6 | 0 |

## Wiederkehrende Probleme auf der Website

| Problem | Auswirkung | Betroffene Seiten |
| --- | --- | --- |
| Fehlendes FAQPage-Schema | KI-Assistenten können keine strukturierten Q&A-Paare extrahieren | Startseite, Zimmer, Kontakt |
| Keine SpeakableSpecification | Sprachassistenten überspringen die Website vollständig | Alle Seiten |
| Schwache @id-Graph-Verknüpfung | Entitäten nicht als Knowledge Graph verbunden | Startseite, Zimmer |
| Begrenzte persona-spezifische Inhalte | Die KI-Suche ordnet das Haus keinen konkreten Reise-Intents zu | Landingpages |
| Keine Verweise auf Sehenswürdigkeiten in der Nähe im Schema | Die lokale KI-Suche stuft das Haus zurück | Startseite, Standort |

## Geschätzter Punktezuwachs nach Behebung der Probleme

| Behebung | Geschätzter Punktezuwachs |
| --- | --- |
| FAQPage-Schema mit 8 Fragen zu Standort und Buchung ergänzen | +10 Punkte |
| SpeakableSpecification auf den 3 wichtigsten Landingpages ergänzen | +3 Punkte |
| @id-Graph-Verknüpfung zwischen Hotel- und LocalBusiness-Entitäten stärken | +4 Punkte |
| Intent-Blöcke „Für Geschäftsreisende" und „Für Familien" hinzufügen | +3 Punkte |
| Erzählung zu Sehenswürdigkeiten in der Nähe auf der Standortseite ausbauen | +3 Punkte |

**Prognostizierte Punktzahl nach Korrekturen: 85 / 100**

## Strategischer Vorteil für Bookassist

Das AI-Readiness-Programm von Bookassist schließt jede oben aufgezeigte Lücke direkt. Unsere Automatisierung strukturierter Daten füllt FAQPage, SpeakableSpecification und @id-Graph-Beziehungen in einem einzigen Deployment, während unsere Content-Optimierung Persona-Blöcke und Verweise auf lokale Entitäten hervorbringt, die das Haus in der generativen Suche stärken. Mit Bookassist onboardete Hotels erreichen in der Regel innerhalb von 90 Tagen den AI-optimised-Status, was sich in spürbaren Steigerungen der Direktbuchungs-Sichtbarkeit auf ChatGPT, Perplexity und Google AI Overviews niederschlägt.`;

const CS = `# Shrnutí AI viditelnosti a optimalizace

**The Grand Harbour Hotel, Galway**

Celkové skóre: 62 / 100 — Téměř připraveno na AI

Analyzovaná URL: https://grandharbour-demo.example.com

## Co jsme pozorovali

The Grand Harbour Hotel působí čistě a v souladu se značkou, se silnými rezervačními cestami a solidním pokrytím metadat. AI asistenti dokáží objekt a jeho rezervační rozhraní snadno identifikovat, avšak několik strukturálních signálů — zejména schéma FAQPage, SpeakableSpecification a propojení entit na úrovni @id — chybí. Tyto mezery brání webu dosáhnout úrovně AI-optimised a omezují viditelnost v generativních vyhledávacích prostředích, jako jsou ChatGPT, Perplexity a Google AI Overviews.

## Vážené rozložení skóre

| Kategorie | Váha | Skóre |
| --- | --- | --- |
| Úplnost strukturovaných dat | 25 | 14 |
| Technická indexovatelnost | 9 | 9 |
| Propojení místních entit | 10 | 7 |
| Přítomnost FAQ/Q&A | 10 | 0 |
| Sémantické pokrytí | 15 | 10 |
| Jasnost rezervační cesty | 12 | 12 |
| Rozmanitost metadat | 6 | 6 |
| Mapování person a případů užití | 5 | 2 |
| Optimalizace médií/ALT | 2 | 2 |
| Připravenost na hlasové vyhledávání | 6 | 0 |

## Opakující se problémy na webu

| Problém | Dopad | Dotčené stránky |
| --- | --- | --- |
| Chybějící schéma FAQPage | AI asistenti nemohou extrahovat strukturované páry Q&A | Domovská stránka, Pokoje, Kontakt |
| Chybí SpeakableSpecification | Hlasoví asistenti web zcela přeskakují | Všechny stránky |
| Slabé propojení @id graph | Entity nejsou propojeny jako knowledge graph | Domovská stránka, Pokoje |
| Omezený obsah cílený na persony | AI vyhledávání nedokáže objekt přiřadit ke konkrétním záměrům cestujících | Vstupní stránky |
| Žádné odkazy na blízké atrakce ve schématu | Místní AI vyhledávání objekt podhodnocuje | Domovská stránka, Lokalita |

## Odhadovaný nárůst skóre po vyřešení problémů

| Oprava | Odhadovaný nárůst skóre |
| --- | --- |
| Přidat schéma FAQPage s 8 otázkami o lokalitě a rezervaci | +10 bodů |
| Přidat SpeakableSpecification na 3 hlavní vstupní stránky | +3 body |
| Posílit propojení @id graph mezi entitami Hotel + LocalBusiness | +4 body |
| Přidat intent bloky „Pro firmy" a „Pro rodiny" | +3 body |
| Rozšířit popis blízkých atrakcí na stránce Lokalita | +3 body |

**Předpokládané skóre po opravách: 85 / 100**

## Strategická výhoda pro Bookassist

Program AI Readiness od Bookassist přímo uzavírá každou výše uvedenou mezeru. Naše automatizace strukturovaných dat vyplní FAQPage, SpeakableSpecification a vztahy @id graph v jednom nasazení, zatímco naše optimalizace obsahu zviditelní persona bloky a odkazy na místní entity, které posunou objekt v generativním vyhledávání výš. Hotely nasazené s Bookassist obvykle dosáhnou statusu AI-optimised do 90 dnů, což se promítne do výrazného nárůstu viditelnosti přímých rezervací v ChatGPT, Perplexity a Google AI Overviews.`;

export const DEMO_REPORTS: Record<Language, string> = {
  en: EN,
  it: IT,
  es: ES,
  pl: PL,
  fr: FR,
  de: DE,
  cs: CS,
};
