import {
  Timer,
  Lightning,
  Receipt,
  ChartLine,
  Pulse,
  Bank,
  GitBranch,
  Calculator,
  ShieldCheck,
  CurrencyDollar,
  ArrowsLeftRight,
  Stack,
  Bell,
  Notebook,
} from '@phosphor-icons/react';
import type { NodeTypeDef, NodeTypeId, ParamValue } from './types';

/** V2 options node sits behind this flag (§0 / §3.4) */
export const FEATURE_OPTIONS = false;

/* §3 — the node catalog. Palette, renderer, editor and validation all read this. */
export const CATALOG: NodeTypeDef[] = [
  /* ── 3.1 TRIGGER ── */
  {
    id: 'trigger.schedule',
    category: 'trigger',
    label: 'Schedule',
    description: 'Run the agent on a time cadence.',
    icon: Timer,
    v1: true,
    paramSchema: [
      { key: 'frequency', label: 'Frequency', type: 'select', section: 'Timing', helper: 'How often the agent runs.', default: 'Daily', options: ['Every 5 min', 'Every 15 min', 'Every 30 min', 'Hourly', 'Daily', 'Weekly', 'Monthly'] },
      { key: 'time', label: 'Time', type: 'time', section: 'Timing', helper: 'Local market time the run fires.', default: '09:30 EST' },
      { key: 'window', label: 'Market window', type: 'select', section: 'Window', helper: 'Crypto can use 24/7.', default: 'Market hours', options: ['Market hours', 'Extended hours', '24/7'] },
      { key: 'days', label: 'Days', type: 'select', section: 'Window', default: 'Mon–Fri', options: ['Mon–Fri', 'Every day', 'Custom'] },
    ],
    outputs: [{ ref: 'firedAt', label: 'Fired at', type: 'timestamp' }],
  },
  {
    id: 'trigger.marketEvent',
    category: 'trigger',
    label: 'Market Event',
    description: 'Run when a market value crosses a threshold.',
    icon: Lightning,
    v1: true,
    paramSchema: [
      { key: 'watch', label: 'Watch', type: 'select', section: 'What to watch', helper: 'Pairs with a Data node below.', default: 'Price', options: ['Price', 'Indicator'] },
      { key: 'checkEvery', label: 'Check every', type: 'select', section: 'What to watch', helper: 'How often to evaluate during the window.', default: 'Every 15 min', options: ['Every 1 min', 'Every 5 min', 'Every 15 min', 'Every 30 min'] },
      { key: 'recurrence', label: 'Fires', type: 'select', section: 'Recurrence', helper: "“Once” stops the agent after the first trigger.", default: 'whenever (every time)', options: ['whenever (every time)', 'once (first only)'] },
    ],
    outputs: [{ ref: 'firedAt', label: 'Fired at', type: 'timestamp' }],
  },
  {
    id: 'trigger.orderFill',
    category: 'trigger',
    label: 'Order Fill',
    description: 'Run when one of your orders executes.',
    icon: Receipt,
    v1: false, // stretch
    paramSchema: [
      { key: 'watchOrder', label: 'Watch', type: 'select', section: 'Watch order', helper: 'Fires when a matching order executes.', default: "This agent's orders", options: ['Any order', "This agent's orders", 'Specific order'] },
    ],
    outputs: [
      { ref: 'fill.symbol', label: 'Fill symbol', type: 'string' },
      { ref: 'fill.price', label: 'Fill price', type: 'number' },
      { ref: 'fill.qty', label: 'Fill qty', type: 'number' },
    ],
  },

  /* ── 3.2 DATA ── */
  {
    id: 'data.priceFeed',
    category: 'data',
    label: 'Price Feed',
    description: 'Read the real-time price for an asset.',
    icon: ChartLine,
    v1: true,
    paramSchema: [
      { key: 'asset', label: 'Asset', type: 'asset-search', section: 'Asset', helper: 'Type a symbol — e.g. NVDA, SPY, BTC.', required: true, placeholder: 'Search ticker…' },
      { key: 'assetClass', label: 'Asset class', type: 'select', section: 'Asset', default: 'Stock/ETF', options: ['Stock/ETF', 'Crypto'] },
      { key: 'field', label: 'Price field', type: 'select', section: 'Field', helper: 'Which price value this node reads.', default: 'Last price', options: ['Last price', 'Prior close', 'Intraday high', 'The open', '52-week high'] },
    ],
    outputs: [
      { ref: 'price', label: 'Price', type: 'number' },
      { ref: 'priorClose', label: 'Prior close', type: 'number' },
    ],
  },
  {
    id: 'data.indicator',
    category: 'data',
    label: 'Indicator',
    description: 'Read a technical indicator value.',
    icon: Pulse,
    v1: true,
    paramSchema: [
      { key: 'indicator', label: 'Indicator', type: 'select', section: 'Indicator', helper: 'Bollinger & MACD are coming soon.', default: 'VIX', options: ['VIX', 'RSI', 'SMA', 'EMA', 'Bollinger', 'MACD'], comingSoon: ['Bollinger', 'MACD'] },
      { key: 'asset', label: 'Asset', type: 'asset-search', section: 'Indicator', helper: 'VIX is market-wide; others need a symbol.', placeholder: 'Not needed for VIX' },
      { key: 'period', label: 'Period (days)', type: 'number', section: 'Indicator', helper: 'Lookback window, e.g. 50 or 200.', default: 14 },
    ],
    outputs: [{ ref: 'value', label: 'Value', type: 'number' }],
  },
  {
    id: 'data.account',
    category: 'data',
    label: 'Account',
    description: 'Read a balance or agent-spend figure.',
    icon: Bank,
    v1: true,
    paramSchema: [
      { key: 'source', label: 'Read', type: 'select', section: 'Source', helper: 'The balance or figure this node fetches.', default: 'Brokerage cash', options: ['Brokerage cash', 'Buying power', "This agent's weekly spend", 'Bank balance', 'Portfolio value'] },
      { key: 'account', label: 'Account', type: 'account-picker', section: 'Source', helper: 'Re-auth here if a connection expired.', default: 'primary' },
    ],
    outputs: [{ ref: 'amount', label: 'Amount', type: 'number' }],
  },

  /* ── 3.3 LOGIC ── */
  {
    id: 'logic.condition',
    category: 'logic',
    label: 'Condition',
    description: 'Branch on a comparison (If / Then / Else).',
    icon: GitBranch,
    v1: true,
    branching: true,
    paramSchema: [
      { key: 'leftRef', label: 'Value', type: 'select', section: 'Comparison', helper: 'Pick a value from an earlier node.', required: true, options: [] },
      { key: 'operator', label: 'Operator', type: 'select', section: 'Comparison', default: 'drops below', options: ['drops below', 'rises above', 'exceeds', 'crosses', 'within X% of', 'between'] },
      { key: 'rightValue', label: 'Threshold', type: 'text', section: 'Comparison', required: true },
      { key: 'compareTo', label: 'Compared to', type: 'select', section: 'Comparison', default: 'prior close', options: ['prior close', 'the open', '52-week high', 'a fixed value'] },
    ],
    outputs: [],
  },
  {
    id: 'logic.calculate',
    category: 'logic',
    label: 'Calculate',
    description: 'Do math on values to produce a new one.',
    icon: Calculator,
    v1: true,
    paramSchema: [
      { key: 'expression', label: 'Expression', type: 'text', section: 'Expression', helper: 'e.g. {node3.amount} − 5000. Live result shown below.', required: true, placeholder: 'e.g. {node3.amount} - 5000' },
      { key: 'outputName', label: 'Result name', type: 'text', section: 'Expression', helper: 'Name other nodes use to reference this.', default: 'result' },
    ],
    outputs: [{ ref: 'result', label: 'Result', type: 'number' }],
  },
  {
    id: 'logic.boundary',
    category: 'logic',
    label: 'Boundary',
    description: 'A safety rail checked before an action.',
    icon: ShieldCheck,
    v1: true,
    branching: true,
    paramSchema: [
      { key: 'kind', label: 'Kind', type: 'select', section: 'Rail type', helper: 'The kind of safety limit.', default: 'Capital cap', options: ['Capital cap', 'Risk stop', 'Frequency limit'] },
      { key: 'capAmount', label: 'Max amount', type: 'number', section: 'Limit', helper: 'Most this agent can deploy per period.', affix: '$', showWhen: { key: 'kind', equals: 'Capital cap' } },
      { key: 'capPeriod', label: 'Per', type: 'select', section: 'Limit', default: 'per week', options: ['per trade', 'per day', 'per week', 'per month', 'total'], showWhen: { key: 'kind', equals: 'Capital cap' } },
      { key: 'stopPercent', label: 'Stop loss', type: 'number', section: 'Limit', helper: 'Exit if down this % from entry.', affix: '%', default: 5, showWhen: { key: 'kind', equals: 'Risk stop' } },
      { key: 'maxExecutions', label: 'Max executions', type: 'number', section: 'Limit', helper: 'Cap on actions per period.', default: 2, showWhen: { key: 'kind', equals: 'Frequency limit' } },
      { key: 'freqPeriod', label: 'Per', type: 'select', section: 'Limit', default: 'per day', options: ['per day', 'per week'], showWhen: { key: 'kind', equals: 'Frequency limit' } },
    ],
    outputs: [],
  },

  /* ── 3.4 ACTION ── */
  {
    id: 'action.trade',
    category: 'action',
    label: 'Trade',
    description: 'Buy, sell, or trim a position.',
    icon: CurrencyDollar,
    v1: true,
    paramSchema: [
      { key: 'side', label: 'Side', type: 'select', section: 'Order', helper: 'Trim reduces a position by a %.', default: 'Buy', options: ['Buy', 'Sell', 'Trim'] },
      { key: 'asset', label: 'Asset', type: 'asset-search', section: 'Order', required: true, placeholder: 'Search ticker…' },
      { key: 'sizing', label: 'Sizing', type: 'select', section: 'Size', default: 'Dollar amount', options: ['Dollar amount', 'Share count', '% of portfolio'] },
      { key: 'amount', label: 'Amount', type: 'number', section: 'Size', affix: '$', required: true },
      { key: 'orderType', label: 'Order type', type: 'select', section: 'Execution', default: 'Market', options: ['Market', 'Limit', 'Stop'] },
      { key: 'limitPrice', label: 'Limit price', type: 'number', section: 'Execution', helper: 'Order only fills at this price or better.', affix: '$', showWhen: { key: 'orderType', equals: 'Limit' } },
      { key: 'account', label: 'Account', type: 'account-picker', section: 'Execution', default: 'primary' },
    ],
    outputs: [
      { ref: 'executed', label: 'Executed', type: 'boolean' },
      { ref: 'fillPrice', label: 'Fill price', type: 'number' },
    ],
  },
  {
    id: 'action.moveCash',
    category: 'action',
    label: 'Move Cash',
    description: 'Transfer or sweep cash between accounts.',
    icon: ArrowsLeftRight,
    v1: true,
    paramSchema: [
      { key: 'mode', label: 'Mode', type: 'select', section: 'Movement', default: 'Sweep excess', options: ['Sweep excess', 'Fixed transfer', 'Deposit from bank'] },
      { key: 'amountRef', label: 'Amount', type: 'text', section: 'Movement', helper: 'Sweep uses a calculated excess; transfer uses a fixed $.', placeholder: 'a calc output or fixed $' },
      { key: 'from', label: 'From', type: 'account-picker', section: 'Accounts', default: 'Brokerage' },
      { key: 'to', label: 'To', type: 'account-picker', section: 'Accounts', default: 'HYCA' },
    ],
    outputs: [{ ref: 'moved', label: 'Moved', type: 'boolean' }],
  },
  {
    id: 'action.options',
    category: 'action',
    label: 'Options',
    description: 'Multi-leg / rolling / hedging options.',
    icon: Stack,
    v1: false, // V2 — FEATURE_OPTIONS
    paramSchema: [
      { key: 'strategy', label: 'Strategy', type: 'select', section: 'Strategy', default: 'Buy put', options: ['Buy put', 'Buy call', 'Covered call', 'Cash-secured put', 'Roll'] },
      { key: 'asset', label: 'Underlying', type: 'asset-search', section: 'Strategy' },
      { key: 'delta', label: 'Target delta', type: 'number', section: 'Strategy' },
      { key: 'expiry', label: 'Expiry', type: 'select', section: 'Strategy', default: '45 DTE', options: ['30 DTE', '45 DTE', 'next monthly'] },
      { key: 'budget', label: 'Budget', type: 'number', section: 'Strategy', affix: '$' },
    ],
    outputs: [{ ref: 'executed', label: 'Executed', type: 'boolean' }],
  },

  /* ── 3.5 NOTIFY ── */
  {
    id: 'notify.alert',
    category: 'notify',
    label: 'Alert',
    description: 'Send the user a message.',
    icon: Bell,
    v1: true,
    paramSchema: [
      { key: 'channel', label: 'Channel', type: 'select', section: 'Notification', default: 'Email', options: ['Email', 'Push', 'Email + Push'] },
      { key: 'on', label: 'Notify on', type: 'select', section: 'Notification', helper: '“Every evaluation” can be noisy.', default: 'Every fill', options: ['Every fill', 'Only errors', 'Every evaluation'] },
    ],
    outputs: [],
  },
  {
    id: 'notify.log',
    category: 'notify',
    label: 'Log',
    description: 'Write to the activity feed.',
    icon: Notebook,
    v1: true,
    paramSchema: [
      { key: 'level', label: 'Level', type: 'select', section: 'Log', default: 'Info', options: ['Action', 'Skip', 'Error', 'Info'] },
    ],
    outputs: [],
  },
];

export const CATALOG_BY_ID: Record<NodeTypeId, NodeTypeDef> = Object.fromEntries(
  CATALOG.map((n) => [n.id, n]),
) as Record<NodeTypeId, NodeTypeDef>;

/** nodes available to place (hides V2 unless its flag is on) */
export const AVAILABLE_NODES = CATALOG.filter((n) => n.v1 || (n.id === 'action.options' && FEATURE_OPTIONS));

/** default params for a freshly-placed node (from each field's `default`) */
export function defaultParams(def: NodeTypeDef): Record<string, ParamValue> {
  const p: Record<string, ParamValue> = {};
  for (const f of def.paramSchema) if (f.default !== undefined) p[f.key] = f.default;
  return p;
}

/** field-level validation (§6) — returns an error message or null */
export function fieldError(field: NodeTypeDef['paramSchema'][number], value: ParamValue): string | null {
  const v = value ?? field.default ?? null;
  if (field.required && (v === null || v === '')) return 'This field is required.';
  if (field.type === 'number' && v !== null && v !== '') {
    const n = Number(v);
    if (Number.isNaN(n)) return 'Enter a number.';
    if (field.affix === '%') {
      if (n < 0 || n > 100) return 'Enter a percent between 0 and 100.';
    } else if (n <= 0) {
      return 'Enter a number greater than 0.';
    }
  }
  return null;
}
