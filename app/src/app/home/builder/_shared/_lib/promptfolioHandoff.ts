import type { AllocationRow, RuleState } from '../types';

const STORAGE_KEY = 'surmount:promptfolio-handoff';

export type PromptfolioHandoffPayload = {
  name: string;
  description: string;
  rows: AllocationRow[];
  rules: RuleState;
};

function isValidPayload(value: unknown): value is PromptfolioHandoffPayload {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.name === 'string' && typeof v.description === 'string' && Array.isArray(v.rows) && typeof v.rules === 'object';
}

export function savePendingDraft(payload: PromptfolioHandoffPayload) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

// Read-only — safe to call more than once (e.g. React StrictMode's double render in dev) since it
// never mutates storage. Pair with clearPendingDraft() in a mount effect to consume it exactly
// once.
export function peekPendingDraft(): PromptfolioHandoffPayload | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return isValidPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPendingDraft() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}
