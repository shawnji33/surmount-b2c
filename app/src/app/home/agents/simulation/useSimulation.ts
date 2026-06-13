'use client';

import { useEffect, useRef, useState } from 'react';
import type { NodeInstance } from '../nodes/types';
import { runSimulation, type SimulationResult, type SimWindow } from './simulation';

/* runs runSimulation on first render and debounced (~400ms) on every edit so
   dragging a value doesn't thrash the engine. */
export function useSimulation(nodes: NodeInstance[], window: SimWindow) {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const first = useRef(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const delay = first.current ? 0 : 400;
    first.current = false;
    const t = setTimeout(async () => {
      const r = await runSimulation({ steps: nodes, window });
      if (!cancelled) {
        setResult(r);
        setLoading(false);
      }
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [nodes, window]);

  return { result, loading };
}
