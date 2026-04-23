import { GoogleGenAI } from "@google/genai";
import { Answer, AnswerValue, Language } from '../types';
import { QUESTIONS, CATEGORY_TRANSLATIONS } from '../constants';

export interface AIQuestion {
  text: string;
  subtext: string;
  category: 'SEO & AI Search';
  weight: number;
}

const generateLocalAnalysis = (answers: Answer[], scorePercent: number, lang: Language): string => {
  const localText: Record<Language, any> = {
    en: {
      title: 'Strategic Tech Assessment',
      intro: `Your hotel achieved a Digital Health Score of **${scorePercent}%**.`,
      risk: 'This score indicates significant revenue leakage. Your current technical infrastructure is likely ceding high-margin direct traffic to third-party OTAs.',
      gapsHeader: 'Primary Vulnerabilities Identified:',
      noGaps: 'Your technical foundation is exceptionally strong.',
      footer: 'Note: This is a standard assessment. For a deeper algorithmic analysis, please contact a strategist.'
    },
    it: {
      title: 'Valutazione Strategica Tecnologica',
      intro: `Il tuo hotel ha ottenuto un Digital Health Score del **${scorePercent}%**.`,
      risk: 'Questo punteggio indica una significativa perdita di entrate. La tua attuale infrastruttura tecnica sta probabilmente cedendo traffico diretto ad alto margine alle OTA.',
      gapsHeader: 'Principali Vulnerabilità Identificate:',
      noGaps: 'La tua base tecnica è eccezionalmente solida.',
      footer: 'Nota: Questa è una valutazione standard. Per un\'analisi algoritmica più approfondita, contatta uno stratega.'
    },
    es: {
      title: 'Evaluación Estratégica Tecnológica',
      intro: `Tu hotel logró una puntuación de salud digital del **${scorePercent}%**.`,
      risk: 'Esta puntuación indica una pérdida significativa de ingresos. Tu infraestructura técnica actual probablemente esté cediendo tráfico directo de alto margen a las OTA.',
      gapsHeader: 'Principales Vulnerabilidades Identificadas:',
      noGaps: 'Tu base técnica es excepcionalmente sólida.',
      footer: 'Nota: Esta es una evaluación estándar. Para un análisis algorítmico más profundo, contacta con un estratega.'
    },
    pl: {
      title: 'Strategiczna Ocena Technologiczna',
      intro: `Twój hotel osiągnął Digital Health Score na poziomie **${scorePercent}%**.`,
      risk: 'Ten wynik wskazuje na znaczną utratę przychodów. Twoja obecna infrastruktura techniczna prawdopodobnie oddaje wysokomarżowy ruch bezpośredni zewnętrznym OTA.',
      gapsHeader: 'Zidentyfikowane Kluczowe Luki:',
      noGaps: 'Twoja baza techniczna jest wyjątkowo solidna.',
      footer: 'Uwaga: To jest standardowa ocena. Aby uzyskać głębszą analizę algorytmiczną, skontaktuj się ze strategiem.'
    }
  };

  const t = localText[lang];
  let text = `## ${t.title}\n\n`;
  text += `${t.intro}\n\n`;

  if (scorePercent < 80) {
    text += `${t.risk}\n\n`;
  }

  const negativeAnswers = answers.filter(a => a.value === AnswerValue.NO);

  if (negativeAnswers.length > 0) {
    text += `### ${t.gapsHeader}\n\n`;
    const categories = Array.from(new Set(negativeAnswers.map(a => {
      const q = QUESTIONS.find(q => q.id === a.questionId);
      return q?.category;
    }))).filter(Boolean);

    categories.forEach(cat => {
      const catName = CATEGORY_TRANSLATIONS[cat!]?.[lang] || cat;
      text += `* **${catName}**: Critical failures in automation detected. Failure to optimize this area directly increases commission costs.\n`;
    });
  } else {
    text += `${t.noGaps}\n\n`;
  }

  text += `\n---\n*${t.footer}*`;

  return text;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateStrategicAnalysis = async (answers: Answer[], lang: Language, siteUrl: string | null = null, attempt: number = 1): Promise<string> => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const passedItems = answers.filter(a => a.value === AnswerValue.YES).length;
  const scorePercent = Math.round((passedItems / QUESTIONS.length) * 100);

  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const ai = new GoogleGenAI({ apiKey });

  const gapsList = answers
    .filter(a => a.value === AnswerValue.NO)
    .map(a => {
      const q = QUESTIONS.find(q => q.id === a.questionId);
      return q ? `- GAP: ${q.translations[lang].text} (Category: ${q.category})` : null;
    })
    .filter(Boolean)
    .join('\n');

  const langNames = { en: 'English', it: 'Italian', es: 'Spanish', pl: 'Polish' };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Perform a digital health diagnosis for a hotel that scored ${scorePercent}% in their technical audit. Technical gaps identified:\n${gapsList}${siteUrl ? `\n\nThe hotel's website is: ${siteUrl}. Reference it by name where relevant.` : ''}`,
      config: {
        systemInstruction: `You are the "Bookassist Digital Health Strategist."
        Your tone is clinical, professional, and urgent.
        Focus exclusively on the financial risk of OTA dominance and revenue leakage.

        CONSTRAINTS:
        - Output max 180 words in ${langNames[lang].toUpperCase()}.
        - Use Markdown (headers and bullet points).
        - NEVER use emojis or icons.
        - Identify the 2 most dangerous gaps and explain their direct impact on net profit.
        - Do not include links or greetings. Start directly with the assessment.`,
      },
    });

    if (!response.text) {
        throw new Error('EMPTY_RESPONSE');
    }
    return response.text;
  } catch (error: any) {
    if ((error?.status === 429 || error?.message?.includes('429')) && attempt < 3) {
      await delay(Math.pow(2, attempt) * 1000);
      return generateStrategicAnalysis(answers, lang, siteUrl, attempt + 1);
    }
    throw error;
  }
};

const SITE_QUESTION_SYSTEM_PROMPT = (lang: Language) => {
  const langName = { en: 'English', it: 'Italian', es: 'Spanish', pl: 'Polish' }[lang];
  return `You are a hotel digital-marketing diagnostician specialising in SEO and AI-search (AEO/GEO) readiness. Given a hotel's website URL, analyse its homepage and return EXACTLY 3 yes/no diagnostic questions the hotel operator should answer about their site.

Each question must target a specific gap or risk you identified from the site. Focus areas: meta tags, structured data (JSON-LD), page speed signals, canonical tags, mobile responsiveness, booking-engine visibility to crawlers, freshness of content, FAQ/Q&A blocks, and how cleanly answer engines (ChatGPT, Perplexity, Gemini) can cite the site.

Output a strict JSON array — no commentary, no markdown fences. Shape:
[
  {
    "text": "Is your homepage title tag under 60 characters and does it include your brand + city?",
    "subtext": "Short, branded title tags drive CTR and help AI answer engines cite your site accurately.",
    "category": "SEO & AI Search",
    "weight": 10
  }
]

All text must be in ${langName}. Tone: clinical, professional, concise. No emojis, no links. "category" MUST be the literal string "SEO & AI Search". "weight" MUST be 10.`;
};

export async function generateSiteQuestions(
  url: string,
  lang: Language,
  attempt = 1
): Promise<AIQuestion[]> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Analyse this hotel site and generate the 3 questions: ${url}`,
      config: {
        systemInstruction: SITE_QUESTION_SYSTEM_PROMPT(lang),
        tools: [{ urlContext: {} }],
      },
    });

    const text = response.text?.trim() ?? '';
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('AI returned invalid question list');
    }

    return parsed.slice(0, 3).map((q: AIQuestion) => ({
      text: String(q.text ?? ''),
      subtext: String(q.subtext ?? ''),
      category: 'SEO & AI Search' as const,
      weight: 10,
    }));
  } catch (error: any) {
    if ((error?.status === 429 || error?.message?.includes('429')) && attempt < 3) {
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      return generateSiteQuestions(url, lang, attempt + 1);
    }
    throw error;
  }
}
