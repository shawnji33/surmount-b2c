'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BuilderHeader } from '@/app/home/builder/_shared/BuilderHeader';
import { DeployOverlay } from '@/app/home/builder/_shared/DeployOverlay';
import { useStrategyBuilderState } from '@/app/home/builder/_shared/useStrategyBuilderState';
import { AllocationSection } from '@/app/home/builder/_shared/_build/AllocationSection';
import { PickStep } from './PickStep';
import { StepNav, STEPS } from '../StepNav';
import { RulesStep } from '../RulesStep';
import { DeployStep } from '../DeployStep';
import { BacktestSection } from '../BacktestSection';
import { useDeploySuccess } from '../useDeploySuccess';
import chrome from '@/app/home/builder/_shared/builderPage.module.css';
import s from './GuidedVariant.module.css';

export function GuidedVariant() {
  const router = useRouter();
  const state = useStrategyBuilderState();
  const { handleDeployOverlayClose } = useDeploySuccess();
  const [stepIndex, setStepIndex] = useState(0);
  const [maxStepIndex, setMaxStepIndex] = useState(0);
  const [deployOpen, setDeployOpen] = useState(false);

  const current = STEPS[stepIndex].key;

  function goToStep(index: number) {
    if (index < 0 || index >= STEPS.length || index > maxStepIndex) return;
    setStepIndex(index);
  }

  function back() {
    if (stepIndex === 0) {
      router.push('/proto/etf-builder');
      return;
    }
    setStepIndex((i) => i - 1);
  }

  function next() {
    if (current === 'deploy') {
      setDeployOpen(true);
      return;
    }
    const nextIndex = stepIndex + 1;
    setStepIndex(nextIndex);
    setMaxStepIndex((m) => Math.max(m, nextIndex));
  }

  const nextDisabled = current === 'pick' && state.selected.length === 0;

  return (
    <main className={chrome.main}>
      <div className={[chrome.desktopOnly, chrome.flowView, s.root].join(' ')}>
        <BuilderHeader title="ETF Builder" onSave={() => {}} onDeploy={() => setDeployOpen(true)} onClose={() => router.push('/proto/etf-builder')} />

        <StepNav
          current={current}
          maxReachedIndex={maxStepIndex}
          onSelect={goToStep}
          onBack={back}
          onNext={next}
          nextDisabled={nextDisabled}
        />

        {current === 'pick' && (
          <div className={chrome.tabPanel} key="pick">
            <PickStep selected={state.selected} onToggle={state.toggleAsset} />
          </div>
        )}

        {current === 'allocate' && (
          <div className={[chrome.tabPanel, s.stepScreen].join(' ')} key="allocate">
            <AllocationSection
              name={state.name}
              setName={state.setName}
              description={state.description}
              setDescription={state.setDescription}
              rows={state.rows}
              totalWeight={state.totalWeight}
              method={state.method}
              setMethod={state.setMethod}
              setCustomWeight={state.setCustomWeight}
              removeAsset={state.removeAsset}
              selected={state.selected}
              onToggleAsset={state.toggleAsset}
            />
          </div>
        )}

        {current === 'rules' && (
          <div className={chrome.tabPanel} key="rules">
            <RulesStep rules={state.rules} setRules={state.setRules} />
          </div>
        )}

        {current === 'backtest' && (
          <div className={[chrome.tabPanel, s.stepScreen].join(' ')} key="backtest">
            <BacktestSection strategyName={state.name} rows={state.rows} totalWeight={state.totalWeight} />
          </div>
        )}

        {current === 'deploy' && (
          <div className={chrome.tabPanel} key="deploy">
            <DeployStep
              name={state.name}
              description={state.description}
              rows={state.rows}
              totalWeight={state.totalWeight}
              rules={state.rules}
              onDeploy={() => setDeployOpen(true)}
            />
          </div>
        )}
      </div>

      {deployOpen && (
        <DeployOverlay
          strategyName={state.name}
          onClose={() => {
            setDeployOpen(false);
            handleDeployOverlayClose(state.name);
          }}
        />
      )}
    </main>
  );
}
