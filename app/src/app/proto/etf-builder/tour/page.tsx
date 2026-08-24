'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { CaretRight } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/Button';
import { Donut, donutColor } from '@/app/home/builder/_shared/_build/Donut';
import { ASSET_UNIVERSE } from '@/app/home/builder/_data';
import s from './page.module.css';

// Separate from the builder flow itself — a first-time-visitor preview of what the ETF Builder
// can do, one screen per step (pick, allocate, rules, backtest, deploy). Modeled on
// /onboarding/tour(-2/-3)'s shell/card/copyCol/previewCol pattern, but the step transition itself
// follows tour-3's own technique (phase state + motion.div `animate` retarget), not
// AnimatePresence — this repo's experimental React build silently drops AnimatePresence's exit
// animations (same issue already hit and fixed in FloatingAddWindow this session), so content
// stays permanently mounted and crossfades by re-pointing one motion.div's `animate` target.

function asset(ticker: string) {
  return ASSET_UNIVERSE.find((a) => a.ticker === ticker);
}

function PickVisual() {
  const rows = [
    { ticker: 'NFLX', added: true },
    { ticker: 'AAPL', added: true },
    { ticker: 'AMZN', added: false },
    { ticker: 'GOOGL', added: false },
  ];
  return (
    <div className={s.mockList}>
      {rows.map((row) => {
        const a = asset(row.ticker);
        return (
          <div className={s.mockRow} key={row.ticker}>
            <span className={s.mockAvatar}>
              {a?.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.logo} alt="" />
              ) : (
                <span style={{ display: 'block', width: '100%', height: '100%', background: a?.fallbackColor }} />
              )}
            </span>
            <div className={s.mockRowText}>
              <span className={s.mockTicker}>{row.ticker} · {a?.name}</span>
              <span className={s.mockReturn}>{a?.returnPct} today</span>
            </div>
            <span className={[s.mockPill, row.added ? s.mockPillDone : ''].filter(Boolean).join(' ')}>
              {row.added ? 'Added' : 'Add'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function AllocateVisual() {
  const rows = [
    { ticker: 'NFLX', weight: 40 },
    { ticker: 'AAPL', weight: 35 },
    { ticker: 'AMZN', weight: 25 },
  ];
  return (
    <div className={s.mockAllocateRow}>
      <div className={s.mockDonutWrap}>
        <Donut rows={rows} totalWeight={100} hovered={null} onHover={() => {}} />
      </div>
      <div className={s.mockAllocList}>
        {rows.map((row, i) => (
          <div className={s.mockAllocRow} key={row.ticker}>
            <span className={s.mockDot} style={{ background: donutColor(i) }} />
            <span className={s.mockAllocTicker}>{row.ticker}</span>
            <span className={s.mockAllocPct}>{row.weight}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RulesVisual() {
  return (
    <div className={s.mockList}>
      <div className={s.mockRuleCard}>
        <div className={s.mockRuleText}>
          <span className={s.mockRuleTitle}>Auto rebalance</span>
          <span className={s.mockRuleDesc}>Every 30 days</span>
        </div>
        <span className={s.mockToggle} />
      </div>
      <div className={s.mockRuleCard}>
        <div className={s.mockRuleText}>
          <span className={s.mockRuleTitle}>Stop loss</span>
          <span className={s.mockRuleDesc}>At 20% from peak</span>
        </div>
        <span className={s.mockSlider}><span className={s.mockSliderFill} /></span>
      </div>
      <div className={s.mockRuleCard}>
        <div className={s.mockRuleText}>
          <span className={s.mockRuleTitle}>Take profit</span>
          <span className={s.mockRuleDesc}>Off</span>
        </div>
        <span className={[s.mockToggle, s.mockToggleOff].join(' ')} />
      </div>
    </div>
  );
}

function BacktestVisual() {
  return (
    <div className={s.mockChartCard}>
      <div className={s.mockStatRow}>
        <div className={s.mockStat}>
          <span className={s.mockStatLabel}>Historical returns</span>
          <span className={[s.mockStatVal, s.mockStatPos].join(' ')}>+18.4%</span>
        </div>
        <div className={s.mockStat}>
          <span className={s.mockStatLabel}>vs. S&amp;P 500</span>
          <span className={[s.mockStatVal, s.mockStatNeutral].join(' ')}>+9.1%</span>
        </div>
      </div>
      <svg className={s.mockChartSvg} viewBox="0 0 400 100" fill="none" aria-hidden="true">
        <path d="M0 80 L60 68 L120 74 L180 48 L240 55 L300 22 L360 30 L400 10" stroke="var(--color-utility-brand-600)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M0 88 L60 84 L120 86 L180 74 L240 78 L300 60 L360 64 L400 52" stroke="var(--color-fg-quaternary-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function DeployVisual() {
  const rows = ['NFLX', 'AAPL', 'AMZN', 'GOOGL'];
  return (
    <div className={s.mockList}>
      <div className={s.mockDeployCard}>
        <div className={s.mockDeployName}>Strategy name</div>
        <div className={s.mockDeployDesc}>A brief description of this strategy</div>
        <div className={s.mockDeployStatRow}>
          <div className={s.mockStat}>
            <span className={s.mockStatLabel}>Positions</span>
            <span className={s.mockStatVal}>{rows.length}</span>
          </div>
          <div className={s.mockStat}>
            <span className={s.mockStatLabel}>Allocated</span>
            <span className={[s.mockStatVal, s.mockStatPos].join(' ')}>100%</span>
          </div>
          <div className={s.mockStat}>
            <span className={s.mockStatLabel}>Active rules</span>
            <span className={s.mockStatVal}>2</span>
          </div>
        </div>
      </div>
      <div className={s.mockDeployBtn}>Deploy <CaretRight weight="bold" /></div>
    </div>
  );
}

const STEPS: { title: string; desc: string; Visual: () => ReactNode }[] = [
  {
    title: 'Pick your assets',
    desc: 'Search stocks and ETFs, filter by price, market cap, or yield, and build your starting lineup.',
    Visual: PickVisual,
  },
  {
    title: 'Allocate your assets',
    desc: "Set weights automatically, or fine-tune each position by hand — we'll keep the total at 100% for you.",
    Visual: AllocateVisual,
  },
  {
    title: 'Set custom rules',
    desc: 'Automate rebalancing, cap losses with a stop-loss, or lock in gains — all optional, all adjustable later.',
    Visual: RulesVisual,
  },
  {
    title: 'Backtest your strategy',
    desc: 'See how your exact allocation would have performed historically against the S&P 500 before you commit.',
    Visual: BacktestVisual,
  },
  {
    title: 'Deploy with confidence',
    desc: "Go live in a few clicks. Keep investing or withdraw anytime — the strategy runs on its own after that.",
    Visual: DeployVisual,
  },
];

// Exit runs faster than enter (the outgoing step doesn't need the viewer's full attention), and
// both columns share identical timing since they change together as one unit.
const EXIT_DURATION_MS = 160;
const EXIT_TARGET = { opacity: 0, x: -10, filter: 'blur(2px)' };
const ENTER_TARGET = { opacity: 1, x: 0, filter: 'blur(0px)' };
const EXIT_TRANSITION = { duration: 0.16, ease: [0.22, 1, 0.36, 1] as const };
const ENTER_TRANSITION = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };

export default function EtfBuilderTourPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [displayStep, setDisplayStep] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'exiting'>('idle');
  const isLast = displayStep === STEPS.length - 1;
  const current = STEPS[displayStep];
  const Visual = current.Visual;

  function goToStep(next: number) {
    if (next < 0 || next >= STEPS.length || next === displayStep || phase === 'exiting') return;
    if (shouldReduceMotion) {
      setDisplayStep(next);
      return;
    }
    setPhase('exiting');
    window.setTimeout(() => {
      setDisplayStep(next);
      setPhase('idle');
    }, EXIT_DURATION_MS);
  }

  function handleContinue() {
    if (isLast) {
      router.push('/proto/etf-builder');
      return;
    }
    goToStep(displayStep + 1);
  }

  const animateTarget = phase === 'exiting' ? EXIT_TARGET : ENTER_TARGET;
  const transition = shouldReduceMotion ? { duration: 0 } : phase === 'exiting' ? EXIT_TRANSITION : ENTER_TRANSITION;

  return (
    <div className={s.shell}>
      <div className={s.container}>
        <div className={s.card}>
          <div className={s.stepBadge}>
            <p className={s.stepBadgeText}>{displayStep + 1} of {STEPS.length}</p>
          </div>

          <button type="button" className={s.skipLink} onClick={() => router.push('/proto/etf-builder')}>
            Skip tour
          </button>

          <div className={s.copyCol}>
            <motion.div className={s.copyText} initial={ENTER_TARGET} animate={animateTarget} transition={transition}>
              <h1 className={s.stepTitle}>{current.title}</h1>
              <p className={s.stepDesc}>{current.desc}</p>
            </motion.div>
            <Button
              type="button"
              size="sm"
              fullWidth={false}
              iconTrailing={<CaretRight weight="regular" aria-hidden="true" />}
              onClick={handleContinue}
            >
              {isLast ? 'Start building' : 'Continue'}
            </Button>
          </div>

          <div className={s.previewCol}>
            <motion.div className={s.previewInner} initial={ENTER_TARGET} animate={animateTarget} transition={transition}>
              <Visual />
            </motion.div>
          </div>
        </div>
      </div>

      <footer className={s.footer}>
        <p className={s.copyright}>©Surmount AI</p>
      </footer>
    </div>
  );
}
