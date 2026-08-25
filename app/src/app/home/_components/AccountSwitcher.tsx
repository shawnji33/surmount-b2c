'use client';

import { CaretDown, Check } from '@phosphor-icons/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ACCOUNT_SWITCHER_ACCOUNTS } from '../_data';
import { formatPortfolioCurrency } from '../_helpers';
import { SwitcherAccountLogo } from './SwitcherAccountLogo';
import s from '../page.module.css';

export function AccountSwitcher({
  selected,
  onToggle,
}: {
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropPos, setDropPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef  = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const openDropdown = useCallback(() => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 4, left: r.left });
    }
    setOpen(true);
  }, []);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setDropPos(null);
  }, []);

  const toggleOpen = () => (open ? closeDropdown() : openDropdown());

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !dropdownRef.current?.contains(t)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closeDropdown]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDropdown(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, closeDropdown]);

  // Re-anchor dropdown to trigger on scroll
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (triggerRef.current) {
        const r = triggerRef.current.getBoundingClientRect();
        setDropPos({ top: r.bottom + 4, left: r.left });
      }
    };
    window.addEventListener('scroll', update, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', update, { capture: true });
  }, [open]);

  const allSelected = selected.size === ACCOUNT_SWITCHER_ACCOUNTS.length;
  const selectedAccounts = ACCOUNT_SWITCHER_ACCOUNTS.filter(a => selected.has(a.id));
  const visibleAvatars   = selectedAccounts.slice(0, 2);
  const overflowCount    = selectedAccounts.length > 2 ? selectedAccounts.length - 2 : 0;

  const label = allSelected
    ? 'All investing accounts'
    : selected.size === 1
      ? (ACCOUNT_SWITCHER_ACCOUNTS.find(a => selected.has(a.id))?.name ?? '1 account')
      : `${selected.size} investing accounts`;

  const dropdown = (
    <div
      ref={dropdownRef}
      className={s.switcherDropdown}
      style={{ top: dropPos?.top, left: dropPos?.left }}
      role="listbox"
      aria-multiselectable="true"
    >
      {ACCOUNT_SWITCHER_ACCOUNTS.map(acct => {
        const isOn = selected.has(acct.id);
        const isLast = isOn && selected.size === 1;
        return (
          <button
            key={acct.id}
            type="button"
            className={[s.switcherAccountRow, isLast ? s.switcherAccountRowLocked : ''].filter(Boolean).join(' ')}
            onClick={() => onToggle(acct.id)}
            role="option"
            aria-selected={isOn}
            aria-disabled={isLast}
          >
            <SwitcherAccountLogo account={acct} className={s.switcherAccountLogo} />
            <div className={s.switcherAccountInfo}>
              <span className={s.switcherAccountName}>{acct.name}</span>
              <span className={s.switcherAccountValue}>{formatPortfolioCurrency(acct.value)}</span>
            </div>
            <span className={[s.switcherCheckbox, isOn ? s.switcherCheckboxSelected : ''].filter(Boolean).join(' ')}>
              {isOn && <Check weight="bold" aria-hidden="true" />}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={[s.switcherTrigger, open ? s.switcherTriggerOpen : ''].filter(Boolean).join(' ')}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={s.switcherAvatarStack} aria-hidden="true">
          {visibleAvatars.map(a => (
            <SwitcherAccountLogo key={a.id} account={a} className={s.switcherAvatar} />
          ))}
          {overflowCount > 0 && (
            <span className={s.switcherAvatarOverflow}>+{overflowCount}</span>
          )}
        </span>
        <span key={label} className={s.switcherLabel}>{label}</span>
        <CaretDown className={s.switcherChevron} weight="bold" aria-hidden="true" />
      </button>
      {mounted && open && dropPos && createPortal(dropdown, document.body)}
    </>
  );
}
