'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Node } from '@xyflow/react';
import { Question, CaretDown, X, ArrowsOutLineHorizontal, Check, Trash } from '@phosphor-icons/react';
import s from './build.module.css';
import { EditableText } from '../canvas/EditableText';
import { Field } from './Field';
import { CATALOG_BY_ID, fieldError } from '../nodes/catalog';
import { CATEGORY_META, type NodeTypeDef, type NodeTypeId, type ParamValue } from '../nodes/types';
import { useNodeEdit } from '../canvas/NodeEditContext';

/* catalog inspector — renders one Field per paramSchema entry, honoring showWhen */
function CatalogInspector({
  def,
  params,
  onChange,
}: {
  def: NodeTypeDef;
  params: Record<string, ParamValue>;
  onChange: (key: string, value: ParamValue) => void;
}) {
  const valOf = (key: string) => params[key] ?? def.paramSchema.find((f) => f.key === key)?.default ?? null;
  const visible = def.paramSchema.filter(
    (f) => !f.showWhen || valOf(f.showWhen.key) === f.showWhen.equals,
  );
  // group visible fields by section (preserving order)
  const sections: { name: string; fields: typeof visible }[] = [];
  for (const f of visible) {
    const name = f.section ?? '';
    let g = sections.find((sec) => sec.name === name);
    if (!g) {
      g = { name, fields: [] };
      sections.push(g);
    }
    g.fields.push(f);
  }
  return (
    <div className={s.panelBody}>
      {sections.map((sec, i) => (
        <div key={i} className={s.pSection}>
          {sec.name && <div className={s.pSectionTitle}>{sec.name}</div>}
          {sec.fields.map((f) => (
            <Field
              key={f.key}
              field={f}
              value={params[f.key] ?? null}
              error={fieldError(f, params[f.key] ?? null) ?? undefined}
              onChange={(v) => onChange(f.key, v)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const CONDITION_OPTIONS = [
  'Price down 5%+ from open',
  'Price down 2%+ from open',
  'Price down 5%+ vs prior close',
  'Drop vs. 5-day high',
  'RSI below 30 (oversold)',
  'Crosses below 50-day MA',
];
const ACTION_OPTIONS = ['Buy', 'Sell', 'Hold'];

const ICON_SRC: Record<string, string> = {
  trigger: '/agent-canvas/icon-trigger.svg',
  branch: '/agent-canvas/nvidia.png',
  notification: '/agent-canvas/icon-bell.svg',
};

const MIN_W = 320;
const MAX_W = 680;
const EDGE_GAP = 20; // panel sits 20px from the screen's right edge

function HelpIcon() {
  return <Question className={s.pHelp} size={15} />;
}

function Chevron() {
  return <CaretDown size={16} />;
}

/* Interactive dropdown — click to open a menu of options */
function Dropdown({ label, value, options }: { label: string; value: string; options?: string[] }) {
  const opts = options ?? [value];
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as globalThis.Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={s.pField} ref={ref}>
      <div className={s.pLabelRow}>
        <span className={s.pLabel}>{label}</span>
        <HelpIcon />
      </div>
      <button
        className={`${s.pInput} ${open ? s.pInputOpen : ''}`}
        type="button"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={s.pInputVal}>{selected}</span>
        <CaretDown size={16} />
      </button>
      {open && (
        <div className={s.pMenu}>
          {opts.map((o) => (
            <button
              key={o}
              className={`${s.pMenuItem} ${o === selected ? s.pMenuItemSel : ''}`}
              onClick={() => {
                setSelected(o);
                setOpen(false);
              }}
            >
              <span>{o}</span>
              {o === selected && <Check size={16} weight="bold" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Ticker field with avatar — Figma 1262:7291 */
function TickerField() {
  return (
    <div className={s.pField}>
      <div className={s.pLabelRow}>
        <span className={s.pLabel}>Ticker</span>
        <HelpIcon />
      </div>
      <button className={s.pInput} type="button">
        <span className={s.pTicker}>
          <span className={s.pAvatar}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/agent-canvas/nvidia.png" alt="" />
          </span>
          <span className={s.pTickerSym}>NVDA</span>
          <span className={s.pTickerName}>NVIDIA Corporation</span>
        </span>
        <Chevron />
      </button>
    </div>
  );
}

/* Branch (IF / Else) editor body — Figma 1262:1980. Each section collapses
   to just its pill when the chevron is clicked. */
function BranchBody() {
  const [ifOpen, setIfOpen] = useState(true);
  const [elseOpen, setElseOpen] = useState(true);
  return (
    <div className={s.panelBodyFlush}>
      <div className={s.panelSection}>
        <div className={s.pBranchHead}>
          <span className={`${s.pPill} ${s.pPillIf}`}>IF</span>
          <button
            className={s.pSectChevron}
            onClick={() => setIfOpen((o) => !o)}
            aria-label={ifOpen ? 'Collapse' : 'Expand'}
          >
            <CaretDown size={16} className={ifOpen ? '' : s.pSectChevronClosed} />
          </button>
        </div>
        <div className={`${s.collapse} ${ifOpen ? s.collapseOpen : ''}`}>
          <div>
            <div className={s.branchFields}>
              <TickerField />
              <Dropdown label="Condition" value="Price down 5%+ from open" options={CONDITION_OPTIONS} />
              <Dropdown label="Action" value="Buy" options={ACTION_OPTIONS} />
            </div>
          </div>
        </div>
      </div>
      <div className={s.panelSection}>
        <div className={s.pBranchHead}>
          <span className={`${s.pPill} ${s.pPillElse}`}>Else</span>
          <button
            className={s.pSectChevron}
            onClick={() => setElseOpen((o) => !o)}
            aria-label={elseOpen ? 'Collapse' : 'Expand'}
          >
            <CaretDown size={16} className={elseOpen ? '' : s.pSectChevronClosed} />
          </button>
        </div>
        <div className={`${s.collapse} ${elseOpen ? s.collapseOpen : ''}`}>
          <div>
            <div className={s.branchFields}>
              <Dropdown label="Action" value="No action" options={['No action', 'Buy', 'Sell', 'Hold']} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NodePanel({
  node,
  onClose,
  onUpdate,
}: {
  node: Node | null;
  onClose: () => void;
  onUpdate: (id: string, patch: Record<string, unknown>) => void;
}) {
  const [data, setData] = useState<Node | null>(null);
  const [shown, setShown] = useState(false);
  const [width, setWidth] = useState(384);
  const resizing = useRef(false);
  const actions = useNodeEdit();

  // mount → next frame slide in; null → slide out (content cleared on transition end)
  useEffect(() => {
    if (node) {
      setData(node);
      const r = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(r);
    }
    setShown(false);
  }, [node]);

  const startResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    resizing.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';
    const onMove = (ev: PointerEvent) => {
      const rightEdge = window.innerWidth - EDGE_GAP;
      setWidth(Math.min(MAX_W, Math.max(MIN_W, rightEdge - ev.clientX)));
    };
    const onUp = () => {
      resizing.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, []);

  if (!data) return null;
  const d = data.data as { title?: string; desc?: string };
  const isCatalog = data.type === 'catalog';
  const cdata = data.data as { typeId?: NodeTypeId; params?: Record<string, ParamValue> };
  const def = isCatalog && cdata.typeId ? CATALOG_BY_ID[cdata.typeId] : null;
  const params = cdata.params ?? {};
  const CatIcon = def?.icon;
  const meta = def ? CATEGORY_META[def.category] : null;
  const iconSrc = ICON_SRC[data.type ?? 'trigger'] ?? ICON_SRC.trigger;
  const desc = def
    ? def.description
    : data.type === 'branch'
      ? (d.desc ?? 'Determine when NVDA drops more than 5% in a day')
      : d.desc;

  return (
    <div
      className={`${s.panel} ${shown ? s.panelOpen : ''}`}
      style={{ width }}
      onTransitionEnd={() => {
        if (!shown) setData(null);
      }}
    >
      {/* left-edge resize handle */}
      <button className={s.panelHandle} onPointerDown={startResize} aria-label="Resize panel">
        <ArrowsOutLineHorizontal size={16} />
      </button>

      <div className={s.panelInner}>
        <header className={s.panelHead}>
          <span className={s.pIcon} style={meta ? { background: meta.bg, color: meta.color } : undefined}>
            {CatIcon ? (
              <CatIcon size={16} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={iconSrc} alt="" />
            )}
          </span>
          <span className={s.pTitle}>
            {def ? (
              def.label
            ) : (
              <EditableText value={d.title ?? ''} onCommit={(v) => onUpdate(data.id, { title: v })} />
            )}
          </span>
          <button className={s.pClose} onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>

        {desc !== undefined &&
          (def ? (
            <div className={s.panelDesc}>{desc}</div>
          ) : (
            <div className={s.panelDesc}>
              <EditableText
                value={desc}
                multiline
                placeholder="Add a description"
                onCommit={(v) => onUpdate(data.id, { desc: v })}
              />
            </div>
          ))}

        {def ? (
          <CatalogInspector
            def={def}
            params={params}
            onChange={(key, value) => onUpdate(data.id, { params: { ...params, [key]: value } })}
          />
        ) : data.type === 'branch' ? (
          <BranchBody />
        ) : (
          <div className={s.panelBody}>
            {data.type === 'trigger' && (
              <>
                <Dropdown
                  label="Frequency"
                  value="Every 15 minutes"
                  options={['Every 5 minutes', 'Every 15 minutes', 'Every 30 minutes', 'Every hour', 'Once a day']}
                />
                <Dropdown
                  label="Time"
                  value="Monday to Friday market hours"
                  options={['Monday to Friday market hours', 'Weekdays (24h)', 'Every day (24h)', 'Custom schedule']}
                />
              </>
            )}
            {data.type === 'notification' && (
              <Dropdown
                label="Channel"
                value="Email and in-app notification"
                options={['Email and in-app notification', 'Email only', 'In-app only', 'SMS + Email']}
              />
            )}
          </div>
        )}

        <div className={s.panelFooter}>
          <button
            className={s.panelDelete}
            onClick={() => {
              actions?.remove(data.id);
              onClose();
            }}
          >
            <Trash size={15} />
            Delete
          </button>
          <button className={s.panelDone} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
