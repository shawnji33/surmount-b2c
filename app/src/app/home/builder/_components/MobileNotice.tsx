import { Desktop } from '@phosphor-icons/react';
import s from './MobileNotice.module.css';

export function MobileNotice() {
  return (
    <div className={s.notice} role="status">
      <Desktop className={s.icon} weight="regular" aria-hidden="true" />
      <div className={s.text}>
        <div className={s.title}>Please use desktop for a better experience</div>
        <div className={s.desc}>Creating and managing strategies isn&apos;t available on mobile yet. Visit Surmount on your desktop to build strategies.</div>
      </div>
    </div>
  );
}
