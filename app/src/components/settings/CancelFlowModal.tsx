'use client';

import { ArrowLeft, Warning, X } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/Button';
import s from './CancelFlowModal.module.css';

/* The cancel confirmation and the exit survey are the same flow: step 1 asks
   why, step 2 asks for detail and confirms. Nothing is cancelled until
   "Confirm cancellation" on step 2 — "Keep your plan" backs out of both. */

type Reason = {
  value: string;
  label: string;
  /** Step 2 headline, tailored to what they picked. */
  prompt: string;
  placeholder: string;
};

const REASONS: Reason[] = [
  {
    value: 'pausing',
    label: 'I’m pausing investing for now',
    prompt: 'What would bring you back?',
    placeholder: 'The moment you’d want Surmount again…',
  },
  {
    value: 'usage',
    label: 'I’m not using it enough',
    prompt: 'What got in the way?',
    placeholder: 'What kept you from coming back…',
  },
  {
    value: 'price',
    label: 'Too expensive for what I get',
    prompt: 'What would have made it worth the price?',
    placeholder: 'The feature, tier, or limit you needed…',
  },
  {
    value: 'returns',
    label: 'Returns didn’t meet my expectations',
    prompt: 'What were you expecting to see?',
    placeholder: 'The returns or the risk you were after…',
  },
  {
    value: 'missing',
    label: 'Missing features I need',
    prompt: 'What were you missing?',
    placeholder: 'The feature you went looking for…',
  },
  {
    value: 'broken',
    label: 'Something isn’t working well',
    prompt: 'What wasn’t working?',
    placeholder: 'Bugs, confusing screens, brokerage connection…',
  },
  {
    value: 'switched',
    label: 'I moved to another platform',
    prompt: 'What does it do better?',
    placeholder: 'The platform, and the one thing it gets right…',
  },
  {
    value: 'other',
    label: 'Other reason',
    prompt: 'What made you cancel?',
    placeholder: 'A sentence or two is plenty…',
  },
];

const NOTE_LIMIT = 600;

export type CancelFeedback = { reason: string; note: string };

/** Handoff/preview only: renders the flow at a given point. */
export type CancelFlowStep = 'reason' | 'reason-picked' | 'details';

/* Step 2 is taller than step 1 in some states and shorter in others, so the
   shell measures its content and transitions between them. */
function AutoHeight({ children }: { children: React.ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const lastHeight = useRef<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.height ?? 0;
      // Nothing to animate from on the first measurement — don't clip for it.
      if (lastHeight.current != null && Math.abs(lastHeight.current - next) > 0.5) setSettling(true);
      lastHeight.current = next;
      setHeight(next);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={[s.autoHeight, settling ? s.autoHeightClip : ''].filter(Boolean).join(' ')}
      style={height == null ? undefined : { height }}
      onTransitionEnd={(e) => {
        if (e.propertyName === 'height') setSettling(false);
      }}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
}

export function CancelFlowModal({
  planName,
  endDate,
  onKeep,
  onConfirm,
  previewStep,
}: {
  /** Short plan name — "Plus", "Core". */
  planName: string;
  /** When access actually ends, e.g. "Jul 9, 2026". */
  endDate: string;
  /** Backed out — nothing is cancelled. */
  onKeep: () => void;
  /** Cancellation confirmed, with whatever they told us. */
  onConfirm: (feedback: CancelFeedback) => void;
  previewStep?: CancelFlowStep;
}) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'reason' | 'details'>(previewStep === 'details' ? 'details' : 'reason');
  const [reason, setReason] = useState<string | null>(
    previewStep === 'reason-picked' || previewStep === 'details' ? 'broken' : null,
  );
  const [note, setNote] = useState('');
  const [direction, setDirection] = useState<'fwd' | 'back'>('fwd');

  const selected = REASONS.find((r) => r.value === reason) ?? null;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onKeep();
    };
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onKeep]);

  if (!mounted) return null;

  const stepClass = direction === 'fwd' ? s.stepFwd : s.stepBack;

  return createPortal(
    <div
      className={s.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onKeep();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={step === 'reason' ? 'What changed?' : 'Tell us more'}
    >
      <div className={s.modal}>
        <div className={s.head}>
          <div className={s.headBar}>
            {step === 'details' ? (
              <button
                type="button"
                className={[s.iconBtn, s.back].join(' ')}
                onClick={() => {
                  setDirection('back');
                  setStep('reason');
                }}
                aria-label="Back to reasons"
              >
                <ArrowLeft weight="regular" aria-hidden="true" />
              </button>
            ) : (
              <span />
            )}
            <button type="button" className={[s.iconBtn, s.close].join(' ')} onClick={onKeep} aria-label="Close">
              <X weight="regular" aria-hidden="true" />
            </button>
          </div>
          <div className={s.headText}>
              {step === 'reason' ? (
                <>
                  <h2 className={s.title} id="cancel-flow-title">
                    What changed?
                  </h2>
                  <p className={s.sub}>
                    Your {planName} plan stays active until {endDate}.
                  </p>
                </>
              ) : (
                <>
                  <h2 className={s.title}>{selected?.prompt}</h2>
                  <p className={s.sub}>Optional — it goes straight to the team building Surmount.</p>
                </>
              )}
          </div>
        </div>

        <div className={s.body}>
          <AutoHeight>
            <div className={stepClass} key={step}>
              {step === 'reason' ? (
                <div className={s.list} role="radiogroup" aria-labelledby="cancel-flow-title">
                  {REASONS.map((r) => {
                    const isOn = reason === r.value;
                    return (
                      <label
                        key={r.value}
                        className={[s.row, isOn ? s.rowSelected : ''].filter(Boolean).join(' ')}
                      >
                        <input
                          type="radio"
                          name="cancel-reason"
                          className={s.radioInput}
                          value={r.value}
                          checked={isOn}
                          onChange={() => setReason(r.value)}
                        />
                        <span className={[s.radio, isOn ? s.radioOn : ''].filter(Boolean).join(' ')} aria-hidden="true">
                          {isOn && <span className={s.radioDot} />}
                        </span>
                        <span className={s.rowLabel}>{r.label}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <>
                  <textarea
                    className={s.textarea}
                    maxLength={NOTE_LIMIT}
                    placeholder={selected?.placeholder}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <div className={s.warning}>
                    <Warning className={s.warningIcon} weight="fill" aria-hidden="true" />
                    <p className={s.warningText}>
                      On {endDate}, strategies you invested in through a connected external brokerage will be
                      liquidated, and your external trading connections will be removed.
                    </p>
                  </div>
                </>
              )}
            </div>
          </AutoHeight>
        </div>

        <div className={s.footer}>
          <Button type="button" variant="secondary" fullWidth={false} onClick={onKeep}>
            Keep {planName} plan
          </Button>
          {step === 'reason' ? (
            <Button
              type="button"
              variant="primary"
              fullWidth={false}
              disabled={reason == null}
              onClick={() => {
                setDirection('fwd');
                setStep('details');
              }}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              fullWidth={false}
              onClick={() => onConfirm({ reason: reason ?? 'unknown', note: note.trim() })}
            >
              Confirm cancellation
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
