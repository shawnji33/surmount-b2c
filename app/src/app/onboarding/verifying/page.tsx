'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { Play } from '@phosphor-icons/react';
import s from './page.module.css';

// One full loop (fade in → grow → drift up → fade out → brief hold) before handing off.
const REDIRECT_DELAY_MS = 2700;

export default function VerifyingPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  // Bumping this remounts the animation (via `key`) and restarts the redirect timer below —
  // lets the splash be replayed on demand instead of needing a full page reload.
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/onboarding/welcome');
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [router, replayKey]);

  return (
    <div className={s.shell}>
      <button
        type="button"
        className={s.replayButton}
        onClick={() => setReplayKey((k) => k + 1)}
        aria-label="Replay"
      >
        <Play weight="fill" aria-hidden="true" />
      </button>

      <div className={s.container}>
        <motion.div
          key={replayKey}
          className={s.logo}
          initial={
            shouldReduceMotion
              ? { opacity: 1, scaleX: 1, scaleY: 1, y: 0 }
              : { opacity: 0, scaleX: 1, scaleY: 1, y: -0.4 }
          }
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : {
                  opacity: [0, 1, 0, 0],
                  scaleX: [1, 1.6, 1.6],
                  scaleY: [1, 1.6, 1.6],
                  y: [-0.4, -0.4, -58.4, -58.4],
                }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  opacity: {
                    duration: 3,
                    times: [0, 0.5479, 0.8681, 1],
                    ease: [
                      [0.5, 0, 0.5, 1],
                      (t: number) =>
                        1 -
                        Math.exp(-t * 7.6657) *
                          (Math.cos(t * 6.7605) + 1.1339 * Math.sin(t * 6.7605)),
                      'linear',
                    ],
                    repeat: Infinity,
                  },
                  scaleX: {
                    duration: 3,
                    times: [0, 0.4, 1],
                    ease: [[0.753, -0.002, 0.254, 1.007], 'linear'],
                    repeat: Infinity,
                  },
                  scaleY: {
                    duration: 3,
                    times: [0, 0.4, 1],
                    ease: [[0.753, -0.002, 0.254, 1.007], 'linear'],
                    repeat: Infinity,
                  },
                  y: {
                    duration: 3,
                    times: [0, 0.5479, 0.8681, 1],
                    ease: ['linear', [0.75, 0, 0.25, 1.01], 'linear'],
                    repeat: Infinity,
                  },
                }
          }
        >
          <img
            className={s.logoIcon}
            src="/assets/sidebar/logo-mark.svg"
            alt=""
          />
          <img
            className={s.logoWordmark}
            src="/assets/sidebar/wordmark.svg"
            alt="Surmount"
          />
        </motion.div>
      </div>

      <footer className={s.footer}>
        <p className={s.copyright}>©Surmount AI</p>
      </footer>
    </div>
  );
}
