'use client';

import type { RuleState } from '../../_shared/types';
import s from './RuleSummaryList.module.css';

export function RuleSummaryList({
  rules,
  onChange,
}: {
  rules: RuleState;
  onChange?: (updater: (current: RuleState) => RuleState) => void;
}) {
  const items = [
    {
      key: 'rebalance' as const,
      label: 'Auto rebalance',
      enabled: rules.rebalance.enabled,
      value: `Every ${rules.rebalance.every} ${rules.rebalance.unit.toLowerCase()}`,
    },
    {
      key: 'stopLoss' as const,
      label: 'Stop loss',
      enabled: rules.stopLoss.enabled,
      value: `${rules.stopLoss.percent}% from peak`,
    },
    {
      key: 'takeProfit' as const,
      label: 'Take profit',
      enabled: rules.takeProfit.enabled,
      value: `${rules.takeProfit.percent}% gain target`,
    },
  ];

  return (
    <ul className={s.list}>
      {items.map((item) => (
        <li
          key={item.key}
          className={s.row}
          data-enabled={item.enabled}
          data-selection-context={`${item.label} rule`}
          data-selection-text={`${item.label}: ${item.enabled ? item.value : 'Off'}`}
        >
          <span className={s.copy}>
            <span className={s.label}>{item.label}</span>
            <span className={s.value}>{item.enabled ? item.value : 'Off'}</span>
          </span>
          {onChange && (
            <button
              type="button"
              role="switch"
              aria-checked={item.enabled}
              aria-label={`${item.enabled ? 'Disable' : 'Enable'} ${item.label}`}
              className={s.switch}
              onClick={() => onChange((current) => ({
                ...current,
                [item.key]: { ...current[item.key], enabled: !current[item.key].enabled },
              }))}
            >
              <span className={s.switchTrack} aria-hidden="true">
                <span className={s.switchThumb} />
              </span>
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
