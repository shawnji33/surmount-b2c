'use client';

import { Button } from '@/components/Button';
import { CheckCircle, X } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import s from '../SettingsModal.module.css';

const SUPPORT_EMAIL = 'support@surmount.ai';

// Prefilled from the signed-in account (matches the General tab mock identity).
const ACCOUNT_NAME = 'Logan Weaver';
const ACCOUNT_EMAIL = 'logan@surmount.com';

export function ModalShell({
  title,
  subtitle,
  onClose,
  wide = false,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
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
      className={s.confirmOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={[s.supportModal, wide ? s.supportModalWide : ''].filter(Boolean).join(' ')}>
        <div className={s.supportModalHead}>
          <div className={s.supportModalHeadText}>
            <h2 className={s.confirmTitle}>{title}</h2>
            <p className={s.supportModalSub}>{subtitle}</p>
          </div>
          <button type="button" className={s.supportModalClose} onClick={onClose} aria-label="Close">
            <X weight="regular" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function ContactModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState(ACCOUNT_NAME);
  const [email, setEmail] = useState(ACCOUNT_EMAIL);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !description.trim()) {
      setError('Please fill out every field before sending.');
      return;
    }
    setError('');
    // No backend — hand off to the user's mail client with the message prefilled.
    const subject = encodeURIComponent(`Support request from ${name.trim()}`);
    const body = encodeURIComponent(`${description.trim()}\n\n— ${name.trim()} (${email.trim()})`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <ModalShell
      title="Contact us"
      subtitle="Email us about your issue and we'll respond promptly."
      onClose={onClose}
    >
      {sent ? (
        <div className={s.supportSent}>
          <CheckCircle className={s.supportSentIcon} weight="fill" aria-hidden="true" />
          <span className={s.supportSentTitle}>Message sent</span>
          <span className={s.supportSentSub}>Thanks for reaching out — our team will get back to you shortly.</span>
          <Button type="button" variant="secondary" fullWidth={false} onClick={onClose}>
            Done
          </Button>
        </div>
      ) : (
        <form className={s.supportForm} onSubmit={handleSubmit}>
          <div className={s.supportField}>
            <label className={s.fieldLabel} htmlFor="contact-name">
              Name
            </label>
            <input
              id="contact-name"
              className={s.supportInput}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
            />
          </div>

          <div className={s.supportField}>
            <label className={s.fieldLabel} htmlFor="contact-email">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              className={s.supportInput}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
            />
          </div>

          <div className={s.supportField}>
            <label className={s.fieldLabel} htmlFor="contact-description">
              Description
            </label>
            <textarea
              id="contact-description"
              className={s.textarea}
              rows={4}
              placeholder="Describe your issue or question…"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError('');
              }}
            />
          </div>

          {error && <span className={s.fieldError}>{error}</span>}

          <Button type="submit" variant="primary">
            Send message
          </Button>
        </form>
      )}
    </ModalShell>
  );
}
