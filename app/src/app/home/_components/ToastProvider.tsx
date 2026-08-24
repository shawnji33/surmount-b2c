'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import s from './ToastProvider.module.css';

const TOAST_VISIBLE_MS = 2400;
const TOAST_EXIT_MS = 250;

type ToastState = { message: string; open: boolean };
type ToastContextValue = { showToast: (message: string) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// Mounted once in HomeShell, which the App Router keeps alive across navigation between sibling
// /home/* routes — so this survives a DeployOverlay → /home/builder transition (or any other
// navigation-then-toast flow) as real React state, unlike the /proto/etf-builder prototype's
// version (which had to append a raw DOM node to document.body, since that route shares no
// layout with /home/builder to hoist state into).
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const removeTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string) => {
    if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
    if (removeTimerRef.current !== null) window.clearTimeout(removeTimerRef.current);

    setToast({ message, open: false });
    requestAnimationFrame(() => requestAnimationFrame(() => setToast((t) => (t ? { ...t, open: true } : t))));

    hideTimerRef.current = window.setTimeout(() => {
      setToast((t) => (t ? { ...t, open: false } : t));
      removeTimerRef.current = window.setTimeout(() => setToast(null), TOAST_EXIT_MS);
    }, TOAST_VISIBLE_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className={s.toast} data-open={toast.open} role="status" aria-live="polite">
          <svg className={s.icon} viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.16" />
            <path d="M6 10.2 L8.7 13 L14 7.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}
