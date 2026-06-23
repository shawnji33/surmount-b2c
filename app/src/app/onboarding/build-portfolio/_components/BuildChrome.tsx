'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, X } from '@phosphor-icons/react';
import type { Builder } from './usePortfolioBuilder';
import c from './chrome.module.css';

export function TopBar({ back = '/onboarding/strategy-results' }: { back?: string }) {
  const router = useRouter();
  return (
    <header className={c.topbar}>
      <button type="button" className={c.topbarBtn} onClick={() => router.push(back)}>
        <ArrowLeft aria-hidden="true" />
        <span>Back</span>
      </button>
      <div className={c.brand}>
        <img src="/assets/sidebar/logo-mark.svg" alt="" className={c.brandIcon} />
        <img src="/assets/sidebar/wordmark.svg" alt="Surmount" className={c.brandName} />
      </div>
      <button type="button" className={c.topbarBtn} onClick={() => router.push('/home')}>
        <span>Close</span>
        <X aria-hidden="true" />
      </button>
    </header>
  );
}

export function ContinueBar({
  builder,
  next = '/onboarding/fund-account',
}: { builder: Builder; next?: string }) {
  const router = useRouter();
  const count = builder.selected.length;
  return (
    <div className={c.continueBar}>
      <span className={c.continueMeta}>
        {count === 0 ? 'No strategies selected' : `${count} ${count === 1 ? 'strategy' : 'strategies'} selected`}
        {builder.amount > 0 && ` · $${builder.amount.toLocaleString('en-US')}`}
      </span>
      <div className={c.continueActions}>
        <button type="button" className={c.skip} onClick={() => router.push(next)}>Skip for now</button>
        <button type="button" className={c.continue} onClick={() => router.push(next)}>
          Continue
          <ArrowRight weight="bold" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
