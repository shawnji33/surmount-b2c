'use client';

import { ArrowsClockwise, TrendDown, TrendUp } from '@phosphor-icons/react';
import type { RuleState } from '../../_shared/types';
import s from './RuleSummaryList.module.css';

// Read-only counterpart to RuleCards — same three rule names/copy, no toggle/slider controls,
// since a Promptfolio draft is a passive preview until handed off into the real builder.
export function RuleSummaryList({ rules }: { rules: RuleState }) {
  const items = [
    {
      key: 'rebalance',
      icon: ArrowsClockwise,
      label: 'Auto rebalance',
      enabled: rules.rebalance.enabled,
      value: `Every ${rules.rebalance.every} ${rules.rebalance.unit.toLowerCase()}`,
    },
    {
      key: 'stopLoss',
      icon: TrendDown,
      label: 'Stop loss',
      enabled: rules.stopLoss.enabled,
      value: `${rules.stopLoss.percent}% from peak`,
    },
    {
      key: 'takeProfit',
      icon: TrendUp,
      label: 'Take profit',
      enabled: rules.takeProfit.enabled,
      value: `${rules.takeProfit.percent}% gain target`,
    },
  ];

  return (
    <ul className={s.list}>
      {items.map((item) => (
        <li key={item.key} className={[s.row, item.enabled ? '' : s.off].filter(Boolean).join(' ')}>
          <item.icon weight="regular" className={s.icon} aria-hidden="true" />
          <span className={s.label}>{item.label}</span>
          <span className={s.value}>{item.enabled ? item.value : 'Off'}</span>
        </li>
      ))}
    </ul>
  );
}
