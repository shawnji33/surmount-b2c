// Shared mock content for the 4 "Investing Agent" home-screen layout explorations.
// Not wired to any real agent runtime — status lines are derived from each agent's own
// condition shape so the three condition types (scheduled / live threshold / interval-polled
// threshold) read distinctly, per the spec.

export type AgentCondition =
  | { kind: 'scheduled'; next: string }
  | { kind: 'threshold-live'; watching: string; lastCheckedMinAgo: number }
  | { kind: 'threshold-interval'; watching: string; nextCheckInMin: number };

export type MockAgent = {
  id: string;
  name: string;
  condition: AgentCondition;
};

export function agentStatusLine(condition: AgentCondition): string {
  switch (condition.kind) {
    case 'scheduled':
      return `Next check: ${condition.next}`;
    case 'threshold-live':
      return `Watching ${condition.watching} — last checked ${condition.lastCheckedMinAgo} min ago`;
    case 'threshold-interval':
      return `Watching ${condition.watching} — next check in ${condition.nextCheckInMin} min`;
  }
}

export const MOCK_AGENTS: MockAgent[] = [
  { id: 'nvda-dip', name: 'NVDA Dip-Buyer', condition: { kind: 'threshold-live', watching: 'NVDA', lastCheckedMinAgo: 2 } },
  { id: 'cash-sweep', name: 'Weekly Cash Sweep', condition: { kind: 'scheduled', next: 'Mon 9:00 AM' } },
  { id: 'btc-ema', name: 'BTC EMA Watch', condition: { kind: 'threshold-interval', watching: 'BTC', nextCheckInMin: 8 } },
];

export type RoleTemplate = {
  id: string;
  name: string;
  description: string;
};

export const ROLE_TEMPLATES: RoleTemplate[] = [
  { id: 'dip-buyer', name: 'Dip-Buyer', description: 'Buy when a stock drops below a threshold' },
  { id: 'cash-sweeper', name: 'Cash Sweeper', description: 'Move idle cash into higher-yield accounts automatically' },
  { id: 'rebalancer', name: 'Rebalancer', description: 'Keep your portfolio at target allocation' },
  { id: 'tax-harvester', name: 'Tax Harvester', description: 'Capture losses to offset gains, automatically' },
  { id: 'hedge-agent', name: 'Hedge Agent', description: 'Protect your portfolio when volatility spikes' },
  { id: 'dividend-reinvestor', name: 'Dividend Reinvestor', description: 'Automatically reinvest dividends as they’re paid' },
];
