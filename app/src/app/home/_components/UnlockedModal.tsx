'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/Button';
import s from './UnlockedModal.module.css';

// Entrance choreography sourced from Figma node 1798:1203/1789:1386/1789:1388/1789:1395/1789:1401/1797:1140
// (header -> subtitle -> card 1 -> card 2 -> card 3 -> button, each waiting for the previous
// element to mostly finish before starting). Stretched ~1.7x and eased with gentler, floatier
// curves than the project's usual snappy defaults so this celebratory reveal feels ambient
// rather than mechanical. The header->subtitle gap was then tightened (and everything after it
// shifted earlier by the same amount) since the decelerating ease-out curve makes the header
// visually settle well before its animation technically ends, leaving dead air.
const EASE_POSITION: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_FADE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const CARD_DELAYS_S = [1.13, 1.61, 2.11];
const CARD_DURATION_S = 0.48;

type TierId = 'core' | 'plus' | 'pro';

type Feature = {
  icon: ReactNode;
  title: string;
  desc: string;
};

type TierInfo = {
  name: string;
  accent: string;
  badgeColor: string;
  glowColor: string;
  features: Feature[];
};

// Sourced from Figma: Core = node 1789:1381, Plus = node 1798:1204, Pro = node 1798:1258.
const TIERS: Record<TierId, TierInfo> = {
  core: {
    name: 'Core',
    accent: 'linear-gradient(34.9deg, rgb(224, 214, 238) 0%, rgb(244, 240, 250) 100%)',
    badgeColor: 'rgba(232, 224, 243, 0.6)',
    glowColor: 'rgba(167, 136, 215, 0.3)',
    features: [
      {
        icon: <img src="/assets/unlocked-modal/icon-core-connected.svg" alt="" />,
        title: 'Connected investing',
        desc: 'Invest in your external accounts right from Surmount, up to $50,000.',
      },
      {
        icon: <img src="/assets/unlocked-modal/icon-core-dashboard.svg" alt="" />,
        title: 'One unified dashboard',
        desc: 'See your external and Surmount accounts together in a single view.',
      },
      {
        icon: <img src="/assets/unlocked-modal/icon-core-strategies.svg" alt="" />,
        title: 'Ready-made strategies',
        desc: 'Start investing instantly with free, pre-built strategy templates.',
      },
    ],
  },
  plus: {
    name: 'Plus',
    accent: 'linear-gradient(34.9deg, rgb(206, 222, 237) 0%, rgb(239, 244, 249) 100%)',
    badgeColor: '#dce7f2',
    glowColor: 'rgba(142, 179, 216, 0.4)',
    features: [
      {
        icon: <img src="/assets/unlocked-modal/icon-plus-everything.svg" alt="" />,
        title: 'Everything in Core',
        desc: 'connected external investing, unified dashboard, and ready-made strategy templates.',
      },
      {
        icon: <img src="/assets/unlocked-modal/icon-plus-limit.svg" alt="" />,
        title: 'Higher investing limit',
        desc: 'Put up to $150,000 to work across all your connected accounts.',
      },
      {
        icon: <img src="/assets/unlocked-modal/icon-core-dashboard.svg" alt="" />,
        title: 'No-Code & ETF Builders',
        desc: 'Design custom strategies visually and build your own ETF-style baskets, no coding required.',
      },
    ],
  },
  pro: {
    name: 'Pro',
    accent: 'linear-gradient(34.86deg, rgb(227, 232, 210) 3.74%, rgb(243, 245, 235) 100%)',
    badgeColor: '#e3e8d2',
    glowColor: 'rgba(228, 233, 211, 0.4)',
    features: [
      {
        icon: <img src="/assets/unlocked-modal/icon-plus-everything.svg" alt="" />,
        title: 'Everything in Core and Plus',
        desc: 'higher investing limits, no-code & ETF builders, unified dashboard, and ready-made strategies.',
      },
      {
        icon: <img src="/assets/unlocked-modal/icon-pro-unlimited.svg" alt="" />,
        title: 'Unlimited investing',
        desc: 'Invest without limits across internal, external, and paper accounts.',
      },
      {
        icon: <img src="/assets/unlocked-modal/icon-core-dashboard.svg" alt="" />,
        title: 'Every strategy builders',
        desc: 'Unlock all builders: No-Code, Code, AI Builder, and ETF Builder.',
      },
    ],
  },
};

export function UnlockedModal({ tier, onClose }: { tier: string; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const info = TIERS[tier as TierId] ?? TIERS.core;
  const shouldReduceMotion = useReducedMotion();
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={s.overlay}
      onClick={(e) => {
        // Use contains() against a ref rather than e.target === e.currentTarget — the latter is
        // fragile while the entrance animation's transformed/staggered children are still
        // settling in, and could fail to register an outside click during that window.
        if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`You've unlocked Surmount ${info.name}`}
    >
      <div ref={sheetRef} className={s.sheet} style={{ backgroundImage: info.accent }}>
        <div className={s.texture} aria-hidden="true" />

        <div className={s.content}>
          <motion.div
            className={s.headerRow}
            initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -120 }}
            animate={{ opacity: 1, x: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : {
              x: { duration: 0.86, ease: EASE_POSITION },
              opacity: { duration: 0.84, ease: EASE_FADE },
            }}
          >
            <img src="/assets/sidebar/wordmark.svg" alt="Surmount" className={s.headerWordmark} />
            <span className={s.headerTitleDim}>{info.name}</span>
          </motion.div>

          <div className={s.body}>
            <motion.p
              className={s.unlockedLabel}
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.56, ease: EASE_FADE, delay: 0.5 }}
            >
              You&rsquo;ve unlocked:
            </motion.p>

            <div className={s.grid}>
              {info.features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  className={s.featureCard}
                  initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : {
                    x: { duration: CARD_DURATION_S, ease: EASE_POSITION, delay: CARD_DELAYS_S[i] },
                    opacity: { duration: CARD_DURATION_S, ease: EASE_FADE, delay: CARD_DELAYS_S[i] },
                  }}
                >
                  <span className={s.glowLine} style={{ background: info.glowColor }} aria-hidden="true" />
                  <span className={s.featureIcon} style={{ background: info.badgeColor }}>{feature.icon}</span>
                  <div className={s.featureTextGroup}>
                    <p className={s.featureTitle}>{feature.title}</p>
                    <p className={s.featureDesc}>{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className={s.footerRow}
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.56, ease: EASE_FADE, delay: 2.61 }}
            >
              <Button type="button" variant="secondary" fullWidth={false} onClick={onClose}>
                Start enjoying Surmount {info.name}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
