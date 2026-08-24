'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, UploadSimple } from '@phosphor-icons/react';
import { StatusHeader } from '../_components/Shell';
import s from '../applicationStatus.module.css';

/* Figma node 2068:3362. Two document slots, then submit.
 *
 * The mock only draws the empty dropzone, so the filled state reuses the same
 * box and swaps its contents rather than introducing a surface the design
 * doesn't specify. Submit stays disabled until both slots have a file — the
 * mock shows an always-dark button, but shipping a CTA that silently does
 * nothing is worse than showing it can't fire yet. */

const DOCS = [
  {
    id: 'photo-id',
    title: 'Government-issued photo ID',
    desc: "Driver's license, passport, or state ID. Front and back if applicable.",
    hints: ['All 4 corners visible', 'No glare or blur', 'Text legible'],
  },
  {
    id: 'address',
    title: 'Proof of current U.S. address',
    desc: 'Utility bill, bank statement, or lease. Must be dated within the last 90 days.',
    hints: [],
  },
];

function Dropzone({
  id,
  fileName,
  onFile,
}: {
  id: string;
  fileName: string | null;
  onFile: (name: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function pick(files: FileList | null) {
    const file = files?.[0];
    if (file) onFile(file.name);
  }

  return (
    <>
      <label
        htmlFor={`file-${id}`}
        className={[s.dropzone, fileName ? s.dropzoneFilled : ''].filter(Boolean).join(' ')}
        data-dragging={dragging || undefined}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files);
        }}
      >
        <span className={[s.dropIcon, fileName ? s.dropIconDone : ''].filter(Boolean).join(' ')} aria-hidden="true">
          {fileName ? <Check weight="bold" /> : <UploadSimple weight="regular" />}
        </span>

        <span className={s.dropCopy}>
          {fileName ? (
            <>
              <span className={s.fileName}>{fileName}</span>
              <span className={s.fileReplace}>Click to replace</span>
            </>
          ) : (
            <>
              <span className={s.dropPrompt}>
                <span className={s.dropPromptStrong}>Click to upload</span> or drag and drop
              </span>
              <span className={s.dropMeta}>PDF, JPG, or PNG · Max 10 MB</span>
            </>
          )}
        </span>
      </label>

      <input
        ref={inputRef}
        id={`file-${id}`}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className={s.fileInput}
        onChange={(e) => pick(e.target.files)}
      />
    </>
  );
}

export default function VerifyIdentityPage() {
  const router = useRouter();
  const [files, setFiles] = useState<Record<string, string | null>>({});
  const ready = DOCS.every((d) => files[d.id]);

  return (
    <div className={s.page}>
      <StatusHeader onCloseHref="/onboarding/application-status" />

      <main className={s.verifyMain}>
        <div className={[s.verifyContent, s.enter].join(' ')}>
          <div className={s.verifyHead}>
            <h1 className={s.title}>Verify your identity</h1>
            <p className={[s.subtitle, s.verifyHeadCopy].join(' ')}>
              Upload the 2 documents below. We&apos;ll verify and notify you within 1–2 business days.
            </p>
          </div>

          <div className={s.docCards}>
            {DOCS.map((doc) => (
              <section key={doc.id} className={s.docCard}>
                <div className={s.docHead}>
                  <h2 className={s.docTitle}>{doc.title}</h2>
                  <p className={s.docDesc}>{doc.desc}</p>
                </div>

                {doc.hints.length > 0 && (
                  <ul className={s.docHints}>
                    {doc.hints.map((hint) => (
                      <li key={hint} className={s.docHint}>
                        <Check weight="bold" aria-hidden="true" />
                        {hint}
                      </li>
                    ))}
                  </ul>
                )}

                <Dropzone
                  id={doc.id}
                  fileName={files[doc.id] ?? null}
                  onFile={(name) => setFiles((prev) => ({ ...prev, [doc.id]: name }))}
                />
              </section>
            ))}
          </div>

          <div className={s.verifySubmit}>
            <button
              type="button"
              className={[s.cta, s.ctaLg].join(' ')}
              disabled={!ready}
              onClick={() => router.push('/onboarding/application-status/documents-received')}
            >
              Upload documents
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
