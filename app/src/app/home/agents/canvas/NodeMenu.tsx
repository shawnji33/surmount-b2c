'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useReactFlow, type Node } from '@xyflow/react';
import { DotsThreeVertical, Copy, Clipboard, Trash } from '@phosphor-icons/react';
import s from './canvas.module.css';
import { useNodeEdit } from './NodeEditContext';

/* Resolve the three actions from the history-aware context, falling back to
   React Flow directly (standalone /canvas route). */
function useNodeActions(id: string) {
  const ctx = useNodeEdit();
  const rf = useReactFlow();
  if (ctx) {
    return {
      duplicate: () => ctx.duplicate(id),
      copy: () => ctx.copy(id),
      remove: () => ctx.remove(id),
    };
  }
  return {
    duplicate: () => {
      const n = rf.getNode(id);
      if (!n) return;
      rf.addNodes({
        ...(n as Node),
        id: `${id}-copy-${Date.now()}`,
        position: { x: n.position.x + 40, y: n.position.y + 40 },
        selected: false,
      });
    },
    copy: () => {
      const n = rf.getNode(id);
      if (n) navigator.clipboard?.writeText(JSON.stringify(n)).catch(() => {});
    },
    remove: () => rf.deleteElements({ nodes: [{ id }] }),
  };
}

export function NodeMenu({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const actions = useNodeActions(id);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node2) && !btnRef.current?.contains(e.target as Node2)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    // capture phase — fires before React Flow stops propagation on canvas clicks,
    // so clicking anywhere outside the node/menu reliably closes it
    window.addEventListener('pointerdown', onDown, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const run = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
    setOpen(false);
  };

  return (
    <>
      <button
        ref={btnRef}
        className={`${s.kebab} ${open ? s.kebabOpen : ''} nodrag`}
        onClick={toggle}
        onMouseDown={(e) => e.stopPropagation()}
        aria-label="Node actions"
      >
        <DotsThreeVertical size={18} weight="bold" />
      </button>
      {open &&
        createPortal(
          <div ref={menuRef} className={s.nodeMenu} style={{ top: pos.top, right: pos.right }}>
            <button className={s.nodeMenuItem} onClick={run(actions.duplicate)}>
              <Copy size={16} />
              Duplicate
            </button>
            <button className={s.nodeMenuItem} onClick={run(actions.copy)}>
              <Clipboard size={16} />
              Copy
            </button>
            <div className={s.nodeMenuDivider} />
            <button className={`${s.nodeMenuItem} ${s.nodeMenuDanger}`} onClick={run(actions.remove)}>
              <Trash size={16} />
              Delete
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}

// local alias so the EventTarget contains() check stays typed without DOM lib churn
type Node2 = globalThis.Node;
