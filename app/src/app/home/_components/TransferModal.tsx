'use client';

import { Input } from '@/components/Input';
import { AccountSelectorCard, type SelectableAccount } from '@/components/AccountSelectorCard';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BANK_SELECTABLE, SURMOUNT_GROUPS, type TransferMode, type TransferStep } from '../_data';
import { fmtAmount, useAnimatedHeight } from '../_helpers';
import { Toggle } from './Toggle';
import s from '../page.module.css';

export function TransferModal({ mode, onClose }: { mode: TransferMode; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<TransferStep>('amount');
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);
  const [repeat, setRepeat] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SelectableAccount | null>(null);
  const QUICK_AMOUNTS = [100, 500, 1000, 5000];
  const isWithdrawal = mode === 'withdrawal';
  const transferNoun = isWithdrawal ? 'withdrawal' : 'deposit';
  const transferTitle = isWithdrawal ? 'Withdrawal' : 'Add money';
  const reviewTitle = isWithdrawal ? 'Confirm withdrawal details' : 'Confirm add money details';
  const submittingLabel = isWithdrawal ? 'Submitting withdrawal' : 'Adding money';
  const confirmLabel = isWithdrawal ? 'Confirm withdrawal' : 'Confirm add money';
  const successTitle = isWithdrawal ? 'Withdrawal initiated' : 'Money added';

  useEffect(() => {
    setMounted(true);
  }, []);

  const parsedAmount = parseFloat(amount);
  const hasAmount = amount.length > 0 && !isNaN(parsedAmount) && parsedAmount > 0;
  const canContinue = hasAmount && selectedAccount !== null;
  const displayAmount = hasAmount ? fmtAmount(parsedAmount) : '$0.00';

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const submittedTimeStr = submittedAt
    ? 'Today at ' + submittedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase()
    : '';
  const modalSheetRef = useAnimatedHeight<HTMLDivElement>([step, isSubmittingTransfer]);

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
                  <AccountSelectorCard selected={BANK_SELECTABLE} readOnly />
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
                  <AccountSelectorCard selected={BANK_SELECTABLE} readOnly />
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
    </div>,
    document.body
  );
}
