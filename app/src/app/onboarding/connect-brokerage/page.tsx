'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MagnifyingGlass, CaretRight, Info, X, Link as LinkIcon, ShieldCheck, Lightning } from '@phosphor-icons/react';
import s from '../_components/onboarding.module.css';

interface Broker {
  id: string;
  name: string;
  type: string;
  logo: string;
  soon?: boolean;
}

// Brokerages Surmount currently supports — connectable.
const SUPPORTED: Broker[] = [
  { id: 'etrade',         name: 'E*Trade',       type: 'Stocks & ETFs',   logo: '/assets/brokers/etrade.png' },
  { id: 'alpaca',         name: 'Alpaca',        type: 'Stocks & crypto', logo: '/assets/brokers/alpaca.png' },
  { id: 'tradestation',   name: 'TradeStation',  type: 'Stocks & options',logo: '/assets/brokers/tradestation.jpeg' },
  { id: 'coinbase',       name: 'Coinbase',      type: 'Crypto',          logo: '/assets/brokers/coinbase.png' },
  { id: 'kraken',         name: 'Kraken',        type: 'Crypto',          logo: '/assets/brokers/kraken.png' },
  { id: 'alpaca-paper',   name: 'Alpaca Paper',  type: 'Paper trading',   logo: '/assets/brokers/alpaca.png' },
  { id: 'surmount-paper', name: 'Surmount Paper',type: 'Paper trading',   logo: '/assets/brokers/surmount.png' },
];

// Not yet supported — shown disabled at the bottom with a "Coming soon" tag.
const COMING_SOON: Broker[] = [
  { id: 'schwab',    name: 'Charles Schwab',      type: 'Stocks & ETFs',   logo: '/assets/brokers/schwab.png',    soon: true },
  { id: 'ibkr',      name: 'Interactive Brokers', type: 'Stocks & ETFs',   logo: '/assets/brokers/ibkr.png',      soon: true },
  { id: 'webull',    name: 'Webull',              type: 'Stocks & ETFs',   logo: '/assets/brokers/webull.png',    soon: true },
];

const BROKERS: Broker[] = [...SUPPORTED, ...COMING_SOON];

export default function ConnectBrokeragePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Broker | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BROKERS;
    return BROKERS.filter(b => b.name.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && selected) setSelected(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selected]);

  return (
    <div className={s.entryShell}>
      <header className={s.topbar}>
        <Link href="/onboarding/start-investing" className={s.topbarBtn}>
          <ArrowLeft weight="regular" aria-hidden="true" />
          Back
        </Link>
        <div className={s.topbarBrand}>
          <img src="/assets/sidebar/logo-mark.svg" alt="" className={s.topbarBrandIcon} />
          <img src="/assets/sidebar/wordmark.svg" alt="Surmount" className={s.topbarBrandName} />
        </div>
        <span className={s.topbarSpacer} aria-hidden="true">Back</span>
      </header>

      <main className={s.brokerMain}>
        <div className={s.brokerStack}>
          <div className={s.hero}>
            <h1 className={s.title}>Connect your brokerage</h1>
            <p className={s.subtitle}>Select where you currently invest. You&rsquo;ll sign in on their secure site — Surmount never sees your password.</p>
          </div>

          <div className={s.brokerSearch}>
            <MagnifyingGlass weight="regular" className={s.brokerSearchIcon} aria-hidden="true" />
            <input
              className={s.brokerSearchInput}
              type="text"
              placeholder="Search brokerages"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Search brokerages"
            />
          </div>

          <ul className={s.brokerList}>
            {results.map(b => (
              <li key={b.id}>
                {b.soon ? (
                  <div className={`${s.brokerRow} ${s.brokerRowDisabled}`} aria-disabled="true">
                    <span className={s.brokerLogo}>
                      <img src={b.logo} alt="" />
                    </span>
                    <span className={s.brokerInfo}>
                      <span className={s.brokerName}>{b.name}</span>
                    </span>
                    <span className={s.brokerTag}>Coming soon</span>
                  </div>
                ) : (
                  <button type="button" className={s.brokerRow} onClick={() => setSelected(b)}>
                    <span className={s.brokerLogo}>
                      <img src={b.logo} alt="" />
                    </span>
                    <span className={s.brokerInfo}>
                      <span className={s.brokerName}>{b.name}</span>
                      {b.id.endsWith('-paper') && (
                        <span className={s.paperInfoWrap}>
                          <Info weight="regular" className={s.paperInfo} aria-hidden="true" />
                          <span className={s.paperTooltip} role="tooltip">
                            A paper account uses virtual money — practice investing and test strategies without risking real funds.
                          </span>
                        </span>
                      )}
                    </span>
                    <CaretRight weight="regular" className={s.brokerChevron} aria-hidden="true" />
                  </button>
                )}
              </li>
            ))}
            {results.length === 0 && (
              <li className={s.brokerEmpty}>No brokerages match &ldquo;{query}&rdquo;.</li>
            )}
          </ul>
        </div>
      </main>

      {/* Secure-connect consent modal */}
      <div
        className={`${s.plaidModalOverlay} ${selected ? s.plaidModalOverlayOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-modal-title"
        onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}
      >
        {selected && (
          <div className={s.plaidModal}>
            <button className={s.plaidModalClose} type="button" aria-label="Close" onClick={() => setSelected(null)}>
              <X weight="regular" aria-hidden="true" />
            </button>

            <div className={s.connectModalIcons} aria-hidden="true">
              <span className={s.connectModalLogo}>
                <img src={selected.logo} alt="" />
              </span>
              <LinkIcon weight="regular" className={s.connectModalDots} aria-hidden="true" />
              <span className={s.connectModalLogo}>
                <img src="/assets/brokers/surmount.png" alt="" />
              </span>
            </div>

            <p className={s.plaidModalHeading} id="connect-modal-title">
              Connect {selected.name} to Surmount
            </p>

            <div className={s.plaidModalDivider} aria-hidden="true" />

            <div className={s.plaidModalFeatures}>
              <div className={s.plaidModalFeature}>
                <div className={s.plaidModalFeatureIcon} aria-hidden="true">
                  <ShieldCheck weight="regular" />
                </div>
                <div className={s.plaidModalFeatureBody}>
                  <span className={s.plaidModalFeatureTitle}>Sign in securely</span>
                  <span className={s.plaidModalFeatureDesc}>You&rsquo;ll log in on {selected.name}&rsquo;s own site. Surmount never sees or stores your password.</span>
                </div>
              </div>
              <div className={s.plaidModalFeature}>
                <div className={s.plaidModalFeatureIcon} aria-hidden="true">
                  <Lightning weight="regular" />
                </div>
                <div className={s.plaidModalFeatureBody}>
                  <span className={s.plaidModalFeatureTitle}>Invest right away</span>
                  <span className={s.plaidModalFeatureDesc}>We&rsquo;ll pull your holdings and buying power so you can invest in Surmount strategies.</span>
                </div>
              </div>
            </div>

            <p className={s.plaidModalLegal}>
              By continuing, you authorize Surmount to access your {selected.name} account information.
            </p>

            <button
              type="button"
              className={s.plaidModalContinue}
              onClick={() => router.push(`/onboarding/brokerage-connected?broker=${selected.id}`)}
            >
              Continue to {selected.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
