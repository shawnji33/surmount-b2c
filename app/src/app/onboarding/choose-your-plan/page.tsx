'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/Button';
import s from './page.module.css';

type Cycle = 'monthly' | 'yearly';

type Tier = {
  id: string;
  name: string;
  tint: 'tintCore' | 'tintPlus' | 'tintPro';
  priceMonthly: number;
  priceYearly: number;
  featuresTitle: string;
  features: string[];
  cta: string;
};

const TIERS: Tier[] = [
  {
    id: 'core',
    name: 'Surmount Core',
    tint: 'tintCore',
    priceMonthly: 5,
    priceYearly: 50,
    featuresTitle: 'Everything in Free, plus:',
    features: [
      'Connect and invest in external accounts (up to $50,000)',
      'Access to Dashboard for external + Surmount accounts',
      'Access free strategy templates',
    ],
    cta: 'Select Core',
  },
  {
    id: 'plus',
    name: 'Surmount Plus',
    tint: 'tintPlus',
    priceMonthly: 10,
    priceYearly: 100,
    featuresTitle: 'Everything in Core, plus:',
    features: [
      'Invest up to $150,000 in connected accounts',
      'Access No-Code Strategy Builders (ETF Builder + No-Code Strategy Builder)',
    ],
    cta: 'Select Plus',
  },
  {
    id: 'pro',
    name: 'Surmount Pro',
    tint: 'tintPro',
    priceMonthly: 30,
    priceYearly: 300,
    featuresTitle: 'Everything in Plus, plus:',
    features: [
      'Unlimited investing across internal, external, and paper accounts',
      'Access all strategy builders (No-Code, Code, AI Builder, ETF Builder)',
      'Unlock Paper Trading for testing ideas',
    ],
    cta: 'Select Pro',
  },
];

// Slot-machine style rolling number. Each digit is a reel of 0–9 that slides to its value.
function RollingNumber({ value }: { value: number }) {
  const digits = String(value).split('');
  const len = digits.length;
  return (
    <span className={s.roller} aria-label={String(value)} role="img">
      {digits.map((d, i) => {
        const place = len - 1 - i;
        return (
          <span className={s.reelWindow} key={place} aria-hidden="true">
            <span
              className={s.reel}
              style={{ transform: `translateY(${-Number(d) * 10}%)`, transitionDelay: `${place * 70}ms` }}
            >
              {Array.from({ length: 10 }).map((_, n) => (
                <span className={s.reelDigit} key={n}>
                  {n}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

// On yearly billing, shows the monthly rate annualized (monthly × 12) struck
// through and grayed beside the yearly price, so the saving is visible. Animates
// in/out (bidirectional) on cycle change; unmounts instantly under reduced-motion.
function StrikePrice({ show, amount }: { show: boolean; amount: number }) {
  const [render, setRender] = useState(show);
  const [exiting, setExiting] = useState(false);
  const prev = useRef(show);

  useEffect(() => {
    if (show === prev.current) return;
    prev.current = show;
    if (show) {
      setExiting(false);
      setRender(true);
    } else if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setRender(false);
    } else {
      setExiting(true);
    }
  }, [show]);

  if (!render) return null;

  return (
    <span
      className={[s.strikePrice, exiting ? s.strikePriceExiting : ''].filter(Boolean).join(' ')}
      aria-label={`Normally $${amount} per year when billed monthly`}
      onAnimationEnd={() => {
        if (exiting) {
          setRender(false);
          setExiting(false);
        }
      }}
    >
      ${amount}
    </span>
  );
}

function PlanCard({ plan, cycle, onSelect }: { plan: Tier; cycle: Cycle; onSelect: (plan: Tier) => void }) {
  const amount = cycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  const meta = cycle === 'yearly' ? '/year' : '/month';

  return (
    <div className={`${s.card} ${s[plan.tint]}`}>
      <div className={s.cardTop}>
        <span className={s.cardName}>{plan.name}</span>

        <div className={s.priceRow}>
          <StrikePrice show={cycle === 'yearly'} amount={plan.priceMonthly * 12} />
          <span className={s.price}>
            <span className={s.currency}>$</span>
            <RollingNumber value={amount} />
          </span>
          <span className={s.priceMeta}>{meta}</span>
        </div>

        <Button type="button" onClick={() => onSelect(plan)}>
          {plan.cta}
        </Button>
      </div>

      <div className={s.divider} />

      <div className={s.features}>
        <span className={s.featuresTitle}>{plan.featuresTitle}</span>
        <ul className={s.featureList}>
          {plan.features.map((f) => (
            <li className={s.feature} key={f}>
              <Check className={s.check} weight="bold" aria-hidden="true" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <span className={s.shine} aria-hidden="true" />
    </div>
  );
}

export default function ChooseYourPlanPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [cycle, setCycle] = useState<Cycle>('monthly');

  return (
    <div className={s.shell}>
      <button type="button" className={s.backButton} onClick={() => router.back()}>
        <ArrowLeft weight="regular" aria-hidden="true" />
        Back
      </button>

      <div className={s.container}>
        <motion.div
          className={s.stack}
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className={s.hero}>
            <h1 className={s.title}>Choose your plan</h1>
            <p className={s.subtitle}>Every plan builds on the one before it.</p>
          </div>

          <div className={s.cycleToggle} role="radiogroup" aria-label="Billing cycle">
            <button
              type="button"
              role="radio"
              aria-checked={cycle === 'monthly'}
              className={cycle === 'monthly' ? `${s.cycleOption} ${s.cycleOptionActive}` : s.cycleOption}
              onClick={() => setCycle('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={cycle === 'yearly'}
              className={cycle === 'yearly' ? `${s.cycleOption} ${s.cycleOptionActive}` : s.cycleOption}
              onClick={() => setCycle('yearly')}
            >
              Yearly <span className={s.cycleSave}>· Save 2 months</span>
            </button>
          </div>

          <div className={s.grid}>
            {TIERS.map((tier) => (
              <PlanCard key={tier.id} plan={tier} cycle={cycle} onSelect={() => router.push(`/onboarding/checkout?tier=${tier.id}`)} />
            ))}
          </div>
        </motion.div>
      </div>

      <footer className={s.footer}>
        <p className={s.copyright}>©Surmount AI</p>
      </footer>
    </div>
  );
}
