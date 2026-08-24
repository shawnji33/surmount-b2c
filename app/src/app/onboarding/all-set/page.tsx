'use client';

import { useRouter } from 'next/navigation';
import { Check, CaretRight } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/Button';
import s from './page.module.css';

export default function AllSetPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={s.shell}>
      <div className={s.container}>
        <motion.div
          className={s.stack}
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className={s.iconBadge}>
            <Check className={s.icon} weight="bold" aria-hidden="true" />
          </div>

          <div className={s.copy}>
            <h1 className={s.title}>You&rsquo;re all set</h1>
            <p className={s.subtitle}>
              Your free account is ready. Start exploring strategies and invest with one tap.
            </p>
          </div>

          <Button
            type="button"
            fullWidth={false}
            iconTrailing={<CaretRight weight="regular" aria-hidden="true" />}
            onClick={() => router.push('/home/get-started')}
          >
            View your checklist
          </Button>
        </motion.div>
      </div>

      <footer className={s.footer}>
        <p className={s.copyright}>©Surmount AI</p>
      </footer>
    </div>
  );
}
