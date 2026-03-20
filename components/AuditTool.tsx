import React, { useState } from 'react';
import { AppState, Answer } from '../types';
import { WelcomeScreen } from './WelcomeScreen';
import { Quiz } from './Quiz';
import { Results } from './Results';
import { FullResults } from './FullResults';
import { generateStrategicAnalysis } from '../services/geminiService';
import { useContent } from '../contexts/ContentContext';

export const AuditTool: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const { language } = useContent();

  const handleComplete = (completedAnswers: Answer[]) => {
    setAnswers(completedAnswers);
    setAppState(AppState.SCORE);
    // Start AI generation in background while user reads their score
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysis('');
    generateStrategicAnalysis(completedAnswers, language)
      .then(result => setAnalysis(result))
      .catch(err => setAnalysisError(err.message === 'MISSING_API_KEY' ? 'MISSING_API_KEY' : 'FAILED'))
      .finally(() => setAnalysisLoading(false));
  };

  const handleReset = () => {
    setAnswers([]);
    setAnalysis('');
    setAnalysisLoading(false);
    setAnalysisError(null);
    setAppState(AppState.WELCOME);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {appState === AppState.WELCOME && <WelcomeScreen onStart={() => setAppState(AppState.QUIZ)} />}
      {appState === AppState.QUIZ && <Quiz onComplete={handleComplete} />}
      {appState === AppState.SCORE && (
        <Results
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
          onReset={handleReset}
        />
      )}
    </div>
  );
};
