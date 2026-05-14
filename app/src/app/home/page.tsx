'use client';

import { useState } from 'react';
import s from './page.module.css';

/* ── Static chart path data from the Surmount homepage design ── */
const CHART_LINE = "M6,166.77C11,166.77,17,166.77,23,166.77C29,166.77,35,166.77,41,166.77C47,166.77,53,166.77,59,166.77C65,166.77,68,166.79,74,166.89C79,166.66,85,167.00,91,166.78C96,166.75,102,166.47,108,166.32C113,166.66,119,166.90,125,166.94C130,167.12,136,167.05,141,166.65C147,166.56,153,166.40,158,165.98C164,165.71,170,165.96,175,166.18C181,166.50,187,166.64,192,166.96C198,167.03,204,166.86,209,167.46C215,167.33,220,167.28,226,167.53C232,167.73,237,167.31,243,167.15C249,166.79,254,166.99,260,166.94C266,167.29,271,167.51,277,167.47C283,167.08,288,167.11,294,166.99C300,166.48,305,166.27,311,166.13C316,166.47,322,166.61,328,166.11C333,166.79,339,166.58,345,166.42C350,166.24,356,166.35,362,166.40C367,166.20,373,166.24,379,165.94C384,165.97,390,166.12,396,169.89C401,164.35,407,162.27,412,164.82C418,163.59,424,159.85,429,160.24C435,155.67,441,157.17,446,159.26C452,160.26,458,162.44,463,160.32C469,161.09,474,160.01,480,160.62C486,164.00,491,165.23,497,162.18C503,160.09,508,163.11,514,166.31C520,161.33,525,157.62,531,156.26C537,155.96,542,156.46,548,158.06C554,155.07,559,154.13,565,153.79C570,153.89,576,153.17,582,153.36C587,151.25,593,153.54,599,150.83C604,150.51,610,152.09,616,150.27C621,147.86,627,146.97,633,146.59C638,146.82,644,146.90,649,147.12C655,148.11,661,148.01,666,146.76C672,145.50,678,144.71,683,144.30C689,143.58,695,142.20,700,141.37C706,140.64,712,140.69,717,138.40C723,136.83,729,138.53,734,140.73C740,140.29,745,143.58,751,141.97C757,139.95,762,141.13,768,142.10C774,142.14,779,141.26,785,138.69C791,138.63,796,135.01,802,135.37C808,135.99,813,132.80,819,130.10C825,125.56,830,127.57,836,131.25C841,126.17,847,126.07,853,129.70C858,125.92,864,129.12,870,128.41C875,128.58,881,124.42,887,128.86C892,129.54,898,127.83,904,122.04C909,134.55,915,140.14,921,149.13C926,147.06,932,145.13,937,146.75C943,151.49,949,164.58,954,158.75C960,150.92,966,146.16,971,123.94C977,127.55,983,124.90,988,122.45C994,120.83,999,119.73,1005,115.04C1011,112.53,1016,112.24,1022,108.32C1028,101.54,1033,90.35,1039,85.40C1045,75.48,1050,85.68,1056,81.05C1062,82.13,1067,67.77,1073,53.52C1079,49.32,1084,45.87,1090,32.09C1095,48.57,1101,59.68,1107,44.67C1112,74.07,1118,77.81,1124,137.92C1129,113.19,1135,104.28,1141,85.83C1146,141.53,1152,123.39,1158,136.97C1163,107.46,1169,95.65,1175,116.60C1180,166.25,1186,221.72,1191,221.59C1197,219.27,1203,204.03,1208,207.94C1214,218.91,1220,226.24,1225,229.55C1231,233.91";

const CHART_FILL = CHART_LINE.replace(/L1231,233.91$/, 'L1231,248C1225,248,1220,248,1214,248,1208,248,1203,248,1197,248,1191,248,1186,248,1180,248,1175,248,1169,248,1163,248,1158,248,1152,248,1146,248,1141,248,1135,248,1129,248,1124,248,1118,248,1112,248,1107,248,1101,248,1095,248,1090,248,1084,248,1079,248,1073,248,1067,248,1062,248,1056,248,1050,248,1045,248,1039,248,1033,248,1028,248,1022,248,1016,248,1011,248,1005,248,999,248,994,248,988,248,983,248,977,248,971,248,966,248,960,248,954,248,949,248,943,248,937,248,932,248,926,248,921,248,915,248,909,248,904,248,898,248,892,248,887,248,881,248,875,248,870,248,864,248,858,248,853,248,847,248,841,248,836,248,830,248,825,248,819,248,813,248,808,248,802,248,796,248,791,248,785,248,779,248,774,248,768,248,762,248,757,248,751,248,745,248,740,248,734,248,729,248,723,248,717,248,712,248,706,248,700,248,695,248,689,248,683,248,678,248,672,248,666,248,661,248,655,248,649,248,644,248,638,248,633,248,627,248,621,248,616,248,610,248,604,248,599,248,593,248,587,248,582,248,576,248,570,248,565,248,559,248,554,248,548,248,542,248,537,248,531,248,525,248,520,248,514,248,508,248,503,248,497,248,491,248,486,248,480,248,474,248,469,248,463,248,458,248,452,248,446,248,441,248,435,248,429,248,424,248,418,248,412,248,407,248,401,248,396,248,390,248,384,248,379,248,373,248,367,248,362,248,356,248,350,248,345,248,339,248,333,248,328,248,322,248,316,248,311,248,305,248,300,248,294,248,288,248,283,248,277,248,271,248,266,248,260,248,254,248,249,248,243,248,237,248,232,248,226,248,220,248,215,248,209,248,204,248,198,248,192,248,187,248,181,248,175,248,170,248,164,248,158,248,153,248,147,248,141,248,136,248,130,248,125,248,119,248,113,248,108,248,102,248,96,248,91,248,85,248,79,248,74,248,68,248,65,248,59,248,53,248,47,248,41,248,35,248,29,248,23,248,17,248,11,248,6,248Z');

const TIME_PERIODS = ['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y'] as const;
type TimePeriod = typeof TIME_PERIODS[number];

const STRATEGIES = [
  { name: 'Quantum Computing Leaders', cover: '/assets/strategy-covers/Quantum Computing Leaders.png', value: '$351,242.54', returnPct: '+5.24%', returnAbs: '+$2,452.26', brokers: ['/assets/brokers/robinhood.png', '/assets/brokers/ibkr.png'], overflow: '+11' },
  { name: 'Artificial Intelligence Innovators', cover: '/assets/strategy-covers/AI Innovators.png', value: '$482,731.16', returnPct: '+7.15%', returnAbs: '+$3,472.89', brokers: ['/assets/brokers/coinbase.png', '/assets/brokers/schwab.png'], overflow: '+10' },
  { name: 'Biotechnology Ventures', cover: '/assets/strategy-covers/Biotech Breakthroughs.png', value: '$265,478.90', returnPct: '+4.89%', returnAbs: '+$1,642.78', brokers: ['/assets/brokers/webull.png'], overflow: '+5' },
];

const PORTFOLIO_BREAKDOWN = [
  { ticker: 'NVDA', name: 'NVIDIA', logo: '/assets/logos/NVDA.webp', weight: '20.00%', price: '$52.80', value: '$16,900.00', shares: '320 shares', strategies: 'Strategy A, Strategy B' },
  { ticker: 'AAPL', name: 'Apple Inc.', logo: '/assets/logos/AAPL.webp', weight: '18.00%', price: '$34.52', value: '$10,500.00', shares: '72 shares', strategies: 'Strategy A' },
  { ticker: 'AMZN', name: 'Amazon.com', logo: '/assets/logos/AMZN.webp', weight: '15.00%', price: '$78.93', value: '$9,600.00', shares: '3 shares', strategies: 'Strategy A, Strategy B' },
  { ticker: 'MA', name: 'Mastercard', logo: '/assets/logos/MA.webp', weight: '14.00%', price: '$120.37', value: '$14,000.00', shares: '5 shares', strategies: 'Strategy A, Strategy B, Strategy C' },
  { ticker: 'MSFT', name: 'Microsoft Corp.', logo: '/assets/logos/MSFT.webp', weight: '12.00%', price: '$45.66', value: '$8,800.00', shares: '30 shares', strategies: 'Strategy B, Strategy C' },
];

type ActivityItem = {
  id: string;
  kind: 'buy' | 'sell' | 'deposit';
  name: string;
  pillLabel: string;
  meta: string;
  amount: number;
  sign?: string;
  avatarImg?: string;
  details: Record<string, string | { value: string; state?: string; avatar?: string }>;
};

type ActivityGroup = {
  date: string;
  items: ActivityItem[];
};

const ACTIVITIES: ActivityGroup[] = [
  {
    date: 'May 5, 2026',
    items: [
      { id: 'a1', kind: 'sell', name: 'GOOGL', pillLabel: 'Sell', meta: '10.00 shares · Coinbase', amount: 2800.50, avatarImg: '/assets/logos/GOOG.webp', details: { Symbol: 'GOOGL', Shares: '10.00', Price: '$280.05', Status: { value: 'Complete', state: 'complete' }, Account: { value: 'Coinbase', avatar: '/assets/brokers/coinbase.png' }, Date: 'May 5, 2026' } },
      { id: 'a2', kind: 'buy', name: 'GOOGL', pillLabel: 'Buy', meta: '10.00 shares · Coinbase', amount: 2800.50, avatarImg: '/assets/logos/GOOG.webp', details: { Symbol: 'GOOGL', Shares: '10.00', Price: '$280.05', Status: { value: 'Complete', state: 'complete' }, Account: { value: 'Coinbase', avatar: '/assets/brokers/coinbase.png' }, Date: 'May 5, 2026' } },
      { id: 'a3', kind: 'deposit', name: 'Deposit', pillLabel: 'Deposit', meta: 'From Coinbase', amount: 2800.50, sign: '+', details: { From: { value: 'Coinbase', avatar: '/assets/brokers/coinbase.png' }, To: { value: 'Surmount Cash', avatar: '/assets/brokers/surmount.png' }, Status: { value: 'In progress', state: 'pending' }, Date: 'May 5, 2026', Method: 'Standard transfer' } },
    ],
  },
  {
    date: 'May 4, 2026',
    items: [
      { id: 'a4', kind: 'buy', name: 'NVDA', pillLabel: 'Buy', meta: '100.00 shares · Schwab', amount: 5280.00, avatarImg: '/assets/logos/NVDA.webp', details: { Symbol: 'NVDA', Shares: '100.00', Price: '$52.80', Status: { value: 'Complete', state: 'complete' }, Account: { value: 'Schwab', avatar: '/assets/brokers/schwab.png' }, Date: 'May 4, 2026' } },
    ],
  },
  {
    date: 'May 3, 2026',
    items: [
      { id: 'a5', kind: 'buy', name: 'AAPL', pillLabel: 'Buy', meta: '72.00 shares · Schwab', amount: 2485.44, avatarImg: '/assets/logos/AAPL.webp', details: { Symbol: 'AAPL', Shares: '72.00', Price: '$34.52', Status: { value: 'Complete', state: 'complete' }, Account: { value: 'Schwab', avatar: '/assets/brokers/schwab.png' }, Date: 'May 3, 2026' } },
    ],
  },
];

const DIVIDEND_ITEMS = [
  { label: 'XYZ', amount: '$89.50 (18%)', color: '#9B8AFB', pct: 31 },
  { label: 'PQR', amount: '$95.70 (15%)', color: '#A2D3A5', pct: 23 },
  { label: 'GHI', amount: '$95.75 (22%)', color: '#8EBDEB', pct: 17 },
  { label: 'JKL', amount: '$110.25 (25%)', color: '#A4A7AE', pct: 14 },
  { label: 'Other', amount: '$82.40 (20%)', color: 'var(--color-warning-400, #f19246)', pct: 15 },
];

function PortfolioChart({ activePeriod, onPeriodChange }: { activePeriod: TimePeriod; onPeriodChange: (p: TimePeriod) => void }) {
  return (
    <div className={s.portfolioCard}>
      <div className={s.portfolioCardTop}>
        <div className={s.portfolioValueRow}>
          <span className={s.portfolioValueWhole}>$234,984,486</span>
          <span className={s.portfolioValueCents}>.24</span>
        </div>
        <div className={s.chartTabs}>
          <button className={[s.chartTab, s.chartTabActive].join(' ')}>Return</button>
          <button className={s.chartTab}>Allocation</button>
          <button className={s.chartTab}>Income</button>
        </div>
        <div className={s.chartControlsRow}>
          <div className={s.chartPerf}>
            <svg className={s.perfArrow} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 15L15 5M15 5H8M15 5v7" />
            </svg>
            <span className={s.perfValue}>$256.25 (12.45%)</span>
            <span className={s.perfPeriod}>this month</span>
          </div>
          <div className={s.timeSelector}>
            {TIME_PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                className={[s.timeBtn, activePeriod === p ? s.timeBtnActive : ''].filter(Boolean).join(' ')}
                onClick={() => onPeriodChange(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={s.chartWrap}>
        <svg viewBox="0 0 1237 248" preserveAspectRatio="none" className={s.chartSvg} aria-hidden="true">
          <defs>
            <linearGradient id="chart-grad-home" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop stopColor="#A2D3A5" stopOpacity="1" />
              <stop offset="100%" stopColor="#A2D3A5" stopOpacity="0" />
            </linearGradient>
            <pattern id="chart-dots-home" x="0" y="0" width="2" height="2" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="white" />
            </pattern>
            <mask id="chart-dot-mask-home">
              <rect width="100%" height="100%" fill="url(#chart-dots-home)" />
            </mask>
          </defs>
          <path d={CHART_FILL} fill="url(#chart-grad-home)" mask="url(#chart-dot-mask-home)" strokeWidth="0" />
          <path d={CHART_LINE} stroke="#3B7E3F" strokeWidth="4" opacity="0.15" fill="transparent" />
          <path d={CHART_LINE} stroke="#3B7E3F" strokeWidth="1.5" fill="transparent" />
          <line x1="4" x2="1233" y1="166.77" y2="166.77" strokeDasharray="4 4" strokeWidth="1" stroke="#A4A7AE" strokeOpacity="0.5" strokeLinecap="butt" />
        </svg>
      </div>
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const [expanded, setExpanded] = useState(false);
  const isBuy = item.kind === 'buy';
  const isSell = item.kind === 'sell';
  const isDeposit = item.kind === 'deposit';

  const amountStr = `${item.sign ?? (isSell ? '-' : (isBuy ? '-' : '+'))}$${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const amountClass = isDeposit ? s.amountPositive : isSell ? s.amountNegative : s.amountNeutral;

  return (
    <div className={s.activityRowWrap}>
      <button
        type="button"
        className={s.activityRow}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className={s.activityLeft}>
          {item.avatarImg ? (
            <div className={s.activityAvatar}>
              <img src={item.avatarImg} alt={item.name} />
            </div>
          ) : (
            <div className={[s.activityAvatar, s.activityAvatarIcon].join(' ')}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 12.5V3M6.5 7l3.5-3.5L13.5 7" />
                <path d="M3.5 12v3a1.5 1.5 0 001.5 1.5h10a1.5 1.5 0 001.5-1.5v-3" />
              </svg>
            </div>
          )}
          <div className={s.activityInfo}>
            <div className={s.activityNameRow}>
              <span className={s.activityName}>{item.name}</span>
              <span className={[s.pill, s[`pill${item.kind.charAt(0).toUpperCase() + item.kind.slice(1)}`]].join(' ')}>{item.pillLabel}</span>
            </div>
            <span className={s.activityMeta}>{item.meta}</span>
          </div>
        </div>
        <div className={s.activityRight}>
          <span className={[s.activityAmount, amountClass].join(' ')}>{amountStr}</span>
          <svg className={[s.activityChevron, expanded ? s.activityChevronOpen : ''].filter(Boolean).join(' ')} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className={s.activityDetails}>
          {Object.entries(item.details).map(([key, val]) => {
            if (typeof val === 'string') {
              return (
                <div key={key} className={s.detailRow}>
                  <span className={s.detailKey}>{key}</span>
                  <span className={s.detailVal}>{val}</span>
                </div>
              );
            }
            const { value, state, avatar } = val as { value: string; state?: string; avatar?: string };
            return (
              <div key={key} className={s.detailRow}>
                <span className={s.detailKey}>{key}</span>
                <span className={[s.detailVal, state === 'complete' ? s.detailComplete : state === 'pending' ? s.detailPending : ''].filter(Boolean).join(' ')}>
                  {avatar && <img src={avatar} alt="" className={s.detailAvatar} />}
                  {value}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Carousel() {
  const [index, setIndex] = useState(0);
  const total = 2;
  return (
    <div>
      <div className={s.carouselHeader}>
        <span className={s.carouselCounter}>{index + 1} of {total}</span>
        <div className={s.carouselControls}>
          <button type="button" className={s.carouselBtn} onClick={() => setIndex((i) => (i - 1 + total) % total)} aria-label="Previous slide">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4L6 8l4 4" /></svg>
          </button>
          <button type="button" className={s.carouselBtn} onClick={() => setIndex((i) => (i + 1) % total)} aria-label="Next slide">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4l4 4-4 4" /></svg>
          </button>
        </div>
      </div>
      <div className={s.carouselViewport}>
        <div className={s.carouselTrack} style={{ transform: `translateX(${-index * 100}%)` }}>
          <div className={[s.carouselSlide, s.promoCardSlide].join(' ')}>
            <div className={s.promoCardText}>
              <h3 className={s.promoCardTitle}>Boost your savings with our top-notch 4.35% APY</h3>
              <p className={s.promoCardSub}>Make the most of your uninvested funds with our high-yield options.</p>
            </div>
            <span className={s.promoCardArrow} aria-hidden="true">
              <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <rect width="256" height="256" fill="none" />
                <line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <polyline points="144 56 216 128 144 200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
              </svg>
            </span>
            <div className={s.promoCardIllo} aria-hidden="true">
              <img src="/assets/illustrations/wallet-coin.png" alt="" />
            </div>
          </div>
          <div className={s.carouselSlide}>
            <img src="/assets/card-start-surmount.png" alt="Start with a Surmount account" className={s.carouselSlideImg} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('1M');

  return (
    <main className={s.main}>
      <header className={s.pageHeader}>
        <span className={s.greeting}>Good morning, Logan</span>
        <div className={s.searchBox}>
          <div className={s.searchBoxInner}>
            <svg className={s.searchIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="9" r="6" /><path d="M16.5 16.5l-3.5-3.5" />
            </svg>
            <span className={s.searchPlaceholder}>Find an investment</span>
          </div>
          <span className={s.searchShortcut}>⌘K</span>
        </div>
      </header>

      <div className={s.contentArea}>

        {/* ── LEFT COLUMN ── */}
        <div className={s.leftColumn}>

          {/* Portfolio */}
          <section className={s.leftSection}>
            <div className={s.sectionHeader}>
              <span className={s.sectionTitle}>Portfolio</span>
              <div className={s.sectionActions}>
                <button type="button" className={s.actionLink}>Edit</button>
                <button type="button" className={s.btnSecondary}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
                  Connect accounts
                </button>
              </div>
            </div>
            <PortfolioChart activePeriod={activePeriod} onPeriodChange={setActivePeriod} />
          </section>

          {/* Active Strategies */}
          <section className={s.leftSection}>
            <div className={s.sectionHeader}>
              <span className={s.sectionTitle}>Active strategies</span>
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
                <div key={row.name} className={s.tableRow}>
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
                </div>
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
              <span className={s.sectionTitle}>Recent activities</span>
            </div>
            <div className={s.activitiesRoot}>
              {ACTIVITIES.map((group) => (
                <div key={group.date} className={s.activityGroup}>
                  <div className={s.activityDateLabel}>{group.date}</div>
                  <div className={s.activityGroupRows}>
                    {group.items.map((item) => (
                      <ActivityRow key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className={s.rightColumn}>

          {/* Verify identity card */}
          <a className={s.verifyCard} href="#">
            <div className={s.verifyCardLogo}>
              <img src="/assets/illustrations/surmount-logo-mark.png" alt="Surmount" />
            </div>
            <h3 className={s.verifyCardTitle}>Verify your identity to continue</h3>
            <div className={s.verifyProgressTrack} role="progressbar" aria-valuenow={33} aria-valuemin={0} aria-valuemax={100} aria-label="1 of 3 complete">
              <div className={[s.verifyProgressSeg, s.verifyProgressSegActive].join(' ')} />
              <div className={s.verifyProgressSeg} />
              <div className={s.verifyProgressSeg} />
            </div>
            <p className={s.verifyCardCaption}>1/3 complete · 2 documents needed</p>
          </a>

          {/* Dividend management */}
          <div>
            <div className={s.sectionHeadingRow}>
              <span className={s.sectionHeading}>Dividend management</span>
              <div className={s.chevronLink}>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 5l5 5-5 5" /></svg>
              </div>
            </div>
            <div style={{ height: '24px' }} />
            <div className={s.dividendCard}>
              <div>
                <div className={s.dividendHeader}>
                  <span className={s.dividendLabel}>Dividend earned</span>
                  <button type="button" className={s.dividendPeriodSelect}>
                    Jan 2026
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6l4 4 4-4" /></svg>
                  </button>
                </div>
                <div className={s.dividendValue}>$256.25</div>
              </div>
              <div className={s.dividendBar}>
                {DIVIDEND_ITEMS.map((d) => (
                  <div key={d.label} className={s.dividendBarSeg} style={{ background: d.color, width: `${d.pct}%` }} />
                ))}
              </div>
              <div className={s.dividendList}>
                {DIVIDEND_ITEMS.map((d) => (
                  <div key={d.label} className={s.dividendListItem}>
                    <div className={s.dividendItemLeft}>
                      <div className={s.dividendDot} style={{ background: d.color }} />
                      <span className={s.dividendTicker}>{d.label}</span>
                    </div>
                    <span className={s.dividendAmount}>{d.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Carousel */}
          <Carousel />

        </div>

      </div>
    </main>
  );
}
