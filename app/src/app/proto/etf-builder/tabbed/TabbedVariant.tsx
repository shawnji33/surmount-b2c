'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react';
import { BuilderHeader } from '@/app/home/builder/_shared/BuilderHeader';
import { DeployOverlay } from '@/app/home/builder/_shared/DeployOverlay';
import { RuleCards } from '@/app/home/builder/_shared/RuleCards';
import { useStrategyBuilderState } from '@/app/home/builder/_shared/useStrategyBuilderState';
import { AllocationSection } from '@/app/home/builder/_shared/_build/AllocationSection';
import { BacktestSection } from '../BacktestSection';
import { DeployStep } from '../DeployStep';
import { InlineAddAsset } from '../InlineAddAsset';
import { useDeploySuccess } from '../useDeploySuccess';
import chrome from '@/app/home/builder/_shared/builderPage.module.css';
import s from './TabbedVariant.module.css';

// No step nav here (unlike Guided) — same single-screen procedure as the Floating variant: a
// plain two-tab bar, everything (pick, allocate, rules) lives on "Strategy builder", Deploy is
// reached via the header button. The one difference from Floating is how assets get added: a
// dropdown anchored to a trigger row in the allocation column, instead of a draggable window.
//
// Deploy is a two-stage gate: the header button opens the DeployStep review screen (name/positions
// summary, "what happens next", disclaimers) in place of the tab content — not the deposit overlay
// directly — and that screen's own Deploy button is what opens DeployOverlay.
type Tab = 'Strategy builder' | 'Backtest';
const TABS: Tab[] = ['Strategy builder', 'Backtest'];

// Demo starting point: the point of this variant is showing off the add-asset dropdown, which is
// a lot less obvious as a demo when the page opens on an empty "0 assets" state. Seeded once per
// mount via the state hook's own public toggleAsset — not a change to useStrategyBuilderState's
// defaults (that's shared with the real /home/builder route and the other two variants).
const SEED_TICKERS = ['NFLX', 'AAPL', 'AMZN'];

export function TabbedVariant() {
  const router = useRouter();
  const state = useStrategyBuilderState();
  const { handleDeployOverlayClose } = useDeploySuccess();
  const [tab, setTab] = useState<Tab>('Strategy builder');
  const [deployReview, setDeployReview] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    SEED_TICKERS.forEach((ticker) => state.toggleAsset(ticker));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className={chrome.main}>
      <div className={[chrome.desktopOnly, chrome.flowView].join(' ')}>
        <BuilderHeader title="ETF Builder" onSave={() => {}} onDeploy={() => setDeployReview(true)} onClose={() => router.push('/proto/etf-builder')} />

        {deployReview ? (
          <div className={[chrome.tabPanel, s.stepScreen].join(' ')}>
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
            <div className={chrome.tabs}>
              {TABS.map((tabName) => (
                <button
                  type="button"
                  key={tabName}
                  className={[chrome.tab, tab === tabName ? chrome.tabActive : ''].filter(Boolean).join(' ')}
                  onClick={() => setTab(tabName)}
                >
                  {tabName}
                </button>
              ))}
            </div>

            {tab === 'Strategy builder' && (
              <div className={chrome.builderRow}>
                <div className={s.leftCol}>
                  {state.rows.length === 0 && (
                    <p className={s.emptyHint}>Use &quot;Add an asset&quot; below to start building your strategy.</p>
                  )}
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
                  <InlineAddAsset selected={state.selected} onToggle={state.toggleAsset} />
                </div>
                <div className={chrome.rightCol}>
                  <RuleCards rules={state.rules} setRules={state.setRules} wrapped />
                </div>
              </div>
            )}

            {tab === 'Backtest' && (
              <div className={[chrome.tabPanel, s.stepScreen].join(' ')} key="backtest">
                <BacktestSection strategyName={state.name} rows={state.rows} totalWeight={state.totalWeight} />
              </div>
            )}
          </>
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
