'use client';

import { useState } from 'react';
import s from '../page.module.css';

export function Carousel({ variant = 'default' }: { variant?: 'default' | 'empty' }) {
  const empty = variant === 'empty';
  const [index, setIndex] = useState(0);

  const surmountSlide = (
    <a key="surmount" className={s.carouselSlide} href="/onboarding/investing-account" style={{ padding: 0, background: 'none', display: 'block' }}>
      <img src="/assets/card-start-surmount.png" alt="Start with a Surmount account" className={s.carouselSlideImg} />
    </a>
  );
  const boostSlide = (
    <a key="boost" className={[s.carouselSlide, s.promoCardSlide].join(' ')} href="/onboarding/cash-account">
      <div className={s.promoCardText}>
        <h3 className={s.promoCardTitle}>Boost your savings with our top-notch 4.35% APY</h3>
        <p className={s.promoCardSub}>Make the most of your uninvested funds with our high-yield options.</p>
      </div>
      <span className={s.promoCardArrow} aria-hidden="true">
        <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
          <rect width="256" height="256" fill="none" />
          <line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
          <polyline points="144 56 216 128 144 200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
        </svg>
      </span>
      <div className={s.promoCardIllo} aria-hidden="true">
        <img src="/assets/illustrations/wallet-coin.png" alt="" />
      </div>
    </a>
  );
  // "Pick your first strategy" lives in the investing-account registration
  // flow, not on the default dashboard — so neither variant shows it here.
  const slides = empty
    ? [surmountSlide, boostSlide]
    : [boostSlide, surmountSlide];
  const total = slides.length;
  const safeIndex = Math.min(index, total - 1);

  return (
    <div>
      <div className={s.carouselHeader}>
        <span className={s.carouselCounter}>{safeIndex + 1} of {total}</span>
        <div className={s.carouselControls}>
          <button type="button" className={s.carouselBtn} onClick={() => setIndex((i) => (Math.min(i, total - 1) - 1 + total) % total)} aria-label="Previous slide">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4L6 8l4 4" /></svg>
          </button>
          <button type="button" className={s.carouselBtn} onClick={() => setIndex((i) => (Math.min(i, total - 1) + 1) % total)} aria-label="Next slide">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4l4 4-4 4" /></svg>
          </button>
        </div>
      </div>
      <div style={{ height: '24px' }} />
      <div className={s.carouselViewport}>
        <div
          className={s.carouselTrack}
          style={{ transform: `translateX(calc(-${safeIndex * 100}% - ${safeIndex * 16}px))` }}
        >
          {slides}
        </div>
      </div>
    </div>
  );
}
