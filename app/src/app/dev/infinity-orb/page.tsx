'use client';

import { Check, CopySimple } from '@phosphor-icons/react';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { InfinityThinkingOrb } from '@/components/InfinityThinkingOrb';
import s from './page.module.css';

type OrbSettings = {
  size: number;
  pathWidth: number;
  pathHeight: number;
  dotCount: number;
  dotScale: number;
  speed: number;
};

const INITIAL_SETTINGS: OrbSettings = {
  size: 112,
  pathWidth: 82,
  pathHeight: 48,
  dotCount: 72,
  dotScale: 1.45,
  speed: 0.9,
};

type NumericSetting = keyof OrbSettings;

export default function InfinityOrbTunerPage() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasHeight = Math.round(settings.size * 0.64);

  const snippet = useMemo(
    () => `<InfinityThinkingOrb
  width={${settings.size}}
  height={${canvasHeight}}
  pathWidth={${settings.pathWidth}}
  pathHeight={${settings.pathHeight}}
  dotCount={${settings.dotCount}}
  dotScale={${settings.dotScale.toFixed(2)}}
  speed={${settings.speed.toFixed(2)}}
/>`,
    [canvasHeight, settings],
  );

  const updateSetting = (key: NumericSetting, value: number) => {
    setSettings((current) => {
      if (key !== 'size') return { ...current, [key]: value };

      const nextHeight = Math.round(value * 0.64);
      return {
        ...current,
        size: value,
        pathWidth: Math.min(current.pathWidth, value - 16),
        pathHeight: Math.min(current.pathHeight, nextHeight - 12),
      };
    });
  };

  const copySnippet = async () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);

    try {
      await navigator.clipboard.writeText(snippet);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }

    copyTimer.current = setTimeout(() => setCopyState('idle'), 1600);
  };

  return (
    <main className={s.page}>
      <div className={s.shell}>
        <header className={s.header}>
          <Link href="/dev" className={s.backLink}>← Page directory</Link>
          <div>
            <h1 className={s.title}>Infinity orb tuner</h1>
            <p className={s.subtitle}>Shape the loader and copy the exact component settings.</p>
          </div>
        </header>

        <div className={s.workspace}>
          <section className={s.previewPanel} aria-label="Infinity orb preview">
            <div className={s.previewLabel}>Actual size · {settings.size} × {canvasHeight}px</div>
            <div className={s.previewStage}>
              <InfinityThinkingOrb
                width={settings.size}
                height={canvasHeight}
                pathWidth={settings.pathWidth}
                pathHeight={settings.pathHeight}
                dotCount={settings.dotCount}
                dotScale={settings.dotScale}
                speed={settings.speed}
                aria-label="Preview of the tuned infinity loading animation"
              />
            </div>

            <div className={s.codePanel}>
              <pre className={s.code}><code>{snippet}</code></pre>
              <button type="button" className={s.copyButton} onClick={copySnippet}>
                {copyState === 'copied' ? <Check aria-hidden="true" /> : <CopySimple aria-hidden="true" />}
                {copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy JSX'}
              </button>
              <span className={s.srOnly} aria-live="polite">
                {copyState === 'copied' ? 'JSX copied to clipboard' : copyState === 'error' ? 'Could not copy JSX' : ''}
              </span>
            </div>
          </section>

          <aside className={s.controlsPanel} aria-label="Orb controls">
            <h2 className={s.controlsTitle}>Fine tune</h2>

            <RangeControl
              id="orb-size"
              label="Overall size"
              value={settings.size}
              valueLabel={`${settings.size}px`}
              min={80}
              max={180}
              step={2}
              onChange={(value) => updateSetting('size', value)}
            />
            <RangeControl
              id="orb-width"
              label="Loop width"
              value={settings.pathWidth}
              valueLabel={`${settings.pathWidth}px`}
              min={46}
              max={settings.size - 16}
              step={2}
              onChange={(value) => updateSetting('pathWidth', value)}
            />
            <RangeControl
              id="orb-height"
              label="Roundness"
              value={settings.pathHeight}
              valueLabel={`${settings.pathHeight}px`}
              min={2}
              max={canvasHeight - 12}
              step={2}
              hint="Lower values flatten the loop; higher values make it fuller."
              onChange={(value) => updateSetting('pathHeight', value)}
            />
            <RangeControl
              id="orb-density"
              label="Dot density"
              value={settings.dotCount}
              valueLabel={`${settings.dotCount}`}
              min={36}
              max={120}
              step={2}
              onChange={(value) => updateSetting('dotCount', value)}
            />
            <RangeControl
              id="orb-weight"
              label="Dot weight"
              value={settings.dotScale}
              valueLabel={`${settings.dotScale.toFixed(2)}×`}
              min={0.8}
              max={2.2}
              step={0.05}
              onChange={(value) => updateSetting('dotScale', value)}
            />
            <RangeControl
              id="orb-speed"
              label="Speed"
              value={settings.speed}
              valueLabel={`${settings.speed.toFixed(2)}×`}
              min={0.3}
              max={2}
              step={0.05}
              onChange={(value) => updateSetting('speed', value)}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}

type RangeControlProps = {
  id: string;
  label: string;
  value: number;
  valueLabel: string;
  min: number;
  max: number;
  step: number;
  hint?: string;
  onChange: (value: number) => void;
};

function RangeControl({
  id,
  label,
  value,
  valueLabel,
  min,
  max,
  step,
  hint,
  onChange,
}: RangeControlProps) {
  return (
    <div className={s.control}>
      <div className={s.controlHeader}>
        <label htmlFor={id} className={s.controlLabel}>{label}</label>
        <output htmlFor={id} className={s.controlValue}>{valueLabel}</output>
      </div>
      <input
        id={id}
        className={s.range}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {hint ? <p className={s.controlHint}>{hint}</p> : null}
    </div>
  );
}
