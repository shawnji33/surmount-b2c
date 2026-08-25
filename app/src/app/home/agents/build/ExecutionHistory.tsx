'use client';

import { useState } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';
import s from './build.module.css';

type Detail = {
  account: string;
  orderType: string;
  orderStatus: string;
  duration: string;
  submitted: string;
  filed: string;
  price: string;
  submittedAmount: string;
  filledQty: string;
  commission: string;
  secTaf: string;
  tip: string;
  total: string;
};
type Txn = { date: string; amount: string; shares: string; pending?: boolean; detail?: Detail };
type TxnGroup = { title: string; txns: Txn[] };
type Activity = { ok: boolean; label: string; time: string };
type Run = { items: Activity[] };

const detail = (price: string, filed: string, filledQty: string): Detail => ({
  account: 'Brokerage',
  orderType: 'Market buy',
  orderStatus: 'Filled',
  duration: 'Good for day',
  submitted: filed,
  filed,
  price: `${price} per share`,
  submittedAmount: '$2,000.00',
  filledQty,
  commission: '$0.20',
  secTaf: '$6.79',
  tip: '$0.50',
  total: '$2,000.00',
});

const TXN_GROUPS: TxnGroup[] = [
  {
    title: 'Pending',
    txns: [{ date: 'Today, 9:30AM', amount: '-$2,000.00', shares: '11.23 shares', pending: true }],
  },
  {
    title: 'Last 30 days',
    txns: [
      {
        date: 'March 19, 2026',
        amount: '-$2,000.00',
        shares: '11.89 shares',
        detail: detail('$168.21', 'Mar 19, 2026 at 9:30AM EST', '11.89 shares'),
      },
      {
        date: 'March 9, 2026',
        amount: '-$2,000.00',
        shares: '12.40 shares',
        detail: detail('$161.29', 'Mar 9, 2026 at 9:30AM EST', '12.40 shares'),
      },
      {
        date: 'March 3, 2026',
        amount: '-$2,000.00',
        shares: '11.49 shares',
        detail: detail('$174.06', 'Mar 3, 2026 at 9:30AM EST', '11.49 shares'),
      },
      {
        date: 'Feb 8, 2026',
        amount: '-$2,000.00',
        shares: '11.21 shares',
        detail: detail('$178.41', 'Feb 8, 2026 at 9:30AM EST', '11.21 shares'),
      },
    ],
  },
];

const RUNS: Run[] = [
  {
    items: [
      { ok: true, label: 'NVDA $2,000 buy order executed', time: 'Mar 27, 3:55PM' },
      { ok: true, label: 'NVDA 5% dip triggered', time: 'Mar 27, 3:55PM' },
      { ok: true, label: 'Getting quotes for: NVDA', time: 'Mar 27, 3:55PM' },
      { ok: true, label: 'Workflow triggered', time: 'Mar 27, 3:55PM' },
    ],
  },
  {
    items: [
      { ok: true, label: 'Notification sent', time: 'Mar 27, 3:50PM' },
      { ok: true, label: 'NVDA $2,000 buy order executed', time: 'Mar 27, 3:48PM' },
      { ok: true, label: 'Brokerage funds updated', time: 'Mar 27, 3:48PM' },
      { ok: true, label: 'Notification sent', time: 'Mar 27, 3:45PM' },
      { ok: false, label: 'Insufficient brokerage cash funds — notification sent', time: 'Mar 27, 3:35PM' },
      { ok: false, label: 'NVDA $2,000 buy order', time: 'Mar 27, 3:35PM' },
      { ok: true, label: 'NVDA 5% dip triggered', time: 'Mar 27, 3:35PM' },
      { ok: true, label: 'Getting quotes for: NVDA', time: 'Mar 27, 3:35PM' },
      { ok: true, label: 'Workflow triggered', time: 'Mar 27, 3:35PM' },
    ],
  },
];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className={s.txField}>
      <div className={s.txFieldLabel}>{label}</div>
      <div className={s.txFieldValue}>{value}</div>
    </div>
  );
}

function TxnRow({ txn }: { txn: Txn }) {
  const [open, setOpen] = useState(false);
  const expandable = !!txn.detail;
  return (
    <div className={`${s.txItem} ${open ? s.txItemOpen : ''}`}>
      <button
        className={s.txRow}
        type="button"
        onClick={() => expandable && setOpen((o) => !o)}
        style={{ cursor: expandable ? 'pointer' : 'default' }}
      >
        <div className={s.txRowL}>
          {txn.pending && <div className={s.txPending}>Pending</div>}
          <div className={s.txTitle}>NVDA market buy</div>
          <div className={s.txDate}>{txn.date}</div>
        </div>
        <div className={s.txRowR}>
          <div className={s.txAmount}>{txn.amount}</div>
          <div className={s.txShares}>{txn.shares}</div>
        </div>
        {expandable && (
          <CaretDown size={16} className={`${s.txChevron} ${open ? s.txChevronOpen : ''}`} />
        )}
      </button>
      {open && txn.detail && (
        <div className={s.txDetail}>
          <div className={s.txGrid}>
            <Field label="Account" value={txn.detail.account} />
            <Field label="Order type" value={txn.detail.orderType} />
            <Field label="Order status" value={txn.detail.orderStatus} />
            <Field label="Duration" value={txn.detail.duration} />
            <Field label="Submitted" value={txn.detail.submitted} />
            <Field label="Filed" value={txn.detail.filed} />
            <Field label="Price" value={txn.detail.price} />
            <Field label="Submitted amount" value={txn.detail.submittedAmount} />
            <Field label="Filled quantity" value={txn.detail.filledQty} />
            <Field label="Commission" value={txn.detail.commission} />
            <Field label="SEC & TAF fee" value={txn.detail.secTaf} />
            <Field label="Tip" value={txn.detail.tip} />
          </div>
          <Field label="Total" value={txn.detail.total} />
          <button className={s.txViewLink} type="button">
            View NVDA
          </button>
        </div>
      )}
    </div>
  );
}

export default function ExecutionHistory() {
  const [tab, setTab] = useState<'activity' | 'transactions'>('activity');
  return (
    <main className={s.history}>
      <div className={s.histTabs}>
        <button
          type="button"
          className={tab === 'activity' ? s.histTabActive : s.histTab}
          onClick={() => setTab('activity')}
        >
          Agent activity
        </button>
        <button
          type="button"
          className={tab === 'transactions' ? s.histTabActive : s.histTab}
          onClick={() => setTab('transactions')}
        >
          Transaction history
        </button>
      </div>

      <div className={s.histBody}>
        {tab === 'activity'
          ? RUNS.map((run, i) => (
              <div key={i} className={s.runGroup}>
                <div className={s.runHead}>
                  <span>Run completed</span>
                  <span className={s.runLine} />
                </div>
                <div className={s.actList}>
                  {run.items.map((it, j) => (
                    <div key={j} className={s.actRow}>
                      <span className={`${s.actIcon} ${it.ok ? s.actOk : s.actErr}`}>
                        {it.ok ? <Check size={11} weight="bold" /> : '!'}
                      </span>
                      <span className={s.actLabel}>{it.label}</span>
                      <span className={s.actTime}>{it.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          : TXN_GROUPS.map((g, i) => (
              <div key={i} className={s.txGroup}>
                <div className={s.txGroupTitle}>{g.title}</div>
                <div className={s.txListWrap}>
                  {g.txns.map((t, j) => (
                    <TxnRow key={j} txn={t} />
                  ))}
                </div>
              </div>
            ))}
      </div>
    </main>
  );
}
