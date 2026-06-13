import { type WealthsimpleChartPoint } from '@/components/charts/WealthsimpleNetWorthChart';
import { type SelectableAccount } from '@/components/AccountSelectorCard';
import type { TransactionGroup } from '@/components/transactions/TransactionList';

export const STRATEGIES = [
  { name: 'Quantum Computing Leaders', cover: '/assets/strategy-covers/Quantum Computing Leaders.png', value: '$351,242.54', returnPct: '+5.24%', returnAbs: '+$2,452.26', brokers: ['/assets/brokers/robinhood.png', '/assets/brokers/ibkr.png'], overflow: '+11' },
  { name: 'Artificial Intelligence Innovators', cover: '/assets/strategy-covers/AI Innovators.png', value: '$482,731.16', returnPct: '+7.15%', returnAbs: '+$3,472.89', brokers: ['/assets/brokers/coinbase.png', '/assets/brokers/schwab.png'], overflow: '+10' },
  { name: 'Biotechnology Ventures', cover: '/assets/strategy-covers/Biotech Breakthroughs.png', value: '$265,478.90', returnPct: '+4.89%', returnAbs: '+$1,642.78', brokers: ['/assets/brokers/webull.png'], overflow: '+5' },
];

export const PORTFOLIO_BREAKDOWN = [
  { ticker: 'NVDA', name: 'NVIDIA', logo: '/assets/logos/NVDA.webp', weight: '20.00%', price: '$52.80', value: '$16,900.00', shares: '320 shares', strategies: 'Strategy A, Strategy B' },
  { ticker: 'AAPL', name: 'Apple Inc.', logo: '/assets/logos/AAPL.webp', weight: '18.00%', price: '$34.52', value: '$10,500.00', shares: '72 shares', strategies: 'Strategy A' },
  { ticker: 'AMZN', name: 'Amazon.com', logo: '/assets/logos/AMZN.webp', weight: '15.00%', price: '$78.93', value: '$9,600.00', shares: '3 shares', strategies: 'Strategy A, Strategy B' },
  { ticker: 'MA', name: 'Mastercard', logo: '/assets/logos/MA.webp', weight: '14.00%', price: '$120.37', value: '$14,000.00', shares: '5 shares', strategies: 'Strategy A, Strategy B, Strategy C' },
  { ticker: 'MSFT', name: 'Microsoft Corp.', logo: '/assets/logos/MSFT.webp', weight: '12.00%', price: '$45.66', value: '$8,800.00', shares: '30 shares', strategies: 'Strategy B, Strategy C' },
];

export const ACTIVITY_GROUPS: TransactionGroup[] = [
  {
    date: 'May 5, 2026',
    items: [
      { id: 'a1', kind: 'sell', name: 'GOOGL', pillLabel: 'Sell', meta: '10.00 shares · Coinbase', amount: '-$2,800.50', amountTone: 'neutral', iconSrc: '/assets/logos/GOOG.webp', details: [{ label: 'Status', value: 'Complete', tone: 'success' }, { label: 'Symbol', value: 'GOOGL' }, { label: 'Shares', value: '10.00' }, { label: 'Price', value: '$280.05' }, { label: 'Account', value: 'Coinbase' }, { label: 'Date', value: 'May 5, 2026' }] },
      { id: 'a2', kind: 'buy', name: 'GOOGL', pillLabel: 'Buy', meta: '10.00 shares · Coinbase', amount: '-$2,800.50', amountTone: 'neutral', iconSrc: '/assets/logos/GOOG.webp', details: [{ label: 'Status', value: 'Complete', tone: 'success' }, { label: 'Symbol', value: 'GOOGL' }, { label: 'Shares', value: '10.00' }, { label: 'Price', value: '$280.05' }, { label: 'Account', value: 'Coinbase' }, { label: 'Date', value: 'May 5, 2026' }] },
      { id: 'a3', kind: 'deposit', name: 'Deposit', meta: 'From Coinbase', amount: '+$2,800.50', amountTone: 'positive', details: [{ label: 'Status', value: 'Pending', tone: 'warning' }, { label: 'From', value: 'Coinbase' }, { label: 'To', value: 'Surmount Cash' }, { label: 'Date', value: 'May 5, 2026' }, { label: 'Method', value: 'Standard transfer' }] },
    ],
  },
  {
    date: 'May 4, 2026',
    items: [
      { id: 'a4', kind: 'buy', name: 'NVDA', pillLabel: 'Buy', meta: '100.00 shares · Schwab', amount: '-$5,280.00', amountTone: 'neutral', iconSrc: '/assets/logos/NVDA.webp', details: [{ label: 'Status', value: 'Complete', tone: 'success' }, { label: 'Symbol', value: 'NVDA' }, { label: 'Shares', value: '100.00' }, { label: 'Price', value: '$52.80' }, { label: 'Account', value: 'Schwab' }, { label: 'Date', value: 'May 4, 2026' }] },
    ],
  },
  {
    date: 'May 3, 2026',
    items: [
      { id: 'a5', kind: 'buy', name: 'AAPL', pillLabel: 'Buy', meta: '72.00 shares · Schwab', amount: '-$2,485.44', amountTone: 'neutral', iconSrc: '/assets/logos/AAPL.webp', details: [{ label: 'Status', value: 'Complete', tone: 'success' }, { label: 'Symbol', value: 'AAPL' }, { label: 'Shares', value: '72.00' }, { label: 'Price', value: '$34.52' }, { label: 'Account', value: 'Schwab' }, { label: 'Date', value: 'May 3, 2026' }] },
    ],
  },
];

export const WATCHLIST = [
  {
    id: 'w1',
    name: 'Quantum Computing Leaders',
    cover: '/assets/strategy-result/covers/quantum-computing-leaders.png',
    category: 'Technology',
    value: '$18,432.54',
    changePct: '+4.68%',
    price: '$138.44',
    totalValue: 18432.54,
    todayReturn: 4.68,
    priceValue: 138.44,
    href: '/home/strategy/quantum-computing-leaders',
  },
  {
    id: 'w2',
    name: 'AI Infrastructure Leaders',
    cover: '/assets/strategy-result/covers/ai-innovators.png',
    category: 'Technology',
    value: '$22,108.92',
    changePct: '+2.14%',
    price: '$92.18',
    totalValue: 22108.92,
    todayReturn: 2.14,
    priceValue: 92.18,
    href: '/home/strategy/artificial-intelligence-innovators',
  },
  {
    id: 'w3',
    name: 'Biotechnology Ventures',
    cover: '/assets/strategy-covers/Biotech Breakthroughs.png',
    category: 'Healthcare',
    value: '$9,750.30',
    changePct: '-0.82%',
    price: '$47.62',
    totalValue: 9750.3,
    todayReturn: -0.82,
    priceValue: 47.62,
    href: '/home/strategy/biotechnology-ventures',
  },
];

export type WatchlistSortKey = 'todayReturn' | 'totalValue' | 'price';

export const WATCHLIST_SORT_OPTIONS: Array<{ key: WatchlistSortKey; label: string }> = [
  { key: 'todayReturn', label: "Today's return" },
  { key: 'totalValue', label: 'Total value' },
  { key: 'price', label: 'Price' },
];

export const DIVIDEND_ITEMS = [
  { label: 'XYZ', amount: '$89.50 (18%)', color: '#9B8AFB', pct: 31 },
  { label: 'PQR', amount: '$95.70 (15%)', color: '#A2D3A5', pct: 23 },
  { label: 'GHI', amount: '$95.75 (22%)', color: '#8EBDEB', pct: 17 },
  { label: 'JKL', amount: '$110.25 (25%)', color: '#A4A7AE', pct: 14 },
  { label: 'Other', amount: '$82.40 (20%)', color: 'var(--color-warning-400, #f19246)', pct: 15 },
];

export type Account = { id: string; name: string; logo: string; value: string };

export type SwitcherAccount = {
  id: string;
  name: string;
  logo: string;
  value: number;
  change: number;
  data: WealthsimpleChartPoint[];
  color?: string;
  initial?: string;
};

export const CONNECTED_ACCOUNTS: Account[] = [
  { id: 'surmount', name: 'Surmount',            logo: '/assets/illustrations/surmount-logo-mark-blue.png', value: '$85,420.54'   },
  { id: 'ibkr',     name: 'Interactive Brokers', logo: '/assets/brokers/ibkr.png',     value: '$142,350.30'  },
  { id: 'coinbase', name: 'Coinbase',             logo: '/assets/brokers/coinbase.png', value: '$45,180.90'   },
  { id: 'kraken',   name: 'Kraken',               logo: '/assets/brokers/kraken.png',   value: '$28,650.00'   },
  { id: 'schwab',   name: 'Schwab',               logo: '/assets/brokers/schwab.png',   value: '$31,200.50'   },
];

export const PORTFOLIO_DATES = [
  '2026-04-21', '2026-04-24', '2026-04-25', '2026-04-28', '2026-04-29',
  '2026-04-30', '2026-05-01', '2026-05-02', '2026-05-05', '2026-05-06',
  '2026-05-07', '2026-05-08', '2026-05-09', '2026-05-12', '2026-05-13',
  '2026-05-14', '2026-05-15', '2026-05-16', '2026-05-19', '2026-05-20',
  '2026-05-21',
];

export function makePortfolioSeries(start: number, end: number, wobble: number, phase: number): WealthsimpleChartPoint[] {
  return PORTFOLIO_DATES.map((time, index) => {
    const progress = index / (PORTFOLIO_DATES.length - 1);
    const curve = Math.sin(index * 0.92 + phase) * wobble;
    return { time, value: Number((start + (end - start) * progress + curve).toFixed(2)) };
  });
}

export const ACCOUNT_SWITCHER_ACCOUNTS: SwitcherAccount[] = [
  {
    id: 'surmount',
    name: 'Surmount Investing',
    logo: '/assets/brokers/surmount.png',
    value: 85420.54,
    change: 1204.88,
    data: makePortfolioSeries(79240, 85420.54, 420, 0.3),
  },
  {
    id: 'ibkr',
    name: 'Interactive Brokers',
    logo: '/assets/brokers/ibkr.png',
    value: 142350.3,
    change: 2921.4,
    data: makePortfolioSeries(134880, 142350.3, 760, 1.1),
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    logo: '/assets/brokers/coinbase.png',
    value: 45180.9,
    change: 682.18,
    data: makePortfolioSeries(42880, 45180.9, 360, 1.7),
  },
  {
    id: 'kraken',
    name: 'Kraken',
    logo: '/assets/brokers/kraken.png',
    value: 28650,
    change: -214.8,
    data: makePortfolioSeries(29320, 28650, 280, 2.4),
  },
  {
    id: 'schwab',
    name: 'Schwab',
    logo: '/assets/brokers/schwab.png',
    value: 31200.5,
    change: 512.66,
    data: makePortfolioSeries(29210, 31200.5, 210, 0.8),
  },
];

export const CONNECTED_BANK = {
  name: 'Chase Total Checking',
  institution: 'JPMorgan Chase',
  type: 'Checking',
  last4: '4823',
  logo: '/assets/brokers/chase.png',
};

export type TransferMode = 'deposit' | 'withdrawal';
export type TransferStep = 'amount' | 'confirm' | 'success';

export const SURMOUNT_ACCOUNT = {
  name: 'Surmount Investing',
  available: 10432.18,
};

export const HYCA_ACCOUNT = {
  name: 'High Yield Cash',
  available: 351242.54,
};

export const HYCA_SELECTABLE: SelectableAccount = {
  id: 'hyca',
  name: 'High Yield Cash',
  meta: `Available $${HYCA_ACCOUNT.available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  logoSrc: '/assets/brokers/surmount.png',
};

export const SURMOUNT_SELECTABLE: SelectableAccount = {
  id: 'surmount-investing',
  name: SURMOUNT_ACCOUNT.name,
  meta: `Available $${SURMOUNT_ACCOUNT.available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  logoSrc: '/assets/illustrations/surmount-logo-mark-blue.png',
};

export const BANK_SELECTABLE: SelectableAccount = {
  id: 'chase',
  name: CONNECTED_BANK.name,
  meta: `${CONNECTED_BANK.type} · ${CONNECTED_BANK.last4}`,
  logoSrc: '/assets/illustrations/bank-chase.png',
};

export const SURMOUNT_GROUPS = [
  { label: 'Investing account', accounts: [SURMOUNT_SELECTABLE] },
  { label: 'Saving account', accounts: [HYCA_SELECTABLE] },
];
