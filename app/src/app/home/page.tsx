'use client';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WealthsimpleNetWorthChart } from '@/components/charts/WealthsimpleNetWorthChart';
import { TransactionList } from '@/components/transactions/TransactionList';
import Link from 'next/link';
import { Suspense, useState, useCallback, useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChartLineUp, ChartPieSlice, Receipt } from '@phosphor-icons/react';
import {
  STRATEGIES,
  PORTFOLIO_BREAKDOWN,
  ACTIVITY_GROUPS,
  ACCOUNT_SWITCHER_ACCOUNTS,
  type TransferMode,
} from './_data';
import {
  aggregatePortfolioSeries,
  sumPortfolioValues,
  formatSignedPortfolioCurrency,
  formatPortfolioPercent,
} from './_helpers';
import { AccountSwitcher } from './_components/AccountSwitcher';
import { Carousel } from './_components/Carousel';
import { WatchlistSection } from './_components/WatchlistSection';
import { TransferModal } from './_components/TransferModal';
import s from './page.module.css';

const CONNECTED_BROKERS: Record<string, { name: string; logo: string; cash: number }> = {
  kraken: { name: 'Kraken', logo: '/assets/brokers/kraken.png', cash: 12480.55 },
  coinbase: { name: 'Coinbase', logo: '/assets/brokers/coinbase.png', cash: 8230.12 },
  alpaca: { name: 'Alpaca', logo: '/assets/brokers/alpaca.png', cash: 5400.0 },
  etrade: { name: 'E*Trade', logo: '/assets/brokers/etrade.png', cash: 21750.4 },
  tradestation: { name: 'TradeStation', logo: '/assets/brokers/tradestation.jpeg', cash: 9325.8 },
};

const formatUSD = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function EmptyState({ icon, title, desc, ctaLabel, ctaHref }: {
  icon: ReactNode;
  title: string;
  desc: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className={s.emptyState}>
      <span className={s.emptyStateIcon} aria-hidden="true">{icon}</span>
      <span className={s.emptyStateTitle}>{title}</span>
      <p className={s.emptyStateDesc}>{desc}</p>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className={s.emptyStateCta} style={{ textDecoration: 'none' }}>
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const isEmpty = searchParams.get('state') === 'empty';
  const broker = CONNECTED_BROKERS[searchParams.get('connected') ?? 'kraken'] ?? CONNECTED_BROKERS.kraken;

  const [transferMode, setTransferMode] = useState<TransferMode | null>(() => searchParams.get('deposit') === '1' ? 'deposit' : null);
  const [selectedPortfolioAccounts, setSelectedPortfolioAccounts] = useState<Set<string>>(
    () => new Set(ACCOUNT_SWITCHER_ACCOUNTS.map((account) => account.id)),
  );

  const selectedAccounts = useMemo(
    () => ACCOUNT_SWITCHER_ACCOUNTS.filter((account) => selectedPortfolioAccounts.has(account.id)),
    [selectedPortfolioAccounts],
  );
  const portfolioChartData = useMemo(() => aggregatePortfolioSeries(selectedAccounts), [selectedAccounts]);
  const portfolioValue = useMemo(
    () => sumPortfolioValues(selectedAccounts.map((account) => account.value)),
    [selectedAccounts],
  );
  const portfolioChange = useMemo(
    () => sumPortfolioValues(selectedAccounts.map((account) => account.change)),
    [selectedAccounts],
  );
  const portfolioStartingValue = portfolioValue - portfolioChange;
  const portfolioChangePct = portfolioStartingValue !== 0
    ? (portfolioChange / portfolioStartingValue) * 100
    : 0;
  const portfolioChangeText = `${formatSignedPortfolioCurrency(portfolioChange)} (${formatPortfolioPercent(portfolioChangePct)})`;

  const togglePortfolioAccount = useCallback((id: string) => {
    setSelectedPortfolioAccounts((previous) => {
      if (previous.has(id) && previous.size === 1) return previous;
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <main className={s.main}>
      <DashboardHeader
        title={isEmpty ? `Welcome to Surmount, Logan` : 'Good morning, Logan'}
        onDeposit={() => setTransferMode('deposit')}
        onWithdraw={() => setTransferMode('withdrawal')}
      />

      <div className={s.contentArea}>

        {/* ── LEFT COLUMN ── */}
        <div className={s.leftColumn}>

          {/* Portfolio — hero + chart naked (no card chrome) */}
          <section className={s.portfolioSection}>
            <div className={s.sectionHeader}>
              <div className={s.sectionTitleRow}>
                {isEmpty ? (
                  <div className={s.emptyAccountChip}>
                    <img src={broker.logo} alt="" />
                    <span>{broker.name}</span>
                  </div>
                ) : (
                  <AccountSwitcher selected={selectedPortfolioAccounts} onToggle={togglePortfolioAccount} />
                )}
              </div>
              <div className={s.sectionActions}>
                {!isEmpty && <button type="button" className={s.actionLink}>Edit</button>}
                <button type="button" className={s.btnSecondary}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
                  Connect accounts
                </button>
              </div>
            </div>

            {isEmpty ? (
              <div className={s.emptyHero}>
                <span className={s.emptyHeroLabel}>Available to trade</span>
                <span className={s.emptyHeroValue}>{formatUSD(broker.cash)}</span>
              </div>
            ) : (
              <WealthsimpleNetWorthChart
                value={portfolioValue}
                changeText={portfolioChangeText}
                changePeriod="this month"
                data={portfolioChartData}
                initialRange="1D"
                height={237}
              />
            )}
          </section>

          {/* Active Strategies */}
          <section className={s.leftSection}>
            <div className={s.sectionHeader}>
              <span className={s.sectionTitle}>Invested strategies</span>
              {!isEmpty && (
                <div className={s.sectionActions}>
                  <button type="button" className={s.actionLink}>Edit</button>
                  <button type="button" className={s.btnSecondary}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
                    Add strategies
                  </button>
                </div>
              )}
            </div>
            {isEmpty ? (
              <EmptyState
                icon={<ChartLineUp weight="regular" />}
                title="No strategies yet"
                desc="Explore the marketplace to find strategies that match how you want to invest, then start putting your cash to work."
                ctaLabel="Explore the marketplace"
                ctaHref="/strategy-result"
              />
            ) : (
              <div className={s.strategiesTable}>
                <div className={s.tableHeader}>
                  <div className={[s.th, s.thStrategy].join(' ')}>Strategy</div>
                  <div className={[s.th, s.thValue].join(' ')}>Value</div>
                  <div className={[s.th, s.thReturn].join(' ')}>Total return</div>
                  <div className={[s.th, s.thAccount].join(' ')}>Account</div>
                </div>
                {STRATEGIES.map((row) => (
                  <Link key={row.name} href={`/home/strategy/${row.name.toLowerCase().replace(/\s+/g, '-')}`} className={s.tableRow} style={{ textDecoration: 'none' }}>
                    <div className={[s.td, s.tdStrategy].join(' ')}>
                      <div className={s.strategyIcon}>
                        <img src={row.cover} alt={row.name} />
                      </div>
                      <span className={s.strategyName}>{row.name}</span>
                    </div>
                    <div className={[s.td, s.tdValue].join(' ')}>
                      <span className={s.tdValueText}>{row.value}</span>
                    </div>
                    <div className={[s.td, s.tdReturn].join(' ')}>
                      <span className={s.tdReturnPrimary}>{row.returnPct}</span>
                      <span className={s.tdReturnSecondary}>{row.returnAbs}</span>
                    </div>
                    <div className={[s.td, s.tdAccount].join(' ')}>
                      <div className={s.avatarGroup}>
                        {row.brokers.map((src, i) => (
                          <div key={i} className={s.accountAvatar}>
                            <img src={src} alt="" />
                          </div>
                        ))}
                        <div className={[s.accountAvatar, s.accountAvatarOverflow].join(' ')}>{row.overflow}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Portfolio Breakdown */}
          <section className={s.leftSection}>
            <div className={s.sectionHeader}>
              <span className={s.sectionTitle}>Portfolio breakdown</span>
              {!isEmpty && (
                <button type="button" className={s.pbDropdown}>
                  By asset
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 6l4 4 4-4" /></svg>
                </button>
              )}
            </div>
            {isEmpty ? (
              <EmptyState
                icon={<ChartPieSlice weight="regular" />}
                title="Nothing to break down yet"
                desc="Once you invest in a strategy, your holdings and allocation will show up here."
              />
            ) : (
              <div className={s.pbTable}>
                <div className={s.pbHeader}>
                  <div className={s.pbTh}>Asset</div>
                  <div className={s.pbTh}>
                    Weight
                    <svg className={s.sortArrow} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2v8M3 7l3 3 3-3" /></svg>
                  </div>
                  <div className={s.pbTh}>Share price</div>
                  <div className={s.pbTh}>Value</div>
                  <div className={s.pbTh}>From strategy</div>
                </div>
                {PORTFOLIO_BREAKDOWN.map((row) => (
                  <div key={row.ticker} className={s.pbRow}>
                    <div className={s.pbTd}>
                      <div className={s.tickerLogo}><img src={row.logo} alt={row.ticker} /></div>
                      <div className={s.tickerText}>
                        <span className={s.tickerSymbol}>{row.ticker}</span>
                        <span className={s.tickerName}>{row.name}</span>
                      </div>
                    </div>
                    <div className={s.pbTd}><span className={s.pbWeight}>{row.weight}</span></div>
                    <div className={s.pbTd}><span className={s.pbPrice}>{row.price}</span></div>
                    <div className={s.pbTd}>
                      <div className={s.pbValue}>
                        <span className={s.pbValuePrimary}>{row.value}</span>
                        <span className={s.pbValueSecondary}>{row.shares}</span>
                      </div>
                    </div>
                    <div className={s.pbTd}><span className={s.pbStrategy}>{row.strategies}</span></div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Activities */}
          <section className={s.leftSection}>
            <div className={s.txSectionHeader}>
              <span className={s.txSectionTitle}>Recent activities</span>
            </div>
            {isEmpty ? (
              <EmptyState
                icon={<Receipt weight="regular" />}
                title="No activity yet"
                desc="Your deposits, trades, and dividends will appear here once you start investing."
              />
            ) : (
              <TransactionList title={null} groups={ACTIVITY_GROUPS} />
            )}
          </section>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className={s.rightColumn}>

          {/* Dividend management — compact utility row */}
          <a className={s.utilityRow} href="#" aria-label="Dividend management">
            <div className={s.utilityRowIconWrap}>
              <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm52-88a52,52,0,1,1-52-52A52.06,52.06,0,0,1,180,128Zm-16,0a36,36,0,1,0-36,36A36,36,0,0,0,164,128Z"/>
              </svg>
            </div>
            <span className={s.utilityRowLabel}>Dividend management</span>
            <svg className={s.utilityRowChevron} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7.5 5l5 5-5 5" />
            </svg>
          </a>

          {/* Carousel */}
          <Carousel variant={isEmpty ? 'empty' : 'default'} />

          {/* Holdings / Watchlist tabbed module — end of column */}
          <WatchlistSection empty={isEmpty} />

        </div>

      </div>

      {transferMode && <TransferModal mode={transferMode} onClose={() => setTransferMode(null)} />}
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  );
}
