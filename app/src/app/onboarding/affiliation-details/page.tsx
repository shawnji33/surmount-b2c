'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '../_components/OnboardingFlow';
import { DSInput } from '../_components/DSInput';
import {
  AFFILIATION_OPTIONS,
  clearAffiliationDraft,
  readAffiliationDraft,
  writeAffiliationDraft,
  type AffiliationId,
} from '../_components/affiliationDraft';
import s from '../_components/onboarding.module.css';

type Details = {
  firmName: string;
  firmAddress: string;
  complianceEmail: string;
  ticker: string;
  interestedFirstName: string;
  interestedLastName: string;
  interestedTitle: string;
  interestedEmail: string;
  interestedPhone: string;
};

type FieldName = keyof Details;
type UploadState = 'empty' | 'uploading' | 'uploaded' | 'error';

const EMPTY_DETAILS: Details = {
  firmName: '',
  firmAddress: '',
  complianceEmail: '',
  ticker: '',
  interestedFirstName: '',
  interestedLastName: '',
  interestedTitle: '',
  interestedEmail: '',
  interestedPhone: '',
};

const FIELD_LABELS: Record<FieldName, string> = {
  firmName: 'Company or firm name',
  firmAddress: 'Company or firm address',
  complianceEmail: 'Company or firm compliance email',
  ticker: 'Ticker symbol',
  interestedFirstName: 'Interested party first name',
  interestedLastName: 'Interested party last name',
  interestedTitle: 'Interested party title',
  interestedEmail: 'Interested party email address',
  interestedPhone: 'Interested party telephone number',
};

function UploadIcon() {
  return (
    <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="128" y1="144" x2="128" y2="32" />
      <polyline points="216 144 216 208 40 208 40 144" />
      <polyline points="88 72 128 32 168 72" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M200,224H56a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h96l56,56V216A8,8,0,0,1,200,224Z" />
      <polyline points="152 32 152 88 208 88" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" aria-hidden="true">
      <line x1="200" y1="56" x2="56" y2="200" />
      <line x1="200" y1="200" x2="56" y2="56" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
    </svg>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function AffiliationDetailsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTimerRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<AffiliationId[]>([]);
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [errors, setErrors] = useState<Partial<Record<FieldName | 'approvalLetter', string>>>({});
  const [uploadState, setUploadState] = useState<UploadState>('empty');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const draft = readAffiliationDraft();
    if (!draft) {
      router.replace('/onboarding/regulatory');
      return;
    }
    setSelected(draft.selected);
    setReady(true);
  }, [router]);

  useEffect(() => () => {
    if (uploadTimerRef.current !== null) window.clearInterval(uploadTimerRef.current);
  }, []);

  function updateField(field: FieldName, value: string) {
    setDetails(previous => ({ ...previous, [field]: value }));
    setErrors(previous => ({ ...previous, [field]: undefined }));
  }

  function removeSelection(id: AffiliationId) {
    const next = selected.filter(item => item !== id);
    if (!next.length) {
      clearAffiliationDraft();
      router.push('/onboarding/regulatory');
      return;
    }
    setSelected(next);
    writeAffiliationDraft(next);
  }

  function beginUpload(file: File) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadState('error');
      setErrors(previous => ({ ...previous, approvalLetter: 'Upload a PDF version of the signed approval letter.' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadState('error');
      setErrors(previous => ({ ...previous, approvalLetter: 'The approval letter must be 10 MB or smaller.' }));
      return;
    }

    if (uploadTimerRef.current !== null) window.clearInterval(uploadTimerRef.current);
    setFileName(file.name);
    setFileSize(formatSize(file.size));
    setProgress(12);
    setUploadState('uploading');
    setErrors(previous => ({ ...previous, approvalLetter: undefined }));

    uploadTimerRef.current = window.setInterval(() => {
      setProgress(previous => {
        const next = Math.min(previous + (previous < 70 ? 17 : 10), 100);
        if (next === 100 && uploadTimerRef.current !== null) {
          window.clearInterval(uploadTimerRef.current);
          uploadTimerRef.current = null;
          setUploadState('uploaded');
        }
        return next;
      });
    }, 220);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) beginUpload(file);
    event.target.value = '';
  }

  function removeFile() {
    if (uploadTimerRef.current !== null) window.clearInterval(uploadTimerRef.current);
    uploadTimerRef.current = null;
    setUploadState('empty');
    setFileName('');
    setFileSize('');
    setProgress(0);
  }

  function validate() {
    const next: Partial<Record<FieldName | 'approvalLetter', string>> = {};
    (Object.keys(EMPTY_DETAILS) as FieldName[]).forEach(field => {
      const value = details[field].trim();
      if (!value) next[field] = `${FIELD_LABELS[field]} is required.`;
    });

    if (details.complianceEmail && !isValidEmail(details.complianceEmail)) {
      next.complianceEmail = 'Enter a valid compliance email address.';
    }
    if (details.interestedEmail && !isValidEmail(details.interestedEmail)) {
      next.interestedEmail = 'Enter a valid interested-party email address.';
    }
    if (details.interestedPhone && details.interestedPhone.replace(/\D/g, '').length < 7) {
      next.interestedPhone = 'Enter a valid telephone number.';
    }
    if (uploadState !== 'uploaded') {
      next.approvalLetter = uploadState === 'uploading'
        ? 'Wait for the approval letter to finish uploading.'
        : 'Upload the signed approval letter to continue.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleContinue() {
    if (!validate()) return;
    clearAffiliationDraft();
    router.push('/onboarding/investing-style');
  }

  if (!ready) {
    return (
      <OnboardingFlow back="/onboarding/regulatory">
        <main className={s.affiliationMain} aria-live="polite">
          <p className={s.affiliationLoading}>Preparing your disclosure form…</p>
        </main>
      </OnboardingFlow>
    );
  }

  return (
    <OnboardingFlow back="/onboarding/regulatory">
      <main className={s.affiliationMain}>
        <form className={s.affiliationContent} onSubmit={event => { event.preventDefault(); handleContinue(); }} noValidate>
          <div className={s.affiliationHero}>
            <h1 className={s.affiliationTitle}>Tell us about these affiliations</h1>
            <p className={s.affiliationSubtitle}>We need a few details and a signed approval letter to complete this part of your application.</p>
          </div>

          <section className={s.affiliationSelection} aria-labelledby="selected-affiliations-title">
            <div className={s.affiliationSectionHeading}>
              <h2 id="selected-affiliations-title">Selected situations</h2>
              <button className={s.affiliationEditLink} type="button" onClick={() => router.push('/onboarding/regulatory')}>Edit selections</button>
            </div>
            <div className={s.affiliationChips}>
              {selected.map(id => {
                const option = AFFILIATION_OPTIONS.find(item => item.id === id);
                if (!option) return null;
                return (
                  <button key={id} className={s.affiliationChip} type="button" onClick={() => removeSelection(id)} aria-label={`Remove ${option.label}`}>
                    <span>{option.label}</span>
                    <CloseIcon />
                  </button>
                );
              })}
            </div>
          </section>

          <section className={s.affiliationSection} aria-labelledby="firm-details-title">
            <div className={s.affiliationSectionHeading}>
              <div>
                <h2 id="firm-details-title">Company or firm details</h2>
                <p>Use the firm responsible for the affiliation or approval letter.</p>
              </div>
            </div>
            <div className={s.affiliationFields}>
              <DSInput label={FIELD_LABELS.firmName} value={details.firmName} onChange={event => updateField('firmName', event.target.value)} error={Boolean(errors.firmName)} errorText={errors.firmName} autoComplete="organization" />
              <DSInput label={FIELD_LABELS.firmAddress} value={details.firmAddress} onChange={event => updateField('firmAddress', event.target.value)} error={Boolean(errors.firmAddress)} errorText={errors.firmAddress} autoComplete="street-address" />
              <DSInput label={FIELD_LABELS.complianceEmail} type="email" value={details.complianceEmail} onChange={event => updateField('complianceEmail', event.target.value)} error={Boolean(errors.complianceEmail)} errorText={errors.complianceEmail} autoComplete="email" inputMode="email" />
              <DSInput label={FIELD_LABELS.ticker} value={details.ticker} onChange={event => updateField('ticker', event.target.value.toUpperCase())} error={Boolean(errors.ticker)} errorText={errors.ticker} autoCapitalize="characters" />
            </div>
          </section>

          <section className={s.affiliationSection} aria-labelledby="interested-party-title">
            <div className={s.affiliationSectionHeading}>
              <div>
                <h2 id="interested-party-title">Interested party</h2>
                <p>Who should receive duplicate statements or trade confirmations, if requested?</p>
              </div>
            </div>
            <div className={`${s.affiliationFields} ${s.affiliationFieldsTwoColumn}`}>
              <DSInput label={FIELD_LABELS.interestedFirstName} value={details.interestedFirstName} onChange={event => updateField('interestedFirstName', event.target.value)} error={Boolean(errors.interestedFirstName)} errorText={errors.interestedFirstName} autoComplete="given-name" />
              <DSInput label={FIELD_LABELS.interestedLastName} value={details.interestedLastName} onChange={event => updateField('interestedLastName', event.target.value)} error={Boolean(errors.interestedLastName)} errorText={errors.interestedLastName} autoComplete="family-name" />
              <DSInput label={FIELD_LABELS.interestedTitle} value={details.interestedTitle} onChange={event => updateField('interestedTitle', event.target.value)} error={Boolean(errors.interestedTitle)} errorText={errors.interestedTitle} autoComplete="organization-title" />
              <DSInput label={FIELD_LABELS.interestedEmail} type="email" value={details.interestedEmail} onChange={event => updateField('interestedEmail', event.target.value)} error={Boolean(errors.interestedEmail)} errorText={errors.interestedEmail} autoComplete="email" inputMode="email" />
              <DSInput label={FIELD_LABELS.interestedPhone} type="tel" value={details.interestedPhone} onChange={event => updateField('interestedPhone', event.target.value)} error={Boolean(errors.interestedPhone)} errorText={errors.interestedPhone} autoComplete="tel" inputMode="tel" />
            </div>
          </section>

          <section className={s.affiliationSection} aria-labelledby="approval-letter-title">
            <div className={s.affiliationSectionHeading}>
              <div>
                <h2 id="approval-letter-title">Signed approval letter</h2>
                <p>Upload it as <strong>account_approval_letter</strong>.</p>
              </div>
            </div>
            <div className={s.affiliationLetterNote}>
              <span className={s.affiliationLetterNoteIcon} aria-hidden="true"><FileIcon /></span>
              <div>
                <p>The letter must be on company letterhead, signed by a compliance officer, and give permission to open and carry the account.</p>
                <ul>
                  <li>Include your full name and the interested party&apos;s name, title, email address, and telephone number.</li>
                  <li>State whether the firm requires duplicate account statements or trade confirmations.</li>
                </ul>
              </div>
            </div>

            {uploadState === 'empty' || uploadState === 'error' ? (
              <label
                className={`${s.affiliationUploadZone} ${uploadState === 'error' ? s.affiliationUploadZoneError : ''}`}
                onDragOver={event => { event.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={event => {
                  event.preventDefault();
                  setDragging(false);
                  const file = event.dataTransfer.files[0];
                  if (file) beginUpload(file);
                }}
                data-dragging={dragging || undefined}
              >
                <input ref={fileInputRef} className={s.affiliationFileInput} type="file" accept="application/pdf,.pdf" onChange={handleFileChange} />
                <span className={s.affiliationUploadIcon}><UploadIcon /></span>
                <span className={s.affiliationUploadCopy}><strong>{uploadState === 'error' ? 'Try another PDF' : 'Click to upload'}</strong> or drag and drop</span>
                <span className={s.affiliationUploadHint}>PDF only · Max 10 MB</span>
              </label>
            ) : (
              <div className={s.affiliationUploadRow} aria-live="polite">
                <span className={s.affiliationFileIcon}><FileIcon /></span>
                <div className={s.affiliationUploadInfo}>
                  <div className={s.affiliationUploadMeta}>
                    <span>{fileName}</span>
                    <span>{uploadState === 'uploading' ? `${progress}%` : fileSize}</span>
                  </div>
                  {uploadState === 'uploading' ? <div className={s.affiliationProgressTrack}><div style={{ width: `${progress}%` }} /></div> : <span className={s.affiliationUploadComplete}>Upload complete</span>}
                </div>
                <button className={s.affiliationFileRemove} type="button" onClick={removeFile} aria-label="Remove approval letter"><CloseIcon /></button>
              </div>
            )}
            {errors.approvalLetter && <p className={s.affiliationUploadError} role="alert">{errors.approvalLetter}</p>}
          </section>

          <button className={s.cta} type="submit">
            Continue
            <ArrowIcon />
          </button>
        </form>
      </main>
    </OnboardingFlow>
  );
}
