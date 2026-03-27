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

// ─── Mock Response ────────────────────────────────────────────────────────────
const MOCK_ANALYSIS = `## Strategic Technology Assessment

Your hotel's Digital Health Score reveals **critical vulnerabilities** in direct revenue capture.

### Primary Risk Vectors

- **Booking Engine Deficiency:** Without a high-converting, mobile-optimised booking engine, your rate parity strategy is structurally compromised. Each OTA booking carries a 15–25% commission load that compounds across your annual revenue base.

- **Metasearch Absence:** Hotels not active on Google Hotel Ads and Trivago lose an estimated 30–40% of high-intent direct traffic to competitors. This traffic converts at 3× the rate of organic search — its absence is a measurable net profit loss.

### Recommended Intervention

Immediate deployment of automated rate intelligence and a metasearch bidding strategy is advised. Without these two infrastructure components, OTA dependency will continue to erode your net RevPAR.

---
*Bookassist Digital Health Strategist — Algorithmic Assessment*`;

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
    return MOCK_ANALYSIS;
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
