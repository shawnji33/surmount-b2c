'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import s from './page.module.css';

// Simulates the verification email itself — reached from the login flow's "Check your email"
// screen ("Open verification link"), and stands in for actually opening a mail client. Both the
// button and the plain-text fallback link "click through" to the same place a real emailed link
// would land on: the verifying splash.
function EmailLinkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'logan@surmount.ai';

  const openLink = () => router.push('/onboarding/verifying');

  return (
    <div className={s.shell}>
      <div className={s.container}>
        <div className={s.emailWindow}>
          <div className={s.emailChrome}>
            <div className={s.emailChromeRow}>
              <span className={s.emailChromeLabel}>From</span>
              <span className={s.emailChromeValue}>Surmount &lt;noreply@surmount.ai&gt;</span>
            </div>
            <div className={s.emailChromeRow}>
              <span className={s.emailChromeLabel}>To</span>
              <span className={s.emailChromeValue}>{email}</span>
            </div>
            <div className={s.emailChromeRow}>
              <span className={s.emailChromeLabel}>Subject</span>
              <span className={s.emailChromeValue}>Verify your Surmount account</span>
            </div>
          </div>

          <div className={s.emailBody}>
            <img className={s.emailLogo} src="/assets/sidebar/logo-mark.svg" alt="Surmount" />

            <h1 className={s.emailTitle}>Verify your email address</h1>
            <p className={s.emailText}>
              Thanks for signing up for Surmount. Click the button below to verify <strong>{email}</strong> and
              continue setting up your account.
            </p>

            <button type="button" className={s.emailCta} onClick={openLink}>
              Verify email address
            </button>

            <p className={s.emailFallback}>
              Or copy and paste this link into your browser:
              <br />
              <button type="button" className={s.emailLink} onClick={openLink}>
                https://app.surmount.ai/verify?token=8f2c1a9d
              </button>
            </p>

            <p className={s.emailFinePrint}>If you didn&apos;t request this, you can safely ignore this email.</p>
          </div>
        </div>
      </div>

      <footer className={s.footer}>
        <p className={s.copyright}>©Surmount AI</p>
      </footer>
    </div>
  );
}

export default function EmailLinkPage() {
  return (
    <Suspense fallback={null}>
      <EmailLinkContent />
    </Suspense>
  );
}
