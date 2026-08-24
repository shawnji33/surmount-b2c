'use client';

import { useEffect, useState } from 'react';
import { ViewTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CaretRight } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/Button';
import s from './page.module.css';

// Same reasoning as /onboarding/tour and /onboarding/tour-2: the previous screen navigates here
// immediately (no delay) so title/desc/cta start crossfading right away. This panel plays its own
// quick "exiting" phase (empty shell slides out) before swapping to real content and sliding in —
// entirely within this page's own mount lifecycle, so it isn't at risk of being cut off by the
// native ViewTransition hiding the departing page's live DOM mid-animation.
const PANEL_EXIT_DURATION_MS = 280;

// /onboarding/choose-plan doesn't share the onboarding-hero-card ViewTransition (it's a
// structurally different, non-card screen), so there's no shared-element morph for that hop.
// Instead: the whole page slides down + fades out here, then choose-plan fades in on its own
// mount. Navigation is delayed until the exit finishes, same reasoning as the panel exit above —
// keeps it a plain Motion animation on the still-mounted page, not fighting the native transition.
const PAGE_EXIT_DURATION_MS = 350;

const BROKER_CHIPS = [
  { name: 'Coinbase', src: '/assets/brokers/coinbase.png', shape: 'round' as const },
  { name: 'Alpaca', src: '/assets/brokers/alpaca.png', shape: 'square' as const },
  { name: 'Kraken', src: '/assets/brokers/kraken.png', shape: 'round' as const },
  { name: 'E*Trade', src: '/assets/brokers/etrade.png', shape: 'square' as const },
];

const CHECK_BADGES = ['Free to apply', 'No subscription'];

function CheckIcon() {
  return (
    <svg className={s.checkBadgeIcon} viewBox="0 0 10 7" fill="none" aria-hidden="true">
      <path
        d="M8.75 0.75L3.25 6.25L0.75 3.75"
        stroke="#717680"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg className={s.quoteIcon} viewBox="0 0 31 23" fill="none" aria-hidden="true">
      <path d="M15.4977 4.51547C15.1642 4.76014 14.8467 5.0352 14.5453 5.3408L13.0591 6.85067C12.3802 6.48107 11.6276 6.29733 10.8778 6.29733C9.69209 6.29733 8.50722 6.75613 7.60385 7.67386C6.73048 8.56333 6.24911 9.74239 6.24911 10.9992H3C3 8.86053 3.81851 6.85067 5.30774 5.3408C8.07997 2.52468 12.4212 2.24948 15.5007 4.51547H15.4977Z" fill="url(#t3q0)" />
      <path d="M20.9588 12.0778L16.4508 16.6562C16.1494 16.9626 15.8321 17.2376 15.4977 17.4823C14.1269 18.4914 12.5009 18.9975 10.8778 18.9975C8.86047 18.9975 6.8431 18.2163 5.30774 16.6562C3.81851 15.144 3 13.1342 3 10.9963H6.24911C6.24911 12.2523 6.73048 13.4344 7.60385 14.3208C9.14497 15.8863 11.5127 16.1143 13.2974 15.0052C13.6011 14.8163 13.8886 14.5884 14.1541 14.3208L18.6598 9.74484H18.662C19.2969 9.09698 20.3268 9.09698 20.9588 9.74257C21.5938 10.3874 21.5938 11.4323 20.9588 12.0748V12.0778Z" fill="url(#t3q1)" />
      <path d="M27.9991 10.9987H24.75C24.75 9.74191 24.2686 8.56351 23.3954 7.67338C22.492 6.75645 21.307 6.29765 20.1213 6.29765C19.2809 6.29765 18.4412 6.52858 17.7017 6.98965C17.398 7.17871 17.1107 7.40658 16.848 7.67338L12.3371 12.2555C12.0197 12.5779 11.6034 12.7395 11.1872 12.7395C10.7711 12.7395 10.3548 12.5779 10.0374 12.2555C9.40245 11.6107 9.40245 10.565 10.0374 9.92244L14.5462 5.34418C14.8468 5.03778 15.1642 4.76272 15.4984 4.51805C18.5779 2.25206 22.9163 2.52726 25.6892 5.34418C27.1777 6.85631 27.9962 8.86618 27.9962 11.0018L27.9991 10.9987Z" fill="url(#t3q2)" />
      <path d="M27.9991 10.9987C27.9991 13.1366 27.1815 15.1465 25.6923 16.6593C24.1569 18.2188 22.1395 19 20.1222 19C18.4991 19 16.8731 18.4939 15.5016 17.4848C15.8358 17.2401 16.1533 16.9651 16.4539 16.6593L17.9402 15.1496C18.6191 15.5192 19.3695 15.7029 20.1222 15.7029C21.3072 15.7029 22.4922 15.244 23.3954 14.3264C24.2688 13.4369 24.7509 12.2587 24.7509 11.0019H28L27.9991 10.9987Z" fill="url(#t3q3)" />
      <defs>
        <linearGradient id="t3q0" x1="3" y1="6.97973" x2="15.5002" y2="7.07688" gradientUnits="userSpaceOnUse">
          <stop offset="0.264423" stopColor="#34A6ED" />
          <stop offset="1" stopColor="#1047D2" />
        </linearGradient>
        <linearGradient id="t3q1" x1="3" y1="14.1039" x2="21.4339" y2="14.2775" gradientUnits="userSpaceOnUse">
          <stop offset="0.298077" stopColor="#34A6ED" />
          <stop offset="0.754808" stopColor="#54E3DF" />
        </linearGradient>
        <linearGradient id="t3q2" x1="9.5612" y1="7.84684" x2="27.9979" y2="8.02052" gradientUnits="userSpaceOnUse">
          <stop offset="0.125" stopColor="#54E3DF" />
          <stop offset="0.879808" stopColor="#34A6ED" />
        </linearGradient>
        <linearGradient id="t3q3" x1="15.5016" y1="14.9795" x2="27.9996" y2="15.0766" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1047D2" />
          <stop offset="0.711538" stopColor="#34A6ED" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function TourStepThreePage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [panelPhase, setPanelPhase] = useState<'exiting' | 'entering'>('exiting');
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) {
      setPanelPhase('entering');
      return;
    }
    const timer = setTimeout(() => setPanelPhase('entering'), PANEL_EXIT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [shouldReduceMotion]);

  const handleContinue = () => {
    if (shouldReduceMotion) {
      router.push('/onboarding/choose-plan');
      return;
    }
    setIsLeaving(true);
    setTimeout(() => router.push('/onboarding/choose-plan'), PAGE_EXIT_DURATION_MS);
  };

  return (
    <div className={s.shell}>
      <div className={s.container}>
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={isLeaving ? { opacity: 0, y: 40 } : { opacity: 1, y: 0 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: PAGE_EXIT_DURATION_MS / 1000, ease: [0.5, 0, 0.75, 0] }
          }
        >
          <ViewTransition name="onboarding-hero-card">
            <div className={s.card}>
              <div className={s.stepBadge}>
                <p className={s.stepBadgeText}>3 of 3</p>
              </div>

              <div className={s.copyCol}>
                <div className={s.copyText}>
                  <ViewTransition name="onboarding-step-title">
                    <h1 className={s.stepTitle}>Easy to invest</h1>
                  </ViewTransition>
                  <ViewTransition name="onboarding-step-desc">
                    <p className={s.stepDesc}>
                      Set up an account, add funds, and invest in a strategy. That&rsquo;s it, everything after runs on its own.
                    </p>
                  </ViewTransition>
                </div>
                <ViewTransition name="onboarding-step-cta">
                  <Button
                    type="button"
                    size="sm"
                    fullWidth={false}
                    iconTrailing={<CaretRight weight="regular" aria-hidden="true" />}
                    onClick={handleContinue}
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
                    <div className={`${s.panel} ${s.panelBrokerages}`}>
                      <div className={s.chipRow}>
                        {BROKER_CHIPS.map((broker) => (
                          <div key={broker.name} className={s.chip}>
                            <img
                              className={broker.shape === 'round' ? s.chipAvatar : s.chipIcon}
                              src={broker.src}
                              alt=""
                            />
                            <p className={s.chipLabel}>{broker.name}</p>
                          </div>
                        ))}
                        <div className={s.chipMore}>
                          <div className={s.chipMoreAvatar}>
                            <p className={s.chipMoreAvatarText}>+3</p>
                          </div>
                          <p className={s.chipLabel}>And more</p>
                        </div>
                      </div>

                      <div className={s.panelHeading}>
                        <p className={s.panelHeadingTitle}>Connect to your existing brokerages</p>
                        <p className={s.panelHeadingDesc}>
                          Use your existing balance at Alpaca, Kraken, and others to invest in Surmount strategies right away (subscription needed).
                        </p>
                      </div>
                    </div>

                    <div className={`${s.panel} ${s.panelSurmount}`}>
                      <div className={s.quoteRow}>
                        <QuoteIcon />
                        <p className={s.quoteText}>&ldquo;One free account to fund, invest, and track it all&rdquo;</p>
                      </div>

                      <div className={s.panelHeading}>
                        <p className={s.panelHeadingTitle}>Open a Surmount investing account</p>
                        <p className={s.panelHeadingDesc}>Apply in a few minutes, standard fees apply.</p>
                      </div>

                      <hr className={s.divider} />

                      <div className={s.badgeRow}>
                        {CHECK_BADGES.map((label) => (
                          <div key={label} className={s.checkBadge}>
                            <CheckIcon />
                            <p className={s.checkBadgeText}>{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </ViewTransition>
        </motion.div>
      </div>

      <footer className={s.footer}>
        <p className={s.copyright}>©Surmount AI</p>
      </footer>
    </div>
  );
}
