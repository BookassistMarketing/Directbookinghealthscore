import { GoogleGenAI } from "@google/genai";
import { Answer, AnswerValue, Language } from '../types';
import { QUESTIONS, CATEGORY_TRANSLATIONS } from '../constants';

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
