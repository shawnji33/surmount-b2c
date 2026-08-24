'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Code, FlowArrow, Sparkle, SquaresFour, type Icon } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { BUILDER_TYPES, type BuilderSlug } from '../_data';
import { MobileNotice } from '../_components/MobileNotice';
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

export default function BuilderPlaceholderPage() {
  const params = useParams();
  const raw = Array.isArray(params.type) ? params.type[0] : params.type;
  const slug: BuilderSlug = raw && raw in BUILDER_TYPES ? (raw as BuilderSlug) : 'etf';

  const builder = BUILDER_TYPES[slug];
  const Icon = BUILDER_ICONS[slug];
  const isAi = builder.badgeTone === 'ai';

  return (
    <main className={s.main}>
      <div className={s.desktopOnly}>
        <Link href="/home/builder" className={s.backLink}>
          <ArrowLeft weight="regular" />
          Back to Create
        </Link>

        <div className={s.card}>
          <span className={[s.iconBadge, isAi ? 'ai-gradient-border' : ''].filter(Boolean).join(' ')}>
            <Icon weight="regular" />
          </span>

          <div className={s.titleRow}>
            <h1 className={s.title}>{builder.name}</h1>
            <span className={[s.badge, isAi ? 'ai-gradient-border' : BADGE_CLASS[slug]].filter(Boolean).join(' ')}>
              <span className={isAi ? 'ai-gradient-text' : undefined}>{builder.badgeLabel}</span>
            </span>
          </div>

          <span className={s.eyebrow}>Coming soon</span>
          <p className={s.desc}>{builder.longDesc}</p>

          <ul className={s.bullets}>
            {builder.comingSoonBullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>

          <Link href="/home/builder">
            <Button type="button" variant="secondary" fullWidth={false}>
              Back to Create
            </Button>
          </Link>
        </div>
      </div>

      <MobileNotice />
    </main>
  );
}
