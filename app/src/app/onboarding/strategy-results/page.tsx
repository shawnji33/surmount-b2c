'use client';

import { ArrowLeft, ArrowRight, BookmarkSimple, CaretDown, CheckCircle, X } from '@phosphor-icons/react';
import { Input } from '@/components/Input';
import Link from 'next/link';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type DependencyList, type PointerEvent } from 'react';
import Brand from '../_components/Brand';
import s from './page.module.css';

type Holding = {
  symbol: string;
  name: string;
  weight: string;
  logo: string;
  color: string;
};

type SectorWeight = {
  name: string;
  weight: string;
  color: string;
};

type Projection = {
  value: string;
  contributions: string;
  gains: string;
  investToday: string;
  investMonthly: string;
  points: number[];
};

type Reason = {
  title: string;
  body: string;
};

type Strategy = {
  id: string;
  name: string;
  oneYearReturn: string;
  risk: 'Low' | 'Medium';
  industry: string;
  holdingsCount: string;
  cover: string;
  badgeTone: 'success' | 'warning';
  tags: string[];
  description: string;
  projection: Projection;
  reasons: Reason[];
  holdings: Holding[];
  sectors: SectorWeight[];
};

type BuyStep = 'about' | 'details' | 'review' | 'submitted';
type ProjectionRange = '1Y' | '2Y' | '5Y' | '10Y';

type ProjectionPoint = {
  month: number;
  label: string;
  value: number;
  contributions: number;
  gains: number;
};

type DemoAccount = {
  id: string;
  name: string;
  balance: number;
  orderAmount: number;
  logo: string;
};

const DEMO_ACCOUNTS: DemoAccount[] = [
  { id: 'webull', name: 'Webull', balance: 2423983.56, orderAmount: 3234.45, logo: '/assets/brokers/av-webull.png' },
  { id: 'robinhood', name: 'Robinhood', balance: 184920.12, orderAmount: 2500, logo: '/assets/brokers/av-robinhood.png' },
  { id: 'schwab', name: 'Schwab IRA', balance: 89340.5, orderAmount: 1500, logo: '/assets/brokers/av-schwab.png' },
  { id: 'ibkr', name: 'IBKR Taxable', balance: 42670.88, orderAmount: 1000, logo: '/assets/brokers/av-ibkr.png' },
];

const PROJECTION_RANGES: ProjectionRange[] = ['1Y', '2Y', '5Y', '10Y'];
const RANGE_YEARS: Record<ProjectionRange, number> = {
  '1Y': 1,
  '2Y': 2,
  '5Y': 5,
  '10Y': 10,
};

const QUANTUM_HOLDINGS: Holding[] = [
  { symbol: 'NVDA', name: 'NVIDIA', weight: '18.75%', logo: '/assets/strategy-result/logos/nvda.webp', color: '#2f5fbd' },
  { symbol: 'AAPL', name: 'Apple Inc.', weight: '16.50%', logo: '/assets/strategy-result/logos/aapl.webp', color: '#1f4f9f' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', weight: '15.24%', logo: '/assets/strategy-result/logos/amzn.webp', color: '#3f6fd8' },
  { symbol: 'GOOG', name: 'Alphabet Inc.', weight: '13.45%', logo: '/assets/strategy-result/logos/goog.webp', color: '#8fb8ea' },
  { symbol: 'V', name: 'Visa', weight: '12.30%', logo: '/assets/strategy-result/logos/v.webp', color: '#c8dbf5' },
];

const QUANTUM_SECTORS: SectorWeight[] = [
  { name: 'Semiconductors', weight: '32.5%', color: '#2f5fbd' },
  { name: 'Cloud infrastructure', weight: '24.0%', color: '#345aa9' },
  { name: 'Consumer platforms', weight: '18.4%', color: '#4b73df' },
  { name: 'Payments', weight: '12.3%', color: '#8fb8ea' },
  { name: 'Utilities', weight: '12.8%', color: '#c8dbf5' },
];

const AI_HOLDINGS: Holding[] = [
  { symbol: 'NVDA', name: 'NVIDIA', weight: '23.40%', logo: '/assets/strategy-result/logos/nvda.webp', color: '#6d4aff' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', weight: '17.85%', logo: '/assets/strategy-result/logos/amzn.webp', color: '#4169e1' },
  { symbol: 'GOOG', name: 'Alphabet Inc.', weight: '16.10%', logo: '/assets/strategy-result/logos/goog.webp', color: '#2f8fed' },
  { symbol: 'AAPL', name: 'Apple Inc.', weight: '12.65%', logo: '/assets/strategy-result/logos/aapl.webp', color: '#8fb8ea' },
  { symbol: 'V', name: 'Visa', weight: '8.20%', logo: '/assets/strategy-result/logos/v.webp', color: '#c8dbf5' },
];

const AI_SECTORS: SectorWeight[] = [
  { name: 'Semiconductors', weight: '38.2%', color: '#6d4aff' },
  { name: 'Cloud infrastructure', weight: '25.8%', color: '#4169e1' },
  { name: 'Automation', weight: '14.5%', color: '#2f8fed' },
  { name: 'Consumer platforms', weight: '13.1%', color: '#8fb8ea' },
  { name: 'Payments', weight: '8.4%', color: '#c8dbf5' },
];

const NANO_HOLDINGS: Holding[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', weight: '17.90%', logo: '/assets/strategy-result/logos/aapl.webp', color: '#2d7a55' },
  { symbol: 'GOOG', name: 'Alphabet Inc.', weight: '14.25%', logo: '/assets/strategy-result/logos/goog.webp', color: '#3b9c72' },
  { symbol: 'NVDA', name: 'NVIDIA', weight: '13.80%', logo: '/assets/strategy-result/logos/nvda.webp', color: '#5bb98d' },
  { symbol: 'V', name: 'Visa', weight: '11.70%', logo: '/assets/strategy-result/logos/v.webp', color: '#8ed3b1' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', weight: '9.65%', logo: '/assets/strategy-result/logos/amzn.webp', color: '#c5ead8' },
];

const NANO_SECTORS: SectorWeight[] = [
  { name: 'Healthcare', weight: '31.5%', color: '#2d7a55' },
  { name: 'Advanced materials', weight: '24.7%', color: '#3b9c72' },
  { name: 'Semiconductors', weight: '17.9%', color: '#5bb98d' },
  { name: 'Manufacturing', weight: '14.2%', color: '#8ed3b1' },
  { name: 'Payments', weight: '11.7%', color: '#c5ead8' },
];

const STRATEGIES: Strategy[] = [
  {
    id: 'quantum',
    name: 'Quantum Computing Leaders',
    oneYearReturn: '+8.50%',
    risk: 'Low',
    industry: 'Utilities',
    holdingsCount: '24 assets',
    cover: '/assets/strategy-result/covers/quantum-computing-leaders.png',
    badgeTone: 'success',
    tags: ['Low risk', 'Technology'],
    description:
      'This strategy focuses on established technology leaders and infrastructure companies positioned to benefit from quantum computing adoption while keeping risk controlled through diversified holdings.',
    projection: {
      value: '$954k - $2.1M',
      contributions: '$70.0k',
      gains: '+134.5K',
      investToday: '50,000',
      investMonthly: '1,000',
      points: [44, 43, 45, 42, 43, 48, 47, 50, 48, 55, 54, 58, 57, 64, 60, 65, 62, 68, 67, 72, 70, 76, 73, 80],
    },
    reasons: [
      { title: 'Quantum infrastructure', body: 'Targets companies building the compute stack behind next-generation models.' },
      { title: '10+ years', body: 'Best suited for compounding through a full technology adoption cycle.' },
      { title: 'Controlled risk profile', body: 'Diversified exposure keeps the strategy aligned with a steadier risk tolerance.' },
      { title: 'Utilities', body: 'Utilities exposure helps balance the high-growth technology theme.' },
    ],
    holdings: QUANTUM_HOLDINGS,
    sectors: QUANTUM_SECTORS,
  },
  {
    id: 'ai',
    name: 'AI Infrastructure Leaders',
    oneYearReturn: '+9.10%',
    risk: 'Medium',
    industry: 'Technology',
    holdingsCount: '31 assets',
    cover: '/assets/strategy-result/covers/ai-innovators.png',
    badgeTone: 'warning',
    tags: ['Medium risk', 'AI'],
    description:
      'A more growth-oriented strategy built around AI infrastructure, data centers, and semiconductor companies with higher upside and higher volatility.',
    projection: {
      value: '$1.2M - $2.8M',
      contributions: '$88.0k',
      gains: '+196.2K',
      investToday: '65,000',
      investMonthly: '1,250',
      points: [38, 40, 39, 43, 42, 47, 45, 52, 49, 57, 54, 62, 58, 66, 61, 72, 68, 77, 71, 83, 78, 88, 82, 92],
    },
    reasons: [
      { title: 'Higher upside exposure', body: 'Concentrates around semiconductor, cloud, and automation leaders.' },
      { title: '5-10 years', body: 'Designed for users comfortable with more pronounced cycles and faster repricing.' },
      { title: 'Higher growth profile', body: 'More concentrated growth themes create higher upside with more expected volatility.' },
      { title: 'Technology', body: 'Technology exposure matches your appetite for AI-led market expansion.' },
    ],
    holdings: AI_HOLDINGS,
    sectors: AI_SECTORS,
  },
  {
    id: 'nano',
    name: 'Nanotechnology',
    oneYearReturn: '+7.40%',
    risk: 'Low',
    industry: 'Healthcare',
    holdingsCount: '18 assets',
    cover: '/assets/strategy-result/covers/nanotechnology-innovators.png',
    badgeTone: 'success',
    tags: ['Low risk', 'Innovation'],
    description:
      'A diversified strategy focused on nanotechnology applications across healthcare, materials, and manufacturing with a balanced risk profile.',
    projection: {
      value: '$822k - $1.7M',
      contributions: '$62.5k',
      gains: '+98.4K',
      investToday: '40,000',
      investMonthly: '850',
      points: [46, 46, 47, 45, 48, 49, 50, 52, 51, 54, 55, 56, 58, 59, 60, 62, 61, 64, 65, 66, 68, 69, 71, 72],
    },
    reasons: [
      { title: 'Healthcare innovation', body: 'Captures nanotechnology use cases across diagnostics, materials, and devices.' },
      { title: '7+ years', body: 'Works best for patient investors who want steady exposure to applied innovation.' },
      { title: 'Balanced risk profile', body: 'Spreads exposure across healthcare, materials, and manufacturing applications.' },
      { title: 'Healthcare', body: 'Healthcare exposure anchors the strategy with more defensive demand drivers.' },
    ],
    holdings: NANO_HOLDINGS,
    sectors: NANO_SECTORS,
  },
];

function useAnimatedHeight<T extends HTMLElement>(dependencies: DependencyList) {
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

function ProjectionChart({
  points,
  activeIndex,
  onActiveIndexChange,
}: {
  points: ProjectionPoint[];
  activeIndex: number | null;
  onActiveIndexChange: (index: number | null) => void;
}) {
  const maxValue = Math.max(...points.map((point) => point.value), 1) * 1.08;
  const coordinates = points.map((point, index) => {
    const x = (index / (points.length - 1)) * 100;
    const y = 68 - (point.value / maxValue) * 62;
    return { ...point, x, y };
  });
  const path = coordinates
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  const activePoint = activeIndex == null ? null : coordinates[activeIndex];

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onActiveIndexChange(Math.round(ratio * (points.length - 1)));
  };

  return (
    <div
      className={s.chartWrap}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => onActiveIndexChange(null)}
      aria-label="Projected portfolio value chart"
    >
      <svg className={s.chart} viewBox="0 0 100 72" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="projection-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(64,106,208,0.24)" />
            <stop offset="100%" stopColor="rgba(64,106,208,0)" />
          </linearGradient>
        </defs>
        <path className={s.chartFill} d={`${path} L 100 72 L 0 72 Z`} fill="url(#projection-fill)" />
        <path className={s.chartLine} d={path} fill="none" stroke="#406ad0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
        {activePoint && (
          <>
            <line
              className={s.chartHoverLine}
              x1={activePoint.x}
              x2={activePoint.x}
              y1="4"
              y2="70"
              vectorEffect="non-scaling-stroke"
            />
            <circle className={s.chartHoverDot} cx={activePoint.x} cy={activePoint.y} r="2.4" vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
      {activePoint && (
        <div
          className={s.chartTooltip}
          style={{
            left: `${activePoint.x}%`,
            top: `${activePoint.y}%`,
          } as CSSProperties}
        >
          <span>{activePoint.label}</span>
          <strong>{formatMoney(activePoint.value)}</strong>
          <small>Contributions {formatCompactMoney(activePoint.contributions)} · Gains {formatCompactMoney(activePoint.gains)}</small>
        </div>
      )}
    </div>
  );
}

function formatMoney(value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatOrderInput(value: number) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatWholeInput(value: number) {
  return Math.round(value).toLocaleString('en-US');
}

function formatCompactMoney(value: number) {
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

function formatProjectionRange(lowValue: number, highValue: number) {
  return `${formatCompactMoney(lowValue)} - ${formatCompactMoney(highValue)}`;
}

function parseAmount(value: string) {
  const normalizedValue = Number.parseFloat(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(normalizedValue) ? normalizedValue : 0;
}

function parseAnnualReturn(value: string) {
  const parsedValue = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsedValue) ? parsedValue / 100 : 0.08;
}

function projectionLabelForMonth(month: number) {
  if (month === 0) return 'Today';
  if (month < 12) return `Month ${month}`;
  if (month % 12 === 0) return `Year ${month / 12}`;
  const years = Math.floor(month / 12);
  const months = month % 12;
  return `Year ${years}, month ${months}`;
}

function buildProjectionPoints({
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

function RiskBadge({
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

export default function StrategyResultsPage() {
  const [selectedId, setSelectedId] = useState(STRATEGIES[0].id);
  const [range, setRange] = useState<ProjectionRange>('1Y');
  const [investToday, setInvestToday] = useState('50,000');
  const [investMonthly, setInvestMonthly] = useState('1,000');
  const [activeProjectionIndex, setActiveProjectionIndex] = useState<number | null>(null);
  const [holdingsView, setHoldingsView] = useState<'overview' | 'sector'>('overview');
  const [buyStep, setBuyStep] = useState<BuyStep>('about');
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isHoldingBreakdownOpen, setIsHoldingBreakdownOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderAmount, setOrderAmount] = useState('0.00');
  const [investedAmounts, setInvestedAmounts] = useState<Record<string, Record<string, number>>>({});
  const [watchlistedIds, setWatchlistedIds] = useState<string[]>([]);
  const [toastId, setToastId] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastLeaving, setIsToastLeaving] = useState(false);
  const toastTimerRef = useRef<number | undefined>(undefined);
  const toastLeaveTimerRef = useRef<number | undefined>(undefined);
  const selected = useMemo(
    () => STRATEGIES.find((strategy) => strategy.id === selectedId) ?? STRATEGIES[0],
    [selectedId],
  );
  const selectedAccount = useMemo(
    () => DEMO_ACCOUNTS.find((account) => account.id === selectedAccountId) ?? null,
    [selectedAccountId],
  );
  const watchlisted = watchlistedIds.includes(selected.id);
  const parsedInvestToday = parseAmount(investToday);
  const parsedInvestMonthly = parseAmount(investMonthly);
  const projectionYears = RANGE_YEARS[range];
  const projectionAnnualReturn = parseAnnualReturn(selected.oneYearReturn) * 1.65 + 0.04;
  const projectionPoints = useMemo(
    () => buildProjectionPoints({
      initialInvestment: parsedInvestToday,
      monthlyInvestment: parsedInvestMonthly,
      years: projectionYears,
      annualReturn: projectionAnnualReturn,
      shape: selected.projection.points,
    }),
    [parsedInvestMonthly, parsedInvestToday, projectionAnnualReturn, projectionYears, selected.projection.points],
  );
  const terminalProjection = projectionPoints[projectionPoints.length - 1];
  const projectionUncertainty = 0.08 + projectionYears * 0.012;
  const projectedLowValue = terminalProjection.value * (1 - projectionUncertainty);
  const projectedHighValue = terminalProjection.value * (1 + projectionUncertainty);
  const projectedContributionValue = terminalProjection.contributions;
  const projectedGainValue = terminalProjection.gains;
  const parsedOrderAmount = parseAmount(orderAmount);
  const estimatedCost = parsedOrderAmount > 0 ? parsedOrderAmount + 11 : 0;
  const canReviewOrder = Boolean(selectedAccount) && parsedOrderAmount > 0;
  const accountHoldings = investedAmounts[selected.id] ?? {};
  const holdingRows = DEMO_ACCOUNTS.map((account) => ({
    account,
    amount: accountHoldings[account.id] ?? 0,
  })).filter(({ amount }) => amount > 0);
  const investedAmount = holdingRows.reduce((total, { amount }) => total + amount, 0);
  const orderAccount = selectedAccount ?? DEMO_ACCOUNTS[0];
  const projectionCardRef = useAnimatedHeight<HTMLDivElement>([selected.id, range]);
  const reasonGridRef = useAnimatedHeight<HTMLDivElement>([selected.id]);
  const holdingsCardRef = useAnimatedHeight<HTMLDivElement>([selected.id]);
  const infoShellRef = useAnimatedHeight<HTMLDivElement>([
    selected.id,
    watchlisted,
    buyStep,
    isAccountOpen,
    selectedAccountId,
    isSubmittingOrder,
    orderAmount,
    investedAmount,
  ]);

  useEffect(() => () => {
    if (toastTimerRef.current != null) window.clearTimeout(toastTimerRef.current);
    if (toastLeaveTimerRef.current != null) window.clearTimeout(toastLeaveTimerRef.current);
  }, []);

  useEffect(() => {
    setInvestToday(selected.projection.investToday);
    setInvestMonthly(selected.projection.investMonthly);
    setActiveProjectionIndex(null);
    setBuyStep('about');
    setIsAccountOpen(false);
    setSelectedAccountId(null);
    setIsHoldingBreakdownOpen(false);
    setIsSubmittingOrder(false);
    setOrderAmount('0.00');
  }, [selected.id, selected.projection.investMonthly, selected.projection.investToday]);

  useEffect(() => {
    if (!isSubmittingOrder || !selectedAccountId) return undefined;

    const timeout = window.setTimeout(() => {
      setInvestedAmounts((current) => ({
        ...current,
        [selected.id]: {
          ...(current[selected.id] ?? {}),
          [selectedAccountId]: ((current[selected.id] ?? {})[selectedAccountId] ?? 0) + parsedOrderAmount,
        },
      }));
      setIsSubmittingOrder(false);
      setBuyStep('submitted');
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [isSubmittingOrder, parsedOrderAmount, selected.id, selectedAccountId]);

  const dismissToast = () => {
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = undefined;
    }
    if (toastLeaveTimerRef.current != null) window.clearTimeout(toastLeaveTimerRef.current);
    setIsToastLeaving(true);
    toastLeaveTimerRef.current = window.setTimeout(() => {
      setToastMessage('');
      setIsToastLeaving(false);
      toastLeaveTimerRef.current = undefined;
    }, 220);
  };

  const showToast = (message: string) => {
    if (toastTimerRef.current != null) window.clearTimeout(toastTimerRef.current);
    if (toastLeaveTimerRef.current != null) window.clearTimeout(toastLeaveTimerRef.current);
    setIsToastLeaving(false);
    setToastId((id) => id + 1);
    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(dismissToast, 4200);
  };

  const handleWatchlistToggle = () => {
    if (watchlisted) {
      setWatchlistedIds((current) => current.filter((id) => id !== selected.id));
      showToast(`${selected.name} has been removed from your watchlist.`);
      return;
    }

    setWatchlistedIds((current) => (current.includes(selected.id) ? current : [...current, selected.id]));
    showToast(`${selected.name} has been added to your watchlist.`);
  };

  const selectStrategyByIndex = (index: number) => {
    const normalizedIndex = (index + STRATEGIES.length) % STRATEGIES.length;
    setSelectedId(STRATEGIES[normalizedIndex].id);
  };

  const handleProjectionInputChange = (
    setter: (value: string) => void,
  ) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, '');
    setter(value ? Number(value).toLocaleString('en-US') : '');
  };

  const handleProjectionInputBlur = (
    value: string,
    setter: (value: string) => void,
  ) => {
    const parsedValue = parseAmount(value);
    setter(parsedValue > 0 ? formatWholeInput(parsedValue) : '0');
  };

  const handleOrderAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9.]/g, '');
    const [whole = '', ...decimalParts] = value.split('.');
    const decimalValue = decimalParts.join('').slice(0, 2);
    setOrderAmount(decimalParts.length > 0 ? `${whole}.${decimalValue}` : whole);
  };

  const handleOrderAmountBlur = () => {
    if (parsedOrderAmount > 0) {
      setOrderAmount(formatOrderInput(parsedOrderAmount));
    }
  };

  const applyMaxAmount = () => {
    setOrderAmount(formatOrderInput((selectedAccount ?? DEMO_ACCOUNTS[0]).orderAmount));
  };

  const submitOrder = () => {
    if (!canReviewOrder) return;
    setIsSubmittingOrder(true);
  };

  const resetBuyFlow = () => {
    setBuyStep('about');
    setIsAccountOpen(false);
    setSelectedAccountId(null);
    setIsHoldingBreakdownOpen(false);
    setIsSubmittingOrder(false);
    setOrderAmount('0.00');
  };

  return (
    <div className={s.page}>
      {toastMessage !== '' && (
        <div className={s.toastRegion} aria-live="polite" aria-atomic="true">
          <div
            key={toastId}
            className={[s.toast, isToastLeaving ? s.toastLeaving : ''].filter(Boolean).join(' ')}
            role="status"
          >
            <CheckCircle className={s.toastIcon} weight="fill" aria-hidden="true" />
            <p className={s.toastText}>{toastMessage}</p>
            <button type="button" className={s.toastDismiss} aria-label="Dismiss alert" onClick={dismissToast}>
              <X aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <header className={s.topbar}>
        <Link href="/onboarding/strategy-quiz" className={s.topbarButton}>
          <ArrowLeft aria-hidden="true" />
          <span>Back</span>
        </Link>

        <div className={s.brand}>
          <Brand size={32} />
          <span>Surmount</span>
        </div>

        <Link href="/home" className={s.topbarButton}>
          <span>Close</span>
          <X aria-hidden="true" />
        </Link>
      </header>

      <main className={s.main}>
        <section className={s.heading}>
          <h1>Your top match, Shawn</h1>
          <p>
            We analyzed all strategies against your goals, time horizon, risk tolerance,
            experience, and theme preferences. Here&apos;s what fits you best.
          </p>
        </section>

        <div className={[s.carouselRail, s.matchSelector].join(' ')} aria-label="Choose strategy match">
          {STRATEGIES.map((strategy, index) => (
            <button
              key={strategy.id}
              type="button"
              className={strategy.id === selected.id ? s.carouselRailActive : ''}
              onClick={() => selectStrategyByIndex(index)}
              aria-pressed={strategy.id === selected.id}
            >
              <span className={s.railImage}>
                <img src={strategy.cover} alt="" />
              </span>
              <span>
                <strong>{strategy.name}</strong>
                <small>{strategy.oneYearReturn} · {strategy.risk} risk</small>
              </span>
            </button>
          ))}
        </div>

        <div className={s.contentGrid}>
          <section className={s.strategyColumn} aria-label="Strategy match details">
            <div className={s.heroCarousel}>
              <article className={s.heroCard}>
                <img key={`hero-media-${selected.id}`} className={s.heroMediaSwap} src={selected.cover} alt="" />
                <span className={s.heroProgressiveBlur} aria-hidden="true" />
                <div className={s.heroOverlay} />
                <div key={`hero-copy-${selected.id}`} className={[s.heroDetails, s.contentSwap].join(' ')}>
                  <h2>{selected.name}</h2>
                  <dl className={s.heroMetrics}>
                    <div>
                      <dt>1-Year return</dt>
                      <dd className={s.positive}>{selected.oneYearReturn}</dd>
                    </div>
                    <div>
                      <dt>Risk</dt>
                      <dd>
                        <span
                          className={[s.riskDot, selected.risk === 'Medium' ? s.riskDotWarning : s.riskDotSuccess].join(' ')}
                          aria-hidden="true"
                        />
                        {selected.risk}
                      </dd>
                    </div>
                    <div>
                      <dt>Top industry</dt>
                      <dd>{selected.industry}</dd>
                    </div>
                    <div>
                      <dt>Holdings</dt>
                      <dd>{selected.holdingsCount}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            </div>

            <section className={s.sectionBlock} aria-labelledby="projection-title">
              <h2 id="projection-title" className={s.sectionTitle}>Projected portfolio value</h2>
              <div ref={projectionCardRef} className={s.projectionCard}>
                <div key={`projection-copy-${selected.id}`} className={[s.projectionBody, s.contentSwap].join(' ')}>
                  <div className={s.projectionTop}>
                    <div>
                      <p className={s.projectionValue}>{formatProjectionRange(projectedLowValue, projectedHighValue)}</p>
                      <div className={s.legend}>
                        <span><i className={s.legendContributions} /> Contributions <strong>{formatCompactMoney(projectedContributionValue)}</strong></span>
                        <span><i className={s.legendGains} /> Gains <strong>{formatCompactMoney(projectedGainValue)}</strong></span>
                      </div>
                    </div>
                    <div className={s.rangeControl} aria-label="Projection range">
                      {PROJECTION_RANGES.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className={range === item ? s.rangeActive : ''}
                          onClick={() => setRange(item)}
                          aria-pressed={range === item}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ProjectionChart
                    points={projectionPoints}
                    activeIndex={activeProjectionIndex}
                    onActiveIndexChange={setActiveProjectionIndex}
                  />
                </div>
                <div className={s.inputGrid}>
                  <Input
                    size="sm"
                    label="Invest today"
                    value={investToday}
                    onChange={handleProjectionInputChange(setInvestToday)}
                    onBlur={() => handleProjectionInputBlur(investToday, setInvestToday)}
                    inputMode="numeric"
                    className={s.projectionInput}
                    iconLeading={<span className={s.inputCurrency}>$</span>}
                  />
                  <Input
                    size="sm"
                    label="Invest every month"
                    value={investMonthly}
                    onChange={handleProjectionInputChange(setInvestMonthly)}
                    onBlur={() => handleProjectionInputBlur(investMonthly, setInvestMonthly)}
                    inputMode="numeric"
                    className={s.projectionInput}
                    iconLeading={<span className={s.inputCurrency}>$</span>}
                  />
                </div>
              </div>
            </section>

            <section className={s.sectionBlock} aria-labelledby="recommended-title">
              <h2 id="recommended-title" className={s.sectionTitle}>Why this was recommended for you</h2>
              <div ref={reasonGridRef} className={s.reasonGrid}>
                {selected.reasons.map((reason, index) => (
                  <article key={index} className={s.reasonCard}>
                    <div key={`${selected.id}-${reason.title}`} className={s.contentSwap}>
                      <h3>{reason.title}</h3>
                      <p>{reason.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className={s.sectionBlock} aria-labelledby="holdings-title">
              <h2 id="holdings-title" className={s.sectionTitle}>Holdings</h2>
              <div ref={holdingsCardRef} className={s.holdingsCard}>
                <div className={s.tabs} aria-label="Holdings view">
                  <button
                    type="button"
                    className={holdingsView === 'overview' ? s.tabActive : ''}
                    onClick={() => setHoldingsView('overview')}
                    aria-pressed={holdingsView === 'overview'}
                  >
                    Asset
                  </button>
                  <button
                    type="button"
                    className={holdingsView === 'sector' ? s.tabActive : ''}
                    onClick={() => setHoldingsView('sector')}
                    aria-pressed={holdingsView === 'sector'}
                  >
                    Sector
                  </button>
                </div>
                <div key={`allocation-${selected.id}-${holdingsView}`} className={[s.allocationWrap, s.contentSwap].join(' ')}>
                  <div className={s.allocationBar} aria-label={`${holdingsView === 'overview' ? 'Asset' : 'Sector'} allocation chart`}>
                    {(holdingsView === 'overview' ? selected.holdings : selected.sectors).map((item) => {
                      const label = holdingsView === 'overview' ? (item as Holding).name : item.name;
                      const value = holdingsView === 'overview' ? (item as Holding).weight : item.weight;

                      return (
                        <button
                          key={holdingsView === 'overview' ? (item as Holding).symbol : item.name}
                          type="button"
                          className={s.allocationSegment}
                          style={{ background: item.color }}
                          aria-label={`${label}: ${value}`}
                        >
                          <span className={s.allocationTooltip} role="tooltip">
                            <span>
                              <i style={{ background: item.color }} aria-hidden="true" />
                              {label}
                            </span>
                            <strong>{value}</strong>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div key={`holdings-list-${selected.id}-${holdingsView}`} className={[s.holdingsList, s.contentSwap].join(' ')}>
                  {holdingsView === 'overview'
                    ? selected.holdings.map((holding, index) => (
                      <div key={index} className={s.holdingItem}>
                        <div className={s.holdingDetails}>
                          <span className={s.holdingDot} style={{ background: holding.color }} aria-hidden="true" />
                          <img src={holding.logo} alt="" />
                          <span>
                            <strong>{holding.symbol}</strong>
                            <small>{holding.name}</small>
                          </span>
                        </div>
                        <span>{holding.weight}</span>
                      </div>
                    ))
                    : selected.sectors.map((sector, index) => (
	                      <div key={index} className={s.holdingItem}>
	                        <div className={s.holdingDetails}>
	                          <span className={s.sectorDot} style={{ background: sector.color }} aria-hidden="true" />
	                          <span>
	                            <strong>{sector.name}</strong>
	                          </span>
	                        </div>
                        <span>{sector.weight}</span>
                      </div>
                    ))}
                </div>
              </div>
            </section>
          </section>

          <aside className={s.sidebar} aria-label="Strategy actions">
            <div ref={infoShellRef} className={s.infoShell}>
              {buyStep === 'about' && (
                <>
                  <div className={s.infoCard}>
                    <div key={`info-copy-${selected.id}`} className={s.contentSwap}>
                      <h2>About this strategy</h2>
                      <div className={s.tagRow}>
                        <RiskBadge risk={selected.risk} tone={selected.badgeTone} />
                        <span className={[s.badge, s.badgeGray].join(' ')}>{selected.tags[1]}</span>
                      </div>
                      <p>{selected.description}</p>
                    </div>
                  </div>
                  <button className={s.primaryButton} type="button" onClick={() => setBuyStep('details')}>
                    Invest in this strategy
                    <ArrowRight aria-hidden="true" />
                  </button>
                  <button className={s.secondaryButton} type="button" onClick={handleWatchlistToggle}>
                    <BookmarkSimple weight={watchlisted ? 'fill' : 'regular'} aria-hidden="true" />
                    {watchlisted ? 'Added to watchlist' : 'Add to watchlist'}
                  </button>
                  {investedAmount > 0 && (
                    <div className={s.holdingSummaryShell}>
                      <button
                        className={s.holdingSummary}
                        type="button"
                        onClick={() => setIsHoldingBreakdownOpen((isOpen) => !isOpen)}
                        aria-expanded={isHoldingBreakdownOpen}
                      >
                        <span>Current holding</span>
                        <strong className={s.holdingSummaryValue}>
                          {formatMoney(investedAmount)}
                          <CaretDown aria-hidden="true" />
                        </strong>
                      </button>

                      {isHoldingBreakdownOpen && (
                        <div className={s.holdingBreakdown}>
                          {holdingRows.map(({ account, amount }) => (
                            <div key={account.id} className={s.holdingBreakdownRow}>
                              <span className={s.accountValue}>
                                <img src={account.logo} alt="" />
                                {account.name}
                              </span>
                              <strong>{formatMoney(amount)}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {buyStep === 'details' && (
                <div key="buy-details" className={s.buyFlowPanel}>
                  <div className={s.buyTitle}>
                    <button type="button" onClick={() => setBuyStep('about')} aria-label="Back to strategy summary">
                      <ArrowLeft aria-hidden="true" />
                    </button>
                    <span>Invest in “{selected.name}”</span>
                  </div>

                  <div className={[s.buyCard, s.reviewCard].join(' ')}>
                    <div className={s.buyRow}>
                      <span>Account</span>
                      <div className={s.accountSelectWrap}>
                        <button
                          type="button"
                          className={s.accountSelect}
                          onClick={() => setIsAccountOpen((isOpen) => !isOpen)}
                          aria-expanded={isAccountOpen}
                        >
                          {selectedAccount ? (
                            <span className={s.accountValue}>
                              <img src={selectedAccount.logo} alt="" />
                              {selectedAccount.name}
                            </span>
                          ) : (
                            <span className={s.placeholderText}>Select an account</span>
                          )}
                          <CaretDown aria-hidden="true" />
                        </button>
                        {isAccountOpen && (
                          <div className={s.accountMenu}>
                            {DEMO_ACCOUNTS.map((account) => (
                              <button
                                key={account.id}
                                type="button"
                                className={selectedAccountId === account.id ? s.accountMenuActive : ''}
                                onClick={() => {
                                  setSelectedAccountId(account.id);
                                  setIsAccountOpen(false);
                                }}
                              >
                                <span className={s.accountValue}>
                                  <img src={account.logo} alt="" />
                                  {account.name}
                                </span>
                                <small>{formatMoney(account.balance)}</small>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedAccount && (
                      <div className={[s.buyRow, s.buyRowSubtle].join(' ')}>
                        <span>Available balance</span>
                        <strong>{formatMoney(selectedAccount.balance)}</strong>
                      </div>
                    )}

                    <div className={s.buyRow}>
                      <span>Investment amount</span>
                      <label className={[s.orderInput, parsedOrderAmount > 0 ? s.orderInputFilled : ''].join(' ')}>
                        <span>$</span>
                        <input
                          value={orderAmount}
                          onChange={handleOrderAmountChange}
                          onBlur={handleOrderAmountBlur}
                          inputMode="decimal"
                          aria-label="Investment amount"
                        />
                        <button type="button" onClick={applyMaxAmount}>Max</button>
                      </label>
                    </div>

                    <div className={s.buyDivider} />

                    <div className={s.buyRow}>
                      <span>Estimated cost</span>
                      <strong>{formatMoney(estimatedCost)}</strong>
                    </div>
                  </div>

                  <button className={s.primaryButton} type="button" onClick={() => setBuyStep('review')} disabled={!canReviewOrder}>
                    Next
                  </button>
                </div>
              )}

              {buyStep === 'review' && (
                <div key="buy-review" className={s.buyFlowPanel}>
                  <div className={s.buyTitle}>
                    <button type="button" onClick={() => setBuyStep('details')} aria-label="Back to investment amount">
                      <ArrowLeft aria-hidden="true" />
                    </button>
                    <span>Review order</span>
                  </div>

                  <div className={[s.buyCard, s.reviewCard].join(' ')}>
                    <div className={s.buyRow}>
                      <span>Strategy</span>
                      <strong>{selected.name.replace(' Leaders', '')}</strong>
                    </div>
                    <div className={s.buyRow}>
                      <span>Account</span>
                      <strong className={s.accountValue}>
                        <img src={orderAccount.logo} alt="" />
                        {orderAccount.name}
                      </strong>
                    </div>
                    <div className={s.buyRow}>
                      <span>Investment amount</span>
                      <strong>{formatMoney(parsedOrderAmount)}</strong>
                    </div>
                    <div className={s.buyDivider} />
                    <div className={s.buyRow}>
                      <span>Estimated cost</span>
                      <strong className={s.costValue}>{formatMoney(estimatedCost)}</strong>
                    </div>
                  </div>

                  <p className={[s.disclaimer, s.orderDisclaimer, s.reviewOutsideDisclaimer].join(' ')}>
                    This order will execute at the next available market price. Surmount will rebalance your portfolio according to the strategy&apos;s current allocations.
                  </p>

                  <button
                    className={[s.primaryButton, isSubmittingOrder ? s.primaryButtonLoading : ''].join(' ')}
                    type="button"
                    onClick={submitOrder}
                    disabled={isSubmittingOrder}
                    aria-busy={isSubmittingOrder}
                  >
                    {isSubmittingOrder && <span className={s.buttonSpinner} aria-hidden="true" />}
                    {isSubmittingOrder ? 'Submitting order' : 'Submit order'}
                  </button>
                </div>
              )}

              {buyStep === 'submitted' && (
                <div key="buy-submitted" className={s.buyFlowPanel}>
                  <div className={s.buyTitle}>
                    <span>Confirmation</span>
                  </div>

                  <div className={[s.buyCard, s.reviewCard, s.confirmationCard].join(' ')}>
                    <div className={s.confirmationHero}>
                      <span className={s.successMark} aria-hidden="true">
                        <svg viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="25" />
                          <path d="M21.5 32.5 28.5 39.5 43 24.5" />
                        </svg>
                      </span>
                      <strong>Order submitted!</strong>
                      <small>Today at 6:20 pm</small>
                    </div>

                    <div className={s.buyDivider} />

                    <div className={s.buyRow}>
                      <span>Strategy</span>
                      <strong>{selected.name.replace(' Leaders', '')}</strong>
                    </div>
                    <div className={s.buyRow}>
                      <span>Account</span>
                      <strong className={s.accountValue}>
                        <img src={orderAccount.logo} alt="" />
                        {orderAccount.name}
                      </strong>
                    </div>
                    <div className={s.buyRow}>
                      <span>Investment amount</span>
                      <strong>{formatMoney(parsedOrderAmount)}</strong>
                    </div>
                    <div className={s.buyDivider} />
                    <div className={s.buyRow}>
                      <span>Estimated cost</span>
                      <strong className={s.costValue}>{formatMoney(estimatedCost)}</strong>
                    </div>
                  </div>

                  <p className={[s.disclaimer, s.orderDisclaimer, s.confirmationDisclaimer].join(' ')}>
                    This order will execute at the next available market price. Surmount will rebalance your portfolio according to the strategy&apos;s current allocations.
                  </p>

                  <button className={s.primaryButton} type="button" onClick={resetBuyFlow}>
                    Done
                  </button>
                  <button className={s.secondaryButton} type="button" onClick={() => setBuyStep('review')}>
                    View details
                  </button>
                </div>
              )}
            </div>

            <p className={s.sidebarNote}>
              Use the strategy carousel to compare matches. The projection, reasons, and holdings update with the selected strategy.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
