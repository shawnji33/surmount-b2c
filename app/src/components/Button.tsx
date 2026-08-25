import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './Button.module.css';

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'lg';
  fullWidth?: boolean;
  iconLeading?: ReactNode;
  iconTrailing?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = 'primary',
  size = 'lg',
  fullWidth = true,
  iconLeading,
  iconTrailing,
  className,
  children,
  ...props
}: ButtonProps) {
  const hasChildren = children !== undefined && children !== null && children !== false;
  const iconOnly = !hasChildren && (iconLeading != null || iconTrailing != null);
  const classes = [
    styles.button,
    styles[variant],
    size === 'sm' ? styles.sm : '',
    iconOnly ? styles.iconOnly : '',
    fullWidth ? '' : styles.auto,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {iconLeading != null && <span className={styles.icon}>{iconLeading}</span>}
      {hasChildren && <span>{children}</span>}
      {iconTrailing != null && <span className={styles.icon}>{iconTrailing}</span>}
    </button>
  );
}
