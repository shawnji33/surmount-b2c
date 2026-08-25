'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { LinkSimple } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import s from './ConnectExternalModal.module.css';

export function ConnectExternalModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={s.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Connect an external account"
    >
      <div className={s.sheet}>
        <span className={s.icon} aria-hidden="true">
          <LinkSimple weight="bold" />
        </span>

        <h2 className={s.title}>Connecting a broker needs a plan</h2>
        <p className={s.desc}>
          External brokerage connections are available on Surmount Core and up. Subscribe to link
          your account, or apply for a free Surmount investing account instead — no plan required.
        </p>

        <div className={s.actions}>
          <Button
            type="button"
            onClick={() => {
              onClose();
              router.push('/home/get-started/plans');
            }}
          >
            See plans
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              onClose();
              router.push('/onboarding/investing-account');
            }}
          >
            Use a free account
          </Button>
        </div>

        <button type="button" className={s.dismissBtn} onClick={onClose}>
          Not now
        </button>
      </div>
    </div>,
    document.body,
  );
}
