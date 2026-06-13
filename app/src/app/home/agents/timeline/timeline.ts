import type { Agent, NodeInstance, ParamValue } from '../nodes/types';

/* ── §3 — TimelineEvent model. Projects the agent's logic forward into
   scheduled events and merges with the existing past-event narrative. ── */

export type EventState = 'projected' | 'now' | 'done' | 'skipped' | 'attention';
export type TimeGroup = 'Upcoming' | 'Now' | 'Today' | 'Earlier';

export interface TimelineEvent {
  id: string;
  state: EventState;
  group: TimeGroup;
  title: string;
  detail: string;
  timestamp: string;
  sourceNodeId?: string; // enables tap-to-edit on projected rows
  editRowId?: string; // maps to a CARD_ROWS row for inline editing
}

const param = (nodes: NodeInstance[], id: string, key: string, fb: ParamValue): ParamValue =>
  nodes.find((n) => n.id === id)?.params[key] ?? fb;

/* stable value for SSR + first client paint — avoids a clock-based hydration
   mismatch. The page swaps in the real `new Date()` after mount. */
export const SSR_ASOF = new Date('2026-06-13T19:25:00Z');

// format in market time so server (often UTC) and client agree for a given Date
const fmtTime = (d: Date) =>
  d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
  });

const stepMinutes = (freq: string) =>
  freq.includes('5 min') ? 5 : freq.includes('15') ? 15 : freq.includes('30') ? 30 : 60;

/* derive the next 1–3 meaningful scheduled events from the trigger/schedule */
export function projectUpcoming(agent: Agent, asOf: Date = SSR_ASOF): TimelineEvent[] {
  const { nodes } = agent;
  const freq = String(param(nodes, 'trg', 'frequency', 'Every 15 min'));
  const drop = param(nodes, 'cond', 'rightValue', 5);
  const amount = Number(param(nodes, 'trade', 'amount', 2000));
  const cap = Number(param(nodes, 'cap', 'capAmount', 4000));

  const now = asOf;
  const next = new Date(now.getTime() + stepMinutes(freq) * 60000);
  const fmtMoney = (n: number) => `$${n.toLocaleString('en-US')}`;

  return [
    {
      id: 'up-check',
      state: 'projected',
      group: 'Upcoming',
      title: 'Next check for a dip',
      detail: `Today, ${fmtTime(next)} · ${freq.toLowerCase()}`,
      timestamp: next.toISOString(),
      sourceNodeId: 'cond',
      editRowId: 'drop',
    },
    {
      id: 'up-buy',
      state: 'projected',
      group: 'Upcoming',
      title: `Buy ${fmtMoney(amount)} NVDA if it drops ${drop}%`,
      detail: `Projected · within this week's ${fmtMoney(cap)} cap`,
      timestamp: new Date(now.getTime() + 36e5).toISOString(),
      sourceNodeId: 'trade',
      editRowId: 'buy',
    },
    {
      id: 'up-cap',
      state: 'projected',
      group: 'Upcoming',
      title: 'Weekly cap resets',
      detail: 'Monday, 9:30 AM',
      timestamp: new Date(now.getTime() + 3 * 864e5).toISOString(),
      sourceNodeId: 'cap',
      editRowId: 'cap',
    },
  ];
}

/* the "happening now" event (only present once the agent is active) */
export function nowEvent(agent: Agent, asOf: Date = SSR_ASOF): TimelineEvent {
  const asset = String(param(agent.nodes, 'price', 'asset', 'NVDA'));
  return {
    id: 'now-monitor',
    state: 'now',
    group: 'Now',
    title: `Monitoring ${asset} price`,
    detail: 'Now · currently −2.1% from the open',
    timestamp: asOf.toISOString(),
    sourceNodeId: 'price',
  };
}

/* past events — mapped from the existing activity / transaction narrative */
export function pastEvents(agent: Agent): TimelineEvent[] {
  const cap = Number(param(agent.nodes, 'cap', 'capAmount', 4000));
  const amount = Number(param(agent.nodes, 'trade', 'amount', 2000));
  const fmtMoney = (n: number) => `$${n.toLocaleString('en-US')}`;
  return [
    {
      id: 'p-buy',
      state: 'done',
      group: 'Today',
      title: `Bought ${fmtMoney(amount)} NVDA`,
      detail: '11:15 AM · filled on a −6.2% dip',
      timestamp: 'today-1115',
    },
    {
      id: 'p-check',
      state: 'done',
      group: 'Today',
      title: 'Checked NVDA — no dip',
      detail: '9:45 AM · −0.4% from the open',
      timestamp: 'today-0945',
    },
    {
      id: 'p-skip',
      state: 'skipped',
      group: 'Earlier',
      title: 'Skipped — weekly cap reached',
      detail: `Thu, 2:40 PM · ${fmtMoney(cap)} of ${fmtMoney(cap)} deployed`,
      timestamp: 'thu-1440',
    },
    {
      id: 'p-attn',
      state: 'attention',
      group: 'Earlier',
      title: 'Brokerage re-auth needed',
      detail: 'Wed, 4:10 PM · resolved',
      timestamp: 'wed-1610',
    },
  ];
}
