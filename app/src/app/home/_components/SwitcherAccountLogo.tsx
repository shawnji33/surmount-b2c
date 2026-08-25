'use client';

import { type SwitcherAccount } from '../_data';
import s from '../page.module.css';

export function SwitcherAccountLogo({ account, className }: { account: SwitcherAccount; className: string }) {
  if (account.logo) {
    return <img src={account.logo} alt={account.name} className={className} />;
  }

  return (
    <span
      className={[className, s.switcherAccountLogoFallback].join(' ')}
      style={{ backgroundColor: account.color }}
      aria-label={account.name}
      data-initial={account.initial ?? account.name.slice(0, 1)}
    >
    </span>
  );
}
