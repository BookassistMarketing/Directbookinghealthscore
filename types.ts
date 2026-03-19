export type Language = 'en' | 'it' | 'es';

export interface QuestionContent {
  text: string;
  subtext: string;
}

export interface Question {
  id: number;
  translations: Record<Language, QuestionContent>;
  category: 'Direct Booking' | 'Metasearch' | 'Analytics' | 'CRM';
  weight: number;
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
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS'
}