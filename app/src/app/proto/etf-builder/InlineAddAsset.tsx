'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MagnifyingGlass, Plus } from '@phosphor-icons/react';
import { ENRICHED_ASSETS, DEFAULT_ASSET_FILTERS, filterAssets, type AssetFilterState } from './_data';
import { AssetFilterPopover } from './AssetFilterPopover';
import { MinimalAssetRow } from './MinimalAssetRow';
import s from './InlineAddAsset.module.css';

// Trigger row lives in the same column as the allocation rows above it, but the search/filter/list
// itself is a floating dropdown anchored under the trigger — it overlays whatever is below instead
// of pushing the page down.
export function InlineAddAsset({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (ticker: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<AssetFilterState>(DEFAULT_ASSET_FILTERS);
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => filterAssets(ENRICHED_ASSETS, filters), [filters]);

  useEffect(() => {
    if (!open) return undefined;
    function onDocPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
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
    <div className={s.root} ref={rootRef}>
      <button
        type="button"
        className={s.trigger}
        data-open={open}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={s.avatar} aria-hidden="true">
          <Plus weight="bold" />
        </span>
        {open ? 'Adding an asset…' : 'Add an asset'}
      </button>

      <div className={s.panel} data-open={open} inert={!open}>
        <div className={s.searchRow}>
          <div className={s.searchWrap}>
            <MagnifyingGlass weight="regular" className={s.searchIcon} aria-hidden="true" />
            <input
              type="text"
              className={s.searchInput}
              placeholder="Search ticker or name"
              aria-label="Search stocks and ETFs"
              value={filters.query}
              onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
            />
          </div>
          <AssetFilterPopover filters={filters} onChange={setFilters} compact />
        </div>

        <div className={s.listCard}>
          <div className={s.list}>
            {filtered.map((asset) => (
              <MinimalAssetRow
                key={asset.ticker}
                asset={asset}
                selected={selected.includes(asset.ticker)}
                onToggle={() => onToggle(asset.ticker)}
              />
            ))}
            {filtered.length === 0 && <p className={s.empty}>No stocks or ETFs match these filters</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
