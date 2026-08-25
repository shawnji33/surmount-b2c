'use client';

import { Camera, CheckCircle } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import s from '../SettingsModal.module.css';
import { PhoneVerify } from './PhoneVerify';

export function GeneralPanel() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('Logan');
  const [lastName, setLastName] = useState('Weaver');
  const [bio, setBio] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const email = 'logan@surmount.com';
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || 'L';

  // Auto-save toast — slides in from the top-right when a field is edited then blurred.
  const [mounted, setMounted] = useState(false);
  const [toastShown, setToastShown] = useState(false);
  const [toastLeaving, setToastLeaving] = useState(false);
  const savedValues = useRef<Record<string, string>>({ firstName: 'Logan', lastName: 'Weaver', bio: '' });
  const hideTimer = useRef<number | undefined>(undefined);
  const leaveTimer = useRef<number | undefined>(undefined);

  useEffect(() => setMounted(true), []);
  useEffect(
    () => () => {
      if (hideTimer.current != null) window.clearTimeout(hideTimer.current);
      if (leaveTimer.current != null) window.clearTimeout(leaveTimer.current);
    },
    [],
  );

  function showSaved() {
    if (hideTimer.current != null) window.clearTimeout(hideTimer.current);
    if (leaveTimer.current != null) window.clearTimeout(leaveTimer.current);
    setToastLeaving(false);
    setToastShown(true);
    hideTimer.current = window.setTimeout(() => {
      setToastLeaving(true);
      leaveTimer.current = window.setTimeout(() => {
        setToastShown(false);
        setToastLeaving(false);
      }, 220);
    }, 2400);
  }

  // Save on blur only when the value actually changed.
  function saveOnBlur(field: 'firstName' | 'lastName' | 'bio', value: string) {
    if (savedValues.current[field] === value) return;
    savedValues.current[field] = value;
    showSaved();
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarUrl(URL.createObjectURL(file));
      showSaved();
    }
  }

  return (
    <div className={s.panel}>
      <div className={s.section}>
        <h3 className={s.sectionTitle}>Profile</h3>

        {/* Avatar */}
        <div className={s.profileRow}>
          <div className={s.fieldText}>
            <span className={s.fieldLabel}>Avatar</span>
            <span className={s.fieldSub}>Upload a photo to personalize your account.</span>
          </div>
          <button
            type="button"
            className={s.avatarBtn}
            onClick={() => fileRef.current?.click()}
            aria-label="Change avatar"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className={s.avatarImg} />
            ) : (
              <span className={s.avatarInitials}>{initials}</span>
            )}
            <span className={s.avatarBadge} aria-hidden="true">
              <Camera weight="fill" />
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
        </div>

        {/* First name */}
        <div className={s.profileRow}>
          <label className={s.fieldLabel} htmlFor="profile-first-name">
            First name
          </label>
          <input
            id="profile-first-name"
            className={s.textControl}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={(e) => saveOnBlur('firstName', e.target.value)}
          />
        </div>

        {/* Last name */}
        <div className={s.profileRow}>
          <label className={s.fieldLabel} htmlFor="profile-last-name">
            Last name
          </label>
          <input
            id="profile-last-name"
            className={s.textControl}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={(e) => saveOnBlur('lastName', e.target.value)}
          />
        </div>

        {/* Biography */}
        <div className={s.profileRowStacked}>
          <div className={s.fieldText}>
            <label className={s.fieldLabel} htmlFor="profile-bio">
              Biography
            </label>
            <span className={s.fieldSub}>Tell us a little about yourself and your investing goals.</span>
          </div>
          <textarea
            id="profile-bio"
            className={s.textarea}
            rows={3}
            placeholder="e.g. Long-term investor focused on tech and clean energy."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            onBlur={(e) => saveOnBlur('bio', e.target.value)}
          />
        </div>

        {/* Email (read-only) */}
        <div className={s.profileRow}>
          <div className={s.fieldText}>
            <span className={s.fieldLabel}>Email</span>
            <span className={s.fieldSub}>Your email can&apos;t be changed.</span>
          </div>
          <span className={s.readonlyValue}>{email}</span>
        </div>

        {/* Phone number */}
        <div className={s.profileRowStacked}>
          <div className={s.fieldText}>
            <span className={s.fieldLabel}>Phone number</span>
            <span className={s.fieldSub}>
              Enter a new number and verify it with a one-time code to update it.
            </span>
          </div>
          <PhoneVerify initialPhone="(555) 014 2042" startVerified />
        </div>
      </div>

      {mounted &&
        toastShown &&
        createPortal(
          <div className={s.toastRegion} aria-live="polite" aria-atomic="true">
            <div className={[s.toastAlert, toastLeaving ? s.toastAlertLeaving : ''].filter(Boolean).join(' ')}>
              <CheckCircle className={s.toastIcon} weight="fill" aria-hidden="true" />
              <p className={s.toastText}>Saved</p>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
