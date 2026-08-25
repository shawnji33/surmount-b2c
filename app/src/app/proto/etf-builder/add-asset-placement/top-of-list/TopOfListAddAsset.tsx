'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MagnifyingGlass, Plus, X } from '@phosphor-icons/react';
import { ASSET_UNIVERSE } from '@/app/home/builder/_data';
import { DEFAULT_ASSET_FILTERS, filterAssets } from '@/app/home/builder/_shared/_lib/assetFilters';
import type { AssetFilterState } from '@/app/home/builder/_shared/types';
import { AssetFilterPopover } from '@/app/home/builder/_shared/AssetFilterPopover';
import { MinimalAssetRow } from '@/app/home/builder/_shared/_build/MinimalAssetRow';
import s from './TopOfListAddAsset.module.css';

// The variant under test: same morph-to-search interaction and portaled/viewport-measured dropdown
// technique as the shipped AddAssetPill (see that file's own comment for the rationale on why the
// panel is portaled rather than absolutely positioned), but shaped as a full-width row that sits
// first inside AllocationSection's holdings list instead of a pill in the header. Visually it
// borrows HoldingRow's card treatment (border, radius, shadow, row rhythm) so it reads as "the
// first row" rather than a separate control floating above the list.
export function TopOfListAddAsset({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (ticker: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<AssetFilterState>(DEFAULT_ASSET_FILTERS);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const filtered = filterAssets(ASSET_UNIVERSE, filters);

  function measure() {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({ top: rect.bottom + 8, left: rect.left, width: rect.width });
  }

  useLayoutEffect(() => {
    if (!open) return undefined;
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function onDocPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      // Nested popovers (the compact filter icon inside the expanded search row) portal their own
      // panel to document.body too — a click landing there is still "inside" this interaction.
      if (target instanceof Element && target.closest('[data-portal-panel]')) return;
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onDocPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onDocPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <>
      <div className={s.root} ref={rootRef} data-open={open}>
        {open ? (
          <div className={s.searchRow}>
            <MagnifyingGlass weight="regular" className={s.searchIcon} aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              className={s.searchInput}
              placeholder="Search ticker or name"
              aria-label="Search stocks and ETFs"
              autoComplete="off"
              spellCheck={false}
              data-1p-ignore
              data-lpignore="true"
              value={filters.query}
              onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
            />
            <AssetFilterPopover filters={filters} onChange={setFilters} compact />
            <button type="button" className={s.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
              <X weight="bold" />
            </button>
          </div>
        ) : (
          <button type="button" className={s.trigger} onClick={() => setOpen(true)}>
            <span className={s.triggerIcon} aria-hidden="true">
              <Plus weight="bold" />
            </span>
            <span className={s.triggerText}>Add asset</span>
            <span className={s.triggerHint}>Search stocks &amp; ETFs</span>
          </button>
        )}
      </div>

      {open && createPortal(
        <div ref={panelRef} className={s.panel} style={{ top: coords.top, left: coords.left, width: Math.max(coords.width, 320) }}>
          {filtered.map((asset) => (
            <MinimalAssetRow
              key={asset.ticker}
              asset={asset}
              selected={selected.includes(asset.ticker)}
              onToggle={() => onToggle(asset.ticker)}
            />
          ))}
          {filtered.length === 0 && <p className={s.empty}>No stocks or ETFs match these filters</p>}
        </div>,
        document.body,
      )}
    </>
  );
}
