'use client';

import type { Builder } from './usePortfolioBuilder';
import p from './panels.module.css';

export default function OverviewPanel({ builder }: { builder: Builder }) {
  const { overview, overviewBy, setOverviewBy } = builder;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className={p.ovHead}>
        <div className={p.ovToggle} role="tablist" aria-label="Breakdown by">
          <button
            type="button"
            role="tab"
            aria-selected={overviewBy === 'industry'}
            className={`${p.ovToggleBtn} ${overviewBy === 'industry' ? p.ovToggleActive : ''}`}
            onClick={() => setOverviewBy('industry')}
          >
            By industry
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={overviewBy === 'asset'}
            className={`${p.ovToggleBtn} ${overviewBy === 'asset' ? p.ovToggleActive : ''}`}
            onClick={() => setOverviewBy('asset')}
          >
            By asset
          </button>
        </div>
      </div>

      {overview.length === 0 ? (
        <div className={p.empty}>Your blended {overviewBy} breakdown appears here as you add strategies.</div>
      ) : (
        <div className={p.ovBars}>
          {overview.map(seg => (
            <div key={seg.name} className={p.ovBar}>
              <div className={p.ovBarTop}>
                <span className={p.ovBarLabel}>
                  <span className={p.ovDot} style={{ background: seg.color }} />
                  <span className={p.ovName}>{seg.name}</span>
                </span>
                <span className={p.ovPct}>{seg.pct.toFixed(1)}%</span>
              </div>
              <div className={p.ovTrack}>
                <div className={p.ovFill} style={{ width: `${seg.pct}%`, background: seg.color }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
