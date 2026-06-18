// Verifies the AI Readiness Report parser handles the actual Gemini output
// format — plain-text section labels (no `## ` markdown headers), tables,
// score lines.
// Run with: node --experimental-strip-types scripts/test-parser.mjs

import { parseAiReadinessReport, tierFromScore } from '../lib/parseAiReport.ts';

const sample = `ai visibility & optimization summary
The Grand Hotel, Dublin
overall score: 42 / 100 — Below AI-optimized threshold
url analyzed: https://thegrandhotel.example.com

What we observed
The Grand Hotel maintains a polished brand presentation with strong visual storytelling. However, our analysis surfaced multiple gaps in structured data, semantic coverage, and AI discoverability.

Weighted scoring breakdown
| Category | Weight | Score |
| --- | --- | --- |
| Structured Data Completeness | 25 | 8 |
| Technical Crawlability | 9 | 6 |
| Local Entity Linking | 10 | 5 |
| FAQ/Q&A Presence | 10 | 0 |

Recurring issues across the website
| Issue | Impact | Pages Affected |
| --- | --- | --- |
| Missing FAQPage schema | AI assistants cannot extract Q&A pairs | Homepage, Rooms |
| No HotelRoom schema | Room availability invisible to AI | Rooms, Suites |

Estimated score uplift if issues are resolved
| Fix | Estimated Score Increase |
| --- | --- |
| Add FAQPage schema with 8 questions | +10 points |
| Add HotelRoom + OfferCatalog schema | +6 points |

Projected Score After Fixes: 66 / 100

Strategic Advantage for Bookassist
Bookassist's AI Readiness programme directly addresses every gap surfaced above through structured-data automation.`;

const parsed = parseAiReadinessReport(sample);

const checks = [
  ['overallScore = 42', parsed.overallScore === 42],
  ['projectedScore = 66', parsed.projectedScore === 66],
  ['url extracted', parsed.url === 'https://thegrandhotel.example.com'],
  ['tierLabel populated', typeof parsed.tierLabel === 'string' && parsed.tierLabel.length > 0],
  ['hotelName = "The Grand Hotel, Dublin"', parsed.hotelName === 'The Grand Hotel, Dublin'],
  ['hotelName NOT the report title', !parsed.hotelName?.toLowerCase().includes('visibility')],
  ['observedParagraph starts with right text', parsed.observedParagraph?.startsWith('The Grand Hotel maintains')],
  ['observedParagraph does NOT contain "What we observed"', !parsed.observedParagraph?.includes('What we observed')],
  ['observedParagraph does NOT contain "Weighted scoring"', !parsed.observedParagraph?.includes('Weighted scoring')],
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
  ['strategicAdvantage does NOT contain "Strategic Advantage"', !parsed.strategicAdvantage?.startsWith('Strategic Advantage')],
  ['tier from score 42 = below', tierFromScore(42) === 'below'],
  ['tier from score 82 = optimised', tierFromScore(82) === 'optimised'],
  ['tier from score 65 = near', tierFromScore(65) === 'near'],
  ['tier from score 20 = low', tierFromScore(20) === 'low'],
  ['criterionStatuses null (prompt no longer asks for them)', parsed.criterionStatuses === null],
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
