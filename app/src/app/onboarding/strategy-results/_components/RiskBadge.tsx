'use client';

import { type Strategy } from '../_data';
import s from '../page.module.css';

export function RiskBadge({
  risk,
  tone,
  compact = false,
  onDark = false,
}: {
  risk: Strategy['risk'];
  tone: Strategy['badgeTone'];
  compact?: boolean;
  onDark?: boolean;
}) {
  return (
    <span
      className={[
        s.badge,
        compact ? s.badgeCompact : '',
        onDark ? s.badgeOnDark : '',
        tone === 'success' ? s.badgeSuccess : s.badgeWarning,
      ].join(' ')}
    >
      <span className={s.badgeDot} aria-hidden="true" />
      {risk} risk
    </span>
  );
}
