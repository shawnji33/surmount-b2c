'use client';

import { ClockCountdown, ArrowsCounterClockwise, GearSix } from '@phosphor-icons/react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Input } from '@/components/Input';
import { TransactionList, type TransactionGroup } from '@/components/transactions/TransactionList';
import { AccountSelectorCard, type SelectableAccount } from '@/components/AccountSelectorCard';
import { useEffect, useLayoutEffect, useRef, useState, type DependencyList, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import s from './page.module.css';

// ─── Data ────────────────────────────────────────────────────────────────────

type TransferMode = 'deposit' | 'withdrawal';
type TransferStep = 'amount' | 'confirm' | 'success';

const CONNECTED_BANK = {
  name: 'Chase Total Checking',
  institution: 'JPMorgan Chase',
  type: 'Checking',
  last4: '4823',
};

const HYCA_ACCOUNT = {
  name: 'High Yield Cash',
  available: 351242.54,
};

const SURMOUNT_ACCOUNT = {
  name: 'Surmount Investing',
  available: 10432.18,
};

const HYCA_SELECTABLE: SelectableAccount = {
  id: 'hyca',
  name: 'High Yield Cash',
  meta: `Available $${HYCA_ACCOUNT.available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  logoSrc: '/assets/brokers/surmount.png',
};

const SURMOUNT_SELECTABLE: SelectableAccount = {
  id: 'surmount-investing',
  name: SURMOUNT_ACCOUNT.name,
  meta: `Available $${SURMOUNT_ACCOUNT.available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  logoSrc: '/assets/illustrations/surmount-logo-mark-blue.png',
};

const BANK_SELECTABLE: SelectableAccount = {
  id: 'chase',
  name: CONNECTED_BANK.name,
  meta: `${CONNECTED_BANK.type} · ${CONNECTED_BANK.last4}`,
  logoSrc: '/assets/illustrations/bank-chase.png',
};

const SURMOUNT_GROUPS = [
  { label: 'Investing account', accounts: [SURMOUNT_SELECTABLE] },
  { label: 'Saving account', accounts: [HYCA_SELECTABLE] },
];

const TX_DATA: TransactionGroup[] = [
  {
    date: 'May 28, 2026',
    items: [
      {
        id: 'tx-p1',
        kind: 'deposit',
        name: 'Deposit',
        meta: 'From Chase · Total Checking',
        amount: '+$2,500.00',
        amountTone: 'positive',
        canCancel: true,
        submittedAt: '2026-05-28T09:12:00-04:00',
        summaryBadge: { label: 'Pending', tone: 'warning' },
        details: [
          { label: 'Status', value: 'Pending', tone: 'warning' },
          { label: 'From', value: 'Chase · Total Checking' },
          { label: 'To', value: 'Surmount Cash' },
          { label: 'Submitted', value: 'May 28, 2026 · 9:12 AM' },
          { label: 'Est. completion', value: 'Jun 1, 2026' },
          { label: 'Method', value: 'ACH transfer' },
        ],
      },
      {
        id: 'tx-p2',
        kind: 'transfer-out',
        name: 'Withdrawal',
        meta: 'To Chase · Total Checking',
        amount: '−$800.00',
        canCancel: true,
        submittedAt: '2026-05-28T08:30:00-04:00',
        summaryBadge: { label: 'Pending', tone: 'warning' },
        details: [
          { label: 'Status', value: 'Pending', tone: 'warning' },
          { label: 'From', value: 'Surmount Cash' },
          { label: 'To', value: 'Chase · Total Checking' },
          { label: 'Submitted', value: 'May 28, 2026 · 8:30 AM' },
          { label: 'Est. completion', value: 'Jun 1, 2026' },
          { label: 'Method', value: 'ACH transfer' },
        ],
      },
      {
        id: 'tx-p3',
        kind: 'deposit',
        name: 'Deposit',
        meta: 'From Robinhood · Individual',
        amount: '+$5,000.00',
        amountTone: 'positive',
        canCancel: true,
        submittedAt: '2026-05-27T16:45:00-04:00',
        summaryBadge: { label: 'Pending', tone: 'warning' },
        details: [
          { label: 'Status', value: 'Pending', tone: 'warning' },
          { label: 'From', value: 'Robinhood · Individual' },
          { label: 'To', value: 'Surmount Cash' },
          { label: 'Submitted', value: 'May 27, 2026 · 4:45 PM' },
          { label: 'Est. completion', value: 'May 31, 2026' },
          { label: 'Method', value: 'Standard transfer' },
        ],
      },
      {
        id: 'tx-r1',
        kind: 'deposit',
        name: 'Recurring deposit',
        meta: 'From Chase · Total Checking',
        amount: '+$500.00',
        amountTone: 'positive',
        canCancel: true,
        summaryBadge: { label: 'Scheduled', tone: 'neutral' },
        details: [
          { label: 'Status', value: 'Scheduled', tone: 'neutral' },
          { label: 'From', value: 'Chase · Total Checking' },
          { label: 'To', value: 'Surmount Cash' },
          { label: 'Frequency', value: 'Weekly' },
          { label: 'Next date', value: 'Jun 4, 2026' },
        ],
      },
      {
        id: 'tx-r2',
        kind: 'deposit',
        name: 'Recurring deposit',
        meta: 'From Chase · Total Checking',
        amount: '+$1,000.00',
        amountTone: 'positive',
        canCancel: true,
        summaryBadge: { label: 'Scheduled', tone: 'neutral' },
        details: [
          { label: 'Status', value: 'Scheduled', tone: 'neutral' },
          { label: 'From', value: 'Chase · Total Checking' },
          { label: 'To', value: 'Surmount Cash' },
          { label: 'Frequency', value: 'Monthly' },
          { label: 'Next date', value: 'Jun 1, 2026' },
        ],
      },
    ],
  },
  {
    date: 'April 26, 2026',
    items: [
      {
        id: 'tx-1',
        kind: 'transfer-out',
        name: 'Transfer out',
        meta: 'To Robinhood',
        amount: '−$500.00',
        details: [
          { label: 'From', value: 'Surmount Cash' },
          { label: 'To', value: 'Robinhood · Individual' },
          { label: 'Status', value: 'Completed', tone: 'success' },
          { label: 'Date', value: 'April 26, 2026' },
          { label: 'Method', value: 'Standard transfer' },
        ],
      },
      {
        id: 'tx-2',
        kind: 'deposit',
        name: 'Deposit',
        meta: 'From Chase · 360 Checking',
        amount: '+$1,200.00',
        amountTone: 'positive',
        details: [
          { label: 'From', value: 'Chase · 360 Checking' },
          { label: 'To', value: 'Surmount Cash' },
          { label: 'Status', value: 'Completed', tone: 'success' },
          { label: 'Date', value: 'April 26, 2026' },
          { label: 'Method', value: 'Direct deposit' },
        ],
      },
    ],
  },
  {
    date: 'April 1, 2026',
    items: [
      {
        id: 'tx-3',
        kind: 'interest',
        name: 'Interest',
        meta: 'April monthly accrual',
        amount: '+$24.35',
        amountTone: 'positive',
        details: [
          { label: 'From', value: 'Surmount Cash' },
          { label: 'To', value: 'Surmount Cash' },
          { label: 'Status', value: 'Completed', tone: 'success' },
          { label: 'Date', value: 'April 1, 2026' },
          { label: 'APY', value: '4.56%' },
        ],
      },
    ],
  },
  {
    date: 'March 28, 2026',
    items: [
      {
        id: 'tx-4',
        kind: 'transfer-out',
        name: 'Transfer out',
        meta: 'To Robinhood',
        amount: '−$2,000.00',
        details: [
          { label: 'From', value: 'Surmount Cash' },
          { label: 'To', value: 'Robinhood · Individual' },
          { label: 'Status', value: 'Completed', tone: 'success' },
          { label: 'Date', value: 'March 28, 2026' },
          { label: 'Method', value: 'Standard transfer' },
        ],
      },
      {
        id: 'tx-5',
        kind: 'deposit',
        name: 'Deposit',
        meta: 'From Robinhood',
        amount: '+$2,500.00',
        amountTone: 'positive',
        details: [
          { label: 'From', value: 'Robinhood · Individual' },
          { label: 'To', value: 'Surmount Cash' },
          { label: 'Status', value: 'Completed', tone: 'success' },
          { label: 'Date', value: 'March 28, 2026' },
          { label: 'Method', value: 'ACH transfer' },
        ],
      },
    ],
  },
  {
    date: 'March 1, 2026',
    items: [
      {
        id: 'tx-6',
        kind: 'interest',
        name: 'Interest',
        meta: 'March monthly accrual',
        amount: '+$22.18',
        amountTone: 'positive',
        details: [
          { label: 'From', value: 'Surmount Cash' },
          { label: 'To', value: 'Surmount Cash' },
          { label: 'Status', value: 'Completed', tone: 'success' },
          { label: 'Date', value: 'March 1, 2026' },
          { label: 'APY', value: '4.54%' },
        ],
      },
    ],
  },
];

function fmtCurrency(value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Recurring helpers ─────────────────────────────────────────────────────────

const FREQ_OPTIONS = ['Monthly', 'Bi-weekly', 'Weekly'] as const;
type FreqOption = typeof FREQ_OPTIONS[number];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_LONG  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEKDAYS    = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function todayMidnight() {
  const d = new Date(); d.setHours(0,0,0,0); return d;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}
function isWeekend(d: Date) { return d.getDay() === 0 || d.getDay() === 6; }

function useAnimatedHeight<T extends HTMLElement>(dependencies: DependencyList) {
  const ref = useRef<T | null>(null);
  const previousHeight = useRef<number | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const nextHeight = element.getBoundingClientRect().height;
    const lastHeight = previousHeight.current;
    previousHeight.current = nextHeight;

    if (
      lastHeight === null ||
      Math.abs(lastHeight - nextHeight) < 1 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;
    const originalTransition = element.style.transition;
    const originalWillChange = element.style.willChange;
    let isFinished = false;

    const finish = () => {
      if (isFinished) return;
      isFinished = true;
      element.style.height = originalHeight;
      element.style.overflow = originalOverflow;
      element.style.transition = originalTransition;
      element.style.willChange = originalWillChange;
      element.removeEventListener('transitionend', handleTransitionEnd);
      window.clearTimeout(fallback);
    };

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.target === element && event.propertyName === 'height') {
        finish();
      }
    };

    element.style.height = `${lastHeight}px`;
    element.style.overflow = 'hidden';
    element.style.willChange = 'height';
    element.style.transition = 'none';

    void element.offsetHeight;

    const frame = window.requestAnimationFrame(() => {
      element.addEventListener('transitionend', handleTransitionEnd);
      element.style.transition = 'height 240ms cubic-bezier(0.77, 0, 0.175, 1)';
      element.style.height = `${nextHeight}px`;
    });
    const fallback = window.setTimeout(finish, 320);

    return () => {
      window.cancelAnimationFrame(frame);
      finish();
    };
  }, dependencies);

  return ref;
}

function MoneyMovementModal({ mode, onClose, initialAccount = null }: { mode: TransferMode; onClose: () => void; initialAccount?: SelectableAccount | null }) {
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
  const [selectedAccount, setSelectedAccount] = useState<SelectableAccount | null>(initialAccount);

  const freqRef = useRef<HTMLDivElement>(null);
  const dpRef = useRef<HTMLDivElement>(null);
  const startsTriggerRef = useRef<HTMLButtonElement>(null);

  const quickAmounts = [100, 500, 1000, 5000];
  const isWithdrawal = mode === 'withdrawal';
  const transferNoun = isWithdrawal ? 'withdrawal' : 'deposit';
  const modalTitle = isWithdrawal ? 'Withdraw' : 'Add money';
  const reviewTitle = isWithdrawal ? 'Confirm withdrawal details' : 'Confirm add money details';
  const confirmLabel = isWithdrawal ? 'Confirm withdrawal' : 'Confirm add money';
  const submittingLabel = isWithdrawal ? 'Submitting withdrawal' : 'Adding money';
  const successTitle = isWithdrawal ? 'Withdrawal initiated' : 'Money added';
  const modalSheetRef = useAnimatedHeight<HTMLDivElement>([step, isSubmitting]);

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
  const canContinue = hasAmount && selectedAccount !== null;
  const displayAmount = hasAmount ? fmtCurrency(parsedAmount) : '$0.00';
  const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const submittedTimeStr = submittedAt
    ? `Today at ${submittedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase()}`
    : '';

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
  };

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
          <div key={`${mode}-amount`} className={s.modalStepContent}>
            <div className={s.modalHeader}>
              <span className={s.modalTitle}>{modalTitle}</span>
              <CloseButton />
            </div>

            <div className={s.modalBody}>
              <div className={s.amountSection}>
                <Input
                  size="lg"
                  label="Amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ''))}
                  iconLeading={
                    <span className={s.amountCurrencySymbol}>$</span>
                  }
                />
                <div className={s.quickAmounts}>
                  {quickAmounts.map((quickAmount) => {
                    const label = quickAmount >= 1000 ? `$${quickAmount / 1000}k` : `$${quickAmount}`;
                    return (
                      <button
                        key={quickAmount}
                        type="button"
                        className={[s.quickAmountBtn, amount === String(quickAmount) ? s.quickAmountBtnActive : ''].filter(Boolean).join(' ')}
                        onClick={() => setAmount(String(quickAmount))}
                      >
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: repeat ? 1 : 0, pointerEvents: repeat ? 'all' : 'none', transition: 'opacity 220ms ease' }}>
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

              <div className={s.arrowDivider} aria-hidden="true">
                <div className={s.arrowCircle}>
                  <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                    <path d="M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z" />
                  </svg>
                </div>
              </div>

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
        ) : null}

        {step === 'confirm' ? (
          <div key={`${mode}-confirm`} className={s.modalStepContent}>
            <div className={[s.modalHeader, s.confirmModalHeader].join(' ')}>
              <span className={[s.modalTitle, s.confirmModalTitle].join(' ')}>{reviewTitle}</span>
              <CloseButton />
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
                {repeat && !isWithdrawal && (
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
                <button type="button" className={s.confirmBackCta} onClick={() => setStep('amount')} disabled={isSubmitting}>
                  Back
                </button>
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
          <div key={`${mode}-success`} className={s.modalStepContent}>
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
                  Funds may take 1–4 business days to settle, and you can track the {transferNoun} from Activity.
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

// ─── Page ─────────────────────────────────────────────────────────────────────

type SavingFilter = 'pending' | 'recurring' | null;

function filterGroups(filter: SavingFilter) {
  if (!filter) return TX_DATA;
  return TX_DATA.map(group => ({
    ...group,
    items: group.items.filter(item =>
      filter === 'pending'
        ? item.summaryBadge?.tone === 'warning'
        : item.summaryBadge?.label === 'Scheduled',
    ),
  })).filter(group => group.items.length > 0);
}

export default function SavingPage() {
  const [interestTooltipOpen, setInterestTooltipOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SavingFilter>(null);
  const [transferMode, setTransferMode] = useState<TransferMode | null>(null);
  const [transferInitialAccount, setTransferInitialAccount] = useState<SelectableAccount | null>(null);

  function openDeposit(prefill: SelectableAccount | null) {
    setTransferInitialAccount(prefill);
    setTransferMode('deposit');
  }

  function openWithdrawal(prefill: SelectableAccount | null) {
    setTransferInitialAccount(prefill);
    setTransferMode('withdrawal');
  }

  return (
    <main className={s.main}>
      <DashboardHeader
        title="Good morning, Logan"
        onDeposit={() => openDeposit(null)}
        onWithdraw={() => openWithdrawal(null)}
      />

      <div className={s.savingContent}>
        <div className={s.pageLayout}>

          {/* ── Left column ── */}
          <div className={s.leftCol}>
            <div className={s.balanceHeader}>
              <p className={s.balanceValue}>$351,242.54</p>
              <button
                type="button"
                className={s.sweepIndicator}
                onClick={() => { /* TODO: open sweep settings panel */ }}
                aria-label="Open idle cash sweep settings"
              >
                <span className={s.sweepDot} aria-hidden="true" />
                <span className={s.sweepLabel}>Idle cash sweep on</span>
              </button>
            </div>

            <div className={s.pendingRow}>
              <button
                type="button"
                className={[s.pendingCard, activeFilter === 'pending' ? s.pendingCardActive : ''].filter(Boolean).join(' ')}
                onClick={() => setActiveFilter(f => f === 'pending' ? null : 'pending')}
              >
                <span className={[s.pendingIconCircle, s.pendingIconWarning].join(' ')}>
                  <ClockCountdown size={16} weight="regular" color="#c05221" />
                </span>
                <span className={s.pendingCardInfo}>
                  <span className={s.pendingCardTitle}>Pending transfers</span>
                  <span className={s.pendingCardMeta}>3 transactions</span>
                </span>
              </button>
              <button
                type="button"
                className={[s.pendingCard, activeFilter === 'recurring' ? s.pendingCardActive : ''].filter(Boolean).join(' ')}
                onClick={() => setActiveFilter(f => f === 'recurring' ? null : 'recurring')}
              >
                <span className={[s.pendingIconCircle, s.pendingIconBrand].join(' ')}>
                  <ArrowsCounterClockwise size={16} weight="regular" color="#3757be" />
                </span>
                <span className={s.pendingCardInfo}>
                  <span className={s.pendingCardTitle}>Recurring deposits</span>
                  <span className={s.pendingCardMeta}>2 transactions</span>
                </span>
              </button>
            </div>

            <TransactionList groups={filterGroups(activeFilter)} />
          </div>

          {/* ── Right column ── */}
          <aside className={s.rightCol}>

            <div className={s.actionsRow}>
              <button type="button" className={s.actionTile} onClick={() => openDeposit(HYCA_SELECTABLE)}>
                <img src="/assets/figma/hyca-add-money.svg" alt="" className={s.actionTileIcon} aria-hidden="true" />
                <span className={s.actionTileLabel}>Add money</span>
              </button>
              <button type="button" className={s.actionTile} onClick={() => openWithdrawal(HYCA_SELECTABLE)}>
                <img src="/assets/figma/hyca-transfer-money.svg" alt="" className={s.actionTileIcon} aria-hidden="true" />
                <span className={s.actionTileLabel}>Transfer money</span>
              </button>
            </div>

            <div className={s.interestCard}>
              <div className={s.interestHeader}>
                <span className={s.interestLabel}>Earned interest (This month)</span>
                <span className={s.interestBadge}>4.56% interest</span>
              </div>
              <div className={s.interestAmountRow}>
                <p className={s.interestAmount}>$1,334.72</p>
                <span
                  className={s.interestInfo}
                  onMouseEnter={() => setInterestTooltipOpen(true)}
                  onMouseLeave={() => setInterestTooltipOpen(false)}
                  onFocus={() => setInterestTooltipOpen(true)}
                  onBlur={() => setInterestTooltipOpen(false)}
                >
                  <button type="button" className={s.interestInfoButton} aria-describedby="hyca-interest-tooltip">
                    <img src="/assets/figma/hyca-interest-info.svg" alt="" className={s.interestInfoIcon} aria-hidden="true" />
                    <span className={s.srOnly}>Interest information</span>
                  </button>
                  <span
                    id="hyca-interest-tooltip"
                    role="tooltip"
                    className={[s.interestTooltip, interestTooltipOpen ? s.interestTooltipOpen : ''].filter(Boolean).join(' ')}
                  >
                    Interest amounts vary based on your daily balance. Earnings will be paid out within the first seven business days of the next month.
                  </span>
                </span>
              </div>
              <div className={s.interestProjectionCard}>
                <div className={s.interestProjectionRow}>
                  <span>Next month</span>
                  <strong>+$1,339.79</strong>
                </div>
                <div className={s.interestProjectionRow}>
                  <span>Next 12 months</span>
                  <strong>+$16,338.59</strong>
                </div>
                <div className={s.interestProjectionRow}>
                  <span>In 5 years</span>
                  <strong>+$89,431.27</strong>
                </div>
              </div>
            </div>

            <div className={s.utilityLinkGroup}>
              <button type="button" className={s.viewStatements}>
                Setting
                <GearSix weight="regular" aria-hidden="true" />
              </button>

              <button type="button" className={s.viewStatements}>
                View statements
                <img src="/assets/figma/hyca-arrow-right.svg" alt="" aria-hidden="true" />
              </button>
            </div>

          </aside>
        </div>
      </div>

      {transferMode ? <MoneyMovementModal mode={transferMode} initialAccount={transferInitialAccount} onClose={() => setTransferMode(null)} /> : null}
    </main>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        position: 'relative',
        width: 44, height: 24,
        background: on ? 'var(--color-fg-primary-900)' : '#e9eaeb',
        borderRadius: 9999,
        padding: 2, cursor: 'pointer', border: 'none', flexShrink: 0,
        transition: 'background 220ms ease',
      }}
    >
      <span style={{
        display: 'block',
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(10,13,18,0.1)',
        position: 'absolute', top: 2,
        left: on ? 22 : 2,
        transition: 'left 200ms cubic-bezier(0.4,0,0.2,1)',
      }} />
    </button>
  );
}

// ─── CalendarPicker ───────────────────────────────────────────────────────────

function CalendarPicker({ selected, onSelect }: { selected: Date | null; onSelect: (d: Date) => void }) {
  const today = todayMidnight();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstOfMonth = new Date(year, month, 1);
  const startDow     = firstOfMonth.getDay();
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const prevDisabled = year === today.getFullYear() && month <= today.getMonth();

  function prevMonth() {
    if (prevDisabled) return;
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const cells: (Date | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  return (
    <div className={s.cal}>
      <div className={s.calHeader}>
        <button className={s.calNav} type="button" onClick={prevMonth} disabled={prevDisabled} aria-label="Previous month">
          <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="160 208 80 128 160 48"/>
          </svg>
        </button>
        <span className={s.calMonthLabel}>{MONTH_LONG[month]} {year}</span>
        <button className={s.calNav} type="button" onClick={nextMonth} aria-label="Next month">
          <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="96 48 176 128 96 208"/>
          </svg>
        </button>
      </div>
      <div className={s.calWeekdays}>
        {WEEKDAYS.map((d, i) => (
          <div key={d} className={[s.calWeekday, (i === 0 || i === 6) ? s.weekend : ''].filter(Boolean).join(' ')}>{d}</div>
        ))}
      </div>
      <div className={s.calDays}>
        {cells.map((date, idx) => {
          if (!date) return <button key={`e${idx}`} className={`${s.calDay} ${s.calDayEmpty}`} type="button" tabIndex={-1} />;
          const isPast   = date < today;
          const isWknd   = isWeekend(date);
          const disabled = isPast || isWknd;
          const isToday  = sameDay(date, today);
          const isSel    = selected ? sameDay(date, selected) : isToday;
          const cls = [s.calDay, isToday ? s.calDayToday : '', isSel ? s.calDaySelected : '', isWknd ? s.weekend : ''].filter(Boolean).join(' ');
          return (
            <button
              key={date.toISOString()}
              type="button"
              className={cls}
              disabled={disabled}
              aria-label={`${MONTH_LONG[month]} ${date.getDate()}, ${year}`}
              aria-pressed={isSel}
              onClick={() => onSelect(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
