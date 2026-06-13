'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import s from './canvas.module.css';

type Props = {
  value: string;
  onCommit: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
};

/* Inline-editable text: hover shows a soft affordance; click swaps to a
   bordered field. Enter (or ⌘/Ctrl+Enter for multiline) or blur commits,
   Esc cancels. Carries React Flow's nodrag/nopan/nowheel so editing never
   drags the node or pans/zooms the canvas. */
export function EditableText({ value, onCommit, multiline, placeholder }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const autogrow = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useLayoutEffect(() => {
    if (!editing) return;
    const el = multiline ? areaRef.current : inputRef.current;
    if (!el) return;
    el.focus();
    const n = el.value.length;
    el.setSelectionRange(n, n);
    if (multiline) autogrow(el as HTMLTextAreaElement);
  }, [editing, multiline]);

  const start = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
  };
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const commit = () => {
    setEditing(false);
    const v = draft.trim();
    if (v && v !== value) onCommit(v);
    else setDraft(value);
  };
  const cancel = () => {
    setEditing(false);
    setDraft(value);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    } else if (e.key === 'Enter' && (!multiline || e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      commit();
    }
  };

  if (editing) {
    if (multiline) {
      return (
        <textarea
          ref={areaRef}
          rows={1}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => {
            setDraft(e.target.value);
            autogrow(e.target);
          }}
          onBlur={commit}
          onKeyDown={onKey}
          onMouseDown={stop}
          onClick={stop}
          className={`${s.editInput} ${s.editArea} nodrag nopan nowheel`}
        />
      );
    }
    return (
      <input
        ref={inputRef}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={onKey}
        onMouseDown={stop}
        onClick={stop}
        className={`${s.editInput} nodrag nopan nowheel`}
      />
    );
  }

  const Tag = multiline ? 'div' : 'span';
  return (
    <Tag className={`${s.editable} nodrag`} onClick={start} onMouseDown={stop} title="Click to edit">
      {value || <span className={s.editPlaceholder}>{placeholder}</span>}
    </Tag>
  );
}
