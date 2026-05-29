'use client';

import { type InputHTMLAttributes } from 'react';
import styles from './Checkbox.module.css';

function CheckIcon() {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" width="12" height="12" aria-hidden="true">
      <path d="M229.66 77.66l-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z" />
    </svg>
  );
}

type CheckboxProps = {
  label: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={[styles.label, className].filter(Boolean).join(' ')}>
      <input className={styles.input} type="checkbox" {...props} />
      <span className={styles.controlWrap} aria-hidden="true">
        <span className={styles.control}>
          {props.checked && <CheckIcon />}
        </span>
      </span>
      <span className={styles.text}>{label}</span>
    </label>
  );
}
