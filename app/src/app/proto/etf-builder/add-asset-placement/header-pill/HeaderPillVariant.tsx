'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BuilderHeader } from '@/app/home/builder/_shared/BuilderHeader';
import { DeployOverlay } from '@/app/home/builder/_shared/DeployOverlay';
import { RuleCards } from '@/app/home/builder/_shared/RuleCards';
import { useStrategyBuilderState } from '@/app/home/builder/_shared/useStrategyBuilderState';
import { AllocationSection } from '@/app/home/builder/_shared/_build/AllocationSection';
import chrome from '@/app/home/builder/_shared/builderPage.module.css';
import { BacktestSection } from '../../BacktestSection';
import { useDeploySuccess } from '../../useDeploySuccess';

// Baseline for the add-asset-placement comparison — the already-shipped fix. Renders the real,
// unmodified production AllocationSection, which already carries AddAssetPill in its header (left
// of the Equal/Custom tabs). Nothing about it is reimplemented here; the whole point of this
// variant is proving the comparison is fair by using the exact component that's live today.
type Tab = 'Strategy builder' | 'Backtest';
const TABS: Tab[] = ['Strategy builder', 'Backtest'];

// Worst-case seed: 8 holdings (mixed stocks/ETFs, one long ETF name) so the list has real height
// and scroll to judge trigger placement against — an empty or 2-row list hides the problem this
// comparison exists to answer. Seeded once per mount via the state hook's own public toggleAsset,
// same technique as the sibling etf-builder prototypes (TabbedVariant's SEED_TICKERS).
const SEED_TICKERS = ['NVDA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'VTI', 'SPOT'];

export function HeaderPillVariant() {
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
