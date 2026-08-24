import { type TransactionGroup } from '@/components/transactions/TransactionList';
import { type AccountGroup, type SelectableAccount } from '@/components/AccountSelectorCard';

export type TransferStep = 'amount' | 'confirm' | 'success';

export const CONNECTED_BANK = {
  name: 'Chase Total Checking',
  institution: 'JPMorgan Chase',
  type: 'Checking',
  last4: '4823',
};

export const HYCA_ACCOUNT = {
  name: 'High Yield Cash',
  available: 351242.54,
};

export const SURMOUNT_ACCOUNT = {
  name: 'Surmount Investing',
  available: 10432.18,
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

export const BROKERAGE_SELECTABLE: SelectableAccount = {
  id: 'surmount-brokerage',
  name: 'Surmount brokerage account',
  meta: '$52,225.51',
  logoSrc: '/assets/illustrations/surmount-logo-mark-blue.png',
};

export const TRANSFER_ACCOUNT_GROUPS: AccountGroup[] = [
  { label: 'Saving account', accounts: [HYCA_SELECTABLE] },
  { label: 'Linked bank account', accounts: [BANK_SELECTABLE], headerAction: { label: 'Update' } },
  { label: 'Investing account', accounts: [BROKERAGE_SELECTABLE] },
];

export const TX_DATA: TransactionGroup[] = [
  {
    date: 'May 28, 2026',
    items: [
      {
        id: 'tx-p1',
        kind: 'deposit',
        name: 'Deposit',
        meta: 'From Chase · Total Checking',
        amount: '+$2,500.00',
        amountTone: 'positive',
        canCancel: true,
        submittedAt: '2026-05-28T09:12:00-04:00',
        summaryBadge: { label: 'Pending', tone: 'warning' },
        details: [
          { label: 'Status', value: 'Pending', tone: 'warning' },
          { label: 'From', value: 'Chase · Total Checking' },
          { label: 'To', value: 'Surmount Cash' },
          { label: 'Submitted', value: 'May 28, 2026 · 9:12 AM' },
          { label: 'Est. completion', value: 'Jun 1, 2026' },
          { label: 'Method', value: 'ACH transfer' },
        ],
      },
      {
        id: 'tx-p2',
        kind: 'transfer-out',
        name: 'Withdrawal',
        meta: 'To Chase · Total Checking',
        amount: '−$800.00',
        canCancel: true,
        submittedAt: '2026-05-28T08:30:00-04:00',
        summaryBadge: { label: 'Pending', tone: 'warning' },
        details: [
          { label: 'Status', value: 'Pending', tone: 'warning' },
          { label: 'From', value: 'Surmount Cash' },
          { label: 'To', value: 'Chase · Total Checking' },
          { label: 'Submitted', value: 'May 28, 2026 · 8:30 AM' },
          { label: 'Est. completion', value: 'Jun 1, 2026' },
          { label: 'Method', value: 'ACH transfer' },
        ],
      },
      {
        id: 'tx-r1',
        kind: 'deposit',
        name: 'Recurring deposit',
        meta: 'From Chase · Total Checking',
        amount: '+$500.00',
        amountTone: 'positive',
        canCancel: true,
        summaryBadge: { label: 'Scheduled', tone: 'neutral' },
        details: [
          { label: 'Status', value: 'Scheduled', tone: 'neutral' },
          { label: 'From', value: 'Chase · Total Checking' },
          { label: 'To', value: 'Surmount Cash' },
          { label: 'Frequency', value: 'Weekly' },
          { label: 'Next date', value: 'Jun 4, 2026' },
        ],
      },
      {
        id: 'tx-r2',
        kind: 'deposit',
        name: 'Recurring deposit',
        meta: 'From Chase · Total Checking',
        amount: '+$1,000.00',
        amountTone: 'positive',
        canCancel: true,
        summaryBadge: { label: 'Scheduled', tone: 'neutral' },
        details: [
          { label: 'Status', value: 'Scheduled', tone: 'neutral' },
          { label: 'From', value: 'Chase · Total Checking' },
          { label: 'To', value: 'Surmount Cash' },
          { label: 'Frequency', value: 'Monthly' },
          { label: 'Next date', value: 'Jun 1, 2026' },
        ],
      },
    ],
  },
  {
    date: 'April 26, 2026',
    items: [
      {
        id: 'tx-2',
        kind: 'deposit',
        name: 'Deposit',
        meta: 'From Chase · 360 Checking',
        amount: '+$1,200.00',
        amountTone: 'positive',
        details: [
          { label: 'From', value: 'Chase · 360 Checking' },
          { label: 'To', value: 'Surmount Cash' },
          { label: 'Status', value: 'Completed', tone: 'success' },
          { label: 'Date', value: 'April 26, 2026' },
          { label: 'Method', value: 'Direct deposit' },
        ],
      },
    ],
  },
  {
    date: 'April 1, 2026',
    items: [
      {
        id: 'tx-3',
        kind: 'interest',
        name: 'Interest',
        meta: 'April monthly accrual',
        amount: '+$24.35',
        amountTone: 'positive',
        details: [
          { label: 'From', value: 'Surmount Cash' },
          { label: 'To', value: 'Surmount Cash' },
          { label: 'Status', value: 'Completed', tone: 'success' },
          { label: 'Date', value: 'April 1, 2026' },
          { label: 'APY', value: '4.56%' },
        ],
      },
    ],
  },
  {
    date: 'March 1, 2026',
    items: [
      {
        id: 'tx-6',
        kind: 'interest',
        name: 'Interest',
        meta: 'March monthly accrual',
        amount: '+$22.18',
        amountTone: 'positive',
        details: [
          { label: 'From', value: 'Surmount Cash' },
          { label: 'To', value: 'Surmount Cash' },
          { label: 'Status', value: 'Completed', tone: 'success' },
          { label: 'Date', value: 'March 1, 2026' },
          { label: 'APY', value: '4.54%' },
        ],
      },
    ],
  },
];

export const FREQ_OPTIONS = ['Monthly', 'Bi-weekly', 'Weekly'] as const;
export type FreqOption = typeof FREQ_OPTIONS[number];
export const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const MONTH_LONG  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const WEEKDAYS    = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export type SavingFilter = 'pending' | 'recurring' | null;
