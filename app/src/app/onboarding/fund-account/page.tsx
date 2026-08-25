import Image from 'next/image';
import Link from 'next/link';
import s from '../_components/onboarding.module.css';

export default function FundAccountPage() {
  return (
    <div className={s.shell}>
      <header className={s.topbar}>
        <span className={s.topbarSpacer} aria-hidden="true">Close</span>

        <Link href="/home" className={s.topbarBrand}>
          <img src="/assets/sidebar/logo-mark.svg" alt="" className={s.topbarBrandIcon} />
          <img src="/assets/sidebar/wordmark.svg" alt="Surmount" className={s.topbarBrandName} />
        </Link>

        <Link href="/home" className={s.topbarBtn}>
          Close
          <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" aria-hidden="true">
            <line x1="200" y1="56" x2="56" y2="200"/>
            <line x1="200" y1="200" x2="56" y2="56"/>
          </svg>
        </Link>
      </header>

      <main className={s.fundMain}>
        <div className={s.fundContent}>
          <Image
            className={s.fundIllo}
            src="/assets/illustrations/fund-account-envelope.png"
            alt=""
            width={240}
            height={240}
          />

          <div className={s.fundRight}>
            <div className={s.fundHero}>
              <h1 className={s.fundTitle}>{"Let's fund your new account"}</h1>
              <p className={s.fundSub}>Set up a one-time or recurring deposit into your new account to begin investing.</p>
            </div>

            <Link href="/onboarding/fund-amount" className={s.fundBtn}>
              Fund this account
              {/* Phosphor ArrowRight Regular */}
              <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
              </svg>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
