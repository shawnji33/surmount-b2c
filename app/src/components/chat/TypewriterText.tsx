'use client';

import { useEffect, useRef, useState } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per character
  startDelay?: number;
  onDone?: () => void;
  className?: string;
}

export function TypewriterText({ text, speed = 18, startDelay = 0, onDone, className }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed('');

    const start = setTimeout(() => {
      const tick = () => {
        const i = indexRef.current;
        if (i >= text.length) {
          onDone?.();
          return;
        }
        setDisplayed(text.slice(0, i + 1));
        indexRef.current = i + 1;
        // vary speed slightly for natural feel
        const jitter = Math.random() * 10 - 5;
        timerRef.current = setTimeout(tick, Math.max(6, speed + jitter));
      };
      tick();
    }, startDelay);

    return () => {
      clearTimeout(start);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, speed, startDelay]);

  return <span className={className}>{displayed}</span>;
}
