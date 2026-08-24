import Link from 'next/link';
import { Check, WarningCircle } from '@phosphor-icons/react/dist/ssr';
import { StatusHeader, SupportLine } from './_components/Shell';
import s from './applicationStatus.module.css';

export const metadata = {
  title: "You're almost ready to invest — Surmount",
};

/* Figma node 2068:3465. Entry point for the "submitted but not finished"
 * scenario: the user dropped out of the application before identity
 * verification and re-enters from the dashboard card. Everything on this page
 * exists to get them into step 1. */

const REQUIREMENTS = ['Government-issued photo ID', 'Proof of current U.S. address'];

const TIMELINE = [
  { label: 'Application submitted', meta: 'Jan 28, 2026', state: 'done' as const },
  { label: 'Identity verification', meta: 'Action needed', state: 'warn' as const },
  { label: 'Ready to invest', meta: null, state: 'idle' as const },
];

export default function ApplicationStatusPage() {
  return (
    <div className={s.page}>
      <StatusHeader />

      <main className={s.hubMain}>
        <div className={[s.hubContent, s.enter].join(' ')}>
          <div className={s.hubHead}>
            <h1 className={s.title}>You&apos;re almost ready to invest</h1>
            <p className={s.subtitle}>Complete the steps below to activate your account</p>
          </div>

          <div className={s.hubBody}>
            <ol className={s.stepsCol}>
              <li className={s.step}>
                <span className={[s.stepMarker, s.stepMarkerDone].join(' ')} aria-hidden="true">
                  <Check weight="bold" />
                </span>
                <span className={[s.stepLabel, s.stepLabelDone].join(' ')}>Submit your application</span>
                <span className={s.badgeDone}>Completed</span>
              </li>

              <li className={s.stepActive}>
                <span className={s.stepActiveIcon} aria-hidden="true">
                  <WarningCircle weight="regular" />
                </span>
                <div className={s.stepActiveBody}>
                  <div className={s.stepActiveHead}>
                    <h2 className={s.stepActiveTitle}>Verify your identity</h2>
                    <p className={s.stepActiveDesc}>
                      To comply with financial regulations, we need two documents to verify your identity.
                    </p>
                  </div>

                  <ul className={s.reqList}>
                    {REQUIREMENTS.map((req) => (
                      <li key={req} className={s.reqItem}>
                        <Check weight="bold" aria-hidden="true" />
                        {req}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/onboarding/application-status/verify-identity"
                    className={[s.cta, s.ctaSm, s.stepActiveCta].join(' ')}
                  >
                    Upload documents
                  </Link>
                </div>
              </li>

              <li className={s.step}>
                <span className={s.stepMarker} aria-hidden="true">2</span>
                <span className={s.stepLabel}>Make your first deposit</span>
              </li>

              <li className={s.step}>
                <span className={s.stepMarker} aria-hidden="true">3</span>
                <span className={s.stepLabel}>Pick your first strategy</span>
              </li>
            </ol>

            <aside className={s.rail}>
              <div className={s.timelineCard}>
                <p className={s.timelineTitle}>Application timeline</p>

                <ol className={s.timeline}>
                  {TIMELINE.map((item, i) => {
                    const isLast = i === TIMELINE.length - 1;
                    return (
                      <li key={item.label} className={s.timelineRow}>
                        <span className={s.timelineRail} aria-hidden="true">
                          <span
                            className={[
                              s.timelineDot,
                              item.state === 'warn' ? s.timelineDotWarn : '',
                              item.state === 'idle' ? s.timelineDotIdle : '',
                            ].filter(Boolean).join(' ')}
                          />
                          {!isLast && (
                            <span
                              className={[
                                s.timelineLine,
                                item.state === 'warn' ? s.timelineLineWarn : '',
                              ].filter(Boolean).join(' ')}
                            />
                          )}
                        </span>

                        <span className={s.timelineText}>
                          <span
                            className={[
                              s.timelineLabel,
                              item.state === 'warn' ? s.timelineLabelWarn : '',
                              item.state === 'idle' ? s.timelineLabelIdle : '',
                            ].filter(Boolean).join(' ')}
                          >
                            {item.label}
                          </span>
                          {item.meta && (
                            <span
                              className={[
                                s.timelineMeta,
                                item.state === 'warn' ? s.timelineMetaWarn : '',
                              ].filter(Boolean).join(' ')}
                            >
                              {item.meta}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <SupportLine />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
