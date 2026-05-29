'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

// ── Types ─────────────────────────────────────────────────────────────────────

type Holding = { ticker: string; company: string; pct: number; color: string; logo: string };

// ── Constants ─────────────────────────────────────────────────────────────────

const ANNUAL_RATE = 0.10;
const MONTHLY_RATE = Math.pow(1 + ANNUAL_RATE, 1 / 12) - 1;
const TIME_SPANS: Record<string, number> = { '1Y': 12, '2Y': 24, '5Y': 60, '10Y': 120 };

// ── Static data ───────────────────────────────────────────────────────────────

const holdings: Holding[] = [
  { ticker: 'NVDA', company: 'NVIDIA', pct: 18.75, color: '#1e3a6e', logo: '/assets/logos/NVDA.webp' },
  { ticker: 'AAPL', company: 'Apple Inc.', pct: 15.50, color: '#2d5ba8', logo: '/assets/logos/AAPL.webp' },
  { ticker: 'AMZN', company: 'Amazon.com, Inc.', pct: 15.24, color: '#406ad0', logo: '/assets/logos/AMZN.webp' },
  { ticker: 'GOOG', company: 'Alphabet Inc.', pct: 13.45, color: '#7aa8e8', logo: '/assets/logos/GOOG.webp' },
  { ticker: 'V', company: 'Visa', pct: 12.30, color: '#c8dbf5', logo: '/assets/logos/V.webp' },
];
const holdingsBarColors = ['#1e3a6e', '#2d5ba8', '#406ad0', '#7aa8e8', '#c8dbf5', '#1f4d22', '#316434', '#71b775', '#a2d3a5', '#fac414'];
const holdingsBarWidths = [1, 128, 89, 64, 31, 87, 62, 50, 31, 19];
const whyItems = [
  { value: 'Long-term capital growth', desc: 'Strategy targets 15–25% annual returns over full market cycles' },
  { value: '10+ years', desc: 'Optimal for 7+ year holding periods; short-term volatility smooths out' },
  { value: 'Moderate-high', desc: 'Moderate volatility profile with asymmetric upside potential' },
  { value: 'Technology & AI', desc: 'Quantum computing underpins the next wave of AI infrastructure' },
];
const alsoRecommend = [
  { name: 'Deep Tech', perf: '+11.2% past year', cover: '/assets/strategy-covers/Deep Tech.png' },
  { name: 'AI Innovators', perf: '+22.8% past year', cover: '/assets/strategy-covers/AI Innovators.png' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateChartData(investToday: number, investMonthly: number, months: number) {
  const start = new Date(2026, 4, 1); // May 2026
  return Array.from({ length: months + 1 }, (_, m) => {
    const d = new Date(start.getFullYear(), start.getMonth() + m, 1);
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const contributions = investToday + investMonthly * m;
    const fvInit = investToday * Math.pow(1 + MONTHLY_RATE, m);
    const fvMonthly = m > 0 ? investMonthly * (Math.pow(1 + MONTHLY_RATE, m) - 1) / MONTHLY_RATE : 0;
    const totalReturn = fvInit + fvMonthly;
    return { label, contributions, gains: totalReturn - contributions, totalReturn };
  });
}

function fmt(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}k`;
  return `$${Math.round(v).toLocaleString()}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TimeTabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange?: (t: string) => void }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: 4, borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', background: 'var(--color-bg-secondary)' }}>
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange?.(t)}
          style={{
            padding: '6px 12px', border: 'none', cursor: 'pointer', borderRadius: 8,
            fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-family-body)',
            letterSpacing: '-0.1px', whiteSpace: 'nowrap',
            background: t === active ? 'var(--color-bg-primary)' : 'transparent',
            color: t === active ? 'var(--color-fg-primary-900)' : 'var(--color-fg-tertiary-600)',
            boxShadow: t === active ? '0 1px 3px 0 rgba(10,13,18,0.08), 0 0 0 0.5px rgba(0,0,0,0.06)' : 'none',
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function Card({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={{ background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border-secondary)', overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

function AmountInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState('');

  return (
    <div className="flex flex-col flex-1" style={{ gap: 4 }}>
      <div style={{ fontSize: 'var(--font-size-text-xs)', color: 'var(--color-fg-tertiary-600)', lineHeight: 'var(--line-height-text-xs)' }}>{label}</div>
      <div style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-primary)', borderRadius: 'var(--radius-xl)', padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: 'var(--color-fg-tertiary-600)', fontSize: 'var(--font-size-text-md)', fontWeight: 500 }}>$</span>
        <input
          type="text"
          value={editing ? raw : value.toLocaleString()}
          onFocus={() => { setEditing(true); setRaw(String(value)); }}
          onBlur={() => {
            setEditing(false);
            const n = parseInt(raw.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(n) && n >= 0) onChange(n);
          }}
          onChange={(e) => setRaw(e.target.value)}
          style={{
            border: 'none', outline: 'none', background: 'transparent', width: '100%',
            fontSize: 'var(--font-size-text-md)', fontWeight: 500,
            color: 'var(--color-fg-primary-900)', fontFamily: 'var(--font-family-body)', letterSpacing: '-0.3px',
          }}
        />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StrategyResult() {
  const [investToday, setInvestToday] = useState(50000);
  const [investMonthly, setInvestMonthly] = useState(1000);
  const [activeTimeTab, setActiveTimeTab] = useState('1Y');
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; contributions: number; totalReturn: number } | null>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Remove recharts' default tabIndex so clicking never triggers a focus ring
  useEffect(() => {
    const wrapper = chartRef.current?.querySelector('.recharts-wrapper') as HTMLElement | null;
    if (wrapper) wrapper.tabIndex = -1;
  });

  const months = TIME_SPANS[activeTimeTab];
  const chartData = useMemo(
    () => generateChartData(investToday, investMonthly, months),
    [investToday, investMonthly, months]
  );
  const lastPoint = chartData[chartData.length - 1];
  const displayPoint = hoveredPoint ?? lastPoint;
  // Start Y-axis below the initial investment so gains are visually amplified
  const domainMin = Math.max(0, Math.floor(investToday * 0.88));
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-family-body)' }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'var(--color-bg-secondary)' }}>
        <div style={{ width: 102 }} />
        <div className="flex items-center gap-2" style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--font-size-text-xl)', fontWeight: 500, color: 'var(--color-fg-primary-900)', letterSpacing: '-0.4px' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#406AD0" />
            <path d="M7 19.5L14 8.5L21 19.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Surmount
        </div>
        <button className="flex items-center gap-1.5" style={{ padding: '10px 16px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-primary)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-text-md)', fontWeight: 500, color: 'var(--color-fg-primary-900)', fontFamily: 'var(--font-family-body)', cursor: 'pointer', letterSpacing: '-0.3px' }}>
          Close
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 1128, margin: '0 auto', padding: '40px 32px 96px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Hero */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 style={{ fontFamily: 'var(--font-family-body)', fontSize: 36, fontWeight: 500, color: 'var(--color-fg-primary-900)', letterSpacing: '-1px', lineHeight: '44px' }}>
            Your top match, Shawn
          </h1>
          <p style={{ fontSize: 'var(--font-size-text-md)', color: 'var(--color-fg-tertiary-600)', lineHeight: 'var(--line-height-text-md)', letterSpacing: '-0.3px' }}>
            We analyzed all strategies against your goals, time horizon, risk tolerance, experience, and theme preferences. Here&apos;s what fits you best.
          </p>
        </div>

        {/* Two-column grid */}
        <div className="flex items-start" style={{ gap: 64 }}>

          {/* LEFT COLUMN */}
          <div className="flex flex-col min-w-0 flex-1" style={{ gap: 40 }}>

            {/* 1. Strategy card */}
            <div style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border-primary)', overflow: 'hidden', position: 'relative', height: 300, background: '#0c1d29' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/strategy-covers/Quantum Computing Leaders.png" alt="Quantum Computing Leaders" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 3, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden', background: 'linear-gradient(to bottom, transparent 0%, rgba(0,9,15,0.68) 100%)', padding: 16 }}>
                <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                  {[
                    { blur: '2px', s: '0%', e: '20%' }, { blur: '5px', s: '15%', e: '38%' },
                    { blur: '9px', s: '30%', e: '55%' }, { blur: '13px', s: '45%', e: '72%' },
                    { blur: '17px', s: '60%', e: '88%' }, { blur: '20px', s: '75%', e: '100%' },
                  ].map(({ blur, s, e }, i) => (
                    <div key={i} style={{ position: 'absolute', inset: 0, backdropFilter: `blur(${blur})`, WebkitBackdropFilter: `blur(${blur})`, maskImage: `linear-gradient(to bottom, transparent ${s}, black ${e})`, WebkitMaskImage: `linear-gradient(to bottom, transparent ${s}, black ${e})` }} />
                  ))}
                </div>
                <div style={{ position: 'relative', zIndex: 1, fontFamily: 'var(--font-family-body)', fontSize: 'var(--font-size-display-xxs)', fontWeight: 500, color: 'rgba(255,255,255,0.95)', lineHeight: 'var(--line-height-display-xxs)', whiteSpace: 'nowrap' }}>
                  Quantum Computing Leaders
                </div>
                <div className="flex items-center" style={{ gap: 40 }}>
                  {[
                    { label: '1-Year return', value: '+8.50%', success: true },
                    { label: 'Risk', value: 'Low', dot: true },
                    { label: 'Top Industry', value: 'Utilities' },
                    { label: 'Holdings', value: '24 companies' },
                  ].map(({ label, value, success, dot }) => (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 1 }}>
                      <div style={{ fontSize: 'var(--font-size-text-xs)', color: 'rgba(255,255,255,0.70)' }}>{label}</div>
                      <div className="flex items-center" style={{ gap: 8, fontSize: 'var(--font-size-text-sm)', color: success ? 'var(--color-utility-success-600)' : 'rgba(255,255,255,0.90)' }}>
                        {dot && <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-utility-success-600)', flexShrink: 0, display: 'inline-block' }} />}
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Projected portfolio value */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ fontSize: 'var(--font-size-text-lg)', fontWeight: 500, color: 'var(--color-fg-primary-900)', lineHeight: 'var(--line-height-text-lg)' }}>
                Projected portfolio value
              </div>
              <Card>
                {/* Value row */}
                <div style={{ padding: '20px 20px 0' }}>
                  <div className="flex items-start justify-between">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <div style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--font-size-display-xxs)', fontWeight: 500, color: 'var(--color-fg-primary-900)', lineHeight: 'var(--line-height-display-xxs)', transition: 'opacity 0.15s ease' }}>
                        {fmt(displayPoint.totalReturn)}
                      </div>
                      {/* Contributions + total return — fade in on hover, space always reserved */}
                      <div
                        className="flex items-center"
                        style={{
                          gap: 16, marginTop: 2,
                          opacity: hoveredPoint ? 1 : 0,
                          transform: hoveredPoint ? 'translateY(0)' : 'translateY(3px)',
                          transition: 'opacity 0.18s ease, transform 0.18s ease',
                        }}
                      >
                        {[
                          { dot: 'var(--color-fg-quaternary-400)', label: 'Contributions', value: fmt(displayPoint.contributions), brand: false },
                          { dot: 'var(--color-brand-600)', label: 'Total return', value: fmt(displayPoint.totalReturn), brand: true },
                        ].map(({ dot, label, value, brand }) => (
                          <div key={label} className="flex items-center" style={{ gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0, display: 'inline-block' }} />
                            <span style={{ fontSize: 'var(--font-size-text-xs)', color: 'var(--color-fg-tertiary-600)' }}>{label}</span>
                            <span style={{ fontSize: 'var(--font-size-text-xs)', color: brand ? 'var(--color-brand-600)' : 'var(--color-fg-primary-900)' }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <TimeTabs tabs={['1Y', '2Y', '5Y', '10Y']} active={activeTimeTab} onChange={setActiveTimeTab} />
                  </div>
                </div>

                {/* Chart — full card width */}
                <div
                  ref={chartRef}
                  style={{ width: '100%', marginTop: 16, position: 'relative' }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const pct = Math.max(0, Math.min(1, x / rect.width));
                    const idx = Math.round(pct * (chartData.length - 1));
                    const p = chartData[idx];
                    if (p) {
                      setMouseX(x);
                      setHoveredPoint({ label: p.label, contributions: p.contributions, totalReturn: p.totalReturn });
                    }
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseLeave={() => { setHoveredPoint(null); setMouseX(null); }}
                >
                  {/* Floating timestamp — follows cursor, sits above chart */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 4,
                      left: mouseX !== null ? `clamp(48px, ${mouseX}px, calc(100% - 48px))` : '50%',
                      transform: `translateX(-50%) translateY(${hoveredPoint ? 0 : 4}px)`,
                      pointerEvents: 'none',
                      zIndex: 10,
                      whiteSpace: 'nowrap',
                      fontSize: 11,
                      fontWeight: 500,
                      color: 'var(--color-fg-secondary-700)',
                      fontFamily: 'var(--font-family-body)',
                      letterSpacing: '-0.2px',
                      opacity: hoveredPoint ? 1 : 0,
                      transition: 'opacity 0.15s ease, transform 0.15s ease',
                    }}
                  >
                    {displayPoint.label}
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart
                      data={chartData}
                      margin={{ top: 40, right: 0, bottom: 0, left: 0 }}
                    >
                      <defs>
                        <linearGradient id="contribGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8c9198" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#8c9198" stopOpacity={0.04} />
                        </linearGradient>
                        <linearGradient id="gainsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#406ad0" stopOpacity={0.22} />
                          <stop offset="100%" stopColor="#406ad0" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" hide />
                      <YAxis hide domain={[domainMin, 'auto']} />
                      <Tooltip
                        content={() => null}
                        cursor={{ stroke: 'var(--color-border-primary)', strokeWidth: 1 }}
                      />
                      {/* Total return — rendered first (behind); fill extends to SVG bottom */}
                      <Area
                        type="monotone"
                        dataKey="totalReturn"
                        stroke="var(--color-brand-600)"
                        strokeWidth={2}
                        fill="url(#gainsGrad)"
                        dot={false}
                        activeDot={{ r: 4, fill: '#406ad0', stroke: 'white', strokeWidth: 2 }}
                      />
                      {/* Contributions — rendered second (on top); gray fill covers lower blue band */}
                      <Area
                        type="monotone"
                        dataKey="contributions"
                        stroke="var(--color-fg-quaternary-400)"
                        strokeWidth={1.5}
                        fill="url(#contribGrad)"
                        dot={false}
                        activeDot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Footer — inputs */}
                <div style={{ background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border-secondary)', padding: '12px 20px 20px' }}>
                  <div className="flex" style={{ gap: 20 }}>
                    <AmountInput label="Invest today" value={investToday} onChange={setInvestToday} />
                    <AmountInput label="Invest every month" value={investMonthly} onChange={setInvestMonthly} />
                  </div>
                </div>
              </Card>
            </div>

            {/* 3. Why recommended */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ fontSize: 'var(--font-size-text-lg)', fontWeight: 500, color: 'var(--color-fg-primary-900)', lineHeight: 'var(--line-height-text-lg)' }}>
                Why this was recommended for you
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {whyItems.map(({ value, desc }) => (
                  <Card key={value} style={{ padding: 17, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 'var(--font-size-text-sm)', fontWeight: 500, color: 'var(--color-fg-primary-900)', lineHeight: 'var(--line-height-text-sm)', letterSpacing: '-0.2px' }}>{value}</div>
                    <div style={{ fontSize: 'var(--font-size-text-xs)', color: 'var(--color-fg-tertiary-600)', lineHeight: '18px', letterSpacing: '-0.1px' }}>{desc}</div>
                  </Card>
                ))}
              </div>
            </div>

            {/* 4. Holdings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="flex items-center justify-between">
                <div style={{ fontSize: 'var(--font-size-text-lg)', fontWeight: 500, color: 'var(--color-fg-primary-900)', lineHeight: 'var(--line-height-text-lg)' }}>Holdings</div>
                <TimeTabs tabs={['Overview', 'Sector']} active="Overview" />
              </div>
              <Card style={{ padding: 20 }}>
                <div style={{ paddingTop: 12, paddingBottom: 32 }}>
                  <div className="flex overflow-hidden" style={{ height: 8, gap: 2, borderRadius: 'var(--radius-full)' }}>
                    {holdingsBarWidths.map((w, i) => (
                      <div key={i} style={{ flex: i === 0 ? 1 : undefined, width: i === 0 ? undefined : w, background: holdingsBarColors[i], height: '100%' }} />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {holdings.map(({ ticker, company, pct, color, logo }, idx) => (
                    <div key={ticker}>
                      {idx > 0 && <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-secondary)', marginBottom: 16 }} />}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center" style={{ gap: 12 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={logo} alt={ticker} style={{ width: 32, height: 32, borderRadius: '50%', border: '0.75px solid var(--color-border-secondary)', objectFit: 'contain', flexShrink: 0, background: 'var(--color-bg-secondary)' }} />
                          <div>
                            <div style={{ fontSize: 'var(--font-size-text-sm)', fontWeight: 500, color: 'var(--color-fg-primary-900)', lineHeight: 'var(--line-height-text-sm)' }}>{ticker}</div>
                            <div style={{ fontSize: 'var(--font-size-text-xs)', color: 'var(--color-fg-tertiary-600)', lineHeight: 'var(--line-height-text-xs)' }}>{company}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 'var(--font-size-text-sm)', color: 'var(--color-fg-primary-900)', lineHeight: 'var(--line-height-text-sm)' }}>{pct}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div style={{ width: 400, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 40 }}>

            {/* About this strategy */}
            <div style={{ background: 'var(--color-bg-quaternary)', border: '1px solid var(--color-border-primary)', borderRadius: 24, padding: 9, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 22, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 'var(--font-size-text-lg)', fontWeight: 500, color: 'var(--color-fg-primary-900)', lineHeight: 'var(--line-height-text-lg)' }}>About this strategy</div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center whitespace-nowrap rounded-full border gap-1.5 py-0.5 pl-2 pr-2.5 text-sm font-medium bg-[var(--color-utility-success-50)] text-[var(--color-utility-success-700)] border-[var(--color-utility-success-200)]">
                    <span className="relative shrink-0" style={{ width: 8, height: 8 }}>
                      <span className="absolute rounded-full bg-[var(--color-utility-success-600)]" style={{ width: 6, height: 6, top: 1, left: 1 }} />
                    </span>
                    Low risk
                  </span>
                  <span className="flex items-center whitespace-nowrap rounded-full border py-0.5 px-2.5 text-sm font-medium bg-[var(--color-bg-secondary)] text-[var(--color-fg-secondary-700)] border-[var(--color-bg-quaternary)]">
                    Technology
                  </span>
                </div>
                <p style={{ fontSize: 'var(--font-size-text-sm)', color: 'var(--color-fg-secondary-700)', lineHeight: 'var(--line-height-text-sm)' }}>
                  This investment strategy focuses on well-established companies within the food, beverage, and household product sectors. The goal is to identify businesses that not only demonstrate stability but also prioritize consistent dividend payouts to their shareholders.
                </p>
              </div>
              <button className="flex items-center justify-center" style={{ gap: 6, width: '100%', padding: '10px 16px', background: 'var(--color-fg-primary-900)', borderRadius: 34, fontSize: 'var(--font-size-text-md)', fontWeight: 500, color: 'var(--color-fg-white)', border: '2px solid var(--color-alpha-white-12)', cursor: 'pointer', fontFamily: 'var(--font-family-body)', lineHeight: 'var(--line-height-text-md)' }}>
                Invest in this strategy
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10H16M11 5L16 10L11 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button style={{ width: '100%', padding: '10px 16px', background: 'var(--color-bg-primary)', borderRadius: 34, fontSize: 'var(--font-size-text-md)', fontWeight: 500, color: 'var(--color-fg-secondary-700)', border: '1px solid var(--color-border-primary)', cursor: 'pointer', fontFamily: 'var(--font-family-body)', lineHeight: 'var(--line-height-text-md)' }}>
                Add to watchlist
              </button>
            </div>

            {/* Also recommend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ fontSize: 'var(--font-size-text-lg)', fontWeight: 500, color: 'var(--color-fg-primary-900)', lineHeight: 'var(--line-height-text-lg)' }}>Also recommend</div>
              {alsoRecommend.map(({ name, perf, cover }) => (
                <Card key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 12 }}>
                  <div className="flex items-center flex-1 min-w-0" style={{ gap: 12 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cover} alt={name} style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 'var(--font-size-text-sm)', fontWeight: 500, color: 'var(--color-fg-primary-900)', lineHeight: 'var(--line-height-text-sm)', letterSpacing: '-0.3px' }}>{name}</div>
                      <div style={{ fontSize: 'var(--font-size-text-xs)', color: 'var(--color-fg-tertiary-600)', lineHeight: 'var(--line-height-text-sm)', letterSpacing: '-0.5px' }}>{perf}</div>
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 3L9.5 7L5 11" stroke="var(--color-fg-quaternary-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Card>
              ))}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
