'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, ShieldCheck, AlertCircle, Loader2, LogOut, ArrowRight, ClipboardCheck, Sparkles } from 'lucide-react';
import {
  storeStaffToken,
  clearStaffToken,
  checkStaffBypass,
  getStoredExpiresAt,
} from '../../lib/staffBypass';

type Status = 'checking' | 'signed_out' | 'signed_in';

export function StaffHub() {
  const [status, setStatus] = useState<Status>('checking');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await checkStaffBypass();
      if (cancelled) return;
      if (ok) {
        setExpiresAt(getStoredExpiresAt());
        setStatus('signed_in');
      } else {
        setStatus('signed_out');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/staff/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.status === 401) {
        setError('Invalid password.');
        setPassword('');
        return;
      }
      if (res.status === 429) {
        const body = await res.json().catch(() => ({}));
        const mins = body.retryAfter ? Math.ceil(body.retryAfter / 60) : 15;
        setError(`Too many attempts. Wait about ${mins} minute${mins === 1 ? '' : 's'} and try again.`);
        return;
      }
      if (!res.ok) {
        setError('Sign-in failed. Try again in a moment.');
        return;
      }
      const data = (await res.json()) as { token: string; expiresAt: number };
      storeStaffToken(data.token, data.expiresAt);
      setExpiresAt(data.expiresAt);
      setPassword('');
      setStatus('signed_in');
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = () => {
    clearStaffToken();
    setStatus('signed_out');
    setExpiresAt(null);
  };

  if (status === 'checking') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      </div>
    );
  }

  if (status === 'signed_out') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-brand-blue text-white p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 mx-auto mb-4 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Staff Access</h1>
            <p className="text-blue-100 text-sm mt-2 opacity-80">
              Bookassist staff only. Sign in to run audits without the lead-capture form.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div>
              <label htmlFor="staff-password" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Password
              </label>
              <input
                id="staff-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={submitting}
                className="w-full px-4 py-3 text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent disabled:opacity-50"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'staff-password-error' : undefined}
              />
            </div>

            {error && (
              <div
                id="staff-password-error"
                className="flex items-start gap-2 text-sm text-brand-accent bg-rose-50 border border-rose-200 rounded-lg p-3"
              >
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !password}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-blue text-white font-bold rounded-xl py-3 px-6 shadow-lg hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  const expiresLabel = expiresAt ? new Date(expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow text-gray-900 text-xs font-bold uppercase tracking-widest shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            Signed in as Bookassist staff
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-accent transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">Run an audit</h1>
        <p className="text-gray-500 mb-8">
          Lead-capture form is bypassed.
          {expiresLabel ? ` This session expires on ${expiresLabel}.` : ''}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/hotel-audit"
            className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-brand-blue transition-all p-6"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center mb-4">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Hotel Tech Audit</h2>
            <p className="text-sm text-gray-500 mb-4">15-question quiz. Strategic AI analysis. PDF export.</p>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-blue group-hover:gap-2 transition-all">
              Open <ArrowRight size={14} />
            </span>
          </Link>

          <Link
            href="/ai-visibility-audit"
            className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-brand-blue transition-all p-6"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">AI Visibility Audit</h2>
            <p className="text-sm text-gray-500 mb-4">URL-based audit. Gemini AI Readiness report.</p>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-blue group-hover:gap-2 transition-all">
              Open <ArrowRight size={14} />
            </span>
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-8 text-center">
          The bypass is per-browser. Use a private window if you want to test the public flow with the lead-capture gate.
        </p>
      </div>
    </div>
  );
}
