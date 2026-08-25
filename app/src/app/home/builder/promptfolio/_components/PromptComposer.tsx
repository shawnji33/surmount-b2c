'use client';

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { BorderBeam } from 'border-beam';
import { ArrowUp, FileArrowUp, Microphone, Paperclip, Plus, X } from '@phosphor-icons/react';
import { QUICK_START_TOPICS } from '../_data';
import s from './PromptComposer.module.css';

const DICTATION_TRANSCRIPT = 'Build me a strategy that buys the dip on volatile tech stocks';
const ATTACH_FILES = ['holdings-export.csv', 'brokerage-statement.pdf', 'portfolio-summary.xlsx'];

type Menu = 'attach' | 'slash' | null;

export type PromptComposerHandle = {
  /** Fills the textarea (matches the source prototype's fillPrompt — sets text and focuses,
   * doesn't submit) so ExamplePrompts can seed a click without the composer exposing its
   * internal value as a controlled prop. */
  fillPrompt: (text: string) => void;
};

export type PromptComposerAnnotation = {
  id: number;
  text: string;
};

/* the last /word being typed, if any */
function parseToken(draft: string): { kind: 'slash'; query: string; start: number } | null {
  const match = /(^|\s)\/([\w-]*)$/.exec(draft);
  if (!match) return null;
  return { kind: 'slash', query: match[2].toLowerCase(), start: match.index + match[1].length };
}

// Single pill bar by default; grows to a full-width text row with the controls pinned below it
// once typed text would overflow the inline space (measured, not guessed) — mirrors the reference
// composer's own wrap behavior, including its gliding highlight in the attach / slash menu.
export const PromptComposer = forwardRef<
  PromptComposerHandle,
  {
    size?: 'hero' | 'compact' | 'panel';
    placeholder?: string;
    annotations?: PromptComposerAnnotation[];
    onRemoveAnnotation?: (id: number) => void;
    onSubmit: (text: string) => void;
  }
>(function PromptComposer({
  size = 'hero',
  placeholder = 'Write a message…',
  annotations = [],
  onRemoveAnnotation,
  onSubmit,
}, ref) {
  const [value, setValue] = useState('');
  const [dismissed, setDismissed] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [listening, setListening] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [rowBox, setRowBox] = useState<{ top: number; height: number } | null>(null);
  const wide = expanded;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dictationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestAnnotationId = annotations.at(-1)?.id;

  useImperativeHandle(ref, () => ({
    fillPrompt(text: string) {
      setValue(text);
      textareaRef.current?.focus();
    },
  }));

  const token = dismissed ? null : parseToken(value);
  const menu: Menu = plusOpen ? 'attach' : (token?.kind ?? null);
  const query = plusOpen ? '' : (token?.query ?? '');

  const commandRows = menu === 'slash' ? QUICK_START_TOPICS.filter((t) => t.id.startsWith(query)) : [];
  const menuRowCount = menu === 'attach' ? 1 : commandRows.length;

  useEffect(() => {
    setActive(0);
    setEngaged(false);
  }, [menu, query]);

  // A single highlight glides to the active row instead of each row toggling its own background —
  // ported from the reference composer's own gliding-nav-pill technique.
  useLayoutEffect(() => {
    const target = rowRefs.current[active];
    if (target) setRowBox({ top: target.offsetTop, height: target.offsetHeight });
  }, [menu, query, active, menuRowCount]);

  function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  // Measure the typed text against the space actually available beside the fixed-width controls,
  // and move the textarea to its own full-width row once it would overflow — rather than letting
  // it truncate or the row grow unbounded. Applies at any size; a short empty composer always
  // stays a single compact pill.
  useLayoutEffect(() => {
    const controls = controlsRef.current;
    const measure = measureRef.current;
    if (!controls || !measure) return;

    const fixedControlsWidth = 36 * 3;
    const inlineGaps = 8 * 2;
    const inlineInputWidth = controls.clientWidth - fixedControlsWidth - inlineGaps;
    const needsFullWidth = value.includes('\n') || measure.offsetWidth + 8 > inlineInputWidth;
    if (needsFullWidth !== expanded) setExpanded(needsFullWidth);
  }, [value, expanded]);

  useEffect(() => {
    if (!textareaRef.current) return;
    autoGrow(textareaRef.current);
  }, [value]);

  // A selected-page edit arrives as composer context, not as typed copy. Keep the textarea
  // untouched and move focus here so the user can add an instruction alongside the new chip.
  useEffect(() => {
    if (latestAnnotationId === undefined) return;
    textareaRef.current?.focus();
  }, [latestAnnotationId]);

  // Dictation resolves after a beat, like a real transcript landing — decorative (no speech
  // recognition wired up), same established convention as the mic button elsewhere in this app.
  useEffect(() => {
    if (!listening) return;
    dictationTimerRef.current = setTimeout(() => {
      setValue((current) => (current ? `${current.trimEnd()} ${DICTATION_TRANSCRIPT}` : DICTATION_TRANSCRIPT));
      setListening(false);
      textareaRef.current?.focus();
    }, 2200);
    return () => {
      if (dictationTimerRef.current) clearTimeout(dictationTimerRef.current);
    };
  }, [listening]);

  // Outside click closes the open menu.
  useEffect(() => {
    if (!menu) return;
    function close(event: PointerEvent) {
      if (!(event.target as Element).closest('[data-promptbar]')) setPlusOpen(false);
    }
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [menu]);

  function pickAttach() {
    setAttachments((current) => [...current, ATTACH_FILES[current.length % ATTACH_FILES.length]]);
    if (token) setValue(value.slice(0, token.start));
    setPlusOpen(false);
    setDismissed(false);
    textareaRef.current?.focus();
  }

  function pickCommand(id: string) {
    setValue(`${token ? value.slice(0, token.start) : value}/${id} `);
    setDismissed(false);
    textareaRef.current?.focus();
  }

  function submit() {
    const trimmed = value.trim();
    if (!trimmed && attachments.length === 0 && annotations.length === 0) return;
    onSubmit(trimmed);
    setValue('');
    setAttachments([]);
    setPlusOpen(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (menu && menuRowCount > 0) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setEngaged(true);
        setActive((current) => (current + (event.key === 'ArrowDown' ? 1 : menuRowCount - 1)) % menuRowCount);
        return;
      }
      if ((event.key === 'Enter' && !event.shiftKey) || event.key === 'Tab') {
        event.preventDefault();
        if (menu === 'attach') {
          pickAttach();
        } else if (commandRows[active]) {
          pickCommand(commandRows[active].id);
        }
        return;
      }
    }
    if (event.key === 'Escape') {
      setDismissed(true);
      setPlusOpen(false);
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  const canSend = value.trim().length > 0 || attachments.length > 0 || annotations.length > 0;

  return (
    <div
      className={[
        s.root,
        size === 'compact' ? s.rootCompact : '',
        size === 'panel' ? s.rootPanel : '',
      ].filter(Boolean).join(' ')}
      data-promptbar
    >
      <div className={s.anchor}>
        {menu && (
          <div className={s.menuPanel} role="listbox" aria-label={menu === 'attach' ? 'Attach a file' : 'Slash commands'}>
            <span
              aria-hidden="true"
              className={s.highlight}
              style={{ top: rowBox?.top ?? 0, height: rowBox?.height ?? 0, opacity: rowBox && engaged && menuRowCount > 0 ? 1 : 0 }}
            />

            {menu === 'attach' && (
              <button
                type="button"
                className={s.menuRow}
                ref={(el) => {
                  rowRefs.current[0] = el;
                }}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => {
                  setActive(0);
                  setEngaged(true);
                }}
                onClick={pickAttach}
              >
                <span className={s.menuIcon}>
                  <FileArrowUp weight="regular" />
                </span>
                <span className={s.menuLabel}>Attach a file</span>
                <span className={s.menuDesc}>Upload your holdings or a statement</span>
              </button>
            )}

            {menu === 'slash' && (
              <>
                {commandRows.map((topic, i) => (
                  <button
                    key={topic.id}
                    type="button"
                    className={s.menuRow}
                    ref={(el) => {
                      rowRefs.current[i] = el;
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => {
                      setActive(i);
                      setEngaged(true);
                    }}
                    onClick={() => pickCommand(topic.id)}
                  >
                    <span className={s.menuIcon}>
                      <topic.icon weight="regular" />
                    </span>
                    <span className={s.menuLabel}>/{topic.id}</span>
                    <span className={s.menuDesc}>{topic.description}</span>
                  </button>
                ))}
                {commandRows.length === 0 && <div className={s.menuEmpty}>No commands match &ldquo;{query}&rdquo;</div>}
                <div className={s.menuFooter}>Type to search quick-start commands</div>
              </>
            )}
          </div>
        )}

        {/* border-beam's own wrapper sets overflow:hidden to clip the traveling beam to the
         * rounded shape — that also clips any box-shadow on .card, since a shadow bleeds outside
         * its own box. Carrying the shadow on this outer wrapper instead keeps it outside that
         * clip while the radius still tracks .card's (see .shadowWrapWithAttach). */}
        <div className={[s.shadowWrap, attachments.length > 0 || annotations.length > 0 || wide ? s.shadowWrapWithAttach : ''].filter(Boolean).join(' ')}>
        <BorderBeam size="line" colorVariant="colorful" theme="light">
        <form
          className={[s.card, attachments.length > 0 || annotations.length > 0 || wide ? s.cardWithAttach : ''].filter(Boolean).join(' ')}
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          {(attachments.length > 0 || annotations.length > 0) && (
            <div className={s.attachRow}>
              {annotations.map((annotation) => (
                <span key={annotation.id} className={[s.attachChip, s.annotationChip].join(' ')} title={annotation.text}>
                  <Paperclip weight="regular" />
                  <span className={s.attachName}>{annotation.text}</span>
                  {onRemoveAnnotation && (
                    <button
                      type="button"
                      aria-label={`Remove annotation: ${annotation.text}`}
                      className={s.attachRemove}
                      onClick={() => onRemoveAnnotation(annotation.id)}
                    >
                      <X weight="bold" />
                    </button>
                  )}
                </span>
              ))}
              {attachments.map((file, i) => (
                <span key={`${file}-${i}`} className={s.attachChip}>
                  <Paperclip weight="regular" />
                  <span className={s.attachName}>{file}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${file}`}
                    className={s.attachRemove}
                    onClick={() => setAttachments((current) => current.filter((_, j) => j !== i))}
                  >
                    <X weight="bold" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <span ref={measureRef} aria-hidden="true" className={s.measure}>
            {value}
          </span>

          <div ref={controlsRef} className={[s.controls, wide ? s.controlsWide : ''].filter(Boolean).join(' ')}>
            <button
              type="button"
              aria-label="Attach a file"
              aria-expanded={plusOpen}
              className={[s.plusBtn, plusOpen ? s.iconBtnActive : ''].filter(Boolean).join(' ')}
              onClick={() => {
                setPlusOpen((current) => !current);
                textareaRef.current?.focus();
              }}
            >
              <Plus weight="bold" />
            </button>

            <textarea
              ref={textareaRef}
              className={s.input}
              placeholder={listening ? 'Listening…' : placeholder}
              rows={1}
              value={value}
              aria-label={placeholder}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => {
                setValue(e.target.value);
                setDismissed(false);
                setPlusOpen(false);
              }}
              onKeyDown={handleKeyDown}
            />

            <button
              type="button"
              aria-label={listening ? 'Stop dictation' : 'Start dictation'}
              aria-pressed={listening}
              className={[s.micBtn, listening ? s.micBtnActive : ''].filter(Boolean).join(' ')}
              onClick={() => setListening((current) => !current)}
            >
              {listening ? (
                <span className={s.eq} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                <Microphone weight="regular" />
              )}
            </button>

            <button type="submit" className={s.sendBtn} disabled={!canSend} aria-label="Submit">
              <ArrowUp weight="bold" />
            </button>
          </div>
        </form>
        </BorderBeam>
        </div>
      </div>
    </div>
  );
});
