import Image from 'next/image';
import Link from 'next/link';
import OnboardingFlow from '../_components/OnboardingFlow';
import s from '../_components/onboarding.module.css';

export default function InvestingStylePage() {
  return (
    <OnboardingFlow back="/onboarding/regulatory">
      <main className={s.entryMainSplit}>
        <div className={s.entrySplit}>
          <Image
            className={s.entryIllo}
            src="/assets/illustrations/investing-style-donut.png"
            alt=""
            width={300}
            height={300}
          />
          <div className={s.entryCol}>
            <div className={s.entryHeading}>
              <h1 className={s.entryTitleLg} style={{ whiteSpace: 'normal', fontSize: 32, lineHeight: '1.15' }}>
                {"Let's identify your investing style"}
              </h1>
              <p className={s.entrySubtitleSplit}>
                {"We're required to gather basic information on your goals, time horizon, and risk tolerance."}
              </p>
            </div>

            <Link href="/onboarding/financial-goal" className={s.cta} style={{ textDecoration: 'none' }}>
              Next
              <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="40" y1="128" x2="216" y2="128"/>
                <polyline points="144 56 216 128 144 200"/>
              </svg>
            </Link>
          </div>
        </div>
      </main>
    </OnboardingFlow>
  );
}
