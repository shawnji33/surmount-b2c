'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BuilderHeader } from '@/app/home/builder/_shared/BuilderHeader';
import { DeployOverlay } from '@/app/home/builder/_shared/DeployOverlay';
import { RuleCards } from '@/app/home/builder/_shared/RuleCards';
import { useStrategyBuilderState } from '@/app/home/builder/_shared/useStrategyBuilderState';
import chrome from '@/app/home/builder/_shared/builderPage.module.css';
import { TopOfListAllocationSection } from './TopOfListAllocationSection';
import { BacktestSection } from '../../BacktestSection';
import { useDeploySuccess } from '../../useDeploySuccess';

// The direction under test: the add-asset trigger pinned as the first row of the holdings list
// itself, instead of a pill in the allocation header. Same chrome, same seed data, same state hook
// as HeaderPillVariant so the only thing that differs between the two picker entries is trigger
// placement — see TopOfListAllocationSection for why that required forking AllocationSection's
// shell rather than reusing the production component wholesale.
type Tab = 'Strategy builder' | 'Backtest';
const TABS: Tab[] = ['Strategy builder', 'Backtest'];

const SEED_TICKERS = ['NVDA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'VTI', 'SPOT'];

export function TopOfListVariant() {
  const router = useRouter();
  const state = useStrategyBuilderState();
  const { handleDeployOverlayClose } = useDeploySuccess();
  const [tab, setTab] = useState<Tab>('Strategy builder');
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
        <BuilderHeader title="ETF Builder" onSave={() => {}} onDeploy={() => setDeployOpen(true)} onClose={() => router.push('/proto/etf-builder')} />

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
            <TopOfListAllocationSection
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
            <div className={chrome.rightCol}>
              <RuleCards rules={state.rules} setRules={state.setRules} wrapped />
            </div>
          </div>
        )}

        {tab === 'Backtest' && (
          <div className={chrome.tabPanel} key="backtest">
            <BacktestSection strategyName={state.name} rows={state.rows} totalWeight={state.totalWeight} />
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
