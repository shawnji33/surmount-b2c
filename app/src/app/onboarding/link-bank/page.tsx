'use client';

import { Suspense, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import OnboardingFlow from '../_components/OnboardingFlow';
import s from '../_components/onboarding.module.css';

function LinkBankContent() {
  const searchParams = useSearchParams();
  const isUpdate = searchParams.get('mode') === 'update';
  const [modalOpen, setModalOpen] = useState(false);
  const backHref = isUpdate ? '/home?deposit=1' : '/onboarding/fund-account';
  const linkedHref = isUpdate ? '/onboarding/bank-linked?mode=update' : '/onboarding/bank-linked';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && modalOpen) setModalOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  return (
    <OnboardingFlow back={backHref}>
      <main className={s.linkBankMain}>
        <div className={s.linkBankContent}>
          <Image
            className={s.linkBankIllo}
            src="/assets/illustrations/link-bank-wallet.png"
            alt=""
            width={300}
            height={300}
          />

          <div className={s.linkBankRight}>
            <div>
              <h1 className={s.linkBankHeroTitle}>{isUpdate ? 'Update bank account' : 'Link your bank'}</h1>
              <p className={s.linkBankHeroSub}>
                {isUpdate
                  ? 'Connect a new funding source through Plaid. Your credentials never touch Surmount.'
                  : 'Connect securely through Plaid — your credentials never touch Surmount.'}
              </p>
            </div>

            <div className={s.featureGrid}>
              <div className={s.featureCard}>
                <span className={s.featureCardIcon}>
                  {/* Phosphor Lightning Regular */}
                  <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                    <path d="M213.85,125.46l-112,120a8,8,0,0,1-13.69-7l14.66-73.33L56,160a8,8,0,0,1-5.08-14.31l112-96a8,8,0,0,1,12.89,9.6L143.56,160H192a8,8,0,0,1,5.85,13.46Z"/>
                  </svg>
                </span>
                <span className={s.featureCardTitle}>Fund instantly</span>
                <span className={s.featureCardDesc}>Deposit in seconds</span>
              </div>

              <div className={s.featureCard}>
                <span className={s.featureCardIcon}>
                  {/* Phosphor ArrowUp Regular */}
                  <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                    <path d="M205.66,117.66a8,8,0,0,1-11.32,0L136,59.31V216a8,8,0,0,1-16,0V59.31L61.66,117.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,205.66,117.66Z"/>
                  </svg>
                </span>
                <span className={s.featureCardTitle}>Withdraw anytime</span>
                <span className={s.featureCardDesc}>Move money out fast</span>
              </div>

              <div className={s.featureCard}>
                <span className={s.featureCardIcon}>
                  {/* Phosphor ArrowsClockwise Regular */}
                  <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                    <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16h28.69L195.88,79.06a88,88,0,1,0,2.22,126.51,8,8,0,1,1,11.09,11.52A104,104,0,1,1,195.73,52.63L216,72V56a8,8,0,1,1,16,0Z"/>
                  </svg>
                </span>
                <span className={s.featureCardTitle}>Auto-invest</span>
                <span className={s.featureCardDesc}>Set recurring deposits</span>
              </div>
            </div>

            <div className={s.plaidTrustRow}>
              <div className={s.plaidTrustLabel}>
                <span className={s.plaidTrustBy}>Powered by</span>
                <span className={s.plaidTrustName}>Plaid</span>
              </div>
              <p className={s.plaidTrustDesc}>
                Bank-level encryption · Used by 11,000+ apps · Never shares your password
              </p>
            </div>

            {isUpdate && (
              <div className={s.bankUpdateNotice}>
                <span className={s.bankUpdateNoticeIcon} aria-hidden="true">
                  <svg viewBox="0 0 256 256" fill="currentColor">
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"/>
                  </svg>
                </span>
                <p>
                  Surmount supports one connected bank account at a time. Updating will remove your current Chase connection and replace it with the new bank you choose.
                </p>
              </div>
            )}

            <button
              type="button"
              className={s.btnPlaid}
              onClick={() => setModalOpen(true)}
            >
              {isUpdate ? 'Update with' : 'Connect with'}
              <Image
                src="/assets/illustrations/plaid-logo-white.png"
                alt="Plaid"
                width={40}
                height={16}
                style={{ height: 16, width: 'auto' }}
              />
            </button>
          </div>
        </div>
      </main>

      {/* Plaid consent modal */}
      <div
        className={`${s.plaidModalOverlay} ${modalOpen ? s.plaidModalOverlayOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="plaid-modal-title"
        onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
      >
        <div className={s.plaidModal}>
          <button
            className={s.plaidModalClose}
            type="button"
            aria-label="Close"
            onClick={() => setModalOpen(false)}
          >
            <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" aria-hidden="true">
              <line x1="200" y1="56" x2="56" y2="200"/>
              <line x1="56" y1="56" x2="200" y2="200"/>
            </svg>
          </button>

          <div className={s.plaidModalIcons} aria-hidden="true">
            <div className={`${s.plaidModalIcon} ${s.plaidModalIconPlaid}`}>
              {/* Plaid P mark */}
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4 4h6.5C12.43 4 14 5.57 14 7.5S12.43 11 10.5 11H8v5H4V4zm4 4v3h2.5c.83 0 1.5-.67 1.5-1.5S11.33 8 10.5 8H8z"/>
              </svg>
            </div>
            <div className={`${s.plaidModalIcon} ${s.plaidModalIconBank}`}>
              {/* Phosphor Bank Regular */}
              <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M232,208H208V128h16a8,8,0,0,0,4.43-14.57l-96-64a8,8,0,0,0-8.86,0l-96,64A8,8,0,0,0,32,128H48v80H24a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16ZM112,128a16,16,0,1,1,16,16A16,16,0,0,1,112,128Zm32,80H112V176a16,16,0,0,1,32,0Zm16,0V176a32,32,0,0,0-64,0v32H64V128H192v80Z"/>
              </svg>
            </div>
          </div>

          <p className={s.plaidModalHeading} id="plaid-modal-title">
            {isUpdate ? 'Surmount uses Plaid to update your account' : <>Surmount uses Plaid to<br />connect your account</>}
          </p>

          <div className={s.plaidModalDivider} aria-hidden="true" />

          <div className={s.plaidModalFeatures}>
            <div className={s.plaidModalFeature}>
              <div className={s.plaidModalFeatureIcon} aria-hidden="true">
                {/* Phosphor Lightning Regular */}
                <svg viewBox="0 0 256 256" fill="currentColor">
                  <path d="M213.85,125.46l-112,120a8,8,0,0,1-13.69-7l14.66-73.33L56,160a8,8,0,0,1-5.08-14.31l112-96a8,8,0,0,1,12.89,9.6L143.56,160H192a8,8,0,0,1,5.85,13.46Z"/>
                </svg>
              </div>
              <div className={s.plaidModalFeatureBody}>
                <span className={s.plaidModalFeatureTitle}>Connect in seconds</span>
                <span className={s.plaidModalFeatureDesc}>Thousands of apps trust Plaid to quickly connect to financial institutions.</span>
              </div>
            </div>
            <div className={s.plaidModalFeature}>
              <div className={s.plaidModalFeatureIcon} aria-hidden="true">
                {/* Phosphor ShieldCheck Regular */}
                <svg viewBox="0 0 256 256" fill="currentColor">
                  <path d="M208,40H48A16,16,0,0,0,32,56V120c0,88,88,120,88,120s88-32,88-120V56A16,16,0,0,0,208,40Zm0,80c0,65.4-59.36,96-80,105.4C107.36,216,48,185.4,48,120V56H208ZM82.34,138.34a8,8,0,0,1,11.32-11.32L112,145.36l50.34-50.34a8,8,0,0,1,11.32,11.32l-56,56a8,8,0,0,1-11.32,0Z"/>
                </svg>
              </div>
              <div className={s.plaidModalFeatureBody}>
                <span className={s.plaidModalFeatureTitle}>Keep your data safe</span>
                <span className={s.plaidModalFeatureDesc}>Plaid uses best-in-class encryption to help protect your data.</span>
              </div>
            </div>
          </div>

          <p className={s.plaidModalLegal}>
            {isUpdate && 'Continuing will replace your current connected bank. '}
            By continuing, you agree to Plaid&apos;s{' '}
            <a href="#">Privacy Policy</a>
            {' '}and to receiving updates on plaid.com
          </p>

          <Link href={linkedHref} className={s.plaidModalContinue}>
            Continue
          </Link>
        </div>
      </div>
    </OnboardingFlow>
  );
}

export default function LinkBankPage() {
  return (
    <Suspense fallback={null}>
      <LinkBankContent />
    </Suspense>
  );
}
