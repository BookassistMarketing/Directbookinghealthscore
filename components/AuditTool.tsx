'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppState, AnswerValue, type Answer, type DynamicQuestion, type Language } from '../types';
import { QUESTIONS } from '../constants';
import { useContent } from '../contexts/ContentContext';
import { WelcomeScreen } from './WelcomeScreen';
import { Quiz } from './Quiz';
import { FullResults } from './FullResults';
import { ConsentModal, ConsentDeclinedScreen } from './ConsentModal';
import { generateStrategicAnalysis } from '../services/aiService';
import { checkStaffBypass, type StaffRole } from '../lib/staffBypass';
import { DEMO_ANALYSES } from '../lib/techAuditDemoAnalysis';

// Staff-only picker label — lets a Bookassist user run the Tech Audit in a
// language different from the UI locale they're browsing. Public visitors
// never see this control.
const reportLangPickerLabel: Record<Language, string> = {
  en: 'Generate report in',
  it: 'Genera report in',
  es: 'Generar informe en',
  pl: 'Generuj raport w',
  fr: 'Générer le rapport en',
  de: 'Bericht erstellen auf',
  cs: 'Vygenerovat report v',
};

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

  const [staffRole, setStaffRole] = useState<StaffRole | null>(null);
  const isStaffBypass = staffRole !== null;
  const isMarketing = staffRole === 'marketing';

  // Staff picker — defaults to the UI locale at mount and persists across
  // demo loads / quiz runs in this session. Public visitors never see the
  // control and always get language = UI locale.
  const [reportLang, setReportLang] = useState<Language>(language);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setConsentAccepted(sessionStorage.getItem(CONSENT_KEY) === 'accepted');
    setConsentChecked(true);
    void checkStaffBypass().then(role => setStaffRole(role));
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
    generateStrategicAnalysis(completedAnswers, reportLang, null)
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
    setAnalysis(DEMO_ANALYSES[reportLang] ?? DEMO_ANALYSES.en);
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
          {isStaffBypass && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm">
              <label htmlFor="tech-audit-report-lang" className="text-gray-500 font-medium">
                {reportLangPickerLabel[language]}:
              </label>
              <select
                id="tech-audit-report-lang"
                value={reportLang}
                onChange={e => setReportLang(e.target.value as Language)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="en">English</option>
                <option value="it">Italiano</option>
                <option value="es">Español</option>
                <option value="pl">Polski</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="cs">Čeština</option>
              </select>
            </div>
          )}
          {(isMarketing || IS_DEV_PREVIEW) && (
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
          reportLang={reportLang}
        />
      )}
    </div>
  );
};
