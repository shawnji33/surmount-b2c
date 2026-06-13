'use client';

import { useEffect, useRef, useState } from 'react';

/* tweens a number toward its target (~360ms ease-out) for the count-up effect. */
export function RollNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const [disp, setDisp] = useState(value);
  const dispRef = useRef(value);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      dispRef.current = value;
      setDisp(value);
      return;
    }
    const from = dispRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    const dur = 360;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      const v = from + (to - from) * e;
      dispRef.current = v;
      setDisp(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{format(disp)}</>;
}
