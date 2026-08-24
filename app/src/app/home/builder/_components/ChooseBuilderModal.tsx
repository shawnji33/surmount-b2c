'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { ArrowRight, Code, FlowArrow, Sparkle, SquaresFour, X, type IconProps } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { BUILDER_ORDER, BUILDER_TYPES, type BuilderSlug } from '../_data';
import s from './ChooseBuilderModal.module.css';

const BUILDER_ICONS: Record<BuilderSlug, ComponentType<IconProps>> = {
  etf: SquaresFour,
  'no-code': FlowArrow,
  code: Code,
  promptfolio: Sparkle,
};

export function ChooseBuilderModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<BuilderSlug>('etf');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!mounted) return null;

  const builder = BUILDER_TYPES[selected];

  return createPortal(
    <div
      className={s.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Choose a builder"
    >
      <div className={s.sheet}>
        <div className={s.header}>
          <div className={s.headerText}>
            <h2 className={s.title}>Choose a builder</h2>
            <p className={s.sub}>Select how you want to create your strategy</p>
          </div>
          <button type="button" className={s.closeBtn} onClick={onClose} aria-label="Close">
            <X weight="regular" aria-hidden="true" />
          </button>
        </div>

        <div className={s.cards}>
          {BUILDER_ORDER.map((slug) => {
            const type = BUILDER_TYPES[slug];
            const Icon = BUILDER_ICONS[slug];
            const isSelected = slug === selected;
            const isAi = type.badgeTone === 'ai';
            return (
              <button
                type="button"
                key={slug}
                className={[s.card, isSelected ? s.cardSelected : ''].filter(Boolean).join(' ')}
                onClick={() => setSelected(slug)}
              >
                <span className={s.radio} aria-hidden="true" />
                <span className={[s.cardIcon, isSelected ? s.cardIconSelected : ''].filter(Boolean).join(' ')}>
                  <Icon weight="regular" />
                </span>
                <span className={s.cardName}>{type.name}</span>
                <span className={[s.badge, isAi ? 'ai-gradient-border' : s[`badge${capitalize(type.badgeTone)}`]].filter(Boolean).join(' ')}>
                  <span className={isAi ? 'ai-gradient-text' : undefined}>{type.badgeLabel}</span>
                </span>
                <span className={s.cardDesc}>{type.shortDesc}</span>
              </button>
            );
          })}
        </div>

        <div className={s.descBar}>{builder.longDesc}</div>

        <div className={s.footer}>
          <Button type="button" variant="secondary" size="sm" fullWidth={false} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            fullWidth={false}
            iconTrailing={<ArrowRight weight="bold" />}
            onClick={() => {
              onClose();
              router.push(`/home/builder/${selected}`);
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function capitalize(v: string) {
  return v.charAt(0).toUpperCase() + v.slice(1);
}
