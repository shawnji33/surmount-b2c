'use client';

import { ViewTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaretRight } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/Button';
import s from './page.module.css';

const PREVIEW_START_DELAY_MS = 450;

const PREVIEW_STRATEGIES = [
  {
    name: 'Magnificent 7 Insider Trading Follower',
    cover: '/assets/strategy-covers/Magnificient 7 Insider Trading Follower.png',
  },
  {
    name: 'Sustainable Future',
    cover: '/assets/strategy-covers/Sustainable Future.png',
  },
  {
    name: 'AAPL GOOG Arb',
    cover: '/assets/strategy-covers/AAPL GOOG Arb.png',
  },
  {
    name: 'T Rowe US Equity Research Tracker',
    cover: '/assets/strategy-covers/T Rowe US Equity Research Tracker.png',
  },
] as const;

function StrategyCard({ name, cover }: (typeof PREVIEW_STRATEGIES)[number]) {
  return (
    <article className={s.strategyCard}>
      <div className={s.strategyImageWrap}>
        <img className={s.strategyImage} src={cover} alt="" />
      </div>
      <div className={s.strategyMeta}>
        <p className={s.strategyName}>{name}</p>
        <div className={s.strategySources} aria-label="Strategy sources">
          <span className={s.spdrAvatar}>SPDR</span>
          <img src="/assets/logos/AAPL.webp" alt="Apple" />
          <img src="/assets/logos/GOOG.webp" alt="Google" />
        </div>
      </div>
    </article>
  );
}

export default function TourPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [previewStarted, setPreviewStarted] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) {
      setPreviewStarted(true);
      return;
    }

    const timer = window.setTimeout(() => setPreviewStarted(true), PREVIEW_START_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [shouldReduceMotion]);

  return (
    <div className={s.shell}>
      <div className={s.container}>
        <ViewTransition name="onboarding-hero-card">
          <div className={s.card}>
            <div className={s.stepBadge}>
              <p className={s.stepBadgeText}>2 of 3</p>
            </div>

            <div className={s.copyCol}>
              <div className={s.copyText}>
                <ViewTransition name="onboarding-step-title">
                  <h1 className={s.stepTitle}>Strategies do the work</h1>
                </ViewTransition>
                <ViewTransition name="onboarding-step-desc">
                  <p className={s.stepDesc}>
                    Each strategy holds a set of assets and the rules that govern them. Once you invest, trades and rebalancing are handled automatically.
                  </p>
                </ViewTransition>
              </div>
              <ViewTransition name="onboarding-step-cta">
                <Button
                  type="button"
                  size="sm"
                  fullWidth={false}
                  iconTrailing={<CaretRight weight="regular" aria-hidden="true" />}
                  onClick={() => router.push('/onboarding/tour-3')}
                >
                  Continue
                </Button>
              </ViewTransition>
            </div>

            <motion.div
              className={s.previewCol}
              initial={shouldReduceMotion ? false : { opacity: 0, x: 200 }}
              animate={previewStarted ? { opacity: 1, x: 0 } : { opacity: 0, x: 200 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      opacity: { duration: 0.5265, ease: [0.5, 0, 0.5, 1] },
                      x: { duration: 0.5292, ease: [0.75, 0, 0.25, 1] },
                    }
              }
            >
              <div className={s.strategyGrid}>
                {PREVIEW_STRATEGIES.map((strategy) => <StrategyCard key={strategy.name} {...strategy} />)}
              </div>
            </motion.div>
          </div>
        </ViewTransition>
      </div>

      <footer className={s.footer}>
        <p className={s.copyright}>©Surmount AI</p>
      </footer>
    </div>
  );
}
