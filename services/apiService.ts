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

Your Digital Health Score places your property in the **bottom quartile** of direct booking readiness. This is not a marginal underperformance — it is a structural revenue crisis that is actively transferring margin to OTAs on every booking your hotel generates.

### What This Score Means in Practice

At this level, the majority of your bookings are being captured by third-party channels. You are paying commissions of **18–25% per reservation** on revenue that should be flowing directly to your property. Across a full trading year, this represents a significant and entirely recoverable loss of net profit.

### Primary Failure Points

- **No high-intent direct capture mechanism:** Your property lacks the technical infrastructure to intercept guests at the moment of booking intent. Without a conversion-optimised booking engine and rate parity enforcement, OTAs will always win that transaction.

- **Metasearch invisibility:** Google Hotel Ads, Trivago, and Kayak aggregate millions of price-comparison searches daily. Properties not actively bidding in these channels are handing high-converting traffic directly to OTA listings. This traffic does not return — once a guest books via an OTA, they are registered in that OTA's loyalty ecosystem, not yours.

- **No CRM or guest data ownership:** Without a direct relationship infrastructure, you have no ability to market to past guests, drive repeat bookings, or reduce acquisition cost over time. Every new guest is effectively acquired from scratch, at full OTA commission.

- **Analytics blind spots:** Without visibility into channel performance, booking window data, and conversion funnels, commercial decisions are being made without evidence. This compounds every other vulnerability.

### Revenue Impact Estimate

Properties in this bracket typically recover **12–20% of annual revenue** when full direct booking infrastructure is deployed. The intervention is not cosmetic — it is a structural correction with a measurable return within the first trading year.

---
*Bookassist Digital Health Strategist — Algorithmic Assessment*`;

const MOCK_ANALYSIS_HIGH_RISK = `## Strategic Assessment: High Revenue Leakage Detected

Your Digital Health Score indicates that your property has partial infrastructure in place, but critical gaps remain across multiple revenue categories. You are capturing some direct business — but you are losing a substantial share to OTAs that could and should be retained.

### What This Score Means in Practice

Properties in this bracket are in a transitional state. Some of the building blocks exist, but they are either not fully deployed, not optimised, or not working together as an integrated system. The result is that OTAs continue to absorb a disproportionate share of your bookings — and the commissions that come with them.

### Key Gaps Identified

- **Booking engine underperformance:** A booking engine exists, but conversion rates suggest it is not optimised for mobile, not presenting compelling rate differentiation, or not integrated with a rate intelligence tool that ensures you are always competitive against your own OTA listings.

- **Incomplete metasearch presence:** Partial metasearch activity leaves significant gaps in your price-comparison visibility. Guests who search on Google Hotel Ads and find no direct option — or a slower, less compelling one — will default to the OTA result. Each of those bookings carries a commission that erodes your RevPAR.

- **CRM gaps:** Guest data is likely being collected inconsistently, or not being activated for remarketing. Repeat guests are one of the highest-margin booking segments available to any hotel — without a CRM strategy, this segment is underserved.

### The Commercial Opportunity

Closing the gaps identified in your audit would move your property from reactive OTA dependency to a proactive direct booking strategy. The revenue uplift at this stage is typically **8–15% of annual turnover** — recoverable through targeted technology deployment and channel optimisation.

---
*Bookassist Digital Health Strategist — Algorithmic Assessment*`;

const MOCK_ANALYSIS_MODERATE = `## Strategic Assessment: Moderate Performance — Optimisation Required

Your Digital Health Score reflects a property with solid direct booking foundations but identifiable gaps that are suppressing performance. You are ahead of many competitors in your infrastructure maturity — but you are leaving measurable revenue on the table through incomplete deployment and optimisation.

### What This Score Means in Practice

At this level, you have made meaningful investments in direct booking technology. The core systems are in place. However, the audit has identified specific areas where those systems are either not fully integrated, not actively managed, or not performing at the level required to maximise direct revenue share.

### Areas Requiring Attention

- **Rate intelligence and parity management:** Having a booking engine is only part of the equation. If your direct rates are not consistently competitive — or if rate parity is being eroded by OTA promotions — guests will still choose the OTA path even when they find you directly. Automated rate intelligence closes this gap.

- **Metasearch optimisation:** Your metasearch presence may exist, but bid strategy, campaign structure, and return on ad spend require active management. An underperforming metasearch campaign can cost more than it returns if not properly optimised.

- **Guest data activation:** CRM infrastructure may be in place, but the question is whether guest data is being actively used to drive pre-arrival upselling, post-stay remarketing, and loyalty incentives. These touchpoints represent low-cost, high-margin revenue opportunities that are frequently underdeveloped.

### The Path Forward

The gap between your current performance and full optimisation is narrower than it is for lower-scoring properties — but the revenue available is still significant. Properties that close these specific gaps typically see a **5–10% improvement in direct revenue share** within two to three trading quarters.

---
*Bookassist Digital Health Strategist — Algorithmic Assessment*`;

const MOCK_ANALYSIS_STRONG = `## Strategic Assessment: Strong Foundation — Competitive Refinement Advised

Your Digital Health Score places your property in the top tier of direct booking readiness. Your technical infrastructure is well-developed and your approach to direct revenue management is more sophisticated than the majority of independent hotels. This is a strong commercial position — but it is not a static one.

### What This Score Means in Practice

High-scoring properties have typically made deliberate investments in booking technology, metasearch presence, and guest data strategy. The risks at this level are different in nature: not structural failure, but competitive erosion over time if systems are not actively maintained, updated, and benchmarked against a market that is continuously evolving.

### Fine-Tuning Opportunities

- **Booking engine conversion rate:** Even well-configured booking engines have conversion rate optimisation headroom. A/B testing of rate presentation, room type ordering, upsell sequencing, and mobile UX can yield incremental gains that compound meaningfully at scale.

- **Metasearch bid strategy:** At high performance levels, the focus shifts from presence to efficiency. Ensuring that your cost-per-acquisition across metasearch channels is optimised — and that budget allocation responds dynamically to demand signals — is the difference between good and best-in-class.

- **CRM and loyalty depth:** Strong performers often have CRM in place but have not fully activated segmented communication strategies, pre-arrival personalisation, or structured loyalty incentives. These are the tools that convert one-time direct bookers into repeat guests — the highest-margin segment in any hotel's revenue mix.

### Maintaining Your Position

The direct booking landscape is not static. OTAs continue to invest heavily in guest acquisition and loyalty programmes. Sustaining a high Health Score requires ongoing investment in technology, strategy, and channel management. The properties that maintain this level of performance treat direct booking as a commercial discipline, not a one-time project.

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
