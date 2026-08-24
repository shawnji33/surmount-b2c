'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChartLineUp, Code, FlowArrow, MagicWand, Plus, Sparkle, SquaresFour } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { HomeShell } from '@/app/home/HomeShell';
import { MY_STRATEGIES, type StrategyCardData } from '@/app/home/builder/_data';
import { ChooseBuilderModal } from '@/app/home/builder/_components/ChooseBuilderModal';
import s from './page.module.css';

const TABS = ['Active strategies', 'My strategies', 'Favorite strategies'] as const;

function StrategyCard({ strategy, compact = false }: { strategy: StrategyCardData; compact?: boolean }) {
  return (
    <Link href={`/home/strategy/${strategy.id}`} className={[s.strategyCard, compact ? s.strategyCardCompact : ''].filter(Boolean).join(' ')}>
      <div className={s.cardTop}>
        <div className={s.cardNameGroup}>
          <div className={s.cardName}>{strategy.name}</div>
          <div className={s.cardDesc}>{strategy.desc}</div>
        </div>
        <div className={s.cardAumGroup}><strong>{strategy.aumValue}</strong><span>AUM</span></div>
      </div>
      {!compact && <><div className={s.cardDivider} /><div className={s.cardRows}>
        <div><span>Total return</span><strong>{strategy.returnAbs} ({strategy.returnPct})</strong></div>
        <div><span>Related accounts</span><BrokerAvatars sources={strategy.brokers} /></div>
        <div><span>Next rebalance</span><span className={s.rebalance}><i aria-hidden="true" />In {strategy.nextRebalanceDays} days</span></div>
      </div></>}
      {compact && <div className={s.compactMeta}><span className={s.return}>{strategy.returnPct}</span><span>Rebalances in {strategy.nextRebalanceDays} days</span><BrokerAvatars sources={strategy.brokers} /></div>}
    </Link>
  );
}

function BrokerAvatars({ sources }: { sources: string[] }) {
  return <div className={s.cardAvatars} aria-label={`${sources.length} related accounts`}>
    {sources.map((src) => <span className={s.cardAvatar} key={src}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={src} alt="" /></span>)}
  </div>;
}

function SectionHeader({ onBuild, tab, setTab, title = 'Your strategies', detail }: { onBuild: () => void; tab: (typeof TABS)[number]; setTab: (tab: (typeof TABS)[number]) => void; title?: string; detail?: string }) {
  return <header className={s.pageHeader}>
    <div className={s.headerTop}>
      <div><p className={s.eyebrow}>Create</p><h1>{title}</h1>{detail && <p className={s.headerDetail}>{detail}</p>}</div>
      <Button type="button" fullWidth={false} iconLeading={<Plus weight="bold" />} onClick={onBuild}>New strategy</Button>
    </div>
    <div className={s.tabs} role="tablist" aria-label="Strategy groups">
      {TABS.map((item) => <button key={item} type="button" role="tab" aria-selected={item === tab} className={item === tab ? s.tabActive : s.tab} onClick={() => setTab(item)}>{item}</button>)}
    </div>
  </header>;
}

function LibraryLayout({ strategies, onBuild, tab, setTab }: LayoutProps) {
  return <>
    <SectionHeader onBuild={onBuild} tab={tab} setTab={setTab} title="Create a strategy" detail="Pick up an existing strategy or begin something new." />
    <section className={s.libraryGrid} aria-label="Strategy library">
      <button type="button" className={s.libraryStart} onClick={onBuild}>
        <span className={s.libraryStartIcon}><Plus weight="bold" /></span>
        <span><strong>Build a new strategy</strong><small>Start with ETFs, rules, code, or an idea.</small></span>
        <ArrowRight weight="regular" aria-hidden="true" />
      </button>
      {strategies.map((strategy) => <StrategyCard strategy={strategy} key={strategy.id} />)}
    </section>
  </>;
}

function LaunchpadLayout({ strategies, onBuild, tab, setTab }: LayoutProps) {
  return <>
    <SectionHeader onBuild={onBuild} tab={tab} setTab={setTab} title="Create" />
    <section className={s.launchpad} aria-labelledby="launchpad-title">
      <div className={s.launchIntro}><span className={s.launchIcon}><MagicWand weight="regular" /></span><div><p className={s.eyebrow}>Start here</p><h2 id="launchpad-title">How would you like to build?</h2><p>Choose the creation path that matches how you think about your strategy.</p></div></div>
      <div className={s.builderChoices}>
        <button type="button" onClick={onBuild}><span><SquaresFour weight="regular" /></span><strong>ETF Builder</strong><small>Select and weight holdings visually.</small><ArrowRight weight="regular" aria-hidden="true" /></button>
        <button type="button" onClick={onBuild}><span><FlowArrow weight="regular" /></span><strong>No-Code Builder</strong><small>Combine investing rules without code.</small><ArrowRight weight="regular" aria-hidden="true" /></button>
        <button type="button" onClick={onBuild}><span><Sparkle weight="regular" /></span><strong>Start with AI</strong><small>Turn an investing idea into a draft.</small><ArrowRight weight="regular" aria-hidden="true" /></button>
      </div>
    </section>
    <section className={s.afterLaunchpad} aria-labelledby="recent-strategies"><div className={s.sectionLabel}><div><p className={s.eyebrow}>Continue building</p><h2 id="recent-strategies">Recent strategies</h2></div><button type="button" onClick={() => setTab(TABS[0])}>View all</button></div><div className={s.recentGrid}>{strategies.slice(0, 3).map((strategy) => <StrategyCard strategy={strategy} compact key={strategy.id} />)}</div></section>
  </>;
}

function LedgerLayout({ strategies, onBuild, tab, setTab }: LayoutProps) {
  return <>
    <SectionHeader onBuild={onBuild} tab={tab} setTab={setTab} title="Your strategies" detail="Monitor, tune, and create investment strategies in one workspace." />
    <section className={s.ledgerLayout}>
      <div className={s.ledgerTable} role="list" aria-label="Active strategies">
        <div className={s.ledgerHead} aria-hidden="true"><span>Strategy</span><span>Return</span><span>Accounts</span><span>Next rebalance</span></div>
        {strategies.map((strategy) => <Link href={`/home/strategy/${strategy.id}`} className={s.ledgerRow} role="listitem" key={strategy.id}>
          <div><strong>{strategy.name}</strong><small>{strategy.desc}</small></div><span className={s.return}>{strategy.returnAbs} ({strategy.returnPct})</span><BrokerAvatars sources={strategy.brokers} /><span className={s.rebalance}><i aria-hidden="true" />In {strategy.nextRebalanceDays} days</span><ArrowRight weight="regular" aria-hidden="true" />
        </Link>)}
      </div>
      <aside className={s.ledgerStart} aria-labelledby="ledger-start-title"><span className={s.ledgerSpark}><Sparkle weight="regular" /></span><p className={s.eyebrow}>New strategy</p><h2 id="ledger-start-title">Bring a new idea to life.</h2><p>Choose a builder, shape the logic, and test before you deploy.</p><Button type="button" fullWidth={false} iconTrailing={<ArrowRight weight="bold" />} onClick={onBuild}>Choose a builder</Button><div className={s.startStats}><span><strong>4</strong> builder paths</span><span><strong>1</strong> place to deploy</span></div></aside>
    </section>
  </>;
}

type LayoutProps = { strategies: StrategyCardData[]; onBuild: () => void; tab: (typeof TABS)[number]; setTab: (tab: (typeof TABS)[number]) => void };

const VARIANTS = [
  { name: 'Library', Layout: LibraryLayout },
  { name: 'Launchpad', Layout: LaunchpadLayout },
  { name: 'Ledger', Layout: LedgerLayout },
] as const;

export default function CreateStrategyPagePrototype() {
  const [active, setActive] = useState(0);
  const [remount, setRemount] = useState(0);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>(TABS[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const picker = useRef<HTMLElement>(null);
  const highlight = useRef<HTMLSpanElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const moveHighlight = useCallback(() => { const item = items.current[active]; if (item && highlight.current) { highlight.current.style.width = `${item.offsetWidth}px`; highlight.current.style.transform = `translateX(${item.offsetLeft}px)`; } }, [active]);
  const selectVariant = useCallback((index: number) => { setActive(index); const url = new URL(window.location.href); url.searchParams.set('v', String(index + 1)); window.history.replaceState(null, '', url); }, []);
  useLayoutEffect(moveHighlight, [moveHighlight]);
  useEffect(() => { const value = Number(new URLSearchParams(window.location.search).get('v') || '1'); setActive(Math.max(0, Math.min(VARIANTS.length - 1, value - 1))); }, []);
  useEffect(() => { requestAnimationFrame(() => requestAnimationFrame(() => picker.current?.setAttribute('data-ready', ''))); window.addEventListener('resize', moveHighlight); return () => window.removeEventListener('resize', moveHighlight); }, [moveHighlight]);
  useEffect(() => { const onKeydown = (event: KeyboardEvent) => { const target = event.target as HTMLElement; if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable || event.metaKey || event.ctrlKey || event.altKey) return; if (event.key === 'ArrowRight') selectVariant((active + 1) % VARIANTS.length); else if (event.key === 'ArrowLeft') selectVariant((active - 1 + VARIANTS.length) % VARIANTS.length); else if (/^[1-3]$/.test(event.key)) selectVariant(Number(event.key) - 1); else if (event.key === 'r' || event.key === 'R') setRemount((value) => value + 1); }; window.addEventListener('keydown', onKeydown); return () => window.removeEventListener('keydown', onKeydown); }, [active, selectVariant]);
  const Layout = VARIANTS[active].Layout;
  const strategies = activeTab === TABS[1] ? MY_STRATEGIES.slice(0, 5) : activeTab === TABS[2] ? MY_STRATEGIES.slice(4, 8) : MY_STRATEGIES;
  return <HomeShell><main className={s.shell}><div key={`${active}-${remount}`} className={s.stage}><Layout strategies={strategies} onBuild={() => setModalOpen(true)} tab={activeTab} setTab={setActiveTab} /></div><nav ref={picker} className="proto-picker" aria-label="Prototype variants"><span ref={highlight} className="proto-picker-highlight" aria-hidden="true" />{VARIANTS.map((variant, index) => <button key={variant.name} ref={(element) => { items.current[index] = element; }} className="proto-picker-item" data-active={active === index || undefined} aria-current={active === index ? 'true' : undefined} onClick={() => selectVariant(index)}>{variant.name}</button>)}<span className="proto-picker-divider" aria-hidden="true" /><button className="proto-picker-item proto-picker-replay" aria-label="Replay animation (R)" onClick={() => setRemount((value) => value + 1)}>↻</button></nav></main>{modalOpen && <ChooseBuilderModal onClose={() => setModalOpen(false)} />}</HomeShell>;
}
