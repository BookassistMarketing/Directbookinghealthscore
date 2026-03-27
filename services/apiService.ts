import { Answer, AnswerValue, Language } from '../types';
import { QUESTIONS, MAX_SCORE } from '../constants';

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

function getMockAnalysis(scorePercent: number): string {
  if (scorePercent <= 25) return MOCK_ANALYSIS_CRITICAL;
  if (scorePercent <= 50) return MOCK_ANALYSIS_HIGH_RISK;
  if (scorePercent <= 75) return MOCK_ANALYSIS_MODERATE;
  return MOCK_ANALYSIS_STRONG;
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

  const scorePercent = Math.round((scoreRaw / MAX_SCORE) * 100);

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
export async function submitAssessment(answers: Answer[], lang: Language): Promise<string> {
  const geolocation = await detectGeolocation();
  const payload = buildPayload(answers, lang, geolocation);

  if (USE_MOCK) {
    // Simulate realistic API latency
    await new Promise(r => setTimeout(r, 1200));
    console.log('[apiService] Mock mode — payload that would be sent to backend:', payload);
    return getMockAnalysis(payload.scorePercent);
  }

  const res = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
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
