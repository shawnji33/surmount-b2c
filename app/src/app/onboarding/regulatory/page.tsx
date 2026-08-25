'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '../_components/OnboardingFlow';
import s from '../_components/onboarding.module.css';
import {
  AFFILIATION_OPTIONS,
  clearAffiliationDraft,
  readAffiliationDraft,
  writeAffiliationDraft,
} from '../_components/affiliationDraft';

function CheckMark() {
  return (
    <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="40 128 104 192 224 72"/>
    </svg>
  );
}

export default function RegulatoryPage() {
  const router = useRouter();
  const [checked, setChecked] = useState<boolean[]>(() => AFFILIATION_OPTIONS.map(() => false));
  const [none, setNone] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const anySelected = checked.some(Boolean) || none;

  useEffect(() => {
    const draft = readAffiliationDraft();
    if (draft) {
      setChecked(AFFILIATION_OPTIONS.map(option => draft.selected.includes(option.id)));
    }
    setHydrated(true);
  }, []);

  function toggleRegulated(i: number) {
    if (none) return;
    setChecked(prev => prev.map((value, index) => index === i ? !value : value));
  }

  function toggleNone() {
    if (!none) { setChecked(AFFILIATION_OPTIONS.map(() => false)); setNone(true); }
    else setNone(false);
  }

  function continueFlow() {
    if (none) {
      clearAffiliationDraft();
      router.push('/onboarding/investing-style');
      return;
    }

    const selected = AFFILIATION_OPTIONS.filter((_, index) => checked[index]).map(option => option.id);
    if (!selected.length) return;
    writeAffiliationDraft(selected);
    router.push('/onboarding/affiliation-details');
  }

  return (
    <OnboardingFlow back="/onboarding/funding-source">
      <main className={s.main}>
        <div className={s.stack}>
          <div className={s.hero}>
            <h1 className={s.title}>Do any of these situations apply to you or a member of your immediate family?</h1>
            <p className={s.subtitle}>Select every situation that applies.</p>
          </div>

          <div className={s.regCheckGroup} role="group" aria-label="Regulatory situations">
            {AFFILIATION_OPTIONS.map((option, i) => (
              <button
                key={option.id}
                type="button"
                role="checkbox"
                aria-checked={checked[i]}
                onClick={() => toggleRegulated(i)}
                className={`${s.regCheckCard} ${checked[i] ? s.regCheckCardChecked : ''} ${none ? s.regCheckCardDisabled : ''}`}
              >
                <span className={`${s.regCheckBox} ${checked[i] ? s.regCheckBoxChecked : ''}`}>
                  {checked[i] && <CheckMark />}
                </span>
                <span className={s.regCheckText}>{option.label}</span>
              </button>
            ))}

            <button
              type="button"
              role="checkbox"
              aria-checked={none}
              onClick={toggleNone}
              className={`${s.regCheckCard} ${none ? s.regCheckCardChecked : ''}`}
            >
              <span className={`${s.regCheckBox} ${none ? s.regCheckBoxChecked : ''}`}>
                {none && <CheckMark />}
              </span>
              <span className={s.regCheckText}>None of these apply</span>
              <span className={s.regBadgeMost}>Most common</span>
            </button>
          </div>

          <button
            className={s.cta}
            type="button"
            disabled={!anySelected || !hydrated}
            onClick={continueFlow}
          >
            Next
            <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
            </svg>
          </button>
        </div>
      </main>
    </OnboardingFlow>
  );
}
