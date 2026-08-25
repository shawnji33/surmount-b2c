'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { MagnifyingGlass, Check, CaretRight } from '@phosphor-icons/react';
import { riskLabel, riskTone, type Category } from '../_data';
import type { Builder } from './usePortfolioBuilder';
import p from './panels.module.css';

const FILTERS: Array<'All' | Category> = ['All', 'Equity', 'ETF', 'Crypto'];

export default function StrategyBrowser({ builder }: { builder: Builder }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | Category>('All');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return builder.all.filter(s => {
      const matchesQuery = !q || s.name.toLowerCase().includes(q);
      const matchesFilter = filter === 'All' || s.category === filter;
      return matchesQuery && matchesFilter;
    });
  }, [builder.all, query, filter]);

  return (
    <div className={p.browser}>
      {/* Toolbar — separated from the list */}
      <div className={p.toolbar}>
        <div className={p.searchBox}>
          <MagnifyingGlass aria-hidden="true" />
          <input
            className={p.searchInput}
            type="text"
            placeholder="Search strategies"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className={p.filterChips}>
          {FILTERS.map(f => (
            <button
              key={f}
              type="button"
              className={`${p.chip} ${filter === f ? p.chipActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List card */}
      <div className={p.listCard}>
        <div className={p.list}>
          {results.length === 0 && <div className={p.empty}>No strategies match your search.</div>}
          {results.map(s => {
            const on = builder.isSelected(s.id);
            return (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                aria-label={`View ${s.name} details`}
                className={`${p.row} ${on ? p.rowSelected : ''}`}
                onClick={() => builder.openDetail(s.id)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); builder.openDetail(s.id); } }}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  aria-label={on ? `Remove ${s.name} from portfolio` : `Add ${s.name} to portfolio`}
                  className={`${p.check} ${on ? p.checkOn : ''}`}
                  onClick={e => { e.stopPropagation(); builder.toggle(s.id); }}
                >
                  <Check weight="bold" aria-hidden="true" />
                </button>
                <Image className={p.cover} src={s.cover} alt="" width={40} height={40} />
                <span className={p.rowMain}>
                  <span className={p.rowName}>{s.name}</span>
                  <span className={p.rowMeta}>
                    <span className={p.badge}>{s.category}</span>
                    <span className={p.metaText}>{s.term}</span>
                    <span className={p.risk}>
                      <span className={p.riskDot} data-tone={riskTone(s.riskScore)} />
                      <span className={p.metaText}>{riskLabel(s.riskScore)} risk</span>
                    </span>
                  </span>
                </span>
                <span className={p.rowView} aria-hidden="true">
                  Details <CaretRight weight="bold" />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
