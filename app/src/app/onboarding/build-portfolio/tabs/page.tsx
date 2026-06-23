'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check } from '@phosphor-icons/react';
import { usePortfolioBuilder } from '../_components/usePortfolioBuilder';
import StrategyBrowser from '../_components/StrategyBrowser';
import AllocationPanel from '../_components/AllocationPanel';
import OverviewPanel from '../_components/OverviewPanel';
import StrategyDetailDrawer from '../_components/StrategyDetailDrawer';
import { TopBar } from '../_components/BuildChrome';
import p from '../_components/panels.module.css';
import s from './tabs.module.css';

const STEPS = [
  { id: 'browse', label: 'Browse', title: 'Choose your strategies', sub: 'Browse the available strategies and add any you’d like to invest in.' },
  { id: 'allocate', label: 'Allocate', title: 'Allocate your investment', sub: 'Set how much of your investment goes to each strategy.' },
  { id: 'overview', label: 'Overview', title: 'Review your portfolio', sub: 'Here’s your blended exposure across the strategies you picked.' },
] as const;

const NEXT_PAGE = '/onboarding/fund-account';
const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 });
type TransitionClass = '' | 'leaveForward' | 'leaveBackward' | 'enterForward' | 'enterBackward';

export default function TabsGuidedLayout() {
  const builder = usePortfolioBuilder();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [tc, setTc] = useState<TransitionClass>('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const canContinue = step === 0 ? builder.selected.length > 0 : true;

  const change = (next: number, dir: 1 | -1) => {
    clearTimeout(timer.current);
    setTc(dir > 0 ? 'leaveForward' : 'leaveBackward');
    timer.current = setTimeout(() => {
      setStep(next);
      setTc(dir > 0 ? 'enterForward' : 'enterBackward');
      requestAnimationFrame(() => requestAnimationFrame(() => setTc('')));
    }, 200);
  };

  const goNext = () => { if (isLast) router.push(NEXT_PAGE); else change(step + 1, 1); };
  const goBack = () => { if (step > 0) change(step - 1, -1); };

  return (
    <div className={s.shell}>
      <TopBar />
      <div className={s.scroll}>
        <div className={s.container}>
          <header className={s.header}>
            <h1 className={s.title}>Build your portfolio</h1>
            <p className={s.subtitle}>Three quick steps: choose strategies, allocate your investment, and review.</p>
          </header>

          {/* Guided stepper */}
          <nav className={s.stepper} aria-label="Build steps">
            {STEPS.map((st, i) => {
              const state = i < step ? 'done' : i === step ? 'current' : 'upcoming';
              return (
                <div key={st.id} className={s.stepWrap}>
                  <button
                    type="button"
                    className={s.step}
                    data-state={state}
                    onClick={() => i < step && change(i, -1)}
                    disabled={i >= step}
                    aria-current={i === step ? 'step' : undefined}
                  >
                    <span className={s.stepDot} data-state={state}>
                      {i < step ? <Check weight="bold" aria-hidden="true" /> : i + 1}
                    </span>
                    <span className={s.stepLabel} data-state={state}>
                      {st.label}
                      {st.id === 'browse' && builder.selected.length > 0 && (
                        <span className={s.stepCount}>{builder.selected.length}</span>
                      )}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && <span className={s.stepLine} data-done={i < step} />}
                </div>
              );
            })}
          </nav>

          {/* Summary strip */}
          <div className={s.summary}>
            <div className={s.summaryItem}>
              <span className={s.sLabel}>Strategies</span>
              <span className={s.sValue}>{builder.selected.length}</span>
            </div>
            <div className={s.divider} />
            <div className={s.summaryItem}>
              <span className={s.sLabel}>Investment</span>
              <span className={s.sValue}>${fmt(builder.amount)}</span>
            </div>
            <div className={s.divider} />
            <div className={s.summaryItem}>
              <span className={s.sLabel}>Allocated</span>
              <span className={s.sValue}>{builder.isFullyAllocated ? '100%' : `$${fmt(builder.allocated)}`}</span>
            </div>
          </div>

          {/* Active step */}
          <div className={[s.stepView, tc ? s[tc] : ''].filter(Boolean).join(' ')}>
            <div className={s.stepHead}>
              <h2 className={s.stepTitle}>{current.title}</h2>
              <p className={s.stepSub}>{current.sub}</p>
            </div>
            {current.id === 'browse' && (
              <div className={s.browserArea}>
                <StrategyBrowser builder={builder} />
              </div>
            )}
            {current.id === 'allocate' && (
              <div className={`${p.card} ${s.padCard}`}>
                <AllocationPanel builder={builder} />
              </div>
            )}
            {current.id === 'overview' && (
              <div className={`${p.card} ${s.padCard}`}>
                <OverviewPanel builder={builder} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guided footer */}
      <div className={s.footer}>
        {step === 0 ? (
          <button type="button" className={s.skip} onClick={() => router.push(NEXT_PAGE)}>Skip for now</button>
        ) : (
          <button type="button" className={s.back} onClick={goBack}>
            <ArrowLeft weight="bold" aria-hidden="true" />
            Back
          </button>
        )}
        <button type="button" className={s.continue} onClick={goNext} disabled={!canContinue}>
          {isLast ? 'Continue' : `Continue to ${STEPS[step + 1].label.toLowerCase()}`}
          <ArrowRight weight="bold" aria-hidden="true" />
        </button>
      </div>

      <StrategyDetailDrawer builder={builder} />
    </div>
  );
}
