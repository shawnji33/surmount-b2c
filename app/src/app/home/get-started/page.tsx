'use client';

import { Suspense, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, LockSimple, SlidersHorizontal } from '@phosphor-icons/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ConnectExternalModal } from './_components/ConnectExternalModal';
import s from './page.module.css';

const BROKER_LOGOS = [
  { name: 'coinbase', shape: 'round' as const },
  { name: 'alpaca', shape: 'square' as const },
  { name: 'kraken', shape: 'round' as const },
  { name: 'etrade', shape: 'square' as const },
];

type StepStatus = 'active' | 'locked';

type Step = {
  key: string;
  title: string;
  desc: string;
  status: StepStatus;
  content: ReactNode;
};

function GetStartedContent() {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [statePreviewOpen, setStatePreviewOpen] = useState(false);
  const statePreviewRef = useRef<HTMLDivElement>(null);
  const marketplaceTiltRef = useRef<HTMLDivElement>(null);
  const marketplaceTiltCardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const applicationState = searchParams.get('state');
  const isApplicationPending = applicationState === 'pending';
  const isApplicationDenied = applicationState === 'denied';
  const isAccountApproved = applicationState === 'approved';
  const isExternalConnected = applicationState === 'external-connected';
  const isNewUser = !isApplicationPending && !isApplicationDenied && !isAccountApproved && !isExternalConnected;
  const isInvestmentReady = isAccountApproved || isExternalConnected;

  useEffect(() => {
    if (!statePreviewOpen) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      if (!statePreviewRef.current?.contains(event.target as Node)) setStatePreviewOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setStatePreviewOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [statePreviewOpen]);

  const previewState = (state: 'new' | 'pending' | 'denied' | 'approved' | 'external-connected') => {
    router.replace(state === 'new' ? pathname : `${pathname}?state=${state}`);
    setStatePreviewOpen(false);
  };

  const resetMarketplaceTilt = () => {
    const tilt = marketplaceTiltRef.current;
    const card = marketplaceTiltCardRef.current;
    tilt?.classList.remove(s.marketplaceTiltHover);
    card?.classList.remove(s.marketplaceTilting);
    card?.style.setProperty('--marketplace-tilt-rx', '0deg');
    card?.style.setProperty('--marketplace-tilt-ry', '0deg');
  };

  const trackMarketplaceTilt = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tilt = marketplaceTiltRef.current;
    const card = marketplaceTiltCardRef.current;
    if (!tilt || !card) return;
    const rect = tilt.getBoundingClientRect();
    const pointerX = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const pointerY = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    const maxTilt = 8;
    tilt.classList.add(s.marketplaceTiltHover);
    card.classList.add(s.marketplaceTilting);
    card.style.setProperty('--marketplace-tilt-ry', `${((pointerX - 0.5) * maxTilt).toFixed(2)}deg`);
    card.style.setProperty('--marketplace-tilt-rx', `${((0.5 - pointerY) * maxTilt).toFixed(2)}deg`);
    card.style.setProperty('--marketplace-tilt-gx', `${(pointerX * 100).toFixed(1)}%`);
    card.style.setProperty('--marketplace-tilt-gy', `${(pointerY * 100).toFixed(1)}%`);
  };

  const startWithSurmount = (
    <Link href="/onboarding/investing-account" className={[s.optionCard, s.optionCardSurmount, isExternalConnected ? s.transparentAccountLayer : ''].join(' ')}>
      <img src="/assets/brokers/surmount.png" alt="" className={s.optionAvatar} />
      <div className={s.optionBody}>
        <p className={s.optionTitle}>Create a Surmount account</p>
        <p className={s.optionDesc}>Submit your application in few minutes and at no cost. Standard fees apply.</p>
      </div>
      <div className={s.optionBadgeRow}>
        <span className={s.optionBadge}><Check weight="bold" className={s.optionBadgeIcon} aria-hidden="true" />Free to apply</span>
        <span className={s.optionBadge}><Check weight="bold" className={s.optionBadgeIcon} aria-hidden="true" />No subscription</span>
      </div>
    </Link>
  );

  const connectExternal = (
    <button type="button" className={s.optionCard} onClick={() => setShowConnectModal(true)}>
      <div className={s.optionChipRow} aria-hidden="true">
        {BROKER_LOGOS.map((broker) => <img key={broker.name} src={`/assets/brokers/${broker.name}.png`} alt="" className={broker.shape === 'round' ? s.optionChipAvatar : s.optionChipIcon} />)}
        <span className={s.optionChipMore}>+3</span>
      </div>
      <div className={s.optionBody}>
        <p className={s.optionTitle}>Connect an external account</p>
        <p className={s.optionDesc}>Use your existing balance at Alpaca, Kraken, and others.</p>
      </div>
      <div className={s.optionBadgeRow}><span className={s.optionBadge}>Core plan+</span></div>
    </button>
  );

  const pendingApplication = (
    <article className={s.pendingApplication} aria-label="Your Surmount account application is under review">
      <div className={s.pendingApplicationTop}>
        <img src="/assets/brokers/surmount.png" alt="" className={s.optionAvatar} />
        <span className={s.pendingBadge}><span aria-hidden="true" />Under review</span>
      </div>
      <div className={s.pendingApplicationBody}>
        <p className={s.pendingApplicationTitle}>Your application is under review</p>
        <p className={s.pendingApplicationDesc}>We&apos;re verifying your details. Most accounts are approved within 1–2 business days.</p>
      </div>
      <Link href="/onboarding/application-review" className={s.pendingApplicationCta}>
        View status <ArrowRight weight="regular" aria-hidden="true" />
      </Link>
    </article>
  );

  const approvedApplication = (
    <article className={[s.pendingApplication, s.approvedApplication].join(' ')} aria-label="Your Surmount account is approved">
      <div className={s.pendingApplicationTop}>
        <img src="/assets/brokers/surmount.png" alt="" className={s.optionAvatar} />
        <span className={[s.pendingBadge, s.approvedBadge].join(' ')}><span aria-hidden="true" />Approved</span>
      </div>
      <div className={s.pendingApplicationBody}>
        <p className={s.pendingApplicationTitle}>Your account is approved</p>
        <p className={s.pendingApplicationDesc}>Add funds to start investing. There&apos;s no minimum deposit.</p>
      </div>
    </article>
  );

  const deniedApplication = (
    <article className={[s.pendingApplication, s.deniedApplication].join(' ')} aria-label="Your Surmount investing account application was denied">
      <div className={s.pendingApplicationTop}>
        <img src="/assets/brokers/surmount.png" alt="" className={s.optionAvatar} />
        <span className={[s.pendingBadge, s.deniedBadge].join(' ')}><span aria-hidden="true" />Application denied</span>
      </div>
      <div className={s.pendingApplicationBody}>
        <p className={s.pendingApplicationTitle}>Your application cannot be approved</p>
        <p className={s.pendingApplicationDesc}>If you have any concerns please reach out to Surmount support team.</p>
      </div>
      <a href="mailto:support@surmount.ai?subject=Surmount%20investing%20account%20application" className={[s.pendingApplicationCta, s.deniedApplicationCta].join(' ')} aria-label="Contact Surmount support about your denied application">
        View details <ArrowRight weight="regular" aria-hidden="true" />
      </a>
    </article>
  );

  const connectedExternalAccount = (
    <article className={[s.pendingApplication, s.connectedExternalApplication].join(' ')} aria-label="External account connected with Coinbase">
      <div className={s.pendingApplicationTop}>
        <img src="/assets/brokers/coinbase.png" alt="" className={s.optionAvatar} />
        <span className={[s.pendingBadge, s.approvedBadge].join(' ')}><span aria-hidden="true" />Connected</span>
      </div>
      <div className={s.pendingApplicationBody}>
        <p className={s.pendingApplicationTitle}>Connected with Coinbase</p>
        <p className={s.pendingApplicationDesc}>Use your connected accounts to directly invest in strategies on Surmount.</p>
      </div>
      <div className={s.optionBadgeRow}><span className={s.optionBadge}>Core plan+</span></div>
    </article>
  );

  const exploreMarketplace = (
    <div ref={marketplaceTiltRef} className={s.marketplacePreview} role="img" aria-label="Marketplace strategy preview" onMouseMove={trackMarketplaceTilt} onMouseLeave={resetMarketplaceTilt}>
      <div className={s.marketplaceDeck} aria-hidden="true">
        <div className={s.strategyPreviewBackFar} />
        <div className={s.strategyPreviewBackNear} />
        <div ref={marketplaceTiltCardRef} className={[s.strategyPreviewCard, s.marketplaceTiltCard].join(' ')}>
          <img src="/assets/strategy-covers/Magnificient 7 Insider Trading Follower.png" alt="" className={s.strategyPreviewImage} />
          <div className={s.strategyPreviewMeta}>
            <span className={s.strategyPreviewName}>Magnificent 7 Insider Trading Follower</span>
            <span className={s.strategyPreviewDots}><i>SPDR</i><img src="/assets/logos/AAPL.webp" alt="" /><img src="/assets/logos/GOOG.webp" alt="" /></span>
          </div>
          <div className={s.marketplaceTiltGlare} />
        </div>
      </div>
    </div>
  );

  const steps: Step[] = [
    {
      key: 'account',
      title: 'Start with an account',
      desc: 'Create a Surmount account or connect an external broker — you can do both, in either order, and add the second one later.',
      status: 'active',
      content: <div className={s.optionsGrid}>{isApplicationPending ? pendingApplication : isApplicationDenied ? deniedApplication : isAccountApproved ? approvedApplication : startWithSurmount}{isExternalConnected ? connectedExternalAccount : connectExternal}</div>,
    },
    {
      key: 'invest',
      title: isInvestmentReady ? 'Explore the marketplace' : 'Start investing',
      desc: isInvestmentReady ? 'You’re all set! Explore strategies and find your first investment.' : 'Finish the first step to unlock investing.',
      status: isInvestmentReady ? 'active' : 'locked',
      content: isInvestmentReady ? exploreMarketplace : <p className={s.stepLockedNote}>Locked until you’re ready to invest</p>,
    },
  ];

  return (
    <main className={s.main}>
      <header className={s.headerCopy}>
        <h1 className={s.title}>Get started</h1>
        <p className={s.subtitle}>A few steps stand between you and your first investment.</p>
      </header>

      <ol className={s.stepList}>
        {steps.map((step, index) => (
          <li key={step.key} className={s.step} data-status={step.status}>
            <div className={s.stepRail}>
              <span className={s.stepMarker} aria-hidden="true">{step.status === 'locked' ? <LockSimple weight="bold" /> : index + 1}</span>
              {index < steps.length - 1 && <span className={s.stepConnector} aria-hidden="true" />}
            </div>
            <section className={s.stepCard} aria-labelledby={`${step.key}-title`}>
              <h2 id={`${step.key}-title`} className={s.stepTitle}>{step.title}</h2>
              <p className={s.stepDesc}>{step.desc}</p>
              {step.content}
            </section>
          </li>
        ))}
      </ol>

      <footer className={s.supportFooter}>
        Questions? <a href="mailto:support@surmount.ai">support@surmount.ai</a>
      </footer>

      {showConnectModal && <ConnectExternalModal onClose={() => setShowConnectModal(false)} />}

      {/* PROTOTYPE STATE PREVIEW — development only. Remove after the state model is decided. */}
      {process.env.NODE_ENV === 'development' && (
        <div ref={statePreviewRef} className={s.statePreview}>
          {statePreviewOpen && (
            <div id="onboarding-state-preview" className={s.statePreviewMenu} role="menu" aria-label="Preview page state">
              <p className={s.statePreviewLabel}>Preview state</p>
              <button type="button" role="menuitemradio" aria-checked={isNewUser} className={s.statePreviewOption} onClick={() => previewState('new')}>
                <span>New user</span>
                {isNewUser && <Check weight="bold" aria-hidden="true" />}
              </button>
              <button type="button" role="menuitemradio" aria-checked={isApplicationPending} className={s.statePreviewOption} onClick={() => previewState('pending')}>
                <span>Application pending</span>
                {isApplicationPending && <Check weight="bold" aria-hidden="true" />}
              </button>
              <button type="button" role="menuitemradio" aria-checked={isApplicationDenied} className={s.statePreviewOption} onClick={() => previewState('denied')}>
                <span>Application denied</span>
                {isApplicationDenied && <Check weight="bold" aria-hidden="true" />}
              </button>
              <button type="button" role="menuitemradio" aria-checked={isAccountApproved} className={s.statePreviewOption} onClick={() => previewState('approved')}>
                <span>Account approved</span>
                {isAccountApproved && <Check weight="bold" aria-hidden="true" />}
              </button>
              <button type="button" role="menuitemradio" aria-checked={isExternalConnected} className={s.statePreviewOption} onClick={() => previewState('external-connected')}>
                <span>External account connected</span>
                {isExternalConnected && <Check weight="bold" aria-hidden="true" />}
              </button>
            </div>
          )}
          <button type="button" className={s.statePreviewButton} aria-label="Preview onboarding states" aria-expanded={statePreviewOpen} aria-controls="onboarding-state-preview" onClick={() => setStatePreviewOpen((open) => !open)}>
            <SlidersHorizontal weight="regular" aria-hidden="true" />
          </button>
        </div>
      )}
    </main>
  );
}

export default function GetStartedPage() {
  return <Suspense fallback={null}><GetStartedContent /></Suspense>;
}
