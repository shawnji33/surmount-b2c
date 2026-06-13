'use client';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WealthsimpleNetWorthChart } from '@/components/charts/WealthsimpleNetWorthChart';
import { TransactionList } from '@/components/transactions/TransactionList';
import Link from 'next/link';
import { Suspense, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
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

function HomePageContent() {
  const searchParams = useSearchParams();
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
        title="Good morning, Logan"
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
                <AccountSwitcher selected={selectedPortfolioAccounts} onToggle={togglePortfolioAccount} />
              </div>
              <div className={s.sectionActions}>
                <button type="button" className={s.actionLink}>Edit</button>
                <button type="button" className={s.btnSecondary}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
                  Connect accounts
                </button>
              </div>
            </div>
            <WealthsimpleNetWorthChart
              value={portfolioValue}
              changeText={portfolioChangeText}
              changePeriod="this month"
              data={portfolioChartData}
              initialRange="1D"
              height={237}
            />


          </section>

          {/* Active Strategies */}
          <section className={s.leftSection}>
            <div className={s.sectionHeader}>
              <span className={s.sectionTitle}>Invested strategies</span>
              <div className={s.sectionActions}>
                <button type="button" className={s.actionLink}>Edit</button>
                <button type="button" className={s.btnSecondary}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
                  Add strategies
                </button>
              </div>
            </div>
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
          </section>

          {/* Portfolio Breakdown */}
          <section className={s.leftSection}>
            <div className={s.sectionHeader}>
              <span className={s.sectionTitle}>Portfolio breakdown</span>
              <button type="button" className={s.pbDropdown}>
                By asset
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 6l4 4 4-4" /></svg>
              </button>
            </div>
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
          </section>

          {/* Recent Activities */}
          <section className={s.leftSection}>
            <div className={s.txSectionHeader}>
              <span className={s.txSectionTitle}>Recent activities</span>
            </div>
            <TransactionList title={null} groups={ACTIVITY_GROUPS} />
          </section>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className={s.rightColumn}>

          {/* Carousel — top */}
          <Carousel />

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

          {/* Holdings / Watchlist tabbed module */}
          <WatchlistSection />

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
