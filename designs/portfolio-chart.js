/**
 * PortfolioChart — lightweight-charts v5 + React
 * Requires globals: React, LightweightCharts
 */
(function (global) {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────────
   * Inject keyframe for date-pill tick animation (once per page)
   * ───────────────────────────────────────────────────────────────────────── */
  if (!document.getElementById('pc-keyframes')) {
    const s = document.createElement('style');
    s.id = 'pc-keyframes';
    s.textContent =
      '@keyframes pcTick{' +
        '0%{opacity:0;transform:translateX(-50%) translateY(4px)}' +
        '100%{opacity:1;transform:translateX(-50%) translateY(0)}' +
      '}';
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * Seeded deterministic mock data
   * ───────────────────────────────────────────────────────────────────────── */
  function seededRandom(seed) {
    let s = seed >>> 0;
    return function () {
      s = Math.imul(1664525, s) + 1013904223 >>> 0;
      return s / 4294967296;
    };
  }

  function generateMockData(days, startPrice, endPrice, seed) {
    const rng    = seededRandom(seed || 42);
    const data   = [];
    const origin = new Date('2026-04-02');
    let   price  = startPrice;
    const drift  = (endPrice - startPrice) / days;

    for (let i = days; i >= 0; i--) {
      const d = new Date(origin);
      d.setDate(d.getDate() - i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;

      const noise = (rng() - 0.47) * startPrice * 0.014;
      price = Math.max(price + drift + noise, startPrice * 0.72);
      data.push({ time: d.toISOString().split('T')[0], value: parseFloat(price.toFixed(2)) });
    }
    return data;
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * Range filter — returns a subset of the full data array
   * ───────────────────────────────────────────────────────────────────────── */
  function filterByRange(data, range) {
    if (!data.length || range === 'All') return data;

    const last   = new Date(data[data.length - 1].time + 'T00:00:00Z');
    const cutoff = new Date(last);

    switch (range) {
      case '1W': cutoff.setUTCDate(cutoff.getUTCDate()   - 7);   break;
      case '1M': cutoff.setUTCMonth(cutoff.getUTCMonth() - 1);   break;
      case '3M': cutoff.setUTCMonth(cutoff.getUTCMonth() - 3);   break;
      case '1Y': cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 1); break;
      default:   return data;
    }

    const cutoffStr = cutoff.toISOString().split('T')[0];
    const filtered  = data.filter(function (d) { return d.time >= cutoffStr; });
    return filtered.length >= 2 ? filtered : data.slice(-2);
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * Formatters
   * ───────────────────────────────────────────────────────────────────────── */
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function formatDateShort(timeStr) {
    const p = timeStr.split('-');
    return MONTHS[parseInt(p[1], 10) - 1] + ' ' + parseInt(p[2], 10);
  }

  function formatDateFull(timeStr) {
    const p = timeStr.split('-');
    return MONTHS[parseInt(p[1], 10) - 1] + ' ' + parseInt(p[2], 10) + ', ' + p[0];
  }

  function formatMoney(val, dec) {
    const d = dec !== undefined ? dec : 2;
    return '$' + Math.abs(val).toLocaleString('en-US', {
      minimumFractionDigits: d, maximumFractionDigits: d,
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * Tooltip DOM element
   * ───────────────────────────────────────────────────────────────────────── */
  function createTooltip(container) {
    const tt = document.createElement('div');
    Object.assign(tt.style, {
      position: 'absolute', display: 'none',
      padding: '10px 12px',
      background: '#ffffff',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: '8px',
      boxShadow: '0 4px 16px rgba(10,13,18,0.10)',
      fontFamily: "'Geist', system-ui, sans-serif",
      fontSize: '12px', lineHeight: '1.5', letterSpacing: '-0.3px',
      color: '#181D27', pointerEvents: 'none',
      zIndex: '10', whiteSpace: 'nowrap', minWidth: '160px',
    });

    const dateEl   = document.createElement('div');
    const valueEl  = document.createElement('div');
    const changeEl = document.createElement('div');
    Object.assign(dateEl.style,   { color: '#717680', marginBottom: '4px' });
    Object.assign(valueEl.style,  { fontWeight: '600', fontSize: '14px', marginBottom: '2px' });
    Object.assign(changeEl.style, { fontWeight: '500' });

    tt.appendChild(dateEl);
    tt.appendChild(valueEl);
    tt.appendChild(changeEl);
    container.appendChild(tt);
    return { el: tt, dateEl, valueEl, changeEl };
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * Time-pill — sliding date label on the x-axis
   * ───────────────────────────────────────────────────────────────────────── */
  function createTimePill(container) {
    const pill = document.createElement('div');
    Object.assign(pill.style, {
      position:     'absolute',
      display:      'none',
      bottom:       '4px',
      left:         '0px',
      transform:    'translateX(-50%)',
      padding:      '4px 10px',
      background:   '#ffffff',
      border:       '1px solid rgba(0,0,0,0.07)',
      borderRadius: '9999px',
      boxShadow:    '0 1px 6px rgba(10,13,18,0.12)',
      fontFamily:   "'Geist', system-ui, sans-serif",
      fontSize:     '12px', fontWeight: '500', letterSpacing: '-0.3px',
      color:        '#181D27',
      pointerEvents:'none',
      zIndex:       '11',
      whiteSpace:   'nowrap',
      transition:   'left 60ms ease-out',
    });
    container.appendChild(pill);
    return pill;
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * Draw-on animation — used on mount (left → right, ease-out)
   * ───────────────────────────────────────────────────────────────────────── */
  function startDrawAnim(targetChart, rafRef, fromStr, toStr, dur) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const fTs = new Date(fromStr + 'T00:00:00Z').getTime();
    const tTs = new Date(toStr   + 'T00:00:00Z').getTime();
    const t0  = performance.now();
    targetChart.timeScale().setVisibleRange({ from: fromStr, to: fromStr });
    function frame() {
      const raw      = Math.min((performance.now() - t0) / dur, 1);
      const ease     = 1 - Math.pow(1 - raw, 3);
      const rightStr = new Date(fTs + ease * (tTs - fTs)).toISOString().split('T')[0];
      targetChart.timeScale().setVisibleRange({ from: fromStr, to: rightStr });
      if (raw < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        rafRef.current = null;
        targetChart.timeScale().fitContent();
      }
    }
    rafRef.current = requestAnimationFrame(frame);
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * Range transition — used when switching time frames (zoom in/out,
   * ease-in-out cubic: both edges interpolate current → target)
   * ───────────────────────────────────────────────────────────────────────── */
  function toTs(str) { return new Date(str + 'T00:00:00Z').getTime(); }
  function toStr(ts) { return new Date(ts).toISOString().split('T')[0]; }

  function startRangeTransition(targetChart, rafRef, curFrom, curTo, tgtFrom, tgtTo, dur) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const cfTs = toTs(curFrom), ctTs = toTs(curTo);
    const tfTs = toTs(tgtFrom), ttTs = toTs(tgtTo);
    const t0   = performance.now();
    function easeInOut3(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }
    function frame() {
      const raw  = Math.min((performance.now() - t0) / dur, 1);
      const ease = easeInOut3(raw);
      targetChart.timeScale().setVisibleRange({
        from: toStr(cfTs + ease * (tfTs - cfTs)),
        to:   toStr(ctTs + ease * (ttTs - ctTs)),
      });
      if (raw < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        rafRef.current = null;
        targetChart.timeScale().fitContent();
      }
    }
    rafRef.current = requestAnimationFrame(frame);
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * Range pill button (segmented-control style)
   * ───────────────────────────────────────────────────────────────────────── */
  function RangeButton(props) {
    const active = props.active;
    return React.createElement('button', {
      style: {
        flex: '1',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '5px 0', border: 'none', cursor: 'pointer',
        borderRadius: '9999px',
        fontFamily: "'Geist', system-ui, sans-serif",
        fontSize: '12px', fontWeight: active ? '500' : '400',
        letterSpacing: '-0.3px', lineHeight: '1', whiteSpace: 'nowrap',
        outline: 'none',
        background: active ? '#ffffff' : 'transparent',
        color:      active ? '#181D27' : '#717680',
        boxShadow:  active ? '0 1px 3px rgba(0,0,0,0.10), 0 0 0 0.5px rgba(0,0,0,0.04)' : 'none',
        transition: 'background 150ms ease, color 150ms ease, box-shadow 150ms ease',
      },
      onClick: props.onClick,
    }, props.label);
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * PortfolioChart — main component
   * ───────────────────────────────────────────────────────────────────────── */
  var DEFAULT_RANGES = ['1W', '1M', '3M', '1Y', 'All'];

  function PortfolioChart(props) {
    const ranges       = props.ranges || DEFAULT_RANGES;
    const defaultRange = props.defaultRange || '1Y';

    const [activeRange, setActiveRange] = React.useState(defaultRange);

    const containerRef = React.useRef(null);
    const chartRef     = React.useRef(null);
    const seriesRef    = React.useRef(null);
    const allDataRef   = React.useRef(null);
    const drawRafRef   = React.useRef(null); // tracks in-flight draw animation

    /* ── Init chart (once) ── */
    React.useEffect(function () {
      const el = containerRef.current;
      if (!el || typeof LightweightCharts === 'undefined') return;

      const chart = LightweightCharts.createChart(el, {
        width:  el.clientWidth,
        height: props.height || el.clientHeight || 200,
        layout: {
          background:      { color: 'transparent' },
          attributionLogo: false,
          textColor:       '#717680',
          fontFamily:      "'Geist', system-ui, sans-serif",
          fontSize:        11,
        },
        grid: {
          vertLines: { visible: false },
          horzLines: { visible: false },
        },
        rightPriceScale: { visible: false },
        leftPriceScale:  { visible: false },
        timeScale: {
          visible:       false,
          fixLeftEdge:   true,
          fixRightEdge:  true,
          rightOffset:   0,
        },
        crosshair: {
          mode: LightweightCharts.CrosshairMode.Normal,
          vertLine: {
            width:        1,
            color:        '#A4A7AE',
            style:        LightweightCharts.LineStyle.Dashed,
            labelVisible: false,
          },
          horzLine: { visible: false, labelVisible: false },
        },
        handleScroll: false,
        handleScale:  false,
      });

      const lineColor   = props.lineColor   || '#3B7E3F';
      const topColor    = props.topColor    || 'rgba(59,126,63,0.22)';
      const bottomColor = props.bottomColor || 'rgba(59,126,63,0)';

      const areaSeries = chart.addSeries(LightweightCharts.AreaSeries, {
        lineColor, topColor, bottomColor,
        lineWidth:                      1.5,
        priceLineVisible:               false,
        lastValueVisible:               false,
        crosshairMarkerVisible:         true,
        crosshairMarkerRadius:          4,
        crosshairMarkerBorderWidth:     2,
        crosshairMarkerBackgroundColor: lineColor,
        crosshairMarkerBorderColor:     '#ffffff',
      });

      const startPrice = props.startPrice || 100;
      const endPrice   = props.endPrice   || startPrice * 1.12;
      const allData    = props.data || generateMockData(
        props.days || 365, startPrice, endPrice, props.seed || 42,
      );

      allDataRef.current = allData;
      chartRef.current   = chart;
      seriesRef.current  = areaSeries;

      /* Load initial range */
      const initial = filterByRange(allData, defaultRange);
      areaSeries.setData(initial);

      /* ── Draw-on animation on mount ── */
      startDrawAnim(chart, drawRafRef, initial[0].time, initial[initial.length - 1].time, 800);

      /* ── Tooltip ── */
      const tooltip = createTooltip(el);

      /* ── Time pill ── */
      const timePill   = createTimePill(el);
      let   lastPillDate = '';

      chart.subscribeCrosshairMove(function (param) {
        if (
          !param.point || !param.time ||
          param.point.x < 0 || param.point.y < 0 ||
          param.point.x > el.clientWidth ||
          param.point.y > el.clientHeight
        ) {
          tooltip.el.style.display = 'none';
          timePill.style.display   = 'none';
          if (props.onHover) props.onHover(null);
          return;
        }

        const sp = param.seriesData.get(areaSeries);
        if (!sp) {
          tooltip.el.style.display = 'none';
          timePill.style.display   = 'none';
          if (props.onHover) props.onHover(null);
          return;
        }

        const currentValue = sp.value;
        const timeStr = typeof param.time === 'string'
          ? param.time
          : new Date(param.time * 1000).toISOString().split('T')[0];

        /* Tooltip */
        const fullData = allDataRef.current || [];
        const idx      = fullData.findIndex(function (d) { return d.time === timeStr; });
        const prevVal  = idx > 0 ? fullData[idx - 1].value : currentValue;
        const change   = currentValue - prevVal;
        const pct      = prevVal ? (change / prevVal) * 100 : 0;
        const pos      = change >= 0;

        tooltip.dateEl.textContent  = formatDateFull(timeStr);
        tooltip.valueEl.textContent = formatMoney(currentValue, props.valueDecimals !== undefined ? props.valueDecimals : 2);
        tooltip.changeEl.textContent =
          (pos ? '↑ +' : '↓ -') + formatMoney(Math.abs(change), 2) +
          ' (' + (pos ? '+' : '-') + Math.abs(pct).toFixed(2) + '%)';
        tooltip.changeEl.style.color = pos ? '#3B7E3F' : '#98443D';

        if (props.onHover) props.onHover({ value: currentValue, change, pct, pos, timeStr });

        const TW = 172, TH = 74, GAP = 14;
        let left = param.point.x + GAP;
        if (param.point.x > el.clientWidth / 2) left = param.point.x - TW - GAP;
        tooltip.el.style.left    = Math.max(8, Math.min(left, el.clientWidth  - TW - 8)) + 'px';
        tooltip.el.style.top     = Math.max(8, Math.min(param.point.y - TH / 2, el.clientHeight - TH - 8)) + 'px';
        tooltip.el.style.display = 'block';

        /* Time pill — slide + tick on date change */
        const shortDate = formatDateShort(timeStr);
        if (shortDate !== lastPillDate) {
          timePill.style.animation = 'none';
          void timePill.offsetWidth;
          timePill.style.animation = 'pcTick 150ms ease-out forwards';
          timePill.textContent = shortDate;
          lastPillDate = shortDate;
        }
        timePill.style.left    = param.point.x + 'px';
        timePill.style.display = 'block';
      });

      /* ── Auto-resize ── */
      const ro = new ResizeObserver(function (entries) {
        const rect = entries[0] && entries[0].contentRect;
        if (rect) {
          chart.applyOptions({ width: rect.width, height: rect.height });
          chart.timeScale().fitContent();
        }
      });
      ro.observe(el);

      return function () {
        if (drawRafRef.current) cancelAnimationFrame(drawRafRef.current);
        ro.disconnect();
        chart.remove();
      };
    }, []);

    /* ── Range change: swap data + smooth zoom transition ── */
    React.useEffect(function () {
      if (!chartRef.current || !seriesRef.current || !allDataRef.current) return;
      const cur      = chartRef.current.timeScale().getVisibleRange();
      const filtered = filterByRange(allDataRef.current, activeRange);
      seriesRef.current.setData(filtered);
      const tgtFrom = filtered[0].time;
      const tgtTo   = filtered[filtered.length - 1].time;
      if (cur && cur.from && cur.to) {
        const curFrom = typeof cur.from === 'string' ? cur.from : toStr(cur.from * 1000);
        const curTo   = typeof cur.to   === 'string' ? cur.to   : toStr(cur.to   * 1000);
        startRangeTransition(chartRef.current, drawRafRef, curFrom, curTo, tgtFrom, tgtTo, 450);
      } else {
        startDrawAnim(chartRef.current, drawRafRef, tgtFrom, tgtTo, 600);
      }
    }, [activeRange]);

    /* ── Render ── */
    return React.createElement('div', {
      style: { display: 'flex', flexDirection: 'column', width: '100%', height: '100%' },
    },
      /* Chart canvas */
      React.createElement('div', {
        ref:   containerRef,
        style: { position: 'relative', flex: '1', minHeight: '0' },
      }),
      /* Range segmented control — hidden when props.hideRangeSelector is true */
      props.hideRangeSelector ? null : React.createElement('div', {
        style: {
          display: 'flex', alignItems: 'center',
          background: '#EFEFEF',
          borderRadius: '9999px',
          padding: '3px',
          flexShrink: '0',
          marginTop: '10px',
        },
      },
        ranges.map(function (r) {
          return React.createElement(RangeButton, {
            key:    r,
            label:  r,
            active: r === activeRange,
            onClick: function () { setActiveRange(r); },
          });
        })
      )
    );
  }

  /* ── Exports ── */
  global.PortfolioChart        = PortfolioChart;
  global.generateMockChartData = generateMockData;

})(window);
