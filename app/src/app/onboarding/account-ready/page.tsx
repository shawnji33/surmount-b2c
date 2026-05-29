import Link from 'next/link';
import s from '../_components/onboarding.module.css';

export default function AccountReadyPage() {
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

      <div className={s.readyContainer}>
        <span className={s.accountBadge}>
          <span className={s.badgeDot} />
          <span>Account ready</span>
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <h1 className={s.readyHeading}>You&apos;re ready to invest, Shawn</h1>
          <p className={s.readySubtitle}>
            Your account is set up and funded. Start exploring strategies built by expert traders and invest with one tap.
          </p>
        </div>

        <Link href="/home" className={s.btnExplore}>
          Explore strategies
          <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
          </svg>
        </Link>

        <p className={s.readyFooter}>Questions? <a href="mailto:support@surmount.ai">support@surmount.ai</a></p>
      </div>
    </div>
  );
}
