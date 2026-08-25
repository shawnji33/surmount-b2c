'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChartLineUp, Info } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { DateRangePicker } from './DateRangePicker';
import { BacktestChartCompare } from './_backtest/BacktestChartCompare';
import { AboutCard } from './_backtest/AboutCard';
import { generateBacktestResult } from './_lib/generateBacktestResult';
import type { AllocationRow, BacktestPoint, BacktestRangeTab, BacktestResult, BacktestStatus } from './types';
import s from './BacktestPanel.module.css';

const RANGE_TABS: BacktestRangeTab[] = ['1Y', '5Y', '10Y'];

function sliceRange(series: BacktestPoint[], range: BacktestRangeTab) {
  const months = range === '1Y' ? 12 : range === '5Y' ? 60 : series.length;
  return series.slice(-months);
}

export function ScoreGroup({ title, tooltip, score, rows, last }: { title: string; tooltip: string; score: number; rows: [string, string][]; last?: boolean }) {
  const tooltipId = `score-tooltip-${title.toLowerCase()}`;
  return (
    <div className={[s.scoreGroup, last ? s.scoreGroupLast : ''].filter(Boolean).join(' ')}>
      <div className={s.scoreGroupHead}>
        <span className={s.titleWithTooltip}>
          <span className={s.scoreGroupTitle}>{title}</span>
          <span className={s.tooltipWrap}>
            <button type="button" className={s.tooltipTrigger} aria-label={`About ${title.toLowerCase()}`} aria-describedby={tooltipId}>
              <Info weight="regular" />
            </button>
            <span className={s.tooltip} id={tooltipId} role="tooltip">{tooltip}</span>
          </span>
        </span>
        <span className={s.scoreGroupScore}>{score}x</span>
      </div>
      {rows.map(([label, val]) => (
        <div className={s.scoreRow} key={label}>
          <span className={s.scoreRowLabel}>{label}</span>
          <span className={s.scoreRowVal}>{val}</span>
        </div>
      ))}
    </div>
  );
}

export function BacktestPanel({
  strategyName,
  rows,
  totalWeight,
  startDate,
  endDate,
  onDateChange,
  amount,
  setAmount,
  slippage,
  setSlippage,
  status,
  setStatus,
  result,
  setResult,
  rangeTab,
  setRangeTab,
  onRunComplete,
}: {
  strategyName: string;
  rows: AllocationRow[];
  totalWeight: number;
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
  amount: string;
  setAmount: (v: string) => void;
  slippage: string;
  setSlippage: (v: string) => void;
  status: BacktestStatus;
  setStatus: (v: BacktestStatus) => void;
  result: BacktestResult | null;
  setResult: (v: BacktestResult | null) => void;
  rangeTab: BacktestRangeTab;
  setRangeTab: (v: BacktestRangeTab) => void;
  onRunComplete?: () => void;
}) {
  const [hover, setHover] = useState<BacktestPoint | null>(null);

  const chartSkelRef = useRef<HTMLDivElement>(null);
  const scoreSkelRef = useRef<HTMLDivElement>(null);
  const aboutSkelRef = useRef<HTMLDivElement>(null);
  const wasRevealedRef = useRef(false);

  const ready = Boolean(startDate && endDate && amount.trim());
  const revealed = status === 'done';

  function run() {
    if (!ready || !startDate || !endDate) return;
    setStatus('loading');
    const seed = `${strategyName}|${startDate.toISOString()}|${endDate.toISOString()}|${amount}|${rows.map((r) => `${r.ticker}:${r.weight}`).join(',')}`;
    window.setTimeout(() => {
      setResult(generateBacktestResult(seed, startDate, endDate, rows));
      setStatus('done');
      onRunComplete?.();
    }, 1200);
  }

  // Re-running the backtest flips `revealed` back to false so the skeleton returns — but that
  // transition should snap back instantly, not slowly cross-fade in reverse (see the "replay"
  // note in BacktestPanel.module.css's .tSkel comment). Suspend transitions for one frame,
  // force a reflow, then restore them so the *next* reveal animates normally again.
  useLayoutEffect(() => {
    if (!revealed && wasRevealedRef.current) {
      [chartSkelRef.current, scoreSkelRef.current, aboutSkelRef.current].forEach((el) => {
        if (!el) return;
        el.classList.add(s.tSkelResetting);
        void el.offsetHeight;
        el.classList.remove(s.tSkelResetting);
      });
    }
    wasRevealedRef.current = revealed;
  }, [revealed]);

  const displaySeries = useMemo(() => (result ? sliceRange(result.series, rangeTab) : []), [result, rangeTab]);
  const displayBenchmark = useMemo(() => (result ? sliceRange(result.benchmarkSeries, rangeTab) : []), [result, rangeTab]);

  const displayStats = useMemo(() => {
    if (!result) return null;
    if (hover && displaySeries.length > 0) {
      const base = displaySeries[0].value;
      const returnPct = base > 0 ? Math.round(((hover.value - base) / base) * 10000) / 100 : 0;
      return { returnPct, drawdownPct: hover.drawdownPct, benchReturnPct: result.benchmarkTotalReturnPct, benchDrawdownPct: result.benchmarkMaxDrawdownPct };
    }
    return {
      returnPct: result.totalReturnPct,
      drawdownPct: result.maxDrawdownPct,
      benchReturnPct: result.benchmarkTotalReturnPct,
      benchDrawdownPct: result.benchmarkMaxDrawdownPct,
    };
  }, [hover, result, displaySeries]);

  return (
    <div className={s.wrap}>
      <div className={s.configCard}>
        <div className={s.configField}>
          <label className={s.label}>Period from - to</label>
          <DateRangePicker startDate={startDate} endDate={endDate} onChange={onDateChange} />
        </div>
        <div className={s.configField}>
          <label className={s.label}>Simulated investment amount</label>
          <input className={s.textInput} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className={s.configField}>
          <label className={s.label}>Slippage (bps)</label>
          <input
            className={s.textInput}
            placeholder="e.g. 2"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value.replace(/[^0-9]/g, ''))}
          />
        </div>
        <Button type="button" fullWidth={false} disabled={!ready || status === 'loading'} onClick={run}>
          {status === 'loading' ? 'Running…' : 'Run backtest'}
        </Button>
      </div>

      {status === 'idle' && (
        <div className={s.emptyState}>
          <span className={s.emptyIcon}><ChartLineUp weight="regular" /></span>
          <div className={s.emptyTitle}>Set up your backtest</div>
          <p className={s.emptyDesc}>Enter the period, simulated amount, and slippage to run your backtest.</p>
        </div>
      )}

      {status !== 'idle' && (
        <div className={s.stack}>
          <div className={s.resultsRow}>
            <div className={s.chartCard}>
              <div ref={chartSkelRef} className={[s.tSkel, revealed ? s.tSkelRevealed : ''].filter(Boolean).join(' ')}>
                <div className={[s.tSkelSkeleton, s.isPulsing].join(' ')}>
                  <div className={s.chartSkelHead}>
                    <div className={[s.skelBar, s.skelTitleBar].join(' ')} />
                    <div className={[s.skelBar, s.skelSubBar].join(' ')} />
                  </div>
                  <div className={s.chartSkelStats}>
                    <div className={[s.skelBar, s.skelStatBar].join(' ')} />
                    <div className={[s.skelBar, s.skelStatBar].join(' ')} />
                  </div>
                  <div className={[s.skelBar, s.skelChartBar].join(' ')} />
                </div>

                <div className={s.tSkelContent}>
                  {result && displayStats && (
                    <>
                      <div className={s.chartHead}>
                        <div>
                          <div className={s.chartTitle}>Historical return &amp; drawdown</div>
                          <div className={s.chartSub}>Performance calculated using current weightings</div>
                        </div>
                        <div className={s.rangeTabs}>
                          {RANGE_TABS.map((r) => (
                            <button
                              type="button"
                              key={r}
                              className={[s.rangeTab, rangeTab === r ? s.rangeTabActive : ''].filter(Boolean).join(' ')}
                              onClick={() => setRangeTab(r)}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className={s.statRow}>
                        <div className={s.stat}>
                          <span className={s.statLabel}>Historical returns</span>
                          <span className={[s.statVal, displayStats.returnPct >= 0 ? s.pos : s.neg].join(' ')}>
                            {displayStats.returnPct >= 0 ? '+' : ''}{displayStats.returnPct}%
                          </span>
                          <span className={s.benchVal}>{displayStats.benchReturnPct}% S&amp;P 500</span>
                        </div>
                        <div className={s.stat}>
                          <span className={s.statLabel}>Max drawdown</span>
                          <span className={[s.statVal, s.neg].join(' ')}>{displayStats.drawdownPct}%</span>
                          <span className={s.benchVal}>{displayStats.benchDrawdownPct}% S&amp;P 500</span>
                        </div>
                      </div>
                      <BacktestChartCompare data={displaySeries} benchmark={displayBenchmark} onHover={setHover} />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={s.scoreCard}>
              <div ref={scoreSkelRef} className={[s.tSkel, revealed ? s.tSkelRevealed : ''].filter(Boolean).join(' ')}>
                <div className={[s.tSkelSkeleton, s.isPulsing].join(' ')}>
                  <div className={[s.skelBar, s.skelGroupBar].join(' ')} />
                  <div className={[s.skelBar, s.skelGroupBar].join(' ')} />
                  <div className={[s.skelBar, s.skelGroupBar].join(' ')} />
                </div>

                <div className={s.tSkelContent}>
                  {result && (
                    <>
                      <ScoreGroup
                        title="Returns"
                        tooltip="Measures how this portfolio's historical returns (total, CAGR, average annual) compare to the S&P 500 (benchmark = 1.0)."
                        score={result.score.returns.score}
                        rows={[
                          ['Total returns', `${result.score.returns.totalReturnPct >= 0 ? '+' : ''}${result.score.returns.totalReturnPct}%`],
                          ['CAGR', `${result.score.returns.cagr}%`],
                          ['Avg annual return', `${result.score.returns.avgAnnualReturn}%`],
                        ]}
                      />
                      <ScoreGroup
                        title="Stability"
                        tooltip="Evaluates risk based on historical drawdowns (max, average, duration) compared to the S&P 500 (benchmark = 1.0)."
                        score={result.score.stability.score}
                        rows={[
                          ['Max drawdown', `${result.score.stability.maxDrawdownPct}%`],
                          ['Avg drawdown', `${result.score.stability.avgDrawdownPct}%`],
                          ['Avg drawdown duration', `${result.score.stability.avgDrawdownDurationDays} days`],
                        ]}
                      />
                      <ScoreGroup
                        title="Diversification"
                        tooltip="Rates portfolio diversification by number of assets, sectors, and largest holding size compared to the S&P 500 ETF (benchmark = 1.0)."
                        score={result.score.diversification.score}
                        rows={[
                          ['Positions', String(result.score.diversification.positions)],
                          ['Sectors', String(result.score.diversification.sectors)],
                          ['Highest concentration', `${result.score.diversification.highestConcentration.pct}%`],
                        ]}
                        last
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div ref={aboutSkelRef} className={[s.tSkel, revealed ? s.tSkelRevealed : ''].filter(Boolean).join(' ')}>
            {/* AboutCard owns its own card chrome (border/padding/background) — this skeleton
             * layer mirrors that chrome directly (aboutSkelCard) so loading and revealed states
             * match in size and position; the content layer below stays chrome-less so the real
             * AboutCard's own .card isn't nested inside a second identical border. */}
            <div className={[s.tSkelSkeleton, s.isPulsing, s.aboutSkelCard].join(' ')}>
              <div className={s.aboutSkelHead}>
                <div className={[s.skelBar, s.skelAboutTitleBar].join(' ')} />
                <div className={[s.skelBar, s.skelAboutTabsBar].join(' ')} />
              </div>
              <div className={[s.skelBar, s.skelAboutBarBar].join(' ')} />
            </div>

            <div className={s.tSkelContent}>
              {result && <AboutCard rows={rows} totalWeight={totalWeight} about={result.about} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
