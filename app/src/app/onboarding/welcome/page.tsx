'use client';

import { ViewTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CaretRight } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/Button';
import s from './page.module.css';

export default function WelcomePage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={s.shell}>
      <div className={s.container}>
        <ViewTransition name="onboarding-hero-card">
          <motion.div
            className={s.card}
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 160 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    opacity: { duration: 0.8, ease: [0.5, 0, 0.5, 1] },
                    y: { duration: 0.805731, ease: [0.75, 0, 0.25, 1.01] },
                  }
            }
          >
            <div className={s.welcomeContent}>
              <img className={s.icon} src="/assets/onboarding/welcome-icon.svg" alt="" />
              <div className={s.copyBlock}>
                <ViewTransition name="onboarding-step-title">
                  <h1 className={s.title}>Welcome to Surmount</h1>
                </ViewTransition>
                <ViewTransition name="onboarding-step-desc">
                  <p className={s.subtitle}>
                    Let&rsquo;s quickly explore what Surmount can do for you. Click on the buttons below to get started
                  </p>
                </ViewTransition>
              </div>
            </div>

            <ViewTransition name="onboarding-step-cta">
              <Button
                type="button"
                fullWidth={false}
                iconTrailing={<CaretRight weight="regular" aria-hidden="true" />}
                onClick={() => router.push('/onboarding/tour-2')}
              >
                Get started
              </Button>
            </ViewTransition>
          </motion.div>
        </ViewTransition>
      </div>

      <footer className={s.footer}>
        <p className={s.copyright}>©Surmount AI</p>
      </footer>
    </div>
  );
}
