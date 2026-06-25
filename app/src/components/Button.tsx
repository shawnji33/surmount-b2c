import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './Button.module.css';

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'lg';
  fullWidth?: boolean;
  iconLeading?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = 'primary',
  size = 'lg',
  fullWidth = true,
  iconLeading,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    size === 'sm' ? styles.sm : '',
    fullWidth ? '' : styles.auto,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {iconLeading != null && <span className={styles.icon}>{iconLeading}</span>}
      <span>{children}</span>
    </button>
  );
}
