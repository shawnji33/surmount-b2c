'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { X, Check, Plus } from '@phosphor-icons/react';
import { getStrategyDetail, riskLabel, riskTone, SEGMENT_COLORS } from '../_data';
import type { Builder } from './usePortfolioBuilder';
import d from './detailDrawer.module.css';

const RANGES = ['1W', '1M', '3M', '1Y', 'All'];

function Sparkline({ points }: { points: number[] }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = 60 - ((v - min) / span) * 54 - 3;
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  });
  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c}`).join(' ');
  return (
    <svg className={d.chart} viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="drawer-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(64,106,208,0.20)" />
          <stop offset="100%" stopColor="rgba(64,106,208,0)" />
        </linearGradient>
      </defs>
      <path d={`${line} L 100 60 L 0 60 Z`} fill="url(#drawer-fill)" />
      <path d={line} fill="none" stroke="var(--color-brand-600, #406ad0)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function StrategyDetailDrawer({ builder }: { builder: Builder }) {
  const active = builder.detailStrategy;
  const [cached, setCached] = useState(active);
  const [visible, setVisible] = useState(false);
  const [range, setRange] = useState('1Y');

  useEffect(() => {
    if (active) {
      setCached(active);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = setTimeout(() => setCached(null), 300);
    return () => clearTimeout(t);
  }, [active]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') builder.closeDetail(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [builder]);

  const detail = useMemo(() => (cached ? getStrategyDetail(cached) : null), [cached]);

  if (!cached || !detail) return null;
  const s = cached;
  const selected = builder.isSelected(s.id);
  const blurb = `A ${riskLabel(s.riskScore).toLowerCase()}-risk ${s.category.toLowerCase()} strategy concentrated in ${s.industries[0]?.name}${s.industries[1] ? ` and ${s.industries[1].name}` : ''}. Built for ${s.term.toLowerCase()} ${s.objective === 'N/A' ? 'growth' : s.objective.toLowerCase()} investors.`;

  const stats: Array<{ label: string; value: React.ReactNode }> = [
    { label: 'Top industry', value: detail.topIndustry },
    { label: '1-Year return', value: <span className={detail.oneYearPositive ? d.pos : d.neg}>{detail.oneYearReturn}</span> },
    { label: 'Risk', value: <span className={d.riskVal}><span className={d.riskDot} data-tone={riskTone(s.riskScore)} />{riskLabel(s.riskScore)}</span> },
    { label: 'Holdings', value: `${detail.holdingsCount} assets` },
    { label: 'By', value: detail.author },
  ];

  return (
    <div className={`${d.root} ${visible ? d.rootOpen : ''}`} role="dialog" aria-modal="true" aria-label={`${s.name} details`}>
      <div className={d.backdrop} onClick={builder.closeDetail} />
      <aside className={d.panel}>
        <div className={d.head}>
          <div className={d.headTitle}>
            <Image className={d.headCover} src={s.cover} alt="" width={28} height={28} />
            <span className={d.headName}>{s.name}</span>
          </div>
          <button type="button" className={d.iconBtn} onClick={builder.closeDetail} aria-label="Close">
            <X aria-hidden="true" />
          </button>
        </div>

        <div className={d.body}>
          <div className={d.hero}>
            <Image className={d.heroImg} src={s.cover} alt="" fill sizes="480px" />
            <div className={d.heroOverlay} />
            <div className={d.heroText}>
              <h2 className={d.heroName}>{s.name}</h2>
              <p className={d.heroBlurb}>{blurb}</p>
            </div>
          </div>

          <div className={d.statGrid}>
            {stats.map(st => (
              <div key={st.label} className={d.statCard}>
                <span className={d.statLabel}>{st.label}</span>
                <span className={d.statValue}>{st.value}</span>
              </div>
            ))}
          </div>

          <div className={d.priceRow}>
            <span className={d.price}>{detail.price}</span>
            <span className={`${d.priceChange} ${detail.changePositive ? d.pos : d.neg}`}>
              {detail.change} ({detail.changePct}) <span className={d.muted}>Today</span>
            </span>
          </div>

          <Sparkline points={detail.sparkline} />

          <div className={d.rangeTabs}>
            {RANGES.map(r => (
              <button key={r} type="button" className={`${d.rangeTab} ${range === r ? d.rangeTabActive : ''}`} onClick={() => setRange(r)}>{r}</button>
            ))}
          </div>

          <div className={d.breakdown}>
            <h3 className={d.breakdownTitle}>Industry breakdown</h3>
            <div className={d.bars}>
              {s.industries.map((ind, i) => (
                <div key={ind.name} className={d.bar}>
                  <div className={d.barTop}>
                    <span className={d.barLabel}><span className={d.barDot} style={{ background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }} />{ind.name}</span>
                    <span className={d.barPct}>{ind.pct}%</span>
                  </div>
                  <div className={d.barTrack}><div className={d.barFill} style={{ width: `${ind.pct}%`, background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }} /></div>
                </div>
              ))}
            </div>
            <h3 className={d.breakdownTitle} style={{ marginTop: 20 }}>Asset mix</h3>
            <div className={d.bars}>
              {s.assets.map((a, i) => (
                <div key={a.name} className={d.bar}>
                  <div className={d.barTop}>
                    <span className={d.barLabel}><span className={d.barDot} style={{ background: SEGMENT_COLORS[(i + 3) % SEGMENT_COLORS.length] }} />{a.name}</span>
                    <span className={d.barPct}>{a.pct}%</span>
                  </div>
                  <div className={d.barTrack}><div className={d.barFill} style={{ width: `${a.pct}%`, background: SEGMENT_COLORS[(i + 3) % SEGMENT_COLORS.length] }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={d.footer}>
          <button
            type="button"
            className={selected ? d.removeBtn : d.addBtn}
            onClick={() => builder.toggle(s.id)}
          >
            {selected ? <Check weight="bold" aria-hidden="true" /> : <Plus weight="bold" aria-hidden="true" />}
            {selected ? 'Added to portfolio — remove' : 'Add to portfolio'}
          </button>
        </div>
      </aside>
    </div>
  );
}
