'use client';

import {
  WealthsimpleNetWorthChart,
  type WealthsimpleChartPoint,
} from '@/components/charts/WealthsimpleNetWorthChart';
import {
  ArrowLeft,
  ArrowRight,
  ArrowsLeftRight,
  CaretDown,
  Funnel,
  GearSix,
  Plus,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import s from './page.module.css';

type ExternalAccount = {
  id: string;
  label: string;
  displayName: string;
  logo?: string;
  value: number;
  cash: number;
  pending: number;
  change: number;
  changePct?: number;
  phase: number;
};

type StrategyRow = {
  id: string;
  name: string;
  cover: string;
  value: number;
  returnPct: number;
  returnAbs: number;
};

type BreakdownRow = {
  ticker: string;
  name: string;
  logo: string;
  weight: string;
  price: string;
  value: string;
  shares: string;
  strategy: string;
};

type ActivityRow = {
  id: string;
  date: string;
  ticker: string;
  kind: 'Buy' | 'Sell';
  amount: string;
  shares: string;
  logo: string;
};

type SwitcherAccount = {
  id: string;
  label: string;
  value: number;
  logo?: string;
  href: string;
};

const DATES = [
  '2026-04-21', '2026-04-24', '2026-04-25', '2026-04-28', '2026-04-29',
  '2026-04-30', '2026-05-01', '2026-05-02', '2026-05-05', '2026-05-06',
  '2026-05-07', '2026-05-08', '2026-05-09', '2026-05-12', '2026-05-13',
  '2026-05-14', '2026-05-15', '2026-05-16', '2026-05-19', '2026-05-20',
  '2026-05-21',
];

const ACCOUNTS: ExternalAccount[] = [
  {
    id: 'surmount',
    label: 'Surmount Brokerage account',
    displayName: 'Surmount Brokerage account',
    logo: '/assets/brokers/surmount.png',
    value: 234984486.24,
    cash: 14425.41,
    pending: 124.35,
    change: 256.25,
    changePct: 12.45,
    phase: 2.6,
  },
  {
    id: 'ibkr',
    label: 'IBKR',
    displayName: 'Interactive Brokers',
    logo: '/assets/brokers/ibkr.png',
    value: 142350.3,
    cash: 14425.41,
    pending: 124.35,
    change: 2921.4,
    phase: 1.1,
  },
  {
    id: 'robinhood',
    label: 'Robinhood',
    displayName: 'Robinhood',
    logo: '/assets/brokers/robinhood.png',
    value: 67213.18,
    cash: 6820.14,
    pending: 42.2,
    change: -384.22,
    phase: 2.2,
  },
  {
    id: 'schwab',
    label: 'Schwab',
    displayName: 'Schwab',
    logo: '/assets/brokers/schwab.png',
    value: 31200.5,
    cash: 3124.8,
    pending: 0,
    change: 512.66,
    phase: 0.8,
  },
  {
    id: 'kraken',
    label: 'Kraken',
    displayName: 'Kraken',
    logo: '/assets/brokers/kraken.png',
    value: 150345.67,
    cash: 16042.21,
    pending: 212.08,
    change: 1842.22,
    phase: 1.8,
  },
  {
    id: 'alpaca',
    label: 'Alpaca',
    displayName: 'Alpaca',
    value: 75890.12,
    cash: 8420.4,
    pending: 94.62,
    change: 908.44,
    phase: 2.8,
  },
  {
    id: 'surmount-hyca',
    label: 'High Yield Cash',
    displayName: 'High Yield Cash',
    logo: '/assets/brokers/surmount.png',
    value: 351242.54,
    cash: 351242.54,
    pending: 0,
    change: 947.35,
    phase: 1.5,
  },
];

const SWITCHER_ACCOUNTS: SwitcherAccount[] = [
  {
    id: 'surmount',
    label: 'Surmount',
    logo: '/assets/brokers/surmount.png',
    value: 52225.51,
    href: '/home/playground/account-selection-2/account/surmount',
  },
  {
    id: 'ibkr',
    label: 'IBKR',
    logo: '/assets/brokers/ibkr.png',
    value: 52225.51,
    href: '/home/playground/account-selection-2/account/ibkr',
  },
  {
    id: 'kraken',
    label: 'Kraken',
    logo: '/assets/brokers/kraken.png',
    value: 150345.67,
    href: '/home/playground/account-selection-2/account/kraken',
  },
  {
    id: 'alpaca',
    label: 'Alpaca',
    value: 75890.12,
    href: '/home/playground/account-selection-2/account/alpaca',
  },
  {
    id: 'surmount-hyca',
    label: 'High Yield Cash',
    logo: '/assets/brokers/surmount.png',
    value: 351242.54,
    href: '/home/playground/account-selection-2/account/surmount-hyca',
  },
];

const STRATEGIES: StrategyRow[] = [
  {
    id: 'quantum',
    name: 'Quantum Computing Leaders',
    cover: '/assets/strategy-covers/Quantum Computing Leaders.png',
    value: 351242.54,
    returnPct: 5.24,
    returnAbs: 8242.26,
  },
  {
    id: 'ai',
    name: 'Artificial Intelligence Innovators',
    cover: '/assets/strategy-covers/AI Innovators.png',
    value: 482731.16,
    returnPct: 7.15,
    returnAbs: 3472.89,
  },
  {
    id: 'biotech',
    name: 'Biotechnology Ventures',
    cover: '/assets/strategy-covers/Biotech Breakthroughs.png',
    value: 265478.9,
    returnPct: 4.89,
    returnAbs: 1642.78,
  },
];

const BREAKDOWN: BreakdownRow[] = [
  { ticker: 'NVDA', name: 'NVIDIA', logo: '/assets/logos/NVDA.webp', weight: '20.00%', price: '$52.80', value: '$16,900.00', shares: '320 shares', strategy: 'Strategy A, Strategy B' },
  { ticker: 'AAPL', name: 'Apple Inc.', logo: '/assets/logos/AAPL.webp', weight: '18.00%', price: '$34.52', value: '$10,500.00', shares: '72 shares', strategy: 'Strategy A' },
  { ticker: 'AMZN', name: 'Amazon.com', logo: '/assets/logos/AMZN.webp', weight: '15.00%', price: '$78.93', value: '$9,600.00', shares: '3 shares', strategy: 'Strategy A, Strategy B' },
  { ticker: 'MA', name: 'Mastercard', logo: '/assets/logos/MA.webp', weight: '14.00%', price: '$120.37', value: '$14,000.00', shares: '5 shares', strategy: 'Strategy A, Strategy B' },
  { ticker: 'MSFT', name: 'Microsoft Corp.', logo: '/assets/logos/MSFT.webp', weight: '12.00%', price: '$45.66', value: '$8,800.00', shares: '30 shares', strategy: 'Strategy B, Strategy C' },
];

const WATCHLIST = [
  { id: 'quantum', name: 'Quantum Computing Leaders', category: 'Technology', cover: '/assets/strategy-covers/Quantum Computing Leaders.png', value: 18432.54, returnPct: 4.68 },
  { id: 'ai', name: 'AI Infrastructure Leaders', category: 'Technology', cover: '/assets/strategy-covers/AI Innovators.png', value: 22108.92, returnPct: 2.14 },
  { id: 'biotech', name: 'Biotechnology Ventures', category: 'Healthcare', cover: '/assets/strategy-covers/Biotech Breakthroughs.png', value: 9750.3, returnPct: -0.82 },
];

const ACTIVITIES: ActivityRow[] = [
  { id: 'a1', date: 'May 5, 2026', ticker: 'GOOGL', kind: 'Sell', amount: '-$2,800.50', shares: '10.00 shares', logo: '/assets/logos/GOOG.webp' },
  { id: 'a2', date: 'May 5, 2026', ticker: 'GOOGL', kind: 'Buy', amount: '-$2,800.50', shares: '10.00 shares', logo: '/assets/logos/GOOG.webp' },
  { id: 'a3', date: 'May 3, 2026', ticker: 'AAPL', kind: 'Buy', amount: '-$2,485.44', shares: '72.00 shares', logo: '/assets/logos/AAPL.webp' },
];

function makeSeries(account: ExternalAccount): WealthsimpleChartPoint[] {
  const start = account.value - account.change * 2.2;
  return DATES.map((time, index) => {
    const progress = index / (DATES.length - 1);
    const drift = start + (account.value - start) * progress;
    const wave = Math.sin(index * 0.72 + account.phase) * account.value * 0.018;
    return { time, value: Number((drift + wave).toFixed(2)) };
  });
}

function fmt(value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtSigned(value: number) {
  return `${value < 0 ? '-' : '+'}${fmt(Math.abs(value))}`;
}

function fmtPct(value: number) {
  return `${value < 0 ? '-' : '+'}${Math.abs(value).toFixed(2)}%`;
}

function SwitcherAvatar({ account }: { account: SwitcherAccount }) {
  if (account.logo) {
    return <img src={account.logo} alt="" className={s.accountSwitcherAvatar} />;
  }

  return (
    <span className={[s.accountSwitcherAvatar, s.accountSwitcherFallbackAvatar].join(' ')} aria-hidden="true">
      {account.label.charAt(0)}
    </span>
  );
}

function AccountSwitcher({ account }: { account: ExternalAccount }) {
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const selectedAccount = SWITCHER_ACCOUNTS.find((item) => item.id === account.id) ?? SWITCHER_ACCOUNTS[1];
  const triggerLabel = account.id === 'surmount' ? account.label : selectedAccount.label;
  const closedWidth = Math.ceil(Math.min(300, Math.max(88, triggerLabel.length * 8.1 + 52)));
  const switcherStyle = {
    '--switcher-closed-width': `${closedWidth}px`,
  } as CSSProperties;

  useEffect(() => {
    setIsOpen(false);
  }, [account.id]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!switcherRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={s.accountSwitcher} ref={switcherRef} style={switcherStyle}>
      <button
        type="button"
        className={[s.accountSwitcherTrigger, isOpen ? s.accountSwitcherTriggerOpen : ''].filter(Boolean).join(' ')}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select account"
        onClick={() => setIsOpen((value) => !value)}
      >
        <span className={s.accountSwitcherTriggerContent}>
          <SwitcherAvatar account={selectedAccount} />
          <span className={s.accountSwitcherLabel}>{isOpen ? 'All accounts' : triggerLabel}</span>
        </span>
        <CaretDown className={s.accountSwitcherChevron} weight="bold" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className={s.accountSwitcherMenu} role="listbox" aria-label="Accounts">
          {SWITCHER_ACCOUNTS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={s.accountSwitcherOption}
              role="option"
              aria-selected={item.id === selectedAccount.id}
              onClick={() => setIsOpen(false)}
            >
              <span className={s.accountSwitcherOptionInner}>
                <SwitcherAvatar account={item} />
                <span className={s.accountSwitcherOptionText}>
                  <span className={s.accountSwitcherOptionName}>{item.label}</span>
                  <span className={s.accountSwitcherOptionValue}>{fmt(item.value)}</span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ExternalAccountDetailPage() {
  const params = useParams<{ id: string }>();
  const account = ACCOUNTS.find((item) => item.id === params.id) ?? ACCOUNTS[0];
  const isSurmountBrokerage = account.id === 'surmount';
  const data = useMemo(() => makeSeries(account), [account]);
  const changePct = account.changePct ?? (account.value - account.change !== 0
    ? (account.change / (account.value - account.change)) * 100
    : 0);

  return (
    <main className={s.main}>
      <header className={s.accountHeader}>
        <Link
          href="/home/playground/account-selection-2"
          className={s.backButton}
          aria-label="Back to accounts"
        >
          <ArrowLeft weight="bold" aria-hidden="true" />
        </Link>
        <AccountSwitcher account={account} />
        <button type="button" className={s.settingsButton} aria-label="Account settings">
          <GearSix weight="bold" aria-hidden="true" />
        </button>
      </header>

      <div key={account.id} className={s.pageLayout}>
        <div className={s.leftCol}>
          <section className={s.chartSection}>
            <WealthsimpleNetWorthChart
              value={account.value}
              changeText={`${fmtSigned(account.change)} (${fmtPct(changePct)})`}
              changePeriod="this month"
              data={data}
              initialRange="1D"
              height={237}
            />
          </section>

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
              </div>
              {STRATEGIES.map((row) => (
                <div key={row.id} className={s.tableRow}>
                  <div className={[s.td, s.tdStrategy].join(' ')}>
                    <img src={row.cover} alt="" className={s.strategyIcon} />
                    <span className={s.strategyName}>{row.name}</span>
                  </div>
                  <div className={[s.td, s.tdValue].join(' ')}>
                    <span className={s.valueText}>{fmt(row.value)}</span>
                  </div>
                  <div className={[s.td, s.tdReturn].join(' ')}>
                    <span className={s.returnPrimary}>{fmtPct(row.returnPct)}</span>
                    <span className={s.returnSecondary}>{fmtSigned(row.returnAbs)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={s.leftSection}>
            <div className={s.sectionHeader}>
              <span className={s.sectionTitle}>Portfolio breakdown</span>
              <button type="button" className={s.dropdownButton}>
                By asset
                <CaretDown weight="bold" aria-hidden="true" />
              </button>
            </div>

            <div className={s.breakdownTable}>
              <div className={s.breakdownHeader}>
                <span>Asset</span>
                <span>Weight</span>
                <span>Share price</span>
                <span>Value</span>
                <span>From strategy</span>
              </div>
              {BREAKDOWN.map((row) => (
                <div key={row.ticker} className={s.breakdownRow}>
                  <div className={s.assetCell}>
                    <img src={row.logo} alt="" className={s.assetLogo} />
                    <div className={s.assetText}>
                      <span className={s.assetTicker}>{row.ticker}</span>
                      <span className={s.assetName}>{row.name}</span>
                    </div>
                  </div>
                  <span>{row.weight}</span>
                  <span>{row.price}</span>
                  <div className={s.assetValue}>
                    <span>{row.value}</span>
                    <small>{row.shares}</small>
                  </div>
                  <span className={s.strategySource}>{row.strategy}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={s.leftSection}>
            <span className={s.sectionTitleSmall}>Recent activities</span>
            <div className={s.activityList}>
              {ACTIVITIES.map((activity) => (
                <div key={activity.id} className={s.activityRow}>
                  <img src={activity.logo} alt="" className={s.activityLogo} />
                  <div className={s.activityInfo}>
                    <div className={s.activityTitleRow}>
                      <span className={s.activityTicker}>{activity.ticker}</span>
                      <span className={[s.activityPill, activity.kind === 'Buy' ? s.activityPillBuy : s.activityPillSell].join(' ')}>
                        {activity.kind}
                      </span>
                    </div>
                    <span className={s.activityMeta}>{activity.shares} · {account.label}</span>
                  </div>
                  <span className={s.activityAmount}>{activity.amount}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className={s.rightCol}>
          {isSurmountBrokerage ? (
            <div className={s.brokerageActions}>
              <button type="button" className={s.brokerageActionCard}>
                <Plus weight="bold" aria-hidden="true" />
                <span>Add money</span>
              </button>
              <button type="button" className={s.brokerageActionCard}>
                <ArrowsLeftRight weight="bold" aria-hidden="true" />
                <span>Transfer money</span>
              </button>
            </div>
          ) : null}

          <div className={s.cashInvestCard}>
            <span className={s.cardLabel}>Cash available to invest</span>
            <strong>{fmt(account.cash)}</strong>
            <span className={s.pendingText}>{fmt(account.pending)} pending</span>
            <button type="button" className={s.investButton}>
              <span>Invest</span>
              <ArrowRight weight="bold" aria-hidden="true" />
            </button>
          </div>

          <section className={s.watchlistSection}>
            <div className={s.watchlistHeader}>
              <span className={s.watchlistTitle}>Watchlist</span>
              <div className={s.watchlistControls}>
                <button type="button">1D</button>
                <button type="button" aria-label="Filter watchlist">
                  <Funnel weight="bold" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className={s.watchlistItems}>
              {WATCHLIST.map((item) => (
                <div key={item.id} className={s.watchlistRow}>
                  <img src={item.cover} alt="" className={s.watchlistCover} />
                  <div className={s.watchlistInfo}>
                    <span className={s.watchlistName}>{item.name}</span>
                    <span className={s.watchlistCategory}>{item.category}</span>
                  </div>
                  <div className={s.watchlistRight}>
                    <span>{fmt(item.value)}</span>
                    <small className={item.returnPct >= 0 ? s.positive : s.negative}>{fmtPct(item.returnPct)}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
