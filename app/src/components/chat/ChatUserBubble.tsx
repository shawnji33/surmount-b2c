import type { CSSProperties, ReactNode } from 'react';
import s from './ChatUserBubble.module.css';

interface ChatUserBubbleProps {
  children: ReactNode;
  animationDelay?: number;
  className?: string;
  style?: CSSProperties;
  variant?: 'default' | 'compact';
}

export function ChatUserBubble({
  children,
  animationDelay,
  className,
  style,
  variant = 'default',
}: ChatUserBubbleProps) {
  return (
    <div
      className={[s.row, variant === 'compact' ? s.compact : '', className].filter(Boolean).join(' ')}
      style={{ ...(animationDelay !== undefined ? { animationDelay: `${animationDelay}ms` } : {}), ...style }}
    >
      <article className={s.bubble}>
        <p>{children}</p>
      </article>
    </div>
  );
}
