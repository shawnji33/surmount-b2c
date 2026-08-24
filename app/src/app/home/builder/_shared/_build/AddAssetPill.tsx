'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MagnifyingGlass, Plus, X } from '@phosphor-icons/react';
import { ASSET_UNIVERSE } from '../../_data';
import { DEFAULT_ASSET_FILTERS, filterAssets } from '../_lib/assetFilters';
import type { AssetFilterState } from '../types';
import { AssetFilterPopover } from '../AssetFilterPopover';
import { MinimalAssetRow } from './MinimalAssetRow';
import s from './AddAssetPill.module.css';

// Lives in the allocation header, to the left of the Equal/Custom tabs — always visible
// regardless of how long the holdings list grows below it, unlike the old bottom-of-list trigger
// it replaces. Clicking it morphs the pill itself into a search bar (width transition, content
// swap) rather than opening a separate panel next to a static button; the results list drops
// down from it as a viewport-measured, portaled panel (same technique as AssetFilterPopover) so
// it can never get clipped by a scrolling ancestor or the bottom of the viewport.
export function AddAssetPill({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (ticker: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<AssetFilterState>(DEFAULT_ASSET_FILTERS);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const filtered = filterAssets(ASSET_UNIVERSE, filters);

  function measure() {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({ top: rect.bottom + 8, left: rect.left });
  }

  // .root's own left edge moves during the open/close width transition: .header lays its two
  // halves out with justify-content:space-between, so growing .root from 116px to 300px pushes
  // the whole right-hand group (and .root's left edge with it) leftward to stay right-anchored.
  // A single measurement taken at open-time captures the pre-shift position and goes stale the
  // moment the transition settles — ResizeObserver re-measures on every frame of that shift, and
  // the resize listener covers viewport-level reflow that doesn't touch .root's own box size.
  useLayoutEffect(() => {
    if (!open) return undefined;
    measure();
    const el = rootRef.current;
    const observer = el ? new ResizeObserver(() => measure()) : null;
    if (el && observer) observer.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
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
      // Nested popovers (the compact filter icon inside the expanded search bar) portal their own
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
            <Plus weight="bold" />
            Add asset
          </button>
        )}
      </div>

      {open && createPortal(
        <div ref={panelRef} className={s.panel} style={{ top: coords.top, left: coords.left }}>
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
