'use client';

import { useState } from 'react';
import s from '../page.module.css';

export function Carousel() {
  const [index, setIndex] = useState(0);
  const total = 3;
  return (
    <div>
      <div className={s.carouselHeader}>
        <span className={s.carouselCounter}>{index + 1} of {total}</span>
        <div className={s.carouselControls}>
          <button type="button" className={s.carouselBtn} onClick={() => setIndex((i) => (i - 1 + total) % total)} aria-label="Previous slide">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4L6 8l4 4" /></svg>
          </button>
          <button type="button" className={s.carouselBtn} onClick={() => setIndex((i) => (i + 1) % total)} aria-label="Next slide">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4l4 4-4 4" /></svg>
          </button>
        </div>
      </div>
      <div style={{ height: '24px' }} />
      <div className={s.carouselViewport}>
        <div
          className={s.carouselTrack}
          style={{ transform: `translateX(calc(-${index * 100}% - ${index * 16}px))` }}
        >
          <a className={[s.carouselSlide, s.strategyCarouselSlide].join(' ')} href="/onboarding/pick-strategy">
            <div className={s.verifyCardLogo}>
              <img src="/assets/illustrations/surmount-logo-mark.png" alt="Surmount" />
            </div>
            <div className={s.strategyCarouselText}>
              <h3 className={s.strategyCardTitle}>Pick your first strategy</h3>
              <p className={s.verifyCardCaption}>2/3 complete</p>
            </div>
            <div className={s.verifyProgressTrack} role="progressbar" aria-valuenow={67} aria-valuemin={0} aria-valuemax={100} aria-label="2 of 3 complete">
              <div className={[s.verifyProgressSeg, s.strategyProgressSegFull].join(' ')} />
              <div className={[s.verifyProgressSeg, s.strategyProgressSegFull].join(' ')} />
              <div className={[s.verifyProgressSeg, s.strategyProgressSegFull].join(' ')} />
            </div>
            <span className={s.strategyCarouselArrow} aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7.5 5l5 5-5 5" />
              </svg>
            </span>
          </a>
          <a className={[s.carouselSlide, s.promoCardSlide].join(' ')} href="/onboarding/cash-account">
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
          <a className={s.carouselSlide} href="/onboarding/investing-account" style={{ padding: 0, background: 'none', display: 'block' }}>
            <img src="/assets/card-start-surmount.png" alt="Start with a Surmount account" className={s.carouselSlideImg} />
          </a>
        </div>
      </div>
    </div>
  );
}
