'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BacktestChartCompare } from '../../_shared/_backtest/BacktestChartCompare';
import { ScoreGroup } from '../../_shared/BacktestPanel';
import { generateBacktestResult } from '../../_shared/_lib/generateBacktestResult';
import { RuleCards } from '../../_shared/RuleCards';
import { HoldingsAllocationsTable } from './HoldingsAllocationsTable';
import { SelectionActions, type DashboardSelection } from './SelectionActions';
import type { PromptfolioDraft } from '../_data';
import s from './BacktestDashboard.module.css';

const SELECTION_HIGHLIGHT_NAME = 'promptfolio-selection';

type HighlightRegistry = {
  set: (name: string, highlight: unknown) => void;
  delete: (name: string) => boolean;
};

type HighlightConstructor = new (...ranges: Range[]) => unknown;

function getHighlightRegistry() {
  return (CSS as unknown as { highlights?: HighlightRegistry }).highlights;
}

function preserveSelectedRange(range: Range) {
  const HighlightApi = (globalThis as typeof globalThis & { Highlight?: HighlightConstructor }).Highlight;
  const registry = getHighlightRegistry();
  if (!HighlightApi || !registry) return;

  registry.delete(SELECTION_HIGHLIGHT_NAME);
  registry.set(SELECTION_HIGHLIGHT_NAME, new HighlightApi(range));
}

function clearPreservedRange() {
  getHighlightRegistry()?.delete(SELECTION_HIGHLIGHT_NAME);
}

// Backtest computation only makes sense once the draft is fully formed, so this waits for
// revealStage 4 (draft complete) and reveals everything in one crossfade — the chat panel already
// narrates the earlier drafting stages, this panel is the "finished result" view.
export function BacktestDashboard({
  draft,
  revealStage,
  isThinking,
  recentlyAddedTickers,
  onAddHolding,
  onUpdateHoldingWeight,
  onRemoveHolding,
  onUpdateRules,
  onAddPromptAnnotation,
}: {
  draft: PromptfolioDraft | null;
  revealStage: number;
  isThinking: boolean;
  recentlyAddedTickers: string[];
  onAddHolding: (ticker: string) => void;
  onUpdateHoldingWeight: (ticker: string, weight: number) => void;
  onRemoveHolding: (ticker: string) => void;
  onUpdateRules: (updater: (current: PromptfolioDraft['rules']) => PromptfolioDraft['rules']) => void;
  onAddPromptAnnotation: (text: string) => void;
}) {
  const complete = revealStage >= 4 && draft !== null && draft.rows.length > 0;
  const skeletonRef = useRef<HTMLDivElement>(null);
  const wasCompleteRef = useRef(complete);
  const wasThinkingRef = useRef(isThinking);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<DashboardSelection | null>(null);

  const openSelection = useCallback((text: string, context: string, bounds: DOMRect) => {
    setSelection({
      text: text.replace(/\s+/g, ' ').trim().slice(0, 120),
      context,
      rect: {
        top: bounds.top,
        right: bounds.right,
        bottom: bounds.bottom,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height,
      },
    });
  }, []);

  const dismissSelection = useCallback(() => {
    clearPreservedRange();
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  }, []);

  const captureSelection = useCallback(() => {
    window.requestAnimationFrame(() => {
      const nativeSelection = window.getSelection();
      const dashboard = dashboardRef.current;
      if (!nativeSelection || nativeSelection.isCollapsed || !dashboard || nativeSelection.rangeCount === 0) {
        if (selection) dismissSelection();
        return;
      }
      const anchor = nativeSelection.anchorNode;
      const focus = nativeSelection.focusNode;
      if (!anchor || !focus || !dashboard.contains(anchor) || !dashboard.contains(focus)) return;
      const text = nativeSelection.toString().replace(/\s+/g, ' ').trim();
      if (!text) return;
      const range = nativeSelection.getRangeAt(0);
      const rangeBounds = range.getBoundingClientRect();
      if (!rangeBounds.width && !rangeBounds.height) return;
      const startElement = range.startContainer instanceof Element
        ? range.startContainer
        : range.startContainer.parentElement;
      const contextElement = startElement?.closest<HTMLElement>('[data-selection-context]');
      preserveSelectedRange(range.cloneRange());
      openSelection(text, contextElement?.dataset.selectionContext ?? 'selected dashboard content', rangeBounds);
    });
  }, [dismissSelection, openSelection, selection]);

  const result = useMemo(() => {
    if (!draft || draft.rows.length === 0) return null;
    const end = new Date();
    const start = new Date(end);
    start.setFullYear(start.getFullYear() - 3);
    return generateBacktestResult(draft.name, start, end, draft.rows);
  }, [draft]);

  const activeRuleCount = draft
    ? [draft.rules.rebalance.enabled, draft.rules.stopLoss.enabled, draft.rules.takeProfit.enabled]
      .filter(Boolean).length
    : 0;

  useLayoutEffect(() => {
    const skeleton = skeletonRef.current;
    const wrapper = skeleton?.parentElement;
    let frame = 0;
    const returningToLoading = wasCompleteRef.current && !complete;
    const thinkingStarted = !wasThinkingRef.current && isThinking;

    if (skeleton && wrapper && (returningToLoading || thinkingStarted)) {
      if (returningToLoading) wrapper.classList.add(s.isResetting);
      skeleton.classList.remove(s.isPulsing);
      void skeleton.offsetWidth;
      skeleton.classList.add(s.isPulsing);
      if (returningToLoading) {
        frame = window.requestAnimationFrame(() => wrapper.classList.remove(s.isResetting));
      }
    }

    wasCompleteRef.current = complete;
    wasThinkingRef.current = isThinking;
    return () => window.cancelAnimationFrame(frame);
  }, [complete, isThinking]);

  useEffect(() => () => clearPreservedRange(), []);

  return (
    <div
      ref={dashboardRef}
      className={s.root}
      onPointerUp={(event) => {
        if ((event.target as Element).closest('[data-selection-actions]')) return;
        captureSelection();
      }}
      onKeyUp={(event) => {
        if ((event.target as Element).closest('[data-selection-actions]')) return;
        captureSelection();
      }}
    >
      <div
        className={[s.tSkel, complete ? s.isRevealed : ''].filter(Boolean).join(' ')}
        data-state={complete ? 'loaded' : 'loading'}
      >
        <div ref={skeletonRef} className={[s.tSkelSkeleton, s.isPulsing].join(' ')} aria-hidden="true">
          <div className={s.skelRow}>
            <div className={s.skelChartCard}>
              <div className={[s.skeletonBar, s.skelChartTitle].join(' ')} />
              <div className={s.skelChartBody}>
                <div className={s.skelMetricRow}>
                  {[0, 1].map((metric) => (
                    <div key={metric} className={s.skelMetric}>
                      <div className={[s.skeletonBar, s.skelMetricLabel].join(' ')} />
                      <div className={[s.skeletonBar, s.skelMetricValue].join(' ')} />
                      <div className={[s.skeletonBar, s.skelMetricSub].join(' ')} />
                    </div>
                  ))}
                </div>
                <div className={s.skelChartLegend}>
                  <div className={[s.skeletonBar, s.skelLegendPill].join(' ')} />
                  <div className={[s.skeletonBar, s.skelLegendPill].join(' ')} />
                </div>
                <div className={s.skelChartPlot}>
                  {[26, 38, 31, 52, 45, 66, 58, 78, 70, 86, 76, 92].map((height, index) => (
                    <span key={index} style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
            </div>

            <div className={s.skelScoreCard}>
              <div className={[s.skeletonBar, s.skelScorePanelTitle].join(' ')} />
              <div className={s.skelScoreBody}>
                {[0, 1, 2].map((group) => (
                  <div key={group} className={s.skelScoreGroup}>
                    <div className={s.skelScoreHeading}>
                      <div className={[s.skeletonBar, s.skelScoreTitle].join(' ')} />
                      <div className={[s.skeletonBar, s.skelScoreValue].join(' ')} />
                    </div>
                    {[0, 1, 2].map((row) => (
                      <div key={row} className={s.skelScoreRow}>
                        <div className={[s.skeletonBar, s.skelScoreLabel].join(' ')} />
                        <div className={[s.skeletonBar, s.skelScoreCell].join(' ')} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={s.skelTableCard}>
            <div className={s.skelTableHeader}>
              {[0, 1, 2, 3, 4].map((column) => (
                <div key={column} className={s.skeletonBar} />
              ))}
            </div>
            <div className={s.skelTableRows}>
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className={s.skelTableRow}>
                  <div className={s.skelAssetCell}>
                    <span className={s.skelAvatar} />
                    <span className={s.skelAssetCopy}>
                      <span className={[s.skeletonBar, s.skelAssetName].join(' ')} />
                      <span className={[s.skeletonBar, s.skelAssetMeta].join(' ')} />
                    </span>
                  </div>
                  <div className={[s.skeletonBar, s.skelTableCell].join(' ')} />
                  <div className={[s.skeletonBar, s.skelTableCell].join(' ')} />
                  <div className={[s.skeletonBar, s.skelTableCellShort].join(' ')} />
                  <div className={[s.skeletonBar, s.skelReasonCell].join(' ')} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={s.tSkelContent}>
          {draft && result && (
            <>
              <div className={s.topRow}>
                <div className={s.chartCard} data-selection-context="backtest settings" data-selection-text="3-year period">
                  <div className={s.cardTitleRow}>
                    <h2 className={s.cardTitle}>Backtest: Returns vs drawdown</h2>
                    <div className={s.chartActions}>
                      <Popover>
                        <PopoverTrigger
                          className={s.rulesTrigger}
                          aria-label={`Edit custom rules, ${activeRuleCount} active`}
                        >
                          <span
                            className={s.rulesStatusDot}
                            data-active={activeRuleCount > 0 ? 'true' : 'false'}
                            aria-hidden="true"
                          />
                          <span className={s.rulesTriggerLabel}>Rules</span>
                          <Badge className={s.rulesTriggerCount} size="xs" aria-hidden="true">
                            {activeRuleCount}
                          </Badge>
                          <CaretDown weight="bold" aria-hidden="true" />
                        </PopoverTrigger>
                        <PopoverContent
                          align="end"
                          sideOffset={8}
                          className={s.rulesPopover}
                          data-rules-popover
                          onPointerUp={(event) => event.stopPropagation()}
                        >
                          <div className={s.rulesPopoverHeader}>
                            <h3>Custom rules</h3>
                          </div>
                          <RuleCards
                            rules={draft.rules}
                            setRules={onUpdateRules}
                            density="compact"
                            showTitle={false}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className={s.chartBody}>
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
                </div>

                <div
                  className={s.scoreCard}
                  aria-label="Key statistics"
                  data-selection-context="backtest statistics"
                  data-selection-text="key statistics"
                >
                  <h2 className={s.panelTitle}>Key statistics</h2>
                  <div className={s.scoreBody}>
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
              </div>

              <HoldingsAllocationsTable
                rows={draft.rows}
                templateName={draft.name}
                recentlyAddedTickers={recentlyAddedTickers}
                editable={false}
                weightEditable
                onAdd={onAddHolding}
                onWeightChange={onUpdateHoldingWeight}
                onRemove={onRemoveHolding}
              />

            </>
          )}
        </div>
      </div>
      {selection && (
        <SelectionActions
          selection={selection}
          onDismiss={dismissSelection}
          onApply={(instruction) => {
            const quotedText = selection.text.length > 72
              ? `${selection.text.slice(0, 69)}…`
              : selection.text;
            onAddPromptAnnotation(`Change ${selection.context} (“${quotedText}”): ${instruction}`);
            dismissSelection();
          }}
        />
      )}
    </div>
  );
}
