import type { Language, Answer } from '../types';
import {
  generateSiteQuestions as geminiGenerateSiteQuestions,
  generateStrategicAnalysis as geminiGenerateStrategicAnalysis,
} from './geminiService';

export interface AIQuestion {
  text: string;
  subtext: string;
  category: 'SEO & AI Search';
  weight: number;
}

export function generateSiteQuestions(url: string, lang: Language): Promise<AIQuestion[]> {
  return geminiGenerateSiteQuestions(url, lang);
}

export function generateStrategicAnalysis(
  answers: Answer[],
  lang: Language,
  siteUrl: string | null = null
): Promise<string> {
  return geminiGenerateStrategicAnalysis(answers, lang, siteUrl);
}
