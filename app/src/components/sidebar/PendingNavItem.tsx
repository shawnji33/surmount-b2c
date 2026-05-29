'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePendingActivity } from '@/hooks/usePendingActivity';
import { PendingPanel } from './PendingPanel';
import s from '../Sidebar.module.css';

export function PendingNavItem() {
  const { items, pendingCount, isLoading } = usePendingActivity();
  const [panelOpen, setPanelOpen] = useState(false);
  const router = useRouter();

  if (isLoading || pendingCount === 0) return null;

  const label = pendingCount > 99 ? '99+' : String(pendingCount);

  function handleViewAll() {
    setPanelOpen(false);
    router.push('/activity?filter=pending');
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
        />
      )}
    </>
  );
}
