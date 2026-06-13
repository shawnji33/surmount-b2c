'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MagnifyingGlass, DotsSixVertical, SquaresFour } from '@phosphor-icons/react';
import { CATALOG } from '../nodes/catalog';
import { CATEGORY_META, CATEGORY_ORDER, type NodeCategory, type NodeTypeId } from '../nodes/types';
import s from './build.module.css';

type Tab = 'all' | NodeCategory;

export default function NodePicker({
  onPick,
  onClose,
}: {
  onPick: (id: NodeTypeId) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>('all');
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return CATALOG.filter((n) => {
      if (tab !== 'all' && n.category !== tab) return false;
      if (!query) return true;
      return (
        n.label.toLowerCase().includes(query) ||
        n.description.toLowerCase().includes(query) ||
        n.category.includes(query)
      );
    });
  }, [tab, q]);

  // group results by category for the "all" / searching view
  const groups = useMemo(() => {
    const map = new Map<NodeCategory, typeof CATALOG>();
    for (const n of results) {
      const arr = map.get(n.category) ?? [];
      arr.push(n);
      map.set(n.category, arr);
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({ category: c, nodes: map.get(c)! }));
  }, [results]);

  return (
    <div className={s.picker} ref={ref}>
      {/* left category rail */}
      <div className={s.pickerRail}>
        <button
          className={`${s.pickerRailBtn} ${tab === 'all' ? s.pickerRailActive : ''}`}
          onClick={() => setTab('all')}
          aria-label="All nodes"
        >
          <SquaresFour size={20} />
        </button>
        {CATEGORY_ORDER.map((c) => {
          const meta = CATEGORY_META[c];
          const Icon = CATALOG.find((n) => n.category === c)!.icon;
          return (
            <button
              key={c}
              className={`${s.pickerRailBtn} ${tab === c ? s.pickerRailActive : ''}`}
              onClick={() => setTab(c)}
              aria-label={meta.label}
              style={tab === c ? { color: meta.color } : undefined}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>

      {/* search + results */}
      <div className={s.pickerMain}>
        <div className={s.pickerSearch}>
          <MagnifyingGlass size={16} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search nodes…"
          />
        </div>
        <div className={s.pickerBody}>
          {groups.length === 0 && <div className={s.pickerEmpty}>No nodes match “{q}”.</div>}
          {groups.map((g) => {
            const meta = CATEGORY_META[g.category];
            return (
              <div key={g.category} className={s.pickerGroup}>
                <div className={s.pickerGroupTitle}>{meta.label}</div>
                {g.nodes.map((n) => {
                  const Icon = n.icon;
                  const disabled = !n.v1;
                  return (
                    <button
                      key={n.id}
                      className={`${s.pickerItem} ${disabled ? s.pickerItemDisabled : ''}`}
                      disabled={disabled}
                      onClick={() => {
                        onPick(n.id);
                        onClose();
                      }}
                    >
                      <span className={s.pickerItemIcon} style={{ background: meta.bg, color: meta.color }}>
                        <Icon size={15} />
                      </span>
                      <span className={s.pickerItemText}>
                        <span className={s.pickerItemName}>{n.label}</span>
                        <span className={s.pickerItemDesc}>{n.description}</span>
                      </span>
                      {disabled ? (
                        <span className={s.pickerSoon}>Soon</span>
                      ) : (
                        <DotsSixVertical size={16} className={s.pickerDrag} />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
