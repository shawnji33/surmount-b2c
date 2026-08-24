'use client';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  WealthsimpleNetWorthChart,
  type WealthsimpleChartPoint,
} from '@/components/charts/WealthsimpleNetWorthChart';
import { ArrowRight, CaretDown, CaretLeft, CaretRight, Funnel, GearSix, Plus } from '@phosphor-icons/react';
import Link from 'next/link';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import s from './page.module.css';

// ─── Data ───────────────────────────────────────────────────────────────────

const DATES = [
  '2026-04-21', '2026-04-24', '2026-04-25', '2026-04-28', '2026-04-29',
  '2026-04-30', '2026-05-01', '2026-05-02', '2026-05-05', '2026-05-06',
  '2026-05-07', '2026-05-08', '2026-05-09', '2026-05-12', '2026-05-13',
  '2026-05-14', '2026-05-15', '2026-05-16', '2026-05-19', '2026-05-20',
  '2026-05-21',
];

function makeSeries(start: number, end: number, wobble: number, phase: number): WealthsimpleChartPoint[] {
  return DATES.map((time, i) => ({
    time,
    value: Number((start + (end - start) * (i / (DATES.length - 1)) + Math.sin(i * 0.92 + phase) * wobble).toFixed(2)),
  }));
}

type AccountItem = {
  id: string;
  name: string;
  logo: string;
  value: number;
  returnAbs: number;
  badge?: string;
  href?: string;
};

const EXTERNAL_ACCOUNTS: AccountItem[] = [
  { id: 'ibkr',      name: 'Interactive Brokers', logo: '/assets/brokers/ibkr.png',      value: 142350.30, returnAbs:  2921.40 },
  { id: 'schwab',    name: 'Schwab',               logo: '/assets/brokers/schwab.png',    value:  31200.50, returnAbs:   512.66 },
];

const SURMOUNT_ACCOUNTS: AccountItem[] = [
  { id: 'surmount-investing', name: 'Surmount Investing',  logo: '/assets/brokers/surmount.png', value:  85420.54, returnAbs: 1204.88, href: '/home/playground/account-selection-2/account/surmount' },
  { id: 'surmount-hyca',     name: 'High Yield Cash',      logo: '/assets/brokers/surmount.png', value: 351242.54, returnAbs:  947.35, badge: '3.25% APY', href: '/home/playground/account-selection-2/account/surmount-hyca' },
];

const STRATEGIES = [
  {
    id: 'quantum',   name: 'Quantum Computing Leaders',        cover: '/assets/strategy-covers/Quantum Computing Leaders.png',
    value: 108289.32, returnAbs: 5003.28, returnPct: 4.85,
    logos: ['/assets/brokers/surmount.png', '/assets/brokers/ibkr.png'],
  },
  {
    id: 'ai',        name: 'Artificial Intelligence Innovators', cover: '/assets/strategy-covers/AI Innovators.png',
    value: 107413.28, returnAbs: 7450.80, returnPct: 7.45,
    logos: ['/assets/brokers/surmount.png', '/assets/brokers/ibkr.png', '/assets/brokers/schwab.png'],
  },
  {
    id: 'biotech',   name: 'Biotechnology Ventures',           cover: '/assets/strategy-covers/Biotech Breakthroughs.png',
    value:  39093.70, returnAbs:  -301.82, returnPct: -0.77,
    logos: ['/assets/brokers/schwab.png'],
  },
  {
    id: 'data-infra', name: 'Next-Gen Data Infrastructure',   cover: '/assets/strategy-covers/Next-Gen Data Infrastructure.png',
    value:  49715.56, returnAbs: 2746.60, returnPct: 5.84,
    logos: ['/assets/brokers/surmount.png', '/assets/brokers/ibkr.png', '/assets/brokers/schwab.png'],
  },
];

const HOLDINGS = [
  { id: 'quantum',  name: 'Quantum Computing Leaders',    category: 'Technology', cover: '/assets/strategy-covers/Quantum Computing Leaders.png',     value: 18432.54, returnPct:  4.68 },
  { id: 'ai',       name: 'AI Infrastructure Leaders',    category: 'Technology', cover: '/assets/strategy-covers/AI Innovators.png',                  value: 22108.92, returnPct:  2.14 },
  { id: 'biotech',  name: 'Biotechnology Ventures',       category: 'Healthcare', cover: '/assets/strategy-covers/Biotech Breakthroughs.png',           value:  9750.30, returnPct: -0.82 },
];

// Aggregate chart data from all investing accounts (excluding HYCA — steady cash)
const investingSeriesData = [
  makeSeries(79240, 85420.54, 420, 0.3),    // Surmount Investing
  makeSeries(134880, 142350.3, 760, 1.1),   // IBKR
  makeSeries(29210, 31200.5, 210, 0.8),     // Schwab
  makeSeries(350295, 351242.54, 50, 1.5),   // HYCA (steady)
];

const CHART_DATA: WealthsimpleChartPoint[] = DATES.map((time, i) => ({
  time,
  value: Number(investingSeriesData.reduce((sum, s) => sum + (s[i]?.value ?? 0), 0).toFixed(2)),
}));

const ALL_ACCOUNTS = [...EXTERNAL_ACCOUNTS, ...SURMOUNT_ACCOUNTS];
const TOTAL_VALUE = ALL_ACCOUNTS.reduce((s, a) => s + a.value, 0);
const TOTAL_CHANGE = ALL_ACCOUNTS.reduce((s, a) => s + a.returnAbs, 0);
const TOTAL_CHANGE_PCT = (TOTAL_CHANGE / (TOTAL_VALUE - TOTAL_CHANGE)) * 100;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}
function fmtSigned(value: number) {
  return `${value < 0 ? '-' : '+'}${fmt(Math.abs(value))}`;
}
function fmtPct(value: number) {
  return `${value < 0 ? '-' : '+'}${Math.abs(value).toFixed(2)}%`;
}
function returnPct(item: AccountItem) {
  const basis = item.value - item.returnAbs;
  return basis !== 0 ? (item.returnAbs / basis) * 100 : 0;
}

// ─── Account group with animated expand/collapse ─────────────────────────────

function AccountGroup({ label, accounts, defaultOpen = true }: {
  label: string;
  accounts: AccountItem[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyRef = useRef<HTMLDivElement>(null);
  const isFirst = useRef(true);

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    // On first render: set initial state without animation
    if (isFirst.current) {
      isFirst.current = false;
      if (!open) { el.style.height = '0'; el.style.overflow = 'hidden'; }
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (open) {
      el.style.overflow = 'hidden';
      const target = el.scrollHeight;
      if (reduced) { el.style.height = ''; el.style.overflow = ''; return; }
      el.style.transition = 'height 240ms cubic-bezier(0.4, 0, 0.2, 1)';
      el.style.height = `${target}px`;
      const onEnd = (e: TransitionEvent) => {
        if (e.propertyName !== 'height') return;
        el.style.height = ''; el.style.overflow = ''; el.style.transition = '';
        el.removeEventListener('transitionend', onEnd);
      };
      el.addEventListener('transitionend', onEnd);
    } else {
      el.style.height = `${el.scrollHeight}px`;
      el.style.overflow = 'hidden';
      void el.offsetHeight;
      if (reduced) { el.style.height = '0'; return; }
      el.style.transition = 'height 200ms cubic-bezier(0.4, 0, 0.2, 1)';
      el.style.height = '0';
    }
  }, [open]);

  const total = accounts.reduce((s, a) => s + a.value, 0);

  return (
    <div className={s.accountGroup}>
      <button
        type="button"
        className={s.accountGroupHeader}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className={s.accountGroupHeaderLeft}>
          <span className={s.accountGroupName}>{label}</span>
          <span className={s.accountGroupCount}>{accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}</span>
        </div>
        <div className={s.accountGroupHeaderRight}>
          <span className={s.accountGroupTotal}>{fmt(total)}</span>
          <CaretDown
            className={[s.accountGroupChevron, open ? s.accountGroupChevronOpen : ''].filter(Boolean).join(' ')}
            weight="bold"
            aria-hidden="true"
          />
        </div>
      </button>

      <div ref={bodyRef}>
        {accounts.map((account) => {
          const pct = returnPct(account);
          const isPos = account.returnAbs >= 0;
          const content = (
            <>
              <div className={s.accountItemLeft}>
                <img src={account.logo} alt={account.name} className={s.accountItemLogo} />
                <span className={s.accountItemName}>{account.name}</span>
                {account.badge && <span className={s.accountItemBadge}>{account.badge}</span>}
              </div>
              <div className={s.accountItemRight}>
                <span className={s.accountItemValue}>{fmt(account.value)}</span>
                <span className={[s.accountItemReturn, isPos ? s.accountItemReturnPositive : s.accountItemReturnNegative].join(' ')}>
                  {fmtPct(pct)} all time
                </span>
              </div>
            </>
          );

          const href =
            account.href ??
            (label === 'External accounts'
              ? `/home/playground/account-selection-2/account/${account.id}`
              : null);

          if (href) {
            return (
              <Link
                key={account.id}
                href={href}
                className={[s.accountItem, s.accountItemLink].join(' ')}
              >
                {content}
              </Link>
            );
          }

          return (
            <div key={account.id} className={s.accountItem}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AccountSelection2Page() {
  const changeText = useMemo(
    () => `${fmtSigned(TOTAL_CHANGE)} (${fmtPct(TOTAL_CHANGE_PCT)})`,
    [],
  );

  return (
    <main className={s.main}>
      <DashboardHeader title="Account selection — 2.1" />

      <div className={s.pageLayout}>

        {/* ── Left column ── */}
        <div className={s.leftCol}>

          {/* Performance — chart with plain title, no switcher */}
          <section className={s.portfolioSection}>
            <WealthsimpleNetWorthChart
              value={TOTAL_VALUE}
              changeText={changeText}
              changePeriod="this month"
              data={CHART_DATA}
              initialRange="1M"
              height={237}
            />
          </section>

          {/* Accounts — collapsible groups */}
          <section className={s.leftSection}>
            <div className={s.sectionHeader}>
              <span className={s.sectionTitle}>Accounts</span>
              <div className={s.sectionActions}>
                <button type="button" className={s.actionLink}>Edit</button>
                <button type="button" className={s.btnSecondary}>
                  <Plus weight="bold" aria-hidden="true" />
                  Connect accounts
                </button>
              </div>
            </div>

            <div className={s.accountGroups} suppressHydrationWarning>
              <AccountGroup label="External accounts" accounts={EXTERNAL_ACCOUNTS} />
              <AccountGroup label="Surmount" accounts={SURMOUNT_ACCOUNTS} />
            </div>
          </section>

          {/* Active strategies — static */}
          <section className={s.leftSection}>
            <div className={s.sectionHeader}>
              <span className={s.sectionTitle}>Active strategies</span>
              <div className={s.sectionActions}>
                <button type="button" className={s.actionLink}>Edit</button>
                <button type="button" className={s.btnSecondary}>
                  <Plus weight="bold" aria-hidden="true" />
                  Add strategies
                </button>
              </div>
            </div>

            <div className={s.strategiesTable}>
              <div className={s.tableHeader}>
                <div className={[s.th, s.thStrategy].join(' ')}>Strategy</div>
                <div className={[s.th, s.thValue].join(' ')}>Value</div>
                <div className={[s.th, s.thReturn].join(' ')}>Total return</div>
                <div className={[s.th, s.thAccount].join(' ')}>Accounts</div>
              </div>
              {STRATEGIES.map((row) => (
                <div key={row.id} className={s.tableRow}>
                  <div className={[s.td, s.tdStrategy].join(' ')}>
                    <div className={s.strategyIcon}><img src={row.cover} alt={row.name} /></div>
                    <span className={s.strategyName}>{row.name}</span>
                  </div>
                  <div className={[s.td, s.tdValue].join(' ')}>
                    <span className={s.tdValueText}>{fmt(row.value)}</span>
                  </div>
                  <div className={[s.td, s.tdReturn, row.returnAbs < 0 ? s.tdReturnNegative : ''].filter(Boolean).join(' ')}>
                    <span className={s.tdReturnPrimary}>{fmtPct(row.returnPct)}</span>
                    <span className={s.tdReturnSecondary}>{fmtSigned(row.returnAbs)}</span>
                  </div>
                  <div className={[s.td, s.tdAccount].join(' ')}>
                    <div className={s.avatarGroup}>
                      {row.logos.slice(0, 3).map((src, i) => (
                        <img key={i} src={src} alt="" className={s.accountAvatar} />
                      ))}
                      {row.logos.length > 3 && (
                        <span className={[s.accountAvatar, s.accountAvatarOverflow].join(' ')}>
                          +{row.logos.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ── Right sidebar ── */}
        <div className={s.sidebar}>

          {/* Task card panel */}
          <div className={s.sidebarPanel}>
            <div className={s.taskPanelHeader}>
              <span className={s.taskPagination}>1 of 3</span>
              <div className={s.taskNavBtns}>
                <button type="button" className={s.taskNavBtn} aria-label="Previous task">
                  <CaretLeft weight="bold" aria-hidden="true" />
                </button>
                <button type="button" className={s.taskNavBtn} aria-label="Next task">
                  <CaretRight weight="bold" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className={s.taskCardWrap}>
              <div className={s.taskCard}>
                <div className={s.taskCardTop}>
                  <div className={s.taskCardIconWrap}>
                    <img src="/assets/brokers/surmount.png" alt="" />
                  </div>
                  <div className={s.taskCardText}>
                    <span className={s.taskCardTitle}>Pick your first strategy</span>
                    <span className={s.taskCardSubtitle}>2/3 complete</span>
                  </div>
                </div>
                <div className={s.taskProgressBar}>
                  <div className={s.taskProgressSegment} />
                  <div className={s.taskProgressSegment} />
                  <div className={s.taskProgressSegment} />
                </div>
                <div className={s.taskCardFooter}>
                  <button type="button" className={s.taskCardArrowBtn}>
                    <ArrowRight weight="bold" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            <button type="button" className={s.sidebarRow}>
              <span className={s.sidebarRowIconWrap}>
                <GearSix size={16} aria-hidden="true" />
              </span>
              <span className={s.sidebarRowLabel}>Dividend management</span>
              <CaretRight className={s.sidebarRowChevron} aria-hidden="true" />
            </button>
          </div>

          {/* Holdings panel */}
          <div className={s.sidebarPanel}>
            <div className={s.holdingsTabs}>
              <button type="button" className={s.holdingsTab}>Holdings</button>
              <button type="button" className={[s.holdingsTab, s.holdingsTabActive].join(' ')}>Watchlist</button>
              <div className={s.holdingsTabsRight}>
                <button type="button" className={s.holdingsTimeBtn}>1D</button>
                <button type="button" className={s.holdingsFilterBtn} aria-label="Filter">
                  <Funnel size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
            {HOLDINGS.map((h) => (
              <div key={h.id} className={s.holdingRow}>
                <img src={h.cover} alt={h.name} className={s.holdingCover} />
                <div className={s.holdingInfo}>
                  <span className={s.holdingName}>{h.name}</span>
                  <span className={s.holdingCategory}>{h.category}</span>
                </div>
                <div className={s.holdingRight}>
                  <span className={s.holdingValue}>{fmt(h.value)}</span>
                  <span className={[s.holdingReturn, h.returnPct >= 0 ? s.holdingReturnPos : s.holdingReturnNeg].join(' ')}>
                    {fmtPct(h.returnPct)}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </main>
  );
}
