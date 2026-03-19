import React, { useState } from 'react';
import { AppState, Answer } from '../types';
import { WelcomeScreen } from './WelcomeScreen';
import { Quiz } from './Quiz';
import { Results } from './Results';

export const AuditTool: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const handleStart = () => {
    setAppState(AppState.QUIZ);
  };

  const handleComplete = (completedAnswers: Answer[]) => {
    setAnswers(completedAnswers);
    setAppState(AppState.RESULTS);
  };

  const handleReset = () => {
    setAnswers([]);
    setAppState(AppState.WELCOME);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {appState === AppState.WELCOME && <WelcomeScreen onStart={handleStart} />}
      {appState === AppState.QUIZ && <Quiz onComplete={handleComplete} />}
      {appState === AppState.RESULTS && <Results answers={answers} onReset={handleReset} />}
    </div>
  );
};