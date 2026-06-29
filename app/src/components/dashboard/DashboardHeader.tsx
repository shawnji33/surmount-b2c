'use client';

import {
  ArrowDown,
  ArrowUp,
  CaretDown,
  CaretRight,
  MagnifyingGlass,
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import s from './DashboardHeader.module.css';

type DashboardHeaderProps = {
  title?: string;
  leadingContent?: ReactNode;
  onDeposit?: () => void;
  onWithdraw?: () => void;
};

function TransferMoneyMenu({ onDeposit, onWithdraw }: { onDeposit?: () => void; onWithdraw?: () => void }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropPos, setDropPos] = useState<{ top: number; right: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openMenu = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
        width: rect.width,
      });
    }
    setOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setDropPos(null);
  }, []);

  const toggleOpen = () => (open ? closeMenu() : openMenu());

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        closeMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMenu, open]);

  const transferItems = [
    { label: 'Deposit', icon: ArrowDown, tone: s.transferIconGreen, action: () => { closeMenu(); onDeposit?.(); } },
    { label: 'Withdraw', icon: ArrowUp, tone: s.transferIconBlue, action: () => { closeMenu(); onWithdraw?.(); } },
  ];

  const menu = (
    <div
      ref={menuRef}
      className={s.transferDropdown}
      style={{ top: dropPos?.top, right: dropPos?.right, minWidth: dropPos?.width }}
      role="menu"
      aria-label="Transfer money"
    >
      {transferItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.label}
            type="button"
            className={s.transferMenuItem}
            role="menuitem"
            onClick={item.action ?? closeMenu}
          >
            <span className={[s.transferMenuIcon, item.tone].join(' ')} aria-hidden="true">
              <Icon weight="bold" />
            </span>
            <strong>{item.label}</strong>
            <CaretRight className={s.transferMenuChevron} weight="bold" aria-hidden="true" />
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
        className={[s.headerActionButton, open ? s.headerActionButtonOpen : ''].filter(Boolean).join(' ')}
        onClick={toggleOpen}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <img
          src="/assets/figma/transfer-money-avatar.png"
          alt=""
          className={s.transferTriggerAvatar}
          aria-hidden="true"
        />
        <span>Transfer money</span>
        <img
          src="/assets/figma/transfer-money-chevron.svg"
          alt=""
          className={s.headerActionChevron}
          aria-hidden="true"
        />
      </button>
      {mounted && open && dropPos && createPortal(menu, document.body)}
    </>
  );
}

export function DashboardHeader({ title, leadingContent, onDeposit, onWithdraw }: DashboardHeaderProps) {
  return (
    <header className={s.pageHeader}>
      <div className={s.headerIdentity}>
        {leadingContent ?? <span className={s.title}>{title}</span>}
      </div>
      <div className={s.headerActions}>
        <TransferMoneyMenu onDeposit={onDeposit} onWithdraw={onWithdraw} />
        <div className={s.searchBox}>
          <div className={s.searchBoxInner}>
            <MagnifyingGlass className={s.searchIcon} aria-hidden="true" />
            <span className={s.searchPlaceholder}>Find an investment</span>
          </div>
          <span className={s.searchShortcut}>⌘K</span>
        </div>
      </div>
    </header>
  );
}
