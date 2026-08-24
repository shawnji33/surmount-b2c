'use client';

import { useEffect, useState } from 'react';
import { ViewTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CaretRight } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/Button';
import s from './page.module.css';

// Tour 1 navigates here immediately on "Continue" (no delay), so title/desc/cta start their
// crossfade right away. To make it *look* like Tour 1's panel slides out before this one slides
// in — without animating anything on the page that's actually being unmounted, which the native
// ViewTransition can cut off mid-flight — this panel plays a quick "exiting" phase of its own
// first: an empty shell slides out to the right, then swaps to the real content and slides back
// in. Both phases live entirely within this page's own mount lifecycle, so timing is reliable.
const PANEL_EXIT_DURATION_MS = 280;

export default function TourStepTwoPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [panelPhase, setPanelPhase] = useState<'exiting' | 'entering'>('exiting');

  useEffect(() => {
    if (shouldReduceMotion) {
      setPanelPhase('entering');
      return;
    }
    const timer = setTimeout(() => setPanelPhase('entering'), PANEL_EXIT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [shouldReduceMotion]);

  return (
    <div className={s.shell}>
      <div className={s.container}>
        <ViewTransition name="onboarding-hero-card">
          <div className={s.card}>
            <div className={s.stepBadge}>
              <p className={s.stepBadgeText}>1 of 3</p>
            </div>

            <div className={s.copyCol}>
              <div className={s.copyText}>
                <ViewTransition name="onboarding-step-title">
                  <h1 className={s.stepTitle}>Build your own strategies</h1>
                </ViewTransition>
                <ViewTransition name="onboarding-step-desc">
                  <p className={s.stepDesc}>
                    Describe a strategy in plain words, or assemble one yourself with assets and rules. Either way, rebalancing runs automatically.
                  </p>
                </ViewTransition>
              </div>
              <ViewTransition name="onboarding-step-cta">
                <Button
                  type="button"
                  size="sm"
                  fullWidth={false}
                  iconTrailing={<CaretRight weight="regular" aria-hidden="true" />}
                  onClick={() => router.push('/onboarding/tour')}
                >
                  Continue
                </Button>
              </ViewTransition>
            </div>

            <motion.div
              className={s.previewCol}
              initial={{ opacity: 1, x: 0 }}
              animate={panelPhase === 'exiting' ? { opacity: 0, x: 200 } : { opacity: 1, x: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : panelPhase === 'exiting'
                    ? {
                        opacity: { duration: 0.28, ease: [0.75, 0, 0.25, 1] },
                        x: { duration: 0.28, ease: [0.75, 0, 0.25, 1] },
                      }
                    : {
                        opacity: { duration: 0.3, ease: [0.5, 0, 0.5, 1] },
                        x: { duration: 0.3, ease: [0.75, 0, 0.25, 1] },
                      }
              }
            >
              {panelPhase === 'entering' && (
                <>
                  <div className={`${s.panel} ${s.panelPromptfolio}`}>
                    <div className={s.panelHeading}>
                      <p className={s.panelHeadingTitleAi}>Promptfolio</p>
                      <p className={s.panelHeadingDesc}>
                        Create with AI: describe a strategy in plain words and let AI build it.
                      </p>
                    </div>
                    <img
                      className={s.promptfolioImage}
                      src="/assets/onboarding/tour3-promptfolio.png"
                      alt=""
                    />
                  </div>

                  <div className={`${s.panel} ${s.panelNoCode}`}>
                    <div className={s.panelHeading}>
                      <p className={s.panelHeadingTitle}>No-code strategy builder</p>
                      <p className={s.panelHeadingDesc}>
                        Build it yourself, no code: add assets, set your own rules, and rebalances automatically.
                      </p>
                    </div>
                    <img
                      className={s.strategyBuilderImage}
                      src="/assets/onboarding/tour3-strategy-builder.png"
                      alt=""
                    />
                  </div>
                </>
              )}
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
