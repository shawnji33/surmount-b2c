'use client';

import type { ReactNode } from 'react';
import { useLayoutEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react';
import { RuleCards } from './RuleCards';
import { BuilderHeader } from './BuilderHeader';
import { DeployOverlay } from './DeployOverlay';
import { DeployStep } from './DeployStep';
import { RunBacktestFirstModal } from './RunBacktestFirstModal';
import { ExitConfirmModal } from './ExitConfirmModal';
import { BacktestPanel } from './BacktestPanel';
import { useStrategyBuilderState } from './useStrategyBuilderState';
import { useDeploySuccess } from './useDeploySuccess';
import { useToast } from '../../_components/ToastProvider';
import { MobileNotice } from '../_components/MobileNotice';
import { PickStocksStep } from './_steps/PickStocksStep';
import { AllocationSection } from './_build/AllocationSection';
import s from './builderPage.module.css';

export type BuilderTab = 'Strategy builder' | 'Logic builder' | 'Backtest';

type BuilderWorkspaceProps = {
  title: string;
  tabs: readonly BuilderTab[];
  /* A render prop, not a node: the Logic builder needs the assets picked on the
   * Strategy builder tab, and that state lives here. */
  logicContent?: (ctx: { selectedAssets: string[] }) => ReactNode;
};

export function BuilderWorkspace({ title, tabs, logicContent }: BuilderWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // TEMP: figma capture — allow ?step=build[&tab=logic|backtest] to land straight on a given
  // view instead of the Pick Stocks step.
  const captureStep = searchParams.get('step') === 'build' ? 'build' : 'pick';
  const tabParam = searchParams.get('tab');
  const captureTab: BuilderTab =
    tabParam === 'backtest' && tabs.includes('Backtest')
      ? 'Backtest'
      : tabParam === 'logic' && tabs.includes('Logic builder')
        ? 'Logic builder'
        : 'Strategy builder';

  const state = useStrategyBuilderState();
  const { handleDeployOverlayClose } = useDeploySuccess();
  const { showToast } = useToast();
  const [step, setStep] = useState<'pick' | 'build'>(captureStep);
  const [tab, setTab] = useState<BuilderTab>(captureTab);
  const [deployOpen, setDeployOpen] = useState(false);
  const [deployReview, setDeployReview] = useState(false);
  const [hasBacktestRun, setHasBacktestRun] = useState(false);
  const [runBacktestModalOpen, setRunBacktestModalOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [stepMotion, setStepMotion] = useState(false);
  const [tabMotion, setTabMotion] = useState(false);

  // The shared dashboard shell paints no background of its own, so the builder surface needs to
  // temporarily own the page background while this route is mounted.
  useLayoutEffect(() => {
    const previousBackground = document.body.style.background;
    document.body.style.background = 'var(--color-bg-tertiary, #f5f5f5)';
    return () => {
      document.body.style.background = previousBackground;
    };
  }, []);

  function goToBuildStep() {
    setStepMotion(true);
    setStep('build');
  }

  function selectTab(nextTab: BuilderTab) {
    if (nextTab === tab) return;
    setTabMotion(true);
    setTab(nextTab);
  }

  function handleDeployClick() {
    if (!hasBacktestRun) {
      setRunBacktestModalOpen(true);
      return;
    }
    setDeployReview(true);
  }

  function goToBacktestFromModal() {
    setRunBacktestModalOpen(false);
    selectTab('Backtest');
  }

  function handleSave() {
    state.markSaved();
    showToast(`"${state.name || 'Strategy'}" has been saved`);
  }

  function handleSaveAndExit() {
    setExitModalOpen(false);
    state.markSaved();
    showToast(`"${state.name || 'Strategy'}" has been saved`);
    router.push('/home/builder');
  }

  function handleExitWithoutSaving() {
    setExitModalOpen(false);
    router.push('/home/builder');
  }

  if (step === 'pick') {
    return (
      <main className={s.main}>
        <div className={[s.desktopOnly, s.flowView].join(' ')} data-motion="false">
          <PickStocksStep
            selected={state.selected}
            onToggle={state.toggleAsset}
            onNext={goToBuildStep}
          />
        </div>
        <MobileNotice />
      </main>
    );
  }

  return (
    <main className={s.main}>
      <div className={[s.desktopOnly, s.flowView].join(' ')} data-motion={stepMotion ? 'true' : 'false'}>
        <BuilderHeader
          title={title}
          onSave={handleSave}
          saveDisabled={!state.isDirty}
          onDeploy={handleDeployClick}
          onClose={() => setExitModalOpen(true)}
        />

        {deployReview ? (
          <div className={[s.tabPanel, s.reviewScreen].join(' ')}>
            <button type="button" className={s.reviewBack} onClick={() => setDeployReview(false)}>
              <ArrowLeft weight="regular" />
              Back
            </button>
            <DeployStep
              name={state.name}
              description={state.description}
              rows={state.rows}
              totalWeight={state.totalWeight}
              rules={state.rules}
              onDeploy={() => setDeployOpen(true)}
            />
          </div>
        ) : (
          <>
            <div className={s.tabs} data-motion={tabMotion ? 'true' : 'false'}>
              {tabs.map((tabName) => (
                <button
                  type="button"
                  key={tabName}
                  className={[s.tab, tab === tabName ? s.tabActive : ''].filter(Boolean).join(' ')}
                  onClick={() => selectTab(tabName)}
                >
                  {tabName}
                </button>
              ))}
            </div>

            {tab === 'Strategy builder' && (
              <div className={[s.builderRow, s.tabPanel].join(' ')} data-motion={tabMotion ? 'true' : 'false'} key="strategy">
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
                <div className={s.rightCol}>
                  <RuleCards rules={state.rules} setRules={state.setRules} wrapped />
                </div>
              </div>
            )}

            {tab === 'Logic builder' && logicContent && (
              <div className={s.tabPanel} data-motion={tabMotion ? 'true' : 'false'} key="logic">
                {logicContent({ selectedAssets: state.selected })}
              </div>
            )}

            {tab === 'Backtest' && (
              <div className={s.tabPanel} data-motion={tabMotion ? 'true' : 'false'} key="backtest">
                <BacktestPanel
                  strategyName={state.name}
                  rows={state.rows}
                  totalWeight={state.totalWeight}
                  startDate={state.backtestStartDate}
                  endDate={state.backtestEndDate}
                  onDateChange={(start, end) => { state.setBacktestStartDate(start); state.setBacktestEndDate(end); }}
                  amount={state.backtestAmount}
                  setAmount={state.setBacktestAmount}
                  slippage={state.backtestSlippage}
                  setSlippage={state.setBacktestSlippage}
                  status={state.backtestStatus}
                  setStatus={state.setBacktestStatus}
                  result={state.backtestResult}
                  setResult={state.setBacktestResult}
                  rangeTab={state.backtestRangeTab}
                  setRangeTab={state.setBacktestRangeTab}
                  onRunComplete={() => setHasBacktestRun(true)}
                />
              </div>
            )}
          </>
        )}
      </div>

      <MobileNotice />

      {runBacktestModalOpen && (
        <RunBacktestFirstModal
          onClose={() => setRunBacktestModalOpen(false)}
          onGoToBacktest={goToBacktestFromModal}
        />
      )}

      {deployOpen && (
        <DeployOverlay
          strategyName={state.name}
          onClose={() => {
            setDeployOpen(false);
            handleDeployOverlayClose(state.name);
          }}
        />
      )}

      {exitModalOpen && (
        <ExitConfirmModal
          onClose={() => setExitModalOpen(false)}
          onSaveAndExit={handleSaveAndExit}
          onExitWithoutSaving={handleExitWithoutSaving}
        />
      )}
    </main>
  );
}
