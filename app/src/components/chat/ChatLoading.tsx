import s from './ChatLoading.module.css';

interface ChatLoadingProps {
  text?: string;
  className?: string;
}

export function ChatLoading({ text = 'Still working on it, stand by...', className }: ChatLoadingProps) {
  return (
    <div className={[s.loading, className].filter(Boolean).join(' ')}>
      <div className={s.spinner} aria-hidden="true" />
      <p className={s.text}>{text}</p>
    </div>
  );
}
