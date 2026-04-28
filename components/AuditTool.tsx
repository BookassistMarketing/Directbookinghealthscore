'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppState, type Answer, type DynamicQuestion } from '../types';
import { QUESTIONS } from '../constants';
import { useContent } from '../contexts/ContentContext';
import { WelcomeScreen } from './WelcomeScreen';
import { Quiz } from './Quiz';
import { Results } from './Results';
import { FullResults } from './FullResults';
import { ConsentModal, ConsentDeclinedScreen } from './ConsentModal';
import { generateStrategicAnalysis } from '../services/aiService';

const CONSENT_KEY = 'hhc_gemini_consent';

export const AuditTool: React.FC = () => {
  const { language } = useContent();
  const router = useRouter();
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [consentDeclined, setConsentDeclined] = useState(false);

  const [analysis, setAnalysis] = useState<string>('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setConsentAccepted(sessionStorage.getItem(CONSENT_KEY) === 'accepted');
    setConsentChecked(true);
  }, []);

  const handleConsentAccept = () => {
    if (typeof window !== 'undefined') sessionStorage.setItem(CONSENT_KEY, 'accepted');
    setConsentAccepted(true);
  };
  const handleConsentDecline = () => setConsentDeclined(true);
  const handleConsentReconsider = () => setConsentDeclined(false);
  const handleConsentGoHome = () => router.push('/');

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

  if (consentDeclined) {
    return (
      <ConsentDeclinedScreen
        onReconsider={handleConsentReconsider}
        onGoHome={handleConsentGoHome}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {consentChecked && !consentAccepted && (
        <ConsentModal onAccept={handleConsentAccept} onDecline={handleConsentDecline} />
      )}
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
