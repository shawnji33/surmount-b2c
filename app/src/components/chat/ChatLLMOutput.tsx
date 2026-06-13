import type { ReactNode } from 'react';
import { ChatActionButtons } from './ChatActionButtons';
import s from './ChatLLMOutput.module.css';

interface ChatLLMOutputProps {
  children: ReactNode;
  onCopy?: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  className?: string;
}

export function ChatLLMOutput({ children, onCopy, onThumbsUp, onThumbsDown, className }: ChatLLMOutputProps) {
  return (
    <div className={[s.output, className].filter(Boolean).join(' ')}>
      <div className={s.chat}>
        <div className={s.spinner} aria-hidden="true" />
        <p className={s.text}>{children}</p>
        <ChatActionButtons onCopy={onCopy} onThumbsUp={onThumbsUp} onThumbsDown={onThumbsDown} />
      </div>
    </div>
  );
}
