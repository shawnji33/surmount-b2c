'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Brand from '../_components/Brand';

export default function StrategyMatchPage() {
  const router = useRouter();
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const duration = 2600;
    const start = performance.now();
    let raf: number;
    let timer: ReturnType<typeof setTimeout>;

    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      setPct(p * 100);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        timer = setTimeout(() => router.push('/onboarding/strategy-results'), 300);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-secondary, #fafafa)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        textAlign: 'center',
        width: '100%',
        maxWidth: 360,
        padding: '0 24px',
      }}>

        {/* Brand lockup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brand size={28} />
          <span style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 20, fontWeight: 500,
            letterSpacing: '-0.4px',
            color: 'var(--color-fg-primary-900)',
          }}>Surmount</span>
        </div>

        {/* Copy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 28, fontWeight: 500,
            lineHeight: '36px', letterSpacing: '-0.8px',
            color: 'var(--color-fg-primary-900)',
          }}>Finding strategies for you</h1>
          <p style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 14, fontWeight: 400,
            lineHeight: '20px', letterSpacing: '-0.2px',
            color: 'var(--color-fg-tertiary-600)',
          }}>Analyzing your answers…</p>
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: 6,
          background: 'rgba(10,13,18,0.08)',
          borderRadius: 9999,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: 'var(--color-fg-primary-900)',
            borderRadius: 9999,
          }} />
        </div>

      </div>
    </div>
  );
}
