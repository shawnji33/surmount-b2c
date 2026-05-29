'use client';

import { ArrowLeft, CaretDown, GearSix } from '@phosphor-icons/react';
import { Input } from '@/components/Input';
import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type DependencyList, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import s from './page.module.css';

// ─── Data ────────────────────────────────────────────────────────────────────

type TxItem = {
  id: string;
  kind: 'deposit' | 'transfer-out' | 'interest';
  name: string;
  meta: string;
  amount: number;
  details: Record<string, string>;
};

type TxGroup = { date: string; items: TxItem[] };

type SwitcherAccount = {
  id: string;
  label: string;
  value: number;
  logo?: string;
  href: string;
};

type SwitcherGroup = {
  label: string;
  accounts: SwitcherAccount[];
};

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

const TX_DATA: TxGroup[] = [
  {
    date: 'April 26, 2026',
    items: [
      {
        id: 'tx-1',
        kind: 'transfer-out',
        name: 'Transfer out',
        meta: 'To Robinhood',
        amount: -500,
        details: { From: 'Surmount Cash', To: 'Robinhood · Individual', Status: 'Completed', Date: 'April 26, 2026', Method: 'Standard transfer' },
      },
      {
        id: 'tx-2',
        kind: 'deposit',
        name: 'Deposit',
        meta: 'From Chase · 360 Checking',
        amount: 1200,
        details: { From: 'Chase · 360 Checking', To: 'Surmount Cash', Status: 'Completed', Date: 'April 26, 2026', Method: 'Direct deposit' },
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
        amount: 24.35,
        details: { From: 'Surmount Cash', To: 'Surmount Cash', Status: 'Completed', Date: 'April 1, 2026', APY: '4.56%' },
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
        amount: -2000,
        details: { From: 'Surmount Cash', To: 'Robinhood · Individual', Status: 'Completed', Date: 'March 28, 2026', Method: 'Standard transfer' },
      },
      {
        id: 'tx-5',
        kind: 'deposit',
        name: 'Deposit',
        meta: 'From Robinhood',
        amount: 2500,
        details: { From: 'Robinhood · Individual', To: 'Surmount Cash', Status: 'Completed', Date: 'March 28, 2026', Method: 'ACH transfer' },
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
        amount: 22.18,
        details: { From: 'Surmount Cash', To: 'Surmount Cash', Status: 'Completed', Date: 'March 1, 2026', APY: '4.54%' },
      },
    ],
  },
];

const SWITCHER_GROUPS: SwitcherGroup[] = [
  {
    label: 'External accounts',
    accounts: [
      { id: 'ibkr', label: 'Interactive Brokers', logo: '/assets/brokers/ibkr.png', value: 142350.3, href: '/home/playground/account-selection-2/account/ibkr' },
      { id: 'robinhood', label: 'Robinhood', logo: '/assets/brokers/robinhood.png', value: 67213.18, href: '/home/playground/account-selection-2/account/robinhood' },
      { id: 'schwab', label: 'Schwab', logo: '/assets/brokers/schwab.png', value: 31200.5, href: '/home/playground/account-selection-2/account/schwab' },
      { id: 'kraken', label: 'Kraken', logo: '/assets/brokers/kraken.png', value: 150345.67, href: '/home/playground/account-selection-2/account/kraken' },
      { id: 'alpaca', label: 'Alpaca', value: 75890.12, href: '/home/playground/account-selection-2/account/alpaca' },
    ],
  },
  {
    label: 'Surmount',
    accounts: [
      { id: 'surmount', label: 'Surmount Brokerage account', logo: '/assets/brokers/surmount.png', value: 85420.54, href: '/home/playground/account-selection-2/account/surmount' },
      { id: 'surmount-hyca', label: 'High Yield Cash', logo: '/assets/brokers/surmount.png', value: 351242.54, href: '/home/playground/account-selection-2/account/surmount-hyca' },
    ],
  },
];

const SWITCHER_ACCOUNTS = SWITCHER_GROUPS.flatMap((group) => group.accounts);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtAmount(n: number) {
  const sign = n > 0 ? '+' : n < 0 ? '−' : '';
  const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${sign}$${abs}`;
}

function fmtCurrency(value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

function SwitcherAvatar({ account }: { account: SwitcherAccount }) {
  if (account.logo) {
    return <img src={account.logo} alt="" className={s.accountSwitcherAvatar} />;
  }

  return (
    <span className={[s.accountSwitcherAvatar, s.accountSwitcherFallbackAvatar].join(' ')} aria-hidden="true">
      {account.label.charAt(0)}
    </span>
  );
}

function AccountSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const selectedAccount = SWITCHER_ACCOUNTS.find((account) => account.id === 'surmount-hyca') ?? SWITCHER_ACCOUNTS[0];
  const triggerLabel = selectedAccount.label;
  const closedWidth = Math.ceil(Math.min(300, Math.max(88, triggerLabel.length * 8.1 + 52)));
  const switcherStyle = {
    '--switcher-closed-width': `${closedWidth}px`,
  } as CSSProperties;

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!switcherRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={s.accountSwitcher} ref={switcherRef} style={switcherStyle}>
      <button
        type="button"
        className={[s.accountSwitcherTrigger, isOpen ? s.accountSwitcherTriggerOpen : ''].filter(Boolean).join(' ')}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select account"
        onClick={() => setIsOpen((value) => !value)}
      >
        <span className={s.accountSwitcherTriggerContent}>
          <SwitcherAvatar account={selectedAccount} />
          <span className={s.accountSwitcherLabel}>{isOpen ? 'All accounts' : triggerLabel}</span>
        </span>
        <CaretDown className={s.accountSwitcherChevron} weight="bold" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className={s.accountSwitcherMenu} role="listbox" aria-label="Accounts">
          {SWITCHER_GROUPS.map((group) => (
            <div key={group.label} className={s.accountSwitcherGroup}>
              <span className={s.accountSwitcherGroupLabel}>{group.label}</span>
              {group.accounts.map((account) => (
                <Link
                  key={account.id}
                  href={account.href}
                  className={s.accountSwitcherOption}
                  role="option"
                  aria-selected={account.id === selectedAccount.id}
                  onClick={() => setIsOpen(false)}
                >
                  <span className={s.accountSwitcherOptionInner}>
                    <SwitcherAvatar account={account} />
                    <span className={s.accountSwitcherOptionText}>
                      <span className={s.accountSwitcherOptionName}>{account.label}</span>
                      <span className={s.accountSwitcherOptionValue}>{fmtCurrency(account.value)}</span>
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ─── Icons (exact SVGs from transactions.css HTML reference) ──────────────────

function TxIcon({ kind }: { kind: TxItem['kind'] }) {
  if (kind === 'deposit') return (
    <svg className={s.txIconSvg} viewBox="0 0 20 20">
      <path d="M10 12.5V3M6.5 7l3.5-3.5L13.5 7"/>
      <path d="M3.5 12v3a1.5 1.5 0 001.5 1.5h10a1.5 1.5 0 001.5-1.5v-3"/>
    </svg>
  );
  if (kind === 'transfer-out') return (
    <svg className={s.txIconSvg} viewBox="0 0 20 20">
      <path d="M3 7h12M11.5 4.5L15 7l-3.5 2.5"/>
      <path d="M17 13H5M8.5 10.5L5 13l3.5 2.5"/>
    </svg>
  );
  // interest
  return (
    <svg className={s.txIconSvg} viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="7"/>
      <path d="M11.6 7.5c-.4-.5-1-.8-1.7-.8-1 0-1.7.6-1.7 1.4 0 .7.6 1.1 1.4 1.3l.7.2c.9.2 1.6.7 1.6 1.5 0 .9-.8 1.5-1.9 1.5-.8 0-1.5-.4-1.8-1M10 5.6v.9M10 13.5v.9"/>
    </svg>
  );
}

// ─── Transaction row ──────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: TxItem }) {
  const [open, setOpen] = useState(false);
  const isPos = tx.amount > 0;

  return (
    <div className={[s.txCard, open ? s.txCardOpen : ''].filter(Boolean).join(' ')}>
      <button
        type="button"
        className={s.txSummary}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={s.txAvatar} aria-hidden="true">
          <TxIcon kind={tx.kind} />
        </span>
        <span className={s.txText}>
          <span className={s.txName}>{tx.name}</span>
          <span className={s.txMeta}>{tx.meta}</span>
        </span>
        <span className={[s.txAmount, isPos ? s.txAmountPos : ''].filter(Boolean).join(' ')}>
          {fmtAmount(tx.amount)}
        </span>
        <CaretDown
          className={[s.txChevron, open ? s.txChevronOpen : ''].filter(Boolean).join(' ')}
          weight="bold"
          aria-hidden="true"
        />
      </button>

      <div className={[s.txDetailsWrap, open ? s.txDetailsWrapOpen : ''].filter(Boolean).join(' ')}>
        <div className={s.txDetails}>
          <div className={s.txDetailsInner}>
            {Object.entries(tx.details).map(([label, value]) => (
              <div key={label} className={s.txDetailRow}>
                <span className={s.txDetailLabel}>{label}</span>
                <span className={s.txDetailValue}>{value}</span>
              </div>
            ))}
            <div className={[s.txDetailRow, s.txDetailRowAmount].join(' ')}>
              <span className={s.txDetailLabel}>Amount</span>
              <span className={s.txDetailValue}>{fmtAmount(tx.amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MoneyMovementModal({ mode, onClose }: { mode: TransferMode; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<TransferStep>('amount');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);
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

  const parsedAmount = parseFloat(amount);
  const hasAmount = amount.length > 0 && !Number.isNaN(parsedAmount) && parsedAmount > 0;
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

  const BankAccountCard = ({ showUpdate = false }: { showUpdate?: boolean }) => (
    <div className={s.accountCard}>
      <div className={s.bankIconCircle}>
        <img src="/assets/illustrations/bank-chase.png" alt="Chase" />
      </div>
      <div className={s.accountCardInfo}>
        <div className={s.accountCardNameRow}>
          <span className={s.accountCardName}>{CONNECTED_BANK.name}</span>
          <span className={s.accountCardConnectedDot} aria-label="Connected" />
        </div>
        <span className={s.accountCardMeta}>
          {CONNECTED_BANK.institution} · {CONNECTED_BANK.type} · ••••{CONNECTED_BANK.last4}
        </span>
      </div>
      {showUpdate ? (
        <a className={s.accountCardUpdateBtn} href="/onboarding/link-bank?mode=update" aria-label="Update bank account">
          Update
        </a>
      ) : null}
    </div>
  );

  const CashAccountCard = () => (
    <div className={s.accountCard}>
      <div className={s.surmountIconCircle}>
        <img src="/assets/brokers/surmount.png" alt="Surmount" />
      </div>
      <div className={s.accountCardInfo}>
        <div className={s.accountCardNameRow}>
          <span className={s.accountCardName}>{HYCA_ACCOUNT.name}</span>
        </div>
        <span className={s.accountCardMeta}>Available {fmtCurrency(HYCA_ACCOUNT.available)}</span>
      </div>
    </div>
  );

  const ConfirmBankRow = () => (
    <div className={s.confirmRowValueWithIcon}>
      <div className={[s.confirmRowIcon, s.confirmRowIconBank].join(' ')}>
        <img src="/assets/illustrations/bank-chase.png" alt="Chase" />
      </div>
      <span className={s.confirmRowValue}>{CONNECTED_BANK.name}</span>
    </div>
  );

  const ConfirmCashRow = () => (
    <div className={s.confirmRowValueWithIcon}>
      <div className={[s.confirmRowIcon, s.confirmRowIconSurmount].join(' ')}>
        <img src="/assets/brokers/surmount.png" alt="Surmount" />
      </div>
      <span className={s.confirmRowValue}>{HYCA_ACCOUNT.name}</span>
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

              <div className={s.transferSection}>
                <span className={s.transferSectionLabel}>From</span>
                {isWithdrawal ? <CashAccountCard /> : <BankAccountCard showUpdate />}
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
                {isWithdrawal ? <BankAccountCard showUpdate /> : <CashAccountCard />}
              </div>

              <button type="button" className={s.depositCta} onClick={() => setStep('confirm')} disabled={!hasAmount}>
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
                  {isWithdrawal ? <ConfirmCashRow /> : <ConfirmBankRow />}
                </div>
                <div className={s.confirmDetailRow}>
                  <span className={s.confirmRowLabel}>To</span>
                  {isWithdrawal ? <ConfirmBankRow /> : <ConfirmCashRow />}
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
    </div>,
    document.body
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HYCAPage() {
  const [interestTooltipOpen, setInterestTooltipOpen] = useState(false);
  const [transferMode, setTransferMode] = useState<TransferMode | null>(null);

  return (
    <main className={s.main}>
      <Script src="https://mcp.figma.com/mcp/html-to-design/capture.js" strategy="afterInteractive" />
      <header className={s.accountHeader}>
        <Link href="/home/playground/account-selection-2" className={s.backButton} aria-label="Back to accounts">
          <ArrowLeft weight="bold" aria-hidden="true" />
        </Link>
        <AccountSwitcher />
        <button type="button" className={s.settingsButton} aria-label="Account settings">
          <GearSix weight="bold" aria-hidden="true" />
        </button>
      </header>

      <div className={s.pageLayout}>

        {/* ── Left column ── */}
        <div className={s.leftCol}>
          <p className={s.balanceValue}>$351,242.54</p>

          <section className={s.txSection}>
            <span className={s.txSectionTitle}>Recent transactions</span>

            <div>
              {TX_DATA.map((group) => (
                <div key={group.date} className={s.txGroup}>
                  <span className={s.txDate}>{group.date}</span>
                  <div className={s.txList}>
                    {group.items.map((tx) => <TxRow key={tx.id} tx={tx} />)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Right column ── */}
        <aside className={s.rightCol}>

          <div className={s.actionsRow}>
            <button type="button" className={s.actionTile} onClick={() => setTransferMode('deposit')}>
              <img src="/assets/figma/hyca-add-money.svg" alt="" className={s.actionTileIcon} aria-hidden="true" />
              <span className={s.actionTileLabel}>Add money</span>
            </button>
            <button type="button" className={s.actionTile} onClick={() => setTransferMode('withdrawal')}>
              <img src="/assets/figma/hyca-transfer-money.svg" alt="" className={s.actionTileIcon} aria-hidden="true" />
              <span className={s.actionTileLabel}>Withdraw</span>
            </button>
          </div>

          <div className={s.interestCard}>
            <div className={s.interestHeader}>
              <span className={s.interestLabel}>Earned interest (This month)</span>
              <span className={s.interestBadge}>4.56% interest</span>
            </div>
            <div className={s.interestAmountRow}>
              <p className={s.interestAmount}>$24.35</p>
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
                <strong>+$124.54</strong>
              </div>
              <div className={s.interestProjectionRow}>
                <span>Next 12 months</span>
                <strong>+$295.30</strong>
              </div>
              <div className={s.interestProjectionRow}>
                <span>In 5 years</span>
                <strong>+$2,352.52</strong>
              </div>
            </div>
          </div>

          <button type="button" className={s.viewStatements}>
            View statements
            <img src="/assets/figma/hyca-arrow-right.svg" alt="" aria-hidden="true" />
          </button>

        </aside>
      </div>

      {transferMode ? <MoneyMovementModal mode={transferMode} onClose={() => setTransferMode(null)} /> : null}
    </main>
  );
}
