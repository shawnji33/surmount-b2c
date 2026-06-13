'use client';

import { useEffect, useLayoutEffect, useRef, useState, type DependencyList } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowsLeftRight,
  CaretLeft,
  TrendUp,
  Warning,
} from '@phosphor-icons/react';
import type { ActivityItem, ActivityItemType } from '@/types/activity';
import { isPendingActivityStatus } from '@/types/activity';
import s from './PendingPanel.module.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

function titleForItem(item: ActivityItem): string {
  switch (item.type) {
    case 'deposit':      return 'Deposit';
    case 'withdrawal':   return 'Withdrawal';
    case 'transfer':     return 'Transfer';
    case 'strategy_buy': return item.strategyName ?? 'Strategy buy';
    case 'market_buy':   return item.symbol ?? 'Market buy';
    case 'market_sell':  return item.symbol ?? 'Market sell';
    case 'limit_buy':    return item.symbol ?? 'Limit buy';
    case 'limit_sell':   return item.symbol ?? 'Limit sell';
    default:             return 'Order';
  }
}

function typeBadgeLabel(item: ActivityItem): string {
  switch (item.type) {
    case 'deposit':      return 'Deposit';
    case 'withdrawal':   return 'Withdrawal';
    case 'transfer':     return 'Transfer';
    case 'strategy_buy': return 'Strategy buy';
    case 'market_buy':   return 'Market buy';
    case 'market_sell':  return 'Market sell';
    case 'limit_buy':    return 'Limit buy';
    case 'limit_sell':   return 'Limit sell';
    case 'recurring_buy': return 'Recurring buy';
    case 'stop_loss':    return 'Stop loss';
    case 'stop_limit':   return 'Stop limit';
    default:             return 'Order';
  }
}

function subtitleForItem(item: ActivityItem): string {
  switch (item.type) {
    case 'deposit':      return `Chase Total Checking → ${item.account.name}`;
    case 'withdrawal':   return `${item.account.name} → Chase Total Checking`;
    case 'transfer':     return `${item.account.name} → ${item.toAccount?.name ?? 'Brokerage'}`;
    case 'strategy_buy': return item.account.name;
    case 'market_buy':
    case 'market_sell':
    case 'limit_buy':
    case 'limit_sell':
      return [item.quantity ? `${item.quantity} shares` : '', item.account.name].filter(Boolean).join(' · ');
    default:
      return item.account.name;
  }
}

function cancelNounForItem(item: ActivityItem): string {
  switch (item.type) {
    case 'deposit':    return 'deposit';
    case 'withdrawal': return 'withdrawal';
    case 'transfer':   return 'transfer';
    default:           return 'order';
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'submitted':     return 'Submitted';
    case 'processing':    return 'Processing';
    case 'partial_fill':  return 'Partially filled';
    case 'awaiting_user': return 'Action required';
    case 'completed':     return 'Completed';
    case 'cancelled':     return 'Cancelled';
    case 'failed':        return 'Failed';
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

function amountColorClass(type: ActivityItemType): string {
  if (type === 'deposit') return s.amountDeposit;
  if (type === 'withdrawal') return s.amountWithdrawal;
  return s.amountNeutral;
}

function amountSign(type: ActivityItemType): string {
  if (type === 'deposit') return '+';
  if (type === 'withdrawal') return '−';
  return '';
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
  switch (item.type) {
    case 'deposit':
      return (
        <div className={`${s.itemLogoFallback} ${s.iconDeposit}`} style={{ width: size, height: size }}>
          <ArrowDown weight="bold" aria-hidden="true" />
        </div>
      );
    case 'withdrawal':
      return (
        <div className={`${s.itemLogoFallback} ${s.iconWithdrawal}`} style={{ width: size, height: size }}>
          <ArrowUp weight="bold" aria-hidden="true" />
        </div>
      );
    case 'transfer':
      return (
        <div className={`${s.itemLogoFallback} ${s.iconTransfer}`} style={{ width: size, height: size }}>
          <ArrowsLeftRight weight="bold" aria-hidden="true" />
        </div>
      );
    case 'strategy_buy': {
      const coverSrc = item.strategyName
        ? `/assets/strategy-covers/${item.strategyName}.png`
        : null;
      if (coverSrc) {
        return (
          <div className={s.strategyCover} style={{ width: size, height: size }} aria-hidden="true">
            <img src={coverSrc} alt="" />
          </div>
        );
      }
      return (
        <div className={`${s.itemLogoFallback} ${s.iconStrategyBuy}`} style={{ width: size, height: size }}>
          <TrendUp weight="bold" aria-hidden="true" />
        </div>
      );
    }
    case 'market_buy':
    case 'limit_buy':
      return (
        <div className={`${s.itemLogoFallback} ${s.iconDeposit}`} style={{ width: size, height: size }}>
          <ArrowDown weight="bold" aria-hidden="true" />
        </div>
      );
    case 'market_sell':
    case 'limit_sell':
      return (
        <div className={`${s.itemLogoFallback} ${s.iconWithdrawal}`} style={{ width: size, height: size }}>
          <ArrowUp weight="bold" aria-hidden="true" />
        </div>
      );
    default:
      return (
        <div className={`${s.itemLogoFallback} ${s.iconWithdrawal}`} style={{ width: size, height: size }}>
          <ArrowUp weight="bold" aria-hidden="true" />
        </div>
      );
  }
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
    switchView('list');
  }

  const modal = (
    <div
      ref={overlayRef}
      className={s.overlay}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div ref={panelRef} className={s.panel} role="dialog" aria-modal="true" aria-label="Pending orders">
        <div key={`${view}-${selected?.id ?? 'list'}`} className={s.content}>
          {view === 'list' && (
            <ListView
              allItems={items}
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
  allItems,
  onViewAll,
  onSelect,
}: {
  allItems: ActivityItem[];
  onViewAll: () => void;
  onSelect: (item: ActivityItem) => void;
}) {
  const pendingItems = allItems.filter((item) => isPendingActivityStatus(item.status));

  return (
    <>
      <div className={s.listHeader}>
        <span className={s.listTitle}>Pending orders</span>
        <button className={s.viewAllBtn} onClick={onViewAll} type="button">
          View all
          <ArrowRight weight="bold" aria-hidden="true" />
        </button>
      </div>

      <ul className={s.list} role="list">
        {pendingItems.map((item) => (
          <li key={item.id}>
            <button type="button" className={s.item} onClick={() => onSelect(item)}>
              <ItemAvatar item={item} />
              <div className={s.itemBody}>
                <div className={s.itemTitleRow}>
                  <span className={s.itemTitle}>{titleForItem(item)}</span>
                  {item.type === 'strategy_buy' && (
                    <span className={s.buyBadge}>Buy</span>
                  )}
                </div>
                <div className={s.itemMeta}>{subtitleForItem(item)}</div>
              </div>
              <div className={[s.itemAmount, amountColorClass(item.type)].join(' ')}>
                {amountSign(item.type)}{fmtUSD(item.amount)}
              </div>
            </button>
          </li>
        ))}
        {pendingItems.length === 0 && (
          <li className={s.emptyState}>No pending orders</li>
        )}
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
        <span className={s.detailHeaderName}>{titleForItem(item)}</span>
      </div>

      <div className={s.detailDivider} />

      {urgent && (
        <div className={s.urgentNotice}>
          <div className={s.urgentNoticeIcon}>
            <Warning weight="fill" aria-hidden="true" />
          </div>
          <p className={s.urgentNoticeText}>
            Action required — please verify your identity to release this transaction.
          </p>
        </div>
      )}

      <div className={s.detailBody}>
        <div className={s.orderDetailLabel}>Order details</div>

        <div className={s.detailRows}>

          {/* deposit: From bank → To account */}
          {item.type === 'deposit' && (
            <>
              <div className={s.detailRow}>
                <span className={s.detailRowLabel}>From</span>
                <div className={s.detailRowWithLogo}>
                  <div className={s.detailRowLogoBank}>
                    <img src="/assets/illustrations/bank-chase.png" alt="" />
                  </div>
                  <span className={s.detailRowValue}>Chase Total Checking</span>
                </div>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailRowLabel}>To</span>
                <div className={s.detailRowWithLogo}>
                  <div className={s.detailRowLogo}>
                    <img src={item.account.brokerLogo} alt="" />
                  </div>
                  <span className={s.detailRowValue}>{item.account.name}</span>
                </div>
              </div>
            </>
          )}

          {/* withdrawal: From account → To bank */}
          {item.type === 'withdrawal' && (
            <>
              <div className={s.detailRow}>
                <span className={s.detailRowLabel}>From</span>
                <div className={s.detailRowWithLogo}>
                  <div className={s.detailRowLogo}>
                    <img src={item.account.brokerLogo} alt="" />
                  </div>
                  <span className={s.detailRowValue}>{item.account.name}</span>
                </div>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailRowLabel}>To</span>
                <div className={s.detailRowWithLogo}>
                  <div className={s.detailRowLogoBank}>
                    <img src="/assets/illustrations/bank-chase.png" alt="" />
                  </div>
                  <span className={s.detailRowValue}>Chase Total Checking</span>
                </div>
              </div>
            </>
          )}

          {/* transfer: From one account → To another */}
          {item.type === 'transfer' && (
            <>
              <div className={s.detailRow}>
                <span className={s.detailRowLabel}>From</span>
                <div className={s.detailRowWithLogo}>
                  <div className={s.detailRowLogo}>
                    <img src={item.account.brokerLogo} alt="" />
                  </div>
                  <span className={s.detailRowValue}>{item.account.name}</span>
                </div>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailRowLabel}>To</span>
                <div className={s.detailRowWithLogo}>
                  <div className={s.detailRowLogo}>
                    <img src={item.toAccount?.brokerLogo ?? ''} alt="" />
                  </div>
                  <span className={s.detailRowValue}>{item.toAccount?.name ?? '—'}</span>
                </div>
              </div>
            </>
          )}

          {/* strategy_buy: order type, strategy, account */}
          {item.type === 'strategy_buy' && (
            <>
              <div className={s.detailRow}>
                <span className={s.detailRowLabel}>Order type</span>
                <span className={s.detailRowValue}>Strategy buy</span>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailRowLabel}>Strategy</span>
                <span className={s.detailRowValue}>{item.strategyName ?? '—'}</span>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailRowLabel}>Account</span>
                <div className={s.detailRowWithLogo}>
                  <div className={s.detailRowLogo}>
                    <img src={item.account.brokerLogo} alt="" />
                  </div>
                  <span className={s.detailRowValue}>{item.account.name}</span>
                </div>
              </div>
            </>
          )}

          {/* Submitted date + time */}
          <div className={s.detailRow}>
            <span className={s.detailRowLabel}>Submitted</span>
            <div className={s.detailRowValueStack}>
              <span className={s.detailRowValue}>{fmtDate(item.submittedAt)}</span>
              <span className={s.detailRowValueSmall}>{fmtTime(item.submittedAt)}</span>
            </div>
          </div>

          {/* Processing time */}
          {(item.type === 'deposit' || item.type === 'withdrawal') && (
            <div className={s.detailRow}>
              <span className={s.detailRowLabel}>Processing time</span>
              <span className={s.detailRowValue}>1–4 business days</span>
            </div>
          )}
          {item.type === 'transfer' && (
            <div className={s.detailRow}>
              <span className={s.detailRowLabel}>Processing time</span>
              <span className={s.detailRowValue}>Same day</span>
            </div>
          )}

          {/* Est. arrival */}
          {item.estimatedCompletion && item.type !== 'strategy_buy' && (
            <div className={s.detailRow}>
              <span className={s.detailRowLabel}>Est. arrival</span>
              <span className={s.detailRowValue}>{fmtDate(item.estimatedCompletion)}</span>
            </div>
          )}

          {/* Status */}
          <div className={s.detailRow}>
            <span className={s.detailRowLabel}>Status</span>
            <span className={[
              s.detailRowValue,
              item.status === 'awaiting_user' ? s.detailRowValueUrgent : '',
            ].filter(Boolean).join(' ')}>
              {statusLabel(item.status)}
            </span>
          </div>

        </div>
      </div>

      <div className={s.detailFooter}>
        <div className={s.detailFooterSplit}>
          <div className={s.footerTotal}>
            <span className={s.footerTotalLabel}>Total amount</span>
            <span className={s.footerTotalValue}>{fmtUSD(item.amount)}</span>
          </div>
          {item.canCancel && (
            <button type="button" className={s.cancelPill} onClick={onCancelRequest}>
              Cancel {cancelNounForItem(item)}
            </button>
          )}
        </div>
      </div>
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
  const noun = cancelNounForItem(item);

  return (
    <>
      <div className={s.detailHeader}>
        <button type="button" className={s.detailBackBtn} onClick={onBack} aria-label="Back">
          <CaretLeft weight="bold" aria-hidden="true" />
        </button>
        <div className={s.detailHeaderCenter}>
          <span className={s.detailHeaderName}>Cancel {noun}?</span>
        </div>
        <div className={s.detailHeaderRight} />
      </div>

      <div className={s.cancelConfirmBody}>
        <div className={s.cancelConfirmIcon}>
          <Warning weight="fill" aria-hidden="true" />
        </div>
        <p className={s.cancelConfirmTitle}>
          Cancel this {noun}?
        </p>
        <p className={s.cancelConfirmText}>
          Your {noun} of {fmtUSD(item.amount)} will be cancelled. This action cannot be undone.
        </p>
      </div>

      <div className={s.cancelConfirmActions}>
        <button type="button" className={s.cancelConfirmYes} onClick={onConfirm}>
          Yes, cancel {noun}
        </button>
        <button type="button" className={s.cancelConfirmBack} onClick={onBack}>
          Keep {noun}
        </button>
      </div>
    </>
  );
}
