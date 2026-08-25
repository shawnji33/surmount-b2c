'use client';

import { useEffect, useRef, useState } from 'react';
import s from './MatrixLoader.module.css';

const FRAMES = [
  [[1,0,0,0],[0.825,0,0,0],[0.65,0,0,0],[0.475,0,0,0]],
  [[0.825,1,0,0],[0.65,0,0,0],[0.475,0,0,0],[0,0,0,0]],
  [[0.65,0.825,1,0],[0.475,0,0,0],[0,0,0,0],[0,0,0,0]],
  [[0.475,0.65,0.825,1],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
  [[0,0.475,0.65,0.825],[0,0,0,1],[0,0,0,0],[0,0,0,0]],
  [[0,0,0.475,0.65],[0,0,0,0.825],[0,0,0,1],[0,0,0,0]],
  [[0,0,0,0.475],[0,0,0,0.65],[0,0,0,0.825],[0,0,0,1]],
  [[0,0,0,0],[0,0,0,0.475],[0,0,0,0.65],[0,0,1,0.825]],
  [[0,0,0,0],[0,0,0,0],[0,0,0,0.475],[0,1,0.825,0.65]],
  [[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,0.825,0.65,0.475]],
  [[0,0,0,0],[0,0,0,0],[1,0,0,0],[0.825,0.65,0.475,0]],
  [[0,0,0,0],[1,0,0,0],[0.825,0,0,0],[0.65,0.475,0,0]],
] as const;

const GRID = 4;
const CELL = 5;
const GAP = 1;
// 4×5 + 3×1 = 23
const SVG_SIZE = GRID * CELL + (GRID - 1) * GAP;
const FPS = 9;
const ON_COLOR = '#406AD0';
const OFF_COLOR = 'rgba(10, 13, 18, 0.07)';

interface MatrixLoaderProps {
  label?: string;
}

export function MatrixLoader({ label = 'Thinking' }: MatrixLoaderProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [elapsed, setElapsed] = useState(0);

  // SVG animation — imperative to avoid React batching overhead on every frame
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const ns = 'http://www.w3.org/2000/svg';
    const offLayer = document.createElementNS(ns, 'g');
    const onLayer = document.createElementNS(ns, 'g');
    const onCells: SVGRectElement[] = [];

    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const x = c * (CELL + GAP);
        const y = r * (CELL + GAP);

        const off = document.createElementNS(ns, 'rect');
        off.setAttribute('x', String(x));
        off.setAttribute('y', String(y));
        off.setAttribute('width', String(CELL));
        off.setAttribute('height', String(CELL));
        off.setAttribute('rx', '1');
        off.setAttribute('fill', OFF_COLOR);
        offLayer.appendChild(off);

        const on = document.createElementNS(ns, 'rect');
        on.setAttribute('x', String(x));
        on.setAttribute('y', String(y));
        on.setAttribute('width', String(CELL));
        on.setAttribute('height', String(CELL));
        on.setAttribute('rx', '1');
        on.setAttribute('fill', ON_COLOR);
        on.setAttribute('opacity', String(FRAMES[0][r][c]));
        onLayer.appendChild(on);
        onCells.push(on);
      }
    }

    svg.appendChild(offLayer);
    svg.appendChild(onLayer);

    const frameMs = 1000 / FPS;
    let frameIndex = 0;
    let lastAdvance = performance.now();
    let rafId: number;

    const applyFrame = (fi: number) => {
      const frame = FRAMES[fi];
      onCells.forEach((el, i) => {
        el.setAttribute('opacity', String(frame[Math.floor(i / GRID)][i % GRID]));
      });
    };

    const tick = (now: number) => {
      if (now - lastAdvance >= frameMs) {
        lastAdvance = now - ((now - lastAdvance) % frameMs);
        frameIndex = (frameIndex + 1) % FRAMES.length;
        applyFrame(frameIndex);
      }
      rafId = requestAnimationFrame(tick);
    };

    applyFrame(0);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      svg.removeChild(offLayer);
      svg.removeChild(onLayer);
    };
  }, []);

  // Elapsed-seconds timer
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={s.wrap} aria-live="polite" aria-label={`${label} for ${elapsed}s`}>
      <svg
        ref={svgRef}
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        aria-hidden="true"
        className={s.grid}
      />
      <span className={s.text}>
        {label} for {elapsed}s
      </span>
    </div>
  );
}
