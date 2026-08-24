import Link from 'next/link';
import { X } from '@phosphor-icons/react/dist/ssr';
import s from '../applicationStatus.module.css';

/* Shared chrome for the account-progress screens. The Figma header centres the
 * logo between an inert left slot and the Close button, so the left slot renders
 * a hidden copy of the button — that keeps the logo optically centred without
 * hardcoding the button's width. */
export function StatusHeader({ onCloseHref = '/home' }: { onCloseHref?: string }) {
  const close = (
    <>
      Close
      <X weight="regular" aria-hidden="true" />
    </>
  );

  return (
    <header className={s.header}>
      <span className={[s.closeBtn, s.headerSpacer].join(' ')} aria-hidden="true">
        {close}
      </span>

      <Link href="/home" className={s.brand} aria-label="Surmount — back to dashboard">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/sidebar/logo-mark.svg" alt="" className={s.brandIcon} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/sidebar/wordmark.svg" alt="Surmount" className={s.brandName} />
      </Link>

      <Link href={onCloseHref} className={s.closeBtn}>
        {close}
      </Link>
    </header>
  );
}

export function BrandOnlyHeader() {
  return (
    <header className={s.receivedHeader}>
      <Link href="/home" className={s.brand} aria-label="Surmount — back to dashboard">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/sidebar/logo-mark.svg" alt="" className={s.brandIcon} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/sidebar/wordmark.svg" alt="Surmount" className={s.brandName} />
      </Link>
    </header>
  );
}

export function SupportLine() {
  return (
    <p className={s.support}>
      Questions?{' '}
      <a href="mailto:support@surmount.ai" className={s.supportLink}>
        support@surmount.ai
      </a>
    </p>
  );
}
