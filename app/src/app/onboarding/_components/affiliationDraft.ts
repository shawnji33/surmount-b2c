export const AFFILIATION_DRAFT_KEY = 'surmount-onboarding-affiliation-draft';

export const AFFILIATION_OPTIONS = [
  {
    id: 'brokerage',
    label: 'I am affiliated or work with a U.S. registered broker-dealer or FINRA',
  },
  {
    id: 'public-company',
    label: 'I am a 10% shareholder or senior executive at a publicly traded company',
  },
  {
    id: 'political-exposure',
    label: 'I am, or an immediate family member/relative is, a senior political figure',
  },
] as const;

export type AffiliationId = (typeof AFFILIATION_OPTIONS)[number]['id'];

type AffiliationDraft = {
  selected: AffiliationId[];
};

function isAffiliationId(value: unknown): value is AffiliationId {
  return typeof value === 'string' && AFFILIATION_OPTIONS.some(option => option.id === value);
}

export function readAffiliationDraft(): AffiliationDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(AFFILIATION_DRAFT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as AffiliationDraft).selected)) return null;

    const selected = (parsed as AffiliationDraft).selected.filter(isAffiliationId);
    return selected.length ? { selected } : null;
  } catch {
    return null;
  }
}

export function writeAffiliationDraft(selected: AffiliationId[]) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(AFFILIATION_DRAFT_KEY, JSON.stringify({ selected } satisfies AffiliationDraft));
}

export function clearAffiliationDraft() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(AFFILIATION_DRAFT_KEY);
}
