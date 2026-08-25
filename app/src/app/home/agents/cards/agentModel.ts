import type { Agent, NodeInstance, ParamValue } from '../nodes/types';

/* ── Option C reads the SAME agent model as A/B. This file seeds the demo
   agent and defines the friendly card-row projection over its nodes. ── */

export const DEMO_AGENT: Agent = {
  id: 'nvda-dip',
  name: 'NVDA dip-buying agent',
  description: 'Buys NVDA on intraday dips, capped weekly.',
  skillTag: 'Equities',
  status: 'draft',
  entryNodeId: 'trg',
  brokerageConnectionId: 'primary',
  createdAt: '2026-06-13',
  schedule: { frequency: 'Every 15 min', time: '09:30 EST' },
  nodes: [
    {
      id: 'trg',
      type: 'trigger.schedule',
      category: 'trigger',
      params: { frequency: 'Every 15 min', time: '09:30 EST', window: 'Market hours', days: 'Mon–Fri' },
      next: 'price',
    },
    {
      id: 'price',
      type: 'data.priceFeed',
      category: 'data',
      params: { asset: 'NVDA', assetClass: 'Stock/ETF', field: 'Last price' },
      next: 'cond',
    },
    {
      id: 'cond',
      type: 'logic.condition',
      category: 'logic',
      params: { leftRef: 'price.price', operator: 'drops below', rightValue: 5, compareTo: 'the open' },
      branches: { then: 'cap', else: null },
    },
    {
      id: 'cap',
      type: 'logic.boundary',
      category: 'logic',
      params: { kind: 'Capital cap', capAmount: 4000, capPeriod: 'per week' },
      branches: { then: 'trade', else: 'notify' },
    },
    {
      id: 'trade',
      type: 'action.trade',
      category: 'action',
      params: { side: 'Buy', asset: 'NVDA', sizing: 'Dollar amount', amount: 2000, orderType: 'Market', account: 'primary' },
      next: 'notify',
    },
    {
      id: 'notify',
      type: 'notify.alert',
      category: 'notify',
      params: { channel: 'Email', on: 'Every fill' },
      next: null,
    },
  ],
};

/* a card row is a friendly projection of one param on one node, rendered as a
   label + a tappable ValueToken. `control` reuses the field-control vocabulary. */
export type RowControl =
  | { type: 'select'; options: string[] }
  | { type: 'number'; affix?: '$' | '%'; placeholder?: string }
  | { type: 'asset-search'; placeholder?: string }
  | { type: 'account-picker' }
  | { type: 'text'; placeholder?: string };

export interface CardRow {
  id: string;
  label: string; // "When NVDA drops"
  nodeId: string;
  key: string;
  control: RowControl;
  detail?: boolean; // true → hidden behind "Show details"
}

const ACCOUNTS = ['primary', 'HYCA', 'Bond ladder', 'Treasury', 'Bank'];

/* The readable projection. Summary rows mirror the spec's card; detail rows are
   the "plumbing" revealed by Show details. */
export const CARD_ROWS: CardRow[] = [
  { id: 'drop', label: 'When NVDA drops', nodeId: 'cond', key: 'rightValue', control: { type: 'number', affix: '%' } },
  { id: 'buy', label: 'Buy', nodeId: 'trade', key: 'amount', control: { type: 'number', affix: '$' } },
  { id: 'cap', label: 'Weekly cap', nodeId: 'cap', key: 'capAmount', control: { type: 'number', affix: '$' } },
  { id: 'notify', label: 'Notify', nodeId: 'notify', key: 'channel', control: { type: 'select', options: ['Email', 'Push', 'Email + Push'] } },

  // ── plumbing (Show details) ──
  { id: 'runs', label: 'Runs', nodeId: 'trg', key: 'frequency', control: { type: 'select', options: ['Every 5 min', 'Every 15 min', 'Every 30 min', 'Hourly', 'Daily'] }, detail: true },
  { id: 'window', label: 'During', nodeId: 'trg', key: 'window', control: { type: 'select', options: ['Market hours', 'Extended hours', '24/7'] }, detail: true },
  { id: 'watch', label: 'Watching', nodeId: 'price', key: 'asset', control: { type: 'asset-search', placeholder: 'Search ticker…' }, detail: true },
  { id: 'compareTo', label: 'Drop measured vs.', nodeId: 'cond', key: 'compareTo', control: { type: 'select', options: ['prior close', 'the open', '52-week high', 'a fixed value'] }, detail: true },
  { id: 'orderType', label: 'Order type', nodeId: 'trade', key: 'orderType', control: { type: 'select', options: ['Market', 'Limit', 'Stop'] }, detail: true },
  { id: 'account', label: 'Account', nodeId: 'trade', key: 'account', control: { type: 'account-picker' }, detail: true },
];

/* ── value formatting for the token face ── */
export function formatValue(row: CardRow, value: ParamValue): string {
  if (value === null || value === '') return '—';
  if (row.control.type === 'number') {
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    const num = n.toLocaleString('en-US');
    if (row.control.affix === '$') return `$${num}`;
    if (row.control.affix === '%') return `${num}%`;
    return num;
  }
  return String(value);
}

/* read a row's current value from the agent's nodes */
export function rowValue(nodes: NodeInstance[], row: CardRow): ParamValue {
  return nodes.find((n) => n.id === row.nodeId)?.params[row.key] ?? null;
}

export const ACCOUNT_OPTIONS = ACCOUNTS;

/* a plain-English sentence describing what the agent does — for the review gate */
export function summarize(nodes: NodeInstance[]): string {
  const get = (id: string, k: string) => nodes.find((n) => n.id === id)?.params[k];
  const fmtMoney = (v: ParamValue | undefined) => `$${Number(v ?? 0).toLocaleString('en-US')}`;
  const runs = String(get('trg', 'frequency') ?? 'Every 15 min').toLowerCase();
  const window = String(get('trg', 'window') ?? 'Market hours').toLowerCase();
  const asset = String(get('price', 'asset') ?? 'NVDA');
  const drop = get('cond', 'rightValue');
  const measured = String(get('cond', 'compareTo') ?? 'the open');
  const amount = fmtMoney(get('trade', 'amount'));
  const orderType = String(get('trade', 'orderType') ?? 'Market').toLowerCase();
  const cap = fmtMoney(get('cap', 'capAmount'));
  const capPeriod = String(get('cap', 'capPeriod') ?? 'per week');
  const channel = String(get('notify', 'channel') ?? 'Email');
  return `${runs} during ${window}, watch ${asset}. When it drops ${drop}% versus ${measured}, buy ${amount} at ${orderType} — capped at ${cap} ${capPeriod}. Notify by ${channel}.`;
}

export const DISCLOSURES: string[] = [
  'This agent places live orders in your connected brokerage account using real funds.',
  'Automated strategies carry risk; past performance does not guarantee future results.',
  'You can pause or stop this agent at any time, and its weekly cap limits how much it can deploy.',
];
