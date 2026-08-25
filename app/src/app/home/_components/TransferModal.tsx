'use client';

import { Input } from '@/components/Input';
import { AccountSelectorCard, type SelectableAccount } from '@/components/AccountSelectorCard';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { BANK_SELECTABLE, SURMOUNT_GROUPS, SURMOUNT_SELECTABLE, type TransferMode, type TransferStep } from '../_data';
import { fmtAmount, useAnimatedHeight } from '../_helpers';
import { FREQ_OPTIONS, MONTH_SHORT, type FreqOption } from '../saving/_data';
import { sameDay, todayMidnight } from '../saving/_helpers';
import { CalendarPicker } from '../saving/_components/CalendarPicker';
import { Toggle } from './Toggle';
import s from '../page.module.css';

export function TransferModal({ mode, initialStep, onClose }: { mode: TransferMode; initialStep?: TransferStep; onClose: () => void }) {
  const router = useRouter();
  const handleUpdateBank = () => router.push('/onboarding/link-bank?mode=update');
  const [mounted, setMounted] = useState(false);
  // TEMP: figma capture — when initialStep is passed, prefill amount + account so confirm/success render fully
  const [amount, setAmount] = useState(initialStep && initialStep !== 'amount' ? '1000' : '');
  const [step, setStep] = useState<TransferStep>(initialStep ?? 'amount');
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(
    initialStep === 'success' ? new Date() : null,
  );
  const [repeat, setRepeat] = useState(false);
  const [freq, setFreq] = useState<FreqOption>('Bi-weekly');
  const [freqOpen, setFreqOpen] = useState(false);
  const [freqExiting, setFreqExiting] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [dpOpen, setDpOpen] = useState(false);
  const [dpExiting, setDpExiting] = useState(false);
  const [dpPos, setDpPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [selectedAccount, setSelectedAccount] = useState<SelectableAccount | null>(
    initialStep && initialStep !== 'amount' ? SURMOUNT_SELECTABLE : null,
  );

  const freqRef = useRef<HTMLDivElement>(null);
  const dpRef = useRef<HTMLDivElement>(null);
  const startsTriggerRef = useRef<HTMLButtonElement>(null);

  const QUICK_AMOUNTS = [100, 500, 1000, 5000];
  const isWithdrawal = mode === 'withdrawal';
  const transferNoun = isWithdrawal ? 'withdrawal' : 'deposit';
  const transferTitle = isWithdrawal ? 'Withdrawal' : 'Deposit';
  const reviewTitle = isWithdrawal ? 'Confirm withdrawal details' : 'Confirm deposit details';
  const submittingLabel = isWithdrawal ? 'Submitting withdrawal' : 'Submitting deposit';
  const confirmLabel = isWithdrawal ? 'Confirm withdrawal' : 'Confirm deposit';
  const successTitle = isWithdrawal ? 'Withdrawal initiated' : 'Deposit initiated';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close the frequency / date popovers on outside click or Escape
  useEffect(() => {
    function onDown(e: globalThis.MouseEvent) {
      if (freqOpen && !freqExiting && freqRef.current && !freqRef.current.contains(e.target as Node)) {
        setFreqExiting(true);
      }
      if (dpOpen && !dpExiting && dpRef.current && !dpRef.current.contains(e.target as Node) &&
          !startsTriggerRef.current?.contains(e.target as Node)) {
        setDpExiting(true);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (freqOpen && !freqExiting) setFreqExiting(true);
        if (dpOpen && !dpExiting) setDpExiting(true);
      }
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [freqOpen, dpOpen, freqExiting, dpExiting]);

  function startsLabel() {
    const today = todayMidnight();
    if (!startDate || sameDay(startDate, today)) return 'Starts today';
    return `Starts ${MONTH_SHORT[startDate.getMonth()]} ${startDate.getDate()}`;
  }

  const parsedAmount = parseFloat(amount);
  const hasAmount = amount.length > 0 && !isNaN(parsedAmount) && parsedAmount > 0;
  const canContinue = hasAmount && selectedAccount !== null;
  const displayAmount = hasAmount ? fmtAmount(parsedAmount) : '$0.00';

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const submittedTimeStr = submittedAt
    ? 'Today at ' + submittedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase()
    : '';
  const modalSheetRef = useAnimatedHeight<HTMLDivElement>([step, isSubmittingTransfer, repeat]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = () => {
    if (isSubmittingTransfer) return;
    setIsSubmittingTransfer(true);
  };

  useEffect(() => {
    if (!isSubmittingTransfer) return undefined;

    const timeout = window.setTimeout(() => {
      setSubmittedAt(new Date());
      setIsSubmittingTransfer(false);
      setStep('success');
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [isSubmittingTransfer]);

  const ConfirmSelectedRow = () => (
    <div className={s.confirmRowValueWithIcon}>
      <div className={[s.confirmRowIcon, s.confirmRowIconSurmount].join(' ')}>
        <img src={selectedAccount?.logoSrc ?? '/assets/brokers/surmount.png'} alt={selectedAccount?.name ?? ''} />
      </div>
      <span className={s.confirmRowValue}>{selectedAccount?.name ?? '—'}</span>
    </div>
  );

  const ConfirmBankRow = () => (
    <div className={s.confirmRowValueWithIcon}>
      <div className={[s.confirmRowIcon, s.confirmRowIconBank].join(' ')}>
        <img src={BANK_SELECTABLE.logoSrc} alt={BANK_SELECTABLE.name} />
      </div>
      <span className={s.confirmRowValue}>{BANK_SELECTABLE.name}</span>
    </div>
  );

  const SuccessMark = () => (
    <span className={s.successMark} aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="25" />
        <path d="M21.5 32.5 28.5 39.5 43 24.5" />
      </svg>
    </span>
  );

  const CloseBtn = () => (
    <button type="button" className={s.modalCloseBtn} onClick={onClose} aria-label="Close">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    </button>
  );

  if (!mounted) return null;

  return createPortal(
    <>
    <div className={s.modalOverlay} onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label={transferTitle}>
      <div ref={modalSheetRef} className={s.modalSheet}>

        {/* ── Step 1: Amount + From/To ── */}
        {step === 'amount' && (
          <div key={`${mode}-amount`} className={s.modalStepContent}>
            <div className={s.modalHeader}>
              <span className={s.modalTitle}>{transferTitle}</span>
              <CloseBtn />
            </div>
            <div className={s.modalBody}>
              {/* Amount */}
              <div className={s.amountSection}>
                <Input
                  size="lg"
                  label="Amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  iconLeading={
                    <span style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--font-size-text-xl)', fontWeight: 500, color: 'var(--color-fg-primary-900)', letterSpacing: '-0.5px', lineHeight: 1 }}>$</span>
                  }
                />
                <div className={s.quickAmounts}>
                  {QUICK_AMOUNTS.map((amt) => {
                    const label = amt >= 1000 ? `$${amt / 1000}k` : `$${amt}`;
                    const active = amount === String(amt);
                    return (
                      <button key={amt} type="button"
                        className={[s.quickAmountBtn, active ? s.quickAmountBtnActive : ''].filter(Boolean).join(' ')}
                        onClick={() => setAmount(String(amt))}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {!isWithdrawal && (
                <div className={s.repeatCard}>
                  <div className={s.repeatRow}>
                    <div className={s.repeatToggleGroup}>
                      <span className={s.repeatLabel}>Repeat</span>
                      <Toggle on={repeat} onChange={setRepeat} />
                    </div>

                    <div className={s.repeatControls} data-visible={repeat ? 'true' : 'false'}>
                      <button
                        ref={startsTriggerRef}
                        type="button"
                        className={s.startsBtn}
                        onClick={() => {
                          if (dpOpen) {
                            setDpExiting(true);
                          } else {
                            if (startsTriggerRef.current) {
                              const r = startsTriggerRef.current.getBoundingClientRect();
                              setDpPos({ top: r.bottom + 8, left: r.left + r.width / 2 - 145 });
                            }
                            setDpOpen(true);
                            setDpExiting(false);
                          }
                        }}
                      >
                        {startsLabel()}
                        <svg viewBox="0 0 256 256" fill="currentColor" style={{ width: 14, height: 14, color: 'rgba(10,13,18,0.35)', flexShrink: 0 }}>
                          <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160,136,75.31,152.69,92,68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188,164,103.31,180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"/>
                        </svg>
                      </button>

                      <div ref={freqRef} style={{ position: 'relative' }}>
                        <button
                          type="button"
                          className={s.freqPill}
                          aria-expanded={freqOpen && !freqExiting}
                          aria-haspopup="listbox"
                          onClick={() => {
                            if (freqOpen) setFreqExiting(true);
                            else { setFreqOpen(true); setFreqExiting(false); }
                          }}
                        >
                          {freq}
                          <svg viewBox="0 0 14 14" style={{ width: 14, height: 14, stroke: 'rgba(10,13,18,0.4)', fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', flexShrink: 0 }}>
                            <polyline points="3 5 7 9 11 5"/>
                          </svg>
                        </button>
                        {freqOpen && (
                          <div
                            className={freqExiting ? s.popoverExit : s.popover}
                            role="listbox"
                            onAnimationEnd={() => { if (freqExiting) { setFreqOpen(false); setFreqExiting(false); } }}
                            style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 50, background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-primary)', borderRadius: 'var(--radius-xl)', padding: 4, minWidth: 150, boxShadow: '0 8px 24px rgba(10,13,18,0.12)' }}
                          >
                            {FREQ_OPTIONS.map(opt => (
                              <button
                                key={opt} type="button" role="option" aria-selected={opt === freq}
                                onClick={() => { setFreq(opt); setFreqExiting(true); }}
                                className={s.freqOption}
                              >
                                {opt}
                                {opt === freq && (
                                  <svg viewBox="0 0 256 256" fill="currentColor" style={{ width: 14, height: 14, flexShrink: 0 }}>
                                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>
                                  </svg>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <hr className={s.sectionDivider} />

              {/* From */}
              <div className={s.transferSection}>
                <span className={s.transferSectionLabel}>From</span>
                {isWithdrawal ? (
                  <AccountSelectorCard
                    selected={selectedAccount}
                    onChange={setSelectedAccount}
                    groups={SURMOUNT_GROUPS}
                  />
                ) : (
                  <AccountSelectorCard
                    selected={BANK_SELECTABLE}
                    readOnly
                    trailingAction={{ label: 'Update', onClick: handleUpdateBank }}
                  />
                )}
              </div>

              {/* Arrow */}
              <div className={s.arrowDivider} aria-hidden="true">
                <div className={s.arrowCircle}>
                  <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                    <path d="M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z"/>
                  </svg>
                </div>
              </div>

              {/* To */}
              <div className={s.transferSection}>
                <span className={s.transferSectionLabel}>To</span>
                {isWithdrawal ? (
                  <AccountSelectorCard
                    selected={BANK_SELECTABLE}
                    readOnly
                    trailingAction={{ label: 'Update', onClick: handleUpdateBank }}
                  />
                ) : (
                  <AccountSelectorCard
                    selected={selectedAccount}
                    onChange={setSelectedAccount}
                    groups={SURMOUNT_GROUPS}
                  />
                )}
              </div>

              <button type="button" className={s.depositCta} onClick={() => setStep('confirm')} disabled={!canContinue}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Review details ── */}
        {step === 'confirm' && (
          <div key={`${mode}-confirm`} className={s.modalStepContent}>
            <div className={[s.modalHeader, s.confirmModalHeader].join(' ')}>
              <span className={[s.modalTitle, s.confirmModalTitle].join(' ')}>{reviewTitle}</span>
              <CloseBtn />
            </div>
            <div className={[s.modalBody, s.confirmModalBody].join(' ')}>
              <div className={s.confirmDetailList}>
                <div className={s.confirmDetailRow}>
                  <span className={s.confirmRowLabel}>From</span>
                  {isWithdrawal ? <ConfirmSelectedRow /> : <ConfirmBankRow />}
                </div>
                <div className={s.confirmDetailRow}>
                  <span className={s.confirmRowLabel}>To</span>
                  {isWithdrawal ? <ConfirmBankRow /> : <ConfirmSelectedRow />}
                </div>
                <div className={s.confirmDetailDivider} />
                <div className={s.confirmDetailRow}>
                  <span className={s.confirmRowLabel}>Date</span>
                  <span className={s.confirmRowValue}>{todayStr}</span>
                </div>
                <div className={s.confirmDetailRow}>
                  <span className={s.confirmRowLabel}>Processing</span>
                  <span className={s.confirmRowValue}>1–4 business days</span>
                </div>
                {!isWithdrawal && repeat && (
                  <>
                    <div className={s.confirmDetailRow}>
                      <span className={s.confirmRowLabel}>Frequency</span>
                      <span className={s.confirmRowValue}>{freq}</span>
                    </div>
                    <div className={s.confirmDetailRow}>
                      <span className={s.confirmRowLabel}>Starts</span>
                      <span className={s.confirmRowValue}>{startsLabel().replace('Starts ', '')}</span>
                    </div>
                  </>
                )}
                <div className={s.confirmDetailDivider} />
                <div className={s.confirmDetailRow}>
                  <span className={s.confirmRowLabel}>Amount</span>
                  <span className={[s.confirmRowValue, s.confirmRowValueAmount].join(' ')}>{displayAmount}</span>
                </div>
              </div>

              <p className={s.depositDisclaimer}>
                By confirming, you authorize Surmount to initiate this {transferNoun}. Funds may take 1–4 business days to settle.
              </p>

              <div className={s.confirmActionRow}>
                <button type="button" className={s.confirmBackCta} onClick={() => setStep('amount')} disabled={isSubmittingTransfer}>
                  Back
                </button>
                <button
                  type="button"
                  className={[s.depositCta, s.confirmSubmitCta, isSubmittingTransfer ? s.depositCtaLoading : ''].filter(Boolean).join(' ')}
                  onClick={handleSubmit}
                  disabled={isSubmittingTransfer}
                  aria-busy={isSubmittingTransfer}
                >
                  {isSubmittingTransfer && <span className={s.buttonSpinner} aria-hidden="true" />}
                  {isSubmittingTransfer ? submittingLabel : confirmLabel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Success ── */}
        {step === 'success' && (
          <div key={`${mode}-success`} className={s.modalStepContent}>
            <div className={s.modalHeader} style={{ justifyContent: 'flex-end' }}>
              <CloseBtn />
            </div>
            <div className={[s.modalBody, s.confirmModalBody].join(' ')}>
              <div className={s.successBody}>
                <SuccessMark />
                <h2 className={s.successTitle}>{successTitle}</h2>
                <span className={s.successAmount}>{displayAmount}</span>
                <span className={s.successTime}>{submittedTimeStr}</span>

                <p className={[s.depositDisclaimer, s.successDisclaimer].join(' ')}>
                  {isWithdrawal
                    ? 'Funds may take 1–4 business days to settle, and you can track the withdrawal from Activity.'
                    : 'Funds may take 1–4 business days to settle, and you can track the deposit from Activity.'}
                </p>

                <button type="button" className={s.depositCta} onClick={onClose}>
                  Done
                </button>
                <a className={s.depositSecondaryCta} href={`/activity?filter=${transferNoun}`}>
                  View details
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
    {dpOpen && (
      <div
        ref={dpRef}
        className={dpExiting ? s.popoverLeftExit : s.popoverLeft}
        onAnimationEnd={() => { if (dpExiting) { setDpOpen(false); setDpExiting(false); } }}
        style={{ position: 'fixed', top: dpPos.top, left: dpPos.left, zIndex: 10004, background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-primary)', borderRadius: 'var(--radius-xl)', padding: 16, width: 290, boxShadow: '0 8px 32px rgba(10,13,18,0.14)' }}
      >
        <CalendarPicker
          selected={startDate}
          onSelect={d => { setStartDate(d); setDpExiting(true); }}
        />
      </div>
    )}
    </>,
    document.body
  );
}
