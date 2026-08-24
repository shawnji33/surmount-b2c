import type { ActivityItem, ConnectedAccount } from '@/types/activity';

export const MOCK_CONNECTED_ACCOUNTS: readonly ConnectedAccount[] = [
  {
    id: 'surmount-investing',
    name: 'Surmount Brokerage',
    brokerLogo: '/assets/illustrations/surmount-logo-mark-blue.png',
    supportsPending: true,
  },
  {
    id: 'surmount-hyca',
    name: 'Surmount HYCA',
    brokerLogo: '/assets/illustrations/surmount-logo-mark-blue.png',
    supportsPending: true,
  },
  {
    id: 'schwab-brokerage',
    name: 'Schwab Brokerage',
    brokerLogo: '/assets/brokers/schwab.png',
    supportsPending: true,
  },
  {
    id: 'ibkr-margin',
    name: 'Interactive Brokers Margin',
    brokerLogo: '/assets/brokers/ibkr.png',
    supportsPending: true,
  },
  {
    id: 'coinbase-advanced',
    name: 'Coinbase Advanced',
    brokerLogo: '/assets/brokers/coinbase.png',
    supportsPending: true,
  },
] as const;

const [surmount, , schwab, ibkr, coinbase] = MOCK_CONNECTED_ACCOUNTS;

export const MOCK_ACTIVITY_ITEMS: readonly ActivityItem[] = [
  // ── 3 demo pending orders ─────────────────────────────────────────────────
  {
    id: 'pend-1',
    type: 'deposit',
    amount: 2500,
    account: surmount,
    status: 'processing',
    submittedAt: '2026-05-30T10:30:00-04:00',
    estimatedCompletion: '2026-06-03T17:00:00-04:00',
    canCancel: true,
    canModify: false,
    statusTimeline: [
      { status: 'submitted', timestamp: '2026-05-30T10:30:00-04:00', note: 'ACH deposit initiated from Chase Total Checking.' },
      { status: 'processing', timestamp: '2026-05-30T10:30:45-04:00', note: 'Funds are being verified.' },
    ],
  },
  {
    id: 'pend-withdrawal',
    type: 'withdrawal',
    amount: 1200,
    account: surmount,
    status: 'processing',
    submittedAt: '2026-05-30T10:15:00-04:00',
    estimatedCompletion: '2026-06-03T17:00:00-04:00',
    canCancel: true,
    canModify: false,
    statusTimeline: [
      { status: 'submitted', timestamp: '2026-05-30T10:15:00-04:00', note: 'ACH withdrawal initiated to Chase Total Checking.' },
      { status: 'processing', timestamp: '2026-05-30T10:15:30-04:00', note: 'Funds are being sent to your bank.' },
    ],
  },
  {
    id: 'pend-3',
    type: 'strategy_buy',
    amount: 1000,
    account: surmount,
    strategyName: 'Quantum Computing Leaders',
    status: 'submitted',
    submittedAt: '2026-05-30T08:45:00-04:00',
    canCancel: true,
    canModify: false,
    statusTimeline: [
      { status: 'submitted', timestamp: '2026-05-30T08:45:00-04:00', note: 'Strategy buy order submitted.' },
    ],
  },
  // ── Completed history ─────────────────────────────────────────────────────
  {
    id: 'act-1007',
    type: 'market_buy',
    symbol: 'MSFT',
    quantity: 4,
    amount: 1685.2,
    account: schwab,
    status: 'completed',
    submittedAt: '2026-05-16T10:08:00-04:00',
    estimatedCompletion: '2026-05-16T10:08:15-04:00',
    canCancel: false,
    canModify: false,
    statusTimeline: [
      { status: 'submitted', timestamp: '2026-05-16T10:08:00-04:00' },
      { status: 'processing', timestamp: '2026-05-16T10:08:02-04:00' },
      { status: 'completed', timestamp: '2026-05-16T10:08:15-04:00', note: 'Filled at an average price of $421.30.' },
    ],
  },
  {
    id: 'act-1008',
    type: 'market_sell',
    symbol: 'COIN',
    quantity: 3,
    amount: 728.1,
    account: coinbase,
    status: 'completed',
    submittedAt: '2026-05-15T14:33:00-04:00',
    estimatedCompletion: '2026-05-15T14:33:07-04:00',
    canCancel: false,
    canModify: false,
    statusTimeline: [
      { status: 'submitted', timestamp: '2026-05-15T14:33:00-04:00' },
      { status: 'completed', timestamp: '2026-05-15T14:33:07-04:00', note: 'Market sell completed.' },
    ],
  },
  {
    id: 'act-1009',
    type: 'deposit',
    amount: 5000,
    account: surmount,
    status: 'completed',
    submittedAt: '2026-05-14T11:10:00-04:00',
    estimatedCompletion: '2026-05-16T09:00:00-04:00',
    canCancel: false,
    canModify: false,
    statusTimeline: [
      { status: 'submitted', timestamp: '2026-05-14T11:10:00-04:00' },
      { status: 'processing', timestamp: '2026-05-14T11:10:40-04:00' },
      { status: 'completed', timestamp: '2026-05-16T09:00:00-04:00', note: 'Cash settled in the account.' },
    ],
  },
  {
    id: 'act-1010',
    type: 'withdrawal',
    amount: 850,
    account: surmount,
    status: 'completed',
    submittedAt: '2026-05-13T13:05:00-04:00',
    canCancel: false,
    canModify: false,
    statusTimeline: [
      { status: 'submitted', timestamp: '2026-05-13T13:05:00-04:00' },
      { status: 'completed', timestamp: '2026-05-15T09:00:00-04:00', note: 'Funds received.' },
    ],
  },
  {
    id: 'act-1011',
    type: 'limit_buy',
    symbol: 'META',
    quantity: 2,
    amount: 936.4,
    account: ibkr,
    status: 'completed',
    submittedAt: '2026-05-12T15:45:00-04:00',
    estimatedCompletion: '2026-05-12T15:46:22-04:00',
    canCancel: false,
    canModify: false,
    agentInitiated: true,
    statusTimeline: [
      { status: 'submitted', timestamp: '2026-05-12T15:45:00-04:00', note: 'Agent opened a rebalance order.' },
      { status: 'processing', timestamp: '2026-05-12T15:45:08-04:00' },
      { status: 'completed', timestamp: '2026-05-12T15:46:22-04:00', note: 'Filled at $468.20.' },
    ],
  },
  {
    id: 'act-1012',
    type: 'deposit',
    amount: 3000,
    account: surmount,
    status: 'cancelled',
    submittedAt: '2026-05-11T09:00:00-04:00',
    canCancel: false,
    canModify: false,
    statusTimeline: [
      { status: 'submitted', timestamp: '2026-05-11T09:00:00-04:00' },
      { status: 'cancelled', timestamp: '2026-05-11T09:05:00-04:00', note: 'Cancelled by user.' },
    ],
  },
] as const;

export function getMockActivityItems(): ActivityItem[] {
  return [...MOCK_ACTIVITY_ITEMS].sort(
    (a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt),
  );
}
