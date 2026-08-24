import Link from 'next/link';
import s from './VerifyIdentityCard.module.css';

/* Dashboard entry point into the account-progress flow (Figma 2068:3264).
 *
 * Shown when the user has submitted their application but hasn't finished
 * identity verification. `segments` is how the mock expresses progress — three
 * bars, one filled per completed stage — so the percentage in the caption and
 * the filled count come from the same source rather than drifting apart. */

const TOTAL_SEGMENTS = 3;

export function VerifyIdentityCard({
  completedSegments = 1,
  documentsNeeded = 2,
  href = '/onboarding/application-status',
}: {
  completedSegments?: number;
  documentsNeeded?: number;
  href?: string;
}) {
  const filled = Math.max(0, Math.min(TOTAL_SEGMENTS, completedSegments));
  // The mock reads "25% complete" against 1 of 3 bars: the bars track the three
  // remaining stages while the percentage covers the whole account setup,
  // application included. Keep that relationship explicit instead of hardcoding.
  const percent = Math.round((filled / (TOTAL_SEGMENTS + 1)) * 100);

  return (
    <Link href={href} className={s.card}>
      <span className={s.tile}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/illustrations/surmount-logo-mark-amber.png" alt="" className={s.tileMark} />
      </span>

      <span className={s.body}>
        <span className={s.title}>Verify your identity to continue</span>

        <span className={s.track} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Account setup progress">
          {Array.from({ length: TOTAL_SEGMENTS }, (_, i) => (
            <span
              key={i}
              className={[s.segment, i < filled ? s.segmentFilled : ''].filter(Boolean).join(' ')}
            />
          ))}
        </span>

        <span className={s.meta}>
          {percent}% complete · {documentsNeeded} document{documentsNeeded === 1 ? '' : 's'} needed
        </span>
      </span>
    </Link>
  );
}
