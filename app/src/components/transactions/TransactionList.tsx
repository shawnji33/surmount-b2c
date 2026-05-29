'use client';

import { useState } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { CancelConfirmModal } from './CancelConfirmModal';
import s from './TransactionList.module.css';

export type TransactionKind =
  | 'deposit'
  | 'transfer-out'
  | 'interest'
  | 'buy'
  | 'sell'
  | 'order'
  | 'stop';

export type TransactionTone = 'positive' | 'negative' | 'neutral';
export type TransactionStatusTone = 'success' | 'warning' | 'danger' | 'neutral';

export type TransactionDetail = {
  label: string;
  value: string;
  tone?: TransactionStatusTone;
};

export type TransactionItem = {
  id: string;
  kind: TransactionKind;
  name: string;
  meta: string;
  amount: string;
  amountTone?: TransactionTone;
  details?: TransactionDetail[];
  iconSrc?: string;
  pillLabel?: string;
  canCancel?: boolean;
  summaryBadge?: { label: string; tone: TransactionStatusTone };
  submittedAt?: string;
};

export type TransactionGroup = {
  date: string;
  items: TransactionItem[];
};

type TransactionListProps = {
  groups: TransactionGroup[];
  title?: string | null;
  emptyState?: string;
};

function TransactionIcon({ kind, iconSrc }: { kind: TransactionKind; iconSrc?: string }) {
  if (iconSrc) {
    return <img className={s.txIconImage} src={iconSrc} alt="" />;
  }

  if (kind === 'deposit') {
    return (
      <svg className={s.txIconSvg} viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 12.5V3M6.5 7l3.5-3.5L13.5 7" />
        <path d="M3.5 12v3a1.5 1.5 0 001.5 1.5h10a1.5 1.5 0 001.5-1.5v-3" />
      </svg>
    );
  }

  if (kind === 'transfer-out') {
    return (
      <svg className={s.txIconSvg} viewBox="0 0 20 20" aria-hidden="true">
        <path d="M3 7h12M11.5 4.5L15 7l-3.5 2.5" />
        <path d="M17 13H5M8.5 10.5L5 13l3.5 2.5" />
      </svg>
    );
  }

  if (kind === 'interest') {
    return (
      <svg className={s.txIconSvg} viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="7" />
        <path d="M11.6 7.5c-.4-.5-1-.8-1.7-.8-1 0-1.7.6-1.7 1.4 0 .7.6 1.1 1.4 1.3l.7.2c.9.2 1.6.7 1.6 1.5 0 .9-.8 1.5-1.9 1.5-.8 0-1.5-.4-1.8-1M10 5.6v.9M10 13.5v.9" />
      </svg>
    );
  }

  return (
    <svg className={s.txIconSvg} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 13.5l3.25-3.25 2.5 2.5L16 6.5" />
      <path d="M12.5 6.5H16V10" />
    </svg>
  );
}

function orderedDetails(details: TransactionDetail[]) {
  return [
    ...details.filter((detail) => detail.label === 'Status'),
    ...details.filter((detail) => detail.label !== 'Status'),
  ];
}

function statusToneFor(detail: TransactionDetail): TransactionStatusTone {
  if (detail.tone) return detail.tone;
  const v = detail.value.toLowerCase();
  if (v === 'complete' || v === 'completed') return 'success';
  if (v === 'pending' || v === 'in progress' || v === 'processing' || v === 'submitted' || v === 'partial fill') return 'warning';
  if (v === 'cancelled' || v === 'canceled' || v === 'failed' || v === 'declined' || v === 'rejected' || v === 'expired') return 'danger';
  return 'neutral';
}

function pillClassFor(kind: TransactionKind): string {
  if (kind === 'buy') return s.txPillBuy;
  if (kind === 'sell') return s.txPillSell;
  return '';
}

function TransactionRow({ tx }: { tx: TransactionItem }) {
  const [open, setOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const details = orderedDetails(tx.details ?? []);
  const amountClass = [
    s.txAmount,
    tx.amountTone === 'positive' ? s.txAmountPos : '',
    tx.amountTone === 'negative' ? s.txAmountNeg : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={[s.txCard, open ? s.txCardOpen : ''].filter(Boolean).join(' ')}>
      <button
        type="button"
        className={s.txSummary}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className={s.txAvatar} aria-hidden="true">
          <TransactionIcon kind={tx.kind} iconSrc={tx.iconSrc} />
        </span>
        <span className={s.txText}>
          <span className={s.txNameLine}>
            <span className={s.txName}>{tx.name}</span>
            {tx.pillLabel ? <span className={[s.txPill, pillClassFor(tx.kind)].filter(Boolean).join(' ')}>{tx.pillLabel}</span> : null}
          </span>
          <span className={s.txMeta}>{tx.meta}</span>
        </span>
        <span className={amountClass}>{tx.amount}</span>
        {tx.summaryBadge ? (
          <span className={[s.txSummaryBadge, s[`txSummaryBadge-${tx.summaryBadge.tone}`]].filter(Boolean).join(' ')}>
            {tx.summaryBadge.label}
          </span>
        ) : null}
        <CaretDown
          className={[s.txChevron, open ? s.txChevronOpen : ''].filter(Boolean).join(' ')}
          weight="bold"
          aria-hidden="true"
        />
      </button>

      <div className={[s.txDetailsWrap, open ? s.txDetailsWrapOpen : ''].filter(Boolean).join(' ')}>
        <div className={s.txDetails}>
          <div className={s.txDetailsInner}>
            {details.map((detail) => (
              <div key={`${tx.id}-${detail.label}`} className={s.txDetailRow}>
                <span className={s.txDetailLabel}>{detail.label}</span>
                {detail.label === 'Status' ? (
                  <span className={[s.txStatusText, s[`txStatusText-${statusToneFor(detail)}`]].join(' ')}>
                    {detail.value}
                  </span>
                ) : (
                  <span className={s.txDetailValue}>{detail.value}</span>
                )}
              </div>
            ))}
            {details.length > 0 ? (
              <div className={[s.txDetailRow, s.txDetailRowAmount].join(' ')}>
                <span className={s.txDetailLabel}>Amount</span>
                <span className={s.txDetailValue}>{tx.amount}</span>
              </div>
            ) : null}
            {tx.canCancel && !cancelled ? (
              <div className={s.txActions}>
                <button
                  type="button"
                  className={s.txCancelBtn}
                  onClick={() => setShowCancelModal(true)}
                >
                  Cancel
                </button>
              </div>
            ) : null}
            {cancelled ? (
              <div className={s.txCancelledNote}>Cancellation requested</div>
            ) : null}
            {showCancelModal ? (
              <CancelConfirmModal
                name={tx.name}
                amount={tx.amount}
                submittedAt={tx.submittedAt}
                onClose={() => setShowCancelModal(false)}
                onConfirm={() => {
                  setShowCancelModal(false);
                  setCancelled(true);
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TransactionList({ groups, title = 'Recent transactions', emptyState }: TransactionListProps) {
  return (
    <section className={s.txSection}>
      {title ? <span className={s.txSectionTitle}>{title}</span> : null}
      {groups.length === 0 ? (
        <div className={s.txEmpty}>{emptyState ?? 'No transactions yet.'}</div>
      ) : (
        <div className={s.txGroups}>
          {groups.map((group) => (
            <div key={group.date} className={s.txGroup}>
              <span className={s.txDate}>{group.date}</span>
              <div className={s.txList}>
                {group.items.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
