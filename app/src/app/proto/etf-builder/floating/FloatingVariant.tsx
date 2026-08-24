'use client';

import { useRef, useState } from 'react';
import { RuleCards } from '@/app/home/builder/_shared/RuleCards';
import { BuilderHeader } from '@/app/home/builder/_shared/BuilderHeader';
import { DeployOverlay } from '@/app/home/builder/_shared/DeployOverlay';
import { useStrategyBuilderState } from '@/app/home/builder/_shared/useStrategyBuilderState';
import { AllocationSection } from '@/app/home/builder/_shared/_build/AllocationSection';
import chrome from '@/app/home/builder/_shared/builderPage.module.css';
import { FloatingAddWindow } from './FloatingAddWindow';
import { BacktestSection } from '../BacktestSection';
import { useDeploySuccess } from '../useDeploySuccess';
import s from './FloatingVariant.module.css';

type Tab = 'Strategy builder' | 'Backtest';
const TABS: Tab[] = ['Strategy builder', 'Backtest'];

export function FloatingVariant() {
  const state = useStrategyBuilderState();
  const { handleDeployOverlayClose } = useDeploySuccess();
  const [tab, setTab] = useState<Tab>('Strategy builder');
  const [deployOpen, setDeployOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragBoundsRef = useRef<HTMLDivElement>(null);

  return (
    <main className={chrome.main}>
      <div className={[chrome.desktopOnly, chrome.flowView].join(' ')}>
        <BuilderHeader title="ETF Builder" onSave={() => {}} onDeploy={() => setDeployOpen(true)} onClose={() => {}} />

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
          <div className={s.canvas} ref={canvasRef}>
            <div className={s.canvasRow}>
              <div className={s.mainCol}>
                {state.rows.length === 0 && (
                  <p className={s.emptyHint}>Use the floating "Add assets" window to start building your strategy.</p>
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
              </div>
              <div className={chrome.rightCol}>
                <RuleCards rules={state.rules} setRules={state.setRules} wrapped />
              </div>
            </div>

            {/* Viewport-wide drag boundary (not canvas-relative) so the window can reach every
             * screen corner, inset just enough to keep it from sitting flush against the edge. */}
            <div ref={dragBoundsRef} className={s.dragBounds} aria-hidden="true" />

            <FloatingAddWindow
              expanded={expanded}
              onToggleExpanded={() => setExpanded((v) => !v)}
              selected={state.selected}
              onToggle={state.toggleAsset}
              boundsRef={dragBoundsRef}
            />
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
