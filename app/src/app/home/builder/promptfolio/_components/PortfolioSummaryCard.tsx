'use client';

import type { PromptfolioDraft } from '../_data';
import s from './PortfolioSummaryCard.module.css';

const MAX_NAMED_SEGMENTS = 3;

function rulesSummary(draft: PromptfolioDraft) {
  return [
    draft.rules.rebalance.enabled
      ? `Rebalances every ${draft.rules.rebalance.every} ${draft.rules.rebalance.unit.toLowerCase()}`
      : 'No automatic rebalancing',
    draft.rules.stopLoss.enabled ? `${draft.rules.stopLoss.percent}% stop loss` : 'no stop loss',
    draft.rules.takeProfit.enabled ? `${draft.rules.takeProfit.percent}% take profit` : 'no take-profit target',
  ].join(' · ');
}

function allocationSegments(rows: PromptfolioDraft['rows']) {
  const sorted = [...rows].sort((a, b) => b.weight - a.weight);
  const named = sorted.slice(0, MAX_NAMED_SEGMENTS);

  if (sorted.length <= MAX_NAMED_SEGMENTS) return named;

  return [
    ...named,
    {
      ticker: 'Others',
      weight: sorted.slice(MAX_NAMED_SEGMENTS).reduce((sum, row) => sum + row.weight, 0),
    },
  ];
}

export function PortfolioSummaryCard({
  draft,
  revealStage,
}: {
  draft: PromptfolioDraft;
  revealStage: number;
}) {
  const segments = allocationSegments(draft.rows);

  return (
    <section className={s.card} aria-label="Generated strategy overview">
      <header className={s.header}>Strategy overview</header>

      <div className={s.sections}>
        {revealStage >= 1 && (
          <div className={s.section}>
            <div className={s.sectionBody}>
              <strong className={s.strategyName}>{draft.name}</strong>
              <span className={s.description}>{draft.description}</span>
            </div>
          </div>
        )}

        {revealStage >= 2 && (
          <div className={s.section}>
            <span className={s.sectionLabel}>Holdings</span>
            <div className={s.holdingsComposition}>
              <span
                className={s.allocationBar}
                role="img"
                aria-label={segments.map((segment) => `${segment.ticker} ${segment.weight}%`).join(', ')}
              >
                {segments.map((segment, index) => (
                  <span
                    key={segment.ticker}
                    data-tone={index % 4}
                    style={{ width: `${segment.weight}%` }}
                  />
                ))}
              </span>

              <ul className={s.allocationLegend} aria-label="Holdings allocation">
                {segments.map((segment, index) => (
                  <li key={segment.ticker}>
                    <span className={s.legendDot} data-tone={index % 4} aria-hidden="true" />
                    <span>{segment.ticker}</span>
                    <span className={s.legendWeight}>{segment.weight}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {revealStage >= 3 && (
          <div className={s.section}>
            <span className={s.sectionLabel}>Rules</span>
            <p className={s.ruleSummary}>{rulesSummary(draft)}</p>
          </div>
        )}
      </div>
    </section>
  );
}
