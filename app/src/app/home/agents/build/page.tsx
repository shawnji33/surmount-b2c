'use client';

import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Brain,
  BookOpen,
  MagnifyingGlass,
  Database,
  Wrench,
  Target,
  CaretLeft,
  CaretDown,
  CaretRight,
  ShareNetwork,
  PencilSimpleLine,
  X,
  Microphone,
  ArrowUp,
  Check,
  Question,
  Play,
  Stop,
} from '@phosphor-icons/react';
import BuildCanvas from './BuildCanvas';
import ExecutionHistory from './ExecutionHistory';
import { TypewriterText } from '@/components/chat/TypewriterText';
import s from './build.module.css';

/* ── thinking-step icons — official Phosphor (regular weight) ── */
const Icons: Record<string, ReactNode> = {
  brain: <Brain size={16} />,
  search: <MagnifyingGlass size={15} />,
  book: <BookOpen size={15} />,
  db: <Database size={15} />,
  build: <Wrench size={15} />,
  scan: <Target size={15} />,
  help: <Question size={15} />,
};

type Step = [icon: keyof typeof Icons | string, txt: string, sub?: number];

type PhaseStep =
  | { k: 'step'; icon: string; txt: string; sub?: boolean }
  | { k: 'wait' }
  | { k: 'input'; q: string; a: string; open: boolean };

type LogItem =
  | { id: number; kind: 'user'; text: string }
  | { id: number; kind: 'asst'; content: ReactNode; dim?: boolean; stream?: boolean }
  | { id: number; kind: 'typing' }
  | {
      id: number;
      kind: 'phase';
      title: string;
      steps: PhaseStep[];
      done: boolean;
      startedAt: number;
      elapsed: number;
      collapsed: boolean;
    }
  | { id: number; kind: 'followup'; q: string; opts: string[]; pickedIdx: number; chosenIdx: number | null };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function BuildPage() {
  const [items, setItems] = useState<LogItem[]>([]);
  const [canvasPhase, setCanvasPhase] = useState<'empty' | 'ghost' | 'live'>('empty');
  const [showApproval, setShowApproval] = useState(false);
  const [title, setTitle] = useState('New agent');
  const [saved, setSaved] = useState('');

  const logRef = useRef<HTMLDivElement>(null);
  const runRef = useRef(0); // current run id — bumping it cancels a running flow
  const idRef = useRef(0);
  const resolvers = useRef<Record<number, (idx: number) => void>>({});
  const captureRef = useRef(false); // Figma-capture mode → fast-forward to final state
  const finalizeRef = useRef<(run: number) => void>(() => {});

  const uid = () => ++idRef.current;
  const stale = (run: number) => run !== runRef.current;
  // skip the scripted delays when capturing for Figma
  const W = useCallback((ms: number) => (captureRef.current ? Promise.resolve() : wait(ms)), []);

  const push = useCallback((item: LogItem) => setItems((p) => [...p, item]), []);
  const update = useCallback(
    (id: number, patch: Partial<LogItem>) =>
      setItems((p) => p.map((it) => (it.id === id ? ({ ...it, ...patch } as LogItem) : it))),
    [],
  );

  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [topTab, setTopTab] = useState<'workflow' | 'history'>('workflow');
  const [running, setRunning] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const onLogScroll = useCallback(() => {
    const el = logRef.current;
    if (el) setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 60);
  }, []);
  const scrollToBottom = useCallback(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    setAtBottom(true);
  }, []);

  // auto-scroll only when already near the bottom (don't yank the user up-thread)
  useEffect(() => {
    const el = logRef.current;
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 120) {
      el.scrollTop = el.scrollHeight;
    }
  }, [items]);

  // ── chain-of-thought phase helpers (live, appendable steps) ──
  const addPhase = useCallback(
    (title: string) => {
      const id = uid();
      push({ id, kind: 'phase', title, steps: [], done: false, startedAt: Date.now(), elapsed: 0, collapsed: false });
      return id;
    },
    [push],
  );

  const appendStep = useCallback(
    (pid: number, step: PhaseStep) =>
      setItems((p) =>
        p.map((it) => (it.id === pid && it.kind === 'phase' ? { ...it, steps: [...it.steps, step] } : it)),
      ),
    [],
  );

  const addStep = useCallback(
    async (run: number, pid: number, step: PhaseStep) => {
      appendStep(pid, step);
      await W(360 + Math.random() * 320);
      return !stale(run);
    },
    [appendStep, W],
  );

  const finishPhase = useCallback(
    (run: number, pid: number) => {
      setItems((p) =>
        p.map((it) =>
          it.id === pid && it.kind === 'phase'
            ? { ...it, done: true, elapsed: Math.max(1, Math.round((Date.now() - it.startedAt) / 1000)) }
            : it,
        ),
      );
      if (!captureRef.current) {
        setTimeout(() => {
          if (!stale(run))
            setItems((p) =>
              p.map((it) => (it.id === pid && it.kind === 'phase' ? { ...it, collapsed: true } : it)),
            );
        }, 700);
      }
    },
    [],
  );

  // wait → input: append a "Waiting for input…" step, then swap it for the answered input
  const addWait = useCallback(
    (pid: number) => appendStep(pid, { k: 'wait' }),
    [appendStep],
  );
  const resolveInput = useCallback(
    (pid: number, q: string, a: string) =>
      setItems((p) =>
        p.map((it) =>
          it.id === pid && it.kind === 'phase'
            ? { ...it, steps: it.steps.map((st) => (st.k === 'wait' ? { k: 'input' as const, q, a, open: false } : st)) }
            : it,
        ),
      ),
    [],
  );
  const toggleInput = useCallback(
    (pid: number, idx: number) =>
      setItems((p) =>
        p.map((it) =>
          it.id === pid && it.kind === 'phase'
            ? { ...it, steps: it.steps.map((st, i) => (i === idx && st.k === 'input' ? { ...st, open: !st.open } : st)) }
            : it,
        ),
      ),
    [],
  );

  // simple phase (no inputs) — used for the build + closing phases
  const streamPhase = useCallback(
    async (run: number, phaseTitle: string, steps: Step[]) => {
      const pid = addPhase(phaseTitle);
      for (const [icon, txt, sub] of steps) {
        if (!(await addStep(run, pid, { k: 'step', icon, txt, sub: !!sub }))) return;
      }
      finishPhase(run, pid);
    },
    [addPhase, addStep, finishPhase],
  );

  // typing indicator → assistant message (assistant-ui loading pattern)
  const say = useCallback(
    async (run: number, content: ReactNode, dim = false) => {
      const stream = !captureRef.current && typeof content === 'string';
      if (!captureRef.current) {
        const tid = uid();
        push({ id: tid, kind: 'typing' });
        await W(600);
        if (stale(run)) return;
        setItems((p) => p.filter((it) => it.id !== tid));
      }
      push({ id: uid(), kind: 'asst', content, dim, stream });
    },
    [push, W],
  );

  const togglePhase = useCallback(
    (id: number) =>
      setItems((p) =>
        p.map((it) => (it.id === id && it.kind === 'phase' ? { ...it, collapsed: !it.collapsed } : it)),
      ),
    [],
  );

  const askFollowup = useCallback(
    (run: number, q: string, opts: string[], pickedIdx: number) => {
      const id = uid();
      push({ id, kind: 'followup', q, opts, pickedIdx, chosenIdx: null });
      return new Promise<string>((resolve) => {
        resolvers.current[id] = (idx: number) => {
          if (stale(run)) return;
          // the answer is tracked in the thinking process, so remove the card
          setItems((p) => p.filter((it) => it.id !== id));
          resolve(opts[idx]);
        };
        // in Figma-capture mode, auto-pick the hinted option
        if (captureRef.current) queueMicrotask(() => resolvers.current[id]?.(pickedIdx));
      });
    },
    [push],
  );

  const runFlow = useCallback(
    async (run: number) => {
      setItems([]);
      setCanvasPhase('empty');
      setShowApproval(false);
      setTitle('New agent');
      setSaved('');
      resolvers.current = {};

      push({ id: uid(), kind: 'user', text: 'Buy NVDA when it drops' });
      await W(700);
      if (stale(run)) return;
      await say(
        run,
        "I'll help you build an agent that monitors NVDA's price and automatically buys when it drops. Let me plan the workflow — I'll route this to the Planner first to design the structure.",
        true,
      );
      if (stale(run)) return;
      await W(800);
      if (stale(run)) return;

      // ── Planning phase — streams steps, pauses for input, tracks answers ──
      const pid = addPhase('Planning your automated stock trading workflow…');
      const S = (step: PhaseStep) => addStep(run, pid, step);
      if (!(await S({ k: 'step', icon: 'brain', txt: 'Planning' }))) return;
      if (!(await S({ k: 'step', icon: 'book', txt: 'Checking connections', sub: true }))) return;
      if (!(await S({ k: 'step', icon: 'search', txt: 'Found 10 actions for "stock price quote"', sub: true }))) return;
      if (!(await S({ k: 'step', icon: 'search', txt: 'Found 15 actions for "buy stock trade order alpaca"', sub: true }))) return;
      if (!(await S({ k: 'step', icon: 'search', txt: 'Found 4 triggers for "schedule cron periodic"', sub: true }))) return;
      if (!(await S({ k: 'step', icon: 'search', txt: 'Found 2 actions for "alpaca robinhood interactive brokers trading"', sub: true }))) return;
      if (!(await S({ k: 'step', icon: 'search', txt: 'Found 0 actions for "yahoo finance ticker"', sub: true }))) return;
      if (!(await S({ k: 'step', icon: 'search', txt: 'Found 3 actions for "yahoo finance ticker"', sub: true }))) return;

      // Follow-up 1
      addWait(pid);
      const drop = await askFollowup(
        run,
        'Got it — a dip-buying agent on NVDA. How big a drop should trigger a buy?',
        ['Drops 2% in a day', 'Drops 5% in a day', 'Drop vs. its recent high', 'Something else'],
        1,
      );
      if (stale(run)) return;
      resolveInput(pid, 'How big a drop should trigger a buy?', drop);
      if (!(await S({ k: 'step', icon: 'book', txt: 'Using previous close as the reference', sub: true }))) return;

      // Follow-up 2
      addWait(pid);
      const amt = await askFollowup(
        run,
        'How much should I buy each time it dips 5%?',
        ['$500', '$1,000', '$2,000', 'Enter an amount'],
        2,
      );
      if (stale(run)) return;
      resolveInput(pid, 'How much should I buy each time it dips?', amt);

      // Follow-up 3
      addWait(pid);
      const cap = await askFollowup(
        run,
        "Smart to cap how much this deploys so it doesn't overextend on a rough week. Want a weekly limit?",
        ['$4,000 / week', '$6,000 / week', 'No cap', 'Custom'],
        0,
      );
      if (stale(run)) return;
      resolveInput(pid, 'Want a weekly limit?', cap);

      if (!(await S({ k: 'step', icon: 'brain', txt: 'Designing the workflow structure', sub: true }))) return;
      if (!(await S({ k: 'step', icon: 'book', txt: 'Writing the plan', sub: true }))) return;
      finishPhase(run, pid);
      await W(400);
      if (stale(run)) return;

      const amtTxt = amt.startsWith('$') ? amt : '$2,000';
      const capTxt = cap.includes('/') ? cap : '$4,000 / week';
      await say(
        run,
        (
          <>
            Locked in — buy <strong>{amtTxt}</strong> of NVDA on a <strong>5% daily drop</strong>, capped at{' '}
            <strong>{capTxt}</strong>. I&apos;ll email you each time it fires.
          </>
        ),
        true,
      );
      if (stale(run)) return;
      await W(700);
      if (stale(run)) return;

      await streamPhase(run, 'Now building your NVDA price-drop detection and auto-buy agent…', [
        ['build', 'Building'],
        ['book', 'Reading the plan', 1],
        ['db', 'Reading node schemas', 1],
        ['db', 'Querying node schemas', 1],
        ['build', 'Wiring trigger → price check', 1],
        ['build', 'Adding conditional buy logic', 1],
        ['build', 'Configuring notifications', 1],
        ['scan', 'Generating workflow', 1],
        ['scan', 'Validating connections', 1],
      ]);
      if (stale(run)) return;
      await W(400);
      if (stale(run)) return;

      // ghost the workflow onto the canvas, then reveal the approval bar
      setCanvasPhase('ghost');
      await W(1100);
      if (stale(run)) return;
      setShowApproval(true);
      // in Figma-capture mode, auto-apply so we land on the final workflow
      if (captureRef.current) finalizeRef.current(run);
    },
    [push, streamPhase, askFollowup, say, addPhase, addStep, addWait, resolveInput, finishPhase],
  );

  const finalizeWorkflow = useCallback(
    async (run: number) => {
      setShowApproval(false);
      setTitle('Buy NVIDIA when it drops 5%');
      setSaved('· Saved');
      setCanvasPhase('live');
      await W(900);
      if (stale(run)) return;
      await say(
        run,
        (
          <>
            <p>
              Done — I built a <strong>“buy the dip”</strong> automation for NVDA. Here&rsquo;s what it does:
            </p>
            <ul>
              <li>
                Triggers when NVDA drops <strong>5% intraday</strong> (or 8% in a week)
              </li>
              <li>Only fires if RSI is oversold and cash is available</li>
              <li>
                Buys <strong>$2,000 of NVDA</strong> at market
              </li>
              <li>Notifies you on execution</li>
            </ul>
            <p>Tap any step to see its details, or tell me what to change.</p>
          </>
        ),
      );
      if (stale(run)) return;
      await streamPhase(run, '', [
        ['build', 'Building'],
        ['scan', 'Inspecting current workflow', 1],
        ['search', 'Found 3 actions for "send email"', 1],
        ['db', 'Reading connections', 1],
        ['db', 'Reading action node schema', 1],
        ['scan', 'Inspecting out-0 node', 1],
      ]);
    },
    [streamPhase, say],
  );

  // keep a live ref to finalizeWorkflow so runFlow can auto-apply in capture mode
  finalizeRef.current = finalizeWorkflow;

  const replay = useCallback(() => {
    const run = ++runRef.current;
    runFlow(run);
  }, [runFlow]);

  // start on mount; cleanup bumps runRef so StrictMode's first pass is cancelled
  useEffect(() => {
    captureRef.current =
      typeof window !== 'undefined' && window.location.hash.includes('figmacapture');
    const run = ++runRef.current;
    runFlow(run);
    return () => {
      runRef.current++;
    };
  }, [runFlow]);

  return (
    <div className={s.app}>
      {/* top bar */}
      <header className={s.top}>
        <button className={s.back}>
          <CaretLeft size={18} />
        </button>
        <div className={s.ttl}>
          <span>{title}</span>
          <CaretDown className={s.cr} size={14} />
        </div>
        {saved && <span className={s.saved}>{saved}</span>}
        <div className={s.seg}>
          <button
            className={topTab === 'workflow' ? s.segBtnActive : s.segBtn}
            onClick={() => setTopTab('workflow')}
          >
            Workflow
          </button>
          <button
            className={topTab === 'history' ? s.segBtnActive : s.segBtn}
            onClick={() => setTopTab('history')}
          >
            Execution history
          </button>
        </div>
        <div className={s.sp} />
        <span className={s.toggle}>
          <span className={s.d} />
          Off
          <span className={s.sw} />
        </span>
        <button className={`${s.tbtn} ${s.share}`}>
          <ShareNetwork size={14} />
          Share
        </button>
        <button
          className={`${s.tbtn} ${running ? s.stopRun : s.activate}`}
          onClick={() => {
            if (running) {
              setRunning(false);
            } else {
              setTopTab('workflow');
              setRunning(true);
            }
          }}
        >
          {running ? (
            <>
              <Stop size={12} weight="fill" />
              Stop
            </>
          ) : (
            <>
              <Play size={12} weight="fill" />
              Test run
            </>
          )}
        </button>
      </header>

      <div className={s.bodyRow}>
        {/* chat panel */}
        <aside className={`${s.chat} ${chatCollapsed ? s.chatCollapsed : ''}`}>
          {/* hide tab on the right edge (Figma 1262:7730) */}
          <button className={s.chatCollapse} onClick={() => setChatCollapsed(true)} aria-label="Hide chat">
            <X size={16} />
          </button>
          <div className={s.chatHead}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={s.aiPill} src="/agent-canvas/surmount-ai-pill.svg" width={111} height={26} alt="Surmount AI" />
            <span className={s.sp} />
            <button className={s.hb}>
              <PencilSimpleLine size={16} />
            </button>
          </div>

          <div className={s.logWrap}>
            <div className={s.log} ref={logRef} onScroll={onLogScroll}>
              {items.map((it) => (
                <LogRow
                  key={it.id}
                  item={it}
                  onPick={(idx) => resolvers.current[it.id]?.(idx)}
                  onToggle={togglePhase}
                  onToggleInput={toggleInput}
                />
              ))}
            </div>
            {!atBottom && (
              <button className={s.scrollDown} onClick={scrollToBottom} aria-label="Scroll to bottom">
                <CaretDown size={18} />
              </button>
            )}
          </div>

          {showApproval && (
            <div className={s.approval}>
              <div>
                <div className={s.apprEyebrow}>Workflow Ready for Approval</div>
                <div className={s.apprTitle}>NVDA buy the dip</div>
              </div>
              <div className={s.apprActions}>
                <button className={s.apply} onClick={() => finalizeWorkflow(runRef.current)}>
                  <Check size={15} weight="bold" />
                  Apply Workflow
                </button>
                <button className={s.reject} onClick={() => setShowApproval(false)}>
                  <X size={14} />
                  Reject
                </button>
              </div>
            </div>
          )}

          <div className={s.composer}>
            <div className={s.cfield}>
              <textarea rows={1} placeholder="Write a message…" />
              <div className={s.crow}>
                <span className={s.mic}>
                  <Microphone size={16} />
                </span>
                <span className={s.send}>
                  <ArrowUp size={15} />
                </span>
              </div>
            </div>
            <div className={s.disc}>AI assistants might make mistakes. Check important information.</div>
          </div>
        </aside>

        {/* reopen tab on the far-left edge when the chat is hidden */}
        {chatCollapsed && (
          <button className={s.chatReopen} onClick={() => setChatCollapsed(false)} aria-label="Show chat">
            <CaretRight size={16} />
          </button>
        )}

        {/* right panel — workflow canvas or execution history */}
        {topTab === 'workflow' ? (
          <BuildCanvas
            live={canvasPhase !== 'ghost'}
            hasWorkflow={canvasPhase !== 'empty'}
            onReplay={replay}
            onOpenChat={() => setChatCollapsed(false)}
            running={running}
            onRunComplete={() => setRunning(false)}
          />
        ) : (
          <ExecutionHistory />
        )}
      </div>
    </div>
  );
}

/* ── one chat-log row ── */
function LogRow({
  item,
  onPick,
  onToggle,
  onToggleInput,
}: {
  item: LogItem;
  onPick: (idx: number) => void;
  onToggle: (id: number) => void;
  onToggleInput: (pid: number, idx: number) => void;
}) {
  if (item.kind === 'user') {
    return <div className={`${s.msgUser} ${s.enter}`}>{item.text}</div>;
  }
  if (item.kind === 'typing') {
    return (
      <div className={`${s.typing} ${s.enter}`} aria-label="Assistant is typing">
        <span /><span /><span />
      </div>
    );
  }
  if (item.kind === 'asst') {
    return (
      <div className={`${s.asst} ${s.enter} ${item.dim ? s.dim : ''}`}>
        {item.stream && typeof item.content === 'string' ? (
          <TypewriterText text={item.content} speed={12} />
        ) : (
          item.content
        )}
      </div>
    );
  }
  if (item.kind === 'phase') {
    const label = item.title || (item.done ? 'Thought process' : 'Thinking…');
    return (
      <Fragment>
        {item.done ? (
          <button
            className={s.phaseHead}
            onClick={() => onToggle(item.id)}
            aria-expanded={!item.collapsed}
          >
            <span className={s.phaseLabel}>{label}</span>
            <span className={s.phaseTime}>· {item.elapsed}s</span>
            <CaretDown
              className={`${s.phaseChevron} ${item.collapsed ? '' : s.phaseChevronOpen}`}
              size={14}
            />
          </button>
        ) : (
          <div className={`${s.phase} ${s.enter} ${s.active}`}>{label}</div>
        )}
        <div className={`${s.collapse} ${item.collapsed ? '' : s.collapseOpen}`}>
          <div>
          <div className={s.steps}>
            {item.steps.map((st, i) => {
              if (st.k === 'wait') {
                return (
                  <div key={i} className={`${s.step} ${s.enter} ${s.sub}`}>
                    <span className={s.si}>{Icons.help}</span>
                    <span className={s.stepWaitLabel}>Waiting for input…</span>
                  </div>
                );
              }
              if (st.k === 'input') {
                return (
                  <Fragment key={i}>
                    <button
                      className={`${s.step} ${s.sub} ${s.stepInput}`}
                      onClick={() => onToggleInput(item.id, i)}
                    >
                      <span className={s.si}>
                        <CaretDown
                          size={14}
                          className={`${s.stepInputChevron} ${st.open ? '' : s.stepInputChevronClosed}`}
                        />
                      </span>
                      <span className={s.stepInputLabel}>Input: {st.a}</span>
                    </button>
                    <div className={`${s.collapse} ${st.open ? s.collapseOpen : ''}`}>
                      <div>
                        <div className={s.inputDetail}>
                          <div className={s.inputRow}>
                            <span className={s.inputRowLabel}>Question</span>
                            <span className={s.inputRowValue}>{st.q}</span>
                          </div>
                          <div className={s.inputRow}>
                            <span className={s.inputRowLabel}>Answer</span>
                            <span className={s.inputRowValue}>{st.a}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Fragment>
                );
              }
              const isProc = !item.done && i === item.steps.length - 1;
              return (
                <div
                  key={i}
                  className={`${s.step} ${s.enter} ${st.sub ? s.sub : ''} ${isProc ? s.proc : ''}`}
                >
                  <span className={s.si}>{Icons[st.icon]}</span>
                  <span>{st.txt}</span>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      </Fragment>
    );
  }
  // follow-up question card with full-width stacked option buttons
  return (
    <div className={`${s.fcard} ${s.enter}`}>
      <div className={s.fq}>{item.q}</div>
      <div className={s.foptions}>
        {item.opts.map((o, i) => (
          <button
            key={i}
            className={`${s.fopt} ${i === item.pickedIdx ? s.hint : ''}`}
            onClick={() => onPick(i)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
