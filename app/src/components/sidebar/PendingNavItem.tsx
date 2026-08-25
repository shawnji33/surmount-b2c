'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { CheckCircle } from '@phosphor-icons/react';
import { usePendingActivity } from '@/hooks/usePendingActivity';
import type { ActivityItem } from '@/types/activity';
import { PendingPanel } from './PendingPanel';
import s from '../Sidebar.module.css';

function cancelledMessage(item: ActivityItem): string {
  switch (item.type) {
    case 'deposit':    return 'Deposit cancelled';
    case 'withdrawal': return 'Withdrawal cancelled';
    default:           return 'Order cancelled';
  }
}

export function PendingNavItem() {
  const { items, pendingCount, isLoading } = usePendingActivity();
  const [panelOpen, setPanelOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastLeaving, setToastLeaving] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);
  const toastLeaveTimer = useRef<number | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    return () => {
      if (toastTimer.current != null) window.clearTimeout(toastTimer.current);
      if (toastLeaveTimer.current != null) window.clearTimeout(toastLeaveTimer.current);
    };
  }, []);

  function showToast(message: string) {
    if (toastTimer.current != null) window.clearTimeout(toastTimer.current);
    if (toastLeaveTimer.current != null) window.clearTimeout(toastLeaveTimer.current);
    setToastLeaving(false);
    setToastMsg(message);
    toastTimer.current = window.setTimeout(() => {
      setToastLeaving(true);
      toastLeaveTimer.current = window.setTimeout(() => {
        setToastMsg(null);
        setToastLeaving(false);
      }, 220);
    }, 3200);
  }

  if (isLoading || pendingCount === 0) return null;

  const label = pendingCount > 99 ? '99+' : String(pendingCount);

  function handleViewAll() {
    setPanelOpen(false);
    router.push('/activity?filter=pending');
  }

  function handleCancelled(item: ActivityItem) {
    setPanelOpen(false);
    showToast(cancelledMessage(item));
  }

  return (
    <>
      <li className={s.navItem}>
        <button
          type="button"
          className={s.pendingBtn}
          onClick={() => setPanelOpen((prev) => !prev)}
          aria-label={`${pendingCount} pending order${pendingCount !== 1 ? 's' : ''}`}
          aria-expanded={panelOpen}
        >
          <span className={s.pendingDot} aria-hidden="true" />
          <span className={s.pendingCount}>{label}</span>
        </button>
        <div className={s.tooltip} role="tooltip">Pending orders</div>
      </li>

      {panelOpen && (
        <PendingPanel
          items={items}
          pendingCount={pendingCount}
          onClose={() => setPanelOpen(false)}
          onViewAll={handleViewAll}
          onCancelled={handleCancelled}
        />
      )}

      {mounted && toastMsg &&
        createPortal(
          <div className={s.toastRegion} aria-live="polite" aria-atomic="true">
            <div className={[s.toast, toastLeaving ? s.toastLeaving : ''].filter(Boolean).join(' ')}>
              <CheckCircle className={s.toastIcon} weight="fill" aria-hidden="true" />
              <p className={s.toastText}>{toastMsg}</p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
