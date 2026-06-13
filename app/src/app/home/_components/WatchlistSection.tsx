'use client';

import { FunnelSimple } from '@phosphor-icons/react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { WATCHLIST, WATCHLIST_SORT_OPTIONS, type WatchlistSortKey } from '../_data';
import s from '../page.module.css';

export function WatchlistSection() {
  const [sortKey, setSortKey] = useState<WatchlistSortKey>('todayReturn');
  const [sortOpen, setSortOpen] = useState(false);
  const [sortPos, setSortPos] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeSortMenu = useCallback(() => {
    setSortOpen(false);
    setSortPos(null);
  }, []);

  const openSortMenu = useCallback(() => {
    if (sortButtonRef.current) {
      const rect = sortButtonRef.current.getBoundingClientRect();
      setSortPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setSortOpen(true);
  }, []);

  const toggleSortMenu = () => (sortOpen ? closeSortMenu() : openSortMenu());

  useEffect(() => {
    if (!sortOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!sortButtonRef.current?.contains(target) && !sortMenuRef.current?.contains(target)) {
        closeSortMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSortMenu();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeSortMenu, sortOpen]);

  const sortedItems = useMemo(() => {
    const keyMap: Record<WatchlistSortKey, 'todayReturn' | 'totalValue' | 'priceValue'> = {
      todayReturn: 'todayReturn',
      totalValue: 'totalValue',
      price: 'priceValue',
    };

    const numericKey = keyMap[sortKey];

    return [...WATCHLIST].sort((a, b) => {
      const delta = b[numericKey] - a[numericKey];
      return delta || a.name.localeCompare(b.name);
    });
  }, [sortKey]);

  const activeSortLabel = WATCHLIST_SORT_OPTIONS.find((option) => option.key === sortKey)?.label ?? 'Sort';

  const sortMenu = (
    <div
      ref={sortMenuRef}
      className={s.watchlistSortMenu}
      style={{ top: sortPos?.top, right: sortPos?.right }}
      role="menu"
      aria-label="Sort watchlist"
    >
      <div className={s.watchlistSortTitle}>Sort by</div>
      <div className={s.watchlistSortOptions}>
        {WATCHLIST_SORT_OPTIONS.map((option) => {
          const selected = option.key === sortKey;

          return (
            <button
              key={option.key}
              type="button"
              className={s.watchlistSortOption}
              role="menuitemradio"
              aria-checked={selected}
              onClick={() => {
                setSortKey(option.key);
                closeSortMenu();
              }}
            >
              <span>{option.label}</span>
              <span
                className={[
                  s.watchlistSortRadio,
                  selected ? s.watchlistSortRadioSelected : '',
                ].filter(Boolean).join(' ')}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <section className={s.watchlistSection} aria-label="Watchlist">
      <div className={s.sectionHeader}>
        <span className={s.sectionTitle}>Watchlist</span>
        <div className={s.watchlistControls} aria-label="Watchlist controls">
          <span className={s.watchlistRangePill} aria-label="1 day performance">
            1D
          </span>
          <button
            ref={sortButtonRef}
            type="button"
            className={[s.watchlistSortButton, sortOpen ? s.watchlistSortButtonOpen : ''].filter(Boolean).join(' ')}
            onClick={toggleSortMenu}
            aria-label={`Sort by ${activeSortLabel}`}
            aria-haspopup="menu"
            aria-expanded={sortOpen}
          >
            <FunnelSimple weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className={s.watchlistCard}>
        {sortedItems.map((item) => {
          const primaryValue = sortKey === 'price' ? item.price : item.value;
          const secondaryValue = sortKey === 'price' ? 'Price' : item.changePct;
          const secondaryTone = sortKey === 'price'
            ? s.watchlistChangeMuted
            : item.todayReturn < 0
              ? s.watchlistChangeNegative
              : '';

          return (
            <Link
              key={item.id}
              href={item.href}
              className={s.watchlistRow}
            >
              <div className={s.watchlistCover}>
                <img src={item.cover} alt={item.name} />
              </div>
              <div className={s.watchlistInfo}>
                <span className={s.watchlistName}>{item.name}</span>
                <span className={s.watchlistCategory}>{item.category}</span>
              </div>
              <div className={s.watchlistRight}>
                <span className={s.watchlistValue}>{primaryValue}</span>
                <span className={[s.watchlistChange, secondaryTone].filter(Boolean).join(' ')}>
                  {secondaryValue}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      {mounted && sortOpen && sortPos && createPortal(sortMenu, document.body)}
    </section>
  );
}
