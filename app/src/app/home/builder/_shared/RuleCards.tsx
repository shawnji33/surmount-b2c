'use client';

import type { ReactNode } from 'react';
import { Info } from '@phosphor-icons/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from './Toggle';
import { Slider } from './Slider';
import type { RuleState } from './types';
import s from './RuleCards.module.css';

const UNITS = ['Days', 'Weeks', 'Months'] as const;

function RuleCardShell({ title, desc, tooltip, enabled, onToggle, children }: {
  title: string;
  desc: string;
  tooltip: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children: ReactNode;
}) {
  const tooltipId = `rule-tooltip-${title.toLowerCase().replaceAll(' ', '-')}`;

  return (
    <div className={s.card}>
      <div className={s.cardHead}>
          <div className={s.cardHeadText}>
            <div className={s.cardNameRow}>
              <span className={s.cardName}>{title}</span>
              <span className={s.tooltipWrap}>
                <button type="button" className={s.tooltipTrigger} aria-label={`About ${title}`} aria-describedby={tooltipId}>
                  <Info weight="regular" className={s.helpIcon} aria-hidden="true" />
                </button>
                <span className={s.tooltip} id={tooltipId} role="tooltip">{tooltip}</span>
              </span>
            </div>
          <div className={s.cardDesc}>{desc}</div>
        </div>
        <Toggle on={enabled} onChange={onToggle} label={title} />
      </div>
      <div className={[s.body, enabled ? '' : s.bodyClosed].filter(Boolean).join(' ')}>
        <div className={s.bodyInner}>{children}</div>
      </div>
    </div>
  );
}

export function RuleCards({
  rules,
  setRules,
  wrapped = false,
  density = 'comfortable',
  showTitle = true,
}: {
  rules: RuleState;
  setRules: (updater: (prev: RuleState) => RuleState) => void;
  /** Groups the three cards inside one gray panel, matching AddAssetsPanel's treatment right
  * above it in the Figma design. Opt-in — No-Code Builder has no surrounding gray-panel visual
  * language elsewhere, so it keeps the original bare layout unless this is passed. */
  wrapped?: boolean;
  /** Compact preserves the same controls and update behavior in constrained surfaces. */
  density?: 'comfortable' | 'compact';
  /** Lets a surrounding popover provide the accessible visible heading without duplication. */
  showTitle?: boolean;
}) {
  return (
    <div
      className={[
        wrapped ? s.wrappedSection : s.section,
        density === 'compact' ? s.compactSection : '',
      ].filter(Boolean).join(' ')}
    >
      {showTitle && <div className={wrapped ? s.wrappedTitle : s.sectionTitle}>Custom rules</div>}

      <RuleCardShell
        title="Auto rebalance"
        desc="Automatically rebalance your portfolio back to target weights."
        tooltip="Restores your target weights at the interval you choose."
        enabled={rules.rebalance.enabled}
        onToggle={(v) => setRules((prev) => ({ ...prev, rebalance: { ...prev.rebalance, enabled: v } }))}
      >
        <div className={s.rebalanceRow}>
          <span className={s.rebalanceLabel}>Every</span>
          <input
            type="number"
            min={1}
            className={s.numberInput}
            value={rules.rebalance.every}
            onChange={(e) => setRules((prev) => ({ ...prev, rebalance: { ...prev.rebalance, every: Number(e.target.value) } }))}
          />
          <Select
            value={rules.rebalance.unit}
            onValueChange={(value) => {
              setRules((prev) => ({
                ...prev,
                rebalance: { ...prev.rebalance, unit: value as RuleState['rebalance']['unit'] },
              }));
            }}
          >
            <SelectTrigger size="sm" className={s.unitSelect} aria-label="Rebalance interval unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={s.unitMenu} align="end">
              {UNITS.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </RuleCardShell>

      <RuleCardShell
        title="Stop loss"
        desc="If your portfolio falls by this percentage from its peak, exposure may be reduced."
        tooltip="Reduces exposure when losses reach this percentage from the portfolio peak."
        enabled={rules.stopLoss.enabled}
        onToggle={(v) => setRules((prev) => ({ ...prev, stopLoss: { ...prev.stopLoss, enabled: v } }))}
      >
        <div className={s.sliderRow}>
          <Slider
            value={rules.stopLoss.percent}
            onChange={(v) => setRules((prev) => ({ ...prev, stopLoss: { ...prev.stopLoss, percent: v } }))}
            ariaLabel="Stop loss percent"
          />
          <span className={s.sliderValue}>{rules.stopLoss.percent}%</span>
        </div>
      </RuleCardShell>

      <RuleCardShell
        title="Take profit"
        desc="When gains reach this percentage, profits may be partially realized."
        tooltip="Realizes gains after the strategy reaches this return target."
        enabled={rules.takeProfit.enabled}
        onToggle={(v) => setRules((prev) => ({ ...prev, takeProfit: { ...prev.takeProfit, enabled: v } }))}
      >
        <div className={s.sliderRow}>
          <Slider
            value={rules.takeProfit.percent}
            onChange={(v) => setRules((prev) => ({ ...prev, takeProfit: { ...prev.takeProfit, percent: v } }))}
            ariaLabel="Take profit percent"
          />
          <span className={s.sliderValue}>{rules.takeProfit.percent}%</span>
        </div>
      </RuleCardShell>
    </div>
  );
}
