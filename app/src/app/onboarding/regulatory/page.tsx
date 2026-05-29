'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '../_components/OnboardingFlow';
import s from '../_components/onboarding.module.css';

const REGULATED = [
  'I am a politically exposed person or public official (includes U.S. and foreign)',
  'I am a 10% shareholder or senior executive at a publicly traded company',
  'I am affiliated or work with a brokerage',
];

function CheckMark() {
  return (
    <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="40 128 104 192 224 72"/>
    </svg>
  );
}

export default function RegulatoryPage() {
  const router = useRouter();
  const [checked, setChecked] = useState([false, false, false]);
  const [none, setNone] = useState(false);
  const [pendingIdx, setPendingIdx] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const anySelected = checked.some(Boolean) || none;

  function requestToggleRegulated(i: number) {
    if (none) return;
    if (!checked[i]) {
      setPendingIdx(i);
      setModalOpen(true);
    } else {
      setChecked(prev => prev.map((v, j) => j === i ? false : v));
    }
  }

  function confirmCompliance() {
    if (pendingIdx !== null) setChecked(prev => prev.map((v, j) => j === pendingIdx ? true : v));
    setModalOpen(false);
    setPendingIdx(null);
  }

  function cancelCompliance() {
    setModalOpen(false);
    setPendingIdx(null);
  }

  function toggleNone() {
    if (!none) { setChecked([false, false, false]); setNone(true); }
    else setNone(false);
  }

  return (
    <OnboardingFlow back="/onboarding/funding-source">
      <main className={s.main}>
        <div className={s.stack}>
          <div className={s.hero}>
            <h1 className={s.title}>Do any of these situations apply to you?</h1>
          </div>

          <div className={s.regCheckGroup} role="group" aria-label="Regulatory situations">
            {REGULATED.map((label, i) => (
              <button
                key={i}
                type="button"
                role="checkbox"
                aria-checked={checked[i]}
                onClick={() => requestToggleRegulated(i)}
                className={`${s.regCheckCard} ${checked[i] ? s.regCheckCardChecked : ''} ${none ? s.regCheckCardDisabled : ''}`}
              >
                <span className={`${s.regCheckBox} ${checked[i] ? s.regCheckBoxChecked : ''}`}>
                  {checked[i] && <CheckMark />}
                </span>
                <span className={s.regCheckText}>{label}</span>
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
            onClick={() => { if (anySelected) router.push('/onboarding/investing-style'); }}
            style={!anySelected ? { background: 'rgba(10,13,18,0.18)', color: 'rgba(10,13,18,0.4)', borderColor: 'rgba(255,255,255,0.12)', cursor: 'default' } : {}}
          >
            Next
            <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
            </svg>
          </button>
        </div>
      </main>

      {modalOpen && (
        <div className={s.complianceModal} role="dialog" aria-modal="true" aria-labelledby="compliance-title">
          <div className={s.complianceBackdrop} onClick={cancelCompliance} />
          <div className={s.complianceCard}>
            <div>
              <h2 id="compliance-title" className={s.complianceTitle}>Compliance approval required</h2>
              <p className={s.complianceDesc}>
                Have you already received written approval from your compliance team to open a brokerage account? You must have consent before proceeding.
              </p>
            </div>
            <div className={s.complianceActions}>
              <button type="button" className={s.complianceBtnCancel} onClick={cancelCompliance}>Cancel</button>
              <button type="button" className={s.complianceBtnConfirm} onClick={confirmCompliance}>Yes, I confirm</button>
            </div>
          </div>
        </div>
      )}
    </OnboardingFlow>
  );
}
