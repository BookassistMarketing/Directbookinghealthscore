import { GoogleGenAI } from "@google/genai";
import { Answer, AnswerValue, Language } from '../types';
import { QUESTIONS, CATEGORY_TRANSLATIONS } from '../constants';

// Blog translation cache
const translationCache: Record<string, { title: string; excerpt: string; body: string }> = {};

export const translateBlogContent = async (
  slug: string,
  title: string,
  excerpt: string,
  body: string,
  targetLang: Language
): Promise<{ title: string; excerpt: string; body: string }> => {
  if (targetLang === 'en') {
    return { title, excerpt, body };
  }

  const cacheKey = `${slug}-${targetLang}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  // Check localStorage cache
  const stored = localStorage.getItem(`blog-translation-${cacheKey}`);
  if (stored) {
    const parsed = JSON.parse(stored);
    translationCache[cacheKey] = parsed;
    return parsed;
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return { title, excerpt, body };
  }

  const ai = new GoogleGenAI({ apiKey });
  const langNames: Record<Language, string> = { en: 'English', it: 'Italian', es: 'Spanish' };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Translate the following blog post to ${langNames[targetLang]}. Return ONLY a JSON object with keys "title", "excerpt", and "body". Preserve all Markdown formatting in the body.

TITLE: ${title}

EXCERPT: ${excerpt}

BODY:
${body}`,
      config: {
        systemInstruction: `You are a professional translator specializing in hotel industry content. Translate naturally while preserving:
- All Markdown formatting (##, **, *, ---, etc.)
- Technical terms related to hotels and OTAs
- The professional, authoritative tone
- All numbers, percentages, and currency values exactly as they appear

Return ONLY valid JSON with keys: title, excerpt, body. No additional text or explanation.`,
      },
    });

    if (!response.text) {
      return { title, excerpt, body };
    }

    // Parse the JSON response
    let translated: { title: string; excerpt: string; body: string };
    try {
      // Clean up the response - remove markdown code blocks if present
      let jsonStr = response.text.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      translated = JSON.parse(jsonStr.trim());
    } catch {
      return { title, excerpt, body };
    }

    // Cache the translation
    translationCache[cacheKey] = translated;
    localStorage.setItem(`blog-translation-${cacheKey}`, JSON.stringify(translated));

    return translated;
  } catch {
    return { title, excerpt, body };
  }
};

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

export const generateStrategicAnalysis = async (answers: Answer[], lang: Language, attempt: number = 1): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
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

  const langNames = { en: 'English', it: 'Italian', es: 'Spanish' };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Perform a digital health diagnosis for a hotel that scored ${scorePercent}% in their technical audit. Technical gaps identified:\n${gapsList}`,
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
      return generateStrategicAnalysis(answers, lang, attempt + 1);
    }
    throw error;
  }
};
