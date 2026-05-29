import Image from 'next/image';
import Link from 'next/link';
import s from '../_components/onboarding.module.css';

export default function CashAccountPage() {
  return (
    <div className={s.entryShell}>
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

      <main className={s.entryMainSplit}>
        <div className={s.entrySplit}>
          <Image
            className={s.entryIllo}
            src="/assets/illustrations/wallet-coin.png"
            alt=""
            width={300}
            height={300}
          />
          <div className={s.entryCol}>
            <div className={s.entryHeading}>
              <h1 className={s.entryTitleLg}>Cash account</h1>
              <p className={s.entrySubtitleSplit}>Grow your savings with our market-leading 4.08% APY*.</p>
            </div>

            <ul className={s.entryBullets}>
              <li className={s.entryBullet}>
                <Image className={s.entryBulletIcon} src="/assets/cash-bullet-1.svg" alt="" width={20} height={20} />
                <span>No fees or minimum balance required.</span>
              </li>
              <li className={s.entryBullet}>
                <Image className={s.entryBulletIcon} src="/assets/cash-bullet-2.svg" alt="" width={20} height={20} />
                <span>Access your cash whenever needed.</span>
              </li>
              <li className={s.entryBullet}>
                <Image className={s.entryBulletIcon} src="/assets/cash-bullet-3.svg" alt="" width={20} height={20} />
                <span>FDIC insurance covers up to $250,000.</span>
              </li>
            </ul>

            <Link href="/onboarding/legal-name" className={s.cta} style={{ textDecoration: 'none' }}>
              Open account
              <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="40" y1="128" x2="216" y2="128"/>
                <polyline points="144 56 216 128 144 200"/>
              </svg>
            </Link>
          </div>
        </div>
      </main>

      <footer className={s.entryFooter}>
        <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="88 136 112 160 168 104"/>
          <circle cx="128" cy="128" r="96"/>
        </svg>
        <a href="#" className={s.entryFooterLink}>{"Surmount's Cash Account Terms & Disclosures"}</a>
      </footer>
    </div>
  );
}
