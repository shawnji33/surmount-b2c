'use client';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { PASSWORD_REQS, passwordMeetsAll, unmetRequirements } from '@/lib/password';
import { CheckCircle, Circle, Eye, EyeSlash, WarningCircle, X } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import s from '../SettingsModal.module.css';

export function PasswordModal({
  hasExistingPassword = true,
  onClose,
  onSaved,
}: {
  hasExistingPassword?: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nextFocused, setNextFocused] = useState(false);
  const [nextError, setNextError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  // Local toast
  const [toast, setToast] = useState('');
  const [toastTone, setToastTone] = useState<'success' | 'error'>('error');
  const [toastLeaving, setToastLeaving] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);
  const toastLeaveTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(
    () => () => {
      if (toastTimer.current != null) window.clearTimeout(toastTimer.current);
      if (toastLeaveTimer.current != null) window.clearTimeout(toastLeaveTimer.current);
    },
    [],
  );

  function dismissToast() {
    if (toastLeaveTimer.current != null) window.clearTimeout(toastLeaveTimer.current);
    setToastLeaving(true);
    toastLeaveTimer.current = window.setTimeout(() => {
      setToast('');
      setToastLeaving(false);
    }, 220);
  }

  function showToast(message: string, tone: 'success' | 'error') {
    if (toastTimer.current != null) window.clearTimeout(toastTimer.current);
    setToastLeaving(false);
    setToastTone(tone);
    setToast(message);
    toastTimer.current = window.setTimeout(dismissToast, 4200);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let ok = true;

    if (!passwordMeetsAll(next)) {
      setNextError('Password does not meet the requirements.');
      const missing = unmetRequirements(next).map((r) => r.label.toLowerCase());
      showToast(`Your password still needs: ${missing.join(', ')}.`, 'error');
      ok = false;
    }
    if (confirm !== next) {
      setConfirmError('Passwords do not match.');
      if (ok) showToast('The new passwords do not match.', 'error');
      ok = false;
    }
    if (!ok) return;

    showToast('Password updated.', 'success');
    onSaved?.();
    window.setTimeout(onClose, 600);
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div className={s.pwOverlay} onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Change password">
      {toast !== '' && (
        <div className={s.toastRegion} aria-live="polite" aria-atomic="true">
          <div
            className={[s.toastAlert, toastTone === 'error' ? s.toastAlertError : '', toastLeaving ? s.toastAlertLeaving : '']
              .filter(Boolean)
              .join(' ')}
          >
            {toastTone === 'error' ? (
              <WarningCircle className={s.toastIcon} weight="fill" aria-hidden="true" />
            ) : (
              <CheckCircle className={s.toastIcon} weight="fill" aria-hidden="true" />
            )}
            <p className={s.toastText}>{toast}</p>
            <button type="button" className={s.toastDismiss} onClick={dismissToast} aria-label="Dismiss">
              <X weight="bold" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <div className={s.pwModal}>
        <div className={s.pwModalHeader}>
          <h2 className={s.pwModalTitle}>{hasExistingPassword ? 'Change password' : 'Set a password'}</h2>
          <button type="button" className={s.closeBtn} onClick={onClose} aria-label="Close" style={{ position: 'static' }}>
            <X weight="regular" aria-hidden="true" />
          </button>
        </div>
        <p className={s.pwModalSub}>
          {hasExistingPassword
            ? 'Choose a new password for your Surmount account.'
            : 'Create a password to secure your Surmount account.'}
        </p>

        <form className={s.pwForm} onSubmit={handleSubmit}>
          <div className={s.pwField}>
            <Input
              size="sm"
              label="New password"
              name="new-password"
              type={showNext ? 'text' : 'password'}
              autoComplete="new-password"
              value={next}
              error={Boolean(nextError)}
              errorText={nextError || undefined}
              aria-describedby="new-password-requirements"
              onChange={(e) => {
                setNext(e.target.value);
                setNextError('');
              }}
              onFocus={() => setNextFocused(true)}
              onBlur={() => setNextFocused(false)}
              iconTrailing={
                <button
                  type="button"
                  className={s.eyeButton}
                  aria-label={showNext ? 'Hide password' : 'Show password'}
                  onClick={() => setShowNext((v) => !v)}
                >
                  {showNext ? <EyeSlash weight="regular" aria-hidden="true" /> : <Eye weight="regular" aria-hidden="true" />}
                </button>
              }
            />

            {(nextFocused || Boolean(nextError)) && (
              <div id="new-password-requirements" className={s.pwReqs} role="status" aria-live="polite">
                <span className={s.pwReqsTitle}>Your password must include:</span>
                <ul className={s.pwReqsList}>
                  {PASSWORD_REQS.map((req) => {
                    const met = req.test(next);
                    return (
                      <li key={req.id} className={met ? `${s.pwReqItem} ${s.pwReqItemMet}` : s.pwReqItem}>
                        {met ? (
                          <CheckCircle weight="fill" className={s.pwReqIcon} aria-hidden="true" />
                        ) : (
                          <Circle weight="regular" className={s.pwReqIcon} aria-hidden="true" />
                        )}
                        <span>{req.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <Input
            size="sm"
            label="Confirm new password"
            name="confirm-password"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm}
            error={Boolean(confirmError)}
            errorText={confirmError || undefined}
            onChange={(e) => {
              setConfirm(e.target.value);
              setConfirmError('');
            }}
            iconTrailing={
              <button
                type="button"
                className={s.eyeButton}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? <EyeSlash weight="regular" aria-hidden="true" /> : <Eye weight="regular" aria-hidden="true" />}
              </button>
            }
          />

          <div className={s.pwActions}>
            <Button type="submit">{hasExistingPassword ? 'Update password' : 'Set password'}</Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
