import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './Button.module.css';

type ButtonProps = {
  variant?: 'primary' | 'secondary';
  iconLeading?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = 'primary',
  iconLeading,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = [
    styles.button,
    variant === 'primary' ? styles.primary : styles.secondary,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {iconLeading != null && <span className={styles.icon}>{iconLeading}</span>}
      <span>{children}</span>
    </button>
  );
}
