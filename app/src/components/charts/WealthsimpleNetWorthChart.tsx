'use client';

import { ArrowDownRight, ArrowUpRight } from '@phosphor-icons/react';
import {
  AreaSeries,
  ColorType,
  CrosshairMode,
  LineStyle,
  LineType,
  createChart,
  type AreaData,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from 'lightweight-charts';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import s from './WealthsimpleNetWorthChart.module.css';

export type WealthsimpleRange = '1D' | '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y';

export type WealthsimpleChartPoint = {
  time: string;
  value: number;
};

const RANGE_OPTIONS: WealthsimpleRange[] = ['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y'];
const VIEW_TABS = ['Return', 'Allocation', 'Income'] as const;

export const netWorthData: WealthsimpleChartPoint[] = [
  { time: '2026-04-21', value: 33200 },
  { time: '2026-04-24', value: 38700 },
  { time: '2026-04-25', value: 40100 },
  { time: '2026-04-28', value: 41200 },
  { time: '2026-04-29', value: 41500 },
  { time: '2026-04-30', value: 41300 },
  { time: '2026-05-01', value: 41600 },
  { time: '2026-05-02', value: 41400 },
  { time: '2026-05-05', value: 41200 },
  { time: '2026-05-06', value: 41350 },
  { time: '2026-05-07', value: 44160.76 },
  { time: '2026-05-08', value: 44200 },
  { time: '2026-05-09', value: 44100 },
  { time: '2026-05-12', value: 44400 },
  { time: '2026-05-13', value: 44600 },
  { time: '2026-05-14', value: 45100 },
  { time: '2026-05-15', value: 45800 },
  { time: '2026-05-16', value: 46200 },
  { time: '2026-05-19', value: 46500 },
  { time: '2026-05-20', value: 46900 },
  { time: '2026-05-21', value: 47298.03 },
];

// 5-minute intraday data for May 21, 2026 (9:30 AM – 4:00 PM ET)
function generateIntradayData(): Array<{ time: number; value: number }> {
  const startMs = new Date('2026-05-21T13:30:00Z').getTime();
  const endMs = new Date('2026-05-21T20:00:00Z').getTime();
  const intervalMs = 5 * 60 * 1000;
  const totalPoints = Math.round((endMs - startMs) / intervalMs) + 1;

  let seed = 0xc0ffee37;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const rawValues: number[] = [];
  let v = 46900;
  for (let i = 0; i < totalPoints; i++) {
    const u = rand() + rand() + rand() + rand() + rand() + rand() - 3;
    v += u * 90;
    v = Math.max(44000, Math.min(51000, v));
    rawValues.push(v);
  }

  const target = 47298.03;
  const scale = target / rawValues[rawValues.length - 1];
  return rawValues.map((val, i) => ({
    time: Math.round((startMs + i * intervalMs) / 1000),
    value: Math.round(val * scale * 100) / 100,
  }));
}

const INTRADAY_DATA = generateIntradayData();

// 5-minute intraday data for the week of May 14–21, 2026 (6 trading days)
function generateWeekData(): Array<{ time: number; value: number }> {
  const tradingDays = [
    '2026-05-14', '2026-05-15',
    '2026-05-18', '2026-05-19', '2026-05-20', '2026-05-21',
  ];
  const intervalMs = 5 * 60 * 1000;
  const points: Array<{ time: number; value: number }> = [];

  let seed = 0xf00dbabe;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  let v = 45100;
  for (const day of tradingDays) {
    const openMs = new Date(`${day}T13:30:00Z`).getTime();
    const closeMs = new Date(`${day}T20:00:00Z`).getTime();
    const nIntervals = Math.round((closeMs - openMs) / intervalMs);
    for (let i = 0; i <= nIntervals; i++) {
      if (i > 0) {
        const u = rand() + rand() + rand() + rand() + rand() + rand() - 3;
        v += u * 80;
        v = Math.max(43000, Math.min(52000, v));
      }
      points.push({ time: Math.round((openMs + i * intervalMs) / 1000), value: Math.round(v * 100) / 100 });
    }
  }

  const target = 47298.03;
  const scale = target / points[points.length - 1].value;
  return points.map((p) => ({ ...p, value: Math.round(p.value * scale * 100) / 100 }));
}

const WEEK_DATA = generateWeekData();

function timeToMs(t: Time): number {
  if (typeof t === 'number') return t * 1000;
  if (typeof t === 'string') return parseIsoDate(t).getTime();
  return Date.UTC(t.year, t.month - 1, t.day);
}

type CrosshairState = {
  visible: boolean;
  left: number;
  time: Time | null;
  value: number | null; // P&L value (delta from range start)
};

type WealthsimpleNetWorthChartProps = {
  value?: number;
  changeText?: string;
  changePeriod?: string;
  data?: WealthsimpleChartPoint[];
  initialRange?: WealthsimpleRange;
  height?: number;
  className?: string;
};

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseIsoDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`);
}

function shiftDate(iso: string, range: WealthsimpleRange) {
  const d = parseIsoDate(iso);
  if (range === '1D') d.setUTCDate(d.getUTCDate() - 1);
  if (range === '1W') d.setUTCDate(d.getUTCDate() - 7);
  if (range === '1M') d.setUTCMonth(d.getUTCMonth() - 1);
  if (range === '3M') d.setUTCMonth(d.getUTCMonth() - 3);
  if (range === '6M') d.setUTCMonth(d.getUTCMonth() - 6);
  if (range === '1Y') d.setUTCFullYear(d.getUTCFullYear() - 1);
  if (range === 'YTD') d.setUTCMonth(0, 1);
  return toIsoDate(d);
}

function formatDate(time: Time, range?: WealthsimpleRange): string {
  if ((range === '1D' || range === '1W') && typeof time === 'number') {
    const d = new Date(time * 1000);
    const dateStr = d.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York',
    });
    const timeStr = d.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York',
    });
    return `${dateStr} ${timeStr} ET`;
  }
  if (typeof time === 'string') {
    return parseIsoDate(time).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
    });
  }
  if (typeof time === 'number') {
    return new Date(time * 1000).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
  }
  return new Date(Date.UTC(time.year, time.month - 1, time.day)).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function cssVar(styles: CSSStyleDeclaration, name: string, fallback: string) {
  return styles.getPropertyValue(name).trim() || fallback;
}

function withAlpha(color: string, alpha: number) {
  if (color.startsWith('#') && color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  }
  return color;
}

export function scaleWealthsimpleData(data: WealthsimpleChartPoint[], targetLastValue: number) {
  const lastValue = data.at(-1)?.value ?? targetLastValue;
  const ratio = targetLastValue / lastValue;
  return data.map((point) => ({ time: point.time, value: Number((point.value * ratio).toFixed(2)) }));
}

export function WealthsimpleNetWorthChart({
  value = 47298.03,
  changeText = '+$256.25 (12.45%)',
  changePeriod = 'today',
  data = netWorthData,
  initialRange = '1D',
  height = 237,
  className,
}: WealthsimpleNetWorthChartProps) {
  const [activeRange, setActiveRange] = useState<WealthsimpleRange>(initialRange);
  const [activeTab, setActiveTab] = useState<(typeof VIEW_TABS)[number]>('Return');
  const [chartWidth, setChartWidth] = useState(0);
  const [baselineY, setBaselineY] = useState<number | null>(null);
  const [crosshair, setCrosshair] = useState<CrosshairState>({
    visible: false,
    left: 0,
    time: null,
    value: null,
  });

  const chartShellRef = useRef<HTMLDivElement | null>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // pastSeries: left of cursor (full green + fill), or all data when not hovering
  const pastSeriesRef = useRef<ISeriesApi<'Area', Time> | null>(null);
  // futureSeries: right of cursor (faded, no fill), empty when not hovering
  const futureSeriesRef = useRef<ISeriesApi<'Area', Time> | null>(null);
  // Stable refs for use inside the crosshair handler closure
  const returnDataRef = useRef<Array<{ time: Time; value: number }>>([]);
  const scaleMaxRef = useRef<number>(0);
  const scaleMinRef = useRef<number>(0);

  const sortedData = useMemo(
    () => [...data].sort((a, b) => a.time.localeCompare(b.time)),
    [data],
  );

  const effectiveData = useMemo(() => {
    if (activeRange === '1D') return INTRADAY_DATA as Array<{ time: Time; value: number }>;
    if (activeRange === '1W') return WEEK_DATA as Array<{ time: Time; value: number }>;
    return sortedData as unknown as Array<{ time: Time; value: number }>;
  }, [activeRange, sortedData]);

  const dataLastValue = useMemo(() => sortedData.at(-1)?.value ?? value, [sortedData, value]);
  const scaleFactor = useMemo(
    () => (dataLastValue !== 0 ? value / dataLastValue : 1),
    [value, dataLastValue],
  );

  const rangeStartDate = useMemo(() => {
    const lastPoint = sortedData.at(-1);
    if (!lastPoint) return '';
    return shiftDate(lastPoint.time, activeRange);
  }, [sortedData, activeRange]);

  const rangeStartRaw = useMemo(() => {
    if (activeRange === '1D') return INTRADAY_DATA[0]?.value ?? dataLastValue;
    if (activeRange === '1W') return WEEK_DATA[0]?.value ?? dataLastValue;
    const point = sortedData.find((p) => p.time >= rangeStartDate);
    return point?.value ?? sortedData[0]?.value ?? dataLastValue;
  }, [activeRange, sortedData, rangeStartDate, dataLastValue]);

  // P&L chart: each value is delta from range-start (Y=0 = break-even)
  const returnData = useMemo(
    () => effectiveData.map((p) => ({ ...p, value: p.value - rangeStartRaw })),
    [effectiveData, rangeStartRaw],
  );

  // Hover-aware display values
  const hoverReturn = crosshair.value;
  const hoverDelta = hoverReturn !== null ? hoverReturn * scaleFactor : 0;
  const hoverPct = rangeStartRaw !== 0 ? ((hoverReturn ?? 0) / rangeStartRaw) * 100 : 0;
  const isHoverPositive = hoverReturn !== null ? hoverReturn >= 0 : true;

  const hoveredAbsoluteScaled =
    hoverReturn !== null ? (hoverReturn + rangeStartRaw) * scaleFactor : null;

  const displayTopValue =
    hoveredAbsoluteScaled !== null ? formatCurrency(hoveredAbsoluteScaled) : formatCurrency(value);

  const displayChangeText =
    crosshair.visible && hoverReturn !== null
      ? `${hoverDelta < 0 ? '-' : ''}${formatCurrency(Math.abs(hoverDelta))} (${hoverDelta < 0 ? '-' : '+'}${Math.abs(hoverPct).toFixed(2)}%)`
      : changeText;

  const crosshairDate =
    crosshair.time !== null ? formatDate(crosshair.time, activeRange) : '';

  const isTimestampRange = activeRange === '1D' || activeRange === '1W';
  const tooltipHalfW = isTimestampRange ? 108 : 58;
  const rawTooltipLeft = crosshair.left - tooltipHalfW;
  const tooltipLeft =
    chartWidth > 0
      ? Math.max(0, Math.min(chartWidth - tooltipHalfW * 2, rawTooltipLeft))
      : Math.max(0, rawTooltipLeft);

  const setHoverIndex = useCallback((hoverIdx: number, left: number) => {
    const past = pastSeriesRef.current;
    const future = futureSeriesRef.current;
    const data = returnDataRef.current;
    if (!past || !future || data.length === 0 || hoverIdx < 0) return;

    const safeIdx = Math.max(0, Math.min(data.length - 1, hoverIdx));
    past.setData(data.slice(0, safeIdx + 1) as AreaData<Time>[]);
    future.setData(data.slice(safeIdx) as AreaData<Time>[]);
    setCrosshair({
      visible: true,
      left,
      time: data[safeIdx].time,
      value: data[safeIdx].value,
    });
  }, []);

  const clearHover = useCallback(() => {
    const past = pastSeriesRef.current;
    const future = futureSeriesRef.current;
    const data = returnDataRef.current;

    if (past) past.setData(data as AreaData<Time>[]);
    if (future) future.setData([]);
    setCrosshair({ visible: false, left: 0, time: null, value: null });
  }, []);

  const handleChartPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const chart = chartRef.current;
    const data = returnDataRef.current;
    if (!chart || data.length === 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const coordinateTime = chart.timeScale().coordinateToTime(x);

    let hoverIdx = -1;
    if (coordinateTime !== null) {
      const targetMs = timeToMs(coordinateTime);
      let nearestDistance = Number.POSITIVE_INFINITY;
      for (let i = 0; i < data.length; i++) {
        const distance = Math.abs(timeToMs(data[i].time) - targetMs);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          hoverIdx = i;
        }
      }
    }

    if (hoverIdx === -1) {
      const ratio = rect.width > 0 ? x / rect.width : 0;
      hoverIdx = Math.round(ratio * (data.length - 1));
    }

    setHoverIndex(hoverIdx, x);
  }, [setHoverIndex]);

  const applyVisibleRange = useCallback(
    (range: WealthsimpleRange) => {
      const chart = chartRef.current;
      if (!chart) return;
      if (range === '1D' || range === '1W') {
        chart.timeScale().fitContent();
        return;
      }
      const lastPoint = sortedData.at(-1);
      if (!lastPoint) return;
      chart.timeScale().setVisibleRange({
        from: shiftDate(lastPoint.time, range) as Time,
        to: lastPoint.time as Time,
      });
    },
    [sortedData],
  );

  // Create chart once (on mount / height change)
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return undefined;

    const styles = getComputedStyle(container);
    const bgColor = cssVar(styles, '--color-bg-secondary', '#FAFAFA');
    const textColor = cssVar(styles, '--color-fg-tertiary-600', '#535861');
    const successColor = cssVar(styles, '--color-fg-success-primary', '#3B7E3F');

    const rect = container.getBoundingClientRect();
    setChartWidth(Math.max(1, rect.width));

    const chart = createChart(container, {
      width: Math.max(1, rect.width),
      height,
      layout: {
        textColor,
        background: { type: ColorType.Solid, color: bgColor },
        fontFamily: 'var(--font-family-body, Inter, sans-serif)',
        attributionLogo: false,
      },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: {
          color: cssVar(styles, '--color-fg-quaternary-400', '#A3A7AE'),
          width: 1,
          style: LineStyle.Solid,
          labelVisible: false,
        },
        horzLine: { visible: false, labelVisible: false },
      },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      timeScale: {
        visible: false,
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      handleScroll: false,
      handleScale: false,
    });

    // Shared autoscale provider — reads from stable refs so Y-axis never shifts on hover
    const makeAutoscale = () => {
      const max = scaleMaxRef.current;
      const min = scaleMinRef.current;
      if (max === 0 && min === 0) return null;
      return {
        priceRange: { minValue: min, maxValue: max },
        margins: { above: 12, below: 5 },
      };
    };

    // Future series (rendered first = below past series)
    // Right of cursor: faded line, no fill, no crosshair dot
    const futureSeries = chart.addSeries(AreaSeries, {
      lineWidth: 2 as const,
      lineType: LineType.Curved,
      lineColor: withAlpha(successColor, 0.28),
      topColor: 'rgba(0,0,0,0)',
      bottomColor: 'rgba(0,0,0,0)',
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
      autoscaleInfoProvider: makeAutoscale,
    });

    // Past series (rendered on top)
    // Left of cursor: full green line + fill + crosshair dot
    const pastSeries = chart.addSeries(AreaSeries, {
      lineWidth: 2 as const,
      lineType: LineType.Curved,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 5,
      crosshairMarkerBorderColor: '#FFFFFF',
      crosshairMarkerBorderWidth: 2,
      crosshairMarkerBackgroundColor: successColor,
      lastValueVisible: false,
      priceLineVisible: false,
      lineColor: successColor,
      topColor: withAlpha(successColor, 0.20),
      bottomColor: withAlpha(successColor, 0),
      autoscaleInfoProvider: makeAutoscale,
    });

    chartRef.current = chart;
    pastSeriesRef.current = pastSeries;
    futureSeriesRef.current = futureSeries;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(1, entry.contentRect.width);
      setChartWidth(w);
      chart.applyOptions({ width: w, height });
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      pastSeriesRef.current = null;
      futureSeriesRef.current = null;
    };
  }, [height]);

  // Update series data when P&L data changes
  useEffect(() => {
    const past = pastSeriesRef.current;
    const future = futureSeriesRef.current;
    const chart = chartRef.current;
    if (!past || !future || !chart || returnData.length === 0) return;

    // Compute stable Y-scale bounds from the full data range
    const values = returnData.map((p) => p.value);
    const dataMax = Math.max(...values);
    const dataMin = Math.min(...values);
    const dataRange = Math.abs(dataMax - dataMin) || 1;
    // Ensure there's always some headroom above Y=0 even if all P&L is negative
    const effectiveMax = Math.max(dataMax, dataRange * 0.08);
    const effectiveMin = Math.min(dataMin, -effectiveMax * 0.28);
    scaleMaxRef.current = effectiveMax;
    scaleMinRef.current = effectiveMin;

    returnDataRef.current = returnData;
    past.setData(returnData as AreaData<Time>[]);
    future.setData([]);
    setCrosshair({ visible: false, left: 0, time: null, value: null });
    chart.timeScale().fitContent();
  }, [returnData]);

  // Update visible window when range changes
  useEffect(() => {
    applyVisibleRange(activeRange);
  }, [activeRange, applyVisibleRange]);

  useEffect(() => {
    if (!crosshair.visible) return undefined;

    const handleDocumentPointerMove = (event: PointerEvent) => {
      const shell = chartShellRef.current;
      if (!shell) return;

      const rect = shell.getBoundingClientRect();
      const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!isInside) clearHover();
    };

    const handleWindowBlur = () => clearHover();

    document.addEventListener('pointermove', handleDocumentPointerMove);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('pointermove', handleDocumentPointerMove);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [clearHover, crosshair.visible]);

  // Compute baseline Y pixel coordinate (Y=0 on the P&L chart = break-even)
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const past = pastSeriesRef.current;
      if (!past) return;
      const y = past.priceToCoordinate(0);
      setBaselineY(typeof y === 'number' ? y : null);
    });
    return () => cancelAnimationFrame(raf);
  }, [returnData, chartWidth, activeRange, height]);

  return (
    <div className={[s.root, className].filter(Boolean).join(' ')}>
      <div className={s.total}>
        <div className={s.valueRow}>
          <span className={s.value}>{displayTopValue}</span>
        </div>

        <div className={s.tabs} aria-label="Portfolio chart view">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={[s.tabButton, activeTab === tab ? s.tabButtonActive : ''].filter(Boolean).join(' ')}
              onClick={() => setActiveTab(tab)}
              aria-pressed={activeTab === tab}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={s.controlsRow}>
          <div className={[s.changeRow, !isHoverPositive ? s.changeRowNegative : ''].filter(Boolean).join(' ')}>
            {isHoverPositive ? (
              <ArrowUpRight weight="regular" aria-hidden="true" />
            ) : (
              <ArrowDownRight weight="regular" aria-hidden="true" />
            )}
            <span className={s.changeValue}>{displayChangeText}</span>
            <span className={s.changePeriod}>{changePeriod}</span>
          </div>

          <div className={s.rangeRow} aria-label="Chart time range">
            {RANGE_OPTIONS.map((range) => (
              <button
                key={range}
                type="button"
                className={[s.rangeButton, activeRange === range ? s.rangeButtonActive : ''].filter(Boolean).join(' ')}
                onClick={() => setActiveRange(range)}
                aria-pressed={activeRange === range}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={chartShellRef}
        className={s.chartShell}
        style={{ height }}
        onPointerMove={handleChartPointerMove}
        onPointerLeave={clearHover}
      >
        {crosshair.visible && (
          <div
            className={s.dateTooltip}
            style={{ left: `${tooltipLeft}px` }}
          >
            {crosshairDate}
          </div>
        )}
        {/* Baseline: only visible on hover — shows where return = $0 (deposits = value) */}
        {crosshair.visible && baselineY !== null && (
          <>
            <div className={s.baselineLine} style={{ top: `${baselineY}px` }} />
            <div className={s.baselineLabel} style={{ top: `${baselineY}px` }}>
              $0.00
            </div>
          </>
        )}
        <div ref={chartContainerRef} className={s.chartCanvas} />
      </div>
    </div>
  );
}
