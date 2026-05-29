'use client';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  WealthsimpleNetWorthChart,
  type WealthsimpleChartPoint,
} from '@/components/charts/WealthsimpleNetWorthChart';
import { Input } from '@/components/Input';
import { AccountSelectorCard, type SelectableAccount } from '@/components/AccountSelectorCard';
import { CaretDown, Check, FunnelSimple } from '@phosphor-icons/react';
import { TransactionList } from '@/components/transactions/TransactionList';
import type { TransactionGroup } from '@/components/transactions/TransactionList';
import Link from 'next/link';
import { Suspense, useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo, type DependencyList } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import s from './page.module.css';

const STRATEGIES = [
  { name: 'Quantum Computing Leaders', cover: '/assets/strategy-covers/Quantum Computing Leaders.png', value: '$351,242.54', returnPct: '+5.24%', returnAbs: '+$2,452.26', brokers: ['/assets/brokers/robinhood.png', '/assets/brokers/ibkr.png'], overflow: '+11' },
  { name: 'Artificial Intelligence Innovators', cover: '/assets/strategy-covers/AI Innovators.png', value: '$482,731.16', returnPct: '+7.15%', returnAbs: '+$3,472.89', brokers: ['/assets/brokers/coinbase.png', '/assets/brokers/schwab.png'], overflow: '+10' },
  { name: 'Biotechnology Ventures', cover: '/assets/strategy-covers/Biotech Breakthroughs.png', value: '$265,478.90', returnPct: '+4.89%', returnAbs: '+$1,642.78', brokers: ['/assets/brokers/webull.png'], overflow: '+5' },
];

const PORTFOLIO_BREAKDOWN = [
  { ticker: 'NVDA', name: 'NVIDIA', logo: '/assets/logos/NVDA.webp', weight: '20.00%', price: '$52.80', value: '$16,900.00', shares: '320 shares', strategies: 'Strategy A, Strategy B' },
  { ticker: 'AAPL', name: 'Apple Inc.', logo: '/assets/logos/AAPL.webp', weight: '18.00%', price: '$34.52', value: '$10,500.00', shares: '72 shares', strategies: 'Strategy A' },
  { ticker: 'AMZN', name: 'Amazon.com', logo: '/assets/logos/AMZN.webp', weight: '15.00%', price: '$78.93', value: '$9,600.00', shares: '3 shares', strategies: 'Strategy A, Strategy B' },
  { ticker: 'MA', name: 'Mastercard', logo: '/assets/logos/MA.webp', weight: '14.00%', price: '$120.37', value: '$14,000.00', shares: '5 shares', strategies: 'Strategy A, Strategy B, Strategy C' },
  { ticker: 'MSFT', name: 'Microsoft Corp.', logo: '/assets/logos/MSFT.webp', weight: '12.00%', price: '$45.66', value: '$8,800.00', shares: '30 shares', strategies: 'Strategy B, Strategy C' },
];

const ACTIVITY_GROUPS: TransactionGroup[] = [
  {
    date: 'May 5, 2026',
    items: [
      { id: 'a1', kind: 'sell', name: 'GOOGL', pillLabel: 'Sell', meta: '10.00 shares · Coinbase', amount: '-$2,800.50', amountTone: 'neutral', iconSrc: '/assets/logos/GOOG.webp', details: [{ label: 'Status', value: 'Complete', tone: 'success' }, { label: 'Symbol', value: 'GOOGL' }, { label: 'Shares', value: '10.00' }, { label: 'Price', value: '$280.05' }, { label: 'Account', value: 'Coinbase' }, { label: 'Date', value: 'May 5, 2026' }] },
      { id: 'a2', kind: 'buy', name: 'GOOGL', pillLabel: 'Buy', meta: '10.00 shares · Coinbase', amount: '-$2,800.50', amountTone: 'neutral', iconSrc: '/assets/logos/GOOG.webp', details: [{ label: 'Status', value: 'Complete', tone: 'success' }, { label: 'Symbol', value: 'GOOGL' }, { label: 'Shares', value: '10.00' }, { label: 'Price', value: '$280.05' }, { label: 'Account', value: 'Coinbase' }, { label: 'Date', value: 'May 5, 2026' }] },
      { id: 'a3', kind: 'deposit', name: 'Deposit', meta: 'From Coinbase', amount: '+$2,800.50', amountTone: 'positive', details: [{ label: 'Status', value: 'Pending', tone: 'warning' }, { label: 'From', value: 'Coinbase' }, { label: 'To', value: 'Surmount Cash' }, { label: 'Date', value: 'May 5, 2026' }, { label: 'Method', value: 'Standard transfer' }] },
    ],
  },
  {
    date: 'May 4, 2026',
    items: [
      { id: 'a4', kind: 'buy', name: 'NVDA', pillLabel: 'Buy', meta: '100.00 shares · Schwab', amount: '-$5,280.00', amountTone: 'neutral', iconSrc: '/assets/logos/NVDA.webp', details: [{ label: 'Status', value: 'Complete', tone: 'success' }, { label: 'Symbol', value: 'NVDA' }, { label: 'Shares', value: '100.00' }, { label: 'Price', value: '$52.80' }, { label: 'Account', value: 'Schwab' }, { label: 'Date', value: 'May 4, 2026' }] },
    ],
  },
  {
    date: 'May 3, 2026',
    items: [
      { id: 'a5', kind: 'buy', name: 'AAPL', pillLabel: 'Buy', meta: '72.00 shares · Schwab', amount: '-$2,485.44', amountTone: 'neutral', iconSrc: '/assets/logos/AAPL.webp', details: [{ label: 'Status', value: 'Complete', tone: 'success' }, { label: 'Symbol', value: 'AAPL' }, { label: 'Shares', value: '72.00' }, { label: 'Price', value: '$34.52' }, { label: 'Account', value: 'Schwab' }, { label: 'Date', value: 'May 3, 2026' }] },
    ],
  },
];

const WATCHLIST = [
  {
    id: 'w1',
    name: 'Quantum Computing Leaders',
    cover: '/assets/strategy-result/covers/quantum-computing-leaders.png',
    category: 'Technology',
    value: '$18,432.54',
    changePct: '+4.68%',
    price: '$138.44',
    totalValue: 18432.54,
    todayReturn: 4.68,
    priceValue: 138.44,
    href: '/home/strategy/quantum-computing-leaders',
  },
  {
    id: 'w2',
    name: 'AI Infrastructure Leaders',
    cover: '/assets/strategy-result/covers/ai-innovators.png',
    category: 'Technology',
    value: '$22,108.92',
    changePct: '+2.14%',
    price: '$92.18',
    totalValue: 22108.92,
    todayReturn: 2.14,
    priceValue: 92.18,
    href: '/home/strategy/artificial-intelligence-innovators',
  },
  {
    id: 'w3',
    name: 'Biotechnology Ventures',
    cover: '/assets/strategy-covers/Biotech Breakthroughs.png',
    category: 'Healthcare',
    value: '$9,750.30',
    changePct: '-0.82%',
    price: '$47.62',
    totalValue: 9750.3,
    todayReturn: -0.82,
    priceValue: 47.62,
    href: '/home/strategy/biotechnology-ventures',
  },
];

type WatchlistSortKey = 'todayReturn' | 'totalValue' | 'price';

const WATCHLIST_SORT_OPTIONS: Array<{ key: WatchlistSortKey; label: string }> = [
  { key: 'todayReturn', label: "Today's return" },
  { key: 'totalValue', label: 'Total value' },
  { key: 'price', label: 'Price' },
];

const DIVIDEND_ITEMS = [
  { label: 'XYZ', amount: '$89.50 (18%)', color: '#9B8AFB', pct: 31 },
  { label: 'PQR', amount: '$95.70 (15%)', color: '#A2D3A5', pct: 23 },
  { label: 'GHI', amount: '$95.75 (22%)', color: '#8EBDEB', pct: 17 },
  { label: 'JKL', amount: '$110.25 (25%)', color: '#A4A7AE', pct: 14 },
  { label: 'Other', amount: '$82.40 (20%)', color: 'var(--color-warning-400, #f19246)', pct: 15 },
];

type Account = { id: string; name: string; logo: string; value: string };

type SwitcherAccount = {
  id: string;
  name: string;
  logo: string;
  value: number;
  change: number;
  data: WealthsimpleChartPoint[];
  color?: string;
  initial?: string;
};

const CONNECTED_ACCOUNTS: Account[] = [
  { id: 'surmount', name: 'Surmount',            logo: '/assets/illustrations/surmount-logo-mark-blue.png', value: '$85,420.54'   },
  { id: 'ibkr',     name: 'Interactive Brokers', logo: '/assets/brokers/ibkr.png',     value: '$142,350.30'  },
  { id: 'coinbase', name: 'Coinbase',             logo: '/assets/brokers/coinbase.png', value: '$45,180.90'   },
  { id: 'kraken',   name: 'Kraken',               logo: '/assets/brokers/kraken.png',   value: '$28,650.00'   },
  { id: 'schwab',   name: 'Schwab',               logo: '/assets/brokers/schwab.png',   value: '$31,200.50'   },
];

const PORTFOLIO_DATES = [
  '2026-04-21', '2026-04-24', '2026-04-25', '2026-04-28', '2026-04-29',
  '2026-04-30', '2026-05-01', '2026-05-02', '2026-05-05', '2026-05-06',
  '2026-05-07', '2026-05-08', '2026-05-09', '2026-05-12', '2026-05-13',
  '2026-05-14', '2026-05-15', '2026-05-16', '2026-05-19', '2026-05-20',
  '2026-05-21',
];

function makePortfolioSeries(start: number, end: number, wobble: number, phase: number): WealthsimpleChartPoint[] {
  return PORTFOLIO_DATES.map((time, index) => {
    const progress = index / (PORTFOLIO_DATES.length - 1);
    const curve = Math.sin(index * 0.92 + phase) * wobble;
    return { time, value: Number((start + (end - start) * progress + curve).toFixed(2)) };
  });
}

const ACCOUNT_SWITCHER_ACCOUNTS: SwitcherAccount[] = [
  {
    id: 'surmount',
    name: 'Surmount Investing',
    logo: '/assets/brokers/surmount.png',
    value: 85420.54,
    change: 1204.88,
    data: makePortfolioSeries(79240, 85420.54, 420, 0.3),
  },
  {
    id: 'ibkr',
    name: 'Interactive Brokers',
    logo: '/assets/brokers/ibkr.png',
    value: 142350.3,
    change: 2921.4,
    data: makePortfolioSeries(134880, 142350.3, 760, 1.1),
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    logo: '/assets/brokers/coinbase.png',
    value: 45180.9,
    change: 682.18,
    data: makePortfolioSeries(42880, 45180.9, 360, 1.7),
  },
  {
    id: 'kraken',
    name: 'Kraken',
    logo: '/assets/brokers/kraken.png',
    value: 28650,
    change: -214.8,
    data: makePortfolioSeries(29320, 28650, 280, 2.4),
  },
  {
    id: 'schwab',
    name: 'Schwab',
    logo: '/assets/brokers/schwab.png',
    value: 31200.5,
    change: 512.66,
    data: makePortfolioSeries(29210, 31200.5, 210, 0.8),
  },
];

const CONNECTED_BANK = {
  name: 'Chase Total Checking',
  institution: 'JPMorgan Chase',
  type: 'Checking',
  last4: '4823',
  logo: '/assets/brokers/chase.png',
};

type TransferMode = 'deposit' | 'withdrawal';
type TransferStep = 'amount' | 'confirm' | 'success';

const SURMOUNT_ACCOUNT = {
  name: 'Surmount Investing',
  available: 10432.18,
};

const HYCA_ACCOUNT = {
  name: 'High Yield Cash',
  available: 351242.54,
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

function fmtAmount(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPortfolioCurrency(value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatSignedPortfolioCurrency(value: number) {
  return `${value < 0 ? '-' : '+'}${formatPortfolioCurrency(Math.abs(value))}`;
}

function formatPortfolioPercent(value: number) {
  return `${value < 0 ? '-' : '+'}${Math.abs(value).toFixed(2)}%`;
}

function sumPortfolioValues(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function aggregatePortfolioSeries(accounts: SwitcherAccount[]) {
  return PORTFOLIO_DATES.map((time, index) => ({
    time,
    value: Number(sumPortfolioValues(accounts.map((account) => account.data[index]?.value ?? 0)).toFixed(2)),
  }));
}

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

function TransferModal({ mode, onClose }: { mode: TransferMode; onClose: () => void }) {
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
                    ? 'Funds may take 1\u20134 business days to settle, and you can track the withdrawal from Activity.'
                    : 'Funds may take 1\u20134 business days to settle, and you can track the deposit from Activity.'}
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

function SwitcherAccountLogo({ account, className }: { account: SwitcherAccount; className: string }) {
  if (account.logo) {
    return <img src={account.logo} alt={account.name} className={className} />;
  }

  return (
    <span
      className={[className, s.switcherAccountLogoFallback].join(' ')}
      style={{ backgroundColor: account.color }}
      aria-label={account.name}
      data-initial={account.initial ?? account.name.slice(0, 1)}
    >
    </span>
  );
}

function AccountSwitcher({
  selected,
  onToggle,
}: {
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropPos, setDropPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef  = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const openDropdown = useCallback(() => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 4, left: r.left });
    }
    setOpen(true);
  }, []);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setDropPos(null);
  }, []);

  const toggleOpen = () => (open ? closeDropdown() : openDropdown());

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !dropdownRef.current?.contains(t)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closeDropdown]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDropdown(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, closeDropdown]);

  // Re-anchor dropdown to trigger on scroll
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (triggerRef.current) {
        const r = triggerRef.current.getBoundingClientRect();
        setDropPos({ top: r.bottom + 4, left: r.left });
      }
    };
    window.addEventListener('scroll', update, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', update, { capture: true });
  }, [open]);

  const allSelected = selected.size === ACCOUNT_SWITCHER_ACCOUNTS.length;
  const selectedAccounts = ACCOUNT_SWITCHER_ACCOUNTS.filter(a => selected.has(a.id));
  const visibleAvatars   = selectedAccounts.slice(0, 2);
  const overflowCount    = selectedAccounts.length > 2 ? selectedAccounts.length - 2 : 0;

  const label = allSelected
    ? 'All investing accounts'
    : selected.size === 1
      ? (ACCOUNT_SWITCHER_ACCOUNTS.find(a => selected.has(a.id))?.name ?? '1 account')
      : `${selected.size} investing accounts`;

  const dropdown = (
    <div
      ref={dropdownRef}
      className={s.switcherDropdown}
      style={{ top: dropPos?.top, left: dropPos?.left }}
      role="listbox"
      aria-multiselectable="true"
    >
      {ACCOUNT_SWITCHER_ACCOUNTS.map(acct => {
        const isOn = selected.has(acct.id);
        const isLast = isOn && selected.size === 1;
        return (
          <button
            key={acct.id}
            type="button"
            className={[s.switcherAccountRow, isLast ? s.switcherAccountRowLocked : ''].filter(Boolean).join(' ')}
            onClick={() => onToggle(acct.id)}
            role="option"
            aria-selected={isOn}
            aria-disabled={isLast}
          >
            <SwitcherAccountLogo account={acct} className={s.switcherAccountLogo} />
            <div className={s.switcherAccountInfo}>
              <span className={s.switcherAccountName}>{acct.name}</span>
              <span className={s.switcherAccountValue}>{formatPortfolioCurrency(acct.value)}</span>
            </div>
            <span className={[s.switcherCheckbox, isOn ? s.switcherCheckboxSelected : ''].filter(Boolean).join(' ')}>
              {isOn && <Check weight="bold" aria-hidden="true" />}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={[s.switcherTrigger, open ? s.switcherTriggerOpen : ''].filter(Boolean).join(' ')}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={s.switcherAvatarStack} aria-hidden="true">
          {visibleAvatars.map(a => (
            <SwitcherAccountLogo key={a.id} account={a} className={s.switcherAvatar} />
          ))}
          {overflowCount > 0 && (
            <span className={s.switcherAvatarOverflow}>+{overflowCount}</span>
          )}
        </span>
        <span key={label} className={s.switcherLabel}>{label}</span>
        <CaretDown className={s.switcherChevron} weight="bold" aria-hidden="true" />
      </button>
      {mounted && open && dropPos && createPortal(dropdown, document.body)}
    </>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={s.toggleSwitch}
    >
      <span className={s.toggleThumb} />
    </button>
  );
}

function Carousel() {
  const [index, setIndex] = useState(0);
  const total = 3;
  return (
    <div>
      <div className={s.carouselHeader}>
        <span className={s.carouselCounter}>{index + 1} of {total}</span>
        <div className={s.carouselControls}>
          <button type="button" className={s.carouselBtn} onClick={() => setIndex((i) => (i - 1 + total) % total)} aria-label="Previous slide">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4L6 8l4 4" /></svg>
          </button>
          <button type="button" className={s.carouselBtn} onClick={() => setIndex((i) => (i + 1) % total)} aria-label="Next slide">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4l4 4-4 4" /></svg>
          </button>
        </div>
      </div>
      <div style={{ height: '24px' }} />
      <div className={s.carouselViewport}>
        <div
          className={s.carouselTrack}
          style={{ transform: `translateX(calc(-${index * 100}% - ${index * 16}px))` }}
        >
          <a className={[s.carouselSlide, s.strategyCarouselSlide].join(' ')} href="/onboarding/pick-strategy">
            <div className={s.verifyCardLogo}>
              <img src="/assets/illustrations/surmount-logo-mark.png" alt="Surmount" />
            </div>
            <div className={s.strategyCarouselText}>
              <h3 className={s.strategyCardTitle}>Pick your first strategy</h3>
              <p className={s.verifyCardCaption}>2/3 complete</p>
            </div>
            <div className={s.verifyProgressTrack} role="progressbar" aria-valuenow={67} aria-valuemin={0} aria-valuemax={100} aria-label="2 of 3 complete">
              <div className={[s.verifyProgressSeg, s.strategyProgressSegFull].join(' ')} />
              <div className={[s.verifyProgressSeg, s.strategyProgressSegFull].join(' ')} />
              <div className={[s.verifyProgressSeg, s.strategyProgressSegFull].join(' ')} />
            </div>
            <span className={s.strategyCarouselArrow} aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7.5 5l5 5-5 5" />
              </svg>
            </span>
          </a>
          <a className={[s.carouselSlide, s.promoCardSlide].join(' ')} href="/onboarding/cash-account">
            <div className={s.promoCardText}>
              <h3 className={s.promoCardTitle}>Boost your savings with our top-notch 4.35% APY</h3>
              <p className={s.promoCardSub}>Make the most of your uninvested funds with our high-yield options.</p>
            </div>
            <span className={s.promoCardArrow} aria-hidden="true">
              <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <rect width="256" height="256" fill="none" />
                <line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <polyline points="144 56 216 128 144 200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
              </svg>
            </span>
            <div className={s.promoCardIllo} aria-hidden="true">
              <img src="/assets/illustrations/wallet-coin.png" alt="" />
            </div>
          </a>
          <a className={s.carouselSlide} href="/onboarding/investing-account" style={{ padding: 0, background: 'none', display: 'block' }}>
            <img src="/assets/card-start-surmount.png" alt="Start with a Surmount account" className={s.carouselSlideImg} />
          </a>
        </div>
      </div>
    </div>
  );
}

function WatchlistSection() {
  const [sortKey, setSortKey] = useState<WatchlistSortKey>('todayReturn');
  const [sortOpen, setSortOpen] = useState(false);
  const [sortPos, setSortPos] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeSortMenu = useCallback(() => {
    setSortOpen(false);
    setSortPos(null);
  }, []);

  const openSortMenu = useCallback(() => {
    if (sortButtonRef.current) {
      const rect = sortButtonRef.current.getBoundingClientRect();
      setSortPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setSortOpen(true);
  }, []);

  const toggleSortMenu = () => (sortOpen ? closeSortMenu() : openSortMenu());

  useEffect(() => {
    if (!sortOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!sortButtonRef.current?.contains(target) && !sortMenuRef.current?.contains(target)) {
        closeSortMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSortMenu();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeSortMenu, sortOpen]);

  const sortedItems = useMemo(() => {
    const keyMap: Record<WatchlistSortKey, 'todayReturn' | 'totalValue' | 'priceValue'> = {
      todayReturn: 'todayReturn',
      totalValue: 'totalValue',
      price: 'priceValue',
    };

    const numericKey = keyMap[sortKey];

    return [...WATCHLIST].sort((a, b) => {
      const delta = b[numericKey] - a[numericKey];
      return delta || a.name.localeCompare(b.name);
    });
  }, [sortKey]);

  const activeSortLabel = WATCHLIST_SORT_OPTIONS.find((option) => option.key === sortKey)?.label ?? 'Sort';

  const sortMenu = (
    <div
      ref={sortMenuRef}
      className={s.watchlistSortMenu}
      style={{ top: sortPos?.top, right: sortPos?.right }}
      role="menu"
      aria-label="Sort watchlist"
    >
      <div className={s.watchlistSortTitle}>Sort by</div>
      <div className={s.watchlistSortOptions}>
        {WATCHLIST_SORT_OPTIONS.map((option) => {
          const selected = option.key === sortKey;

          return (
            <button
              key={option.key}
              type="button"
              className={s.watchlistSortOption}
              role="menuitemradio"
              aria-checked={selected}
              onClick={() => {
                setSortKey(option.key);
                closeSortMenu();
              }}
            >
              <span>{option.label}</span>
              <span
                className={[
                  s.watchlistSortRadio,
                  selected ? s.watchlistSortRadioSelected : '',
                ].filter(Boolean).join(' ')}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <section className={s.watchlistSection} aria-label="Watchlist">
      <div className={s.sectionHeader}>
        <span className={s.sectionTitle}>Watchlist</span>
        <div className={s.watchlistControls} aria-label="Watchlist controls">
          <span className={s.watchlistRangePill} aria-label="1 day performance">
            1D
          </span>
          <button
            ref={sortButtonRef}
            type="button"
            className={[s.watchlistSortButton, sortOpen ? s.watchlistSortButtonOpen : ''].filter(Boolean).join(' ')}
            onClick={toggleSortMenu}
            aria-label={`Sort by ${activeSortLabel}`}
            aria-haspopup="menu"
            aria-expanded={sortOpen}
          >
            <FunnelSimple weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className={s.watchlistCard}>
        {sortedItems.map((item) => {
          const primaryValue = sortKey === 'price' ? item.price : item.value;
          const secondaryValue = sortKey === 'price' ? 'Price' : item.changePct;
          const secondaryTone = sortKey === 'price'
            ? s.watchlistChangeMuted
            : item.todayReturn < 0
              ? s.watchlistChangeNegative
              : '';

          return (
            <Link
              key={item.id}
              href={item.href}
              className={s.watchlistRow}
            >
              <div className={s.watchlistCover}>
                <img src={item.cover} alt={item.name} />
              </div>
              <div className={s.watchlistInfo}>
                <span className={s.watchlistName}>{item.name}</span>
                <span className={s.watchlistCategory}>{item.category}</span>
              </div>
              <div className={s.watchlistRight}>
                <span className={s.watchlistValue}>{primaryValue}</span>
                <span className={[s.watchlistChange, secondaryTone].filter(Boolean).join(' ')}>
                  {secondaryValue}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      {mounted && sortOpen && sortPos && createPortal(sortMenu, document.body)}
    </section>
  );
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const [transferMode, setTransferMode] = useState<TransferMode | null>(() => searchParams.get('deposit') === '1' ? 'deposit' : null);
  const [selectedPortfolioAccounts, setSelectedPortfolioAccounts] = useState<Set<string>>(
    () => new Set(ACCOUNT_SWITCHER_ACCOUNTS.map((account) => account.id)),
  );

  const selectedAccounts = useMemo(
    () => ACCOUNT_SWITCHER_ACCOUNTS.filter((account) => selectedPortfolioAccounts.has(account.id)),
    [selectedPortfolioAccounts],
  );
  const portfolioChartData = useMemo(() => aggregatePortfolioSeries(selectedAccounts), [selectedAccounts]);
  const portfolioValue = useMemo(
    () => sumPortfolioValues(selectedAccounts.map((account) => account.value)),
    [selectedAccounts],
  );
  const portfolioChange = useMemo(
    () => sumPortfolioValues(selectedAccounts.map((account) => account.change)),
    [selectedAccounts],
  );
  const portfolioStartingValue = portfolioValue - portfolioChange;
  const portfolioChangePct = portfolioStartingValue !== 0
    ? (portfolioChange / portfolioStartingValue) * 100
    : 0;
  const portfolioChangeText = `${formatSignedPortfolioCurrency(portfolioChange)} (${formatPortfolioPercent(portfolioChangePct)})`;

  const togglePortfolioAccount = useCallback((id: string) => {
    setSelectedPortfolioAccounts((previous) => {
      if (previous.has(id) && previous.size === 1) return previous;
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <main className={s.main}>
      <DashboardHeader
        title="Good morning, Logan"
        onDeposit={() => setTransferMode('deposit')}
        onWithdraw={() => setTransferMode('withdrawal')}
      />

      <div className={s.contentArea}>

        {/* ── LEFT COLUMN ── */}
        <div className={s.leftColumn}>

          {/* Portfolio — hero + chart naked (no card chrome) */}
          <section className={s.portfolioSection}>
            <div className={s.sectionHeader}>
              <div className={s.sectionTitleRow}>
                <AccountSwitcher selected={selectedPortfolioAccounts} onToggle={togglePortfolioAccount} />
              </div>
              <div className={s.sectionActions}>
                <button type="button" className={s.actionLink}>Edit</button>
                <button type="button" className={s.btnSecondary}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
                  Connect accounts
                </button>
              </div>
            </div>
            <WealthsimpleNetWorthChart
              value={portfolioValue}
              changeText={portfolioChangeText}
              changePeriod="this month"
              data={portfolioChartData}
              initialRange="1D"
              height={237}
            />


          </section>

          {/* Active Strategies */}
          <section className={s.leftSection}>
            <div className={s.sectionHeader}>
              <span className={s.sectionTitle}>Invested strategies</span>
              <div className={s.sectionActions}>
                <button type="button" className={s.actionLink}>Edit</button>
                <button type="button" className={s.btnSecondary}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
                  Add strategies
                </button>
              </div>
            </div>
            <div className={s.strategiesTable}>
              <div className={s.tableHeader}>
                <div className={[s.th, s.thStrategy].join(' ')}>Strategy</div>
                <div className={[s.th, s.thValue].join(' ')}>Value</div>
                <div className={[s.th, s.thReturn].join(' ')}>Total return</div>
                <div className={[s.th, s.thAccount].join(' ')}>Account</div>
              </div>
              {STRATEGIES.map((row) => (
                <Link key={row.name} href={`/home/strategy/${row.name.toLowerCase().replace(/\s+/g, '-')}`} className={s.tableRow} style={{ textDecoration: 'none' }}>
                  <div className={[s.td, s.tdStrategy].join(' ')}>
                    <div className={s.strategyIcon}>
                      <img src={row.cover} alt={row.name} />
                    </div>
                    <span className={s.strategyName}>{row.name}</span>
                  </div>
                  <div className={[s.td, s.tdValue].join(' ')}>
                    <span className={s.tdValueText}>{row.value}</span>
                  </div>
                  <div className={[s.td, s.tdReturn].join(' ')}>
                    <span className={s.tdReturnPrimary}>{row.returnPct}</span>
                    <span className={s.tdReturnSecondary}>{row.returnAbs}</span>
                  </div>
                  <div className={[s.td, s.tdAccount].join(' ')}>
                    <div className={s.avatarGroup}>
                      {row.brokers.map((src, i) => (
                        <div key={i} className={s.accountAvatar}>
                          <img src={src} alt="" />
                        </div>
                      ))}
                      <div className={[s.accountAvatar, s.accountAvatarOverflow].join(' ')}>{row.overflow}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Portfolio Breakdown */}
          <section className={s.leftSection}>
            <div className={s.sectionHeader}>
              <span className={s.sectionTitle}>Portfolio breakdown</span>
              <button type="button" className={s.pbDropdown}>
                By asset
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 6l4 4 4-4" /></svg>
              </button>
            </div>
            <div className={s.pbTable}>
              <div className={s.pbHeader}>
                <div className={s.pbTh}>Asset</div>
                <div className={s.pbTh}>
                  Weight
                  <svg className={s.sortArrow} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2v8M3 7l3 3 3-3" /></svg>
                </div>
                <div className={s.pbTh}>Share price</div>
                <div className={s.pbTh}>Value</div>
                <div className={s.pbTh}>From strategy</div>
              </div>
              {PORTFOLIO_BREAKDOWN.map((row) => (
                <div key={row.ticker} className={s.pbRow}>
                  <div className={s.pbTd}>
                    <div className={s.tickerLogo}><img src={row.logo} alt={row.ticker} /></div>
                    <div className={s.tickerText}>
                      <span className={s.tickerSymbol}>{row.ticker}</span>
                      <span className={s.tickerName}>{row.name}</span>
                    </div>
                  </div>
                  <div className={s.pbTd}><span className={s.pbWeight}>{row.weight}</span></div>
                  <div className={s.pbTd}><span className={s.pbPrice}>{row.price}</span></div>
                  <div className={s.pbTd}>
                    <div className={s.pbValue}>
                      <span className={s.pbValuePrimary}>{row.value}</span>
                      <span className={s.pbValueSecondary}>{row.shares}</span>
                    </div>
                  </div>
                  <div className={s.pbTd}><span className={s.pbStrategy}>{row.strategies}</span></div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activities */}
          <section className={s.leftSection}>
            <div className={s.txSectionHeader}>
              <span className={s.txSectionTitle}>Recent activities</span>
            </div>
            <TransactionList title={null} groups={ACTIVITY_GROUPS} />
          </section>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className={s.rightColumn}>

          {/* Carousel — top */}
          <Carousel />

          {/* Dividend management — compact utility row */}
          <a className={s.utilityRow} href="#" aria-label="Dividend management">
            <div className={s.utilityRowIconWrap}>
              <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm52-88a52,52,0,1,1-52-52A52.06,52.06,0,0,1,180,128Zm-16,0a36,36,0,1,0-36,36A36,36,0,0,0,164,128Z"/>
              </svg>
            </div>
            <span className={s.utilityRowLabel}>Dividend management</span>
            <svg className={s.utilityRowChevron} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7.5 5l5 5-5 5" />
            </svg>
          </a>

          {/* Holdings / Watchlist tabbed module */}
          <WatchlistSection />

        </div>

      </div>

      {transferMode && <TransferModal mode={transferMode} onClose={() => setTransferMode(null)} />}
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  );
}
