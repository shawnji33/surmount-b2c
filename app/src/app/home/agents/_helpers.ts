import {
  type ActiveAgent,
  type DemoKey,
  type PanelDisplayData,
  type PanelFieldDef,
} from './_data';

export function formatCurrencyAmount(value: string): string {
  const normalized = value.replace(/[$,\s]/g, '');
  if (!normalized) return value;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric.toLocaleString() : value;
}

export function getPanelDisplay(demo: DemoKey, stepId: number, edits: Record<number, Record<string, string>>): PanelDisplayData {
  if (demo === 'hedge') {
    const v = (key: string, def: string) => edits[stepId]?.[key] ?? def;
    switch (stepId) {
      case 1: return { title: 'Trigger', meta: `${v('frequency', 'Continuously')}, ${v('window', 'Market hours').toLowerCase()}` };
      case 2: return { title: 'Read VIX level', meta: 'Live data source' };
      case 3: {
        const threshold = v('threshold', '25');
        return { ifCondition: `If VIX > ${threshold}`, thenLabel: 'Continue to budget check', elseLabel: 'No action — VIX below threshold', elseMeta: 'Keep monitoring' };
      }
      case 4: {
        const pct = v('budget_pct', '1');
        return { title: 'Check budget', meta: `Protection spend ≤ ${pct}% of portfolio value` };
      }
      case 5: {
        const instrument = v('instrument', 'SPY puts');
        const order = v('order', 'Market order');
        return { title: `Buy ${instrument}`, meta: order };
      }
      case 6: return { title: 'Send confirmation', meta: v('channel', 'Email + alert') };
      default: return {};
    }
  }

  if (demo === 'cash') {
    const v = (key: string, def: string) => edits[stepId]?.[key] ?? def;
    const buffer = edits[3]?.buffer ?? '5000';
    const formattedBuffer = formatCurrencyAmount(buffer);
    const destination = edits[5]?.destination ?? 'High-Yield Cash Account';

    switch (stepId) {
      case 1: return { title: 'Trigger', meta: `${v('day', 'Every Friday')} at ${v('time', 'Market close').toLowerCase()}` };
      case 2: return { title: 'Check brokerage cash balance', meta: 'Bank/account balance check' };
      case 3: return { ifCondition: `If cash balance > $${formattedBuffer}`, thenLabel: 'Continue to excess calculation', elseLabel: `No sweep — balance below $${formattedBuffer} buffer`, elseMeta: 'No action' };
      case 4: return { title: 'Calculate excess', meta: `Balance − $${formattedBuffer}` };
      case 5: return { title: `Sweep excess → ${destination}`, meta: 'Internal account movement' };
      case 6: return { title: 'Send confirmation', meta: 'Email' };
      default: return {};
    }
  }

  const v = (key: string, def: string) => edits[stepId]?.[key] ?? def;
  const sym = edits[2]?.symbol ?? 'NVDA';
  switch (stepId) {
    case 1: return { title: 'Trigger', meta: `${v('frequency', 'Every 15 min')}, ${v('window', 'Market hours').toLowerCase()}, ${v('days', 'Mon–Fri')}` };
    case 2: return { title: `Get ${sym} price & prior close`, meta: v('source', 'Real-time price feed') };
    case 3: {
      const pct = v('pct', '5'); const ref = v('ref', 'prior close');
      return { ifCondition: `If ${sym} ≤ −${pct}% vs ${ref}`, thenLabel: 'Continue to cap check', elseLabel: 'Stop — threshold not met', elseMeta: 'No action' };
    }
    case 4: return { title: "Get this week's spend on this agent", meta: `Resets ${v('reset', 'Monday')}` };
    case 5: {
      const amt = v('amount', '2000'); const cap = v('cap', '4000'); const order = v('order', 'Market order');
      const fa = Number(amt).toLocaleString(); const fc = Number(cap).toLocaleString();
      return { ifCondition: `If (spent + $${fa}) ≤ $${fc}`, thenLabel: `Buy $${fa} ${sym}`, thenMeta: order, elseLabel: 'Skip — weekly cap reached', elseMeta: `Resets ${edits[4]?.reset ?? 'Monday'}` };
    }
    case 6: return { title: 'Send confirmation', meta: v('channel', 'Email') };
    default: return {};
  }
}

export function getFieldDisplayValue(field: PanelFieldDef, value: string): string {
  if (field.prefix === '$' && value) return `$ ${value}`;
  return value;
}

export function getFieldStoredValue(field: PanelFieldDef, value: string): string {
  if (field.prefix === '$') return value.replace(/[$,\s]/g, '');
  return value;
}

export function getStepEditorTitle(demo: DemoKey, stepId: number, display: PanelDisplayData): string {
  if (demo === 'cash' && stepId === 3) return 'Cash buffer';
  if (demo === 'nvda' && stepId === 3) return 'Dip threshold';
  if (demo === 'nvda' && stepId === 5) return 'Cap check & buy';
  if (demo === 'hedge' && stepId === 3) return 'VIX threshold';
  if (demo === 'hedge' && stepId === 4) return 'Budget check';
  return display.title ?? 'Edit step';
}

export function getDemoForAgent(agent: ActiveAgent | null): DemoKey {
  if (!agent) return 'nvda';
  const value = `${agent.id} ${agent.name}`.toLowerCase();
  if (value.includes('vix') || value.includes('hedge') || value.includes('protect')) return 'hedge';
  return value.includes('cash') || value.includes('sweep') ? 'cash' : 'nvda';
}
