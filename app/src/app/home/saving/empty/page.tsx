'use client';

import { Fragment } from 'react';
import {
  ShieldCheck,
  CurrencyDollar,
  Lightning,
  ArrowRight,
  CaretRight,
} from '@phosphor-icons/react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import s from './page.module.css';

const FEATURES = [
  {
    icon: ShieldCheck,
    label: 'FDIC insured',
    sub: 'Up to $2M coverage',
  },
  {
    icon: CurrencyDollar,
    label: 'No account fees',
    sub: 'No minimum balance',
  },
  {
    icon: Lightning,
    label: 'Start earning fast',
    sub: 'Interest compounds daily',
  },
] as const;

const STATS = [
  { value: '4.35% APY', label: 'Deposit in seconds' },
  { value: 'Daily', label: 'Interest compounds' },
  { value: '$0', label: 'Min. balance' },
  { value: 'Withdraw anytime', label: 'No hidden fees' },
] as const;

const STEPS = [
  'Add your personal information',
  'Review and sign agreements',
  'Make your deposit and start earning interest',
] as const;

export default function HycaEmptyPage() {
  return (
    <main className={s.main}>
      <DashboardHeader title="Good morning, Logan" />

      <div className={s.body}>
        {/* ── Left column ── */}
        <div className={s.leftCol}>

          {/* Hero card */}
          <div className={s.heroCard}>
            <div className={s.heroTop}>
              <div className={s.heroContent}>
                <h1 className={s.heroTitle}>Surmount High Yield Cash account</h1>
                <p className={s.heroSubtitle}>
                  Earn <span className={s.apy}>4.35% APY</span> on your uninvested cash
                </p>
              </div>
              <div className={s.heroIllustration}>
                <img src="/assets/illustrations/wallet-coin.png" alt="High yield cash account illustration" />
              </div>
            </div>

            <div className={s.featureRow}>
              {FEATURES.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <Fragment key={feat.label}>
                    {i > 0 && <div className={s.featureDivider} />}
                    <div className={s.feature}>
                      <div className={s.featureIconWrap}>
                        <Icon size={16} weight="regular" color="var(--color-fg-secondary-700, #414651)" />
                      </div>
                      <div>
                        <p className={s.featureName}>{feat.label}</p>
                        <p className={s.featureSub}>{feat.sub}</p>
                      </div>
                    </div>
                  </Fragment>
                );
              })}
            </div>

            <div className={s.actions}>
              <button type="button" className={s.primaryBtn}>
                Open account
                <ArrowRight size={20} weight="regular" color="white" />
              </button>
              <button type="button" className={s.ghostBtn}>
                Learn more
                <CaretRight size={20} weight="regular" color="currentColor" />
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className={s.statsBar}>
            {STATS.map((stat, i) => (
              <Fragment key={stat.value}>
                {i > 0 && <div className={s.statDivider} />}
                <div className={s.statItem}>
                  <p className={s.statValue}>{stat.value}</p>
                  <p className={s.statLabel}>{stat.label}</p>
                </div>
              </Fragment>
            ))}
          </div>

          {/* Compliance */}
          <p className={s.compliance}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident. (Compliance copies)
          </p>
        </div>

        {/* ── Right column ── */}
        <div className={s.rightCol}>

          {/* Get started card */}
          <div className={s.stepsCard}>
            <p className={s.stepsTitle}>Get started in 3 steps</p>
            <div className={s.stepsList}>
              {STEPS.map((text, i) => (
                <div key={i} className={s.step}>
                  <span className={s.stepNum}>{i + 1}</span>
                  <p className={s.stepText}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security card */}
          <div className={s.securityCard}>
            <ShieldCheck
              className={s.securityIcon}
              size={24}
              weight="regular"
              color="var(--color-fg-secondary-700, #414651)"
            />
            <div>
              <p className={s.securityTitle}>Your security is our priority</p>
              <p className={s.securitySub}>Bank-level security to keep your money and data protected</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
