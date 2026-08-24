'use client';

import { useEffect, useRef } from 'react';
import {
  AreaSeries,
  HistogramSeries,
  LineSeries,
  ColorType,
  CrosshairMode,
  LineStyle,
  LineType,
  createChart,
  type AreaData,
  type HistogramData,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type MouseEventParams,
  type Time,
} from 'lightweight-charts';
import type { BacktestPoint } from '../types';
import s from './BacktestChartCompare.module.css';

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
  return color;
}

export function BacktestChartCompare({
  data,
  benchmark,
  height = 260,
  onHover,
}: {
  data: BacktestPoint[];
  benchmark: BacktestPoint[];
  height?: number;
  onHover?: (point: BacktestPoint | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const areaRef = useRef<ISeriesApi<'Area'> | null>(null);
  const benchLineRef = useRef<ISeriesApi<'Line'> | null>(null);
  const histRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const benchHistRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const dataRef = useRef<BacktestPoint[]>(data);
  const onHoverRef = useRef(onHover);
  onHoverRef.current = onHover;

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const styles = getComputedStyle(container);
    const bgColor = cssVar(styles, '--color-bg-primary', '#FFFFFF');
    const textColor = cssVar(styles, '--color-fg-tertiary-600', '#535861');
    const lineColor = cssVar(styles, '--color-brand-600', '#406AD0');
    const benchColor = cssVar(styles, '--color-fg-quaternary-400', '#A3A7AE');
    const crosshairColor = cssVar(styles, '--color-fg-quaternary-400', '#A3A7AE');

    const rect = container.getBoundingClientRect();
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
        vertLine: { color: crosshairColor, width: 1, style: LineStyle.Solid, labelVisible: false },
        horzLine: { visible: false, labelVisible: false },
      },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      timeScale: { visible: false, borderVisible: false, fixLeftEdge: true, fixRightEdge: true },
      handleScroll: false,
      handleScale: false,
    });

    const area = chart.addSeries(AreaSeries, {
      lineWidth: 2,
      lineType: LineType.Curved,
      lineColor,
      topColor: withAlpha(lineColor, 0.16),
      bottomColor: withAlpha(lineColor, 0),
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: '#FFFFFF',
      crosshairMarkerBorderWidth: 2,
      crosshairMarkerBackgroundColor: lineColor,
      lastValueVisible: false,
      priceLineVisible: false,
      priceScaleId: 'right',
    });
    chart.priceScale('right').applyOptions({ scaleMargins: { top: 0.1, bottom: 0.32 } });

    const benchLine = chart.addSeries(LineSeries, {
      lineWidth: 2,
      lineType: LineType.Curved,
      color: benchColor,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 3,
      lastValueVisible: false,
      priceLineVisible: false,
      priceScaleId: 'right',
    });

    const hist = chart.addSeries(HistogramSeries, {
      priceScaleId: 'dd',
      color: withAlpha(lineColor, 0.32),
      lastValueVisible: false,
      priceLineVisible: false,
    });
    const benchHist = chart.addSeries(HistogramSeries, {
      priceScaleId: 'dd',
      color: withAlpha(benchColor, 0.32),
      lastValueVisible: false,
      priceLineVisible: false,
    });
    chart.priceScale('dd').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });

    chartRef.current = chart;
    areaRef.current = area;
    benchLineRef.current = benchLine;
    histRef.current = hist;
    benchHistRef.current = benchHist;

    function handleCrosshairMove(param: MouseEventParams) {
      const cb = onHoverRef.current;
      if (!cb) return;
      if (!param.time) {
        cb(null);
        return;
      }
      const point = dataRef.current.find((p) => p.time === param.time);
      cb(point ?? null);
    }
    chart.subscribeCrosshairMove(handleCrosshairMove);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      chart.applyOptions({ width: Math.max(1, entry.contentRect.width) });
    });
    resizeObserver.observe(container);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      areaRef.current = null;
      benchLineRef.current = null;
      histRef.current = null;
      benchHistRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  useEffect(() => {
    const area = areaRef.current;
    const benchLine = benchLineRef.current;
    const hist = histRef.current;
    const benchHist = benchHistRef.current;
    const chart = chartRef.current;
    if (!area || !benchLine || !hist || !benchHist || !chart || data.length === 0) return;
    area.setData(data.map((p) => ({ time: p.time as Time, value: p.value })) as AreaData<Time>[]);
    hist.setData(data.map((p) => ({ time: p.time as Time, value: Math.abs(p.drawdownPct) })) as HistogramData<Time>[]);
    if (benchmark.length > 0) {
      benchLine.setData(benchmark.map((p) => ({ time: p.time as Time, value: p.value })) as LineData<Time>[]);
      benchHist.setData(benchmark.map((p) => ({ time: p.time as Time, value: Math.abs(p.drawdownPct) })) as HistogramData<Time>[]);
    }
    chart.timeScale().fitContent();
  }, [data, benchmark]);

  return (
    <div className={s.wrap}>
      <div className={s.legend}>
        <span className={s.legendItem}>
          <span className={[s.legendDot, s.legendDotAsset].join(' ')} />
          This asset
        </span>
        <span className={s.legendItem}>
          <span className={[s.legendDot, s.legendDotBench].join(' ')} />
          S&amp;P 500
        </span>
      </div>
      <div ref={containerRef} className={s.container} />
    </div>
  );
}
