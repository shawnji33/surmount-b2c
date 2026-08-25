'use client';

import { useState } from 'react';
import type { Icon } from '@phosphor-icons/react';
import {
  CaretDown,
  Coins,
  Equals,
  GreaterThan,
  GreaterThanOrEqual,
  LessThan,
  LessThanOrEqual,
  NotEquals,
} from '@phosphor-icons/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ASSET_UNIVERSE } from '../../_data';
import { COMPARATORS, INDICATORS, type ComparatorIcon, type IndicatorCategory } from './data';
import type { ConditionClause, ConditionData, ConditionSide } from './types';
import s from './logic.module.css';

/* Duotone per Shawn's explicit request — the house rule is regular-weight
 * stroked icons, and this dropdown is the stated exception. */
const COMPARATOR_ICONS: Record<ComparatorIcon, Icon> = {
  GreaterThan,
  LessThan,
  Equals,
  NotEquals,
  GreaterThanOrEqual,
  LessThanOrEqual,
};

/* Sentence-style condition editor — Figma 2101:79107 (default), 2103:85114
 * (function dropdown open), 2103:85186 (asset dropdown open), file
 * 2wwYoRpClncFrrJzqUqKFf.
 *
 * The condition reads as three rows — IF <fn> of <asset> / IS <comparator> /
 * <fn> of <asset> — with every value a brand-blue capsule that opens its own
 * popover. Replaces the previous stack of labelled dropdowns. */

const CATEGORIES: IndicatorCategory[] = ['Technical', 'Fundamental', 'Descriptive'];
const LIST_FADE = 24;

function Pill({
  label,
  placeholder,
  icon,
  open,
}: {
  label?: string;
  placeholder: string;
  icon?: boolean;
  open?: boolean;
}) {
  return (
    <span className={s.valuePill} data-open={open || undefined}>
      {icon && <Coins weight="regular" className={s.valuePillIcon} aria-hidden="true" />}
      <span className={s.valuePillLabel}>{label ?? placeholder}</span>
      <CaretDown weight="bold" className={s.valuePillCaret} aria-hidden="true" />
      <span className={s.valuePillInset} aria-hidden="true" />
    </span>
  );
}

/* A parameterised indicator reads as "10d Cumulative Return" once its window is
 * filled in — both on the capsule here and on the canvas node. */
export function functionLabel(side: ConditionSide, short = false): string | undefined {
  const fn = INDICATORS.find((i) => i.id === side.functionId);
  if (!fn) return undefined;
  const base = short ? fn.abbr : fn.label;
  if (!fn.param || !side.window) return base;
  return `${side.window}${fn.param.suffix} ${base}`;
}

/* What the side reads as once resolved — a fixed percentage, or the function
 * (with its window prefix). Shared by the capsule here and the canvas node. */
export function sideLabel(side: ConditionSide, short = false): string | undefined {
  if (side.isFixed) return `${side.fixedValue ?? 0}%`;
  return functionLabel(side, short);
}

function FunctionPicker({
  side,
  onChange,
  allowFixed,
}: {
  side: ConditionSide;
  onChange: (patch: Partial<ConditionSide>) => void;
  allowFixed?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<IndicatorCategory>(
    INDICATORS.find((i) => i.id === side.functionId)?.category ?? 'Technical',
  );
  const selected = INDICATORS.find((i) => i.id === side.functionId);
  const options = INDICATORS.filter((i) => i.category === category);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={s.pillTrigger} aria-label="Choose function">
        <Pill label={sideLabel(side)} placeholder="Choose Function" open={open} />
      </PopoverTrigger>

      <PopoverContent className={s.popover}>
        {allowFixed && (
          <div className={s.fixedToggleRow}>
            <Switch
              id="fixed-value"
              checked={Boolean(side.isFixed)}
              onCheckedChange={(isFixed) => onChange({ isFixed })}
            />
            <Label htmlFor="fixed-value" className={s.fixedToggleLabel}>Fixed value</Label>
          </div>
        )}

        {side.isFixed ? (
          <div className={s.popoverField}>
            <p className={s.popoverLabel}>Value (%)</p>
            <Input
              type="number"
              inputMode="decimal"
              className={s.popoverInput}
              placeholder="0"
              value={side.fixedValue ?? ''}
              autoFocus
              onChange={(e) => {
                const raw = e.target.value;
                onChange({ fixedValue: raw === '' ? null : Number(raw) });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setOpen(false);
              }}
            />
          </div>
        ) : (
        <>
        <div className={s.popoverField}>
          <p className={s.popoverLabel}>Function</p>

          <div className={s.categoryRow}>
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c}
                className={[s.categoryTag, category === c ? s.categoryTagActive : ''].filter(Boolean).join(' ')}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
              >
                {c}
              </button>
            ))}
          </div>

          {/* DS Select, nested inside the popover. Radix stacks dismissable layers,
              so the inner select's own outside-click handling doesn't collapse the
              popover around it. */}
          <Select
            value={side.functionId || undefined}
            onValueChange={(functionId) => {
              const next = INDICATORS.find((i) => i.id === functionId);
              // Drop a stale window when switching to a function that has no
              // parameter, so the capsule can't read "10d Bollinger Bands".
              onChange({ functionId, window: next?.param ? side.window : null });
              // Parameterised functions need a second value, so keep the popover
              // open on the field that's about to appear.
              if (!next?.param) setOpen(false);
            }}
          >
            <SelectTrigger className={s.popoverSelect} aria-label="Choose a function">
              <SelectValue placeholder="Choose a function" />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selected?.param && (
          <div className={s.popoverField}>
            <p className={s.popoverLabel}>{selected.param.label}</p>
            <Input
              type="number"
              min={1}
              inputMode="numeric"
              className={s.popoverInput}
              placeholder={selected.param.placeholder}
              value={side.window ?? ''}
              autoFocus
              onChange={(e) => {
                const raw = e.target.value;
                onChange({ window: raw === '' ? null : Math.max(1, Number(raw)) });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setOpen(false);
              }}
            />
          </div>
        )}
        </>
        )}
      </PopoverContent>
    </Popover>
  );
}

function AssetPicker({ value, onChange }: { value: string | null; onChange: (t: string) => void }) {
  const [open, setOpen] = useState(false);
  const [fadeTop, setFadeTop] = useState(false);
  const [fadeBottom, setFadeBottom] = useState(false);

  // Same scroll-aware mask as the Strategy builder's asset list — the fade only
  // appears on the side that actually has more content, so a short list never
  // looks clipped.
  //
  // Measured via React's onScroll plus a callback ref rather than an effect +
  // addEventListener: this list lives inside a Radix portal that mounts on its
  // own schedule, and an effect keyed on `open` can run before the node exists,
  // leaving the listener silently unattached.
  function measure(el: HTMLDivElement | null) {
    if (!el) return;
    setFadeTop(el.scrollTop > 2);
    setFadeBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 2);
  }

  const top = fadeTop ? `transparent 0px, black ${LIST_FADE}px` : `black 0px, black ${LIST_FADE}px`;
  const bottom = fadeBottom
    ? `black calc(100% - ${LIST_FADE}px), transparent 100%`
    : `black calc(100% - ${LIST_FADE}px), black 100%`;
  const mask = `linear-gradient(to bottom, ${top}, ${bottom})`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={s.pillTrigger} aria-label="Choose asset">
        <Pill label={value ?? undefined} placeholder="Choose Asset" icon open={open} />
      </PopoverTrigger>

      <PopoverContent className={[s.popover, s.assetPopover].join(' ')}>
        <p className={s.popoverLabel}>Asset</p>

        <div
          className={s.assetList}
          ref={measure}
          onScroll={(e) => measure(e.currentTarget)}
          style={{ WebkitMaskImage: mask, maskImage: mask }}
        >
          {ASSET_UNIVERSE.map((a) => (
            <button
              type="button"
              key={a.ticker}
              className={s.assetRow}
              data-selected={a.ticker === value || undefined}
              onClick={() => {
                onChange(a.ticker);
                setOpen(false);
              }}
            >
              <span className={s.assetInfo}>
                {a.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.logo} alt="" className={s.assetAvatar} />
                ) : (
                  <span
                    className={[s.assetAvatar, s.assetAvatarFallback].join(' ')}
                    style={{ background: a.fallbackColor }}
                    aria-hidden="true"
                  >
                    {a.ticker.slice(0, 2)}
                  </span>
                )}
                <span className={s.assetTicker}>{a.ticker}</span>
                <span className={s.assetName}>{a.name}</span>
              </span>
              <span className={s.assetPrice}>{a.price}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ComparatorPicker({
  value,
  onChange,
}: {
  value: ConditionClause['comparator'];
  onChange: (c: ConditionClause['comparator']) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = COMPARATORS.find((c) => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={s.pillTrigger} aria-label="Choose comparator">
        <Pill label={selected?.label} placeholder="Choose Comparison" open={open} />
      </PopoverTrigger>

      <PopoverContent className={s.popover}>
        <p className={s.popoverLabel}>Comparator</p>
        <div className={s.comparatorList}>
          {COMPARATORS.map((c) => {
            const Icon = COMPARATOR_ICONS[c.icon];
            return (
              <button
                type="button"
                key={c.id}
                className={s.comparatorRow}
                data-selected={c.id === value || undefined}
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                }}
              >
                {c.label}
                <Icon weight="duotone" className={s.comparatorIcon} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SideSlot({ side, onChange, tone, allowFixed }: {
  side: ConditionSide;
  onChange: (s: ConditionSide) => void;
  tone?: 'strong';
  allowFixed?: boolean;
}) {
  return (
    <div className={[s.slot, tone === 'strong' ? s.slotStrong : ''].filter(Boolean).join(' ')}>
      <FunctionPicker
        side={side}
        onChange={(patch) => onChange({ ...side, ...patch })}
        allowFixed={allowFixed}
      />
      {/* A fixed value stands alone — there's no asset to take it "of". */}
      {!side.isFixed && (
        <>
          <span className={s.slotJoin}>of</span>
          <AssetPicker value={side.ticker} onChange={(ticker) => onChange({ ...side, ticker })} />
        </>
      )}
    </div>
  );
}

export function ConditionEditor({
  data,
  onChange,
}: {
  data: ConditionData;
  onChange: (patch: Partial<ConditionData>) => void;
}) {
  /* The clause list and the All-of/Any-of join are built on the canvas — see
   * ConditionNode. This panel edits whichever clause the canvas has selected. */
  const index = Math.min(data.editing ?? 0, data.clauses.length - 1);
  const clause = data.clauses[index];
  if (!clause) return null;

  const patch = (p: Partial<ConditionClause>) =>
    onChange({ clauses: data.clauses.map((c, i) => (i === index ? { ...c, ...p } : c)) });

  return (
    <div className={s.conditionRows}>
      <div className={s.conditionRow}>
        <span className={s.rowBadge}>IF</span>
        <SideSlot side={clause.left} onChange={(left) => patch({ left })} tone="strong" />
      </div>

      <div className={s.conditionRow}>
        <span className={s.rowBadge}>IS</span>
        <div className={s.slot}>
          <ComparatorPicker value={clause.comparator} onChange={(comparator) => patch({ comparator })} />
        </div>
      </div>

      <div className={[s.conditionRow, s.conditionRowIndented].join(' ')}>
        <SideSlot side={clause.right} onChange={(right) => patch({ right })} allowFixed />
      </div>
    </div>
  );
}
