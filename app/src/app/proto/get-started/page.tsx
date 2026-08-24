'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { HomeShell } from '@/app/home/HomeShell';
import { Check, ArrowRight, Bank, LinkSimple, Compass, LockSimple, Sparkle } from '@phosphor-icons/react';
import s from './page.module.css';

type Task = { id: string; title: string; description: string; icon: typeof Bank; optional?: boolean };

const TASKS: Task[] = [
  { id: 'account', title: 'Choose an account', description: 'Open a Surmount account or link the brokerage you already use.', icon: Bank },
  { id: 'fund', title: 'Add money', description: 'Connect a bank and make a first deposit when you’re ready.', icon: LinkSimple },
  { id: 'strategy', title: 'Choose a strategy', description: 'Browse strategies designed around the way you want to invest.', icon: Compass },
];

function ActionButton({ onClick, complete, children }: { onClick: () => void; complete: boolean; children: ReactNode }) {
  return (
    <button type="button" className={complete ? s.actionComplete : s.actionButton} onClick={onClick}>
      {complete ? <><Check weight="bold" aria-hidden="true" /> Complete</> : <>{children}<ArrowRight weight="bold" aria-hidden="true" /></>}
    </button>
  );
}

function GuidedPath() {
  const [route, setRoute] = useState<'surmount' | 'brokerage' | null>(null);
  const [funded, setFunded] = useState(false);
  const [strategy, setStrategy] = useState(false);
  const completed = (route ? 1 : 0) + (funded ? 1 : 0) + (strategy ? 1 : 0);
  const next = !route ? 'Choose an account' : !funded ? 'Add money' : !strategy ? 'Choose your first strategy' : 'You’re ready to invest';

  return <section className={s.surface} aria-label="Guided path checklist">
    <header className={s.pageHeader}>
      <p className={s.eyebrow}>Getting ready to invest</p>
      <h1>One good decision<br />at a time.</h1>
      <p className={s.intro}>Set up the investing path that fits you. You can always add another account later.</p>
    </header>
    <div className={s.guidedLayout}>
      <section className={s.routePanel}>
        <div className={s.routePanelTop}><span>Step 1 of 3</span><span>{completed}/3 complete</span></div>
        <h2>How would you like to start?</h2>
        <div className={s.routeChoices}>
          <button type="button" className={[s.routeChoice, route === 'surmount' ? s.routeChoiceSelected : ''].join(' ')} onClick={() => setRoute('surmount')}>
            <span className={s.routeIcon}><Bank weight="regular" /></span><span><strong>Open a Surmount account</strong><small>Invest directly with Surmount</small></span>{route === 'surmount' && <Check weight="bold" aria-label="Selected" />}
          </button>
          <button type="button" className={[s.routeChoice, route === 'brokerage' ? s.routeChoiceSelected : ''].join(' ')} onClick={() => setRoute('brokerage')}>
            <span className={s.routeIcon}><LinkSimple weight="regular" /></span><span><strong>Connect a brokerage</strong><small>Bring in the account you use today</small></span>{route === 'brokerage' && <Check weight="bold" aria-label="Selected" />}
          </button>
        </div>
        {route && <p className={s.selectionNote}><Check weight="bold" aria-hidden="true" /> {route === 'surmount' ? 'A Surmount account is selected.' : 'Brokerage connection is selected.'}</p>}
      </section>
      <aside className={s.nextPanel}>
        <p className={s.nextLabel}>Up next</p><h2>{next}</h2>
        <div className={s.miniProgress}><span style={{ width: `${completed / 3 * 100}%` }} /></div>
        <ol className={s.miniSteps}>{TASKS.map((task, index) => { const done = index === 0 ? !!route : index === 1 ? funded : strategy; return <li key={task.id} data-done={done}><span>{done ? <Check weight="bold" /> : index + 1}</span>{task.title}</li>; })}</ol>
        {route && <ActionButton complete={funded} onClick={() => setFunded(!funded)}>{route === 'surmount' ? 'Connect your bank' : 'Confirm brokerage connection'}</ActionButton>}
        {funded && <ActionButton complete={strategy} onClick={() => setStrategy(!strategy)}>Explore strategies</ActionButton>}
      </aside>
    </div>
  </section>;
}

function CommandCenter() {
  const [done, setDone] = useState<string[]>([]);
  const toggle = (id: string) => setDone((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  const nextTask = TASKS.find((task) => !done.includes(task.id));
  return <section className={s.surface} aria-label="Command center checklist">
    <header className={s.commandHeader}><div><p className={s.eyebrow}>Your investing setup</p><h1>Get ready to invest</h1><p className={s.intro}>Complete the essentials, then let your money do more.</p></div><div className={s.completionRing} style={{ '--progress': `${done.length / TASKS.length * 360}deg` } as React.CSSProperties}><span>{done.length}<small>/ {TASKS.length}</small></span></div></header>
    <div className={s.commandLayout}>
      <section className={s.taskTable}><div className={s.sectionHeading}><h2>Your checklist</h2><span>{done.length === TASKS.length ? 'All set' : 'Required to start'}</span></div>{TASKS.map((task, i) => { const Icon = task.icon; const isDone = done.includes(task.id); const isActive = nextTask?.id === task.id; return <article className={s.tableTask} key={task.id} data-active={isActive} data-done={isDone}><button type="button" aria-label={`${isDone ? 'Mark incomplete' : 'Mark complete'}: ${task.title}`} className={s.taskCheck} onClick={() => toggle(task.id)}>{isDone && <Check weight="bold" />}</button><span className={s.tableIcon}><Icon weight="regular" /></span><div><h3>{task.title}</h3><p>{task.description}</p></div><ActionButton complete={isDone} onClick={() => toggle(task.id)}>{isActive ? 'Continue' : 'Review'}</ActionButton>{i < TASKS.length - 1 && <span className={s.tableDivider} />}</article>; })}</section>
      <aside className={s.stickyAction}><p className={s.nextLabel}>Recommended next step</p><div className={s.sparkle}><Sparkle weight="fill" /></div><h2>{nextTask?.title ?? 'You’re ready to invest'}</h2><p>{nextTask?.description ?? 'Your account is ready for its first strategy.'}</p><ActionButton complete={!nextTask} onClick={() => nextTask && toggle(nextTask.id)}>{nextTask ? 'Continue setup' : 'Explore marketplace'}</ActionButton><span className={s.securityLine}><LockSimple weight="regular" /> Your progress is saved automatically</span></aside>
    </div>
  </section>;
}

function GoalBoard() {
  const [done, setDone] = useState<string[]>([]);
  const toggle = (id: string) => setDone((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  const allDone = done.length === TASKS.length;
  return <section className={s.surface} aria-label="Goal board checklist">
    <div className={s.goalHero}><div><p className={s.eyebrow}>Your first milestone</p><h1>Make your first<br />investment.</h1><p>Everything you need to go from curious to invested—without losing your place.</p></div><div className={s.goalStatus}><span className={s.goalNumber}>{done.length}<small> of 3</small></span><span>milestones complete</span></div></div>
    <section className={s.board}><div className={s.boardHeading}><div><h2>Your path to investing</h2><p>Finish these in any order. We’ll keep the momentum visible.</p></div><span className={s.boardStatus}>{allDone ? 'Ready to explore' : 'In progress'}</span></div><div className={s.milestoneGrid}>{TASKS.map((task, index) => { const Icon = task.icon; const isDone = done.includes(task.id); return <article className={s.milestone} key={task.id} data-done={isDone}><span className={s.milestoneNumber}>{isDone ? <Check weight="bold" /> : `0${index + 1}`}</span><span className={s.milestoneIcon}><Icon weight="regular" /></span><h3>{task.title}</h3><p>{task.description}</p><ActionButton complete={isDone} onClick={() => toggle(task.id)}>{index === 0 ? 'Choose a path' : index === 1 ? 'Add money' : 'Find a strategy'}</ActionButton></article>; })}</div></section>
    <div className={s.boardFooter}><span><Check weight="bold" /> You can change your setup anytime.</span><button type="button" onClick={() => setDone(TASKS.map((task) => task.id))}>Preview completed state</button></div>
  </section>;
}

const VARIANTS = [
  { name: 'Guided path', render: () => <GuidedPath /> },
  { name: 'Command center', render: () => <CommandCenter /> },
  { name: 'Goal board', render: () => <GoalBoard /> },
];

export default function GetStartedPrototypePage() {
  const [active, setActive] = useState(0);
  const [remount, setRemount] = useState(0);
  const picker = useRef<HTMLElement>(null);
  const highlight = useRef<HTMLSpanElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const moveHighlight = () => { const el = items.current[active]; if (el && highlight.current) { highlight.current.style.width = `${el.offsetWidth}px`; highlight.current.style.transform = `translateX(${el.offsetLeft}px)`; } };
  useLayoutEffect(moveHighlight, [active]);
  useEffect(() => {
    const fromUrl = Math.max(0, Math.min(VARIANTS.length - 1, Number(new URLSearchParams(window.location.search).get('v') || '1') - 1));
    setActive(fromUrl);
  }, []);
  useEffect(() => { requestAnimationFrame(() => requestAnimationFrame(() => picker.current?.setAttribute('data-ready', ''))); const onResize = () => moveHighlight(); window.addEventListener('resize', onResize); return () => window.removeEventListener('resize', onResize); }, []);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { const target = event.target as HTMLElement; if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable || event.metaKey || event.ctrlKey || event.altKey) return; const next = event.key === 'ArrowRight' ? (active + 1) % VARIANTS.length : event.key === 'ArrowLeft' ? (active - 1 + VARIANTS.length) % VARIANTS.length : /^[1-3]$/.test(event.key) ? Number(event.key) - 1 : null; if (next !== null) selectVariant(next); if (event.key === 'r' || event.key === 'R') setRemount((n) => n + 1); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [active]);
  const selectVariant = (index: number) => { setActive(index); const url = new URL(window.location.href); url.searchParams.set('v', String(index + 1)); window.history.replaceState(null, '', url); };
  const Variant = VARIANTS[active].render;
  return <HomeShell><div className={s.prototypeShell}><div key={`${active}-${remount}`} className={s.stage}><Variant /></div><nav ref={picker} className="proto-picker" aria-label="Prototype variants"><span ref={highlight} className="proto-picker-highlight" aria-hidden="true" />{VARIANTS.map((variant, index) => <button key={variant.name} ref={(el) => { items.current[index] = el; }} className="proto-picker-item" data-active={active === index || undefined} aria-current={active === index ? 'true' : undefined} onClick={() => selectVariant(index)}>{variant.name}</button>)}<span className="proto-picker-divider" aria-hidden="true" /><button className="proto-picker-item proto-picker-replay" aria-label="Replay animation (R)" onClick={() => setRemount((n) => n + 1)}>↻</button></nav></div></HomeShell>;
}
