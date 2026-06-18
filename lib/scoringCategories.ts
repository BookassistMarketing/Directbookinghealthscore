// Static reference for the 10 AI Readiness scoring categories. These are
// the same categories defined in services/geminiService.ts AI Readiness
// system prompt, mirrored here so the UI can render the sub-criteria with
// human-readable labels.
//
// Order of categories must match the order Gemini emits them — that's how
// we map a scoringRow from the parsed markdown to its sub-criteria.
//
// The criterion keys (e.g. "organization", "hotel-room") are STABLE English
// identifiers that Gemini also emits in its per-criterion status block.
// Never translate these keys. The status block looks like:
//
//   structured-data/organization: met
//   structured-data/hotel-room: not-met
//   ...

import type { Language } from '../types';

export type CriterionStatus = 'met' | 'partial' | 'not-met';

export interface Criterion {
  key: string;
  maxPoints: number;
  // English label used as the default. Localised labels live in
  // `criterionLabels` below for languages that have translations.
  label: string;
}

export interface ScoringCategory {
  key: string;
  englishName: string;
  weight: number;
  shortDescription: string; // 1-line English summary of what this measures
  criteria: Criterion[];
}

export const SCORING_CATEGORIES: ScoringCategory[] = [
  {
    key: 'structured-data',
    englishName: 'Structured Data Completeness',
    weight: 25,
    shortDescription: 'Schema.org markup that lets AI assistants identify and recommend your property.',
    criteria: [
      { key: 'organization', maxPoints: 6, label: 'Hotel / LocalBusiness entity with name, address, phone' },
      { key: 'hotel-room', maxPoints: 6, label: 'HotelRoom / OfferCatalog / Offer schema present' },
      { key: 'aggregate-rating', maxPoints: 5, label: 'AggregateRating (reviews / ratings) present' },
      { key: 'geo-coordinates', maxPoints: 4, label: 'GeoCoordinates present' },
      { key: 'id-graph', maxPoints: 4, label: 'Entities connected via @id graph (sameAs, isPartOf, mainEntity)' },
    ],
  },
  {
    key: 'technical-crawlability',
    englishName: 'Technical Crawlability',
    weight: 9,
    shortDescription: 'Whether AI crawlers can actually reach and index the pages.',
    criteria: [
      { key: 'indexable', maxPoints: 3, label: 'Pages are indexable (no blocking noindex)' },
      { key: 'clean-canonical', maxPoints: 3, label: 'Clean canonical and URL structure' },
      { key: 'no-render-blockers', maxPoints: 3, label: 'No major render or crawl blockers' },
    ],
  },
  {
    key: 'local-entity-linking',
    englishName: 'Local Entity Linking',
    weight: 10,
    shortDescription: 'Signals tying the hotel to its neighbourhood, city, and nearby places of interest.',
    criteria: [
      { key: 'nearby-references', maxPoints: 4, label: 'Nearby attractions, venues, or areas referenced in content' },
      { key: 'address-neighborhood', maxPoints: 3, label: 'Address plus neighbourhood / city context reinforced in copy' },
      { key: 'map-directions', maxPoints: 3, label: 'Map, directions, parking, or transportation cues' },
    ],
  },
  {
    key: 'faq-presence',
    englishName: 'FAQ / Q&A Presence',
    weight: 10,
    shortDescription: 'Question-and-answer content that AI assistants love to quote directly.',
    criteria: [
      { key: 'faq-schema-or-section', maxPoints: 10, label: 'FAQPage schema OR a dedicated FAQ section (4 pts if only a couple of informal Q&As)' },
    ],
  },
  {
    key: 'semantic-coverage',
    englishName: 'Semantic Coverage',
    weight: 15,
    shortDescription: 'Depth and topical richness — how completely the site describes itself.',
    criteria: [
      { key: 'topical-coverage', maxPoints: 5, label: 'Clear topical coverage (amenities, location, use-cases, audiences)' },
      { key: 'question-headings', maxPoints: 4, label: 'Conversational / question-style headings ("Where…", "How…", "What…")' },
      { key: 'entity-rich-descriptions', maxPoints: 3, label: 'Entity-rich descriptions (landmarks, neighbourhoods, venues)' },
      { key: 'internal-links', maxPoints: 3, label: 'Internal links / content clusters (rooms, dining, events, offers)' },
    ],
  },
  {
    key: 'booking-pathway',
    englishName: 'Booking Pathway Clarity',
    weight: 12,
    shortDescription: 'How obvious and frictionless the direct-booking path is from any page.',
    criteria: [
      { key: 'direct-cta', maxPoints: 3, label: 'Direct booking links and clear booking CTAs' },
      { key: 'direct-advantages', maxPoints: 3, label: 'Stated advantages of booking directly (best price, exclusive offers, conditions)' },
      { key: 'room-differentiators', maxPoints: 3, label: 'Room types and differentiators clearly described' },
      { key: 'pricing-framing', maxPoints: 3, label: 'Pricing or offer framing present (packages, inclusions, conditions)' },
    ],
  },
  {
    key: 'metadata-diversity',
    englishName: 'Metadata Diversity',
    weight: 6,
    shortDescription: 'Per-page meta titles, descriptions, and heading variety.',
    criteria: [
      { key: 'unique-titles-meta', maxPoints: 3, label: 'Unique titles and meta descriptions per page' },
      { key: 'descriptive-headings', maxPoints: 3, label: 'Use of descriptive H1 / H2 variety' },
    ],
  },
  {
    key: 'persona-use-case',
    englishName: 'Persona & Use-Case Mapping',
    weight: 5,
    shortDescription: 'Content blocks aimed at specific traveller intents (business, families, etc.).',
    criteria: [
      { key: 'persona-intents', maxPoints: 5, label: 'Content blocks targeting specific intents (e.g. "For Business", "For Families")' },
    ],
  },
  {
    key: 'media-alt',
    englishName: 'Media / ALT Optimisation',
    weight: 2,
    shortDescription: 'Image accessibility and alt-text strategy.',
    criteria: [
      { key: 'alt-strategy', maxPoints: 2, label: 'Alt text strategy evident (alt text populated and descriptive)' },
    ],
  },
  {
    key: 'voice-search',
    englishName: 'Voice-Search Readiness',
    weight: 6,
    shortDescription: 'Optimisation for voice assistants and conversational search.',
    criteria: [
      { key: 'speakable-spec', maxPoints: 3, label: 'SpeakableSpecification schema present' },
      { key: 'nap-consistency', maxPoints: 3, label: 'NAP (name / address / phone) consistency across pages' },
    ],
  },
];

// Map "category-key/criterion-key" → status. Returned by the parser when
// Gemini emits the per-criterion status block.
export type CriterionStatusMap = Record<string, CriterionStatus>;

export function statusFor(
  statuses: CriterionStatusMap | null,
  categoryKey: string,
  criterionKey: string,
): CriterionStatus | null {
  if (!statuses) return null;
  return statuses[`${categoryKey}/${criterionKey}`] ?? null;
}

// UI labels — kept compact, English-only for "details:" and helper text.
// Full translation could come later if needed; technical sub-criteria
// detail is acceptable in English alongside the translated category name.
export interface CategoryUiStrings {
  details: string;
  hide: string;
  weighs: string;
  outOf: string;
  legendMet: string;
  legendPartial: string;
  legendMissed: string;
  legendUnknown: string;
}

export const categoryUiStrings: Record<Language, CategoryUiStrings> = {
  en: {
    details: 'Show details',
    hide: 'Hide details',
    weighs: 'weighs',
    outOf: 'pts',
    legendMet: 'Met',
    legendPartial: 'Partial',
    legendMissed: 'Missing',
    legendUnknown: 'Not assessed',
  },
  it: {
    details: 'Mostra dettagli',
    hide: 'Nascondi dettagli',
    weighs: 'vale',
    outOf: 'pt',
    legendMet: 'Soddisfatto',
    legendPartial: 'Parziale',
    legendMissed: 'Mancante',
    legendUnknown: 'Non valutato',
  },
  es: {
    details: 'Ver detalles',
    hide: 'Ocultar detalles',
    weighs: 'vale',
    outOf: 'pts',
    legendMet: 'Cumplido',
    legendPartial: 'Parcial',
    legendMissed: 'Faltante',
    legendUnknown: 'Sin evaluar',
  },
  pl: {
    details: 'Pokaż szczegóły',
    hide: 'Ukryj szczegóły',
    weighs: 'waga',
    outOf: 'pkt',
    legendMet: 'Spełnione',
    legendPartial: 'Częściowo',
    legendMissed: 'Brak',
    legendUnknown: 'Nieocenione',
  },
  fr: {
    details: 'Voir les détails',
    hide: 'Masquer les détails',
    weighs: 'vaut',
    outOf: 'pts',
    legendMet: 'Validé',
    legendPartial: 'Partiel',
    legendMissed: 'Manquant',
    legendUnknown: 'Non évalué',
  },
  de: {
    details: 'Details anzeigen',
    hide: 'Details ausblenden',
    weighs: 'Gewicht',
    outOf: 'Pkt',
    legendMet: 'Erfüllt',
    legendPartial: 'Teilweise',
    legendMissed: 'Fehlt',
    legendUnknown: 'Nicht bewertet',
  },
  cs: {
    details: 'Zobrazit detaily',
    hide: 'Skrýt detaily',
    weighs: 'váha',
    outOf: 'b.',
    legendMet: 'Splněno',
    legendPartial: 'Částečně',
    legendMissed: 'Chybí',
    legendUnknown: 'Neposouzeno',
  },
};
