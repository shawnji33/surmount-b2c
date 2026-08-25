'use client';

import { Copy, ThumbsDown, ThumbsUp } from '@phosphor-icons/react';
import s from './ChatActionButtons.module.css';

interface ChatActionButtonsProps {
  onCopy?: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  className?: string;
}

export function ChatActionButtons({ onCopy, onThumbsUp, onThumbsDown, className }: ChatActionButtonsProps) {
  return (
    <div className={[s.actions, className].filter(Boolean).join(' ')}>
      <button type="button" className={s.actionBtn} onClick={onCopy} aria-label="Copy message">
        <Copy weight="regular" />
      </button>
      <button type="button" className={s.actionBtn} onClick={onThumbsUp} aria-label="Thumbs up">
        <ThumbsUp weight="regular" />
      </button>
      <button type="button" className={s.actionBtn} onClick={onThumbsDown} aria-label="Thumbs down">
        <ThumbsDown weight="regular" />
      </button>
    </div>
  );
}
