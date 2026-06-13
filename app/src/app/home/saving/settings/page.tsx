'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bank,
  FileText,
  FilePdf,
  Receipt,
  DownloadSimple,
  CaretDown,
  Info,
} from '@phosphor-icons/react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import s from './page.module.css';

// ─── Mock data ─────────────────────────────────────────────────────────────────

const ACCOUNT_DOCS = [
  { id: 'ad-1', name: 'Account agreement', date: 'Jan 14, 2025' },
  { id: 'ad-2', name: 'Privacy notice', date: 'Jan 14, 2025' },
  { id: 'ad-3', name: 'FDIC disclosure', date: 'Jan 14, 2025' },
  { id: 'ad-4', name: 'Fee schedule', date: 'Jan 14, 2025' },
];

const STATEMENTS = [
  { id: 'st-5', name: 'May 2026', size: '84 KB' },
  { id: 'st-4', name: 'April 2026', size: '91 KB' },
  { id: 'st-3', name: 'March 2026', size: '78 KB' },
  { id: 'st-2', name: 'February 2026', size: '82 KB' },
  { id: 'st-1', name: 'January 2026', size: '76 KB' },
];

const TAX_DOCS = [
  { id: 'tx-25', name: '2025 — Form 1099-INT', size: '112 KB', status: 'Available' },
  { id: 'tx-24', name: '2024 — Form 1099-INT', size: '108 KB', status: 'Available' },
];

// ─── Document section ──────────────────────────────────────────────────────────

function DocSection({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ElementType;
  items: { id: string; name: string; date?: string; size?: string; status?: string }[];
}) {
  const [open, setOpen] = useState(true);

  return (
    <section>
      <button
        type="button"
        className={s.docSectionHeader}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <div className={s.docSectionTitleWrap}>
          <div className={s.docSectionIcon}>
            <Icon size={15} weight="regular" color="var(--color-fg-secondary-700, #414651)" />
          </div>
          <span className={s.docSectionTitle}>{title}</span>
        </div>
        <CaretDown
          size={15}
          weight="regular"
          color="var(--color-fg-tertiary-600, #535861)"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease', flexShrink: 0 }}
        />
      </button>

      {open && (
        <div className={s.docList}>
          {items.map((item, i) => (
            <div key={item.id} className={[s.docRow, i === items.length - 1 ? s.docRowLast : ''].filter(Boolean).join(' ')}>
              <div className={s.docRowLeft}>
                <span className={s.docRowName}>{item.name}</span>
                {item.date && <span className={s.docRowMeta}>{item.date}</span>}
                {item.size && <span className={s.docRowMeta}>{item.size}</span>}
                {item.status && <span className={s.docRowStatus}>{item.status}</span>}
              </div>
              <button type="button" className={s.downloadBtn} aria-label={`Download ${item.name}`}>
                <DownloadSimple size={14} weight="regular" />
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HycaSettingsPage() {
  return (
    <main className={s.main}>
      <DashboardHeader title="High Yield Cash — Settings" />

      <div className={s.content}>
        <Link href="/home/saving" className={s.backLink}>
          <ArrowLeft size={15} weight="regular" />
          Back
        </Link>

        <div className={s.pageLayout}>

          {/* ── Left column — documents (scrolls) ── */}
          <div className={s.leftCol}>

            <div className={s.card}>
              <DocSection title="Account documents" icon={FileText} items={ACCOUNT_DOCS} />
            </div>

            <div className={s.card}>
              <DocSection title="Monthly statements" icon={FilePdf} items={STATEMENTS} />
            </div>

            <div className={s.card}>
              <DocSection title="Tax documents" icon={Receipt} items={TAX_DOCS} />
            </div>

          </div>

          {/* ── Right column — actions (sticky) ── */}
          <aside className={s.rightCol}>

            {/* Account details */}
            <div className={s.detailCard}>
              {[
                { label: 'Account number', value: 'WK5D2WB38USD' },
                { label: 'Current balance', value: '$351,242.54' },
                { label: 'Net deposits', value: '$342,000.00' },
                { label: 'Current APY', value: '4.35%' },
                { label: 'Date opened', value: 'Jan 14, 2025' },
              ].map((row, i, arr) => (
                <div key={row.label} className={[s.detailRow, i === arr.length - 1 ? s.detailRowLast : ''].filter(Boolean).join(' ')}>
                  <span className={s.detailLabel}>{row.label}</span>
                  <span className={s.detailValue}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Idle cash sweep */}
            <div className={s.sweepCard}>
              <div className={s.sweepInner}>
                <div className={s.actionInfo}>
                  <div className={s.sweepTitleRow}>
                    <span className={s.actionLabel}>Idle cash sweep</span>
                    <Info size={16} weight="regular" color="var(--color-fg-tertiary-600, #535861)" />
                  </div>
                  <span className={s.actionMeta}>Earn 4.35% APY automatically</span>
                </div>
                <div className={s.toggle}>
                  <div className={s.toggleKnob} />
                </div>
              </div>
            </div>

            {/* Linked bank */}
            <div className={s.sweepCard}>
              <div className={s.bankInner}>
                <div className={s.bankLogoBlue}>
                  <img src="/assets/illustrations/bank-chase.png" alt="Chase" />
                </div>
                <div className={s.bankInfo}>
                  <span className={s.actionLabel}>Chase Total Checking</span>
                  <span className={s.actionMeta}>Checking · 4823</span>
                </div>
                <button type="button" className={s.updateBtn}>
                  <Bank size={13} weight="regular" />
                  Update
                </button>
              </div>
            </div>

            {/* Close account */}
            <button type="button" className={s.closeBtn}>
              Close account
            </button>

          </aside>
        </div>
      </div>
    </main>
  );
}
