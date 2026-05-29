'use client';

import { useEffect, useLayoutEffect, useRef, useState, type DependencyList } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowDown,
  ArrowUp,
  CaretLeft,
  CaretRight,
  Warning,
} from '@phosphor-icons/react';
import type { ActivityItem, ActivityItemType, ActivityStatus } from '@/types/activity';
import { isPendingActivityStatus } from '@/types/activity';
import s from './PendingPanel.module.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

function titleForItem(item: ActivityItem): string {
  return item.type === 'deposit' ? 'Deposit' : 'Withdrawal';
}

function statusLabel(status: ActivityStatus): string {
  switch (status) {
    case 'submitted':     return 'Submitted';
    case 'processing':    return 'Processing';
    case 'partial_fill':  return 'Partially filled';
    case 'awaiting_user': return 'Action required';
    default:              return status;
  }
}

function fmtUSD(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function amountClass(type: ActivityItemType): string {
  return type === 'deposit' ? s.amountDeposit : s.amountWithdrawal;
}

function amountSign(type: ActivityItemType): string {
  return type === 'deposit' ? '+' : '−';
}

function transferFromLabel(item: ActivityItem): string {
  return item.type === 'deposit' ? 'Chase Total Checking' : item.account.name;
}

function transferToLabel(item: ActivityItem): string {
  return item.type === 'deposit' ? item.account.name : 'Chase Total Checking';
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

// ── Item avatar ───────────────────────────────────────────────────────────────

function ItemAvatar({ item, size = 38 }: { item: ActivityItem; size?: number }) {
  const Icon = item.type === 'deposit' ? ArrowDown : ArrowUp;
  const bgClass = item.type === 'deposit' ? s.iconDeposit : s.iconWithdrawal;

  return (
    <div className={`${s.itemLogoFallback} ${bgClass}`} style={{ width: size, height: size }}>
      <Icon weight="bold" aria-hidden="true" />
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

type PanelView = 'list' | 'detail' | 'cancel-confirm';

export type PendingPanelProps = {
  items: ActivityItem[];
  pendingCount: number;
  onClose: () => void;
  onViewAll: () => void;
};

export function PendingPanel({ items, pendingCount, onClose, onViewAll }: PendingPanelProps) {
  // Only deposit/withdrawal in this panel
  const pendingItems = items.filter(
    (item) => isPendingActivityStatus(item.status) &&
      (item.type === 'deposit' || item.type === 'withdrawal'),
  );

  const [view, setView]         = useState<PanelView>('list');
  const [selected, setSelected] = useState<ActivityItem | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useAnimatedHeight<HTMLDivElement>([view, selected?.id]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (view === 'cancel-confirm') switchView('detail');
        else if (view === 'detail') switchView('list');
        else onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, view]);

  function switchView(next: PanelView, item?: ActivityItem) {
    if (item) setSelected(item);
    setView(next);
  }

  function handleCancelConfirmed() {
    // In real app: call cancel API
    switchView('list');
  }

  const modal = (
    <div
      ref={overlayRef}
      className={s.overlay}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div ref={panelRef} className={s.panel} role="dialog" aria-modal="true" aria-label="Pending transactions">
        <div key={`${view}-${selected?.id ?? 'list'}`} className={s.content}>
          {view === 'list' && (
            <ListView
              items={pendingItems}
              pendingCount={pendingCount}
              onViewAll={onViewAll}
              onSelect={(item) => switchView('detail', item)}
            />
          )}
          {view === 'detail' && selected && (
            <DetailView
              item={selected}
              onBack={() => switchView('list')}
              onCancelRequest={() => switchView('cancel-confirm')}
            />
          )}
          {view === 'cancel-confirm' && selected && (
            <CancelConfirmView
              item={selected}
              onBack={() => switchView('detail')}
              onConfirm={handleCancelConfirmed}
            />
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// ── List view ─────────────────────────────────────────────────────────────────

function ListView({
  items,
  pendingCount,
  onViewAll,
  onSelect,
}: {
  items: ActivityItem[];
  pendingCount: number;
  onViewAll: () => void;
  onSelect: (item: ActivityItem) => void;
}) {
  return (
    <>
      <div className={s.listHeader}>
        <div className={s.listHeaderLeft}>
          <span className={s.listTitle}>Pending transactions</span>
          {pendingCount > 0 && (
            <span className={s.listBadge}>{pendingCount}</span>
          )}
        </div>
        <button className={s.viewAllBtn} onClick={onViewAll} type="button">
          View all
          <CaretRight weight="bold" aria-hidden="true" />
        </button>
      </div>

      <ul className={s.list} role="list">
        {items.map((item) => (
          <li key={item.id}>
            <button type="button" className={s.item} onClick={() => onSelect(item)}>
              <ItemAvatar item={item} />

              <div className={s.itemBody}>
                <div className={s.itemTitle}>{titleForItem(item)}</div>
                <div className={s.itemMeta}>{item.account.name}</div>
              </div>

              <div className={s.itemRight}>
                <div className={[s.itemAmount, amountClass(item.type)].join(' ')}>
                  {amountSign(item.type)}{fmtUSD(item.amount)}
                </div>
                <div className={[
                  s.itemStatus,
                  item.status === 'awaiting_user' ? s.itemStatusUrgent : '',
                ].filter(Boolean).join(' ')}>
                  {statusLabel(item.status)}
                </div>
              </div>

              <div className={s.itemChevron}>
                <CaretRight weight="bold" aria-hidden="true" />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

// ── Detail view ───────────────────────────────────────────────────────────────

function DetailView({
  item,
  onBack,
  onCancelRequest,
}: {
  item: ActivityItem;
  onBack: () => void;
  onCancelRequest: () => void;
}) {
  const urgent = item.status === 'awaiting_user';

  return (
    <>
      <div className={s.detailHeader}>
        <button type="button" className={s.detailBackBtn} onClick={onBack} aria-label="Back">
          <CaretLeft weight="bold" aria-hidden="true" />
        </button>

        <div className={s.detailHeaderInfo}>
          <div className={s.detailHeaderTitle}>{titleForItem(item)} details</div>
        </div>
      </div>

      {urgent && (
        <div className={s.urgentNotice}>
          <div className={s.urgentNoticeIcon}>
            <Warning weight="fill" aria-hidden="true" />
          </div>
          <p className={s.urgentNoticeText}>
            Action required — please verify your identity to release this withdrawal.
          </p>
        </div>
      )}

      <div className={s.detailBody}>
        <div className={s.detailCard}>
          <div className={s.detailRow}>
            <span className={s.detailRowLabel}>From</span>
            <div className={s.detailRowWithLogo}>
              <div className={item.type === 'deposit' ? s.detailRowLogoBank : s.detailRowLogo}>
                <img src={item.type === 'deposit' ? '/assets/illustrations/bank-chase.png' : item.account.brokerLogo} alt="" />
              </div>
              <span className={s.detailRowValue}>{transferFromLabel(item)}</span>
            </div>
          </div>

          <div className={s.detailRow}>
            <span className={s.detailRowLabel}>To</span>
            <div className={s.detailRowWithLogo}>
              <div className={item.type === 'deposit' ? s.detailRowLogo : s.detailRowLogoBank}>
                <img src={item.type === 'deposit' ? item.account.brokerLogo : '/assets/illustrations/bank-chase.png'} alt="" />
              </div>
              <span className={s.detailRowValue}>{transferToLabel(item)}</span>
            </div>
          </div>

          <div className={s.detailRow}>
            <span className={s.detailRowLabel}>Date</span>
            <span className={s.detailRowValue}>{fmtDate(item.submittedAt)}</span>
          </div>

          <div className={s.detailRow}>
            <span className={s.detailRowLabel}>Processing</span>
            <span className={s.detailRowValue}>1–4 business days</span>
          </div>

          {item.estimatedCompletion && (
            <div className={s.detailRow}>
              <span className={s.detailRowLabel}>Est. arrival</span>
              <span className={s.detailRowValue}>{fmtDate(item.estimatedCompletion)}</span>
            </div>
          )}

          <div className={s.detailRow}>
            <span className={s.detailRowLabel}>Status</span>
            <span className={[
              s.detailRowValue,
              item.status === 'awaiting_user' ? s.detailRowValueUrgent : '',
            ].filter(Boolean).join(' ')}>
              {statusLabel(item.status)}
            </span>
          </div>

          <div className={s.detailRow}>
            <span className={s.detailRowLabel}>Amount</span>
            <span className={[s.detailRowValue, s.detailRowAmount, amountClass(item.type)].join(' ')}>
              {amountSign(item.type)}{fmtUSD(item.amount)}
            </span>
          </div>
        </div>
      </div>

      {item.canCancel && (
        <div className={s.detailFooter}>
          <button type="button" className={s.cancelBtn} onClick={onCancelRequest}>
            Cancel {item.type === 'deposit' ? 'deposit' : 'withdrawal'}
          </button>
        </div>
      )}
    </>
  );
}

// ── Cancel confirmation view ──────────────────────────────────────────────────

function CancelConfirmView({
  item,
  onBack,
  onConfirm,
}: {
  item: ActivityItem;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const label = item.type === 'deposit' ? 'deposit' : 'withdrawal';

  return (
    <>
      <div className={s.detailHeader}>
        <button type="button" className={s.detailBackBtn} onClick={onBack} aria-label="Back">
          <CaretLeft weight="bold" aria-hidden="true" />
        </button>
        <div className={s.detailHeaderInfo}>
          <div className={s.detailHeaderTitle}>Cancel {label}?</div>
        </div>
      </div>

      <div className={s.cancelConfirmBody}>
        <div className={s.cancelConfirmIcon}>
          <Warning weight="fill" aria-hidden="true" />
        </div>
        <p className={s.cancelConfirmTitle}>
          Cancel this {label}?
        </p>
        <p className={s.cancelConfirmText}>
          Your {label} of {fmtUSD(item.amount)} will be cancelled. This action cannot be undone.
        </p>
      </div>

      <div className={s.cancelConfirmActions}>
        <button type="button" className={s.cancelConfirmYes} onClick={onConfirm}>
          Yes, cancel {label}
        </button>
        <button type="button" className={s.cancelConfirmBack} onClick={onBack}>
          Keep {label}
        </button>
      </div>
    </>
  );
}
