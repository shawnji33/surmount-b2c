import { MarkerType, type Node, type Edge } from '@xyflow/react';
import type { Comparator } from './types';

export type IndicatorCategory = 'Technical' | 'Fundamental' | 'Descriptive';
export type IndicatorParam = { label: string; placeholder: string; suffix: string };
export type Indicator = {
  id: string;
  label: string;
  abbr: string;
  category: IndicatorCategory;
  /* Present when the indicator needs a value before it means anything — the
   * picker renders an extra field for it. */
  param?: IndicatorParam;
};

/* Technical + Fundamental catalogs transcribed from the Figma dropdown
 * (2103:85114). Descriptive is left as it was — no list supplied for it yet.
 * `abbr` is what the canvas capsule renders inline, so it stays short. */
export const INDICATORS: Indicator[] = [
  // ── Technical ──
  { id: 'adx', label: 'Average Directional Movement Index', abbr: 'ADX', category: 'Technical' },
  { id: 'bbands', label: 'Bollinger Bands', abbr: 'BB', category: 'Technical' },
  { id: 'cci', label: 'Commodity Channel Index', abbr: 'CCI', category: 'Technical' },
  {
    id: 'cumret',
    label: 'Cumulative Return',
    abbr: 'Cumulative Return',
    category: 'Technical',
    param: { label: 'Window (# of trading days)', placeholder: 'Enter a number', suffix: 'd' },
  },
  { id: 'ema', label: 'Exponential Moving Average', abbr: 'EMA', category: 'Technical' },
  { id: 'momentum', label: 'Momentum', abbr: 'MOM', category: 'Technical' },
  { id: 'mfi', label: 'Money Flow Index', abbr: 'MFI', category: 'Technical' },
  { id: 'macd', label: 'Moving Average Convergence/Divergence', abbr: 'MACD', category: 'Technical' },
  { id: 'obv', label: 'On-Balance Volume', abbr: 'OBV', category: 'Technical' },
  { id: 'sar', label: 'Parabolic Stop and Reverse', abbr: 'SAR', category: 'Technical' },
  { id: 'ppo', label: 'Percentage Price Oscillator', abbr: 'PPO', category: 'Technical' },
  { id: 'rsi', label: 'Relative Strength Index', abbr: 'RSI', category: 'Technical' },
  { id: 'sma', label: 'Simple Moving Average', abbr: 'SMA', category: 'Technical' },
  { id: 'slope', label: 'Slope', abbr: 'SLOPE', category: 'Technical' },
  { id: 'smma', label: 'Smooth Moving Average', abbr: 'SMMA', category: 'Technical' },
  { id: 'stddev', label: 'Standard Deviation', abbr: 'STDDEV', category: 'Technical' },
  { id: 'stoch', label: 'Stochastic Oscillator', abbr: 'STOCH', category: 'Technical' },
  { id: 'vwap', label: 'Volume-Weighted Average Price', abbr: 'VWAP', category: 'Technical' },
  { id: 'williamsr', label: 'Williams %R', abbr: '%R', category: 'Technical' },

  // ── Fundamental ──
  { id: 'de', label: 'Debt/Equity Ratio', abbr: 'D/E', category: 'Fundamental' },
  { id: 'epsGrowth', label: 'EPS Growth qtr to qtr', abbr: 'EPS', category: 'Fundamental' },
  { id: 'grossMargin', label: 'Gross Profit Margin', abbr: 'GPM', category: 'Fundamental' },
  { id: 'ioIncreased', label: 'Institutional Ownership Increased Positions Change', abbr: 'IO INC', category: 'Fundamental' },
  { id: 'ioTotal', label: 'Institutional Ownership Total Invested Change', abbr: 'IO TOT', category: 'Fundamental' },
  { id: 'netMargin', label: 'Net Profit Margin', abbr: 'NPM', category: 'Fundamental' },
  { id: 'operatingMargin', label: 'Operating Margin', abbr: 'OPM', category: 'Fundamental' },
  { id: 'pb', label: 'P/B Ratio', abbr: 'P/B', category: 'Fundamental' },
  { id: 'pe', label: 'P/E Ratio', abbr: 'P/E', category: 'Fundamental' },
  { id: 'ps', label: 'P/S Ratio', abbr: 'P/S', category: 'Fundamental' },
  { id: 'payout', label: 'Payout Ratio', abbr: 'PAYOUT', category: 'Fundamental' },
  { id: 'peg', label: 'PEG Ratio', abbr: 'PEG', category: 'Fundamental' },
  { id: 'priceCash', label: 'Price/Cash', abbr: 'P/CASH', category: 'Fundamental' },
  { id: 'priceFcf', label: 'Price/Free Cash Flow', abbr: 'P/FCF', category: 'Fundamental' },
  { id: 'quick', label: 'Quick Ratio', abbr: 'QUICK', category: 'Fundamental' },
  { id: 'revenue', label: 'Revenue', abbr: 'REV', category: 'Fundamental' },
  { id: 'revenueGrowth', label: 'Revenue Growth qtr to qtr', abbr: 'REV GR', category: 'Fundamental' },

  // ── Descriptive ──
  { id: 'price', label: 'Price', abbr: 'PRICE', category: 'Descriptive' },
  { id: 'volume', label: 'Volume', abbr: 'VOL', category: 'Descriptive' },
  { id: 'marketCap', label: 'Market Cap', abbr: 'MCAP', category: 'Descriptive' },
  { id: 'high52w', label: '52W High', abbr: '52WH', category: 'Descriptive' },
  { id: 'low52w', label: '52W Low', abbr: '52WL', category: 'Descriptive' },
  { id: 'avgVolume30d', label: 'Avg Volume 30d', abbr: 'AVGVOL', category: 'Descriptive' },
  { id: 'beta', label: 'Beta', abbr: 'BETA', category: 'Descriptive' },
  { id: 'sharesOutstanding', label: 'Shares Outstanding', abbr: 'SHARES', category: 'Descriptive' },
];

/* Figma 2103:85402. `symbol` is what the canvas capsule renders inline
 * ("RSI of SPY > SMA of QQQ"); `icon` names the Phosphor glyph the dropdown
 * shows beside each label. */
export const COMPARATORS: { id: Comparator; label: string; symbol: string; icon: ComparatorIcon }[] = [
  { id: 'gt', label: 'Greater than', symbol: '>', icon: 'GreaterThan' },
  { id: 'lt', label: 'Less than', symbol: '<', icon: 'LessThan' },
  { id: 'eq', label: 'Equal to', symbol: '=', icon: 'Equals' },
  { id: 'neq', label: 'Not equal to', symbol: '≠', icon: 'NotEquals' },
  { id: 'gte', label: 'Greater than or equal to', symbol: '≥', icon: 'GreaterThanOrEqual' },
  { id: 'lte', label: 'Less than or equal to', symbol: '≤', icon: 'LessThanOrEqual' },
];

export type ComparatorIcon =
  | 'GreaterThan'
  | 'LessThan'
  | 'Equals'
  | 'NotEquals'
  | 'GreaterThanOrEqual'
  | 'LessThanOrEqual';

export const FREQUENCIES = ['1 minute', '5 minutes', '15 minutes', '1 hour', '4 hours', '1 day'];

/* Layout ported from the investing-agent workflow canvas
 * (~/Surmount/investing-agent/src/components/chat-shell/agent-flow-diagram.tsx).
 *
 * One vertical spine on the left — schedule, IF, ELSE — with each branch's
 * action offset to the right. The spine nodes share a left edge, which is what
 * makes the fixed 28px handle offset line all three dots up on the same x
 * regardless of how wide each pill happens to be. */
/* Solid, not alpha — overlapping runs on the spine were compounding into a
 * darker line wherever two edges shared a path. */
const EDGE_STYLE = { stroke: '#d5d6d9', strokeWidth: 1.5 };

/* Every connector is a real edge so React Flow draws the wiring: straight for a
 * vertical run, smoothstep where a spine branches right into a child. */
export const edge = (id: string, source: string, target: string, o: Partial<Edge> = {}): Edge =>
  ({ id, source, target, type: 'smoothstep', pathOptions: { borderRadius: 8 }, style: EDGE_STYLE, ...o }) as Edge;

/* One if/else group is five nodes wired to a shared shape. `createGroup` builds
 * them so the root "+" can spawn more without duplicating the layout. */
export const GROUP_SPAN = 430;

/* Which nodes belong to group n. Ids are suffixed with the group index, but
 * clause ids carry a second index (clause-{group}-{seq}) — a plain endsWith
 * would match clause-1-0 against group 0. */
export function belongsToGroup(id: string, n: number): boolean {
  return id.startsWith(`clause-${n}-`) || (!id.startsWith('clause-') && id.endsWith(`-${n}`));
}

/* x of the spine (IF / ELSE) and of everything that branches off it. Kept as
 * named constants so the clause nodes inserted at runtime line up with the ones
 * authored here. */
export const SPINE_X = 108;
export const CHILD_X = 196;

export function createGroup(n: number): { nodes: Node[]; edges: Edge[] } {
  /* 128, not 72 — the Schedule pill needs clear air before the first rule, and
   * the "Rule N" chip sits 34px above the IF pill, eating into that gap. */
  const y = 128 + GROUP_SPAN * n;
  const k = (s: string) => `${s}-${n}`;
  const blank = { functionId: '', ticker: '' };

  return {
    nodes: [
      /* Marks where a group begins. With several rules stacked on one spine the
       * pills otherwise read as a single continuous list. */
      { id: k('group-label'), type: 'groupLabel', position: { x: SPINE_X, y: y - 34 }, data: { index: n } },
      {
        id: k('condition'),
        type: 'condition',
        position: { x: SPINE_X, y },
        data: {
          kind: 'condition',
          clauses: [{ left: { ...blank }, comparator: 'gt', right: { ...blank } }],
        },
      },
      { id: k('add-andor'), type: 'addAndOr', position: { x: CHILD_X, y: y + 64 }, data: {} },
      {
        id: k('action-then'),
        type: 'action',
        position: { x: CHILD_X, y: y + 128 },
        data: { kind: 'action', label: 'Then', holdings: [] },
      },
      { id: k('branch-else'), type: 'branch', position: { x: SPINE_X, y: y + 196 }, data: { kind: 'branch', label: 'ELSE' } },
      {
        id: k('action-else'),
        type: 'action',
        position: { x: CHILD_X, y: y + 260 },
        data: { kind: 'action', label: 'Else', holdings: [] },
      },
    ],
    edges: [
      edge(k('e-if-andor'), k('condition'), k('add-andor'), { sourceHandle: 'branch', targetHandle: 'left' }),
      edge(k('e-if-then'), k('condition'), k('action-then'), { sourceHandle: 'branch', targetHandle: 'left' }),
      edge(k('e-if-else'), k('condition'), k('branch-else'), { sourceHandle: 'continue', targetHandle: 'top' }),
      edge(k('e-else-action'), k('branch-else'), k('action-else'), { targetHandle: 'left' }),
    ],
  };
}

export const rootPlusY = (groups: number) => 128 + GROUP_SPAN * (groups - 1) + 340;

const firstGroup = createGroup(0);

export const INITIAL_NODES: Node[] = [
  { id: 'trigger', type: 'trigger', position: { x: 20, y: 0 }, data: { kind: 'trigger', frequency: '' } },
  ...firstGroup.nodes,
  { id: 'add-root', type: 'addRoot', position: { x: SPINE_X, y: rootPlusY(1) }, data: {} },
];


/* Straight down the spine; smoothstep only where a branch steps out to its
 * action, so the vertical run stays a clean single line. */
const branch = (id: string, source: string, target: string, sourceHandle?: string): Edge =>
  ({
    id,
    source,
    target,
    sourceHandle,
    type: 'smoothstep',
    pathOptions: { borderRadius: 10 },
    style: EDGE_STYLE,
  }) as Edge;

export const INITIAL_EDGES: Edge[] = [
  /* Outer spine: Schedule drops down the far left, branches right into each
   * group's IF, and continues to the root "+" at the bottom. */
  edge('e-trigger-condition-0', 'trigger', 'condition-0', { targetHandle: 'left' }),
  edge('e-trigger-add', 'trigger', 'add-root', { targetHandle: 'left' }),
  ...firstGroup.edges,
];

/* A fresh clause starts blank so the user picks every part deliberately. The
 * join is the connector back to the clause before it. */
export const emptyClause = (join: 'AND' | 'OR') => ({
  left: { functionId: '', ticker: '' },
  comparator: 'gt' as const,
  right: { functionId: '', ticker: '' },
  join,
});

