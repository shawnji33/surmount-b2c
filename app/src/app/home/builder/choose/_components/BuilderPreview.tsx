'use client';

import { useEffect, useState } from 'react';
import { BorderBeam } from 'border-beam';
import type { BuilderSlug } from '../../_data';
import s from './BuilderPreview.module.css';

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const THINK_STATES = [
  'Thinking…',
  'Parsing strategy intent…',
  'Reading market data…',
  'Resolving universe…',
  'Writing code…',
  'Weighting positions…',
  'Applying guardrails…',
  'Running backtest…',
  'Generating summary…',
];

const THINK_HOLD_MS = 2000;
const THINK_SWAP_MS = 150;
const THINK_GAP_MS = 50;

function ThinkingLine() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    const holdId = window.setTimeout(() => {
      setPrev(current);
      setCurrent((i) => (i + 1) % THINK_STATES.length);
      setEntering(true);
    }, THINK_HOLD_MS);
    return () => window.clearTimeout(holdId);
  }, [current]);

  useEffect(() => {
    if (!entering) return undefined;
    const gapId = window.setTimeout(() => setEntering(false), THINK_GAP_MS);
    return () => window.clearTimeout(gapId);
  }, [entering]);

  useEffect(() => {
    if (prev === null) return undefined;
    const clearId = window.setTimeout(() => setPrev(null), THINK_SWAP_MS);
    return () => window.clearTimeout(clearId);
  }, [prev]);

  return (
    <span className={s.think} role="status">
      <span className={s.thinkSizer} aria-hidden="true">Parsing strategy intent…</span>
      {prev !== null && (
        <span key={`prev-${prev}`} className={cx(s.thinkText, s.isExit)} data-text={THINK_STATES[prev]}>
          {THINK_STATES[prev]}
        </span>
      )}
      <span
        key={`current-${current}`}
        className={cx(s.thinkText, entering && s.isEnterStart)}
        data-text={THINK_STATES[current]}
      >
        {THINK_STATES[current]}
      </span>
    </span>
  );
}

// Real logos + real brand colors from the shared ETF Builder asset catalog (public/assets/logos),
// not the generic donut palette — VTI/BND/GLD have no logo assets, so the mock uses tickers this
// app already ships real logos for.
const ALLOC_ROWS = [
  { ticker: 'AAPL', pct: 45, color: '#555555', logo: '/assets/logos/AAPL.webp' },
  { ticker: 'TSLA', pct: 35, color: '#cc0000', logo: '/assets/logos/TSLA.webp' },
  { ticker: 'NVDA', pct: 20, color: '#76b900', logo: '/assets/logos/NVDA.webp' },
];

const AVATAR_LIFT = -4;
const AVATAR_FALLOFF = 0.45;
const AVATAR_SCALE = 1.05;

function EtfMock() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);

  return (
    <div className={cx(s.glassCard, s.etfCard)}>
      <div className={s.cardLabel}>Your allocation</div>
      <div className={s.allocList} data-leaving={leaving} onMouseLeave={() => { setHovered(null); setLeaving(true); }}>
        {ALLOC_ROWS.map((row, i) => {
          const distance = hovered === null ? null : Math.abs(i - hovered);
          const shift = distance === null ? 0 : AVATAR_LIFT * AVATAR_FALLOFF ** distance;
          const scaleActive = hovered === i ? AVATAR_SCALE : 1;
          return (
            <div key={row.ticker} className={s.allocRow}>
              <span
                className={s.avatar}
                style={{ '--shift': `${shift.toFixed(3)}px`, '--scale-active': scaleActive } as React.CSSProperties}
                onMouseEnter={() => { setHovered(i); setLeaving(false); }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.logo} alt="" />
              </span>
              <span className={s.allocTicker}>{row.ticker}</span>
              <span className={s.allocTrack}>
                <span className={s.allocFill} style={{ width: `${row.pct}%`, background: row.color }} />
              </span>
              <span className={s.allocPct}>{row.pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Same IF/branch/action rule diagram used in the investing-agent chat build card (Figma node
// 2193:14503), ported as plain positioned pills + a hand-authored SVG connector instead of
// React Flow — this is a static, always-mounted preview (one of four crossfading mocks), so a
// full canvas instance isn't warranted for four pills that never move.
function NoCodeMock() {
  return (
    <div className={s.logicStage}>
      <svg className={s.connectors} viewBox="0 0 270 200" fill="none" aria-hidden="true">
        <defs>
          <marker id="logicArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L8,4 L0,8 Z" fill="rgba(10, 13, 18, 0.35)" />
          </marker>
        </defs>
        <path d="M14,36 L14,104" stroke="rgba(10, 13, 18, 0.2)" strokeWidth="1.5" markerEnd="url(#logicArrow)" />
        <path d="M14,36 V60 Q14,70 24,70 H40" stroke="rgba(10, 13, 18, 0.2)" strokeWidth="1.5" markerEnd="url(#logicArrow)" />
        <path d="M14,140 V164 Q14,174 24,174 H40" stroke="rgba(10, 13, 18, 0.2)" strokeWidth="1.5" markerEnd="url(#logicArrow)" />
      </svg>

      <div className={cx(s.conditionPill, s.ifPill)}>
        <span className={s.pillLabel}>IF</span>
        <span className={s.pillText}>VEQT drops more than 2% today</span>
        <span className={s.pillHighlight} aria-hidden="true" />
      </div>

      <div className={cx(s.actionPill, s.buy1Pill)}>
        <span>Buy $2,000 of</span>
        <span className={s.actionDetail}>
          <span className={s.actionAvatar} style={{ background: '#96151d' }}>VO</span>
          VOO
        </span>
        <span className={s.pillHighlight} aria-hidden="true" />
      </div>

      <div className={cx(s.conditionPill, s.elsePill)}>
        <span className={s.pillLabel}>ELSE</span>
        <span className={s.pillHighlight} aria-hidden="true" />
      </div>

      <div className={cx(s.actionPill, s.buy2Pill)}>
        <span>Buy $2,000 of</span>
        <span className={s.actionDetail}>
          <span className={s.actionAvatar} style={{ background: '#96151d' }}>VO</span>
          VOO
        </span>
        <span className={s.pillHighlight} aria-hidden="true" />
      </div>
    </div>
  );
}

function CodeMock() {
  return (
    <div className={cx(s.glassCard, s.codeCard)}>
      <div className={s.codeBar} aria-hidden="true">
        <span className={s.codeDot} />
        <span className={s.codeDot} />
        <span className={s.codeDot} />
      </div>
      <pre className={s.codeBody}>
        <code>
          <span className={s.tokComment}>{'# Rebalance when drift exceeds target'}</span>{'\n'}
          <span className={s.tokKeyword}>def</span> <span className={s.tokFunction}>rebalance</span>(portfolio):{'\n'}
          {'    '}<span className={s.tokKeyword}>if</span> portfolio.drift {'>'} <span className={s.tokString}>0.05</span>:{'\n'}
          {'        '}portfolio.<span className={s.tokFunction}>rebalance</span>(){'\n'}
          {'    '}<span className={s.tokKeyword}>return</span> portfolio
        </code>
      </pre>
    </div>
  );
}

function PromptfolioMock() {
  return (
    <div className={s.promptfolioStack}>
      <div className={s.chatBubbleShadowWrap}>
        <BorderBeam size="pulse-inner" colorVariant="colorful" strength={0.6} theme="light">
          <div className={cx(s.glassCard, s.chatBubble)}>
            <span>Build me a dividend growth portfolio with low volatility</span>
            <span className={s.cursor} aria-hidden="true" />
          </div>
        </BorderBeam>
      </div>
      <div className={s.statusRow}>
        <span className={s.statusDot} aria-hidden="true" />
        <ThinkingLine />
      </div>
    </div>
  );
}

const MOCKS: Record<BuilderSlug, () => React.JSX.Element> = {
  etf: EtfMock,
  'no-code': NoCodeMock,
  code: CodeMock,
  promptfolio: PromptfolioMock,
};

const ORDER: BuilderSlug[] = ['etf', 'no-code', 'code', 'promptfolio'];

export function BuilderPreview({ selected }: { selected: BuilderSlug }) {
  return (
    <div className={s.stage}>
      {ORDER.map((slug) => {
        const Mock = MOCKS[slug];
        const hidden = slug !== selected;
        return (
          <div key={slug} className={s.mockLayer} data-hidden={hidden} inert={hidden}>
            <Mock />
          </div>
        );
      })}
    </div>
  );
}
