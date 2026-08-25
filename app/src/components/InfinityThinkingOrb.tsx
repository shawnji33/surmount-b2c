'use client';

import {
  finalizeFrame,
  paintFrame,
  radiusScale,
  type Dot,
} from 'thinking-orbs/engine';
import {
  type CanvasHTMLAttributes,
  useEffect,
  useRef,
} from 'react';

const TAU = Math.PI * 2;

type InfinityThinkingOrbProps = Omit<
  CanvasHTMLAttributes<HTMLCanvasElement>,
  'height' | 'width'
> & {
  width?: number;
  height?: number;
  pathWidth?: number;
  pathHeight?: number;
  dotCount?: number;
  dotScale?: number;
  speed?: number;
};

function wrap(value: number) {
  return value - Math.floor(value);
}

function circularDistance(a: number, b: number) {
  const delta = Math.abs(a - b);
  return Math.min(delta, 1 - delta);
}

/**
 * A sideways figure-eight rendered with thinking-orbs' own canvas painter.
 * The depth value makes the upper-right strand cross in front at the centre.
 */
function makeInfinityFrame(
  width: number,
  height: number,
  elapsedSeconds: number,
  pathWidth: number,
  pathHeight: number,
  dotCount: number,
  dotScale: number,
) {
  const dots: Dot[] = [];
  const radiusMultiplier = radiusScale(Math.min(width, height), 0.56);
  const progress = wrap(elapsedSeconds * 0.19);
  const xRadius = pathWidth / 2;
  const yRadius = pathHeight / 2;
  const centerX = width / 2;
  const centerY = height / 2;

  for (let index = 0; index < dotCount; index += 1) {
    const pathProgress = wrap(index / dotCount + elapsedSeconds * 0.045);
    const angle = pathProgress * TAU;
    const depth = Math.cos(angle);
    const distanceFromLead = circularDistance(pathProgress, progress);
    const lead = Math.exp(-Math.pow(distanceFromLead / 0.095, 2));
    const wake = Math.exp(-Math.pow(circularDistance(pathProgress, wrap(progress - 0.12)) / 0.16, 2));

    dots.push({
      x: centerX + Math.sin(angle) * xRadius,
      y: centerY - Math.sin(angle * 2) * yRadius,
      z: depth,
      r: (0.82 + lead * 1.24 + Math.max(0, depth) * 0.18) * radiusMultiplier * dotScale,
      white: 0.5 - lead * 0.44 - Math.max(0, depth) * 0.06,
      a: 0.44 + wake * 0.24 + lead * 0.32,
    });
  }

  return finalizeFrame(dots, [], 0.8);
}

export function InfinityThinkingOrb({
  width = 112,
  height = 72,
  pathWidth = width * 0.74,
  pathHeight = height * 0.64,
  dotCount = 72,
  dotScale = 1.45,
  speed = 1,
  'aria-label': ariaLabel = 'Submitting your application',
  style,
  ...canvasProps
}: InfinityThinkingOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isVisible = !document.hidden;
    let isIntersecting = true;
    let animationFrame = 0;
    let startTime = performance.now();

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = (now: number) => {
      context.clearRect(0, 0, width, height);
      const elapsed = reducedMotion.matches
        ? 1.1
        : ((now - startTime) / 1000) * speed;
      paintFrame(
        context,
        makeInfinityFrame(
          width,
          height,
          elapsed,
          pathWidth,
          pathHeight,
          dotCount,
          dotScale,
        ),
        false,
      );

      if (!reducedMotion.matches && isVisible && isIntersecting) {
        animationFrame = requestAnimationFrame(draw);
      }
    };

    const restart = () => {
      cancelAnimationFrame(animationFrame);
      startTime = performance.now();
      draw(startTime);
    };

    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible && isIntersecting) restart();
      else cancelAnimationFrame(animationFrame);
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      if (isIntersecting && isVisible) restart();
      else cancelAnimationFrame(animationFrame);
    });

    resize();
    draw(startTime);
    intersectionObserver.observe(canvas);
    document.addEventListener('visibilitychange', handleVisibility);
    reducedMotion.addEventListener('change', restart);

    return () => {
      cancelAnimationFrame(animationFrame);
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      reducedMotion.removeEventListener('change', restart);
    };
  }, [dotCount, dotScale, height, pathHeight, pathWidth, speed, width]);

  return (
    <canvas
      {...canvasProps}
      ref={canvasRef}
      role="img"
      aria-label={ariaLabel}
      style={{ width, height, display: 'block', ...style }}
    />
  );
}
