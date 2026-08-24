'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FloppyDisk, X } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import s from './ExitConfirmModal.module.css';

export function ExitConfirmModal({
  onClose,
  onSaveAndExit,
  onExitWithoutSaving,
}: {
  onClose: () => void;
  onSaveAndExit: () => void;
  onExitWithoutSaving: () => void;
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
        aria-labelledby="exit-confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={s.closeBtn} onClick={onClose} aria-label="Close">
          <X weight="regular" />
        </button>

        <span className={s.icon} aria-hidden="true"><FloppyDisk weight="regular" /></span>
        <h2 id="exit-confirm-title" className={s.title}>Save before you leave?</h2>
        <p className={s.desc}>
          You can save this strategy so you can pick it up later, or leave without saving your changes.
        </p>

        <Button type="button" onClick={onSaveAndExit}>Save and exit</Button>
        <Button type="button" variant="destructive" onClick={onExitWithoutSaving}>Exit without saving</Button>
        <button type="button" className={s.dismiss} onClick={onClose}>Cancel</button>
      </div>
    </div>,
    document.body,
  );
}
