'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChartLineUp, Clock, Plus, Star, Wallet } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { HomeShell } from '@/app/home/HomeShell';
import { MY_STRATEGIES, type StrategyCardData } from '@/app/home/builder/_data';
import { ChooseBuilderModal } from '@/app/home/builder/_components/ChooseBuilderModal';
import s from './page.module.css';

const TABS = ['Active strategies', 'My strategies', 'Favorite strategies'] as const;

type CardProps = {
  strategy: StrategyCardData;
  favorite: boolean;
  onToggleFavorite: (strategyId: string) => void;
};

function BrokerStack({ sources }: { sources: string[] }) {
  return (
    <span className={s.brokerStack} aria-label={`${sources.length} related accounts`}>
      {sources.map((source) => (
        <span className={s.brokerAvatar} key={source}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={source} alt="" />
        </span>
      ))}
    </span>
  );
}

function CardActions({ strategy, favorite, onToggleFavorite }: CardProps) {
  return (
    <div className={s.cardActions}>
      <button
        type="button"
        className={[s.favoriteButton, favorite ? s.favoriteButtonActive : ''].filter(Boolean).join(' ')}
        onClick={() => onToggleFavorite(strategy.id)}
        aria-label={favorite ? `Remove ${strategy.name} from favorites` : `Add ${strategy.name} to favorites`}
        aria-pressed={favorite}
      >
        <Star weight={favorite ? 'fill' : 'regular'} />
      </button>
      <Link href={`/home/strategy/${strategy.id}`} className={s.viewLink}>
        View strategy <ArrowUpRight weight="regular" aria-hidden="true" />
      </Link>
    </div>
  );
}

function SnapshotCard(props: CardProps) {
  const { strategy, favorite, onToggleFavorite } = props;
  return (
    <article className={[s.card, s.snapshotCard].join(' ')}>
      <div className={s.cardHeader}>
        <div>
          <h2>{strategy.name}</h2>
          <p>{strategy.desc}</p>
        </div>
        <button
          type="button"
          className={[s.favoriteButton, favorite ? s.favoriteButtonActive : ''].filter(Boolean).join(' ')}
          onClick={() => onToggleFavorite(strategy.id)}
          aria-label={favorite ? `Remove ${strategy.name} from favorites` : `Add ${strategy.name} to favorites`}
          aria-pressed={favorite}
        >
          <Star weight={favorite ? 'fill' : 'regular'} />
        </button>
      </div>

      <div className={s.snapshotMetrics}>
        <div><span>Assets under management</span><strong>{strategy.aumValue}</strong></div>
        <div><span>Total return</span><strong className={s.positive}>{strategy.returnAbs} <small>{strategy.returnPct}</small></strong></div>
        <div><span>Next rebalance</span><strong>In {strategy.nextRebalanceDays} days</strong></div>
      </div>

      <div className={s.cardFooter}>
        <span className={s.accountMeta}><BrokerStack sources={strategy.brokers} /> {strategy.brokers.length} linked account{strategy.brokers.length === 1 ? '' : 's'}</span>
        <Link href={`/home/strategy/${strategy.id}`} className={s.viewLink}>View strategy <ArrowUpRight weight="regular" aria-hidden="true" /></Link>
      </div>
    </article>
  );
}

function RhythmCard(props: CardProps) {
  const { strategy, favorite, onToggleFavorite } = props;
  return (
    <article className={[s.card, s.rhythmCard].join(' ')}>
      <div className={s.rhythmTopline}>
        <span className={s.rhythmIcon}><Clock weight="regular" /></span>
        <span>Automation active</span>
        <button
          type="button"
          className={[s.favoriteButton, favorite ? s.favoriteButtonActive : ''].filter(Boolean).join(' ')}
          onClick={() => onToggleFavorite(strategy.id)}
          aria-label={favorite ? `Remove ${strategy.name} from favorites` : `Add ${strategy.name} to favorites`}
          aria-pressed={favorite}
        >
          <Star weight={favorite ? 'fill' : 'regular'} />
        </button>
      </div>

      <div className={s.rhythmBody}>
        <div>
          <h2>{strategy.name}</h2>
          <p>{strategy.desc}</p>
        </div>
        <div className={s.rhythmSchedule}>
          <span>Next rebalance</span>
          <strong>In {strategy.nextRebalanceDays} days</strong>
          <small>Monitoring {strategy.brokers.length} connected account{strategy.brokers.length === 1 ? '' : 's'}</small>
        </div>
      </div>

      <div className={s.rhythmPerformance}>
        <span><ChartLineUp weight="regular" /> Total return</span>
        <strong className={s.positive}>{strategy.returnAbs} <small>{strategy.returnPct}</small></strong>
      </div>

      <CardActions strategy={strategy} favorite={favorite} onToggleFavorite={onToggleFavorite} />
    </article>
  );
}

function PortfolioCard(props: CardProps) {
  const { strategy, favorite, onToggleFavorite } = props;
  return (
    <article className={[s.card, s.portfolioCard].join(' ')}>
      <div className={s.cardHeader}>
        <div>
          <span className={s.portfolioEyebrow}><Wallet weight="regular" /> Multi-account strategy</span>
          <h2>{strategy.name}</h2>
          <p>{strategy.desc}</p>
        </div>
        <button
          type="button"
          className={[s.favoriteButton, favorite ? s.favoriteButtonActive : ''].filter(Boolean).join(' ')}
          onClick={() => onToggleFavorite(strategy.id)}
          aria-label={favorite ? `Remove ${strategy.name} from favorites` : `Add ${strategy.name} to favorites`}
          aria-pressed={favorite}
        >
          <Star weight={favorite ? 'fill' : 'regular'} />
        </button>
      </div>

      <div className={s.portfolioSplit}>
        <div className={s.portfolioAccounts}>
          <span>Account coverage</span>
          <BrokerStack sources={strategy.brokers} />
          <strong>{strategy.brokers.length} account{strategy.brokers.length === 1 ? '' : 's'} connected</strong>
        </div>
        <div className={s.portfolioValue}>
          <span>Managed value</span>
          <strong>{strategy.aumValue}</strong>
          <small className={s.positive}>{strategy.returnPct} total return</small>
        </div>
      </div>

      <CardActions strategy={strategy} favorite={favorite} onToggleFavorite={onToggleFavorite} />
    </article>
  );
}

type LayoutProps = {
  strategies: StrategyCardData[];
  favoriteIds: string[];
  onToggleFavorite: (strategyId: string) => void;
};

function CardGrid({ strategies, favoriteIds, onToggleFavorite, Card }: LayoutProps & { Card: (props: CardProps) => React.ReactNode }) {
  return (
    <section className={s.cardGrid} aria-label="Strategy cards">
      {strategies.map((strategy) => (
        <Card
          key={strategy.id}
          strategy={strategy}
          favorite={favoriteIds.includes(strategy.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </section>
  );
}

const VARIANTS = [
  { name: 'Snapshot', label: 'Metric-first scan', Card: SnapshotCard },
  { name: 'Rhythm', label: 'Rebalance-led action', Card: RhythmCard },
  { name: 'Portfolio', label: 'Account coverage', Card: PortfolioCard },
] as const;

export default function StrategyCardAlternativesPrototype() {
  const [active, setActive] = useState(0);
  const [remount, setRemount] = useState(0);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>(TABS[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const picker = useRef<HTMLElement>(null);
  const highlight = useRef<HTMLSpanElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  const moveHighlight = useCallback(() => {
    const item = items.current[active];
    if (item && highlight.current) {
      highlight.current.style.width = `${item.offsetWidth}px`;
      highlight.current.style.transform = `translateX(${item.offsetLeft}px)`;
    }
  }, [active]);

  const selectVariant = useCallback((index: number) => {
    setActive(index);
    const url = new URL(window.location.href);
    url.searchParams.set('v', String(index + 1));
    window.history.replaceState(null, '', url);
  }, []);

  const toggleFavorite = useCallback((strategyId: string) => {
    setFavoriteIds((current) => current.includes(strategyId)
      ? current.filter((id) => id !== strategyId)
      : [...current, strategyId]);
  }, []);

  useLayoutEffect(moveHighlight, [moveHighlight]);

  useEffect(() => {
    const value = Number(new URLSearchParams(window.location.search).get('v') || '1');
    setActive(Math.max(0, Math.min(VARIANTS.length - 1, value - 1)));
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => picker.current?.setAttribute('data-ready', '')));
    window.addEventListener('resize', moveHighlight);
    return () => window.removeEventListener('resize', moveHighlight);
  }, [moveHighlight]);

  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === 'ArrowRight') selectVariant((active + 1) % VARIANTS.length);
      else if (event.key === 'ArrowLeft') selectVariant((active - 1 + VARIANTS.length) % VARIANTS.length);
      else if (/^[1-3]$/.test(event.key)) selectVariant(Number(event.key) - 1);
      else if (event.key === 'r' || event.key === 'R') setRemount((value) => value + 1);
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [active, selectVariant]);

  const variant = VARIANTS[active];
  const strategies = activeTab === TABS[1]
    ? MY_STRATEGIES.slice(0, 5)
    : activeTab === TABS[2]
      ? MY_STRATEGIES.filter((strategy) => favoriteIds.includes(strategy.id))
      : MY_STRATEGIES;

  return (
    <HomeShell>
      <main className={s.shell}>
        <div key={`${active}-${remount}`} className={s.stage}>
          <header className={s.header}>
            <div>
              <p className={s.eyebrow}>Create</p>
              <h1>Strategy cards</h1>
              <p className={s.detail}>{variant.label}. Compare the same strategy data at full working size.</p>
            </div>
            <Button type="button" fullWidth={false} iconLeading={<Plus weight="bold" />} onClick={() => setModalOpen(true)}>New strategy</Button>
          </header>

          <div className={s.tabs} role="tablist" aria-label="Strategy groups">
            {TABS.map((tab) => (
              <button key={tab} type="button" role="tab" aria-selected={tab === activeTab} className={tab === activeTab ? s.tabActive : s.tab} onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
          </div>

          <CardGrid strategies={strategies} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} Card={variant.Card} />
        </div>

        <nav ref={picker} className="proto-picker" aria-label="Prototype variants">
          <span ref={highlight} className="proto-picker-highlight" aria-hidden="true" />
          {VARIANTS.map((item, index) => (
            <button key={item.name} ref={(element) => { items.current[index] = element; }} className="proto-picker-item" data-active={active === index || undefined} aria-current={active === index ? 'true' : undefined} onClick={() => selectVariant(index)}>{item.name}</button>
          ))}
          <span className="proto-picker-divider" aria-hidden="true" />
          <button className="proto-picker-item proto-picker-replay" aria-label="Replay animation (R)" onClick={() => setRemount((value) => value + 1)}>↻</button>
        </nav>
      </main>
      {modalOpen && <ChooseBuilderModal onClose={() => setModalOpen(false)} />}
    </HomeShell>
  );
}
