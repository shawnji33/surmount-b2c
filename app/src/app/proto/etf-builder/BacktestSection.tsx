'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChartLineUp, Info } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { DateRangePicker } from '@/app/home/builder/_shared/DateRangePicker';
import type { AllocationRow, BacktestPoint } from '@/app/home/builder/_shared/types';
import { generateEnrichedBacktestResult, type EnrichedBacktestResult } from './_backtest-data';
import { BacktestChartCompare } from './BacktestChartCompare';
import { AboutCard } from './AboutCard';
import bt from '@/app/home/builder/_shared/BacktestPanel.module.css';
import s from './BacktestSection.module.css';

const RANGE_TABS = ['1Y', '5Y', '10Y'] as const;
type RangeTab = (typeof RANGE_TABS)[number];

function sliceRange(series: BacktestPoint[], range: RangeTab) {
  const months = range === '1Y' ? 12 : range === '5Y' ? 60 : series.length;
  return series.slice(-months);
}

function ScoreGroup({ title, tooltip, score, rows, last }: { title: string; tooltip: string; score: number; rows: [string, string][]; last?: boolean }) {
  const tooltipId = `score-tooltip-${title.toLowerCase()}`;
  return (
    <div className={[bt.scoreGroup, last ? bt.scoreGroupLast : ''].filter(Boolean).join(' ')}>
      <div className={bt.scoreGroupHead}>
        <span className={s.titleWithTooltip}>
          <span className={bt.scoreGroupTitle}>{title}</span>
          <span className={s.tooltipWrap}>
            <button type="button" className={s.tooltipTrigger} aria-label={`About ${title.toLowerCase()}`} aria-describedby={tooltipId}>
              <Info weight="regular" />
            </button>
            <span className={s.tooltip} id={tooltipId} role="tooltip">{tooltip}</span>
          </span>
        </span>
        <span className={bt.scoreGroupScore}>{score}x</span>
      </div>
      {rows.map(([label, val]) => (
        <div className={bt.scoreRow} key={label}>
          <span className={bt.scoreRowLabel}>{label}</span>
          <span className={bt.scoreRowVal}>{val}</span>
        </div>
      ))}
    </div>
  );
}

export function BacktestSection({ strategyName, rows, totalWeight }: { strategyName: string; rows: AllocationRow[]; totalWeight: number }) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [amount, setAmount] = useState('$100,000.00');
  const [slippage, setSlippage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [result, setResult] = useState<EnrichedBacktestResult | null>(null);
  const [rangeTab, setRangeTab] = useState<RangeTab>('1Y');
  const [hover, setHover] = useState<BacktestPoint | null>(null);

  const chartSkelRef = useRef<HTMLDivElement>(null);
  const scoreSkelRef = useRef<HTMLDivElement>(null);
  const wasRevealedRef = useRef(false);

  const ready = Boolean(startDate && endDate && amount.trim());
  const revealed = status === 'done';

  function run() {
    if (!ready || !startDate || !endDate) return;
    setStatus('loading');
    const seed = `${strategyName}|${startDate.toISOString()}|${endDate.toISOString()}|${amount}|${rows.map((r) => `${r.ticker}:${r.weight}`).join(',')}`;
    window.setTimeout(() => {
      setResult(generateEnrichedBacktestResult(seed, startDate, endDate, rows));
      setStatus('done');
    }, 1200);
  }

  useLayoutEffect(() => {
    if (!revealed && wasRevealedRef.current) {
      [chartSkelRef.current, scoreSkelRef.current].forEach((el) => {
        if (!el) return;
        el.classList.add(bt.tSkelResetting);
        void el.offsetHeight;
        el.classList.remove(bt.tSkelResetting);
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
    <div className={bt.wrap}>
      <div className={bt.configCard}>
        <div className={bt.configField}>
          <label className={bt.label}>Period from - to</label>
          <DateRangePicker startDate={startDate} endDate={endDate} onChange={(start, end) => { setStartDate(start); setEndDate(end); }} />
        </div>
        <div className={bt.configField}>
          <label className={bt.label}>Simulated investment amount</label>
          <input className={bt.textInput} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className={bt.configField}>
          <label className={bt.label}>Slippage (bps)</label>
          <input
            className={bt.textInput}
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
        <div className={bt.emptyState}>
          <span className={bt.emptyIcon}><ChartLineUp weight="regular" /></span>
          <div className={bt.emptyTitle}>Set up your backtest</div>
          <p className={bt.emptyDesc}>Enter the period, simulated amount, and slippage to run your backtest.</p>
        </div>
      )}

      {status !== 'idle' && (
        <div className={s.stack}>
          <div className={[bt.resultsRow, s.resultsRow].join(' ')}>
            <div className={bt.chartCard}>
              <div ref={chartSkelRef} className={[bt.tSkel, revealed ? bt.tSkelRevealed : ''].filter(Boolean).join(' ')}>
                <div className={[bt.tSkelSkeleton, bt.isPulsing].join(' ')}>
                  <div className={bt.chartSkelHead}>
                    <div className={[bt.skelBar, bt.skelTitleBar].join(' ')} />
                    <div className={[bt.skelBar, bt.skelSubBar].join(' ')} />
                  </div>
                  <div className={bt.chartSkelStats}>
                    <div className={[bt.skelBar, bt.skelStatBar].join(' ')} />
                    <div className={[bt.skelBar, bt.skelStatBar].join(' ')} />
                  </div>
                  <div className={[bt.skelBar, bt.skelChartBar].join(' ')} />
                </div>

                <div className={bt.tSkelContent}>
                  {result && displayStats && (
                    <>
                      <div className={bt.chartHead}>
                        <div>
                          <div className={bt.chartTitle}>Historical return &amp; drawdown</div>
                          <div className={bt.chartSub}>Performance calculated using current weightings</div>
                        </div>
                        <div className={bt.rangeTabs}>
                          {RANGE_TABS.map((r) => (
                            <button
                              type="button"
                              key={r}
                              className={[bt.rangeTab, rangeTab === r ? bt.rangeTabActive : ''].filter(Boolean).join(' ')}
                              onClick={() => setRangeTab(r)}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className={bt.statRow}>
                        <div className={bt.stat}>
                          <span className={bt.statLabel}>Historical returns</span>
                          <span className={[bt.statVal, displayStats.returnPct >= 0 ? bt.pos : bt.neg].join(' ')}>
                            {displayStats.returnPct >= 0 ? '+' : ''}{displayStats.returnPct}%
                          </span>
                          <span className={s.benchVal}>{displayStats.benchReturnPct}% S&amp;P 500</span>
                        </div>
                        <div className={bt.stat}>
                          <span className={bt.statLabel}>Max drawdown</span>
                          <span className={[bt.statVal, bt.neg].join(' ')}>{displayStats.drawdownPct}%</span>
                          <span className={s.benchVal}>{displayStats.benchDrawdownPct}% S&amp;P 500</span>
                        </div>
                      </div>
                      <BacktestChartCompare data={displaySeries} benchmark={displayBenchmark} onHover={setHover} />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={bt.scoreCard}>
              <div ref={scoreSkelRef} className={[bt.tSkel, revealed ? bt.tSkelRevealed : ''].filter(Boolean).join(' ')}>
                <div className={[bt.tSkelSkeleton, bt.isPulsing].join(' ')}>
                  <div className={[bt.skelBar, bt.skelGroupBar].join(' ')} />
                  <div className={[bt.skelBar, bt.skelGroupBar].join(' ')} />
                  <div className={[bt.skelBar, bt.skelGroupBar].join(' ')} />
                </div>

                <div className={bt.tSkelContent}>
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

          {result && revealed && <AboutCard rows={rows} totalWeight={totalWeight} about={result.about} />}
        </div>
      )}
    </div>
  );
}
