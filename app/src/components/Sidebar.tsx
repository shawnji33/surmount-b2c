'use client';

import {
  ChartLine,
  Gear,
  House,
  Money,
  Vault,
  Wallet,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import s from './Sidebar.module.css';

const NAV_ITEMS = [
  { href: '/home', icon: House, label: 'Home' },
  { href: '/home/strategies', icon: ChartLine, label: 'Strategies' },
  { href: '/home/portfolio', icon: Vault, label: 'Portfolio' },
  { href: '/home/cash', icon: Wallet, label: 'Cash' },
  { href: '/home/dividends', icon: Money, label: 'Dividends' },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={s.sidebar}>
      <div className={s.logoWrap}>
        <img src="/assets/sign-in/surmount-logo.svg" alt="Surmount" className={s.logo} />
      </div>

      <nav className={s.nav} aria-label="Main navigation">
        <ul className={s.navList}>
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/home' && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={[s.navItem, active ? s.navItemActive : ''].filter(Boolean).join(' ')}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon weight={active ? 'fill' : 'regular'} className={s.navIcon} aria-hidden="true" />
                  <span className={s.navLabel}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={s.sidebarFooter}>
        <Link
          href="/home/settings"
          className={[s.navItem, pathname === '/home/settings' ? s.navItemActive : ''].filter(Boolean).join(' ')}
        >
          <Gear weight={pathname === '/home/settings' ? 'fill' : 'regular'} className={s.navIcon} aria-hidden="true" />
          <span className={s.navLabel}>Settings</span>
        </Link>

        <button className={s.userButton} type="button" aria-label="Account menu">
          <div className={s.userAvatar}>L</div>
          <div className={s.userInfo}>
            <span className={s.userName}>Logan Mitchell</span>
            <span className={s.userEmail}>logan@surmount.ai</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
