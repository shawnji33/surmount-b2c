'use client';

import { Button } from '@/components/Button';
import { AccountSelectorCard, type SelectableAccount } from '@/components/AccountSelectorCard';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  FREQ_OPTIONS,
  HYCA_SELECTABLE,
  MONTH_SHORT,
  TRANSFER_ACCOUNT_GROUPS,
  type FreqOption,
  type TransferStep,
} from '../_data';
import { fmtCurrency, sameDay, todayMidnight, useAnimatedHeight } from '../_helpers';
import { CalendarPicker } from './CalendarPicker';
import { Toggle } from './Toggle';
import s from '../page.module.css';

export function MoneyMovementModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<TransferStep>('amount');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);
  const [repeat, setRepeat] = useState(false);
  const [freq, setFreq] = useState<FreqOption>('Bi-weekly');
  const [freqOpen, setFreqOpen] = useState(false);
  const [freqExiting, setFreqExiting] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [dpOpen, setDpOpen] = useState(false);
  const [dpExiting, setDpExiting] = useState(false);
  const [dpPos, setDpPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [fromAccount, setFromAccount] = useState<SelectableAccount | null>(HYCA_SELECTABLE);
  const [toAccount, setToAccount] = useState<SelectableAccount | null>(null);

  const freqRef = useRef<HTMLDivElement>(null);
  const dpRef = useRef<HTMLDivElement>(null);
  const startsTriggerRef = useRef<HTMLButtonElement>(null);

  const modalTitle = 'Transfer money';
  const reviewTitle = 'Confirm transfer details';
  const confirmLabel = 'Confirm transfer';
  const submittingLabel = 'Submitting transfer';
  const successTitle = 'Transfer initiated';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isSubmitting) return undefined;

    const timeout = window.setTimeout(() => {
      setSubmittedAt(new Date());
      setIsSubmitting(false);
      setStep('success');
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [isSubmitting]);

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
  const hasAmount = amount.length > 0 && !Number.isNaN(parsedAmount) && parsedAmount > 0;
  const hasTransferAccounts = fromAccount !== null && toAccount !== null && fromAccount.id !== toAccount.id;
  const canContinue = hasAmount && hasTransferAccounts;
  const modalSheetRef = useAnimatedHeight<HTMLDivElement>([
    step,
    isSubmitting,
    fromAccount?.id,
    toAccount?.id,
    repeat,
  ]);
  const displayAmount = hasAmount ? fmtCurrency(parsedAmount) : '$0.00';
  const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const submittedTimeStr = submittedAt
    ? `Today at ${submittedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase()}`
    : '';
  const toGroups = TRANSFER_ACCOUNT_GROUPS.map(group => ({
    ...group,
    accounts: group.accounts.filter(account => account.id !== fromAccount?.id),
  })).filter(group => group.accounts.length > 0);
  const fromGroups = TRANSFER_ACCOUNT_GROUPS.map(group => ({
    ...group,
    accounts: group.accounts.filter(account => account.id !== toAccount?.id),
  })).filter(group => group.accounts.length > 0);

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
  };

  const handleFromChange = (account: SelectableAccount) => {
    setFromAccount(account);
    if (toAccount?.id === account.id) setToAccount(null);
  };

  const handleToChange = (account: SelectableAccount) => {
    setToAccount(account);
    if (fromAccount?.id === account.id) setFromAccount(null);
  };

  const handleSwapAccounts = () => {
    if (!fromAccount || !toAccount) return;
    setFromAccount(toAccount);
    setToAccount(fromAccount);
  };

  const ConfirmAcctRow = ({ account }: { account: SelectableAccount | null }) => {
    const isBank = account?.id === 'chase';
    return (
      <div className={s.confirmRowValueWithIcon}>
        <div className={[s.confirmRowIcon, isBank ? s.confirmRowIconBank : s.confirmRowIconSurmount].join(' ')}>
          <img src={account?.logoSrc ?? '/assets/brokers/surmount.png'} alt={account?.name ?? ''} />
        </div>
        <span className={s.confirmRowValue}>{account?.name ?? '—'}</span>
      </div>
    );
  };

  const SuccessMark = () => (
    <span className={s.successMark} aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="25" />
        <path d="M21.5 32.5 28.5 39.5 43 24.5" />
      </svg>
    </span>
  );

  const CloseButton = () => (
    <button type="button" className={s.modalCloseBtn} onClick={onClose} aria-label="Close">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    </button>
  );

  if (!mounted) return null;

  return createPortal(
    <>
    <div className={s.modalOverlay} onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label={modalTitle}>
      <div ref={modalSheetRef} className={s.modalSheet}>
        {step === 'amount' ? (
          <div key="transfer-amount" className={s.modalStepContent}>
            <div className={s.modalHeader}>
              <span className={s.modalTitle}>{modalTitle}</span>
              <CloseButton />
            </div>

            <div className={s.modalBody}>
              <div className={s.transferSection}>
                <span className={s.transferSectionLabel}>From</span>
                <AccountSelectorCard
                  selected={fromAccount}
                  onChange={handleFromChange}
                  groups={fromGroups}
                />
              </div>

              <div className={s.arrowDivider} aria-hidden="true">
                <button type="button" className={s.arrowCircle} onClick={handleSwapAccounts} disabled={!fromAccount || !toAccount} aria-label="Swap transfer accounts">
                  <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                    <path d="M213.66,181.66l-32,32a8,8,0,0,1-11.32-11.32L188.69,184H48a8,8,0,0,1,0-16H188.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,213.66,181.66ZM74.34,117.66a8,8,0,0,0,11.32-11.32L67.31,88H208a8,8,0,0,0,0-16H67.31L85.66,53.66A8,8,0,0,0,74.34,42.34l-32,32a8,8,0,0,0,0,11.32Z" />
                  </svg>
                </button>
              </div>

              <div className={s.transferSection}>
                <span className={s.transferSectionLabel}>To</span>
                <AccountSelectorCard
                  selected={toAccount}
                  onChange={handleToChange}
                  groups={toGroups}
                />
              </div>

              {hasTransferAccounts ? (
                <div className={s.transferDetailsReveal}>
                  <hr className={s.sectionDivider} />

                  <div className={s.amountSection}>
                    <label className={s.transferAmountField}>
                      <span className={s.transferAmountLabel}>Amount</span>
                      <span className={s.transferAmountInputRow}>
                        <span className={s.amountCurrencySymbol}>$</span>
                        <input
                          className={s.transferAmountInput}
                          type="text"
                          inputMode="decimal"
                          placeholder="0.00"
                          value={amount}
                          onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ''))}
                          aria-label="Amount"
                        />
                      </span>
                    </label>
                  </div>

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

                  <button type="button" className={s.depositCta} onClick={() => setStep('confirm')} disabled={!canContinue}>
                    Continue
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 'confirm' ? (
          <div key="transfer-confirm" className={s.modalStepContent}>
            <div className={[s.modalHeader, s.confirmModalHeader].join(' ')}>
              <span className={[s.modalTitle, s.confirmModalTitle].join(' ')}>{reviewTitle}</span>
              <CloseButton />
            </div>

            <div className={[s.modalBody, s.confirmModalBody].join(' ')}>
              <div className={s.confirmDetailList}>
                <div className={s.confirmDetailRow}>
                  <span className={s.confirmRowLabel}>From</span>
                  <ConfirmAcctRow account={fromAccount} />
                </div>
                <div className={s.confirmDetailRow}>
                  <span className={s.confirmRowLabel}>To</span>
                  <ConfirmAcctRow account={toAccount} />
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
                {repeat && (
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
                By confirming, you authorize Surmount to initiate this transfer. Funds may take 1–4 business days to settle.
              </p>

              <div className={s.confirmActionRow}>
                <Button variant="secondary" onClick={() => setStep('amount')} disabled={isSubmitting}>
                  Back
                </Button>
                <button
                  type="button"
                  className={[s.depositCta, s.confirmSubmitCta, isSubmitting ? s.depositCtaLoading : ''].filter(Boolean).join(' ')}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? <span className={s.buttonSpinner} aria-hidden="true" /> : null}
                  {isSubmitting ? submittingLabel : confirmLabel}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {step === 'success' ? (
          <div key="transfer-success" className={s.modalStepContent}>
            <div className={s.modalHeader} style={{ justifyContent: 'flex-end' }}>
              <CloseButton />
            </div>
            <div className={[s.modalBody, s.confirmModalBody].join(' ')}>
              <div className={s.successBody}>
                <SuccessMark />
                <h2 className={s.successTitle}>{successTitle}</h2>
                <span className={s.successAmount}>{displayAmount}</span>
                <span className={s.successTime}>{submittedTimeStr}</span>
                <p className={[s.depositDisclaimer, s.successDisclaimer].join(' ')}>
                  Funds may take 1–4 business days to settle, and you can track the transfer from Activity.
                </p>
                <button type="button" className={s.depositCta} onClick={onClose}>
                  Done
                </button>
                <a className={s.depositSecondaryCta} href="/activity">
                  View details
                </a>
              </div>
            </div>
          </div>
        ) : null}
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
