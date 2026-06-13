'use client';

import { useEffect, useRef, useState } from 'react';
import type { Node } from '@xyflow/react';
import {
  CheckCircle,
  CircleNotch,
  Circle,
  CaretDown,
  ClockCounterClockwise,
  Clock,
  GitBranch,
  Bell,
  X,
  type Icon,
} from '@phosphor-icons/react';
import s from './build.module.css';
import { CATALOG_BY_ID } from '../nodes/catalog';
import { CATEGORY_META, type NodeCategory, type NodeTypeId } from '../nodes/types';

type RunStatus = 'pending' | 'running' | 'done';

type RunStep = {
  id: string;
  label: string;
  tag: string;
  Icon: Icon;
  detail: string;
  status: RunStatus;
  time?: string;
};

const TAG_PREFIX: Record<NodeCategory, string> = {
  trigger: 'trg',
  data: 'data',
  logic: 'if',
  action: 'act',
  notify: 'ntf',
};

/* derive a run-step descriptor from a canvas node */
function describe(node: Node, seen: Record<string, number>): Omit<RunStep, 'status' | 'time'> {
  const data = node.data as {
    title?: string;
    desc?: string;
    typeId?: NodeTypeId;
  };
  const tag = (prefix: string) => {
    const n = seen[prefix] ?? 0;
    seen[prefix] = n + 1;
    return `${prefix}-${n}`;
  };

  if (node.type === 'catalog' && data.typeId) {
    const def = CATALOG_BY_ID[data.typeId];
    return {
      id: node.id,
      label: def?.label ?? 'Step',
      Icon: def?.icon ?? Circle,
      tag: tag(def ? TAG_PREFIX[def.category] : 'node'),
      detail: def?.description ?? '',
    };
  }
  if (node.type === 'trigger') {
    return {
      id: node.id,
      label: 'Schedule trigger',
      Icon: Clock,
      tag: tag('trg'),
      detail: data.desc ?? data.title ?? '',
    };
  }
  if (node.type === 'branch') {
    return {
      id: node.id,
      label: data.title ?? 'Condition',
      Icon: GitBranch,
      tag: tag('cond'),
      detail: data.desc ?? '',
    };
  }
  return {
    id: node.id,
    label: data.title ?? 'Notification',
    Icon: Bell,
    tag: tag('ntf'),
    detail: data.desc ?? '',
  };
}

function catColor(node: Node): string {
  const data = node.data as { typeId?: NodeTypeId };
  if (node.type === 'catalog' && data.typeId) {
    const def = CATALOG_BY_ID[data.typeId];
    if (def) return CATEGORY_META[def.category].color;
  }
  return 'var(--color-fg-secondary-700)';
}

export default function RunProgress({
  nodes,
  running,
  onComplete,
  onClose,
}: {
  nodes: Node[];
  running: boolean;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [steps, setSteps] = useState<RunStep[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [shown, setShown] = useState(false);
  const colors = useRef<Record<string, string>>({});

  // slide in on mount
  useEffect(() => {
    const r = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(r);
  }, []);

  // build steps + step through them whenever a run starts
  useEffect(() => {
    if (!running) return;
    const ordered = [...nodes].sort((a, b) => a.position.y - b.position.y);
    const seen: Record<string, number> = {};
    colors.current = {};
    const built: RunStep[] = ordered.map((n) => {
      colors.current[n.id] = catColor(n);
      return { ...describe(n, seen), status: 'pending' as RunStatus };
    });
    setSteps(built);
    if (!built.length) {
      onComplete();
      return;
    }

    let i = 0;
    let stepTimer: ReturnType<typeof setTimeout>;
    const advance = () => {
      if (i >= built.length) {
        onComplete();
        return;
      }
      setSteps((prev) => prev.map((st, idx) => (idx === i ? { ...st, status: 'running' } : st)));
      const dur = 500 + Math.round(Math.random() * 800);
      stepTimer = setTimeout(() => {
        setSteps((prev) =>
          prev.map((st, idx) =>
            idx === i ? { ...st, status: 'done', time: `${(dur / 1000).toFixed(1)}s` } : st,
          ),
        );
        i += 1;
        advance();
      }, dur);
    };
    const start = setTimeout(advance, 280);
    return () => {
      clearTimeout(start);
      clearTimeout(stepTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return (
    <div className={`${s.runPanel} ${shown ? s.runPanelOpen : ''}`}>
      <header className={s.runHead}>
        <span className={s.runTitle}>Run progress</span>
        <button className={s.runHeadBtn} aria-label="Run history">
          <ClockCounterClockwise size={18} />
        </button>
        <button className={s.runHeadBtn} onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </header>

      <div className={s.runList}>
        {steps.map((step, idx) => {
          const StepIcon = step.Icon;
          const isOpen = !!open[step.id];
          return (
            <div className={s.runItem} key={step.id}>
              <div className={s.runRail}>
                <span className={s.runRailIcon} style={{ color: colors.current[step.id] }}>
                  <StepIcon size={18} />
                </span>
                {idx < steps.length - 1 && <span className={s.runRailLine} />}
              </div>

              <div className={s.runCard}>
                <button
                  className={s.runRow}
                  onClick={() => setOpen((o) => ({ ...o, [step.id]: !o[step.id] }))}
                >
                  <span className={s.runStatus}>
                    {step.status === 'done' ? (
                      <CheckCircle size={20} weight="fill" className={s.runStatusDone} />
                    ) : step.status === 'running' ? (
                      <CircleNotch size={20} className={s.runStatusSpin} />
                    ) : (
                      <Circle size={20} className={s.runStatusPending} />
                    )}
                  </span>
                  <span className={s.runLabel}>{step.label}</span>
                  <span className={s.runTag}>{step.tag}</span>
                  <span className={s.sp} />
                  {step.time && <span className={s.runTime}>{step.time}</span>}
                  <CaretDown
                    size={16}
                    className={`${s.runChevron} ${isOpen ? s.runChevronOpen : ''}`}
                  />
                </button>
                <div className={`${s.collapse} ${isOpen ? s.collapseOpen : ''}`}>
                  <div>
                    <div className={s.runDetail}>
                      {step.detail || 'No additional output for this step.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
