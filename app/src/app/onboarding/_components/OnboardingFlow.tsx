'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import s from './onboarding.module.css';

const FLOW_PHASES: string[][] = [
  ['legal-name', 'date-of-birth', 'address', 'citizenship', 'ssn', 'phone', 'verify-phone',
   'employment', 'occupation', 'annual-income', 'net-worth', 'funding-source', 'regulatory'],
  ['investing-style', 'financial-goal', 'financial-situation',
   'time-horizon', 'risk-tolerance', 'investment-allocation', 'terms'],
];

function computeProgress(slug: string) {
  for (let p = 0; p < FLOW_PHASES.length; p++) {
    const i = FLOW_PHASES[p].indexOf(slug);
    if (i >= 0) {
      return FLOW_PHASES.map((phase, ph) => {
        if (ph < p) return 100;
        if (ph > p) return 0;
        return ((i + 1) / phase.length) * 100;
      });
    }
  }
  return null;
}

interface OnboardingFlowProps {
  back?: string;
  showExitModal?: boolean;
  children: React.ReactNode;
}

export default function OnboardingFlow({ back, showExitModal = true, children }: OnboardingFlowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [exitOpen, setExitOpen] = useState(false);

  const slug = pathname.split('/').filter(Boolean).pop() ?? '';
  const segPcts = computeProgress(slug);

  // On first mount animate from 0; on subsequent navigations transition directly
  const initialized = useRef(false);
  const [animPcts, setAnimPcts] = useState<number[] | null>(null);
  useEffect(() => {
    if (!segPcts) return;
    if (!initialized.current) {
      initialized.current = true;
      setAnimPcts(segPcts.map(() => 0));
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimPcts([...segPcts])));
      return () => cancelAnimationFrame(id);
    }
    setAnimPcts([...segPcts]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && exitOpen) setExitOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [exitOpen]);

  return (
    <div className={s.shell}>
      <header className={s.topbar}>
        {back ? (
          <button className={s.topbarBtn} type="button" onClick={() => router.push(back)}>
            <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="216" y1="128" x2="40" y2="128"/>
              <polyline points="112 56 40 128 112 200"/>
            </svg>
            <span>Back</span>
          </button>
        ) : (
          <span className={s.topbarSpacer} aria-hidden="true">Close</span>
        )}

        <div className={s.topbarBrand}>
          <img src="/assets/sidebar/logo-mark.svg" alt="" className={s.topbarBrandIcon} />
          <img src="/assets/sidebar/wordmark.svg" alt="Surmount" className={s.topbarBrandName} />
        </div>

        <button
          className={s.topbarBtn}
          type="button"
          onClick={() => showExitModal ? setExitOpen(true) : router.push('/home')}
        >
          <span>Close</span>
          <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" aria-hidden="true">
            <line x1="200" y1="56" x2="56" y2="200"/>
            <line x1="200" y1="200" x2="56" y2="56"/>
          </svg>
        </button>
      </header>

      {animPcts && (
        <div className={s.progress} aria-hidden="true">
          {animPcts.map((pct, i) => (
            <div key={i} className={s.progressSeg}>
              <div className={s.progressFill} style={{ width: `${pct}%` }} />
            </div>
          ))}
        </div>
      )}

      {children}

      {exitOpen && (
        <div
          className={s.modalRoot}
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-modal-title"
        >
          <div className={s.modalBackdrop} onClick={() => setExitOpen(false)} />
          <div className={s.modalCard}>
            <button
              className={s.modalDismiss}
              type="button"
              aria-label="Close dialog"
              onClick={() => setExitOpen(false)}
            >
              <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" aria-hidden="true">
                <line x1="200" y1="56" x2="56" y2="200"/>
                <line x1="200" y1="200" x2="56" y2="56"/>
              </svg>
            </button>
            <div className={s.modalBody}>
              <h2 id="exit-modal-title" className={s.modalTitle}>Exit account opening?</h2>
              <p className={s.modalDesc}>We&apos;ll save your progress so you can continue later from this same spot.</p>
            </div>
            <div className={s.modalActions}>
              <button className={s.modalBtnPrimary} type="button" onClick={() => router.push('/home')}>
                Exit account opening
              </button>
              <button className={s.modalBtnSecondary} type="button" onClick={() => setExitOpen(false)}>
                Continue opening
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
