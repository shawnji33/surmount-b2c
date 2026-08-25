'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, CaretDown, ArrowSquareOut, Sparkle } from '@phosphor-icons/react';
import type { NodeInstance } from '../nodes/types';
import { EditableText } from '../canvas/EditableText';
import { CARD_ROWS, rowValue, type CardRow } from './agentModel';
import { ValueToken } from './ValueToken';
import s from './cards.module.css';

export function AgentCard({
  name,
  nodes,
  changed,
  readOnly = false,
  assemble = false,
  activated = false,
  onRename,
  onEdit,
  onActivate,
}: {
  name: string;
  nodes: NodeInstance[];
  changed: string | null;
  readOnly?: boolean;
  assemble?: boolean;
  activated?: boolean;
  onRename?: (v: string) => void;
  onEdit: (row: CardRow, value: import('../nodes/types').ParamValue) => void;
  onActivate?: () => void;
}) {
  const summary = CARD_ROWS.filter((r) => !r.detail);
  const details = CARD_ROWS.filter((r) => r.detail);
  const [showDetails, setShowDetails] = useState(false);
  const [revealed, setRevealed] = useState(assemble ? 0 : summary.length);

  // assemble the summary rows one by one when the card streams in
  useEffect(() => {
    if (!assemble) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setRevealed(summary.length);
      return;
    }
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setRevealed(i);
      if (i < summary.length) t = setTimeout(tick, 150);
    };
    const start = setTimeout(tick, 140);
    return () => {
      clearTimeout(start);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assemble]);

  const renderRow = (row: CardRow) => (
    <div className={s.cardRow} key={row.id}>
      <span className={s.rowLabel}>{row.label}</span>
      <span className={s.rowDots} />
      <ValueToken
        row={row}
        value={rowValue(nodes, row)}
        changed={changed === row.id}
        readOnly={readOnly}
        onCommit={(v) => onEdit(row, v)}
      />
    </div>
  );

  return (
    <div className={`${s.card} ${readOnly ? s.cardReadonly : ''}`}>
      <div className={s.cardHead}>
        <span className={s.cardIcon}>
          <Sparkle size={16} weight="fill" />
        </span>
        <span className={s.cardName}>
          {onRename && !readOnly ? (
            <EditableText value={name} onCommit={onRename} />
          ) : (
            name
          )}
        </span>
        <span className={s.skillTag}>Equities</span>
        {activated ? (
          <span className={s.statusActive}>
            <span className={s.statusDot} />
            Active
          </span>
        ) : (
          <span className={s.statusHint}>Draft</span>
        )}
      </div>

      <div className={s.cardBody}>
        {summary.slice(0, revealed).map((row) => (
          <div className={s.rowEnter} key={row.id}>
            {renderRow(row)}
          </div>
        ))}

        {revealed >= summary.length && (
          <>
            <button className={s.detailsToggle} onClick={() => setShowDetails((v) => !v)}>
              <CaretDown size={14} className={`${s.detailsChevron} ${showDetails ? s.detailsChevronOpen : ''}`} />
              {showDetails ? 'Hide details' : 'Show details'}
            </button>
            <div className={`${s.collapse} ${showDetails ? s.collapseOpen : ''}`}>
              <div>
                <div className={s.detailRows}>{details.map(renderRow)}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {revealed >= summary.length && (
        <div className={s.cardFoot}>
          {activated ? (
            <span className={s.footActive}>Running — you&apos;ll be notified on the first fill.</span>
          ) : (
            <button className={s.activate} onClick={onActivate} disabled={readOnly}>
              Review &amp; activate
              <ArrowRight size={15} weight="bold" />
            </button>
          )}
          <a className={s.fullView} href="/home/agents/build">
            <ArrowSquareOut size={14} />
            Open full view
          </a>
        </div>
      )}
    </div>
  );
}
