export type Language = 'en' | 'it' | 'es' | 'pl';

export type QuestionCategory =
  | 'Direct Booking'
  | 'Metasearch'
  | 'Analytics'
  | 'CRM'
  | 'SEO & AI Search';

export interface QuestionContent {
  text: string;
  subtext: string;
}

export interface Question {
  id: number;
  translations: Record<Language, QuestionContent>;
  category: QuestionCategory;
  weight: number;
}

export interface DynamicQuestion extends Question {
  source: 'static' | 'ai';
}

export enum AnswerValue {
  YES = 'YES',
  NO = 'NO'
}

export interface Answer {
  questionId: number;
  value: AnswerValue;
}

export interface AnalysisResult {
  score: number;
  rating: string;
  summary: string;
  recommendations: string[];
}

export enum AppState {
  WELCOME = 'WELCOME',
  QUIZ = 'QUIZ',
  SCORE = 'SCORE',
  FULL_RESULTS = 'FULL_RESULTS'
}
