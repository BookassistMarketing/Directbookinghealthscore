'use client';

import React, { useEffect, useState } from 'react';
import { AppState, type Answer, type DynamicQuestion } from '../types';
import { QUESTIONS } from '../constants';
import { useContent } from '../contexts/ContentContext';
import { WelcomeScreen } from './WelcomeScreen';
import { UrlInputStep } from './UrlInputStep';
import { AnalysingSite } from './AnalysingSite';
import { Quiz } from './Quiz';
import { Results } from './Results';
import { FullResults } from './FullResults';
import { submitAssessment } from '../services/apiService';
import { generateSiteQuestions, type AIQuestion } from '../services/aiService';

const MAX_URL_FAILURES = 3;

function aiToDynamic(q: AIQuestion, index: number): DynamicQuestion {
  return {
    id: 1000 + index, // high ID space to avoid collision with static 1..15
    category: q.category,
    weight: q.weight,
    translations: {
      en: { text: q.text, subtext: q.subtext },
      it: { text: q.text, subtext: q.subtext },
      es: { text: q.text, subtext: q.subtext },
      pl: { text: q.text, subtext: q.subtext },
    },
    source: 'ai',
  };
}

export const AuditTool: React.FC = () => {
  const { language } = useContent();
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [siteUrl, setSiteUrl] = useState<string | null>(null);
  const [aiQuestions, setAiQuestions] = useState<DynamicQuestion[]>([]);
  const [failureCount, setFailureCount] = useState(0);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [fallbackToastShown, setFallbackToastShown] = useState(false);

  const [analysis, setAnalysis] = useState<string>('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const staticQuestions: DynamicQuestion[] = QUESTIONS.map(q => ({ ...q, source: 'static' as const }));
  const quizQuestions: DynamicQuestion[] = [...aiQuestions, ...staticQuestions];

  const handleStart = () => {
    setAnswers([]);
    setAiQuestions([]);
    setFailureCount(0);
    setUrlError(null);
    setFallbackToastShown(false);
    setSiteUrl(null);
    setAnalysis('');
    setAnalysisError(null);
    setAppState(AppState.URL_INPUT);
  };

  const handleUrlSubmit = async (url: string) => {
    setSiteUrl(url);
    setUrlError(null);
    setAppState(AppState.ANALYSING_SITE);

    try {
      const aiQs = await generateSiteQuestions(url, language);
      const dyn = aiQs.map((q, i) => aiToDynamic(q, i));
      setAiQuestions(dyn);
      setAppState(AppState.QUIZ);
    } catch {
      const nextCount = failureCount + 1;
      setFailureCount(nextCount);

      if (nextCount >= MAX_URL_FAILURES) {
        setFallbackToastShown(true);
        setAiQuestions([]);
        setAppState(AppState.QUIZ);
      } else {
        const errMsg = {
          en: "We couldn't analyse that URL. Please try another.",
          it: 'Non siamo riusciti ad analizzare questo URL. Prova un altro.',
          es: 'No pudimos analizar esa URL. Prueba con otra.',
          pl: 'Nie udało nam się przeanalizować tego URL. Spróbuj innego.',
        }[language];
        setUrlError(errMsg);
        setAppState(AppState.URL_INPUT);
      }
    }
  };

  const handleSkipToStatic = () => {
    setAiQuestions([]);
    setFallbackToastShown(true);
    setAppState(AppState.QUIZ);
  };

  const handleQuizComplete = (completedAnswers: Answer[]) => {
    setAnswers(completedAnswers);
    setAppState(AppState.SCORE);
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysis('');
    submitAssessment(completedAnswers, language, siteUrl)
      .then(result => setAnalysis(result))
      .catch(() => setAnalysisError('FAILED'))
      .finally(() => setAnalysisLoading(false));
  };

  const handleReset = () => {
    setAppState(AppState.WELCOME);
    setAnswers([]);
    setAiQuestions([]);
    setSiteUrl(null);
    setFailureCount(0);
    setUrlError(null);
    setFallbackToastShown(false);
    setAnalysis('');
    setAnalysisLoading(false);
    setAnalysisError(null);
  };

  useEffect(() => {
    if (fallbackToastShown && appState === AppState.QUIZ) {
      const t = setTimeout(() => setFallbackToastShown(false), 6000);
      return () => clearTimeout(t);
    }
  }, [fallbackToastShown, appState]);

  const toastCopy = {
    en: "We couldn't analyse your site — continuing with the standard audit.",
    it: "Non siamo riusciti ad analizzare il tuo sito — continuiamo con l'audit standard.",
    es: 'No pudimos analizar tu sitio — continuando con la auditoría estándar.',
    pl: 'Nie udało nam się przeanalizować Twojej strony — kontynuujemy audyt standardowy.',
  }[language];

  return (
    <div className="w-full flex flex-col items-center">
      {fallbackToastShown && appState === AppState.QUIZ && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-xl text-sm max-w-md text-center">
          {toastCopy}
        </div>
      )}

      {appState === AppState.WELCOME && <WelcomeScreen onStart={handleStart} />}
      {appState === AppState.URL_INPUT && (
        <UrlInputStep
          onSubmit={handleUrlSubmit}
          onSkipToStatic={handleSkipToStatic}
          failureCount={failureCount}
          errorMessage={urlError}
        />
      )}
      {appState === AppState.ANALYSING_SITE && <AnalysingSite />}
      {appState === AppState.QUIZ && <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />}
      {appState === AppState.SCORE && (
        <Results
          questions={quizQuestions}
          answers={answers}
          onReset={handleReset}
          onGetFullReport={() => setAppState(AppState.FULL_RESULTS)}
        />
      )}
      {appState === AppState.FULL_RESULTS && (
        <FullResults
          answers={answers}
          analysis={analysis}
          analysisLoading={analysisLoading}
          analysisError={analysisError}
          siteUrl={siteUrl}
          onReset={handleReset}
        />
      )}
    </div>
  );
};
