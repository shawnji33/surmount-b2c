'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import s from '../_components/onboarding.module.css';

function BankLinkedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isUpdate = searchParams.get('mode') === 'update';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const linkBankHref = isUpdate ? '/onboarding/link-bank?mode=update' : '/onboarding/link-bank';
  const closeHref = isUpdate ? '/home?deposit=1' : '/home';
  const ctaHref = isUpdate ? '/home?deposit=1' : '/onboarding/fund-account';

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <div className={s.shell}>
      <header className={s.topbar}>
        <Link href={linkBankHref} className={s.topbarBtn}>
          <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="216" y1="128" x2="40" y2="128"/>
            <polyline points="112 56 40 128 112 200"/>
          </svg>
          Back
        </Link>

        <div className={s.topbarBrand}>
          <img src="/assets/sidebar/logo-mark.svg" alt="" className={s.topbarBrandIcon} />
          <img src="/assets/sidebar/wordmark.svg" alt="Surmount" className={s.topbarBrandName} />
        </div>

        <button className={s.topbarBtn} type="button" onClick={() => router.push(closeHref)}>
          Close
          <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" aria-hidden="true">
            <line x1="200" y1="56" x2="56" y2="200"/>
            <line x1="200" y1="200" x2="56" y2="56"/>
          </svg>
        </button>
      </header>

      <main className={s.bankLinkedMain}>
        <div className={s.bankLinkedContent}>

          <div className={s.bankLinkedHero}>
            <h1 className={s.bankLinkedTitle}>{isUpdate ? 'Bank account updated' : 'Nice work, Shawn'}</h1>
            <p className={s.bankLinkedSub}>
              {isUpdate
                ? 'Your new Chase account is now connected securely through Plaid and ready for deposits.'
                : "You've successfully linked Chase. Connected securely through Plaid — you'll be ready to fund your account the moment your application is approved."}
            </p>
          </div>

          <div className={s.bankLinkedCard}>
            <div className={s.bankLinkedLogoCircle} aria-hidden="true">
              <Image
                src="/assets/illustrations/bank-chase.png"
                alt="Chase"
                width={22}
                height={22}
                style={{ objectFit: 'contain' }}
              />
            </div>

            <div className={s.bankLinkedInfo}>
              <div className={s.bankLinkedNameRow}>
                <span className={s.bankLinkedName}>Chase</span>
                <span className={s.bankLinkedDot} aria-hidden="true" />
              </div>
              <span className={s.bankLinkedAcct}>Checking · ••1234</span>
            </div>

            <div className={s.bankMenuWrap} ref={menuRef}>
              <button
                className={s.bankMenuBtn}
                type="button"
                aria-label="Account options"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen(o => !o)}
              >
                {/* Phosphor DotsThreeVertical Regular */}
                <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                  <path d="M112,60a16,16,0,1,1,16,16A16,16,0,0,1,112,60Zm16,52a16,16,0,1,0,16,16A16,16,0,0,0,128,112Zm0,68a16,16,0,1,0,16,16A16,16,0,0,0,128,180Z"/>
                </svg>
              </button>

              <div
                className={`${s.bankMenuDropdown} ${menuOpen ? s.bankMenuDropdownOpen : ''}`}
                role="menu"
              >
                <button className={s.bankMenuItem} type="button" role="menuitem" onClick={() => router.push('/onboarding/link-bank?mode=update')}>
                  {/* Phosphor ArrowsClockwise Regular */}
                  <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                    <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16h28.69L195.88,79.06a88,88,0,1,0,2.22,126.51,8,8,0,1,1,11.09,11.52A104,104,0,1,1,195.73,52.63L216,72V56a8,8,0,1,1,16,0Z"/>
                  </svg>
                  Change account
                </button>
              </div>
            </div>
          </div>

          <p className={s.bankLinkedDisclaimer}>
            {isUpdate
              ? 'Surmount supports one bank account at a time. Your previous connected bank has been removed and replaced with this account.'
              : 'You can have one bank linked at a time. Updating will replace your current connection.'}
          </p>

          <Link href={ctaHref} className={s.bankLinkedCta}>
            {isUpdate ? 'Return to deposit' : 'Make deposit'}
          </Link>

        </div>
      </main>
    </div>
  );
}

export default function BankLinkedPage() {
  return (
    <Suspense fallback={null}>
      <BankLinkedContent />
    </Suspense>
  );
}
