import Image from 'next/image';
import Link from 'next/link';
import s from '../_components/onboarding.module.css';

const STEPS = [
  {
    title: 'About you',
    description: 'Answer a few quick questions so we can get to know you and set up your account.',
  },
  {
    title: 'Start investing',
    description: 'Connect a brokerage you already use, or open a Surmount account — and start investing right away.',
  },
];

export default function WelcomePage() {
  return (
    <div className={s.entryShell}>
      <header className={s.topbar}>
        <span className={s.topbarSpacer} aria-hidden="true">Close</span>
        <div className={s.topbarBrand}>
          <img src="/assets/sidebar/logo-mark.svg" alt="" className={s.topbarBrandIcon} />
          <img src="/assets/sidebar/wordmark.svg" alt="Surmount" className={s.topbarBrandName} />
        </div>
        <span className={s.topbarSpacer} aria-hidden="true">Close</span>
      </header>

      <main className={s.entryMainSplit}>
        <div className={s.entrySplit}>
          <Image
            className={s.entryIllo}
            src="/assets/illustrations/investing-account-vault.png"
            alt=""
            width={300}
            height={300}
          />
          <div className={s.entryCol}>
            <div className={s.entryHeading}>
              <h1 className={s.entryTitleLg}>Welcome to Surmount</h1>
              <p className={s.entrySubtitleSplit}>Let&rsquo;s get you set up. Just two steps and you can start investing right away.</p>
            </div>

            <ol className={s.welcomeSteps}>
              {STEPS.map((step, i) => (
                <li key={step.title} className={s.welcomeStep}>
                  <span className={s.welcomeStepNum} aria-hidden="true">{i + 1}</span>
                  <div className={s.welcomeStepBody}>
                    <span className={s.welcomeStepTitle}>{step.title}</span>
                    <span className={s.welcomeStepDesc}>{step.description}</span>
                  </div>
                </li>
              ))}
            </ol>

            <Link href="/onboarding/about-you" className={s.cta} style={{ textDecoration: 'none' }}>
              Get started
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
        <a href="#" className={s.entryFooterLink}>{"Surmount's Terms & Disclosures"}</a>
      </footer>
    </div>
  );
}
