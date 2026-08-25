'use client';

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        position: 'relative',
        width: 44, height: 24,
        background: on ? 'var(--color-fg-primary-900)' : '#e9eaeb',
        borderRadius: 9999,
        padding: 2, cursor: 'pointer', border: 'none', flexShrink: 0,
        transition: 'background 220ms ease',
      }}
    >
      <span style={{
        display: 'block',
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(10,13,18,0.1)',
        position: 'absolute', top: 2,
        left: on ? 22 : 2,
        transition: 'left 200ms cubic-bezier(0.4,0,0.2,1)',
      }} />
    </button>
  );
}
