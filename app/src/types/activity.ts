export type ActivityItemType =
  | 'limit_buy'
  | 'limit_sell'
  | 'market_buy'
  | 'market_sell'
  | 'stop_loss'
  | 'stop_limit'
  | 'deposit'
  | 'withdrawal'
  | 'recurring_buy'
  | 'transfer'
  | 'strategy_buy';

export type ActivityStatus =
  | 'submitted'
  | 'processing'
  | 'partial_fill'
  | 'awaiting_user'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type ConnectedAccount = {
  id: string;
  name: string;
  brokerLogo: string;
  supportsPending: boolean;
};

export type ActivityTimelineEntry = {
  status: ActivityStatus;
  timestamp: string;
  note?: string;
};

export type ActivityItem = {
  id: string;
  type: ActivityItemType;
  symbol?: string;
  quantity?: number;
  amount: number;
  account: ConnectedAccount;
  toAccount?: ConnectedAccount;
  strategyName?: string;
  status: ActivityStatus;
  submittedAt: string;
  estimatedCompletion?: string;
  canCancel: boolean;
  canModify: boolean;
  agentInitiated?: boolean;
  statusTimeline: ActivityTimelineEntry[];
};

export const PENDING_ACTIVITY_STATUSES: readonly ActivityStatus[] = [
  'submitted',
  'processing',
  'partial_fill',
  'awaiting_user',
];

export const TERMINAL_ACTIVITY_STATUSES: readonly ActivityStatus[] = [
  'completed',
  'cancelled',
  'failed',
];

export function isPendingActivityStatus(status: ActivityStatus): boolean {
  return PENDING_ACTIVITY_STATUSES.includes(status);
}
