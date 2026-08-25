import Link from 'next/link';
import { Check } from '@phosphor-icons/react/dist/ssr';
import { BrandOnlyHeader, SupportLine } from '../_components/Shell';
import s from '../applicationStatus.module.css';

export const metadata = {
  title: 'Documents received — Surmount',
};

/* Figma node 2068:3435. Terminal screen for this scenario — documents are in,
 * nothing left for the user to do but leave. Note this is deliberately separate
 * from /onboarding/documents-received, which serves the older "needs documents"
 * chain (account-setup → verify-documents → documents-received) and carries
 * different copy and a longer review window. */

const SUBMITTED = ['Government-issued photo ID', 'Proof of current U.S. address'];

export default function DocumentsReceivedPage() {
  return (
    <div className={s.page}>
      <BrandOnlyHeader />

      <main className={s.receivedMain}>
        <div className={[s.receivedContent, s.enter].join(' ')}>
          <span className={s.statusPill}>
            <span className={s.statusDot} aria-hidden="true" />
            Documents received
          </span>

          <div className={s.receivedHero}>
            <h1 className={s.receivedTitle}>Thanks, Shawn</h1>
            <p className={s.receivedSubtitle}>
              Your documents are in. We&apos;ll re-review your application within 1–2 business days and email
              you the moment you&apos;re approved.
            </p>
          </div>

          <ul className={s.receivedList}>
            {SUBMITTED.map((item) => (
              <li key={item} className={s.receivedItem}>
                <Check weight="bold" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <Link href="/home" className={[s.cta, s.ctaLg].join(' ')}>
            Back to dashboard
          </Link>

          <SupportLine />
        </div>
      </main>
    </div>
  );
}
