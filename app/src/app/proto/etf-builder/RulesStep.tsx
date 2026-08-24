'use client';

import type { RuleState } from '@/app/home/builder/_shared/types';
import { RuleCards } from '@/app/home/builder/_shared/RuleCards';
import s from './RulesStep.module.css';

export function RulesStep({
  rules,
  setRules,
}: {
  rules: RuleState;
  setRules: (updater: (prev: RuleState) => RuleState) => void;
}) {
  return (
    <div className={s.screen}>
      <h1 className={s.heading}>Set up automation rules</h1>
      <p className={s.sub}>Optional — rebalance on a schedule, cap losses, or lock in gains automatically.</p>
      <RuleCards rules={rules} setRules={setRules} />
    </div>
  );
}
