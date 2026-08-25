import Link from 'next/link';
import { Link as LinkIcon, ArrowLeft, CaretRight, CheckCircle } from '@phosphor-icons/react/dist/ssr';
import s from '../_components/onboarding.module.css';

const BROKER_LOGOS = [
  { src: '/assets/brokers/coinbase.png', alt: 'Coinbase' },
  { src: '/assets/brokers/kraken.png', alt: 'Kraken' },
  { src: '/assets/brokers/alpaca.png', alt: 'Alpaca' },
  { src: '/assets/brokers/etrade.png', alt: 'E*Trade' },
];

function Chevron() {
  return <CaretRight weight="regular" className={s.methodCardChevron} aria-hidden="true" />;
}

export default function StartInvestingPage() {
  return (
    <div className={s.entryShell}>
      <header className={s.topbar}>
        <Link href="/onboarding/about-you" className={s.topbarBtn}>
          <ArrowLeft weight="regular" aria-hidden="true" />
          Back
        </Link>
        <div className={s.topbarBrand}>
          <img src="/assets/sidebar/logo-mark.svg" alt="" className={s.topbarBrandIcon} />
          <img src="/assets/sidebar/wordmark.svg" alt="Surmount" className={s.topbarBrandName} />
        </div>
        <span className={s.topbarSpacer} aria-hidden="true">Back</span>
      </header>

      <main className={s.choiceMain}>
        <div className={`${s.choiceStack} ${s.choiceEnter}`}>
          <div className={s.hero}>
            <h1 className={s.title}>How do you want to start investing?</h1>
            <p className={s.subtitle}>Connect a brokerage you already use, or open a Surmount account. You can always add more later.</p>
          </div>

          <div className={s.methodList}>
            <Link href="/onboarding/connect-brokerage" className={s.methodCard}>
              <span className={s.methodCardIcon} aria-hidden="true">
                <LinkIcon weight="regular" className={s.methodCardIconGlyph} />
              </span>
              <div className={s.methodCardBody}>
                <span className={s.methodCardTitle}>Connect a brokerage</span>
                <span className={s.methodCardDesc}>Already invest with Coinbase, Kraken, Alpaca or E*Trade? Connect it and invest through Surmount.</span>
                <div className={s.methodCardLogos} aria-hidden="true">
                  {BROKER_LOGOS.map(b => (
                    <span key={b.alt} className={s.methodCardLogo}>
                      <img src={b.src} alt="" />
                    </span>
                  ))}
                </div>
              </div>
              <Chevron />
            </Link>

            <Link href="/onboarding/investing-account" className={s.methodCard}>
              <span className={`${s.methodCardIcon} ${s.methodCardIconFill}`} aria-hidden="true">
                <img src="/assets/brokers/surmount.png" alt="" className={s.methodCardIconImg} />
              </span>
              <div className={s.methodCardBody}>
                <span className={s.methodCardTitle}>Open a Surmount account</span>
                <span className={s.methodCardDesc}>Open a Surmount Investing account — our own brokerage — and invest directly. Takes about 5 minutes.</span>
              </div>
              <Chevron />
            </Link>
          </div>
        </div>
      </main>

      <footer className={s.entryFooter}>
        <CheckCircle weight="regular" aria-hidden="true" />
        <a href="#" className={s.entryFooterLink}>{"Surmount's Terms & Disclosures"}</a>
      </footer>
    </div>
  );
}
