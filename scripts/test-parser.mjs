// Verifies the AI Readiness Report parser handles the documented Gemini
// output structure. Run with: node scripts/test-parser.mjs
// (Uses Node 22+ native TS import via --experimental-strip-types.)

import { parseAiReadinessReport, tierFromScore } from '../lib/parseAiReport.ts';

const sample = `## AI Visibility & Optimisation Summary
The Grand Hotel, Dublin
Overall score: 42 / 100 — Below AI-optimised threshold
URL analysed: https://thegrandhotel.example.com

## What we observed
The Grand Hotel maintains a polished brand presentation with strong visual storytelling. However, our analysis surfaced multiple gaps in structured data, semantic coverage, and AI discoverability.

## Weighted scoring breakdown
| Category | Weight | Score |
| --- | --- | --- |
| Structured Data Completeness | 25 | 8 |
| Technical Crawlability | 9 | 6 |
| Local Entity Linking | 10 | 5 |
| FAQ/Q&A Presence | 10 | 0 |

## Recurring issues across the website
| Issue | Impact | Pages Affected |
| --- | --- | --- |
| Missing FAQPage schema | AI assistants cannot extract Q&A pairs | Homepage, Rooms |
| No HotelRoom schema | Room availability invisible to AI | Rooms, Suites |

## Estimated score uplift if issues are resolved
| Fix | Estimated Score Increase |
| --- | --- |
| Add FAQPage schema with 8 questions | +10 points |
| Add HotelRoom + OfferCatalog schema | +6 points |

Projected Score After Fixes: 66 / 100

## Strategic Advantage for Bookassist
Bookassist's AI Readiness programme directly addresses every gap surfaced above through structured-data automation.

structured-data/organization: met
structured-data/hotel-room: not-met
structured-data/aggregate-rating: not-met
structured-data/geo-coordinates: met
structured-data/id-graph: not-met
technical-crawlability/indexable: met
technical-crawlability/clean-canonical: met
technical-crawlability/no-render-blockers: met
local-entity-linking/nearby-references: not-met
local-entity-linking/address-neighborhood: met
local-entity-linking/map-directions: not-met
faq-presence/faq-schema-or-section: not-met
semantic-coverage/topical-coverage: met
semantic-coverage/question-headings: partial
semantic-coverage/entity-rich-descriptions: not-met
semantic-coverage/internal-links: not-met
booking-pathway/direct-cta: met
booking-pathway/direct-advantages: met
booking-pathway/room-differentiators: met
booking-pathway/pricing-framing: not-met
metadata-diversity/unique-titles-meta: met
metadata-diversity/descriptive-headings: not-met
persona-use-case/persona-intents: partial
media-alt/alt-strategy: partial
voice-search/speakable-spec: not-met
voice-search/nap-consistency: not-met`;

const parsed = parseAiReadinessReport(sample);

const checks = [
  ['overallScore', parsed.overallScore === 42],
  ['projectedScore', parsed.projectedScore === 66],
  ['url', parsed.url === 'https://thegrandhotel.example.com'],
  ['tierLabel', typeof parsed.tierLabel === 'string' && parsed.tierLabel.length > 0],
  ['observedParagraph length', (parsed.observedParagraph?.length ?? 0) > 50],
  ['observedParagraph starts with right text', parsed.observedParagraph?.startsWith('The Grand Hotel maintains')],
  ['scoringRows length 4', parsed.scoringRows?.length === 4],
  ['scoringRows[0] category', parsed.scoringRows?.[0]?.category === 'Structured Data Completeness'],
  ['scoringRows[0] weight 25', parsed.scoringRows?.[0]?.weight === 25],
  ['scoringRows[0] score 8', parsed.scoringRows?.[0]?.score === 8],
  ['issuesRows length 2', parsed.issuesRows?.length === 2],
  ['issuesRows[0] issue', parsed.issuesRows?.[0]?.issue === 'Missing FAQPage schema'],
  ['issuesRows[0] impact contains "AI"', parsed.issuesRows?.[0]?.impact?.includes('AI')],
  ['fixesRows length 2', parsed.fixesRows?.length === 2],
  ['fixesRows[0] pointsIncrease 10', parsed.fixesRows?.[0]?.pointsIncrease === 10],
  ['strategicAdvantage contains Bookassist', parsed.strategicAdvantage?.includes('Bookassist')],
  ['tier from score 42 = below', tierFromScore(42) === 'below'],
  ['tier from score 82 = optimised', tierFromScore(82) === 'optimised'],
  ['tier from score 65 = near', tierFromScore(65) === 'near'],
  ['tier from score 20 = low', tierFromScore(20) === 'low'],
  ['criterionStatuses extracted', parsed.criterionStatuses !== null],
  ['criterionStatuses count = 26', parsed.criterionStatuses && Object.keys(parsed.criterionStatuses).length === 26],
  ['structured-data/organization = met', parsed.criterionStatuses?.['structured-data/organization'] === 'met'],
  ['structured-data/hotel-room = not-met', parsed.criterionStatuses?.['structured-data/hotel-room'] === 'not-met'],
  ['semantic-coverage/question-headings = partial', parsed.criterionStatuses?.['semantic-coverage/question-headings'] === 'partial'],
  ['strategic advantage does NOT contain status lines', !parsed.strategicAdvantage?.includes('organization:')],
];

let pass = 0, fail = 0;
for (const [label, ok] of checks) {
  if (ok) { console.log(`✓ ${label}`); pass += 1; }
  else { console.log(`✗ ${label}`); fail += 1; }
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.log('\nParsed object:');
  console.log(JSON.stringify(parsed, null, 2));
}
process.exit(fail === 0 ? 0 : 1);
