'use client';

import { useMemo } from 'react';
import { BacktestChartCompare } from '../../_shared/_backtest/BacktestChartCompare';
import { ScoreGroup } from '../../_shared/BacktestPanel';
import { generateBacktestResult } from '../../_shared/_lib/generateBacktestResult';
import { RuleSummaryList } from './RuleSummaryList';
import { HoldingsAllocationsTable } from './HoldingsAllocationsTable';
import type { PromptfolioDraft } from '../_data';
import s from './BacktestDashboard.module.css';

// Backtest computation only makes sense once the draft is fully formed, so this waits for
// revealStage 4 (draft complete) and reveals everything in one crossfade — the chat panel already
// narrates the earlier drafting stages, this panel is the "finished result" view.
export function BacktestDashboard({
  draft,
  revealStage,
  templateName,
  onRemoveHolding,
  onContinue,
}: {
  draft: PromptfolioDraft | null;
  revealStage: number;
  templateName: string | null;
  onRemoveHolding: (ticker: string) => void;
  onContinue: () => void;
}) {
  const complete = revealStage >= 4 && draft !== null && draft.rows.length > 0;

  const result = useMemo(() => {
    if (!draft || draft.rows.length === 0) return null;
    const end = new Date();
    const start = new Date(end);
    start.setFullYear(start.getFullYear() - 3);
    return generateBacktestResult(draft.name, start, end, draft.rows);
  }, [draft]);

  return (
    <div className={s.root}>
      <div className={[s.tSkel, complete ? s.isRevealed : ''].filter(Boolean).join(' ')}>
        <div className={s.tSkelSkeleton} aria-hidden="true">
          <div className={s.skelRow}>
            <div className={s.skelChartCard} />
            <div className={s.skelScoreCard} />
          </div>
          <div className={s.skelTableCard} />
        </div>

        <div className={s.tSkelContent}>
          {draft && result && (
            <>
              <div className={s.topRow}>
                <div className={s.chartCard}>
                  <h2 className={s.cardTitle}>Backtest: Returns vs drawdown</h2>
                  <div className={s.statsRow}>
                    <div>
                      <div className={s.statLabel}>Total returns</div>
                      <div className={s.statValue}>{result.totalReturnPct >= 0 ? '+' : ''}{result.totalReturnPct}%</div>
                      <div className={s.statSub}>{result.benchmarkTotalReturnPct}% S&amp;P 500</div>
                    </div>
                    <div>
                      <div className={s.statLabel}>Max drawdown</div>
                      <div className={[s.statValue, s.statValueNeg].join(' ')}>{result.maxDrawdownPct}%</div>
                      <div className={s.statSub}>{result.benchmarkMaxDrawdownPct}% S&amp;P 500</div>
                    </div>
                  </div>
                  <BacktestChartCompare data={result.series} benchmark={result.benchmarkSeries} height={220} />
                </div>

                <div className={s.scoreCard}>
                  <h2 className={s.cardTitle}>Key statistics</h2>
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
                </div>
              </div>

              <div className={s.rulesCard}>
                <h2 className={s.cardTitle}>Custom rules</h2>
                <RuleSummaryList rules={draft.rules} />
              </div>

              <HoldingsAllocationsTable rows={draft.rows} templateName={templateName} onRemove={onRemoveHolding} />

              <div className={s.footer}>
                <button type="button" className={s.continueBtn} onClick={onContinue}>
                  Continue to builder
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
