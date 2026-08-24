import Link from 'next/link';
import { ArrowRight, Bank, Check, HandWithdraw, Lightning, Lock, UploadSimple, X } from '@phosphor-icons/react/dist/ssr';
import s from './page.module.css';
import ApplicationStatePicker from './state-picker';

const completedFormSteps = ['Personal information', 'Investing style'];

function FormStatus({ complete, label }: { complete: boolean; label: string }) {
  return (
    <li className={s.formStatus} data-complete={complete || undefined}>
      <span aria-hidden="true">{complete && <Check weight="bold" />}</span>
      <span>{label}</span>
    </li>
  );
}

function TimelineItem({ title, detail, current, complete, warning }: { title: string; detail: string; current?: boolean; complete?: boolean; warning?: boolean }) {
  return (
    <li className={s.timelineItem} data-current={current || undefined} data-complete={complete || undefined} data-warning={warning || undefined}>
      <span className={s.timelineMarker} aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <small>{detail}</small>
      </div>
    </li>
  );
}

export default async function ApplicationResumePrototypePage({
  searchParams,
}: {
  searchParams?: Promise<{ state?: string; v?: string }>;
}) {
  const params = await searchParams;
  const documentsNeeded = params?.state === 'documents-needed' || params?.v === '3';
  const submitted = documentsNeeded || params?.state === 'submitted' || params?.v === '2';

  return (
    <div className={s.page}>
      <header className={s.header}>
        <Link href="/home" className={s.brand} aria-label="Return to dashboard">
          <img src="/assets/sidebar/logo-mark.svg" alt="" width={24} height={24} />
          <img src="/assets/sidebar/wordmark.svg" alt="Surmount" width={98} height={16} />
        </Link>
        <Link href="/home" className={s.close}>
          Close
          <X weight="regular" aria-hidden="true" />
        </Link>
      </header>

      <main className={s.main}>
        <section className={s.intro} aria-labelledby="application-resume-title">
          <h1 id="application-resume-title">You&apos;re almost ready to invest</h1>
          <p>Complete the steps below to activate your account.</p>
        </section>

        <div className={s.layout}>
          <section className={s.steps} aria-label="Account setup steps">
            <div className={s.stepContainer}>
              <div className={s.stepHeading} data-complete={submitted || undefined}>
                <span aria-hidden="true">{submitted ? <Check weight="bold" /> : '1'}</span>
                <strong>Submit your application</strong>
              </div>

              {documentsNeeded ? (
                <article className={`${s.progressCard} ${s.reviewCard} ${s.documentsCard}`}>
                  <header className={s.progressHeader}>
                    <span>Application progress</span>
                    <span className={s.reviewBadge} data-tone="warning"><i aria-hidden="true" />Action required</span>
                  </header>
                  <section className={s.documentsSummary} aria-labelledby="documents-summary-title">
                    <p id="documents-summary-title">To comply with financial regulations, we need the following documents to verify your identity.</p>
                    <ul>
                      <li><span aria-hidden="true" />Government-issued photo ID</li>
                      <li><span aria-hidden="true" />Proof of current U.S. address</li>
                    </ul>
                  </section>
                  <footer className={s.documentsFooter}>
                    <p>If you have any concerns, reach out to <a href="mailto:support@surmount.ai">support@surmount.ai</a></p>
                    <Link href="/onboarding/verify-documents" className={s.uploadButton}>Upload documents <UploadSimple aria-hidden="true" /></Link>
                  </footer>
                </article>
              ) : submitted ? (
                <article className={`${s.progressCard} ${s.reviewCard}`}>
                  <header className={s.progressHeader}>
                    <span>Application progress</span>
                    <span className={s.reviewBadge}><i aria-hidden="true" />Under review</span>
                  </header>
                  <section className={s.reviewSummary} aria-labelledby="review-summary-title">
                    <div className={s.reviewSummaryTitle}>
                      <strong id="review-summary-title">Your application is under review</strong>
                    </div>
                    <p>We&apos;re verifying your details. Most accounts are approved within 1–2 business days.</p>
                  </section>
                </article>
              ) : (
                <article className={s.progressCard}>
                  <header className={s.progressHeader}>
                    <span>Application progress</span>
                    <span>2 of 3</span>
                  </header>
                  <ul className={s.formStatuses} aria-label="Application form progress">
                    {completedFormSteps.map((label) => <FormStatus complete key={label} label={label} />)}
                    <FormStatus complete={false} label="Review & sign" />
                  </ul>
                  <footer className={s.progressFooter}>
                    <span className={s.saveStatus}><i aria-hidden="true" />Last saved on Aug 9th</span>
                    <Link href="/onboarding/legal-name" className={s.resumeButton}>
                      Resume application
                      <ArrowRight weight="bold" aria-hidden="true" />
                    </Link>
                  </footer>
                </article>
              )}
            </div>
            <div className={s.stepDivider} aria-hidden="true" />
            <div className={s.stepContainer}>
              <div className={s.futureStep} data-active={submitted || undefined}>
                <span aria-hidden="true">2</span>
                <strong>Make your first deposit</strong>
              </div>
              {submitted && (
                <article className={s.bankCard} aria-labelledby="bank-card-title">
                  <h2 id="bank-card-title">Link your bank account</h2>
                  <div className={s.bankBenefits}>
                    <div>
                      <Lightning aria-hidden="true" />
                      <strong>Fund in 2 business days</strong>
                      <p>Deposits clear and are ready to invest.</p>
                    </div>
                    <div>
                      <HandWithdraw aria-hidden="true" />
                      <strong>Withdraw anytime</strong>
                      <p>Move money back when you need it.</p>
                    </div>
                  </div>
                  <footer>
                    <span><Lock aria-hidden="true" />Bank-level encryption via Plaid</span>
                    <Link href="/onboarding/link-bank" className={s.connectButton}>Connect your bank <Bank aria-hidden="true" /></Link>
                  </footer>
                </article>
              )}
            </div>
            <div className={s.stepDivider} aria-hidden="true" />
            <div className={s.stepContainer}>
              <div className={s.futureStep}>
                <span aria-hidden="true">3</span>
                <strong>Pick your first strategy</strong>
              </div>
            </div>
          </section>

          <aside className={s.sidebar}>
            <section className={s.timelineCard} aria-labelledby="timeline-heading">
              <h2 id="timeline-heading">Application timeline</h2>
              <ol>
                <TimelineItem title="Application submitted" detail="Jan 28, 2026" complete />
                {documentsNeeded ? (
                  <TimelineItem title="Identification verification" detail="Action required" current warning />
                ) : (
                  <TimelineItem title="In review" detail="Approx. 1 day" current={submitted} complete={!submitted} />
                )}
                <TimelineItem title="Ready to invest" detail="" />
              </ol>
              <p className={s.support}>Questions? <a href="mailto:support@surmount.ai">support@surmount.ai</a></p>
            </section>
          </aside>
        </div>
      </main>
      <ApplicationStatePicker initialCase={documentsNeeded ? 2 : submitted ? 1 : 0} />
    </div>
  );
}
