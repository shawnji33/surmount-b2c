'use client';

import { ArrowLeft, ArrowRight, Check, MagnetStraight, Rocket, Scales, ChartLineUp, Gear } from '@phosphor-icons/react';
import s from './StepNav.module.css';

export type StepKey = 'pick' | 'allocate' | 'rules' | 'backtest' | 'deploy';

export const STEPS: { key: StepKey; label: string; icon: typeof MagnetStraight }[] = [
  { key: 'pick', label: 'Pick assets', icon: MagnetStraight },
  { key: 'allocate', label: 'Allocate assets', icon: Scales },
  { key: 'rules', label: 'Custom rules', icon: Gear },
  { key: 'backtest', label: 'Backtest', icon: ChartLineUp },
  { key: 'deploy', label: 'Deploy', icon: Rocket },
];

export function StepNav({
  current,
  maxReachedIndex,
  onSelect,
  onBack,
  onNext,
  nextDisabled = false,
}: {
  current: StepKey;
  maxReachedIndex: number;
  onSelect: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  const currentIndex = STEPS.findIndex((step) => step.key === current);
  const isLastStep = currentIndex === STEPS.length - 1;

  return (
    <div className={s.nav}>
      <button type="button" className={[s.edgeBtn, s.backBtn].join(' ')} onClick={onBack}>
        <ArrowLeft weight="regular" />
        Back
      </button>

      <div className={s.pills} role="tablist" aria-label="Strategy builder steps">
        {STEPS.map((step, index) => {
          const isActive = step.key === current;
          const isDone = index < maxReachedIndex;
          const isReachable = index <= maxReachedIndex;
          const Icon = isDone ? Check : step.icon;
          return (
            <button
              type="button"
              key={step.key}
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? 'step' : undefined}
              disabled={!isReachable}
              className={[s.pill, isActive ? s.pillActive : '', isDone ? s.pillDone : ''].filter(Boolean).join(' ')}
              onClick={() => isReachable && onSelect(index)}
            >
              <Icon weight={isDone ? 'bold' : 'regular'} />
              {step.label}
            </button>
          );
        })}
      </div>

      {/* DeployStep already has its own "Deploy strategy" CTA, so this button would just be a
       * second, redundant Deploy trigger on the last step. Kept mounted (visibility:hidden, out
       * of the tab order) rather than unmounted so the pills stay centered in the row instead of
       * drifting once justify-content:space-between only has two children left. */}
      <button
        type="button"
        className={[s.edgeBtn, s.nextBtn].join(' ')}
        onClick={onNext}
        disabled={nextDisabled}
        style={isLastStep ? { visibility: 'hidden' } : undefined}
        tabIndex={isLastStep ? -1 : undefined}
        aria-hidden={isLastStep || undefined}
      >
        Next
        <ArrowRight weight="regular" />
      </button>
    </div>
  );
}
