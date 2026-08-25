'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '../_components/OnboardingFlow';
import s from '../_components/onboarding.module.css';

const DOCS = [
  'Customer Agreement.pdf',
  'Client Agreement.pdf',
  'Form CRS.pdf',
  'Form ADV Part 2A.pdf',
  'ADR Disclosure.pdf',
];

const DocIcon = () => (
  <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M200,224H56a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h96l56,56V216A8,8,0,0,1,200,224Z"/>
    <polyline points="152 32 152 88 208 88"/>
  </svg>
);

export default function TermsPage() {
  const router = useRouter();
  const [checked, setChecked] = useState([false, false, false]);
  const [errors, setErrors] = useState([false, false, false]);
  const [shaking, setShaking] = useState(false);

  const allChecked = checked.every(Boolean);

  function toggle(i: number) {
    const next = [...checked]; next[i] = !next[i];
    setChecked(next);
    if (next[i]) {
      const nextErr = [...errors]; nextErr[i] = false;
      setErrors(nextErr);
    }
  }

  function handleAgree() {
    if (allChecked) { router.push('/onboarding/application-loading'); return; }
    const nextErr = checked.map(c => !c);
    setErrors(nextErr);
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  }

  const TERMS = [
    'I have reviewed the Surmount Client Agreement, Form CRS, and Form ADV Part 2A and understand I am signing this agreement electronically. My electronic signature is the legal equivalent of my manual signature on the Alpaca Customer Agreement and the Surmount Client Agreement.',
    'I have read, understood, and agree to be bound by Alpaca Securities LLC and Surmount, Inc. account terms, and all other terms, disclosures, and disclaimers applicable to me. I also acknowledge that the Alpaca Customer Agreement contains a pre-dispute arbitration clause in Section 43.',
    'By clicking I agree, I understand I am signing this agreement electronically, and that my electronic signature will have the same effect as physically signing and returning the Application Agreement.',
  ];

  return (
    <OnboardingFlow back="/onboarding/investment-allocation">
      <main className={s.main}>
        <div className={`${s.stack} ${s.stackWide}`}>
          <div className={s.hero}>
            <h1 className={s.title}>Review and agree to terms</h1>
            <p className={s.subtitle}>By clicking <strong>I agree</strong>, you accept the terms and conditions provided by Surmount.</p>
          </div>

          <div className={s.docsCard} role="group" aria-label="Documents to review">
            <div>
              <div className={s.docsCardTitle}>Documents to review</div>
              <div className={s.docsCardDesc}>Click any document to open it in a new tab.</div>
            </div>
            <div className={s.docsGrid}>
              {DOCS.map(doc => (
                <a key={doc} className={s.docLink} href="#" target="_blank" rel="noopener">
                  <DocIcon />
                  {doc}
                </a>
              ))}
            </div>
          </div>

          <fieldset className={s.checkGroup} aria-label="Terms acknowledgements">
            {TERMS.map((text, i) => (
              <label key={i} className={s.checkRow}>
                <input
                  type="checkbox"
                  className={`${s.checkInput} ${errors[i] ? s.checkInputError : ''}`}
                  checked={checked[i]}
                  onChange={() => toggle(i)}
                />
                <span className={s.checkLabel}>{text}</span>
              </label>
            ))}
          </fieldset>

          <button
            className={`${s.cta} ${shaking ? s.ctaShaking : ''}`}
            type="button"
            onClick={handleAgree}
            onAnimationEnd={() => setShaking(false)}
          >
            I agree
            <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
            </svg>
          </button>
        </div>
      </main>
    </OnboardingFlow>
  );
}
