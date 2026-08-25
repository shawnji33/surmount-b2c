'use client';

import Image from 'next/image';
import { Equals, Sparkle, PencilSimple, CheckCircle } from '@phosphor-icons/react';
import type { Builder } from './usePortfolioBuilder';
import type { AllocMode } from './usePortfolioBuilder';
import p from './panels.module.css';

const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 });

const MODES: Array<{ id: AllocMode; label: string; Icon: typeof Equals }> = [
  { id: 'equal', label: 'Equal', Icon: Equals },
  { id: 'suggested', label: 'Suggested', Icon: Sparkle },
  { id: 'custom', label: 'Custom', Icon: PencilSimple },
];

export default function AllocationPanel({ builder }: { builder: Builder }) {
  const { selected, amount, setAmount, mode, setMode, weights, dollars, allocated, isFullyAllocated } = builder;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className={p.allocTop}>
        <div className={p.allocSummary}>
          <div className={p.summaryItem}>
            <span className={p.summaryLabel}>Allocated</span>
            <span className={p.summaryValue}>${fmt(allocated)} <span style={{ color: 'var(--color-fg-tertiary-600, #535861)', fontWeight: 400, fontSize: 14 }}>of ${fmt(amount)}</span></span>
          </div>
          <div className={p.summaryItem}>
            <span className={p.summaryLabel}>Remaining</span>
            <span className={`${p.summaryValue} ${p.summaryValueAccent}`}>${fmt(builder.remaining)}</span>
          </div>
        </div>
        <span className={`${p.statusPill} ${isFullyAllocated ? p.statusPillOk : ''}`}>
          {isFullyAllocated && <CheckCircle weight="fill" aria-hidden="true" style={{ width: 15, height: 15 }} />}
          {selected.length === 0 ? 'No strategies yet' : isFullyAllocated ? 'Fully allocated' : 'Set your weights'}
        </span>
      </div>

      <div className={p.amountField}>
        <span className={p.amountSymbol}>$</span>
        <input
          className={p.amountInput}
          inputMode="numeric"
          placeholder="0"
          value={amount ? fmt(amount) : ''}
          onChange={e => setAmount(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
        />
        <span className={p.amountCurrency}>USD</span>
      </div>

      <div className={p.modeSeg}>
        {MODES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`${p.modeBtn} ${mode === id ? p.modeBtnActive : ''}`}
            onClick={() => setMode(id)}
          >
            <Icon aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {selected.length === 0 ? (
        <div className={p.empty}>Pick strategies to allocate your investment across them.</div>
      ) : (
        <div className={p.allocList}>
          {selected.map(s => {
            const pct = weights[s.id] ?? 0;
            const usd = dollars[s.id] ?? 0;
            const editable = mode === 'custom';
            return (
              <div key={s.id} className={p.allocRow}>
                <Image className={p.allocCover} src={s.cover} alt="" width={32} height={32} />
                <span className={p.allocName}>{s.name}</span>
                <div className={p.allocInputs}>
                  <div className={`${p.miniField} ${p.miniFieldReadonly}`}>
                    <span className={p.miniSymbol}>$</span>
                    <input className={p.miniInput} value={fmt(usd)} disabled readOnly />
                  </div>
                  <div className={`${p.miniField} ${editable ? '' : p.miniFieldReadonly}`}>
                    <input
                      className={p.miniInput}
                      value={pct.toFixed(0)}
                      disabled={!editable}
                      inputMode="numeric"
                      onChange={e => builder.setCustomWeight(s.id, Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                    />
                    <span className={p.miniSymbol}>%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
