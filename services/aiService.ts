import type { Language, Answer } from '../types';
import {
  generateSiteQuestions as geminiGenerateSiteQuestions,
  generateStrategicAnalysis as geminiGenerateStrategicAnalysis,
  type AIQuestion,
} from './geminiService';

export type { AIQuestion };

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
