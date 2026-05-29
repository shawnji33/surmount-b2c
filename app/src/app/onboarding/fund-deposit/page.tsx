import OnboardingFlow from '../_components/OnboardingFlow';
import Link from 'next/link';
import s from '../_components/onboarding.module.css';

export default function FundDepositPage() {
  return (
    <OnboardingFlow back="/onboarding/fund-review">
      <main className={s.main}>
        <div className={s.stack}>
          <div className={s.hero}>
            <h1 className={s.title}>Your deposit is processing</h1>
            <p className={s.subtitle}>$1,000.00 from Chase ••••4721 is being transferred to your Surmount account.</p>
          </div>

          <div className={s.reviewCard}>
            <div className={s.reviewRow}>
              <span className={s.reviewLabel}>Status</span>
              <span className={s.reviewValue} style={{ color: '#a35800' }}>Processing</span>
            </div>
            <div className={s.reviewRow}>
              <span className={s.reviewLabel}>Amount</span>
              <span className={s.reviewValue}>$1,000.00</span>
            </div>
            <div className={s.reviewRow}>
              <span className={s.reviewLabel}>From</span>
              <span className={s.reviewValue}>Chase ••••4721</span>
            </div>
            <div className={s.reviewRow}>
              <span className={s.reviewLabel}>Estimated arrival</span>
              <span className={s.reviewValue}>May 16–17, 2026</span>
            </div>
          </div>

          <Link href="/onboarding/account-ready" className={s.cta} style={{ textDecoration: 'none' }}>
            Done
            <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
            </svg>
          </Link>
        </div>
      </main>
    </OnboardingFlow>
  );
}
