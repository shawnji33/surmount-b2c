'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MagicWand, Plus } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { MY_STRATEGIES, DRAFT_STRATEGIES, ASSET_UNIVERSE, type StrategyCardData, type DraftStrategyCardData } from './_data';
import type { RuleState } from './_shared/types';
import { ChooseBuilderModal } from './_components/ChooseBuilderModal';
import { MobileNotice } from './_components/MobileNotice';
import s from './page.module.css';

const TABS = ['Active strategies', 'Drafts'] as const;
type StrategyTab = (typeof TABS)[number];

type TabTransition = {
  previous: StrategyTab;
  next: StrategyTab;
  forward: boolean;
};

function activeRulesSummary(rules: RuleState): string {
  const labels: string[] = [];
  if (rules.rebalance.enabled) labels.push('Auto rebalance');
  if (rules.stopLoss.enabled) labels.push('Stop loss');
  if (rules.takeProfit.enabled) labels.push('Take profit');
  return labels.length > 0 ? labels.join(', ') : 'No rules set';
}

function formatNextRebalance(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function StrategyCard({ strategy }: { strategy: StrategyCardData }) {
  return (
    <Link
      href={`/home/strategy/${strategy.id}`}
      className={s.strategyCard}
    >
      <div className={s.cardTop}>
        <div className={s.cardNameGroup}>
          <div className={s.cardName}>{strategy.name}</div>
          <div className={s.cardDesc}>{strategy.desc}</div>
        </div>
      </div>

      <div className={s.cardRows}>
        <div className={s.cardRow}>
          <span className={s.cardRowLabel}>Total return</span>
          <span className={[s.cardRowVal, s.cardRowValPos].join(' ')}>
            {strategy.returnAbs} ({strategy.returnPct})
          </span>
        </div>
        <div className={s.cardDivider} />
        <div className={s.cardRow}>
          <span className={s.cardRowLabel}>Invested accounts</span>
          <div className={s.cardAvatars}>
            {strategy.brokers.map((src) => (
              <span className={s.cardAvatar} key={src}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" />
              </span>
            ))}
          </div>
        </div>
        <div className={s.cardDivider} />
        <div className={s.cardRow}>
          <span className={s.cardRowLabel}>Next Rebalance</span>
          <div className={s.cardDotRow}>
            <span className={s.cardDot} />
            <span className={s.cardRowVal}>{formatNextRebalance(strategy.nextRebalanceDays)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// No invested-accounts or return data for a strategy that's never been deployed — the card shows
// its shape instead (allocation, rules) so it's still a meaningful preview of what's in progress.
// Goes straight into the Strategy builder tab (step=build skips Pick stocks) rather than the
// read-only /home/strategy/[id] detail view StrategyCard links to, since a draft is still editable.
function DraftStrategyCard({ strategy }: { strategy: DraftStrategyCardData }) {
  const shownRows = strategy.rows.slice(0, 4);
  const overflow = strategy.rows.length - shownRows.length;

  return (
    <Link
      href="/home/builder/etf?step=build"
      className={s.strategyCard}
    >
      <div className={s.cardTop}>
        <div className={s.cardNameGroup}>
          <div className={s.cardNameRow}>
            <div className={s.cardName}>{strategy.name}</div>
            <span className={s.draftBadge}>Draft</span>
          </div>
          <div className={s.cardDesc}>{strategy.desc}</div>
        </div>
      </div>

      <div className={s.cardRows}>
        <div className={s.cardRow}>
          <span className={s.cardRowLabel}>Allocation</span>
          <div className={s.cardAvatars}>
            {shownRows.map((row) => {
              const asset = ASSET_UNIVERSE.find((a) => a.ticker === row.ticker);
              return (
                <span className={s.cardAvatar} key={row.ticker}>
                  {asset?.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset.logo} alt="" />
                  ) : (
                    <span className={s.cardAvatarFallback} style={{ background: asset?.fallbackColor }}>
                      {row.ticker.slice(0, 2)}
                    </span>
                  )}
                </span>
              );
            })}
            {overflow > 0 && <span className={[s.cardAvatar, s.cardAvatarMore].join(' ')}>+{overflow}</span>}
          </div>
        </div>
        <div className={s.cardDivider} />
        <div className={s.cardRow}>
          <span className={s.cardRowLabel}>Custom rules</span>
          <span className={s.cardRowVal}>{activeRulesSummary(strategy.rules)}</span>
        </div>
      </div>
    </Link>
  );
}

export default function BuilderPage() {
  const [activeTab, setActiveTab] = useState<StrategyTab>(TABS[0]);
  const [tabTransition, setTabTransition] = useState<TabTransition | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const transitionTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
  }, []);

  function selectTab(nextTab: StrategyTab) {
    if (nextTab === activeTab) return;
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);

    const forward = TABS.indexOf(nextTab) > TABS.indexOf(activeTab);
    setTabTransition({ previous: activeTab, next: nextTab, forward });
    setActiveTab(nextTab);
    transitionTimer.current = window.setTimeout(() => {
      setTabTransition(null);
      transitionTimer.current = null;
    }, 250);
  }

  const tabPages = tabTransition
    ? tabTransition.forward
      ? [
          { tab: tabTransition.previous, pageId: '1', active: false },
          { tab: tabTransition.next, pageId: '2', active: true },
        ]
      : [
          { tab: tabTransition.next, pageId: '1', active: true },
          { tab: tabTransition.previous, pageId: '2', active: false },
        ]
    : [{ tab: activeTab, pageId: '1', active: true }];

  return (
    <main className={s.main}>
      <div className={s.desktopOnly}>
        <div className={s.pageHeader}>
          <div className={s.pageHeaderTop}>
            <h1 className={s.pageTitle}>Create</h1>
            <Button
              type="button"
              fullWidth={false}
              iconLeading={<Plus weight="bold" />}
              onClick={() => setModalOpen(true)}
            >
              New strategy
            </Button>
          </div>

          <div className={s.tabs}>
            {TABS.map((tab) => (
              <button
                type="button"
                key={tab}
                className={[s.tab, tab === activeTab ? s.tabActive : ''].filter(Boolean).join(' ')}
                onClick={() => selectTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className={s.contentGrid}>
          <div className={s.pageSlide} data-page={tabPages.find((page) => page.active)?.pageId}>
            {tabPages.map((page) => (
              <section
                key={page.tab}
                className={s.tabPage}
                data-page-id={page.pageId}
                aria-hidden={!page.active}
                inert={!page.active ? true : undefined}
              >
                <div className={s.strategiesLeft}>
                  {page.tab === 'Active strategies'
                    ? MY_STRATEGIES.map((strategy) => <StrategyCard strategy={strategy} key={strategy.id} />)
                    : DRAFT_STRATEGIES.map((strategy) => <DraftStrategyCard strategy={strategy} key={strategy.id} />)}
                </div>
              </section>
            ))}
          </div>

          <div className={s.ctaSection}>
            <div className={s.ctaGrid} aria-hidden="true" />
            <div className={s.ctaBody}>
              <span className={s.ctaIcon}>
                <MagicWand weight="regular" />
              </span>
              <div className={s.ctaText}>
                <div className={s.ctaTitle}>Build your own strategy</div>
                <p className={s.ctaDesc}>
                  Create strategies with our intuitive builder. Design data-driven investment
                  strategies using a no-code interface. Transform ideas into automated strategies
                  with AI.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                fullWidth={false}
                iconLeading={<Plus weight="bold" />}
                onClick={() => setModalOpen(true)}
              >
                Build now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <MobileNotice />

      {modalOpen && <ChooseBuilderModal onClose={() => setModalOpen(false)} />}
    </main>
  );
}
