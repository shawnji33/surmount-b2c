'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CaretDown, CaretUp, X } from '@phosphor-icons/react';
import { ClearableSearchInput } from '@/app/home/builder/_shared/ClearableSearchInput';
import { ENRICHED_ASSETS, DEFAULT_ASSET_FILTERS, filterAssets, type AssetFilterState } from '../_data';
import { AssetRow } from '../AssetRow';
import { AssetFilterPopover } from '../AssetFilterPopover';
import s from './PickStep.module.css';

const FADE_SIZE = 32;

export function PickStep({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (ticker: string) => void;
}) {
  const [filters, setFilters] = useState<AssetFilterState>(DEFAULT_ASSET_FILTERS);
  const [panelOpen, setPanelOpen] = useState(false);
  const [fadeTop, setFadeTop] = useState(false);
  const [fadeBottom, setFadeBottom] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => filterAssets(ENRICHED_ASSETS, filters), [filters]);
  const filteredKey = filtered.map((asset) => asset.ticker).join('|');
  const [listMotion, setListMotion] = useState(false);
  const previousFilteredKeyRef = useRef(filteredKey);

  const selectedAssets = ENRICHED_ASSETS.filter((a) => selected.includes(a.ticker));

  useEffect(() => {
    const el = listRef.current;
    if (!el) return undefined;
    function update() {
      if (!el) return;
      setFadeTop(el.scrollTop > 2);
      setFadeBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 2);
    }
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [filtered.length]);

  useEffect(() => {
    if (previousFilteredKeyRef.current === filteredKey) return undefined;
    previousFilteredKeyRef.current = filteredKey;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setListMotion(false);
      return undefined;
    }

    setListMotion(true);
    const timer = window.setTimeout(() => setListMotion(false), 220);
    return () => window.clearTimeout(timer);
  }, [filteredKey]);

  const topStop = fadeTop ? `transparent 0px, black ${FADE_SIZE}px` : `black 0px, black ${FADE_SIZE}px`;
  const bottomStop = fadeBottom
    ? `black calc(100% - ${FADE_SIZE}px), transparent 100%`
    : `black calc(100% - ${FADE_SIZE}px), black 100%`;
  const listMaskImage = `linear-gradient(to bottom, ${topStop}, ${bottomStop})`;

  return (
    <div className={s.screen}>
      <h1 className={s.heading}>Which stocks and ETFs do you want to add to this strategy?</h1>

      <div className={s.stepBody}>
        <div className={s.searchRow}>
          <ClearableSearchInput
            value={filters.query}
            onChange={(query) => setFilters((prev) => ({ ...prev, query }))}
            placeholder="Search ticker or company"
            ariaLabel="Search stocks and ETFs"
            className={[s.searchShadow, s.searchGrow].join(' ')}
          />

          <AssetFilterPopover filters={filters} onChange={setFilters} />
        </div>

        <div className={s.listCard}>
          <div
            className={s.list}
            ref={listRef}
            data-motion={listMotion ? 'true' : 'false'}
            style={{ WebkitMaskImage: listMaskImage, maskImage: listMaskImage }}
          >
            {filtered.map((asset) => (
              <AssetRow
                key={asset.ticker}
                asset={asset}
                selected={selected.includes(asset.ticker)}
                onToggle={() => onToggle(asset.ticker)}
              />
            ))}
            {filtered.length === 0 && <div className={s.empty}>No stocks or ETFs match these filters</div>}
          </div>
        </div>

        <div className={s.previewDock}>
          <button
            type="button"
            className={s.previewTrigger}
            data-open={panelOpen && selected.length > 0}
            onClick={() => setPanelOpen((v) => !v)}
            disabled={selected.length === 0}
          >
            <span className={s.avatarStack}>
              {selectedAssets.slice(0, 5).map((a) => (
                <span className={s.avatar} key={a.ticker}>
                  {a.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.logo} alt="" />
                  ) : (
                    <span className={s.avatarFallback} style={{ background: a.fallbackColor }}>{a.ticker.slice(0, 2)}</span>
                  )}
                </span>
              ))}
            </span>
            <span className={s.previewLabel}>
              {selected.length === 0 ? 'No stocks selected yet' : `${selected.length} selected`}
            </span>
            {selected.length > 0 && (panelOpen ? <CaretDown weight="bold" /> : <CaretUp weight="bold" />)}
          </button>

          <div className={s.revealPanel} data-open={panelOpen && selected.length > 0}>
            <div className={s.revealList}>
              {selectedAssets.map((a) => (
                <div className={s.revealRow} key={a.ticker}>
                  <span className={s.logo}>
                    {a.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.logo} alt="" />
                    ) : (
                      <span className={s.logoFallback} style={{ background: a.fallbackColor }}>{a.ticker.slice(0, 2)}</span>
                    )}
                  </span>
                  <span className={s.rowText}>
                    <span className={s.rowTitle}>{a.ticker} · {a.name}</span>
                    <span className={s.rowSub}>
                      {a.price}
                      <span className={a.positive ? s.pos : s.neg}> {a.returnPct} today</span>
                    </span>
                  </span>
                  <button type="button" className={s.removeBtn} onClick={() => onToggle(a.ticker)} aria-label={`Remove ${a.ticker}`}>
                    <X weight="bold" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
