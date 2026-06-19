'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppState, AnswerValue, type Answer, type DynamicQuestion } from '../types';
import { QUESTIONS } from '../constants';
import { useContent } from '../contexts/ContentContext';
import { WelcomeScreen } from './WelcomeScreen';
import { Quiz } from './Quiz';
import { FullResults } from './FullResults';
import { ConsentModal, ConsentDeclinedScreen } from './ConsentModal';
import { generateStrategicAnalysis } from '../services/aiService';

const CONSENT_KEY = 'hhc_gemini_consent';

// Local-dev escape hatch: show a "Preview full results with sample data"
// link on the WELCOME screen so the Tech Audit results layout can be
// iterated without running the 15-question quiz or burning a Gemini call.
// Production builds inline `false` here so this never ships to users.
const IS_DEV_PREVIEW = process.env.NODE_ENV !== 'production';

// Fixture used by the preview link. Mix of YES/NO answers chosen so the
// computed Tech Score lands in the middle "Digital Risk" tier (amber) —
// exercises the full visual treatment without bias toward extremes.
const DEMO_ANSWERS: Answer[] = [
  { questionId: 1, value: AnswerValue.YES },
  { questionId: 2, value: AnswerValue.NO },
  { questionId: 3, value: AnswerValue.YES },
  { questionId: 4, value: AnswerValue.NO },
  { questionId: 5, value: AnswerValue.NO },
  { questionId: 6, value: AnswerValue.NO },
  { questionId: 7, value: AnswerValue.YES },
  { questionId: 8, value: AnswerValue.YES },
  { questionId: 9, value: AnswerValue.YES },
  { questionId: 10, value: AnswerValue.NO },
  { questionId: 11, value: AnswerValue.YES },
  { questionId: 12, value: AnswerValue.YES },
  { questionId: 13, value: AnswerValue.NO },
  { questionId: 14, value: AnswerValue.YES },
  { questionId: 15, value: AnswerValue.YES },
];

// Sample analysis in the same shape Gemini emits via the
// "Bookassist Digital Health Strategist" prompt (H2 headline, ### Critical
// Gaps, ### Financial Exposure, italic footer). Used so the FullResults
// markdown article renders meaningfully in the preview.
const DEMO_ANALYSIS = `## Tech Score reveals significant revenue leakage

Your hotel is missing high-impact automations that quietly reroute high-margin demand toward commission-heavy channels every month.

### Critical Gaps

- **Missing Brand Protection PPC**: OTAs are intercepting brand-name searches and reselling your own demand back to you at 15–25% commission per booking.
- **No CPA-guaranteed Metasearch**: Standard CPC spending wastes budget on clicks that never convert, eroding ROI across every Google Hotel Ads and Trivago impression.

### Financial Exposure

Left unresolved, these gaps typically translate to an estimated 18–22% of total room revenue routed through OTA channels at full commission — a five- to six-figure annual margin loss for a property of your size.

---

*Contact a Bookassist strategist for a tailored direct revenue recovery plan.*`;

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
    // Skip the interim SCORE reveal — the harmonised FullResults view shows
    // the score card alongside the strategic assessment, so the extra step
    // is redundant. FullResults handles the analysisLoading state itself.
    setAppState(AppState.FULL_RESULTS);
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

  // Dev-only shortcut: skip the quiz + Gemini call and jump straight to the
  // FullResults view using the static fixture above. Useful for iterating
  // on rendering and PDF output without spending Gemini credits.
  const loadDemoFullResults = () => {
    setAnswers(DEMO_ANSWERS);
    setAnalysis(DEMO_ANALYSIS);
    setAnalysisLoading(false);
    setAnalysisError(null);
    setAppState(AppState.FULL_RESULTS);
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
      {appState === AppState.WELCOME && (
        <>
          <WelcomeScreen onStart={handleStart} />
          {IS_DEV_PREVIEW && (
            <button
              type="button"
              onClick={loadDemoFullResults}
              className="mt-6 text-xs font-bold uppercase tracking-widest text-brand-blue hover:underline"
            >
              Preview full results with sample data (no Gemini call)
            </button>
          )}
        </>
      )}
      {appState === AppState.QUIZ && <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />}
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
