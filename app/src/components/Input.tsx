'use client';

import {
  useCallback,
  useEffect,
  useState,
  forwardRef,
  useId,
  useRef,
  type AnimationEvent,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent,
  type InputEvent,
  type ReactNode,
} from 'react';
import s from './Input.module.css';

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M128,24A104,104,0,1,0,232,128,104.13,104.13,0,0,0,128,24Zm-8,80a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,72a12,12,0,1,1,12-12A12,12,0,0,1,128,176Z" />
    </svg>
  );
}

function hasInputValue(v: unknown) {
  if (Array.isArray(v)) return v.length > 0;
  return v != null && String(v).length > 0;
}

export type InputSize = 'sm' | 'md' | 'lg';

export type InputProps = {
  size?: InputSize;
  label?: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
  error?: boolean;
  iconLeading?: ReactNode;
  /** Rendered as-is — can be an icon or an interactive button. */
  iconTrailing?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'input'>, 'size'>;

// Mirrors the design-system Input component's size tokens exactly.
const SIZE: Record<InputSize, {
  shell: string;
  inner: string;
  restingLabel: CSSProperties;
  floatedLabel: CSSProperties;
  inputPt: string;
  inputStyle: CSSProperties;
}> = {
  sm: {
    shell: s.shellSm,
    inner: s.innerSm,
    restingLabel: { fontSize: 'var(--font-size-text-md)', lineHeight: 'var(--line-height-text-md)' },
    floatedLabel: { fontSize: 'var(--font-size-text-xs)', lineHeight: 'var(--line-height-text-xs)' },
    inputPt: s.inputPtSm,
    inputStyle: { fontSize: 'var(--font-size-text-md)', lineHeight: 'var(--line-height-text-md)' },
  },
  md: {
    shell: s.shellMd,
    inner: s.innerMd,
    restingLabel: { fontSize: 'var(--font-size-text-lg)', lineHeight: 'var(--line-height-text-lg)' },
    floatedLabel: { fontSize: 'var(--font-size-text-sm)', lineHeight: 'var(--line-height-text-sm)' },
    inputPt: s.inputPtMd,
    inputStyle: { fontSize: 'var(--font-size-text-lg)', lineHeight: 'var(--line-height-text-lg)' },
  },
  lg: {
    shell: s.shellLg,
    inner: s.innerLg,
    restingLabel: { fontSize: 'var(--font-size-text-xl)', lineHeight: 'var(--line-height-text-xl)' },
    floatedLabel: { fontSize: 'var(--font-size-text-md)', lineHeight: 'var(--line-height-text-md)' },
    inputPt: s.inputPtLg,
    inputStyle: { fontSize: 'var(--font-size-text-xl)', lineHeight: 'var(--line-height-text-xl)' },
  },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'md',
    label,
    helperText,
    errorText,
    error = false,
    iconLeading,
    iconTrailing,
    className,
    disabled = false,
    id: idProp,
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    onInput,
    onAnimationStart,
    placeholder,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const hasMessage = Boolean((error && errorText) || helperText);
  const messageId = hasMessage ? `${id}-msg` : undefined;
  const message = error && errorText ? errorText : helperText;
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(() => hasInputValue(value ?? defaultValue));
  const hasFloatingLabel = label != null;
  const isFloated = hasFloatingLabel && (focused || hasValue);
  const sz = SIZE[size ?? 'md'];
  const inputRef = useRef<HTMLInputElement | null>(null);

  const syncHasValue = useCallback(() => {
    const input = inputRef.current;
    if (input) setHasValue(hasInputValue(input.value));
  }, []);

  const setInputRef = useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;

    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  useEffect(() => {
    if (value !== undefined) setHasValue(hasInputValue(value));
  }, [value]);

  useEffect(() => {
    if (value !== undefined) return;

    syncHasValue();
    const frameId = window.requestAnimationFrame(syncHasValue);
    const timeoutIds = [
      window.setTimeout(syncHasValue, 300),
      window.setTimeout(syncHasValue, 1000),
      window.setTimeout(syncHasValue, 2000),
    ];

    return () => {
      window.cancelAnimationFrame(frameId);
      timeoutIds.forEach(window.clearTimeout);
    };
  }, [syncHasValue, value]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (value === undefined) setHasValue(hasInputValue(e.currentTarget.value));
    onChange?.(e);
  }

  function handleInput(e: InputEvent<HTMLInputElement>) {
    if (value === undefined) setHasValue(hasInputValue(e.currentTarget.value));
    onInput?.(e);
  }

  function handleFocus(e: FocusEvent<HTMLInputElement>) {
    setFocused(true);
    syncHasValue();
    onFocus?.(e);
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    setFocused(false);
    setHasValue(hasInputValue(e.currentTarget.value));
    onBlur?.(e);
  }

  function handleAnimationStart(e: AnimationEvent<HTMLInputElement>) {
    if (value === undefined) syncHasValue();
    onAnimationStart?.(e);
  }

  const shellCls = [
    s.shell,
    sz.shell,
    error && s.shellError,
    disabled && s.shellDisabled,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={s.root}>
      <label className={shellCls} htmlFor={id}>
        {iconLeading != null && (
          <span className={s.iconSlot} aria-hidden="true">{iconLeading}</span>
        )}

        <div className={[s.inner, sz.inner].join(' ')}>
          {label != null && (
            <span
              style={isFloated ? sz.floatedLabel : sz.restingLabel}
              className={[s.label, isFloated ? s.labelFloated : s.labelResting].join(' ')}
            >
              {label}
            </span>
          )}
          <input
            ref={setInputRef}
            id={id}
            style={hasFloatingLabel ? sz.inputStyle : undefined}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            onInput={handleInput}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onAnimationStart={handleAnimationStart}
            aria-invalid={error || undefined}
            aria-describedby={messageId}
            placeholder={hasFloatingLabel ? (isFloated ? placeholder : '') : placeholder}
            className={[
              s.input,
              hasFloatingLabel && sz.inputPt,
              hasFloatingLabel && (isFloated ? s.inputVisible : s.inputHidden),
            ].filter(Boolean).join(' ')}
            {...props}
          />
        </div>

        {iconTrailing != null && (
          <span className={s.iconSlot}>{iconTrailing}</span>
        )}
      </label>

      {hasMessage && (
        error ? (
          <span
            id={messageId}
            role="alert"
            className={[s.message, s.messageError].join(' ')}
          >
            <WarningIcon className={s.messageIcon} />
            <span>{message}</span>
          </span>
        ) : (
          <span
            id={messageId}
            className={[s.message, s.messageHelper].join(' ')}
          >
            {message}
          </span>
        )
      )}
    </div>
  );
});
