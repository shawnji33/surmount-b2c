'use client';

import Link from 'next/link';
import s from '../Sidebar.module.css';

type ActivityNavItemProps = {
  active: boolean;
};

function ActivityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5.133 2.667H10.867C12.36 2.667 13.333 3.64 13.333 5.133V10.867C13.333 12.36 12.36 13.333 10.867 13.333H5.133C3.64 13.333 2.667 12.36 2.667 10.867V5.133C2.667 3.64 3.64 2.667 5.133 2.667Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.333 6H10.667M5.333 8.667H10.667M5.333 11.333H8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ActivityNavItem({ active }: ActivityNavItemProps) {
  return (
    <li className={s.navItem}>
      <Link
        href="/activity"
        className={[s.navBtn, active ? s.navBtnActive : ''].filter(Boolean).join(' ')}
        aria-label="Activity"
        aria-current={active ? 'page' : undefined}
      >
        <ActivityIcon />
      </Link>
      <div className={s.tooltip} role="tooltip">Go to Activity</div>
    </li>
  );
}
