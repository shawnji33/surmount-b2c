'use client';

import {
  WealthsimpleNetWorthChart,
  netWorthData,
  scaleWealthsimpleData,
} from '@/components/charts/WealthsimpleNetWorthChart';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import s from './page.module.css';

/* ── Strategy data map ─────────────────────────────────────────────────── */
const STRATEGY_DATA: Record<string, {
  name: string;
  cover: string;
  desc: string;
  oneYearReturn: string;
  risk: 'Low' | 'Medium' | 'High';
  industry: string;
  holdingsCount: string;
}> = {
  'quantum-computing-leaders': {
    name: 'Quantum Computing Leaders',
    cover: '/assets/strategy-result/covers/quantum-computing-leaders.png',
    desc: 'This investment strategy focuses on well-established companies within the quantum computing sector. The goal is to identify businesses that demonstrate leading-edge technology advantages and consistent growth potential.',
    oneYearReturn: '+8.50%',
    risk: 'Low',
    industry: 'Utilities',
    holdingsCount: '24 companies',
  },
  'artificial-intelligence-innovators': {
    name: 'Artificial Intelligence Innovators',
    cover: '/assets/strategy-result/covers/ai-innovators.png',
    desc: 'Targets companies leading the AI revolution across cloud infrastructure, model development, and enterprise applications.',
    oneYearReturn: '+9.10%',
    risk: 'Medium',
    industry: 'Technology',
    holdingsCount: '31 companies',
  },
  'biotechnology-ventures': {
    name: 'Biotechnology Ventures',
    cover: '/assets/strategy-covers/Biotech Breakthroughs.png',
    desc: 'Focuses on biotech companies with strong drug pipelines and breakthrough therapeutic potential.',
    oneYearReturn: '+7.40%',
    risk: 'Low',
    industry: 'Healthcare',
    holdingsCount: '18 companies',
  },
};

const ACCOUNTS = [
  { id: 'robinhood', name: 'Robinhood',  logo: '/assets/brokers/robinhood.png', cash: '$5,231.40',  holdings: '$5,000.00'  },
  { id: 'webull',    name: 'Webull',     logo: '/assets/brokers/webull.png',    cash: '$2,800.00',  holdings: '$3,200.00'  },
  { id: 'ibkr',      name: 'IBKR',       logo: '/assets/brokers/ibkr.png',      cash: '$18,450.00', holdings: '$12,500.00' },
  { id: 'schwab',    name: 'Schwab',     logo: '/assets/brokers/schwab.png',    cash: '$10,000.00', holdings: '$8,750.00'  },
  { id: 'coinbase',  name: 'Coinbase',   logo: '/assets/brokers/coinbase.png',  cash: '$640.20',    holdings: '$1,200.00'  },
];

const STRATEGY_PRICE = 138.44;
const STRATEGY_CHART_DATA = scaleWealthsimpleData(netWorthData, STRATEGY_PRICE);

type WtMode = 'buy' | 'sell' | 'review' | 'submitted';

/* ── BuySellWidget ──────────────────────────────────────────────────────── */
function BuySellWidget({ stratName }: { stratName: string }) {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [mode, setMode] = useState<WtMode>('buy');
  const [selectedAcctId, setSelectedAcctId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const [dropPos, setDropPos] = useState<{ top: number; left: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const selectedAcct = ACCOUNTS.find(a => a.id === selectedAcctId) ?? null;
  const parsedAmount = parseFloat(amount.replace(/,/g, ''));
  const hasAmount = amount.length > 0 && !isNaN(parsedAmount) && parsedAmount > 0;
  const isReady = !!selectedAcct && hasAmount;
  const displayAmount = hasAmount ? '$' + parsedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '$0.00';

  const openDrop = useCallback(() => {
    if (selectRef.current) {
      const r = selectRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 4, left: r.left });
    }
    setDropOpen(true);
  }, []);

  const closeDrop = useCallback(() => {
    setDropOpen(false);
    setDropPos(null);
  }, []);

  useEffect(() => {
    if (!dropOpen) return;
    const handler = (e: MouseEvent) => {
      if (!selectRef.current?.contains(e.target as Node) && !menuRef.current?.contains(e.target as Node)) {
        closeDrop();
      }
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrop(); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', esc); };
  }, [dropOpen, closeDrop]);

  const handleTabChange = (t: 'buy' | 'sell') => {
    setTab(t);
    setMode(t);
    setSelectedAcctId(null);
    setAmount('');
  };

  const handleSelectAcct = (id: string) => {
    setSelectedAcctId(id);
    closeDrop();
  };

  const handleMaxClick = () => {
    if (!selectedAcct) return;
    const val = tab === 'buy' ? selectedAcct.cash : selectedAcct.holdings;
    setAmount(val.replace(/[^0-9.]/g, ''));
  };

  const handleReview = () => {
    if (!isReady) return;
    setMode('review');
  };

  const handleBack = () => {
    setMode(tab);
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
  };

  useEffect(() => {
    if (!isSubmitting) return;
    const t = window.setTimeout(() => {
      setSubmittedAt(new Date());
      setIsSubmitting(false);
      setMode('submitted');
    }, 1600);
    return () => window.clearTimeout(t);
  }, [isSubmitting]);

  const handleDone = () => {
    setMode(tab);
    setSelectedAcctId(null);
    setAmount('');
    setSubmittedAt(null);
  };

  const submittedTimeStr = submittedAt
    ? 'Today at ' + submittedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase()
    : '';

  const cashLabel = tab === 'buy' ? selectedAcct?.cash ?? '—' : selectedAcct?.holdings ?? '—';
  const cashRowLabel = tab === 'buy' ? 'Available cash' : 'Holdings';
  const amountLabel = tab === 'buy' ? 'Investment amount' : 'Sell amount';
  const orderType = tab === 'buy' ? 'Market buy' : 'Market sell';
  const estimatedLabel = tab === 'buy' ? 'Estimated cost' : 'Estimated proceeds';

  const dropdown = dropPos && (
    <div
      ref={menuRef}
      className={s.wtAcctMenu}
      style={{ top: dropPos.top, left: dropPos.left }}
    >
      {ACCOUNTS.map(a => (
        <div
          key={a.id}
          className={[s.wtAcctOption, a.id === selectedAcctId ? s.wtAcctOptionSelected : ''].filter(Boolean).join(' ')}
          onClick={() => handleSelectAcct(a.id)}
        >
          <div className={s.wtAcctLogo}><img src={a.logo} alt={a.name} /></div>
          <div>
            <div className={s.wtAcctLabel}>{a.name}</div>
            <div className={s.wtAcctSub}>{tab === 'buy' ? a.cash : a.holdings} {tab === 'buy' ? 'available' : 'holdings'}</div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={s.buySellWidget}>

      {/* ── Default form ── */}
      {(mode === 'buy' || mode === 'sell') && (<>
        <div className={s.wtTitle}>
          <span>{tab === 'buy' ? 'Buy strategy' : 'Sell strategy'}</span>
        </div>

        <div className={s.wtTabs}>
          <button type="button" className={[s.wtTab, tab === 'buy' ? s.wtTabActive : ''].filter(Boolean).join(' ')} onClick={() => handleTabChange('buy')}>Buy</button>
          <button type="button" className={[s.wtTab, tab === 'sell' ? s.wtTabActive : ''].filter(Boolean).join(' ')} onClick={() => handleTabChange('sell')}>Sell</button>
        </div>

        <div className={[s.wtCard, s.wtOrderCard].join(' ')}>
          {/* Account */}
          <div className={s.wtRow}>
            <span className={s.wtLabel}>Account</span>
            <div className={s.wtAccountWrap}>
              <div
                ref={selectRef}
                className={[s.wtAccountSelect, dropOpen ? s.wtAccountSelectOpen : ''].filter(Boolean).join(' ')}
                onClick={() => (dropOpen ? closeDrop() : openDrop())}
              >
                <div className={s.wtAccountInner}>
                  {selectedAcct ? (
                    <>
                      <div className={s.wtBrokerAvatar}><img src={selectedAcct.logo} alt={selectedAcct.name} /></div>
                      <span className={s.wtAccountName}>{selectedAcct.name}</span>
                    </>
                  ) : (
                    <span className={s.wtAccountPlaceholder}>Select an account</span>
                  )}
                </div>
                <svg
                  className={[s.wtChevron, dropOpen ? s.wtChevronOpen : ''].filter(Boolean).join(' ')}
                  fill="none" stroke="currentColor" viewBox="0 0 16 16" strokeWidth="1.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6l4 4 4-4" />
                </svg>
              </div>
              {mounted && dropOpen && dropPos && createPortal(dropdown, document.body)}
            </div>
          </div>

          {/* Available cash / holdings reveal */}
          <div className={[s.wtCashReveal, selectedAcct ? s.wtCashRevealVisible : ''].filter(Boolean).join(' ')}>
            <div className={s.wtCashRow}>
              <span className={s.wtLabel}>{cashRowLabel}</span>
              <span className={s.wtCashVal}>{cashLabel}</span>
            </div>
          </div>

          {/* Amount */}
          <div className={s.wtRow}>
            <span className={s.wtLabel}>{amountLabel}</span>
            <div className={s.wtAmountWrap}>
              <span className={s.wtAmountPrefix}>$</span>
              <input
                className={s.wtAmountInput}
                type="text"
                placeholder="0.00"
                inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              />
              <button type="button" className={s.wtMaxBtn} onClick={handleMaxClick} disabled={!selectedAcct}>Max</button>
            </div>
          </div>

          <div className={s.wtDivider} />

          <div className={s.wtEstRow}>
            <span className={s.wtLabel}>{estimatedLabel}</span>
            <span className={s.wtEstValue}>{displayAmount}</span>
          </div>
        </div>

        <div className={s.wtFooter}>
          <button
            type="button"
            className={[s.btnNext, isReady ? s.btnNextReady : ''].filter(Boolean).join(' ')}
            onClick={handleReview}
            disabled={!isReady}
          >
            Review
          </button>
        </div>
      </>)}

      {/* ── Review panel ── */}
      {mode === 'review' && (
        <div className={s.wtReviewPanel}>
          <div className={s.wtTitle}>
            <button type="button" className={s.wtBackBtn} onClick={handleBack} aria-label="Back to order details">
              <svg fill="none" stroke="currentColor" viewBox="0 0 16 16" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 12L6 8l4-4" />
              </svg>
            </button>
            <span className={s.wtReviewTitle}>Review order</span>
          </div>

          <div className={s.wtCard}>
            <div className={s.wtReviewRow}>
              <span className={s.wtReviewKey}>Strategy</span>
              <span className={s.wtReviewVal}>{stratName.replace(' Leaders', '')}</span>
            </div>
            <div className={s.wtReviewRow}>
              <span className={s.wtReviewKey}>Order type</span>
              <span className={s.wtReviewVal}>{orderType}</span>
            </div>
            <div className={s.wtReviewRow}>
              <span className={s.wtReviewKey}>{amountLabel}</span>
              <span className={s.wtReviewVal}>{displayAmount}</span>
            </div>
            <div className={s.wtReviewRow}>
              <span className={s.wtReviewKey}>Account</span>
              <div className={s.wtReviewAcct}>
                {selectedAcct && (
                  <div className={s.wtReviewAcctLogo}><img src={selectedAcct.logo} alt={selectedAcct.name} /></div>
                )}
                <span className={s.wtReviewVal}>{selectedAcct?.name ?? '—'}</span>
              </div>
            </div>
            <div className={s.wtDivider} />
            <div className={s.wtReviewRow}>
              <span className={s.wtReviewKey}>{estimatedLabel}</span>
              <span className={[s.wtReviewVal, s.wtReviewStrong].join(' ')}>{displayAmount}</span>
            </div>
          </div>

          <div className={s.wtReviewFooter}>
            <p className={s.wtDisclaimer}>
              This order will execute at the next available market price. Surmount will rebalance your portfolio according to the strategy's current allocations.
            </p>
            <button
              type="button"
              className={s.btnSubmit}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting && <span className={s.btnSubmitSpinner} aria-hidden="true" />}
              {isSubmitting ? 'Submitting…' : 'Submit order'}
            </button>
          </div>
        </div>
      )}

      {/* ── Submitted panel ── */}
      {mode === 'submitted' && (
        <div className={s.wtSubmittedPanel}>
          <div className={s.wtTitle}>
            <span>Confirmation</span>
          </div>

          <div className={[s.wtCard, s.wtConfirmationCard].join(' ')}>
            <div className={s.wtConfirmationHero}>
              <span className={s.wtSuccessMark} aria-hidden="true">
                <svg viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="25" />
                  <path d="M21.5 32.5 28.5 39.5 43 24.5" />
                </svg>
              </span>
              <strong>Order submitted!</strong>
              <small>{submittedTimeStr}</small>
            </div>

            <div className={s.wtDivider} />

            <div className={s.wtReviewRow}>
              <span className={s.wtReviewKey}>Strategy</span>
              <span className={s.wtReviewVal}>{stratName.replace(' Leaders', '')}</span>
            </div>
            <div className={s.wtReviewRow}>
              <span className={s.wtReviewKey}>Order type</span>
              <span className={s.wtReviewVal}>{orderType}</span>
            </div>
            <div className={s.wtReviewRow}>
              <span className={s.wtReviewKey}>{amountLabel}</span>
              <span className={s.wtReviewVal}>{displayAmount}</span>
            </div>
            <div className={s.wtReviewRow}>
              <span className={s.wtReviewKey}>Account</span>
              <div className={s.wtReviewAcct}>
                {selectedAcct && (
                  <div className={s.wtReviewAcctLogo}><img src={selectedAcct.logo} alt={selectedAcct.name} /></div>
                )}
                <span className={s.wtReviewVal}>{selectedAcct?.name ?? '—'}</span>
              </div>
            </div>
            <div className={s.wtDivider} />
            <div className={s.wtReviewRow}>
              <span className={s.wtReviewKey}>{estimatedLabel}</span>
              <span className={[s.wtReviewVal, s.wtReviewStrong].join(' ')}>{displayAmount}</span>
            </div>
          </div>

          <div className={s.wtSubmittedFooter}>
            <p className={s.wtDisclaimer}>
              This order will execute at the next available market price. Surmount will rebalance your portfolio according to the strategy's current allocations.
            </p>
            <button type="button" className={s.btnDone} onClick={handleDone}>Done</button>
            <button type="button" className={s.btnViewDetails}>View details</button>
          </div>
        </div>
      )}

    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function StrategyDetailPage() {
  const params = useParams();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = rawId ?? 'quantum-computing-leaders';

  const strategy = STRATEGY_DATA[id] ?? STRATEGY_DATA['quantum-computing-leaders'];

  return (
    <main className={s.main}>

      {/* ── Page header ── */}
      <div className={s.pageHeader}>
        <div className={s.pageHeaderLeft}>
          <Link href="/home" className={s.backBtn}>
            <svg className={s.backChevron} fill="none" stroke="currentColor" viewBox="0 0 18 18" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 13.5L6.5 9 11 4.5" />
            </svg>
            <div className={s.backAvatar}>
              <img src={strategy.cover} alt={strategy.name} />
            </div>
            {strategy.name}
          </Link>
        </div>
        <div className={s.pageHeaderRight}>
          <button type="button" className={[s.btnIcon, s.btnIconOnly].join(' ')} aria-label="Save strategy">
            <img src="/assets/icon-star.svg" width={20} height={20} alt="" />
          </button>
          <button type="button" className={[s.btnIcon, s.btnIconText].join(' ')} aria-label="Share strategy">
            <img src="/assets/icon-share-new.svg" width={16} height={16} alt="" />
            Share
          </button>
        </div>
      </div>

      {/* ── Content area ── */}
      <div className={s.contentArea}>

        {/* LEFT COLUMN */}
        <div className={s.leftColumn}>

          {/* Hero */}
          <div className={s.leftSection}>
            <div className={s.heroCard}>
              <img src={strategy.cover} alt={strategy.name} className={s.heroCardBg} />
              <span className={s.heroProgressiveBlur} aria-hidden="true" />
              <div className={s.heroCardOverlay} />
              <div className={s.heroDetails}>
                <h1>{strategy.name}</h1>
                <dl className={s.heroMetrics}>
                  <div>
                    <dt>1-Year return</dt>
                    <dd className={s.positive}>{strategy.oneYearReturn}</dd>
                  </div>
                  <div>
                    <dt>Risk</dt>
                    <dd>
                      <span
                        className={[
                          s.riskDot,
                          strategy.risk === 'Medium' ? s.riskDotWarning : strategy.risk === 'High' ? s.riskDotDanger : s.riskDotSuccess,
                        ].join(' ')}
                        aria-hidden="true"
                      />
                      {strategy.risk}
                    </dd>
                  </div>
                  <div>
                    <dt>Top industry</dt>
                    <dd>{strategy.industry}</dd>
                  </div>
                  <div>
                    <dt>Holdings</dt>
                    <dd>{strategy.holdingsCount}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Chart section */}
          <div className={s.chartSection}>
            <WealthsimpleNetWorthChart
              value={STRATEGY_PRICE}
              changeText="$2.25 (0.56%)"
              changePeriod="this month"
              data={STRATEGY_CHART_DATA}
              initialRange="1D"
              height={237}
            />
          </div>

          {/* Your holdings */}
          <div className={s.leftSection}>
            <div className={s.sectionHeader}>
              <span className={s.sectionTitle}>Your holdings</span>
            </div>
            <div className={s.holdingsTable}>
              <div className={s.hThRow}>
                <div className={[s.hTh, s.hThAccount].join(' ')}>Related accounts</div>
                <div className={[s.hTh, s.hThAmount].join(' ')}>Invested amount</div>
                <div className={[s.hTh, s.hThReturns].join(' ')}>Total returns</div>
                <div className={[s.hTh, s.hThSince].join(' ')}>Invested since</div>
              </div>
              {[
                { logo: '/assets/brokers/ibkr.png',      name: 'IBKR',       shares: '4,491 shares', amount: '$124,152.62', ret: '+5.24%', since: 'Jul 25, 2025' },
                { logo: '/assets/brokers/kraken.png',    name: 'Kraken',     shares: '1,123 shares', amount: '$678,920.45', ret: '+3.15%', since: 'Aug 10, 2025' },
                { logo: '/assets/brokers/robinhood.png', name: 'Robinhood',  shares: '856 shares',   amount: '$245,789.30', ret: '+2.85%', since: 'Sep 15, 2025' },
                { logo: '/assets/brokers/surmount.png',  name: 'Surmount',   shares: '2,034 shares', amount: '$345,654.75', ret: '+4.50%', since: 'Oct 30, 2025' },
              ].map(row => (
                <div key={row.name} className={s.hRow}>
                  <div className={[s.hTd, s.hTdAccount].join(' ')}>
                    <div className={s.brokerLogo}><img src={row.logo} alt={row.name} /></div>
                    <div>
                      <div className={s.brokerName}>{row.name}</div>
                      <div className={s.brokerSub}>{row.shares}</div>
                    </div>
                  </div>
                  <div className={[s.hTd, s.hTdAmount].join(' ')}>
                    <div className={s.amountPrimary}>{row.amount}</div>
                  </div>
                  <div className={[s.hTd, s.hTdReturns].join(' ')}>
                    <div className={[s.returnBadge, s.returnBadgePositive].join(' ')}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      {row.ret}
                    </div>
                  </div>
                  <div className={[s.hTd, s.hTdSince].join(' ')}>
                    <div className={s.sinceText}>{row.since}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key metrics */}
          <div className={s.leftSection}>
            <div className={s.sectionHeader}>
              <span className={s.sectionTitle}>Key metrics</span>
              <button type="button" className={s.actionLink}>Show more</button>
            </div>
            <div className={s.metricsCard}>
              <div className={s.metricsGrid}>
                <div className={s.metricsCol}>
                  {[
                    { label: 'Asset classes',  value: 'Equity' },
                    { label: 'Annual return',  value: '-2.33%' },
                    { label: 'CAGR',           value: '-2.32%' },
                    { label: 'Return factor',  value: '0.89'   },
                    { label: 'Trades per day', value: '0.36'   },
                  ].map(m => (
                    <div key={m.label} className={s.metricRow}>
                      <span className={s.metricLabel}>{m.label}</span>
                      <span className={s.metricValue}>{m.value}</span>
                    </div>
                  ))}
                </div>
                <div className={s.metricsDivider} />
                <div className={s.metricsCol}>
                  {[
                    { label: 'Calmar ratio',        value: '-0.05'        },
                    { label: 'Standard deviation',  value: '1.95%'        },
                    { label: 'Alpha capacity',      value: '$643,989.62'  },
                    { label: 'Risk score',          value: '2.69'         },
                    { label: 'Total trades',        value: '298'          },
                  ].map(m => (
                    <div key={m.label} className={s.metricRow}>
                      <span className={s.metricLabel}>{m.label}</span>
                      <span className={s.metricValue}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top holdings */}
          <div className={s.leftSection}>
            <div className={s.sectionHeader}>
              <span className={s.sectionTitle}>Top holdings</span>
              <button type="button" className={s.actionLink}>View all</button>
            </div>
            <div className={s.topHoldingsTable}>
              <div className={s.pbThRow}>
                <div className={[s.pbTh, s.pbThTicker].join(' ')}>Ticker</div>
                <div className={[s.pbTh, s.pbThWeight].join(' ')}>Weight</div>
                <div className={[s.pbTh, s.pbThPrice].join(' ')}>Price</div>
                <div className={[s.pbTh, s.pbThValue].join(' ')}>Market value</div>
              </div>
              {[
                { logo: '/assets/logos/NVDA.webp', ticker: 'NVDA', name: 'NVIDIA Corp.',    weight: '20.00%', bar: 100, price: '$124.64', value: '$27,652.00' },
                { logo: '/assets/logos/MSFT.webp', ticker: 'MSFT', name: 'Microsoft Corp.', weight: '18.00%', bar: 90,  price: '$415.23', value: '$24,886.80' },
                { logo: '/assets/logos/GOOG.webp', ticker: 'GOOGL', name: 'Alphabet Inc.',  weight: '15.00%', bar: 75,  price: '$196.12', value: '$20,739.00' },
                { logo: null,                       ticker: 'IBM',   name: 'IBM Corp.',      weight: '12.00%', bar: 60,  price: '$236.71', value: '$16,591.20', bg: '#1F70C1' },
                { logo: null,                       ticker: 'IONQ',  name: 'IonQ Inc.',      weight: '10.00%', bar: 50,  price: '$42.38',  value: '$13,826.00', bg: '#6C3CF0' },
              ].map(row => (
                <div key={row.ticker} className={s.pbRow}>
                  <div className={[s.pbTd, s.pbTdTicker].join(' ')}>
                    <div className={s.tickerLogo} style={row.bg ? { background: row.bg } : undefined}>
                      {row.logo ? <img src={row.logo} alt={row.ticker} /> : row.ticker.slice(0, 2)}
                    </div>
                    <div>
                      <div className={s.tickerName}>{row.ticker}</div>
                      <div className={s.tickerFull}>{row.name}</div>
                    </div>
                  </div>
                  <div className={[s.pbTd, s.pbTdWeight].join(' ')}>
                    <div className={s.weightBarWrap}>
                      <div className={s.weightLabel}>{row.weight}</div>
                      <div className={s.weightBar}>
                        <div className={s.weightBarFill} style={{ width: `${row.bar}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className={[s.pbTd, s.pbTdPrice].join(' ')}>
                    <span className={s.pbPriceText}>{row.price}</span>
                  </div>
                  <div className={[s.pbTd, s.pbTdValue].join(' ')}>
                    <span className={s.pbValueText}>{row.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sector breakdown */}
          <div className={s.leftSection}>
            <div className={s.sectionHeader}>
              <span className={s.sectionTitle}>Sector breakdown</span>
            </div>
            <div className={s.sectorCard}>
              <div className={s.sectorBars}>
                {[
                  { name: 'Technology',              pct: 68, color: '#406AD0' },
                  { name: 'Communication Services',  pct: 15, color: '#6C3CF0' },
                  { name: 'Industrials',             pct: 10, color: '#3B7E3F' },
                  { name: 'Healthcare',              pct: 5,  color: '#F19246' },
                  { name: 'Other',                   pct: 2,  color: '#A4A7AE' },
                ].map(s2 => (
                  <div key={s2.name} className={s.sectorRow}>
                    <div className={s.sectorName}>{s2.name}</div>
                    <div className={s.sectorBarWrap}>
                      <div className={s.sectorBarFill} style={{ width: `${s2.pct}%`, background: s2.color }} />
                    </div>
                    <div className={s.sectorPct}>{s2.pct}.0%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Similar strategies */}
          <div className={s.leftSection}>
            <div className={s.sectionHeader}>
              <span className={s.sectionTitle}>Similar strategies</span>
            </div>
            <div className={s.similarWrap}>
              <div className={s.similarGrid}>
                {[
                  { cover: '/assets/strategy-result/covers/ai-innovators.png',              name: 'AI Infrastructure Leaders',  ret: '+13.25%', risk: 'Low',    riskColor: '#3B7E3F' },
                  { cover: '/assets/strategy-covers/Next-Gen Data Infrastructure.png',       name: 'Semiconductor Titans',        ret: '+45.80%', risk: 'Medium', riskColor: '#F19246' },
                  { cover: '/assets/strategy-covers/Deep Tech.png',                          name: 'Deep Tech Frontiers',         ret: '+22.10%', risk: 'High',   riskColor: '#98443D' },
                  { cover: '/assets/strategy-result/covers/quantum-computing-leaders.png',   name: 'Quantum Computing Leaders',   ret: '+31.40%', risk: 'Medium', riskColor: '#F19246' },
                ].map(card => (
                  <Link key={card.name} href={`/home/strategy/${card.name.toLowerCase().replace(/\s+/g, '-')}`} className={s.stratCard}>
                    <div className={s.stratHero}>
                      <img src={card.cover} alt={card.name} className={s.stratHeroImg} />
                      <div className={s.stratHeroGrad} />
                      <div className={s.stratHeroName}>{card.name}</div>
                    </div>
                    <div className={s.stratMeta}>
                      <div className={s.stratStat}>
                        <div className={s.stratStatLabel}>Top holdings</div>
                        <div className={s.stratStatValue}>
                          <div className={s.avatarStack}>
                            {['/assets/logos/NVDA.webp', '/assets/logos/AAPL.webp', '/assets/logos/GOOG.webp', '/assets/logos/MSFT.webp', '/assets/logos/AMZN.webp'].map((src, i) => (
                              <div key={i} className={s.avSm} style={{ zIndex: 5 - i }}><img src={src} alt="" /></div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className={s.stratDivider} />
                      <div className={s.stratStat}>
                        <div className={s.stratStatLabel}>1-Year return</div>
                        <div className={[s.stratStatValue, s.stratStatValueSuccess].join(' ')}>{card.ret}</div>
                      </div>
                      <div className={s.stratDivider} />
                      <div className={s.stratStat}>
                        <div className={s.stratStatLabel}>Risk score</div>
                        <div className={[s.stratStatValue, s.stratStatValueNormal].join(' ')}>
                          <span className={s.riskDotSm} style={{ background: card.riskColor }} />
                          {card.risk}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className={s.ctaRow}>
            <div className={s.ctaCard}>
              <div className={s.ctaIcon} style={{ background: 'var(--color-bg-brand-primary, #f1f6fd)' }}>
                <svg fill="none" stroke="var(--color-brand-600, #406ad0)" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <div className={s.ctaTextGroup}>
                <div className={s.ctaTitle}>Build your own strategy</div>
                <div className={s.ctaDesc}>Create a personalized investment strategy using our no-code builder with your own rules and criteria.</div>
              </div>
              <div className={s.ctaArrow}>
                Get started
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className={s.ctaCard}>
              <div className={s.ctaIcon} style={{ background: '#EEF7EE' }}>
                <svg fill="none" stroke="#3B7E3F" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div className={s.ctaTextGroup}>
                <div className={s.ctaTitle}>Learn more about investing</div>
                <div className={s.ctaDesc}>Explore our educational resources to understand strategies, risk, and how to build a diversified portfolio.</div>
              </div>
              <div className={s.ctaArrow} style={{ color: '#3B7E3F' }}>
                Explore resources
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className={s.rightColumn}>
          <BuySellWidget stratName={strategy.name} />
        </div>

      </div>
    </main>
  );
}
