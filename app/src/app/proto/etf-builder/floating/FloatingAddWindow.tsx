'use client';

import { useMemo, useState, type RefObject } from 'react';
import { motion, useDragControls } from 'motion/react';
import { ArrowsIn, ArrowsOut, MagnifyingGlass } from '@phosphor-icons/react';
import { ENRICHED_ASSETS, DEFAULT_ASSET_FILTERS, filterAssets, type AssetFilterState } from '../_data';
import { AssetFilterPopover } from '../AssetFilterPopover';
import { MinimalAssetRow } from '../MinimalAssetRow';
import s from './FloatingAddWindow.module.css';

export function FloatingAddWindow({
  expanded,
  onToggleExpanded,
  selected,
  onToggle,
  boundsRef,
}: {
  expanded: boolean;
  onToggleExpanded: () => void;
  selected: string[];
  onToggle: (ticker: string) => void;
  boundsRef: RefObject<HTMLDivElement | null>;
}) {
  const [filters, setFilters] = useState<AssetFilterState>(DEFAULT_ASSET_FILTERS);
  const dragControls = useDragControls();

  const filtered = useMemo(() => filterAssets(ENRICHED_ASSETS, filters), [filters]);

  return (
    <motion.div
      className={s.window}
      data-open={expanded}
      role="dialog"
      aria-label="Add assets"
      drag
      dragListener={false}
      dragControls={dragControls}
      dragMomentum
      dragTransition={{ power: 0.3, timeConstant: 300, bounceStiffness: 400, bounceDamping: 40 }}
      dragElastic={0.12}
      dragConstraints={boundsRef}
    >
      <div className={s.collapsedInner} inert={expanded} onPointerDown={(e) => dragControls.start(e)}>
        <span className={s.collapsedLabel}>Add assets</span>
        <button
          type="button"
          className={s.iconBtn}
          onClick={onToggleExpanded}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Expand add assets panel"
        >
          <ArrowsOut weight="regular" />
        </button>
      </div>

      <div className={s.expandedInner} inert={!expanded}>
        <div className={s.header} onPointerDown={(e) => dragControls.start(e)}>
          <span className={s.headerLabel}>Add assets</span>
          <button
            type="button"
            className={s.iconBtn}
            onClick={onToggleExpanded}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Minimize add assets panel"
          >
            <ArrowsIn weight="regular" />
          </button>
        </div>

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
    </motion.div>
  );
}
