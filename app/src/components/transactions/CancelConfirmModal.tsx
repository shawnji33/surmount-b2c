'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Warning } from '@phosphor-icons/react';
import s from './CancelConfirmModal.module.css';

type Props = {
  name: string;
  amount: string;
  submittedAt?: string;
  onConfirm: () => void;
  onClose: () => void;
};

function isOverThreeHours(submittedAt?: string): boolean {
  if (!submittedAt) return false;
  return Date.now() - Date.parse(submittedAt) > 3 * 60 * 60 * 1000;
}

export function CancelConfirmModal({ name, amount, submittedAt, onConfirm, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const overThreeHours = isOverThreeHours(submittedAt);

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return createPortal(
    <div className={s.overlay} onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Cancel order">
      <div className={s.sheet}>
        <div className={s.header}>
          <span className={s.title}>Cancel this order?</span>
          <button type="button" className={s.closeBtn} onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <div className={s.body}>
          <div className={s.detailList}>
            <div className={s.detailRow}>
              <span className={s.detailLabel}>Order</span>
              <span className={s.detailValue}>{name}</span>
            </div>
            <div className={s.detailDivider} />
            <div className={s.detailRow}>
              <span className={s.detailLabel}>Amount</span>
              <span className={[s.detailValue, s.detailValueAmount].join(' ')}>{amount}</span>
            </div>
          </div>

          {overThreeHours && (
            <div className={s.warningCard}>
              <Warning size={16} weight="fill" className={s.warningIcon} />
              <span className={s.warningText}>
                This order was placed over 3 hours ago. Cancellation may not be guaranteed.
              </span>
            </div>
          )}

          <p className={s.disclaimer}>
            Cancellation is not always guaranteed — orders that have been processing for an extended
            period may have already been fulfilled or partially filled. If you have any questions,
            please{' '}
            <a href="/support" className={s.disclaimerLink}>contact our support team</a>.
          </p>

          <div className={s.actionRow}>
            <button type="button" className={s.nevermindBtn} onClick={onClose}>
              Never mind
            </button>
            <button type="button" className={s.confirmBtn} onClick={onConfirm}>
              Confirm cancellation
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
