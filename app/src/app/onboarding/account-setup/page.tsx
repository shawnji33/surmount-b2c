import Link from 'next/link';
import s from '../_components/onboarding.module.css';

export default function AccountSetupPage() {
  return (
    <div className={s.shell}>
      <header className={s.topbar}>
        <span className={s.topbarSpacer} aria-hidden="true">Close</span>
        <Link href="/home" className={s.topbarBrand}>
          <img src="https://www.figma.com/api/mcp/asset/3bbd6119-7028-47e5-9a7d-d4fafba87569" alt="" className={s.topbarBrandIcon} />
          <img src="https://www.figma.com/api/mcp/asset/3297adb2-a615-459c-b3a1-30442b03c519" alt="Surmount" className={s.topbarBrandName} />
        </Link>
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
            <h1 className={s.postAppTitle}>You&apos;re almost ready to invest</h1>
            <p className={s.postAppSubtitle}>Complete the steps below to activate your account</p>
          </div>

          <div className={s.postAppLayout}>
            <div className={s.stepsCol}>

              {/* Step 1: Completed */}
              <div className={s.stepCard}>
                <span className={s.stepIconDone} aria-label="Completed">
                  <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="40 144 96 200 224 72"/>
                  </svg>
                </span>
                <span className={s.stepLabelDone}>Submit your application</span>
                <span className={s.badgeCompleted}>Completed</span>
              </div>

              {/* Step 2: Verify Identity (active) */}
              <div className={`${s.stepCard} ${s.stepCardActive}`}>
                <span className={s.stepIconAlert} aria-hidden="true">
                  <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V104a8,8,0,0,1,16,0v32a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"/>
                  </svg>
                </span>
                <div className={s.stepBody}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span className={s.stepTitle}>Verify your identity</span>
                    <p className={s.stepDesc}>To comply with financial regulations, we need two documents to verify your identity.</p>
                  </div>
                  <ul className={s.stepChecklist}>
                    {['Government-issued photo ID', 'Proof of current address'].map(item => (
                      <li key={item} className={s.stepCheckItem}>
                        <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="40 144 96 200 224 72"/>
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/onboarding/verify-documents" className={s.btnUpload}>
                    Upload documents
                  </Link>
                </div>
              </div>

              {/* Step 3: Make first deposit (future) */}
              <div className={s.stepCard}>
                <span className={s.stepIconNum} aria-hidden="true">2</span>
                <div className={s.stepFutureBody}>
                  <span className={s.stepFutureTitle}>Make your first deposit</span>
                  <svg className={s.stepChevron} viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="208 96 128 176 48 96"/>
                  </svg>
                </div>
              </div>

              {/* Step 4: Pick strategy (future) */}
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
                      <div className={`${s.tlDot} ${s.tlDotWarning}`} />
                      <div className={`${s.tlLine} ${s.tlLineWarning}`} />
                    </div>
                    <div className={s.tlContent}>
                      <span className={`${s.tlStepTitle} ${s.tlStepTitleWarning}`}>Identity verification</span>
                      <span className={`${s.tlStepSub} ${s.tlStepSubWarning}`}>Action needed</span>
                    </div>
                  </div>
                  <div className={s.tlItem}>
                    <div className={s.tlTrack}>
                      <div className={`${s.tlDot} ${s.tlDotFuture}`} />
                    </div>
                    <div className={s.tlContent}>
                      <span className={`${s.tlStepTitle} ${s.tlStepTitleMuted}`}>Account ready</span>
                      <span className={s.tlStepSub}>After verification</span>
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
