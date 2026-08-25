'use client';

import { useEffect, useState } from 'react';
import { CaretLeft, CaretDown, Check, Warning, ArrowRight, ArrowSquareOut, PencilSimple } from '@phosphor-icons/react';
import { DEMO_AGENT, CARD_ROWS } from '../cards/agentModel';
import { useAgentEdits } from '../cards/useAgentEdits';
import { ValueToken } from '../cards/ValueToken';
import { ActivationGate } from '../cards/ActivationGate';
import { useTimeline } from './useTimeline';
import type { EventState } from './timeline';
import s from './timeline.module.css';

export default function TimelinePage() {
  const { nodes, changed, setByRow } = useAgentEdits(DEMO_AGENT.nodes);
  const agent = { ...DEMO_AGENT, nodes };
  const [activated, setActivated] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // real clock only after mount → SSR + first paint use the stable SSR_ASOF
  const [asOf, setAsOf] = useState<Date | undefined>(undefined);
  useEffect(() => setAsOf(new Date()), []);

  const groups = useTimeline(agent, activated, asOf);
  const flat = groups.flatMap((g) => g.events);

  return (
    <div className={s.app}>
      <header className={s.bar}>
        <button className={s.back} aria-label="Back">
          <CaretLeft size={18} />
        </button>
        <div className={s.ttl}>
          <span>{DEMO_AGENT.name}</span>
          <CaretDown className={s.cr} size={14} />
        </div>
        <span className={s.sp} />
        {activated ? (
          <span className={s.statusActive}>
            <span className={s.statusDot} />
            Active
          </span>
        ) : (
          <span className={s.statusHint}>Draft</span>
        )}
      </header>

      <div className={s.scroll}>
        <div className={s.inner}>
          <div className={s.lead}>
            {activated
              ? 'Your agent is live. Here’s what it’s doing and what’s coming next.'
              : 'Here’s what this agent will do once it’s live.'}
          </div>

          <div className={s.feed}>
            {groups.map((grp) => (
              <div key={grp.group} className={s.group}>
                <div className={s.groupHead}>{grp.group}</div>
                {grp.events.map((ev) => {
                  const isLast = flat[flat.length - 1].id === ev.id;
                  const row = ev.editRowId ? CARD_ROWS.find((r) => r.id === ev.editRowId) : undefined;
                  const editable = !activated && !!row;
                  const open = editId === ev.id;
                  return (
                    <div key={ev.id} className={`${s.row} ${s.enter}`}>
                      <div className={`${s.glyphCol} ${isLast ? s.glyphColLast : ''}`}>
                        <EventGlyph state={ev.state} />
                      </div>
                      <div className={s.body}>
                        <button
                          className={`${s.rowMain} ${editable ? s.rowEditable : ''}`}
                          onClick={editable ? () => setEditId(open ? null : ev.id) : undefined}
                        >
                          <span className={s.rowTitle}>{ev.title}</span>
                          {editable && (
                            <span className={s.rowEditHint}>
                              <PencilSimple size={13} />
                            </span>
                          )}
                        </button>
                        <div className={s.rowDetail}>{ev.detail}</div>

                        {editable && row && (
                          <div className={`${s.collapse} ${open ? s.collapseOpen : ''}`}>
                            <div>
                              <div className={s.editor}>
                                <span className={s.editorLabel}>{row.label}</span>
                                <ValueToken
                                  row={row}
                                  value={nodes.find((n) => n.id === row.nodeId)?.params[row.key] ?? null}
                                  changed={changed === row.id}
                                  onCommit={(v) => setByRow(row, v)}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className={s.foot}>
            {activated ? (
              <span className={s.footActive}>Running — new events will appear here as they happen.</span>
            ) : (
              <button className={s.activate} onClick={() => setGateOpen(true)}>
                Review &amp; activate
                <ArrowRight size={15} weight="bold" />
              </button>
            )}
            <a className={s.fullView} href="/home/agents/cards">
              <ArrowSquareOut size={14} />
              Edit full strategy
            </a>
          </div>
        </div>
      </div>

      <ActivationGate
        open={gateOpen}
        agentName={DEMO_AGENT.name}
        nodes={nodes}
        onClose={() => setGateOpen(false)}
        onConfirm={() => {
          setGateOpen(false);
          setActivated(true);
          setEditId(null);
        }}
      />
    </div>
  );
}

function EventGlyph({ state }: { state: EventState }) {
  if (state === 'done') {
    return (
      <span className={`${s.glyph} ${s.glyphDone}`}>
        <Check size={12} weight="bold" />
      </span>
    );
  }
  if (state === 'attention') {
    return (
      <span className={`${s.glyph} ${s.glyphAttn}`}>
        <Warning size={12} weight="fill" />
      </span>
    );
  }
  if (state === 'now') {
    return (
      <span className={`${s.glyph} ${s.glyphNow}`}>
        <span className={s.glyphPulse} />
      </span>
    );
  }
  if (state === 'skipped') {
    return <span className={`${s.glyph} ${s.glyphSkip}`} />;
  }
  // projected
  return <span className={`${s.glyph} ${s.glyphProjected}`} />;
}
