'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagicWand, Plus } from '@phosphor-icons/react';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { BorderBeam } from 'border-beam';
import { Button } from '@/components/Button';
import { Button as ShadcnButton } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MY_STRATEGIES, DRAFT_STRATEGIES, ASSET_UNIVERSE, type StrategyCardData } from './_data';
import type { AllocationRow, RuleState } from './_shared/types';
import { MobileNotice } from './_components/MobileNotice';
import s from './page.module.css';

const TABS = ['Active strategies', 'Drafts'] as const;
const ROUTE_EXIT_MS = 160;
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

function DraftAvatarGroup({ rows }: { rows: AllocationRow[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const shownRows = rows.slice(0, 3);
  const overflow = rows.length - shownRows.length;

  function setShifts(activeIdx: number | null, phase: 'in' | 'out') {
    const root = rootRef.current;
    if (!root || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const styles = getComputedStyle(document.documentElement);
    const numberToken = (name: string, fallback: number) => {
      const value = Number.parseFloat(styles.getPropertyValue(name));
      return Number.isFinite(value) ? value : fallback;
    };
    const easingToken = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
    const lift = numberToken('--avatar-lift', -4);
    const falloff = numberToken('--avatar-falloff', 0.45);
    const scale = numberToken('--avatar-scale', 1.05);
    const timingFunction = phase === 'out'
      ? easingToken('--avatar-ease-out', 'cubic-bezier(0.34, 3.85, 0.64, 1)')
      : easingToken('--avatar-ease-in', 'cubic-bezier(0.22, 1, 0.36, 1)');

    root.querySelectorAll<HTMLElement>('.t-avatar').forEach((element, index) => {
      element.style.transitionTimingFunction = timingFunction;
      if (activeIdx === null) {
        element.style.setProperty('--shift', '0px');
        element.style.setProperty('--scale-active', '1');
        return;
      }
      const distance = Math.abs(index - activeIdx);
      element.style.setProperty('--shift', `${(lift * Math.pow(falloff, distance)).toFixed(3)}px`);
      element.style.setProperty('--scale-active', index === activeIdx ? String(scale) : '1');
    });
  }

  return (
    <div
      ref={rootRef}
      className={`${s.draftAvatars} t-avatar-group`}
      aria-label={`Holdings: ${rows.map((row) => row.ticker).join(', ')}`}
      onMouseLeave={() => setShifts(null, 'out')}
    >
      {shownRows.map((row, index) => {
        const asset = ASSET_UNIVERSE.find((item) => item.ticker === row.ticker);
        return (
          <span
            className={`${s.draftAvatar} t-avatar`}
            key={row.ticker}
            title={asset?.name ?? row.ticker}
            aria-hidden="true"
            onMouseEnter={() => setShifts(index, 'in')}
          >
            {asset?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset.logo} alt="" />
            ) : (
              <span
                className={s.draftAvatarFallback}
                style={{ background: asset?.fallbackColor }}
              >
                {row.ticker.slice(0, 2)}
              </span>
            )}
          </span>
        );
      })}
      {overflow > 0 && (
        <span
          className={`${s.draftAvatarMore} t-avatar`}
          title={`${overflow} more ${overflow === 1 ? 'asset' : 'assets'}`}
          aria-hidden="true"
          onMouseEnter={() => setShifts(shownRows.length, 'in')}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

function DraftStrategiesTable() {
  const router = useRouter();
  const [strategies, setStrategies] = useState(DRAFT_STRATEGIES);

  function openDraft(tab?: 'backtest') {
    const query = tab === 'backtest' ? '?step=build&tab=backtest' : '?step=build';
    router.push(`/home/builder/etf${query}`);
  }

  return (
    <div className={s.draftTableShell}>
      <table className={s.draftTable}>
        <caption className={s.visuallyHidden}>Editable draft strategies</caption>
        <thead>
          <tr>
            <th scope="col">Strategy</th>
            <th scope="col">Holdings</th>
            <th scope="col">Rules</th>
            <th scope="col" className={s.draftActionsHeading}>
              <span className={s.visuallyHidden}>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {strategies.map((strategy) => {
            return (
              <tr key={strategy.id}>
                <td>
                  <div className={s.draftStrategyCell}>
                    <span className={s.draftStrategyName}>{strategy.name}</span>
                    <span className={s.draftStrategyDesc}>{strategy.desc}</span>
                  </div>
                </td>
                <td>
                  <div className={s.draftHoldingsCell}>
                    <DraftAvatarGroup rows={strategy.rows} />
                  </div>
                </td>
                <td>
                  <span className={s.draftRules}>{activeRulesSummary(strategy.rules)}</span>
                </td>
                <td>
                  <div className={s.draftActions}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <ShadcnButton
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className={s.draftActionButton}
                          aria-label={`Actions for ${strategy.name}`}
                          title="Draft actions"
                        >
                          <Ellipsis aria-hidden="true" />
                        </ShadcnButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={6}
                        className={s.draftMenu}
                      >
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            className={s.draftMenuItem}
                            onSelect={() => openDraft()}
                          >
                            <Pencil aria-hidden="true" />
                            Edit draft
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            variant="destructive"
                            className={s.draftMenuItem}
                            onSelect={() => {
                              setStrategies((current) => current.filter((item) => item.id !== strategy.id));
                            }}
                          >
                            <Trash2 aria-hidden="true" />
                            Delete draft
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            );
          })}
          {strategies.length === 0 && (
            <tr>
              <td colSpan={4} className={s.draftEmpty}>No draft strategies yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function BuilderPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<StrategyTab>(TABS[0]);
  const [beamActive, setBeamActive] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [tabTransition, setTabTransition] = useState<TabTransition | null>(null);
  const transitionTimer = useRef<number | null>(null);
  const navigationTimer = useRef<number | null>(null);

  useEffect(() => {
    router.prefetch('/home/builder/choose');

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateBeam = () => setBeamActive(!media.matches);
    updateBeam();
    media.addEventListener('change', updateBeam);
    return () => media.removeEventListener('change', updateBeam);
  }, [router]);

  useEffect(() => () => {
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    if (navigationTimer.current !== null) window.clearTimeout(navigationTimer.current);
  }, []);

  function openBuilderChoice() {
    if (isNavigating) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      router.push('/home/builder/choose');
      return;
    }

    setIsNavigating(true);
    navigationTimer.current = window.setTimeout(() => {
      router.push('/home/builder/choose');
      navigationTimer.current = null;
    }, ROUTE_EXIT_MS);
  }

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
      <div className={[s.desktopOnly, isNavigating ? s.desktopOnlyLeaving : ''].filter(Boolean).join(' ')}>
        <div className={s.pageHeader}>
          <div className={s.pageHeaderTop}>
            <h1 className={s.pageTitle}>Create</h1>
            <Button
              type="button"
              fullWidth={false}
              iconLeading={<Plus weight="bold" />}
              disabled={isNavigating}
              onClick={openBuilderChoice}
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
                {page.tab === 'Active strategies' ? (
                  <div className={s.strategiesLeft}>
                    {MY_STRATEGIES.map((strategy) => <StrategyCard strategy={strategy} key={strategy.id} />)}
                  </div>
                ) : (
                  <DraftStrategiesTable />
                )}
              </section>
            ))}
          </div>

          <BorderBeam
            className={s.ctaBeam}
            size="md"
            colorVariant="ocean"
            theme="light"
            strength={0.55}
            duration={4.8}
            brightness={1.05}
            saturation={0.9}
            hueRange={14}
            active={beamActive}
          >
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
                  disabled={isNavigating}
                  onClick={openBuilderChoice}
                >
                  Build now
                </Button>
              </div>
            </div>
          </BorderBeam>
        </div>
      </div>

      <MobileNotice />
    </main>
  );
}
