'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import s from './AccountSelectorCard.module.css';

export interface SelectableAccount {
  id: string;
  name: string;
  meta: string;
  logoSrc: string;
}

export interface AccountGroup {
  label: string;
  accounts: SelectableAccount[];
  headerAction?: { label: string; onClick?: () => void };
}

interface AccountSelectorCardProps {
  selected: SelectableAccount | null;
  onChange?: (account: SelectableAccount) => void;
  groups?: AccountGroup[];
  readOnly?: boolean;
}

export function AccountSelectorCard({
  selected,
  onChange,
  groups = [],
  readOnly = false,
}: AccountSelectorCardProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  function openDropdown() {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    setOpen(true);
  }

  function closeDropdown() {
    setOpen(false);
    setDropPos(null);
  }

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        closeDropdown();
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDropdown();
    }
    // Re-anchor on scroll so the dropdown follows the trigger
    function onScroll() {
      if (triggerRef.current) {
        const r = triggerRef.current.getBoundingClientRect();
        setDropPos({ top: r.bottom + 4, left: r.left, width: r.width });
      }
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, [open]);

  function handleSelect(account: SelectableAccount) {
    onChange?.(account);
    closeDropdown();
  }

  const dropdown = dropPos && (
    <div
      ref={dropdownRef}
      className={s.dropdown}
      style={{ top: dropPos.top, left: dropPos.left, width: dropPos.width }}
    >
      {groups.map(group => (
        <div key={group.label}>
          <div className={s.sectionRow}>
            <span className={s.sectionLabel}>{group.label}</span>
            {group.headerAction && (
              <button type="button" className={s.updateBtn} onClick={group.headerAction.onClick}>
                {group.headerAction.label}
              </button>
            )}
          </div>
          {group.accounts.map(account => (
            <button
              key={account.id}
              type="button"
              className={s.accountRow}
              onClick={() => handleSelect(account)}
            >
              <div className={s.avatar}>
                <img src={account.logoSrc} alt={account.name} />
              </div>
              <div className={s.accountInfo}>
                <span className={s.accountName}>{account.name}</span>
                <span className={s.accountMeta}>{account.meta}</span>
              </div>
              <span className={[s.radio, selected?.id === account.id ? s.radioChecked : ''].filter(Boolean).join(' ')} />
            </button>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className={s.root}>
      <button
        ref={triggerRef}
        type="button"
        className={[s.card, open ? s.cardOpen : '', !selected ? s.cardEmpty : ''].filter(Boolean).join(' ')}
        onClick={() => !readOnly && (open ? closeDropdown() : openDropdown())}
        aria-expanded={open}
        style={readOnly ? { cursor: 'default' } : undefined}
      >
        {selected ? (
          <>
            <div className={s.logoWrap}>
              <img src={selected.logoSrc} alt={selected.name} />
            </div>
            <div className={s.info}>
              <span className={s.name}>{selected.name}</span>
              <span className={s.meta}>{selected.meta}</span>
            </div>
          </>
        ) : (
          <span className={s.placeholder}>Select an account</span>
        )}
        {!readOnly && (
          <svg
            className={[s.chevron, open ? s.chevronOpen : ''].filter(Boolean).join(' ')}
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {mounted && open && groups.length > 0 && createPortal(dropdown, document.body)}
    </div>
  );
}
