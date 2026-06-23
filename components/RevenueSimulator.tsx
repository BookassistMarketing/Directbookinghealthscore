'use client';

import React, { useMemo, useState } from 'react';

const DEFAULTS = {
  gross: 5_000_000,
  cur: 40,
  tgt: 60,
  ota: 18,
  dirCom: 2.15,
  mkt: 2.8,
  svc: 2800,
};

const INDUSTRY_BENCHMARK_CPA = 13; // % — Bookassist managed-client target

const fmtEUR = (n: number) =>
  '€' + Math.round(Math.abs(n)).toLocaleString('en-IE');
const fmtSignedEUR = (n: number) => (n < 0 ? '-' : '+') + fmtEUR(n);

function metrics(
  gross: number,
  sharePct: number,
  otaPct: number,
  dirComPct: number,
  mktPct: number,
  svcFees: number,
) {
  const directShare = sharePct / 100;
  const otaShare = (100 - sharePct) / 100;
  const directRev = gross * directShare;
  const otaRev = gross * otaShare;
  const dirCommissionCost = directRev * (dirComPct / 100);
  const mktSpend = directRev * (mktPct / 100);
  const directCost = dirCommissionCost + mktSpend + svcFees;
  const otaCost = otaRev * (otaPct / 100);
  const totalCost = directCost + otaCost;
  const netRevenue = gross - totalCost;
  const totalCPA = gross > 0 ? (totalCost / gross) * 100 : 0;
  return {
    directRev,
    otaRev,
    dirCommissionCost,
    mktSpend,
    svcFees,
    directCost,
    otaCost,
    totalCost,
    netRevenue,
    totalCPA,
  };
}

export const RevenueSimulator: React.FC = () => {
  const [gross, setGross] = useState(DEFAULTS.gross);
  const [cur, setCur] = useState(DEFAULTS.cur);
  const [tgt, setTgt] = useState(DEFAULTS.tgt);
  const [otaPct, setOtaPct] = useState(DEFAULTS.ota);
  const [dirCom, setDirCom] = useState(DEFAULTS.dirCom);
  const [mktPct, setMktPct] = useState(DEFAULTS.mkt);
  const [svcFees, setSvcFees] = useState(DEFAULTS.svc);

  const current = useMemo(
    () => metrics(gross, cur, otaPct, dirCom, mktPct, svcFees),
    [gross, cur, otaPct, dirCom, mktPct, svcFees],
  );
  const target = useMemo(
    () => metrics(gross, tgt, otaPct, dirCom, mktPct, svcFees),
    [gross, tgt, otaPct, dirCom, mktPct, svcFees],
  );

  const uplift = target.netRevenue - current.netRevenue;
  const cpaDeltaPts = target.totalCPA - current.totalCPA;
  const otaSaved = current.otaCost - target.otaCost;
  const mktDelta = target.mktSpend - current.mktSpend;
  const benchmarkNet = gross * (1 - INDUSTRY_BENCHMARK_CPA / 100);
  const benchmarkDiff = target.netRevenue - benchmarkNet;

  const reset = () => {
    setGross(DEFAULTS.gross);
    setCur(DEFAULTS.cur);
    setTgt(DEFAULTS.tgt);
    setOtaPct(DEFAULTS.ota);
    setDirCom(DEFAULTS.dirCom);
    setMktPct(DEFAULTS.mkt);
    setSvcFees(DEFAULTS.svc);
  };

  // Slider track gradient — teal up to thumb, slate after.
  const trackBg = (pct: number) =>
    `linear-gradient(to right, #2A9D8F ${pct}%, #E2E8F0 ${pct}%)`;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <style>{`
        .rs-range { -webkit-appearance: none; appearance: none; background: transparent; width: 100%; }
        .rs-range::-webkit-slider-runnable-track { height: 6px; border-radius: 9999px; }
        .rs-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          height: 22px; width: 22px; border-radius: 9999px;
          background: white; border: 3px solid #003366;
          margin-top: -8px; cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.18);
        }
        .rs-range::-moz-range-track { height: 6px; border-radius: 9999px; }
        .rs-range::-moz-range-thumb {
          height: 22px; width: 22px; border-radius: 9999px;
          background: white; border: 3px solid #003366;
          cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.18);
        }
        .num-tabular { font-variant-numeric: tabular-nums; }
      `}</style>

      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-success/10 text-brand-success text-xs font-bold tracking-wider uppercase mb-4">
          Revenue Simulator
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-brand-blue leading-tight">
          What if your hotel shifted{' '}
          <span className="text-brand-success">more bookings direct?</span>
        </h1>
        <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
          Fill the hotel&apos;s annual figures. Drag the slider to see the net revenue,
          CPA, and OTA commission impact of moving more share to direct.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* INPUTS */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Hotel inputs
            </h2>
            <button
              type="button"
              onClick={reset}
              className="text-xs font-semibold text-slate-500 hover:text-brand-blue underline"
            >
              Reset
            </button>
          </div>

          <div>
            <label
              className="block text-sm font-semibold text-slate-700 mb-1.5"
              htmlFor="rs-gross"
            >
              Total online revenue (€)
            </label>
            <input
              id="rs-gross"
              type="number"
              min={0}
              step={100000}
              value={gross}
              onChange={e => setGross(Math.max(0, +e.target.value || 0))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-lg font-semibold text-brand-blue num-tabular focus:outline-none focus:ring-2 focus:ring-brand-success"
            />
            <div className="text-xs text-slate-400 mt-1">
              Annual gross revenue from all online channels combined.
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label
                className="text-sm font-semibold text-slate-700"
                htmlFor="rs-cur"
              >
                Current direct share
              </label>
              <span className="text-lg font-black text-brand-blue num-tabular">
                {cur}%
              </span>
            </div>
            <input
              id="rs-cur"
              type="range"
              min={0}
              max={100}
              value={cur}
              onChange={e => setCur(+e.target.value)}
              className="rs-range"
              style={{ background: trackBg(cur) }}
            />
          </div>

          <details className="text-xs text-slate-500" open>
            <summary className="cursor-pointer select-none hover:text-brand-blue font-semibold mb-2">
              Channel economics
            </summary>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <label className="flex flex-col justify-end">
                <span className="text-slate-600 font-medium mb-1">OTA commission %</span>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={0.1}
                  value={otaPct}
                  onChange={e => setOtaPct(+e.target.value || 0)}
                  className="w-full rounded border border-slate-300 px-2 py-1.5 num-tabular focus:outline-none focus:ring-2 focus:ring-brand-success"
                />
              </label>
              <label className="flex flex-col justify-end">
                <span className="text-slate-600 font-medium mb-1">
                  Direct booking commission %
                </span>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={0.01}
                  value={dirCom}
                  onChange={e => setDirCom(+e.target.value || 0)}
                  className="w-full rounded border border-slate-300 px-2 py-1.5 num-tabular focus:outline-none focus:ring-2 focus:ring-brand-success"
                />
              </label>
              <label className="flex flex-col justify-end">
                <span className="text-slate-600 font-medium mb-1">Marketing reinvestment %</span>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={0.01}
                  value={mktPct}
                  onChange={e => setMktPct(+e.target.value || 0)}
                  className="w-full rounded border border-slate-300 px-2 py-1.5 num-tabular focus:outline-none focus:ring-2 focus:ring-brand-success"
                />
              </label>
              <label className="flex flex-col justify-end">
                <span className="text-slate-600 font-medium mb-1">Service fees (€)</span>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={svcFees}
                  onChange={e => setSvcFees(Math.max(0, +e.target.value || 0))}
                  className="w-full rounded border border-slate-300 px-2 py-1.5 num-tabular focus:outline-none focus:ring-2 focus:ring-brand-success"
                />
              </label>
            </div>
            <p className="text-slate-400 mt-2 leading-relaxed">
              Defaults reflect typical Bookassist-managed-client figures. OTA commission
              is the blended rate paid to Booking.com / Expedia / etc.
            </p>
          </details>
        </section>

        {/* OUTPUT */}
        <section className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Target direct share
            </h2>
            <span className="text-2xl font-black text-brand-success num-tabular">
              {tgt}%
            </span>
          </div>
          <input
            id="rs-tgt"
            type="range"
            min={0}
            max={100}
            value={tgt}
            onChange={e => setTgt(+e.target.value)}
            className="rs-range mb-2"
            style={{ background: trackBg(tgt) }}
          />
          <div className="flex justify-between text-xs text-slate-400 font-medium mb-6">
            <span>0%</span>
            <span className="text-brand-success">Industry benchmark: 40%+</span>
            <span>100%</span>
          </div>

          {/* Headline — CPA left, net revenue right */}
          <div
            className="rounded-2xl p-5 sm:p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-0 sm:divide-x divide-white/20"
            style={{ background: 'linear-gradient(135deg, #003366 0%, #2A9D8F 100%)' }}
          >
            <div className="sm:pr-6">
              <div className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                New Total CPA
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white num-tabular leading-none">
                {target.totalCPA.toFixed(2)}%
              </div>
              <div className="text-white/85 text-sm mt-2.5">
                {target.totalCPA <= INDUSTRY_BENCHMARK_CPA ? (
                  <>
                    <span className="font-bold text-white">
                      {(INDUSTRY_BENCHMARK_CPA - target.totalCPA).toFixed(2)} pts below
                    </span>{' '}
                    the {INDUSTRY_BENCHMARK_CPA}% industry target
                  </>
                ) : (
                  <>
                    <span className="font-bold text-white">
                      {(target.totalCPA - INDUSTRY_BENCHMARK_CPA).toFixed(2)} pts above
                    </span>{' '}
                    the {INDUSTRY_BENCHMARK_CPA}% industry target
                  </>
                )}
              </div>
            </div>
            <div className="sm:pl-6">
              <div className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                Annual net revenue uplift
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white num-tabular leading-none">
                {fmtSignedEUR(uplift)}
              </div>
              <div className="text-white/85 text-sm mt-2.5">
                {tgt <= cur
                  ? 'Set a target above current to see the uplift.'
                  : `Shifting ${cur}% → ${tgt}% direct on €${Math.round(gross).toLocaleString('en-IE')} gross.`}
              </div>
            </div>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-brand-light p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                CPA vs current
              </div>
              <div
                className={`text-xl font-black num-tabular ${
                  cpaDeltaPts <= 0 ? 'text-brand-success' : 'text-brand-accent'
                }`}
              >
                {cpaDeltaPts <= 0 ? '−' : '+'}
                {Math.abs(cpaDeltaPts).toFixed(2)} pts
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                from {current.totalCPA.toFixed(2)}%
              </div>
            </div>
            <div className="rounded-xl bg-brand-light p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                OTA commission saved
              </div>
              <div
                className={`text-xl font-black num-tabular ${
                  otaSaved >= 0 ? 'text-brand-success' : 'text-brand-accent'
                }`}
              >
                {(otaSaved >= 0 ? '+' : '−') + fmtEUR(otaSaved)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">vs current scenario</div>
            </div>
            <div className="rounded-xl bg-brand-light p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Direct marketing reinvested
              </div>
              <div
                className="text-xl font-black num-tabular"
                style={{ color: '#F4A261' }}
              >
                {(mktDelta >= 0 ? '+' : '−') + fmtEUR(mktDelta)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">new direct spend</div>
            </div>
          </div>

          {/* Mix + cost-composition shift */}
          {(() => {
            const maxCost = Math.max(current.totalCost, target.totalCost, 1);
            const costRowWidthPct = (cost: number) => (cost / maxCost) * 100;
            const seg = (val: number, total: number) =>
              total > 0 ? (val / total) * 100 : 0;
            const CostBar: React.FC<{ m: typeof current }> = ({ m }) => (
              <div
                className="h-2.5 rounded-full overflow-hidden flex"
                style={{ width: `${costRowWidthPct(m.totalCost)}%` }}
                title={`Total cost €${Math.round(m.totalCost).toLocaleString('en-IE')}`}
              >
                <div style={{ width: `${seg(m.otaCost, m.totalCost)}%`, background: '#64748B' }} />
                <div style={{ width: `${seg(m.dirCommissionCost, m.totalCost)}%`, background: '#003366' }} />
                <div style={{ width: `${seg(m.mktSpend, m.totalCost)}%`, background: '#F4A261' }} />
                <div style={{ width: `${seg(m.svcFees, m.totalCost)}%`, background: '#CBD5E1' }} />
              </div>
            );
            return (
              <div className="mt-6">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-xs font-semibold text-slate-500">
                    Booking mix &amp; cost composition
                  </div>
                  <div className="text-[11px] text-slate-400">
                    cost bars scaled to current total
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 font-medium">Now</span>
                      <span className="num-tabular text-slate-600">
                        {cur}% direct · {100 - cur}% OTA · CPA{' '}
                        <span className="font-semibold">{current.totalCPA.toFixed(2)}%</span>{' '}
                        · cost {fmtEUR(current.totalCost)}
                      </span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden flex bg-slate-100 mb-1">
                      <div className="bg-brand-blue h-full" style={{ width: `${cur}%` }} />
                      <div className="bg-slate-300 h-full flex-1" />
                    </div>
                    <CostBar m={current} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-brand-success font-semibold">After</span>
                      <span className="num-tabular text-slate-600">
                        {tgt}% direct · {100 - tgt}% OTA · CPA{' '}
                        <span className="font-semibold">{target.totalCPA.toFixed(2)}%</span>{' '}
                        · cost {fmtEUR(target.totalCost)}
                      </span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden flex bg-slate-100 mb-1">
                      <div
                        className="bg-brand-success h-full"
                        style={{ width: `${tgt}%` }}
                      />
                      <div className="bg-slate-300 h-full flex-1" />
                    </div>
                    <CostBar m={target} />
                  </div>
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#64748B' }} />
                    OTA commission
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#003366' }} />
                    Direct commission
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#F4A261' }} />
                    Marketing
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#CBD5E1' }} />
                    Service fees
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Industry benchmark line */}
          {gross > 0 && (
            <div className="text-xs text-slate-500 mt-4 text-center">
              At {tgt}% direct, net revenue is{' '}
              {benchmarkDiff > 0 ? (
                <span className="text-brand-success font-semibold">
                  {fmtEUR(benchmarkDiff)} above
                </span>
              ) : benchmarkDiff < 0 ? (
                <span className="text-brand-accent font-semibold">
                  {fmtEUR(benchmarkDiff)} below
                </span>
              ) : (
                <span className="font-semibold">on par with</span>
              )}{' '}
              the {INDUSTRY_BENCHMARK_CPA}% CPA industry benchmark.
            </div>
          )}
        </section>
      </div>

      {/* CTA */}
      <div
        className="mt-8 rounded-2xl p-6 sm:p-8 text-white"
        style={{ background: 'linear-gradient(135deg, #003366 0%, #002244 100%)' }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1">
              How Bookassist gets you there
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              Booking engine, metasearch, and direct campaigns — managed end to end.
            </h3>
            <p className="text-white/70 text-sm mt-1 max-w-2xl">
              We deliver the IBE, the paid search and metasearch spend, and the website
              itself — the three levers that move the share above.
            </p>
          </div>
          <a
            href="https://bookassist.com/book-a-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-brand-blue font-bold hover:bg-brand-light transition"
          >
            Book a Demo
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-8 max-w-2xl mx-auto">
        Estimates derived from inputs above. Directional planning tool — actual results vary
        with demand mix, channel cost, conversion rate, and seasonality.
      </p>
    </div>
  );
};
