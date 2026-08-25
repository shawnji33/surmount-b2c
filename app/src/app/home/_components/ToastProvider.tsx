'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import s from './ToastProvider.module.css';

const TOAST_VISIBLE_MS = 2400;
const TOAST_EXIT_MS = 250;

type ToastAction = { label: string; onClick: () => void };
type ToastOptions = { message: string; durationMs?: number; action?: ToastAction };
type ToastState = ToastOptions & { open: boolean };
type ToastContextValue = { showToast: (toast: string | ToastOptions) => void };

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

  const clearTimers = useCallback(() => {
    if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
    if (removeTimerRef.current !== null) window.clearTimeout(removeTimerRef.current);
    hideTimerRef.current = null;
    removeTimerRef.current = null;
  }, []);

  const dismissToast = useCallback(() => {
    clearTimers();
    setToast((current) => (current ? { ...current, open: false } : current));
    removeTimerRef.current = window.setTimeout(() => setToast(null), TOAST_EXIT_MS);
  }, [clearTimers]);

  const showToast = useCallback((input: string | ToastOptions) => {
    clearTimers();
    const nextToast = typeof input === 'string' ? { message: input } : input;

    setToast({ ...nextToast, open: false });
    requestAnimationFrame(() => requestAnimationFrame(() => setToast((t) => (t ? { ...t, open: true } : t))));

    hideTimerRef.current = window.setTimeout(() => {
      dismissToast();
    }, nextToast.durationMs ?? TOAST_VISIBLE_MS);
  }, [clearTimers, dismissToast]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className={s.toast}
          data-open={toast.open}
          data-interactive={toast.action ? 'true' : 'false'}
          role="status"
          aria-live="polite"
        >
          <svg className={s.icon} viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.16" />
            <path d="M6 10.2 L8.7 13 L14 7.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              className={s.action}
              onClick={() => {
                const callback = toast.action?.onClick;
                dismissToast();
                callback?.();
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </ToastContext.Provider>
  );
}
