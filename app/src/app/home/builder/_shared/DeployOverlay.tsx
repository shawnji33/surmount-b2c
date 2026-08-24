'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, X } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import s from './DeployOverlay.module.css';

const QUICK_AMOUNTS = [100, 500, 1000];
const FREQUENCIES = ['One time', 'Weekly', 'Monthly'];
const ACCOUNTS = [
  { name: 'Alpaca', logo: '/assets/brokers/alpaca.png' },
  { name: 'Charles Schwab', logo: '/assets/brokers/av-schwab.png' },
];

// Transitions.dev "Number pop-in" — each character of the amount gets its own span, keyed by
// `${index}-${char}` so React remounts only the characters that actually changed value (not the
// whole number), which is what makes CSS `animation` on .digit replay for just that character.
// This is the idiomatic React equivalent of the reference's manual "remove class, force reflow,
// re-add class" replay recipe — a keyed remount achieves the same "play from scratch" outcome
// without imperative DOM work.
function AmountDigits({ text }: { text: string }) {
  return (
    <span className={s.digitGroup} aria-hidden="true">
      {text.split('').map((ch, i) => (
        <span key={`${i}-${ch}`} className={s.digit} style={{ animationDelay: `${i * 30}ms` }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

export function DeployOverlay({ strategyName, onClose }: { strategyName: string; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'fund' | 'review' | 'success'>('fund');
  const [amount, setAmount] = useState('');
  const [activePill, setActivePill] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<string>(FREQUENCIES[0]);
  const [account, setAccount] = useState<string>(ACCOUNTS[0].name);
  const [depositing, setDepositing] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Radix's Select dismisses itself on Escape first — if it already handled the key (or is
      // still open), don't also close the whole overlay underneath it.
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if (document.querySelector('[data-slot="select-content"]')) return;
      onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!mounted) return null;

  function pickAmount(v: number) {
    setAmount(String(v));
    setActivePill(v);
  }

  function deposit() {
    setDepositing(true);
    window.setTimeout(() => {
      setDepositing(false);
      setStep('success');
    }, 700);
  }

  const selectedAccount = ACCOUNTS.find((a) => a.name === account) ?? ACCOUNTS[0];
  const amountLabel = amount || '0';

  return createPortal(
    <div className={s.overlay} role="dialog" aria-modal="true" aria-label={`Deploy ${strategyName}`}>
      <div className={s.topBar}>
        <div className={s.topLeft}>
          <button type="button" className={s.backBtn} onClick={onClose} aria-label="Back">
            <ArrowLeft weight="regular" />
          </button>
          <span className={s.topTitle}>Deploy &quot;{strategyName}&quot;</span>
        </div>
        <button type="button" className={s.closeBtn} onClick={onClose} aria-label="Close">
          <X weight="regular" />
        </button>
      </div>

      <div className={s.body}>
        {step === 'success' ? (
          <div className={s.card}>
            <div className={s.successWrap}>
              <span className={s.successCheck} data-state="in" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" fill="var(--color-bg-success-primary)" />
                  <path
                    d="M14 24 L21 31 L34 16"
                    stroke="var(--color-bg-success-solid)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className={s.successTitle}>Deployed successfully</div>
              <p className={s.successDesc}>
                ${Number(amountLabel).toLocaleString()} will be deposited into &quot;{strategyName}&quot; via {account}.
              </p>
              <Button type="button" onClick={onClose}>Done</Button>
            </div>
          </div>
        ) : (
          // Transitions.dev "Page side-by-side" — the active page remains in normal flow while
          // its exiting counterpart is layered, so the card follows the active step's natural height.
          <div className={s.card}>
            <div className={s.pageSlide} data-page={step === 'review' ? '2' : '1'}>
              <section className={s.page} data-page-id="1" aria-hidden={step !== 'fund'}>
                <div className={s.cardTitle}>Fund &quot;{strategyName}&quot;</div>

                <div className={s.amountWrap}>
                  <span className={s.currency}>$</span>
                  <span className={s.amountStack}>
                    <AmountDigits text={amountLabel} />
                    <input
                      type="text"
                      inputMode="decimal"
                      className={s.amountInput}
                      placeholder="0"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value.replace(/[^0-9.]/g, ''));
                        setActivePill(null);
                      }}
                      aria-label="Deploy amount"
                      tabIndex={step === 'fund' ? 0 : -1}
                    />
                  </span>
                </div>

                <div className={s.pills}>
                  {QUICK_AMOUNTS.map((v) => (
                    <button
                      type="button"
                      key={v}
                      className={[s.pill, activePill === v ? s.pillActive : ''].filter(Boolean).join(' ')}
                      onClick={() => pickAmount(v)}
                      aria-pressed={activePill === v}
                    >
                      ${v.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className={s.row}>
                  <span className={s.rowLabel}>Frequency</span>
                  <div className={s.rowControl}>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger className={s.selectTrigger} aria-label="Frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className={s.divider} />

                <div className={s.row}>
                  <span className={s.rowLabel}>Account</span>
                  <div className={s.rowControl}>
                    <Select value={account} onValueChange={setAccount}>
                      <SelectTrigger className={s.selectTrigger} aria-label="Account">
                        <SelectValue>
                          <span className={s.accountValue}>
                            <Avatar size="sm">
                              <AvatarImage src={selectedAccount.logo} alt="" />
                              <AvatarFallback>{selectedAccount.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            {selectedAccount.name}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOUNTS.map((a) => (
                          <SelectItem key={a.name} value={a.name}>
                            <span className={s.accountValue}>
                              <Avatar size="sm">
                                <AvatarImage src={a.logo} alt="" />
                                <AvatarFallback>{a.name.slice(0, 2)}</AvatarFallback>
                              </Avatar>
                              {a.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className={s.hint}>Available cash: $125,125.68</span>
                  </div>
                </div>

                <Button type="button" disabled={!amount} onClick={() => setStep('review')}>Next</Button>
              </section>

              <section className={s.page} data-page-id="2" aria-hidden={step !== 'review'}>
                <div className={s.cardTitle}>Review deposit</div>

                <div className={s.reviewSummary}>
                  <div className={s.reviewRow}>
                    <span className={s.rowLabel}>Amount</span>
                    <span className={s.reviewValue}>${Number(amountLabel).toLocaleString()}</span>
                  </div>
                  <div className={s.reviewRow}>
                    <span className={s.rowLabel}>Frequency</span>
                    <span className={s.reviewValue}>{frequency}</span>
                  </div>
                  <div className={s.reviewRow}>
                    <span className={s.rowLabel}>Account</span>
                    <span className={[s.reviewValue, s.accountValue].join(' ')}>
                      <Avatar size="sm">
                        <AvatarImage src={selectedAccount.logo} alt="" />
                        <AvatarFallback>{selectedAccount.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      {selectedAccount.name}
                    </span>
                  </div>
                  <div className={s.divider} />
                  <div className={s.reviewRow}>
                    <span className={s.rowLabel}>Strategy</span>
                    <span className={s.reviewValue}>&quot;{strategyName}&quot;</span>
                  </div>
                </div>

                <Button type="button" disabled={depositing} onClick={deposit}>
                  {depositing ? 'Depositing…' : 'Deposit money'}
                </Button>
                <button type="button" className={s.reviewBack} onClick={() => setStep('fund')}>
                  <ArrowLeft weight="regular" />
                  Back
                </button>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
