'use client';

import React, { useState } from 'react';
import { AppState, type Answer, type DynamicQuestion } from '../types';
import { QUESTIONS } from '../constants';
import { useContent } from '../contexts/ContentContext';
import { WelcomeScreen } from './WelcomeScreen';
import { Quiz } from './Quiz';
import { Results } from './Results';
import { FullResults } from './FullResults';
import { generateStrategicAnalysis } from '../services/aiService';

export const AuditTool: React.FC = () => {
  const { language } = useContent();
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const [analysis, setAnalysis] = useState<string>('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const quizQuestions: DynamicQuestion[] = QUESTIONS.map(q => ({ ...q, source: 'static' as const }));

  const handleStart = () => {
    setAnswers([]);
    setAnalysis('');
    setAnalysisError(null);
    setAppState(AppState.QUIZ);
  };

  const handleQuizComplete = (completedAnswers: Answer[]) => {
    setAnswers(completedAnswers);
    setAppState(AppState.SCORE);
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysis('');
    generateStrategicAnalysis(completedAnswers, language, null)
      .then(result => setAnalysis(result))
      .catch(err => {
        console.error('[AuditTool] Strategic analysis failed:', err);
        setAnalysisError('FAILED');
      })
      .finally(() => setAnalysisLoading(false));
  };

  const handleReset = () => {
    setAppState(AppState.WELCOME);
    setAnswers([]);
    setAnalysis('');
    setAnalysisLoading(false);
    setAnalysisError(null);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {appState === AppState.WELCOME && <WelcomeScreen onStart={handleStart} />}
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
          questions={quizQuestions}
          answers={answers}
          analysis={analysis}
          analysisLoading={analysisLoading}
          analysisError={analysisError}
          siteUrl={null}
          onReset={handleReset}
        />
      )}
    </div>
  );
};
