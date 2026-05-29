'use client';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '../_components/OnboardingFlow';
import s from './page.module.css';

export default function PickStrategyPage() {
  const router = useRouter();

  return (
    <OnboardingFlow showExitModal={false}>
      <main style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        padding: '48px 24px',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 860, display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Heading */}
          <div>
            <h1 style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 36, fontWeight: 500,
              lineHeight: '44px', letterSpacing: '-1px',
              color: 'var(--color-fg-primary-900)',
            }}>
              One step away, Shawn
            </h1>
            <p style={{
              marginTop: 8,
              fontFamily: 'var(--font-family-body)',
              fontSize: 16, fontWeight: 400,
              lineHeight: '24px', letterSpacing: '-0.3px',
              color: 'var(--color-fg-tertiary-600)',
            }}>
              Your account is funded. Pick a strategy to start investing.
            </p>
          </div>

          {/* Two-column layout */}
          <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>

            {/* Steps column */}
            <div style={{ flex: '0 0 560px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Step 1: Completed */}
              <div className={s.stepCard}>
                <span className={s.stepIconDone} aria-label="Completed">
                  <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>
                  </svg>
                </span>
                <span className={s.stepLabelDone}>Submit your application</span>
                <span className={s.badgeDone}>Completed</span>
              </div>

              {/* Step 2: Completed */}
              <div className={s.stepCard}>
                <span className={s.stepIconDone} aria-label="Completed">
                  <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>
                  </svg>
                </span>
                <span className={s.stepLabelDone}>Make your first deposit</span>
                <span className={s.badgeDone}>Completed</span>
              </div>

              {/* Step 3: Active */}
              <div className={[s.stepCard, s.stepCardActive].join(' ')}>
                <span className={s.stepIconActive} aria-label="Step 3"><span>3</span></span>
                <div className={s.stepBody}>

                  <span className={s.stepTitle}>Pick your first strategy</span>

                  <p className={s.stepDesc}>Choose how you&apos;d like to find a strategy that fits your goals.</p>

                  {/* Quiz sub-card */}
                  <div className={s.quizCard}>
                    <div className={s.quizInfo}>
                      <div className={s.quizTitleRow}>
                        <span className={s.quizTitle}>Take a 3-min quiz</span>
                        <span className={s.badgeRecommended}>Recommended</span>
                      </div>
                      <p className={s.quizSub}>Answer 5 questions to find your best strategy</p>
                    </div>
                    <button
                      type="button"
                      className={s.btnStart}
                      onClick={() => router.push('/onboarding/strategy-quiz')}
                    >
                      Start
                      <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                        <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
                      </svg>
                    </button>
                  </div>

                  {/* Browse all strategies */}
                  <div className={s.browseRow}>
                    <span className={s.browseRowText}>Prefer to choose yourself?</span>
                    <a className={s.browseLink} href="/home">Browse all strategies</a>
                  </div>

                </div>
              </div>

            </div>

            {/* Sidebar */}
            <div style={{ flex: '0 0 260px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Application timeline */}
              <div className={s.timelineCard}>
                <p className={s.timelineLabel}>Application timeline</p>
                <div className={s.timeline}>

                  <div className={s.tlItem}>
                    <div className={s.tlTrack}>
                      <div className={[s.tlDot, s.tlDotDone].join(' ')} />
                      <div className={[s.tlLine, s.tlLineDone].join(' ')} />
                    </div>
                    <div className={s.tlContent}>
                      <span className={s.tlTitle}>Application submitted</span>
                      <span className={s.tlSub}>Jan 28, 2026</span>
                    </div>
                  </div>

                  <div className={s.tlItem}>
                    <div className={s.tlTrack}>
                      <div className={[s.tlDot, s.tlDotDone].join(' ')} />
                      <div className={[s.tlLine, s.tlLineDone].join(' ')} />
                    </div>
                    <div className={s.tlContent}>
                      <span className={s.tlTitle}>Account approved</span>
                      <span className={s.tlSub}>Jan 30, 2026</span>
                    </div>
                  </div>

                  <div className={s.tlItem}>
                    <div className={s.tlTrack}>
                      <div className={[s.tlDot, s.tlDotBlue].join(' ')} />
                    </div>
                    <div className={s.tlContent}>
                      <span className={[s.tlTitle, s.tlTitleActive].join(' ')}>Ready to invest</span>
                    </div>
                  </div>

                </div>
              </div>

              <p className={s.supportText}>
                Questions? <a href="mailto:support@surmount.ai">support@surmount.ai</a>
              </p>

            </div>

          </div>
        </div>
      </main>
    </OnboardingFlow>
  );
}
