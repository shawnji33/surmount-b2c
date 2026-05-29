import Link from 'next/link';
import s from '../_components/onboarding.module.css';

export default function ApplicationReviewPage() {
  return (
    <div className={s.shell}>
      <header className={s.topbar}>
        <span className={s.topbarSpacer} aria-hidden="true">Close</span>
        <div className={s.topbarBrand}>
          <img src="https://www.figma.com/api/mcp/asset/3bbd6119-7028-47e5-9a7d-d4fafba87569" alt="" className={s.topbarBrandIcon} />
          <img src="https://www.figma.com/api/mcp/asset/3297adb2-a615-459c-b3a1-30442b03c519" alt="Surmount" className={s.topbarBrandName} />
        </div>
        <Link href="/home" className={s.topbarBtn}>
          Close
          <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" aria-hidden="true">
            <line x1="200" y1="56" x2="56" y2="200"/>
            <line x1="200" y1="200" x2="56" y2="56"/>
          </svg>
        </Link>
      </header>

      <main className={s.postAppMain}>
        <div className={s.postAppContent}>
          <div className={s.postAppHero}>
            <h1 className={s.postAppTitle}>Your application is under review</h1>
            <p className={s.postAppSubtitle}>Our team is reviewing your information. This usually takes 1–2 business days.</p>
          </div>

          <div className={s.postAppLayout}>
            <div className={s.stepsCol}>
              <div className={s.stepCard}>
                <span className={s.stepIconDone} aria-label="Completed">
                  <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="40 144 96 200 224 72"/>
                  </svg>
                </span>
                <span className={s.stepLabelDone}>Submit your application</span>
                <span className={s.badgeCompleted}>Completed</span>
              </div>

              <div className={s.stepCard}>
                <span className={s.stepIconDone} aria-label="Completed">
                  <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="40 144 96 200 224 72"/>
                  </svg>
                </span>
                <span className={s.stepLabelDone}>Verify your identity</span>
                <span className={s.badgeCompleted}>Completed</span>
              </div>

              <div className={s.stepCard}>
                <span className={s.stepIconNum} aria-hidden="true">2</span>
                <div className={s.stepFutureBody}>
                  <span className={s.stepFutureTitle}>Make your first deposit</span>
                  <svg className={s.stepChevron} viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="208 96 128 176 48 96"/>
                  </svg>
                </div>
              </div>

              <div className={s.stepCard}>
                <span className={s.stepIconNum} aria-hidden="true">3</span>
                <div className={s.stepFutureBody}>
                  <span className={s.stepFutureTitle}>Pick your first strategy</span>
                  <svg className={s.stepChevron} viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="208 96 128 176 48 96"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className={s.sidebarCol}>
              <div className={s.timelineCard}>
                <p className={s.timelineLabel}>Application timeline</p>
                <div className={s.timeline}>
                  <div className={s.tlItem}>
                    <div className={s.tlTrack}>
                      <div className={`${s.tlDot} ${s.tlDotDone}`} />
                      <div className={`${s.tlLine} ${s.tlLineDone}`} />
                    </div>
                    <div className={s.tlContent}>
                      <span className={s.tlStepTitle}>Application submitted</span>
                      <span className={s.tlStepSub}>Jan 28, 2026</span>
                    </div>
                  </div>
                  <div className={s.tlItem}>
                    <div className={s.tlTrack}>
                      <div className={`${s.tlDot} ${s.tlDotDone}`} />
                      <div className={`${s.tlLine} ${s.tlLineDone}`} />
                    </div>
                    <div className={s.tlContent}>
                      <span className={s.tlStepTitle}>Identity verified</span>
                      <span className={s.tlStepSub}>Jan 30, 2026</span>
                    </div>
                  </div>
                  <div className={s.tlItem}>
                    <div className={s.tlTrack}>
                      <div className={`${s.tlDot} ${s.tlDotFuture}`} />
                    </div>
                    <div className={s.tlContent}>
                      <span className={`${s.tlStepTitle} ${s.tlStepTitleMuted}`}>Account ready</span>
                      <span className={s.tlStepSub}>Estimated Jan 31, 2026</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className={s.questions}>Questions? <a href="mailto:support@surmount.ai">support@surmount.ai</a></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
