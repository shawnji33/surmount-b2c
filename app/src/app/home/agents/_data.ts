export const sidebarAgents = ['Idle cash sweep', 'Buy NVDA when it drops', 'VIX spike protection'] as const;

export const promptTabs = [
  { key: 'trading', label: 'Trading strategies' },
  { key: 'dip', label: 'Dip buying' },
  { key: 'income', label: 'Income generation' },
  { key: 'cash', label: 'Cash management' },
  { key: 'risk', label: 'Risk management' },
  { key: 'indicators', label: 'Indicators' },
  { key: 'monitoring', label: 'Market monitoring' },
  { key: 'orders', label: 'Order-based' },
  { key: 'multistep', label: 'Multi-step strategies' },
] as const;

export type PromptTabKey = typeof promptTabs[number]['key'];

export const promptData: Record<PromptTabKey, string[]> = {
  trading: [
    'Buy $500 of NVDA every Monday at market open',
    'If AAPL drops 5% in a single day, buy $1,000 worth',
    'Sell half my TSLA position if it hits $300',
    'Buy $100 of BTC every Sunday night',
  ],
  dip: [
    'Buy NVDA when it drops',
    'If QQQ drops 3% in a week, buy $5,000 at the next open',
    'If SPY drops 2% from the open, buy $2,000 and alert me',
    'Buy $500 of ETH whenever it drops 15% from its 30-day high',
  ],
  income: [
    'Sell monthly covered calls on my AAPL at 0.25 delta, target $2,500/month',
    'Sell weekly cash-secured puts on MSFT at 0.20 delta',
    'Reinvest all my SCHD dividends into QQQ',
    'Collect dividends in cash until $500, then buy SPY',
  ],
  cash: [
    'I have too much cash sitting in my brokerage doing nothing. Put it to work.',
    'Sweep any brokerage cash over $5,000 into my High-Yield Cash Account weekly',
    'On the 1st of each month, roll uninvested cash into the highest-yielding account',
    'Alert me before any trade if my cash drops below $1,000',
  ],
  risk: [
    'Protect my portfolio when the market gets scary',
    'If the VIX rises above 25, hedge with SPY puts (up to 1% of portfolio)',
    'If any position exceeds 10% of my portfolio, trim it back to 8%',
    'Sell 50% of equities if SPY falls 7% from its 52-week high',
  ],
  indicators: [
    'Buy $1,500 of AAPL if its RSI drops below 30',
    'Buy $1,000 of QQQ when the 12-day EMA crosses above the 26-day EMA',
    'Buy $2,000 of SPY if it drops below its 200-day SMA',
    'Sell 15% of TSLA if its RSI hits 80',
  ],
  monitoring: [
    'Monitor the VIX and alert me if it crosses 30',
    'Watch AAPL and tell me when it crosses its 200-day moving average',
    'Alert me if any stock in my portfolio hits a new 52-week low',
    'Track NVDA and notify me on any 5%+ intraday move',
  ],
  orders: [
    'Buy MSFT at limit $410; when filled, sell a covered call at 0.25 delta',
    'Place a limit sell at $200 and a stop at $180 — cancel one when the other fills',
    'When my AAPL buy fills, place a limit sell 8% above my fill price',
    'Buy QQQ at $450; if it fills, set a 5% stop-loss',
  ],
  multistep: [
    'If SPY drops 3% in a day and I buy $2,000, place a stop-loss 7% below entry',
    'If my NVDA covered call executes, open a new one at the next expiration',
    'When TSLA gains 20% and I sell half, use the proceeds to buy $1,000 of SPY',
    'If I get assigned on my short put, sell a covered call against the new shares',
  ],
};

export type DemoKey = 'nvda' | 'cash' | 'hedge';

export interface FollowUpQuestion {
  question: string;
  shortLabel: string;
  options: string[];
  customLabel: string;
}

const nvdaFollowUpQuestions: FollowUpQuestion[] = [
  {
    question: 'Got it — a dip-buying agent on NVDA. How big a drop should trigger a buy?',
    shortLabel: 'How big a drop should trigger the buy?',
    options: ['Drops 2% in a day', 'Drops 5% in a day', 'Drop vs. its recent high'],
    customLabel: 'Something else',
  },
  {
    question: 'How much should I buy each time it dips 5%?',
    shortLabel: 'How much capital per trigger?',
    options: ['$500', '$1,000', '$2,000'],
    customLabel: 'Enter an amount',
  },
  {
    question: "Smart to cap how much this deploys so it doesn't overextend on a rough week. Want a weekly limit?",
    shortLabel: 'Want a weekly spending limit?',
    options: ['$4,000 / week', '$6,000 / week', 'No cap'],
    customLabel: 'Custom',
  },
] as const satisfies FollowUpQuestion[];

const cashFollowUpQuestions: FollowUpQuestion[] = [
  {
    question: 'I can sweep idle cash into a higher-yield account automatically. Where should the cash go?',
    shortLabel: 'Where should the cash go?',
    options: ['High-Yield Cash Account', 'Bond Account', 'Treasury holdings', 'Highest-yielding available'],
    customLabel: 'Something else',
  },
  {
    question: "How much cash should stay in your brokerage as a buffer? I'll only sweep what's above that.",
    shortLabel: 'How much cash should stay as a buffer?',
    options: ['$1,000', '$5,000', '$10,000', 'Custom'],
    customLabel: 'Enter an amount',
  },
  {
    question: 'When should I check and sweep?',
    shortLabel: 'When should I check and sweep?',
    options: ['Daily at market close', 'End of every week', '1st of each month', 'Custom'],
    customLabel: 'Custom schedule',
  },
] as const satisfies FollowUpQuestion[];

const hedgeFollowUpQuestions: FollowUpQuestion[] = [
  {
    question: "A common way to do that is watching the VIX — the market's 'fear gauge.' Spikes usually mean a sell-off. Want me to trigger a hedge when the VIX spikes?",
    shortLabel: 'What should trigger the hedge?',
    options: ['Yes, use the VIX', 'Use a portfolio drop instead', 'Explain the VIX first', 'Custom trigger'],
    customLabel: 'Custom trigger',
  },
  {
    question: 'At what VIX level should the hedge kick in?',
    shortLabel: 'VIX trigger level?',
    options: ['Above 20', 'Above 25', 'Above 30'],
    customLabel: 'Custom',
  },
  {
    question: 'How should I hedge, and how much should I spend on protection?',
    shortLabel: 'Hedge instrument + budget?',
    options: ['Buy SPY puts (up to 1% of portfolio)', 'Move cash to safety', 'Buy a VIX-related ETF'],
    customLabel: 'Custom',
  },
] as const satisfies FollowUpQuestion[];

export const mayaPrompt =
  "Whenever NVDA drops 5% in a day, buy $2,000 of it. But don't spend more than $4,000 on this in any given week. Email me each time.";

export const suggestedAnswers = [
  'Use previous close',
  'Check continuously during market hours',
  'Reset weekly cap Monday',
] as const;

export const confirmedAnswers = [
  'Previous close',
  'Continuous market-hours monitoring',
  'Weekly cap resets Monday',
] as const;

export const strategyPromptQuote =
  'When NVDA drops a few percent in a day, I want to automatically buy a fixed dollar amount — but cap how much I deploy per week so I don’t overextend, and tell me every time it fires.';

export type AgentStage = 'welcome' | 'conversation' | 'agent-detail' | 'my-agents' | 'asking';
export type AgentCardStatus = 'active' | 'paused' | 'draft';
export type MyAgentsTab = 'active' | 'paused' | 'drafts';
export type MyAgentsActivityTab = 'activity' | 'history';

export interface AgentCard {
  id: string; name: string; description: string; tag: string;
  status: AgentCardStatus; nextStep: string;
}

export interface MyAgentsActivityItem {
  id: string; status: 'pending' | 'running' | 'success';
  title: string; subtitle?: string; time?: string;
}

export const myAgentCards: AgentCard[] = [
  { id: 'cash', name: 'Idle cash sweep', description: 'Every Friday at market close, sweep brokerage cash above $5,000 into the High-Yield Cash Account.', tag: 'Fund Management', status: 'active', nextStep: 'Check brokerage cash balance' },
  { id: 'nvda', name: 'Buy NVDA when it drops', description: 'Whenever NVDA drops 5% in intraday trading, place a buy order for $2,000. Capped at $4,000 per week.', tag: 'Trading Strategy', status: 'active', nextStep: 'Get NVDA price & prior close' },
  { id: 'vix', name: 'VIX spike protection', description: 'When the VIX rises above 25, buy SPY puts as portfolio protection, spending up to 1% of portfolio value.', tag: 'Risk Management', status: 'active', nextStep: 'Monitor VIX level' },
];

export const myAgentsActivityItems: MyAgentsActivityItem[] = [
  { id: 'ma1', status: 'pending', title: 'Monitor VIX level', time: 'Monitoring continuously' },
  { id: 'ma2', status: 'running', title: 'VIX spike protection', subtitle: 'VIX at 16.4 — no action' },
  { id: 'ma3', status: 'success', title: '$3,200 swept to High-Yield Cash Account', time: '4:00PM' },
  { id: 'ma4', status: 'success', title: 'NVDA $2,000 buy order executed', time: '3:55PM' },
];
export type BuildPhase = 'refining' | 'creating' | 'created';

export interface ActiveAgent {
  id: string;
  name: string;
}

export interface AgentBranch { condition: string; title: string; meta?: string; }
export interface AgentStepData { id: number; title?: string; meta?: string; branches?: AgentBranch[]; }
export interface AgentLegData { title: string; steps: AgentStepData[]; }

const nvdaAgentLegs: AgentLegData[] = [
  {
    title: 'Dip buy',
    steps: [
      { id: 1, title: 'Trigger', meta: 'Check every 15 min, market hours, Mon–Fri' },
      { id: 2, title: 'Get NVDA price & prior close', meta: 'Real-time price feed' },
      {
        id: 3,
        branches: [
          { condition: 'If NVDA ≤ −5% vs prior close', title: 'Continue to cap check' },
          { condition: 'Else', title: 'Stop — threshold not met', meta: 'No action' },
        ],
      },
      { id: 4, title: "Get this week's spend on this agent" },
      {
        id: 5,
        branches: [
          { condition: 'If (spent + $2,000) ≤ $4,000', title: 'Buy $2,000 NVDA', meta: 'Market order' },
          { condition: 'Else', title: 'Skip — weekly cap reached', meta: 'Resets Monday' },
        ],
      },
      { id: 6, title: 'Send confirmation', meta: 'Email' },
    ],
  },
];

const cashAgentLegs: AgentLegData[] = [
  {
    title: 'Weekly sweep',
    steps: [
      { id: 1, title: 'Trigger', meta: 'Every Friday at market close' },
      { id: 2, title: 'Check brokerage cash balance', meta: 'Bank/account balance check' },
      {
        id: 3,
        branches: [
          { condition: 'If cash balance > $5,000', title: 'Continue to excess calculation' },
          { condition: 'Else', title: 'No sweep — balance below $5,000 buffer', meta: 'No action' },
        ],
      },
      { id: 4, title: 'Calculate excess', meta: 'Balance − $5,000' },
      { id: 5, title: 'Sweep excess → High-Yield Cash Account', meta: 'Internal account movement' },
      { id: 6, title: 'Send confirmation', meta: 'Email' },
    ],
  },
];

const hedgeAgentLegs: AgentLegData[] = [
  {
    title: 'Volatility hedge',
    steps: [
      { id: 1, title: 'Trigger', meta: 'Monitor VIX continuously, market hours' },
      { id: 2, title: 'Read VIX level', meta: 'Live data source' },
      {
        id: 3,
        branches: [
          { condition: 'If VIX > 25', title: 'Continue to budget check' },
          { condition: 'Else', title: 'No action — VIX below threshold', meta: 'Keep monitoring' },
        ],
      },
      { id: 4, title: 'Check budget', meta: 'Protection spend ≤ 1% of portfolio value' },
      { id: 5, title: 'Buy SPY puts', meta: 'Targeting the budget cap' },
      { id: 6, title: 'Send confirmation', meta: 'Email + alert' },
    ],
  },
];

export interface PanelFieldDef {
  key: string;
  label: string;
  type: 'text' | 'select';
  options?: string[];
  default: string;
  prefix?: string;
  suffix?: string;
}

export interface PanelDisplayData {
  title?: string;
  meta?: string;
  ifCondition?: string;
  thenLabel?: string;
  thenMeta?: string;
  elseLabel?: string;
  elseMeta?: string;
}

const NVDA_PANEL_STEP_FIELDS: Record<number, PanelFieldDef[]> = {
  1: [
    { key: 'frequency', label: 'Check every', type: 'select', options: ['Every 5 min', 'Every 15 min', 'Every 30 min', 'Hourly'], default: 'Every 15 min' },
    { key: 'window', label: 'Window', type: 'select', options: ['Market hours', 'Extended hours', '24/7'], default: 'Market hours' },
    { key: 'days', label: 'Days', type: 'select', options: ['Mon–Fri', 'Every day', 'Weekdays + Sun'], default: 'Mon–Fri' },
  ],
  2: [
    { key: 'symbol', label: 'Symbol', type: 'text', default: 'NVDA' },
    { key: 'source', label: 'Data source', type: 'select', options: ['Real-time price feed', '15-min delayed', 'Daily close'], default: 'Real-time price feed' },
  ],
  3: [
    { key: 'pct', label: 'Drop threshold', type: 'text', default: '5', suffix: '%' },
    { key: 'ref', label: 'Compared to', type: 'select', options: ['prior close', 'intraday high', 'the open', '52-week high'], default: 'prior close' },
  ],
  4: [
    { key: 'reset', label: 'Week resets', type: 'select', options: ['Monday', 'Sunday', '1st of month'], default: 'Monday' },
  ],
  5: [
    { key: 'amount', label: 'Buy amount', type: 'text', default: '2000', prefix: '$' },
    { key: 'cap', label: 'Weekly cap', type: 'text', default: '4000', prefix: '$' },
    { key: 'order', label: 'Order type', type: 'select', options: ['Market order', 'Limit order', 'Stop order'], default: 'Market order' },
  ],
  6: [
    { key: 'channel', label: 'Notify via', type: 'select', options: ['Email', 'Push notification', 'Email + Push', 'None'], default: 'Email' },
  ],
};

const CASH_PANEL_STEP_FIELDS: Record<number, PanelFieldDef[]> = {
  1: [
    { key: 'day', label: 'Check', type: 'select', options: ['Every Friday', 'Every business day', '1st of each month'], default: 'Every Friday' },
    { key: 'time', label: 'Time', type: 'select', options: ['Market close', 'Market open', '9:00 AM'], default: 'Market close' },
  ],
  3: [
    { key: 'buffer', label: 'Brokerage buffer', type: 'text', default: '5000', prefix: '$' },
  ],
  5: [
    { key: 'destination', label: 'Sweep to', type: 'select', options: ['High-Yield Cash Account', 'Bond Account', 'Treasury holdings', 'Highest-yielding available'], default: 'High-Yield Cash Account' },
  ],
};

const VIX_PANEL_STEP_FIELDS: Record<number, PanelFieldDef[]> = {
  1: [
    { key: 'frequency', label: 'Check frequency', type: 'select', options: ['Continuously', 'Every 5 min', 'Every 15 min'], default: 'Continuously' },
    { key: 'window', label: 'Window', type: 'select', options: ['Market hours', 'Extended hours', '24/7'], default: 'Market hours' },
  ],
  3: [
    { key: 'threshold', label: 'VIX threshold', type: 'text', default: '25', prefix: '>' },
  ],
  4: [
    { key: 'budget_pct', label: 'Max budget (% of portfolio)', type: 'text', default: '1', suffix: '%' },
  ],
  5: [
    { key: 'instrument', label: 'Hedge instrument', type: 'select', options: ['SPY puts', 'VIX calls (UVXY)', 'Move to cash', 'TLT (bonds)'], default: 'SPY puts' },
    { key: 'order', label: 'Order type', type: 'select', options: ['Market order', 'Limit order'], default: 'Market order' },
  ],
  6: [
    { key: 'channel', label: 'Notify via', type: 'select', options: ['Email + alert', 'Email', 'Push notification', 'None'], default: 'Email + alert' },
  ],
};

export type DetailTab = 'workflow' | 'activity' | 'history';

export interface TxDetail {
  account: string; orderType: string; orderStatus: string;
  duration: string; submitted: string; filed: string;
  price: string; submittedAmount: string; filledQty: string;
  commission: string; secFee: string; tip: string; total: string;
}
export interface Transaction {
  id: string; title: string; date: string; amount: string; shares: string;
  pending?: boolean; detail?: TxDetail;
}
export interface TxGroup { label: string; items: Transaction[]; }

const nvdaAgentTransactions: TxGroup[] = [
  {
    label: 'Today',
    items: [
      { id: 't0', title: 'NVDA market buy', date: 'Today, 9:30AM', amount: '-$2,000.00', shares: '11.23 shares', pending: true },
    ],
  },
  {
    label: 'Last 30 days',
    items: [
      {
        id: 't1', title: 'NVDA market buy', date: 'March 19, 2026', amount: '-$2,000.00', shares: '11.89 shares',
        detail: { account: 'Brokerage', orderType: 'Market buy', orderStatus: 'Filled', duration: 'Good for day', submitted: 'Mar 19, 2026 at 9:30AM EST', filed: 'Mar 19, 2026 at 9:30AM EST', price: '$168.21 per share', submittedAmount: '$2,000.00', filledQty: '11.89 shares', commission: '$0.20', secFee: '$6.79', tip: '$0.50', total: '$2,000.00' },
      },
      { id: 't2', title: 'NVDA market buy', date: 'March 9, 2026', amount: '-$2,000.00', shares: '12.40 shares', detail: { account: 'Brokerage', orderType: 'Market buy', orderStatus: 'Filled', duration: 'Good for day', submitted: 'Mar 9, 2026 at 9:30AM EST', filed: 'Mar 9, 2026 at 9:30AM EST', price: '$161.29 per share', submittedAmount: '$2,000.00', filledQty: '12.40 shares', commission: '$0.20', secFee: '$6.79', tip: '$0.50', total: '$2,000.00' } },
      { id: 't3', title: 'NVDA market buy', date: 'March 3, 2026', amount: '-$2,000.00', shares: '11.49 shares', detail: { account: 'Brokerage', orderType: 'Market buy', orderStatus: 'Filled', duration: 'Good for day', submitted: 'Mar 3, 2026 at 9:30AM EST', filed: 'Mar 3, 2026 at 9:30AM EST', price: '$174.07 per share', submittedAmount: '$2,000.00', filledQty: '11.49 shares', commission: '$0.20', secFee: '$6.79', tip: '$0.50', total: '$2,000.00' } },
      { id: 't4', title: 'NVDA market buy', date: 'Feb 8, 2026', amount: '-$2,000.00', shares: '11.21 shares', detail: { account: 'Brokerage', orderType: 'Market buy', orderStatus: 'Filled', duration: 'Good for day', submitted: 'Feb 8, 2026 at 9:30AM EST', filed: 'Feb 8, 2026 at 9:30AM EST', price: '$178.41 per share', submittedAmount: '$2,000.00', filledQty: '11.21 shares', commission: '$0.20', secFee: '$6.79', tip: '$0.50', total: '$2,000.00' } },
    ],
  },
];

const cashAgentTransactions: TxGroup[] = [
  {
    label: 'Today',
    items: [
      {
        id: 'cash-t1',
        title: 'Confirmed — Internal transfer',
        date: 'Today, 4:00PM',
        amount: '$3,200.00',
        shares: 'to High-Yield Cash Account',
        detail: {
          account: 'Brokerage → High-Yield Cash Account',
          orderType: 'Internal transfer',
          orderStatus: 'Confirmed',
          duration: 'Immediate',
          submitted: 'Mar 27, 2026 at 4:00PM EST',
          filed: 'Mar 27, 2026 at 4:00PM EST',
          price: 'N/A',
          submittedAmount: '$3,200.00',
          filledQty: 'N/A',
          commission: '$0.00',
          secFee: '$0.00',
          tip: '$0.00',
          total: '$3,200.00',
        },
      },
    ],
  },
];

export type ActivityStatus = 'success' | 'warning';
export interface ActivityItem { id: string; status: ActivityStatus; title: string; time: string; tooltip?: string; }
export interface ActivityRun { label: string; items: ActivityItem[]; }

const nvdaAgentActivity: ActivityRun[] = [
  {
    label: 'Run completed',
    items: [
      { id: 'a1', status: 'success', title: 'NVDA $2,000 buy order executed', time: 'Mar 27, 3:55PM' },
      { id: 'a2', status: 'success', title: 'NVDA 5% dip triggered', time: 'Mar 27, 3:55PM' },
      { id: 'a3', status: 'success', title: 'Getting quotes for: NVDA', time: 'Mar 27, 3:55PM' },
      { id: 'a4', status: 'success', title: 'Workflow triggered', time: 'Mar 27, 3:55PM' },
    ],
  },
  {
    label: 'Run completed',
    items: [
      { id: 'b1', status: 'success', title: 'Notification sent', time: 'Mar 27, 3:50PM' },
      { id: 'b2', status: 'success', title: 'NVDA $2,000 buy order executed', time: 'Mar 27, 3:48PM' },
      { id: 'b3', status: 'success', title: 'Brokerage funds updated', time: 'Mar 27, 3:48PM' },
      { id: 'b4', status: 'success', title: 'Notification sent', time: 'Mar 27, 3:45PM' },
      { id: 'b5', status: 'warning', title: 'Insufficient brokerage cash funds — notification sent', time: 'Mar 27, 3:35PM', tooltip: 'Did not execute buy order due to insufficient brokerage cash' },
      { id: 'b6', status: 'warning', title: 'NVDA $2,000 buy order', time: 'Mar 27, 3:35PM' },
      { id: 'b7', status: 'success', title: 'NVDA 5% dip triggered', time: 'Mar 27, 3:35PM' },
      { id: 'b8', status: 'success', title: 'Getting quotes for: NVDA', time: 'Mar 27, 3:35PM' },
      { id: 'b9', status: 'success', title: 'Workflow triggered', time: 'Mar 27, 3:35PM' },
    ],
  },
];

const cashAgentActivity: ActivityRun[] = [
  {
    label: 'Run happening now',
    items: [
      { id: 'cash-a1', status: 'success', title: 'Sweep $3,200 to HYCA complete', time: '4:00PM' },
      { id: 'cash-a2', status: 'success', title: 'Sweep $3,200 to HYCA', time: '4:00PM' },
      { id: 'cash-a3', status: 'success', title: 'Excess $3,200', time: '4:00PM' },
      { id: 'cash-a4', status: 'success', title: 'Balance $8,200', time: '4:00PM' },
      { id: 'cash-a5', status: 'success', title: 'Check brokerage cash balance', time: '4:00PM' },
    ],
  },
  {
    label: 'Run completed',
    items: [
      { id: 'cash-b1', status: 'warning', title: 'No sweep — balance below $5,000 buffer', time: 'Mar 20, 4:00PM', tooltip: 'No action taken because brokerage cash stayed under the liquidity threshold.' },
      { id: 'cash-b2', status: 'success', title: 'Check brokerage cash balance', time: 'Mar 20, 4:00PM' },
    ],
  },
];

const hedgeAgentActivity: ActivityRun[] = [
  {
    label: 'Run completed — hedge fired',
    items: [
      { id: 'vix-a1', status: 'success', title: 'SPY puts executed · $4,200', time: '2:31PM' },
      { id: 'vix-a2', status: 'success', title: 'Budget check passed — $4,200 available', time: '2:31PM' },
      { id: 'vix-a3', status: 'success', title: 'VIX crossed 25 (now 27.1) — hedge triggered', time: '2:30PM' },
      { id: 'vix-a4', status: 'success', title: 'Read VIX level', time: '2:30PM' },
    ],
  },
  {
    label: 'Monitoring (no action)',
    items: [
      { id: 'vix-b1', status: 'success', title: 'Monitoring VIX · currently 16.4 · no action', time: '10:00AM' },
      { id: 'vix-b2', status: 'success', title: 'Monitoring VIX · currently 18.2 · no action', time: '9:30AM' },
    ],
  },
];

const hedgeAgentTransactions: TxGroup[] = [
  {
    label: 'Today',
    items: [
      {
        id: 'vix-t1',
        title: 'SPY puts — protection buy',
        date: 'Today, 2:31PM',
        amount: '-$4,200.00',
        shares: '6 contracts',
        detail: {
          account: 'Brokerage',
          orderType: 'Market buy',
          orderStatus: 'Filled',
          duration: 'Good for day',
          submitted: 'Mar 27, 2026 at 2:31PM EST',
          filed: 'Mar 27, 2026 at 2:31PM EST',
          price: '$700.00 per contract',
          submittedAmount: '$4,200.00',
          filledQty: '6 contracts',
          commission: '$6.00',
          secFee: '$0.00',
          tip: '$0.00',
          total: '$4,200.00',
        },
      },
    ],
  },
];

export interface DemoConfig {
  key: DemoKey;
  headerTitle: string;
  userBubbleText: string;
  questions: FollowUpQuestion[];
  previewTitle: string;
  previewDesc: string;
  panelName: string;
  tag: string;
  summary: string;
  schedule: string;
  nextCheck: string;
  monitoring: string;
  createdAgentName: string;
  createdIdPrefix: string;
  legs: AgentLegData[];
  panelFields: Record<number, PanelFieldDef[]>;
  editableSteps: number[];
  activity: ActivityRun[];
  transactions: TxGroup[];
  txViewLabel: string;
  confirmationText: (answers: Record<number, string>) => string;
}

export const demoConfigs: Record<DemoKey, DemoConfig> = {
  nvda: {
    key: 'nvda',
    headerTitle: 'Buy NVDA when it drops',
    userBubbleText: 'Buy NVDA when it drops',
    questions: nvdaFollowUpQuestions,
    previewTitle: 'NVDA buy the dip',
    previewDesc: 'Buys $2,000 of NVDA whenever it drops 5%+ from prior close, capped at $4,000 / week. Emails on every fill.',
    panelName: 'NVDA dip-buying agent',
    tag: 'Trading Strategy',
    summary: 'When NVDA drops ≥ 5% intraday, buy $2,000 and cap at $4,000 per week. Email on every fill.',
    schedule: 'Monitors continuously during market hours (Mon–Fri, 9:30am–4pm EST)',
    nextCheck: 'Today at 3:55 PM EST',
    monitoring: 'Mon–Fri · 9:30a–4:00p EST',
    createdAgentName: 'NVDA dip-buying agent',
    createdIdPrefix: 'nvda-dip',
    legs: nvdaAgentLegs,
    panelFields: NVDA_PANEL_STEP_FIELDS,
    editableSteps: [1, 3, 5],
    activity: nvdaAgentActivity,
    transactions: nvdaAgentTransactions,
    txViewLabel: 'View NVDA',
    confirmationText: (answers) => {
      const drop = answers[0] ?? 'drops 5% in a day';
      const amount = answers[1] ?? '$2,000';
      const cap = answers[2];
      const capPart = cap && cap !== 'No cap' ? `, capped at ${cap}` : '';
      return `Got it — ${drop.toLowerCase()}, buying ${amount} each time${capPart}. I'll email you each time it fires.`;
    },
  },
  cash: {
    key: 'cash',
    headerTitle: 'Idle cash sweep',
    userBubbleText: 'I have too much cash sitting in my brokerage doing nothing. Put it to work.',
    questions: cashFollowUpQuestions,
    previewTitle: 'Idle cash sweep',
    previewDesc: 'Sweeps brokerage cash above $5,000 into the High-Yield Cash Account at the end of every week. Emails on every transfer.',
    panelName: 'Idle cash sweep',
    tag: 'Fund Management',
    summary: 'Every Friday at market close, sweep brokerage cash above $5,000 into the High-Yield Cash Account. Email on every transfer.',
    schedule: 'Checks every Friday at market close and sweeps only cash above the $5,000 buffer.',
    nextCheck: 'Today at 4:00 PM EST',
    monitoring: 'Fridays · Market close',
    createdAgentName: 'Idle cash sweep',
    createdIdPrefix: 'idle-cash-sweep',
    legs: cashAgentLegs,
    panelFields: CASH_PANEL_STEP_FIELDS,
    editableSteps: [1, 3, 5],
    activity: cashAgentActivity,
    transactions: cashAgentTransactions,
    txViewLabel: 'View transfer',
    confirmationText: (answers) => {
      const destination = answers[0] ?? 'High-Yield Cash Account';
      const buffer = answers[1] ?? '$5,000';
      const cadence = answers[2] ?? 'End of every week';
      const cadencePhrase = cadence === 'End of every week' ? 'at the end of every week' : cadence.toLowerCase();
      return `Got it — I'll keep ${buffer} in brokerage cash and sweep anything above that to the ${destination} ${cadencePhrase}. I'll email you each time it runs.`;
    },
  },
  hedge: {
    key: 'hedge',
    headerTitle: 'Protect my portfolio',
    userBubbleText: 'Protect my portfolio when the market gets scary',
    questions: hedgeFollowUpQuestions,
    previewTitle: 'VIX spike protection',
    previewDesc: 'When the VIX rises above 25, buy SPY puts as portfolio protection, spending up to 1% of portfolio value.',
    panelName: 'VIX spike protection',
    tag: 'Risk Management',
    summary: 'When the VIX rises above 25, buy SPY puts as portfolio protection, spending up to 1% of portfolio value.',
    schedule: 'Monitors VIX continuously during market hours (Mon–Fri, 9:30am–4pm EST)',
    nextCheck: 'Continuously monitoring',
    monitoring: 'Mon–Fri · Market hours',
    createdAgentName: 'VIX spike protection',
    createdIdPrefix: 'vix-hedge',
    legs: hedgeAgentLegs,
    panelFields: VIX_PANEL_STEP_FIELDS,
    editableSteps: [1, 3, 4, 5, 6],
    activity: hedgeAgentActivity,
    transactions: hedgeAgentTransactions,
    txViewLabel: 'View SPY puts',
    confirmationText: (answers) => {
      const level = answers[1] ?? 'above 25';
      const hedge = answers[2] ?? 'Buy SPY puts (up to 1% of portfolio)';
      const lvl = level.replace('Above ', '');
      return `Got it — when the VIX spikes above ${lvl}, I'll ${hedge.toLowerCase().startsWith('buy') ? hedge.toLowerCase() : 'move ' + hedge.toLowerCase()}. I'll email and alert you each time it fires.`;
    },
  },
};
