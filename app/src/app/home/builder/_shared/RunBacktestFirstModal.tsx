'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChartLineUp, X } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import s from './RunBacktestFirstModal.module.css';

export function RunBacktestFirstModal({
  onClose,
  onGoToBacktest,
}: {
  onClose: () => void;
  onGoToBacktest: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className={s.backdrop} onClick={onClose}>
      <div
        className={s.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="run-backtest-first-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={s.closeBtn} onClick={onClose} aria-label="Close">
          <X weight="regular" />
        </button>

        <span className={s.icon} aria-hidden="true"><ChartLineUp weight="regular" /></span>
        <h2 id="run-backtest-first-title" className={s.title}>Run a backtest first</h2>
        <p className={s.desc}>
          Before you deploy this strategy, run a backtest so you know how it might have
          performed historically.
        </p>

        <Button type="button" onClick={onGoToBacktest}>Go to backtest</Button>
        <button type="button" className={s.dismiss} onClick={onClose}>Not now</button>
      </div>
    </div>,
    document.body,
  );
}
