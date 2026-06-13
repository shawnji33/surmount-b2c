'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { SimulationResult } from './simulation';
import s from './simulation.module.css';

const H = 240;
const PAD = 16;

/* token-styled line chart of the hypothetical equity curve. The path morphs
   between param edits (same point count) via a short rAF tween; markers fade. */
export function SimChart({ result, loading }: { result: SimulationResult | null; loading: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);

  useLayoutEffect(() => {
    if (!wrap.current) return;
    const ro = new ResizeObserver((entries) => setW(entries[0].contentRect.width));
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  const target = result?.equityCurve.map((p) => p.value) ?? [];
  const display = useTweenedSeries(target);

  const empty = !result || result.triggerCount === 0;

  // scale: x across width, y across [min,max] of the displayed series
  const max = Math.max(1, ...display);
  const min = Math.min(0, ...display);
  const span = max - min || 1;
  const x = (i: number) => PAD + (i / Math.max(1, display.length - 1)) * (w - PAD * 2);
  const y = (v: number) => H - PAD - ((v - min) / span) * (H - PAD * 2);

  const line = display.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = display.length
    ? `${line} L${x(display.length - 1).toFixed(1)},${(H - PAD).toFixed(1)} L${x(0).toFixed(1)},${(H - PAD).toFixed(1)} Z`
    : '';

  return (
    <div className={`${s.chartWrap} ${loading ? s.chartLoading : ''}`} ref={wrap}>
      <svg width={w} height={H} className={s.chartSvg} role="img" aria-label="Hypothetical equity curve">
        <defs>
          <linearGradient id="simfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-600)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--brand-600)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {!empty && area && <path d={area} fill="url(#simfill)" />}
        {!empty && <path d={line} className={s.chartLine} />}
        {!empty &&
          result!.triggerPoints
            .filter((tp) => tp.i < display.length)
            .map((tp) => (
              <circle
                key={`${tp.t}-${tp.i}`}
                cx={x(tp.i)}
                cy={y(display[tp.i])}
                r={4}
                className={s.chartMarker}
              />
            ))}
      </svg>
      {empty && !loading && (
        <div className={s.chartEmpty}>
          This wouldn&apos;t have triggered in this period — try a smaller drop threshold.
        </div>
      )}
    </div>
  );
}

/* tween an array of values toward target; snap when length changes (window switch) */
function useTweenedSeries(target: number[]): number[] {
  const [disp, setDisp] = useState<number[]>(target);
  const fromRef = useRef<number[]>(target);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const from = fromRef.current;
    if (reduce || from.length !== target.length) {
      fromRef.current = target;
      setDisp(target);
      return;
    }
    const start = performance.now();
    const dur = 320;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      const next = target.map((to, i) => from[i] + (to - from[i]) * e);
      fromRef.current = next;
      setDisp(next);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return disp;
}
