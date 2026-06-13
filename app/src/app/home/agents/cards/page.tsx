'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { CaretLeft, CaretDown, PencilSimpleLine, ArrowUp, Microphone } from '@phosphor-icons/react';
import { TypewriterText } from '@/components/chat/TypewriterText';
import { DEMO_AGENT, formatValue, type CardRow } from './agentModel';
import { useAgentEdits } from './useAgentEdits';
import { AgentCard } from './AgentCard';
import { ActivationGate } from './ActivationGate';
import type { ParamValue } from '../nodes/types';
import s from './cards.module.css';

const confirmContent = (label: string, formatted: string) => (
  <>
    Updated <strong>{label.toLowerCase()}</strong> to <strong>{formatted}</strong>.
  </>
);

type Msg =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'asst'; content: ReactNode; stream?: boolean; confirmRow?: string }
  | { id: number; role: 'chips'; q: string; options: string[]; picked: number }
  | { id: number; role: 'trace'; label: string; done: boolean }
  | { id: number; role: 'card'; live: boolean };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function CardsPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [agentName, setAgentName] = useState(DEMO_AGENT.name);
  const [draft, setDraft] = useState('');
  const { nodes, changed, setByRow, applyNL } = useAgentEdits(DEMO_AGENT.nodes);

  const idRef = useRef(0);
  const runRef = useRef(0);
  const resolvers = useRef<Record<number, (idx: number) => void>>({});
  const captureRef = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardOffscreen, setCardOffscreen] = useState(false);
  const [cardLive, setCardLive] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [activated, setActivated] = useState(false);

  const uid = () => ++idRef.current;
  const stale = (run: number) => run !== runRef.current;
  const W = useCallback((ms: number) => (captureRef.current ? Promise.resolve() : wait(ms)), []);
  const push = useCallback((m: Msg) => setMsgs((p) => [...p, m]), []);
  const patch = useCallback(
    (id: number, p: Partial<Msg>) => setMsgs((m) => m.map((x) => (x.id === id ? ({ ...x, ...p } as Msg) : x))),
    [],
  );

  // auto-scroll when near the bottom
  useEffect(() => {
    const el = logRef.current;
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 160) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  const onScroll = useCallback(() => {
    const card = cardRef.current;
    const el = logRef.current;
    if (!card || !el) return setCardOffscreen(false);
    const cr = card.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    setCardOffscreen(cr.bottom < er.top + 40 || cr.top > er.bottom - 40);
  }, []);

  const say = useCallback(
    async (run: number, content: ReactNode) => {
      const stream = !captureRef.current && typeof content === 'string';
      push({ id: uid(), role: 'asst', content, stream });
      await W(stream ? 200 : 0);
      return !stale(run);
    },
    [push, W],
  );

  const askChips = useCallback(
    (run: number, q: string, options: string[], picked: number) => {
      const id = uid();
      push({ id, role: 'chips', q, options, picked });
      return new Promise<string>((resolve) => {
        resolvers.current[id] = (idx) => {
          if (stale(run)) return;
          setMsgs((p) => p.filter((m) => m.id !== id));
          push({ id: uid(), role: 'user', text: options[idx] });
          resolve(options[idx]);
        };
        if (captureRef.current) queueMicrotask(() => resolvers.current[id]?.(picked));
      });
    },
    [push],
  );

  const runFlow = useCallback(
    async (run: number) => {
      setMsgs([]);
      setCardLive(false);
      resolvers.current = {};

      push({ id: uid(), role: 'user', text: 'Buy NVDA when it drops' });
      await W(700);
      if (stale(run)) return;
      if (!(await say(run, "Got it — a dip-buying agent on NVDA. How big a drop should trigger a buy?"))) return;
      await W(500);
      if (stale(run)) return;

      const drop = await askChips(run, 'How big a drop?', ['Drops 5% in a day', 'Drops 10% in a day', 'Custom'], 0);
      if (stale(run)) return;
      const pct = drop.match(/(\d+)/)?.[1];
      if (pct) setByRow({ id: 'drop', label: 'When NVDA drops', nodeId: 'cond', key: 'rightValue', control: { type: 'number', affix: '%' } }, Number(pct));

      // reasoning trace → resolves → card streams in
      const tid = uid();
      push({ id: tid, role: 'trace', label: 'Drafting your agent — checking your accounts and connections…', done: false });
      await W(1400);
      if (stale(run)) return;
      patch(tid, { done: true });
      await W(250);
      if (stale(run)) return;
      if (!(await say(run, "Here's the agent I built. Edit anything inline, or tell me what to change."))) return;
      await W(300);
      if (stale(run)) return;

      push({ id: uid(), role: 'card', live: true });
      setCardLive(true);
    },
    [push, say, askChips, setByRow, patch, W],
  );

  useEffect(() => {
    captureRef.current = typeof window !== 'undefined' && window.location.hash.includes('figmacapture');
    const run = ++runRef.current;
    runFlow(run);
    return () => {
      runRef.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── direct token edit → write param + a coalesced one-line confirmation ──
  const onEdit = useCallback(
    (row: CardRow, value: ParamValue) => {
      setByRow(row, value);
      const formatted = formatValue(row, value);
      setMsgs((p) => {
        const last = p[p.length - 1];
        if (last && last.role === 'asst' && last.confirmRow === row.id) {
          return p.map((m, i) =>
            i === p.length - 1 ? ({ ...m, content: confirmContent(row.label, formatted) } as Msg) : m,
          );
        }
        return [...p, { id: uid(), role: 'asst', confirmRow: row.id, content: confirmContent(row.label, formatted) }];
      });
    },
    [setByRow],
  );

  // ── activation gate → flips draft → active ──
  const onActivate = useCallback(() => setGateOpen(true), []);
  const confirmActivation = useCallback(() => {
    setGateOpen(false);
    setActivated(true);
    push({
      id: uid(),
      role: 'asst',
      content: (
        <>
          Your agent is <strong>live</strong>. It&apos;s watching {DEMO_AGENT.nodes.find((n) => n.id === 'price')?.params.asset as string}{' '}
          now — I&apos;ll notify you the first time it fires. You can pause it anytime from the card.
        </>
      ),
    });
  }, [push]);

  // ── natural-language edit from the composer ──
  const send = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    push({ id: uid(), role: 'user', text });
    const res = applyNL(text);
    setTimeout(() => {
      if (res) {
        push({
          id: uid(),
          role: 'asst',
          content: (
            <>
              Updated <strong>{res.label.toLowerCase()}</strong> to <strong>{res.formatted}</strong>.
            </>
          ),
        });
      } else {
        push({
          id: uid(),
          role: 'asst',
          content:
            'I can change the drop %, buy amount, weekly cap, notifications, schedule, or order type — what would you like to adjust?',
          stream: true,
        });
      }
    }, 350);
  }, [draft, applyNL, push]);

  const jumpToCard = () => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <div className={s.app}>
      <header className={s.bar}>
        <button className={s.back} aria-label="Back">
          <CaretLeft size={18} />
        </button>
        <div className={s.ttl}>
          <span>{agentName}</span>
          <CaretDown className={s.cr} size={14} />
        </div>
        <span className={s.sp} />
        <button className={s.hb} aria-label="New chat">
          <PencilSimpleLine size={16} />
        </button>
      </header>

      <div className={s.threadWrap}>
        <div className={s.thread} ref={logRef} onScroll={onScroll}>
          <div className={s.threadInner}>
            {msgs.map((m) => (
              <MsgRow
                key={m.id}
                m={m}
                cardRef={m.role === 'card' ? cardRef : undefined}
                agentName={agentName}
                nodes={nodes}
                changed={changed}
                cardLive={cardLive}
                activated={activated}
                onPick={(idx) => resolvers.current[m.id]?.(idx)}
                onRename={setAgentName}
                onEdit={onEdit}
                onActivate={onActivate}
              />
            ))}
          </div>
        </div>

        <ActivationGate
          open={gateOpen}
          agentName={agentName}
          nodes={nodes}
          onClose={() => setGateOpen(false)}
          onConfirm={confirmActivation}
        />

        {cardOffscreen && cardLive && (
          <button className={s.jumpPill} onClick={jumpToCard}>
            <span className={s.jumpDot} />
            {agentName}
            <CaretDown size={14} />
          </button>
        )}

        <div className={s.composer}>
          <div className={s.cfield}>
            <textarea
              rows={1}
              placeholder="Type to refine, or edit the card above…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <div className={s.crow}>
              <span className={s.mic}>
                <Microphone size={16} />
              </span>
              <button className={s.send} onClick={send} aria-label="Send">
                <ArrowUp size={15} />
              </button>
            </div>
          </div>
          <div className={s.disc}>AI assistants might make mistakes. Check important information.</div>
        </div>
      </div>
    </div>
  );
}

function MsgRow({
  m,
  cardRef,
  agentName,
  nodes,
  changed,
  cardLive,
  activated,
  onPick,
  onRename,
  onEdit,
  onActivate,
}: {
  m: Msg;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  agentName: string;
  nodes: import('../nodes/types').NodeInstance[];
  changed: string | null;
  cardLive: boolean;
  activated: boolean;
  onPick: (idx: number) => void;
  onRename: (v: string) => void;
  onEdit: (row: CardRow, v: ParamValue) => void;
  onActivate: () => void;
}) {
  if (m.role === 'user') return <div className={`${s.user} ${s.enter}`}>{m.text}</div>;

  if (m.role === 'asst')
    return (
      <div className={`${s.asst} ${s.enter}`}>
        {m.stream && typeof m.content === 'string' ? <TypewriterText text={m.content} speed={12} /> : m.content}
      </div>
    );

  if (m.role === 'trace')
    return (
      <div className={`${s.trace} ${s.enter}`}>
        <span className={m.done ? s.traceDone : s.traceActive}>
          {m.done ? 'Drafted your agent' : m.label}
        </span>
      </div>
    );

  if (m.role === 'chips')
    return (
      <div className={`${s.chips} ${s.enter}`}>
        {m.options.map((o, i) => (
          <button
            key={o}
            className={`${s.chip} ${i === m.picked ? s.chipHint : ''}`}
            onClick={() => onPick(i)}
          >
            {o}
          </button>
        ))}
      </div>
    );

  // card
  return (
    <div className={`${s.cardEnter}`} ref={cardRef}>
      <AgentCard
        name={agentName}
        nodes={nodes}
        changed={changed}
        readOnly={!m.live || activated}
        assemble={m.live}
        activated={activated && m.live}
        onRename={cardLive && !activated ? onRename : undefined}
        onEdit={onEdit}
        onActivate={onActivate}
      />
    </div>
  );
}
