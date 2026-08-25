'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { InfinityThinkingOrb } from '@/components/InfinityThinkingOrb';
import s from '../_components/onboarding.module.css';

export default function ApplicationLoadingPage() {
  const router = useRouter();

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('preview')) return;
    const id = setTimeout(() => router.push('/onboarding/application-submitted'), 2800);
    return () => clearTimeout(id);
  }, [router]);

  return (
    <div className={s.loadingPage}>
      <header className={s.topbar}>
        <span className={s.topbarSpacer} aria-hidden="true">Close</span>
        <div className={s.topbarBrand}>
          <img src="/assets/sidebar/logo-mark.svg" alt="" className={s.topbarBrandIcon} />
          <img src="/assets/sidebar/wordmark.svg" alt="Surmount" className={s.topbarBrandName} />
        </div>
        <Link href="/home" className={s.topbarBtn}>
          Close
          <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" aria-hidden="true">
            <line x1="200" y1="56" x2="56" y2="200"/>
            <line x1="200" y1="200" x2="56" y2="56"/>
          </svg>
        </Link>
      </header>

      <main className={s.loadingMain} aria-live="polite" aria-busy="true">
        <InfinityThinkingOrb
          className={s.loadingOrb}
          width={112}
          height={72}
          pathWidth={82}
          pathHeight={48}
          dotCount={72}
          dotScale={1.45}
          speed={0.9}
        />
        <p className={s.loadingText}>Submitting your application…</p>
      </main>
    </div>
  );
}
