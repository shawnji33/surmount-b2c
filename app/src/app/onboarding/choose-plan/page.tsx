'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaretRight } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/Button';
import s from './page.module.css';

const PLANS = [
  {
    value: 'free',
    title: 'Start free',
    desc: 'Invest in strategies and track everything from your dashboard.',
  },
  {
    value: 'paid',
    title: 'Start with a paid plan',
    desc: 'Unlock the strategy builders, higher investing limits, paper trading, and more.',
  },
];

export default function ChoosePlanPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [selected, setSelected] = useState('');

  return (
    <div className={s.shell}>
      <div className={s.container}>
        <motion.div
          className={s.stack}
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35, ease: [0.5, 0, 0.5, 1] }}
        >
          <div className={s.hero}>
            <h1 className={s.title}>Get started in minutes</h1>
            <p className={s.subtitle}>Open your account and start investing, no subscription required.</p>
          </div>

          <div className={s.card}>
            <div className={s.cardHeader}>
              <div className={s.cardHeaderText}>
                <p className={s.cardHeaderTitle}>Choose how you&rsquo;d like to start</p>
                <p className={s.cardHeaderDesc}>You can change or upgrade your plan anytime.</p>
              </div>

              <div className={s.planPreview}>
                <div className={s.planPreviewTexture} aria-hidden="true">
                  <div className={s.planPreviewTextureInner}>
                    <div className={s.planPreviewTextureImage} />
                  </div>
                </div>
                <img
                  className={s.planPreviewWordmark}
                  src="/assets/onboarding/plan-card-wordmark.svg"
                  alt="Surmount"
                />
                <img
                  className={s.planPreviewIcon}
                  src="/assets/onboarding/welcome-icon.svg"
                  alt=""
                />
              </div>
            </div>

            <div className={s.options} role="radiogroup" aria-label="How you'd like to start">
              {PLANS.map((plan) => (
                <button
                  key={plan.value}
                  type="button"
                  role="radio"
                  aria-checked={selected === plan.value}
                  className={s.option}
                  onClick={() => setSelected(plan.value)}
                >
                  <span
                    className={
                      selected === plan.value
                        ? `${s.optionIndicator} ${s.optionIndicatorSelected}`
                        : s.optionIndicator
                    }
                  />
                  <span className={s.optionText}>
                    <p className={s.optionTitle}>{plan.title}</p>
                    <p className={s.optionDesc}>{plan.desc}</p>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            disabled={!selected}
            iconTrailing={<CaretRight weight="regular" aria-hidden="true" />}
            onClick={() => router.push(selected === 'paid' ? '/onboarding/choose-your-plan' : '/onboarding/all-set')}
          >
            Continue
          </Button>
        </motion.div>
      </div>

      <footer className={s.footer}>
        <p className={s.copyright}>©Surmount AI</p>
      </footer>
    </div>
  );
}
