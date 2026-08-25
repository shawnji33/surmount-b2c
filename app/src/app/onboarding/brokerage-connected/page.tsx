'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { X, Check, ArrowRight } from '@phosphor-icons/react';
import s from '../_components/onboarding.module.css';

const BROKER_NAMES: Record<string, string> = {
  etrade: 'E*Trade',
  alpaca: 'Alpaca',
  tradestation: 'TradeStation',
  coinbase: 'Coinbase',
  kraken: 'Kraken',
  'alpaca-paper': 'Alpaca Paper',
  'surmount-paper': 'Surmount Paper',
};

const BROKER_LOGOS: Record<string, string> = {
  'alpaca-paper': '/assets/brokers/alpaca.png',
  'surmount-paper': '/assets/brokers/surmount.png',
  tradestation: '/assets/brokers/tradestation.jpeg',
};

function BrokerageConnectedContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('broker') ?? '';
  const name = BROKER_NAMES[id] ?? 'your brokerage';
  const logo = BROKER_LOGOS[id] ?? (id ? `/assets/brokers/${id}.png` : '/assets/brokers/surmount.png');

  return (
    <div className={s.entryShell}>
      <header className={s.topbar}>
        <span className={s.topbarSpacer} aria-hidden="true">Close</span>
        <div className={s.topbarBrand}>
          <img src="/assets/sidebar/logo-mark.svg" alt="" className={s.topbarBrandIcon} />
          <img src="/assets/sidebar/wordmark.svg" alt="Surmount" className={s.topbarBrandName} />
        </div>
        <Link href="/home" className={s.topbarBtn}>
          Close
          <X weight="regular" aria-hidden="true" />
        </Link>
      </header>

      <div className={s.successContainer}>
        <div className={s.connectedPair} aria-hidden="true">
          <span className={s.connectedLogo}>
            <img src={logo} alt="" />
          </span>
          <span className={s.connectedCheck}>
            <Check weight="bold" aria-hidden="true" />
          </span>
          <span className={s.connectedLogo}>
            <img src="/assets/brokers/surmount.png" alt="" />
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <h1 className={s.submittedTitle}>You&rsquo;re connected to {name}</h1>
          <p className={s.submittedDesc}>Your holdings and buying power are now available on Surmount. You can start investing right away.</p>
        </div>

        <Link href={`/home?state=empty&connected=${id}`} className={s.cta} style={{ textDecoration: 'none' }}>
          Start investing
          <ArrowRight weight="regular" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export default function BrokerageConnectedPage() {
  return (
    <Suspense fallback={null}>
      <BrokerageConnectedContent />
    </Suspense>
  );
}
