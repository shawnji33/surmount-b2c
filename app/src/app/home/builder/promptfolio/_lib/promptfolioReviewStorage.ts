import type { PromptfolioDraft } from '../_data';

const REVIEW_STORAGE_KEY = 'surmount:promptfolio-review';

function isPromptfolioDraft(value: unknown): value is PromptfolioDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Record<string, unknown>;
  return typeof draft.name === 'string'
    && typeof draft.description === 'string'
    && Array.isArray(draft.rows)
    && typeof draft.rules === 'object';
}

export function savePromptfolioReview(draft: PromptfolioDraft) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(draft));
}

export function readPromptfolioReview(): PromptfolioDraft | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(REVIEW_STORAGE_KEY);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    return isPromptfolioDraft(value) ? value : null;
  } catch {
    return null;
  }
}

export function clearPromptfolioReview() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(REVIEW_STORAGE_KEY);
}
