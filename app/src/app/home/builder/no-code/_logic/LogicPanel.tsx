'use client';

import { useId, useState } from 'react';
import type { Node } from '@xyflow/react';
import { X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ASSET_UNIVERSE } from '../../_data';
import { FREQUENCIES, INDICATORS, type IndicatorCategory } from './data';
import { ConditionEditor } from './ConditionEditor';
import type { ActionData, ConditionData, TriggerData } from './types';
import s from './logic.module.css';

/* Every control here comes from the design system — shadcn Select, Label,
 * ToggleGroup, Input, Button (src/components/ui/). The panel previously used
 * native <select> elements, which rendered with the browser's own chrome and
 * ignored the DS entirely. Only layout lives in the CSS module now. */

const CATEGORIES: IndicatorCategory[] = ['Technical', 'Fundamental', 'Descriptive'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <div className={s.fieldGroup}>
      <Label htmlFor={id} className={s.fieldLabel}>{label}</Label>
      <div id={id} className={s.fieldControl}>{children}</div>
    </div>
  );
}

function IndicatorSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={s.selectTrigger} aria-label="Indicator">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CATEGORIES.map((cat) => (
          <SelectGroup key={cat}>
            <SelectLabel>{cat}</SelectLabel>
            {INDICATORS.filter((f) => f.category === cat).map((f) => (
              <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

function TickerSelect({ value, onChange }: { value: string; onChange: (ticker: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={s.selectTrigger} aria-label="Ticker">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ASSET_UNIVERSE.map((a) => (
          <SelectItem key={a.ticker} value={a.ticker}>{a.ticker}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TriggerFields({ data, onChange }: { data: TriggerData; onChange: (patch: Partial<TriggerData>) => void }) {
  return (
    <Field label="Frequency">
      {/* undefined, not '' — Radix treats an empty string as a real value and
          would suppress the placeholder on a fresh, unset schedule. */}
      <Select value={data.frequency || undefined} onValueChange={(frequency) => onChange({ frequency })}>
        <SelectTrigger className={s.selectTrigger} aria-label="Frequency">
          <SelectValue placeholder="Choose a frequency" />
        </SelectTrigger>
        <SelectContent>
          {FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
        </SelectContent>
      </Select>
    </Field>
  );
}

/* The condition editor is its own component now — see ConditionEditor.tsx. The
 * Figma drops the ALL/ANY control from this panel, so `andOr` stays on the data
 * model (nothing else reads it yet) but is no longer editable here. */

function ActionFields({ data, onChange, selectedAssets }: {
  data: ActionData;
  onChange: (patch: Partial<ActionData>) => void;
  selectedAssets: string[];
}) {
  /* Only assets picked on the Strategy builder tab can be allocated here — this
   * branch decides how that basket is weighted, not which assets exist. */
  const available = selectedAssets.filter((tk) => !data.holdings.some((h) => h.ticker === tk));
  const total = data.holdings.reduce((sum, h) => sum + (h.weight || 0), 0);
  const balanced = Math.round(total) === 100;

  const patchHolding = (i: number, weight: number) =>
    onChange({ holdings: data.holdings.map((h, j) => (j === i ? { ...h, weight } : h)) });

  function addAsset(ticker: string) {
    // Split evenly on add so the basket stays at 100% without extra typing.
    const next = [...data.holdings, { ticker, weight: 0 }];
    const even = Math.round((100 / next.length) * 10) / 10;
    onChange({ holdings: next.map((h) => ({ ...h, weight: even })) });
  }

  return (
    <>
      <Field label="Allocation">
        {data.holdings.length === 0 ? (
          <p className={s.placeholder}>No assets allocated yet.</p>
        ) : (
          <div className={s.holdingList}>
            {data.holdings.map((h, i) => {
              const asset = ASSET_UNIVERSE.find((a) => a.ticker === h.ticker);
              return (
                <div className={s.holdingRow} key={h.ticker}>
                  {asset?.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset.logo} alt="" className={s.holdingLogo} />
                  ) : (
                    <span className={[s.holdingLogo, s.holdingLogoFallback].join(' ')} style={{ background: asset?.fallbackColor }} aria-hidden="true">
                      {h.ticker.slice(0, 2)}
                    </span>
                  )}
                  <span className={s.holdingTicker}>{h.ticker}</span>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    inputMode="decimal"
                    className={s.holdingWeight}
                    value={h.weight}
                    onChange={(e) => patchHolding(i, Number(e.target.value))}
                    aria-label={`${h.ticker} weight`}
                  />
                  <span className={s.holdingPct}>%</span>
                  <button
                    type="button"
                    className={s.holdingRemove}
                    onClick={() => onChange({ holdings: data.holdings.filter((_, j) => j !== i) })}
                    aria-label={`Remove ${h.ticker}`}
                  >
                    <X weight="bold" />
                  </button>
                </div>
              );
            })}

            <div className={s.holdingTotal} data-off={balanced ? undefined : 'true'}>
              <span>Total</span>
              <span>{Math.round(total * 10) / 10}%</span>
            </div>
          </div>
        )}
      </Field>

      <Field label="Add asset">
        {available.length === 0 ? (
          <p className={s.placeholder}>
            {selectedAssets.length === 0
              ? 'Pick assets on the Strategy builder tab first.'
              : 'Every selected asset is already allocated.'}
          </p>
        ) : (
          <Select value="" onValueChange={addAsset}>
            <SelectTrigger className={s.selectTrigger} aria-label="Add asset">
              <SelectValue placeholder="Choose an asset" />
            </SelectTrigger>
            <SelectContent>
              {available.map((tk) => {
                const a = ASSET_UNIVERSE.find((x) => x.ticker === tk);
                return (
                  <SelectItem key={tk} value={tk}>
                    {tk}{a ? ` · ${a.name}` : ''}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}
      </Field>
    </>
  );
}

export function LogicPanel({ node, onChange, onClose, selectedAssets }: {
  node: Node;
  onChange: (patch: Record<string, unknown>) => void;
  onClose: () => void;
  selectedAssets: string[];
}) {
  const data = node.data as unknown as TriggerData | ConditionData | ActionData;

  return (
    <div className={s.panel}>
      <div className={s.panelHead}>
        <span className={s.panelTitle}>
          {data.kind === 'trigger' && 'Edit trigger'}
          {data.kind === 'condition' && 'Edit condition'}
          {data.kind === 'action' && `Edit ${(data as ActionData).label.toLowerCase()} allocation`}
        </span>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
          <X weight="regular" />
        </Button>
      </div>

      <div className={s.panelBody}>
        {data.kind === 'trigger' && <TriggerFields data={data} onChange={(patch) => onChange(patch)} />}
        {data.kind === 'condition' && <ConditionEditor data={data} onChange={(patch) => onChange(patch)} />}
        {data.kind === 'action' && <ActionFields data={data} onChange={(patch) => onChange(patch)} selectedAssets={selectedAssets} />}
      </div>
    </div>
  );
}
