'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AssetClass, AssetFilterState, MarketCapBucket } from './_data';
import { countActiveFilters } from './_data';
import s from './AssetFilters.module.css';

const ASSET_CLASSES: { key: AssetClass | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'stock', label: 'Stocks' },
  { key: 'etf', label: 'ETFs' },
];

const PRICE_OPTIONS = [
  { value: 'any', label: 'Any price', max: null },
  { value: '50', label: 'Under $50', max: 50 },
  { value: '100', label: 'Under $100', max: 100 },
  { value: '250', label: 'Under $250', max: 250 },
  { value: '500', label: 'Under $500', max: 500 },
] as const;

const CAP_OPTIONS: { value: MarketCapBucket | 'all'; label: string }[] = [
  { value: 'all', label: 'Any size' },
  { value: 'large', label: 'Large cap' },
  { value: 'mid', label: 'Mid cap' },
  { value: 'small', label: 'Small cap' },
];

const YIELD_OPTIONS = [
  { value: '0', label: 'Any yield' },
  { value: '1', label: '1%+' },
  { value: '2', label: '2%+' },
  { value: '3', label: '3%+' },
  { value: '5', label: '5%+' },
];

const PE_OPTIONS = [
  { value: 'any', label: 'Any P/E', max: null },
  { value: '15', label: 'Under 15', max: 15 },
  { value: '25', label: 'Under 25', max: 25 },
  { value: '40', label: 'Under 40', max: 40 },
] as const;

const EXPENSE_OPTIONS = [
  { value: 'any', label: 'Any expense ratio', max: null },
  { value: '0.1', label: 'Under 0.10%', max: 0.1 },
  { value: '0.25', label: 'Under 0.25%', max: 0.25 },
  { value: '0.5', label: 'Under 0.50%', max: 0.5 },
] as const;

const AUM_OPTIONS = [
  { value: 'any', label: 'Any fund size', min: null },
  { value: '1', label: '$1B+', min: 1 },
  { value: '10', label: '$10B+', min: 10 },
  { value: '100', label: '$100B+', min: 100 },
] as const;

export function AssetFilters({
  filters,
  onChange,
  layout = 'bar',
}: {
  filters: AssetFilterState;
  onChange: (updater: (prev: AssetFilterState) => AssetFilterState) => void;
  layout?: 'bar' | 'stack';
}) {
  const activeCount = countActiveFilters(filters);
  const showStockFields = filters.assetClass !== 'etf';
  const showEtfFields = filters.assetClass !== 'stock';

  return (
    <div className={[s.filters, layout === 'stack' ? s.stack : s.bar].join(' ')}>
      <div className={s.classGroup} role="tablist" aria-label="Asset class">
        {ASSET_CLASSES.map((c) => (
          <button
            type="button"
            key={c.key}
            role="tab"
            aria-selected={filters.assetClass === c.key}
            className={[s.classChip, filters.assetClass === c.key ? s.classChipActive : ''].filter(Boolean).join(' ')}
            onClick={() => onChange((prev) => ({ ...prev, assetClass: c.key }))}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className={s.selectRow}>
        <label className={s.field}>
          <span className={s.fieldLabel}>Price</span>
          <Select
            value={filters.maxPrice === null ? 'any' : String(filters.maxPrice)}
            onValueChange={(value) => {
              const opt = PRICE_OPTIONS.find((o) => o.value === value);
              onChange((prev) => ({ ...prev, maxPrice: opt?.max ?? null }));
            }}
          >
            <SelectTrigger size="sm" className={s.select} aria-label="Maximum price">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRICE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        {showStockFields && (
          <label className={s.field}>
            <span className={s.fieldLabel}>Market cap</span>
            <Select
              value={filters.marketCap}
              onValueChange={(value) => onChange((prev) => ({ ...prev, marketCap: value as MarketCapBucket | 'all' }))}
            >
              <SelectTrigger size="sm" className={s.select} aria-label="Market cap">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAP_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        )}

        <label className={s.field}>
          <span className={s.fieldLabel}>Dividend yield</span>
          <Select
            value={String(filters.minDividendYieldPct)}
            onValueChange={(value) => onChange((prev) => ({ ...prev, minDividendYieldPct: Number(value) }))}
          >
            <SelectTrigger size="sm" className={s.select} aria-label="Minimum dividend yield">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YIELD_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        {showStockFields && (
          <label className={s.field}>
            <span className={s.fieldLabel}>P/E ratio</span>
            <Select
              value={filters.maxPE === null ? 'any' : String(filters.maxPE)}
              onValueChange={(value) => {
                const opt = PE_OPTIONS.find((o) => o.value === value);
                onChange((prev) => ({ ...prev, maxPE: opt?.max ?? null }));
              }}
            >
              <SelectTrigger size="sm" className={s.select} aria-label="Maximum P/E ratio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        )}

        {showEtfFields && (
          <label className={s.field}>
            <span className={s.fieldLabel}>Expense ratio</span>
            <Select
              value={filters.maxExpenseRatioPct === null ? 'any' : String(filters.maxExpenseRatioPct)}
              onValueChange={(value) => {
                const opt = EXPENSE_OPTIONS.find((o) => o.value === value);
                onChange((prev) => ({ ...prev, maxExpenseRatioPct: opt?.max ?? null }));
              }}
            >
              <SelectTrigger size="sm" className={s.select} aria-label="Maximum expense ratio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        )}

        {showEtfFields && (
          <label className={s.field}>
            <span className={s.fieldLabel}>Fund size</span>
            <Select
              value={filters.minAumBillions === null ? 'any' : String(filters.minAumBillions)}
              onValueChange={(value) => {
                const opt = AUM_OPTIONS.find((o) => o.value === value);
                onChange((prev) => ({ ...prev, minAumBillions: opt?.min ?? null }));
              }}
            >
              <SelectTrigger size="sm" className={s.select} aria-label="Minimum fund size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUM_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        )}

        {activeCount > 0 && (
          <button
            type="button"
            className={s.clearBtn}
            onClick={() => onChange((prev) => ({
              ...prev,
              assetClass: 'all',
              maxPrice: null,
              marketCap: 'all',
              minDividendYieldPct: 0,
              maxPE: null,
              maxExpenseRatioPct: null,
              minAumBillions: null,
            }))}
          >
            Clear filters{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
        )}
      </div>
    </div>
  );
}
