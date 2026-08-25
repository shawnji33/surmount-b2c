'use client';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ArrowsCounterClockwise, CaretDown, ClockCountdown, MagnifyingGlass } from '@phosphor-icons/react';
import {
  TransactionList,
  type TransactionGroup,
  type TransactionItem,
  type TransactionKind,
  type TransactionStatusTone,
} from '@/components/transactions/TransactionList';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getMockActivityItems } from '@/lib/mock-activity';
import type { ActivityItem, ActivityItemType, ActivityStatus, ConnectedAccount } from '@/types/activity';
import { isPendingActivityStatus } from '@/types/activity';
import s from './page.module.css';

type ActivityGroup = {
  label: string;
  items: ActivityItem[];
};

type QuickFilter = 'pending' | 'scheduled' | 'orders' | 'deposit' | 'withdrawal' | null;
type TimeframeFilter = 'all' | 'last_week' | 'last_30' | 'last_60' | 'last_90';
type StatusFilter =
  | 'all'
  | 'action_required'
  | 'cancelled'
  | 'cancelling'
  | 'completed'
  | 'declined'
  | 'expired'
  | 'failed'
  | 'in_progress'
  | 'pending'
  | 'refunded'
  | 'rejected';

const TYPE_LABELS: Record<ActivityItemType, string> = {
  limit_buy: 'Buy',
  limit_sell: 'Sell',
  market_buy: 'Buy',
  market_sell: 'Sell',
  stop_loss: 'Stop',
  stop_limit: 'Stop',
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  recurring_buy: 'Buy',
  transfer: 'Transfer',
  strategy_buy: 'Buy',
};

const STATUS_LABELS: Record<ActivityStatus, string> = {
  submitted: 'Pending',
  processing: 'Pending',
  partial_fill: 'Pending',
  awaiting_user: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Cancelled',
};

const QUICK_FILTERS: Array<{ label: string; value: Exclude<QuickFilter, null> }> = [
  { label: 'Orders', value: 'orders' },
  { label: 'Deposits', value: 'deposit' },
  { label: 'Withdrawals', value: 'withdrawal' },
];

const TIMEFRAME_FILTERS: Array<{ label: string; value: TimeframeFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Last week', value: 'last_week' },
  { label: 'Last 30 days', value: 'last_30' },
  { label: 'Last 60 days', value: 'last_60' },
  { label: 'Last 90 days', value: 'last_90' },
];

const STATUS_FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Action required', value: 'action_required' },
  { label: 'Canceled', value: 'cancelled' },
  { label: 'Canceling', value: 'cancelling' },
  { label: 'Completed', value: 'completed' },
  { label: 'Declined', value: 'declined' },
  { label: 'Expired', value: 'expired' },
  { label: 'Failed', value: 'failed' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Pending', value: 'pending' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Rejected', value: 'rejected' },
];

const SYMBOL_LOGOS: Partial<Record<string, string>> = {
  AAPL: '/assets/logos/AAPL.webp',
  AMD: '/assets/logos/AMD.webp',
  COIN: '/assets/brokers/coinbase.png',
  META: '/assets/logos/META.webp',
  MSFT: '/assets/logos/MSFT.webp',
  NVDA: '/assets/logos/NVDA.webp',
  TSLA: '/assets/logos/TSLA.webp',
  VOO: '/assets/logos/V.webp',
};

function formatCurrency(amount: number, itemType: ActivityItemType): string {
  const sign = itemType === 'deposit' ? '+' : '-';
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);

  return `${sign}${formatted}`;
}

function formatDateLabel(isoTimestamp: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(isoTimestamp));
}

function formatDetailDate(isoTimestamp: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
  }).format(new Date(isoTimestamp));
}

function titleForItem(item: ActivityItem): string {
  if (item.type === 'deposit') return 'Deposit';
  if (item.type === 'withdrawal') return 'Withdrawal';
  if (item.type === 'recurring_buy') return item.symbol ? `${item.symbol} recurring` : 'Recurring buy';
  if (item.symbol) return item.symbol;
  return TYPE_LABELS[item.type];
}

function metaForItem(item: ActivityItem): string {
  if (item.type === 'deposit') return `To Surmount Investing · From ${item.account.name}`;
  if (item.type === 'withdrawal') return 'From Surmount Investing · To linked bank';
  if (item.quantity) return `${item.quantity.toFixed(item.quantity % 1 === 0 ? 2 : 2)} shares · Surmount Investing`;
  return 'Surmount Investing';
}

function groupItems(items: ActivityItem[]): ActivityGroup[] {
  return items.reduce<ActivityGroup[]>((groups, item) => {
    const label = formatDateLabel(item.submittedAt);
    const existingGroup = groups.find((group) => group.label === label);

    if (existingGroup) {
      existingGroup.items.push(item);
      return groups;
    }

    groups.push({ label, items: [item] });
    return groups;
  }, []);
}

function isOrderType(type: ActivityItemType): boolean {
  return type !== 'deposit' && type !== 'withdrawal';
}

function kindForItem(item: ActivityItem): TransactionKind {
  if (item.type === 'deposit') return 'deposit';
  if (item.type === 'withdrawal') return 'transfer-out';
  if (item.type.includes('sell')) return 'sell';
  if (item.type === 'stop_loss' || item.type === 'stop_limit') return 'stop';
  return 'buy';
}

function statusToneForItem(status: ActivityStatus): TransactionStatusTone {
  if (status === 'completed') return 'success';
  if (status === 'failed' || status === 'cancelled') return 'danger';
  if (status === 'submitted' || status === 'processing' || status === 'partial_fill' || status === 'awaiting_user') return 'warning';
  return 'neutral';
}

function transactionForItem(item: ActivityItem): TransactionItem {
  return {
    id: item.id,
    kind: kindForItem(item),
    name: titleForItem(item),
    meta: metaForItem(item),
    amount: formatCurrency(item.amount, item.type),
    amountTone: item.type === 'deposit' ? 'positive' : 'neutral',
    iconSrc: item.symbol ? SYMBOL_LOGOS[item.symbol] : undefined,
    pillLabel: item.type !== 'deposit' && item.type !== 'withdrawal' ? TYPE_LABELS[item.type] : undefined,
    canCancel: item.canCancel,
    submittedAt: item.submittedAt,
    summaryBadge: item.type === 'recurring_buy'
      ? { label: 'Scheduled', tone: 'neutral' as const }
      : isPendingActivityStatus(item.status)
        ? { label: STATUS_LABELS[item.status], tone: statusToneForItem(item.status) }
        : undefined,
    details: [
      {
        label: 'Status',
        value: item.type === 'recurring_buy' ? 'Scheduled' : STATUS_LABELS[item.status],
        tone: item.type === 'recurring_buy' ? 'neutral' as const : statusToneForItem(item.status),
      },
      { label: 'Account', value: item.account.name },
      { label: 'Submitted', value: formatDetailDate(item.submittedAt) },
      ...(item.estimatedCompletion
        ? [{ label: 'Estimated completion', value: formatDetailDate(item.estimatedCompletion) }]
        : []),
      ...(item.agentInitiated ? [{ label: 'Source', value: 'Investing Agent' }] : []),
    ],
  };
}

function transactionGroupsForActivity(groups: ActivityGroup[]): TransactionGroup[] {
  return groups.map((group) => ({
    date: group.label,
    items: group.items.map(transactionForItem),
  }));
}

function matchesStatusFilter(item: ActivityItem, statusFilter: StatusFilter): boolean {
  if (statusFilter === 'all') return true;
  if (statusFilter === 'pending') return item.status === 'submitted';
  if (statusFilter === 'in_progress') return item.status === 'processing' || item.status === 'partial_fill';
  if (statusFilter === 'action_required') return item.status === 'awaiting_user';
  if (statusFilter === 'cancelled') return item.status === 'cancelled';
  if (statusFilter === 'completed') return item.status === 'completed';
  if (statusFilter === 'failed') return item.status === 'failed';
  return false;
}

function matchesTimeframe(item: ActivityItem, timeframe: TimeframeFilter): boolean {
  if (timeframe === 'all') return true;

  const daysByTimeframe: Record<Exclude<TimeframeFilter, 'all'>, number> = {
    last_week: 7,
    last_30: 30,
    last_60: 60,
    last_90: 90,
  };

  const days = daysByTimeframe[timeframe];
  const submittedAt = Date.parse(item.submittedAt);
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;

  return submittedAt >= threshold;
}

function matchesSearch(item: ActivityItem, query: string): boolean {
  if (!query.trim()) return true;

  const normalizedQuery = query.trim().toLowerCase();
  const searchable = [
    titleForItem(item),
    metaForItem(item),
    item.symbol,
    TYPE_LABELS[item.type],
    STATUS_LABELS[item.status],
    item.account.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchable.includes(normalizedQuery);
}

function uniqueAccounts(items: ActivityItem[]): ConnectedAccount[] {
  return items.reduce<ConnectedAccount[]>((accounts, item) => {
    if (accounts.some((account) => account.id === item.account.id)) return accounts;
    accounts.push(item.account);
    return accounts;
  }, []);
}

function SummaryCards({
  pendingCount,
  scheduledCount,
  quickFilter,
  onQuickFilterChange,
}: {
  pendingCount: number;
  scheduledCount: number;
  quickFilter: QuickFilter;
  onQuickFilterChange: (value: QuickFilter) => void;
}) {
  if (pendingCount === 0 && scheduledCount === 0) return null;

  const pendingLabel = pendingCount === 1 ? '1 pending order' : `${pendingCount} pending orders`;
  const scheduledLabel = scheduledCount === 1 ? '1 transaction' : `${scheduledCount} transactions`;
  const toggleFilter = (value: Exclude<QuickFilter, null>) => {
    onQuickFilterChange(quickFilter === value ? null : value);
  };

  return (
    <div className={s.summaryRow} aria-label="Activity shortcut filters">
      {pendingCount > 0 && (
        <button
          type="button"
          className={[s.pendingCard, quickFilter === 'pending' ? s.pendingCardActive : ''].filter(Boolean).join(' ')}
          aria-pressed={quickFilter === 'pending'}
          onClick={() => toggleFilter('pending')}
        >
          <span className={[s.pendingIconCircle, s.pendingIconWarning].join(' ')} aria-hidden="true">
            <ClockCountdown size={16} weight="regular" color="#c05221" />
          </span>
          <span className={s.pendingCardInfo}>
            <span className={s.pendingCardTitle}>Pending orders</span>
            <span className={s.pendingCardMeta}>{pendingLabel}</span>
          </span>
        </button>
      )}
      {scheduledCount > 0 && (
        <button
          type="button"
          className={[s.pendingCard, quickFilter === 'scheduled' ? s.pendingCardActive : ''].filter(Boolean).join(' ')}
          aria-pressed={quickFilter === 'scheduled'}
          onClick={() => toggleFilter('scheduled')}
        >
          <span className={[s.pendingIconCircle, s.pendingIconBrand].join(' ')} aria-hidden="true">
            <ArrowsCounterClockwise size={16} weight="regular" color="#3757be" />
          </span>
          <span className={s.pendingCardInfo}>
            <span className={s.pendingCardTitle}>Scheduled transfers</span>
            <span className={s.pendingCardMeta}>{scheduledLabel}</span>
          </span>
        </button>
      )}
    </div>
  );
}

type FilterPanelProps = {
  accounts: ConnectedAccount[];
  quickFilter: QuickFilter;
  selectedAccountId: string;
  searchQuery: string;
  statusFilter: StatusFilter;
  timeframeFilter: TimeframeFilter;
  onClear: () => void;
  onQuickFilterChange: (value: QuickFilter) => void;
  onSearchQueryChange: (value: string) => void;
  onAccountChange: (value: string) => void;
  onTimeframeChange: (value: TimeframeFilter) => void;
  onStatusChange: (value: StatusFilter) => void;
};

function FilterPanel({
  accounts,
  quickFilter,
  selectedAccountId,
  searchQuery,
  statusFilter,
  timeframeFilter,
  onClear,
  onQuickFilterChange,
  onSearchQueryChange,
  onAccountChange,
  onTimeframeChange,
  onStatusChange,
}: FilterPanelProps) {
  return (
    <aside className={s.filterPanel} aria-label="Activity filters">
      <div className={s.filterHeader}>
        <h2>Filters</h2>
        <button type="button" className={s.clearButton} onClick={onClear}>
          Clear
        </button>
      </div>

      <div className={s.filterDivider} />

      <section className={s.filterSection}>
        <div className={s.filterSectionHeader}>
          <h3>Quick filters</h3>
          <CaretDown className={[s.filterChevron, s.filterChevronOpen].join(' ')} weight="bold" aria-hidden="true" />
        </div>
        <div className={s.chipGrid}>
          {QUICK_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={[s.filterChip, quickFilter === filter.value ? s.filterChipActive : ''].filter(Boolean).join(' ')}
              onClick={() => onQuickFilterChange(quickFilter === filter.value ? null : filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <label className={s.filterSearch}>
          <MagnifyingGlass className={s.filterSearchIcon} aria-hidden="true" />
          <input
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search filters..."
          />
        </label>
      </section>

      <details className={s.filterDisclosure}>
        <summary className={s.filterSectionHeader}>
          <h3>Account</h3>
          <CaretDown className={s.filterChevron} weight="bold" aria-hidden="true" />
        </summary>
        <div className={s.optionStack}>
          <button
            type="button"
            className={[s.optionButton, selectedAccountId === 'all' ? s.optionButtonActive : ''].filter(Boolean).join(' ')}
            onClick={() => onAccountChange('all')}
          >
            All accounts
          </button>
          {accounts.map((account) => (
            <button
              key={account.id}
              type="button"
              className={[s.optionButton, selectedAccountId === account.id ? s.optionButtonActive : ''].filter(Boolean).join(' ')}
              onClick={() => onAccountChange(account.id)}
            >
              {account.name}
            </button>
          ))}
        </div>
      </details>

      <details className={s.filterDisclosure}>
        <summary className={s.filterSectionHeader}>
          <h3>Timeframe</h3>
          <CaretDown className={s.filterChevron} weight="bold" aria-hidden="true" />
        </summary>
        <div className={s.optionStack}>
          {TIMEFRAME_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={[s.optionButton, timeframeFilter === filter.value ? s.optionButtonActive : ''].filter(Boolean).join(' ')}
              onClick={() => onTimeframeChange(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </details>

      <details className={s.filterDisclosure}>
        <summary className={s.filterSectionHeader}>
          <h3>Status</h3>
          <CaretDown className={s.filterChevron} weight="bold" aria-hidden="true" />
        </summary>
        <div className={s.optionStack}>
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={[s.optionButton, statusFilter === filter.value ? s.optionButtonActive : ''].filter(Boolean).join(' ')}
              onClick={() => onStatusChange(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </details>
    </aside>
  );
}

function ActivityPageContent() {
  const searchParams = useSearchParams();
  const urlFilter = searchParams.get('filter');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(() => {
    return null; // initialised below in useEffect once searchParams is ready
  });
  const [selectedAccountId, setSelectedAccountId] = useState('all');
  const [timeframeFilter, setTimeframeFilter] = useState<TimeframeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (urlFilter === 'pending' || urlFilter === 'scheduled' || urlFilter === 'orders' || urlFilter === 'deposit' || urlFilter === 'withdrawal') {
      setQuickFilter(urlFilter);
    } else {
      setQuickFilter(null);
    }
  }, [urlFilter]);

  const items = useMemo(() => getMockActivityItems(), []);
  const pendingCount = items.filter((item) => isPendingActivityStatus(item.status) && item.type !== 'recurring_buy').length;
  const scheduledCount = items.filter((item) => item.type === 'recurring_buy').length;
  const accounts = useMemo(() => uniqueAccounts(items), [items]);
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesQuick =
        quickFilter === null
        || (quickFilter === 'pending' && isPendingActivityStatus(item.status))
        || (quickFilter === 'scheduled' && item.type === 'recurring_buy')
        || (quickFilter === 'orders' && isOrderType(item.type))
        || (quickFilter === 'deposit' && item.type === 'deposit')
        || (quickFilter === 'withdrawal' && item.type === 'withdrawal');

      return (
        matchesQuick
        && (selectedAccountId === 'all' || item.account.id === selectedAccountId)
        && matchesTimeframe(item, timeframeFilter)
        && matchesStatusFilter(item, statusFilter)
        && matchesSearch(item, searchQuery)
      );
    });
  }, [items, quickFilter, searchQuery, selectedAccountId, statusFilter, timeframeFilter]);
  const groups = useMemo(() => groupItems(filteredItems), [filteredItems]);
  const transactionGroups = useMemo(() => transactionGroupsForActivity(groups), [groups]);

  const clearFilters = () => {
    setQuickFilter(null);
    setSelectedAccountId('all');
    setTimeframeFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  return (
    <main className={s.main}>
      <DashboardHeader title="Activity" />

      <div className={s.activityBody}>
        <section className={s.contentGrid}>
          <section className={s.transactionsPanel} aria-label="Recent activities">
            <SummaryCards
              pendingCount={pendingCount}
              scheduledCount={scheduledCount}
              quickFilter={quickFilter}
              onQuickFilterChange={setQuickFilter}
            />

            {transactionGroups.length > 0 ? (
              <TransactionList groups={transactionGroups} title={null} />
            ) : (
              <div className={s.emptyState}>
                <h3>No activity matches these filters</h3>
                <p>Try clearing filters or widening the timeframe.</p>
              </div>
            )}
          </section>

          <FilterPanel
            accounts={accounts}
            quickFilter={quickFilter}
            selectedAccountId={selectedAccountId}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            timeframeFilter={timeframeFilter}
            onClear={clearFilters}
            onQuickFilterChange={setQuickFilter}
            onSearchQueryChange={setSearchQuery}
            onAccountChange={setSelectedAccountId}
            onTimeframeChange={setTimeframeFilter}
            onStatusChange={setStatusFilter}
          />
        </section>
      </div>
    </main>
  );
}

export default function ActivityPage() {
  return (
    <Suspense fallback={null}>
      <ActivityPageContent />
    </Suspense>
  );
}
