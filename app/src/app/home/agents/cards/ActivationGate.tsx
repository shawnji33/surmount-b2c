'use client';

import { useEffect, useState } from 'react';
import { X, ShieldCheck, CheckCircle, ArrowRight } from '@phosphor-icons/react';
import type { NodeInstance } from '../nodes/types';
import { summarize, DISCLOSURES } from './agentModel';
import s from './cards.module.css';

/* The review/activation gate for Option C — a sheet over the same agent.
   Confirming flips the agent draft → active (handled by the parent). */
export function ActivationGate({
  open,
  agentName,
  nodes,
  onClose,
  onConfirm,
}: {
  open: boolean;
  agentName: string;
  nodes: NodeInstance[];
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [ack, setAck] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAck(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={s.gateScrim} onClick={onClose}>
      <div className={s.gate} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className={s.gateHead}>
          <span className={s.gateIcon}>
            <ShieldCheck size={18} />
          </span>
          <span className={s.gateTitle}>Review &amp; activate</span>
          <button className={s.gateClose} onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>

        <div className={s.gateBody}>
          <div className={s.gateAgent}>{agentName}</div>
          <p className={s.gateSummary}>{summarize(nodes)}</p>

          <div className={s.gateSection}>Before you activate</div>
          <ul className={s.gateList}>
            {DISCLOSURES.map((d) => (
              <li key={d}>
                <CheckCircle size={16} weight="fill" className={s.gateBullet} />
                <span>{d}</span>
              </li>
            ))}
          </ul>

          <label className={s.gateAck}>
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
            <span>I understand this agent will place live orders on my behalf.</span>
          </label>
        </div>

        <footer className={s.gateFoot}>
          <button className={s.gateCancel} onClick={onClose}>
            Cancel
          </button>
          <button className={s.gateActivate} disabled={!ack} onClick={onConfirm}>
            Activate agent
            <ArrowRight size={15} weight="bold" />
          </button>
        </footer>
      </div>
    </div>
  );
}
