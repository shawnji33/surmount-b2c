'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Code, FlowArrow, Sparkle, SquaresFour, X, type Icon } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { BUILDER_TYPES, BUILDER_ORDER, type BuilderSlug } from '../_data';
import { MobileNotice } from '../_components/MobileNotice';
import { BuilderPreview } from './_components/BuilderPreview';
import s from './page.module.css';

const BUILDER_ICONS: Record<BuilderSlug, Icon> = {
  etf: SquaresFour,
  'no-code': FlowArrow,
  code: Code,
  promptfolio: Sparkle,
};

const BADGE_CLASS: Record<BuilderSlug, string> = {
  etf: s.badgeBeginner,
  'no-code': s.badgeIntermediate,
  code: s.badgeAdvanced,
  promptfolio: '',
};

export default function ChooseBuilderPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<BuilderSlug>('etf');

  const activeBuilder = BUILDER_TYPES[selected];

  function handleContinue() {
    router.push(`/home/builder/${selected}`);
  }

  return (
    <main className={s.main}>
      <div className={s.desktopOnly}>
        <div className={s.previewPanel}>
          <div className="dot-grid-panel" aria-hidden="true" />
          <div className={s.previewStage}>
            <BuilderPreview selected={selected} />
          </div>
          <p className={s.caption}>{activeBuilder.longDesc}</p>
        </div>

        <div className={s.decisionPanel}>
          <button
            type="button"
            className={s.closeBtn}
            aria-label="Close"
            onClick={() => router.push('/home/builder')}
          >
            <X weight="bold" />
          </button>

          <div className={s.decisionInner}>
            <div className={s.decisionHead}>
              <h1 className={s.headline}>Choose how you want to build.</h1>
              <p className={s.subhead}>
                Every builder produces a real, tradeable strategy — pick the one that matches how hands-on you want to be.
              </p>
            </div>

            <div className={s.optionList}>
              {BUILDER_ORDER.map((slug) => {
                const type = BUILDER_TYPES[slug];
                const OptionIcon = BUILDER_ICONS[slug];
                const isSelected = slug === selected;
                const isAi = type.badgeTone === 'ai';
                return (
                  <button
                    key={slug}
                    type="button"
                    className={[s.optionRow, isSelected ? s.optionRowSelected : ''].filter(Boolean).join(' ')}
                    aria-pressed={isSelected}
                    onClick={() => setSelected(slug)}
                  >
                    <span className={s.optionIcon}>
                      <OptionIcon weight="regular" />
                    </span>
                    <span className={s.optionText}>
                      <span className={s.optionTitleRow}>
                        <span className={s.optionTitle}>{type.name}</span>
                        {isAi ? (
                          <img src="/assets/badges/ai-badge.svg" alt="Surmount AI" className={s.aiBadge} />
                        ) : (
                          <span className={[s.badge, BADGE_CLASS[slug]].filter(Boolean).join(' ')}>{type.badgeLabel}</span>
                        )}
                      </span>
                      <span className={s.optionDesc}>{type.shortDesc}</span>
                    </span>
                    <span className={s.checkCircle} data-checked={isSelected} aria-hidden="true">
                      {isSelected && <Check weight="bold" />}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className={s.footer}>
              <Link href="/home/builder" className={s.cancelLink}>
                Cancel
              </Link>
              <Button
                type="button"
                variant="primary"
                fullWidth={false}
                iconTrailing={<ArrowRight weight="bold" />}
                onClick={handleContinue}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>

      <MobileNotice />
    </main>
  );
}
