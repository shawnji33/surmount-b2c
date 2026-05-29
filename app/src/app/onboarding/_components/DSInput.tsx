'use client';

import {
  forwardRef,
  useId,
  useState,
  useEffect,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type ReactNode,
} from 'react';
import s from './onboarding.module.css';

function USFlag() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" style={{ borderRadius: 2, display: 'block', flexShrink: 0 }} aria-hidden="true">
      {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
        <rect key={i} x="0" y={i * (14/13)} width="20" height={14/13 + 0.2} fill={i % 2 === 0 ? '#B22234' : '#fff'} />
      ))}
      <rect x="0" y="0" width="8" height={14 * 7/13} fill="#3C3B6E" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M128,24A104,104,0,1,0,232,128,104.13,104.13,0,0,0,128,24Zm-8,80a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,72a12,12,0,1,1,12-12A12,12,0,0,1,128,176Z"/>
    </svg>
  );
}

function hasValue(v: unknown): boolean {
  if (Array.isArray(v)) return v.length > 0;
  return v != null && String(v).length > 0;
}

export type DSInputProps = {
  label: string;
  error?: boolean;
  errorText?: ReactNode;
  helperText?: ReactNode;
  iconTrailing?: ReactNode;
  phonePrefix?: boolean;
} & Omit<ComponentPropsWithoutRef<'input'>, 'size'>;

export const DSInput = forwardRef<HTMLInputElement, DSInputProps>(function DSInput(
  {
    label,
    error = false,
    errorText,
    helperText,
    iconTrailing,
    phonePrefix = false,
    id: idProp,
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    placeholder,
    className,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const msgId = (error && errorText) || helperText ? `${id}-msg` : undefined;
  const msg = error && errorText ? errorText : helperText;

  const [focused, setFocused] = useState(false);
  const [filled, setFilled] = useState(() => hasValue(value ?? defaultValue));
  const isFloated = focused || filled;

  useEffect(() => {
    if (value !== undefined) setFilled(hasValue(value));
  }, [value]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (value === undefined) setFilled(hasValue(e.currentTarget.value));
    onChange?.(e);
  }
  function handleFocus(e: FocusEvent<HTMLInputElement>) {
    setFocused(true);
    onFocus?.(e);
  }
  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    setFocused(false);
    setFilled(hasValue(e.currentTarget.value));
    onBlur?.(e);
  }

  return (
    <div className={s.dsInputWrap}>
      <label
        className={`${s.dsInputShell} ${error ? s.dsInputShellError : ''}`}
        htmlFor={id}
      >
        {phonePrefix && (
          <span className={s.dsLeadingPrefix} aria-hidden="true">
            <USFlag />
            <span>+1</span>
          </span>
        )}
        <div className={s.dsInputInner}>
          <span className={`${s.dsLabel} ${isFloated ? s.dsLabelFloat : ''}`}>
            {label}
          </span>
          <input
            ref={ref}
            id={id}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={isFloated ? placeholder : ''}
            aria-invalid={error || undefined}
            aria-describedby={msgId}
            className={`${s.dsNativeInput} ${!isFloated ? s.dsNativeInputHide : ''}`}
            {...props}
          />
        </div>
        {iconTrailing != null && (
          <span className={s.dsTrailing}>{iconTrailing}</span>
        )}
      </label>
      {msg && (
        <span
          id={msgId}
          role={error ? 'alert' : undefined}
          className={`${s.dsInputMsg} ${error ? s.dsInputMsgError : s.dsInputMsgHelper}`}
        >
          {error && <WarningIcon />}
          <span>{msg}</span>
        </span>
      )}
    </div>
  );
});

export type DSSelectProps = {
  label: string;
  error?: boolean;
  errorText?: ReactNode;
  helperText?: ReactNode;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'select'>, 'size'>;

export const DSSelect = forwardRef<HTMLSelectElement, DSSelectProps>(function DSSelect(
  {
    label,
    error = false,
    errorText,
    helperText,
    id: idProp,
    value,
    onChange,
    children,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [filled, setFilled] = useState(() => hasValue(value));
  const isFloated = filled;

  useEffect(() => {
    if (value !== undefined) setFilled(hasValue(value));
  }, [value]);

  return (
    <div className={s.dsInputWrap}>
      <label
        className={`${s.dsInputShell} ${error ? s.dsInputShellError : ''}`}
        htmlFor={id}
      >
        <div className={s.dsInputInner}>
          <span className={`${s.dsLabel} ${isFloated ? s.dsLabelFloat : ''}`}>
            {label}
          </span>
          <select
            ref={ref}
            id={id}
            value={value}
            onChange={e => {
              setFilled(hasValue(e.currentTarget.value));
              onChange?.(e);
            }}
            className={`${s.dsNativeSelect} ${!isFloated ? s.dsNativeInputHide : ''}`}
            aria-invalid={error || undefined}
            {...props}
          >
            {children}
          </select>
        </div>
      </label>
    </div>
  );
});
