import { useLayoutEffect, useRef, type DependencyList } from 'react';

export function useAnimatedHeight<T extends HTMLElement>(dependencies: DependencyList) {
  const ref = useRef<T | null>(null);
  const previousHeight = useRef<number | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;

    if (!element) return undefined;

    const nextHeight = element.getBoundingClientRect().height;
    const lastHeight = previousHeight.current;
    previousHeight.current = nextHeight;

    if (
      lastHeight === null ||
      Math.abs(lastHeight - nextHeight) < 1 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;
    const originalTransition = element.style.transition;
    const originalWillChange = element.style.willChange;
    let isFinished = false;

    const finish = () => {
      if (isFinished) return;
      isFinished = true;
      element.style.height = originalHeight;
      element.style.overflow = originalOverflow;
      element.style.transition = originalTransition;
      element.style.willChange = originalWillChange;
      element.removeEventListener('transitionend', handleTransitionEnd);
      window.clearTimeout(fallback);
    };

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.target === element && event.propertyName === 'height') {
        finish();
      }
    };

    element.style.height = `${lastHeight}px`;
    element.style.overflow = 'hidden';
    element.style.willChange = 'height';
    element.style.transition = 'none';

    // Force the previous height to apply before animating to the new measured height.
    void element.offsetHeight;

    const frame = window.requestAnimationFrame(() => {
      element.addEventListener('transitionend', handleTransitionEnd);
      element.style.transition = 'height 240ms cubic-bezier(0.77, 0, 0.175, 1)';
      element.style.height = `${nextHeight}px`;
    });
    const fallback = window.setTimeout(finish, 320);

    return () => {
      window.cancelAnimationFrame(frame);
      finish();
    };
  }, dependencies);

  return ref;
}

export function formatMoney(value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatOrderInput(value: number) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatWholeInput(value: number) {
  return Math.round(value).toLocaleString('en-US');
}

export function formatCompactMoney(value: number) {
  const absoluteValue = Math.abs(value);
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: absoluteValue >= 1_000_000 ? 1 : 0,
  });

  if (absoluteValue >= 1_000_000) {
    return `${value < 0 ? '-' : ''}$${formatter.format(absoluteValue / 1_000_000)}M`;
  }

  if (absoluteValue >= 1_000) {
    return `${value < 0 ? '-' : ''}$${formatter.format(absoluteValue / 1_000)}k`;
  }

  return formatMoney(value);
}

export function formatProjectionRange(lowValue: number, highValue: number) {
  return `${formatCompactMoney(lowValue)} - ${formatCompactMoney(highValue)}`;
}

export function parseAmount(value: string) {
  const normalizedValue = Number.parseFloat(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(normalizedValue) ? normalizedValue : 0;
}

export function parseAnnualReturn(value: string) {
  const parsedValue = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsedValue) ? parsedValue / 100 : 0.08;
}

export function projectionLabelForMonth(month: number) {
  if (month === 0) return 'Today';
  if (month < 12) return `Month ${month}`;
  if (month % 12 === 0) return `Year ${month / 12}`;
  const years = Math.floor(month / 12);
  const months = month % 12;
  return `Year ${years}, month ${months}`;
}

export function buildProjectionPoints({
  initialInvestment,
  monthlyInvestment,
  years,
  annualReturn,
  shape,
}: {
  initialInvestment: number;
  monthlyInvestment: number;
  years: number;
  annualReturn: number;
  shape: number[];
}) {
  const months = years * 12;
  const pointCount = 25;
  const monthlyReturn = annualReturn / 12;

  return Array.from({ length: pointCount }, (_, index) => {
    const month = Math.round((index / (pointCount - 1)) * months);
    const growthFactor = (1 + monthlyReturn) ** month;
    const recurringValue = monthlyReturn === 0
      ? monthlyInvestment * month
      : monthlyInvestment * ((growthFactor - 1) / monthlyReturn);
    const marketTexture = 1 + (((shape[index % shape.length] ?? 50) - 55) / 1000);
    const contributions = initialInvestment + monthlyInvestment * month;
    const value = Math.max(0, (initialInvestment * growthFactor + recurringValue) * marketTexture);

    return {
      month,
      label: projectionLabelForMonth(month),
      value,
      contributions,
      gains: value - contributions,
    };
  });
}
