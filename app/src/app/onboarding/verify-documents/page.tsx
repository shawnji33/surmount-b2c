'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import s from '../_components/onboarding.module.css';

type UploadState = 'empty' | 'uploading' | 'uploaded';

interface FileSlot {
  state: UploadState;
  fileName: string;
  fileSize: string;
  progress: number;
  isImage: boolean;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function isImageFile(name: string) {
  return /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(name);
}

function simulateUpload(onProgress: (p: number) => void, onDone: () => void) {
  const phases = [
    { to: 60, ms: 700 },
    { to: 85, ms: 500 },
    { to: 100, ms: 300 },
  ];
  let pct = 0, phaseIdx = 0, last = performance.now();
  let raf: number;

  function tick(now: number) {
    const dt = now - last;
    last = now;
    const ph = phases[phaseIdx];
    const prev = phaseIdx > 0 ? phases[phaseIdx - 1].to : 0;
    const rate = (ph.to - prev) / ph.ms;
    pct = Math.min(ph.to, pct + rate * dt);
    onProgress(pct);
    if (pct >= ph.to) {
      phaseIdx++;
      if (phaseIdx >= phases.length) { onDone(); return; }
    }
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

const DOCS = [
  {
    title: 'Government-issued photo ID',
    subtitle: "Driver's license, passport, or state ID. Front and back if applicable.",
    reqs: ['All 4 corners visible', 'No glare or blur', 'Text legible'],
    accept: '.pdf,.jpg,.jpeg,.png',
    ariaLabel: 'Upload government-issued photo ID',
  },
  {
    title: 'Proof of current address',
    subtitle: 'Utility bill, bank statement, or lease. Must be dated within the last 90 days.',
    reqs: [],
    accept: '.pdf,.jpg,.jpeg,.png',
    ariaLabel: 'Upload proof of current address',
  },
];

function UploadIcon() {
  return (
    <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="128" y1="144" x2="128" y2="32"/>
      <polyline points="216 144 216 208 40 208 40 144"/>
      <polyline points="88 72 128 32 168 72"/>
    </svg>
  );
}

function FileDocIcon() {
  return (
    <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M200,224H56a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h96l56,56V216A8,8,0,0,1,200,224Z"/>
      <polyline points="152 32 152 88 208 88"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" aria-hidden="true">
      <line x1="200" y1="56" x2="56" y2="200"/>
      <line x1="200" y1="200" x2="56" y2="56"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="40 144 96 200 224 72"/>
    </svg>
  );
}

function DocCard({
  doc,
  slot,
  onFile,
  onDelete,
}: {
  doc: typeof DOCS[0];
  slot: FileSlot;
  onFile: (file: File) => void;
  onDelete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }

  return (
    <div className={s.vDocCard}>
      <div className={s.vDocCardHeader}>
        <div className={s.vDocCardTitle}>{doc.title}</div>
        <div className={s.vDocCardSubtitle}>{doc.subtitle}</div>
      </div>

      {doc.reqs.length > 0 && (
        <div className={s.vReqRow}>
          {doc.reqs.map(req => (
            <span key={req} className={s.vReqItem}>
              <CheckIcon />
              {req}
            </span>
          ))}
        </div>
      )}

      {slot.state === 'empty' && (
        <label
          className={s.uploadZone}
          style={dragging ? { background: 'rgba(10,13,18,0.04)', borderColor: 'rgba(10,13,18,0.3)' } : undefined}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept={doc.accept}
            aria-label={doc.ariaLabel}
            onChange={handleChange}
            style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
          />
          <div className={s.uploadZoneIcon}><UploadIcon /></div>
          <div className={s.uploadZoneLabelWrap}>
            <span className={s.uploadZoneLabelPrimary}><strong>Click to upload</strong> or drag and drop</span>
            <span className={s.uploadZoneLabelSecondary}>PDF, JPG, or PNG · Max 10 MB</span>
          </div>
        </label>
      )}

      {slot.state === 'uploading' && (
        <div className={s.uploadRow}>
          <span className={`${s.vFileIcon} ${slot.isImage ? s.vFileIconImage : ''}`}>
            <FileDocIcon />
          </span>
          <div className={s.progressInfo}>
            <div className={s.progressHeader}>
              <span className={s.progressFilename}>{slot.fileName}</span>
              <span className={s.progressPct}>{Math.round(slot.progress)}%</span>
            </div>
            <div className={s.progressTrack}>
              <div className={s.uploadProgressFill} style={{ width: `${slot.progress}%` }} />
            </div>
          </div>
        </div>
      )}

      {slot.state === 'uploaded' && (
        <div className={`${s.uploadRow} ${s.uploadFileRow}`}>
          <span className={`${s.vFileIcon} ${slot.isImage ? s.vFileIconImage : ''}`}>
            <FileDocIcon />
          </span>
          <div className={s.fileInfo}>
            <span className={s.vFileName}>{slot.fileName}</span>
            <span className={s.vFileMeta}>{slot.fileSize}</span>
          </div>
          <button type="button" className={s.fileDelete} aria-label="Remove file" onClick={onDelete}>
            <XIcon />
          </button>
        </div>
      )}
    </div>
  );
}

const EMPTY_SLOT: FileSlot = { state: 'empty', fileName: '', fileSize: '', progress: 0, isImage: false };

export default function VerifyDocumentsPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<[FileSlot, FileSlot]>([EMPTY_SLOT, EMPTY_SLOT]);
  const [submitting, setSubmitting] = useState(false);
  const cancelRefs = useRef<Array<(() => void) | null>>([null, null]);

  function handleFile(idx: number, file: File) {
    const isImage = isImageFile(file.name);
    setSlots(prev => {
      const next = [...prev] as [FileSlot, FileSlot];
      next[idx] = { state: 'uploading', fileName: file.name, fileSize: formatSize(file.size), progress: 0, isImage };
      return next;
    });

    if (cancelRefs.current[idx]) cancelRefs.current[idx]!();

    const cancel = simulateUpload(
      (p) => setSlots(prev => {
        const next = [...prev] as [FileSlot, FileSlot];
        next[idx] = { ...next[idx], progress: p };
        return next;
      }),
      () => setSlots(prev => {
        const next = [...prev] as [FileSlot, FileSlot];
        next[idx] = { ...next[idx], state: 'uploaded' };
        return next;
      }),
    );
    cancelRefs.current[idx] = cancel;
  }

  function handleDelete(idx: number) {
    if (cancelRefs.current[idx]) cancelRefs.current[idx]!();
    cancelRefs.current[idx] = null;
    setSlots(prev => {
      const next = [...prev] as [FileSlot, FileSlot];
      next[idx] = EMPTY_SLOT;
      return next;
    });
  }

  function handleSubmit() {
    setSubmitting(true);
    setTimeout(() => router.push('/onboarding/documents-received'), 2200);
  }

  return (
    <div className={s.shell}>
      <header className={s.topbar}>
        <Link href="/onboarding/account-setup" className={s.topbarBtn}>
          <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="216" y1="128" x2="40" y2="128"/>
            <polyline points="112 56 40 128 112 200"/>
          </svg>
          Back
        </Link>
        <div className={s.topbarBrand}>
          <img src="https://www.figma.com/api/mcp/asset/3bbd6119-7028-47e5-9a7d-d4fafba87569" alt="" className={s.topbarBrandIcon} />
          <img src="https://www.figma.com/api/mcp/asset/3297adb2-a615-459c-b3a1-30442b03c519" alt="Surmount" className={s.topbarBrandName} />
        </div>
        <Link href="/home" className={s.topbarBtn}>
          Close
          <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" aria-hidden="true">
            <line x1="200" y1="56" x2="56" y2="200"/>
            <line x1="200" y1="200" x2="56" y2="56"/>
          </svg>
        </Link>
      </header>

      <main className={s.verifyMain}>
        <div className={s.verifyContent}>
          <div className={s.verifyHeader}>
            <h1 className={s.verifyTitle}>Verify your identity</h1>
            <p className={s.verifySubtitle}>Upload the 2 documents below. We&apos;ll verify and notify you within 1–2 business days.</p>
          </div>

          <div className={s.verifyCards}>
            {DOCS.map((doc, i) => (
              <DocCard
                key={doc.title}
                doc={doc}
                slot={slots[i]}
                onFile={(f) => handleFile(i, f)}
                onDelete={() => handleDelete(i)}
              />
            ))}
          </div>

          <button type="button" className={s.verifyCta} onClick={handleSubmit}>
            Upload documents
          </button>
        </div>
      </main>

      <div
        className={`${s.uploadOverlay} ${submitting ? s.uploadOverlayVisible : ''}`}
        aria-live="polite"
        aria-busy={submitting}
      >
        <div className={s.uploadOverlaySpinner} />
        <p className={s.uploadOverlayText}>Uploading your documents</p>
        <p className={s.uploadOverlaySub}>This will only take a moment…</p>
      </div>
    </div>
  );
}
