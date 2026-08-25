'use client';

// Edge-case DRAFTS for the deposit / withdraw / recurring / update-bank flows.
// Each frame reuses the deposit-modal design language (home/page.module.css) plus
// a small set of new patterns in edgecases.module.css. Rendered as a static gallery
// for review + Figma capture. Not wired into the live flow.

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { AccountSelectorCard } from '@/components/AccountSelectorCard';
import { Toggle } from '../home/_components/Toggle';
import { BANK_SELECTABLE, SURMOUNT_SELECTABLE, SURMOUNT_GROUPS, HYCA_SELECTABLE } from '../home/_data';
import s from '../home/page.module.css';
import e from './edgecases.module.css';

const AMT_DOLLAR = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--font-size-text-xl)',
  fontWeight: 500,
  color: 'var(--color-fg-primary-900)',
  letterSpacing: '-0.5px',
  lineHeight: 1,
} as const;

/* ── shared bits ── */
function CloseX() {
  return (
    <button type="button" className={s.modalCloseBtn} aria-label="Close">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    </button>
  );
}

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={e.frame} style={{ width: 560 }}>
      <span className={e.frameLabel}>{label}</span>
      {children}
    </div>
  );
}

function Sheet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={s.modalSheet} style={{ width: 560, maxWidth: 560 }}>
      <div className={s.modalStepContent}>
        <div className={s.modalHeader}>
          <span className={s.modalTitle}>{title}</span>
          <CloseX />
        </div>
        <div className={s.modalBody}>{children}</div>
      </div>
    </div>
  );
}

function QuickAmounts({ active }: { active?: string }) {
  return (
    <div className={s.quickAmounts}>
      {['$100', '$500', '$1k', '$5k'].map((l) => (
        <button key={l} type="button" className={[s.quickAmountBtn, active === l ? s.quickAmountBtnActive : ''].filter(Boolean).join(' ')}>
          {l}
        </button>
      ))}
    </div>
  );
}

function AmountField(props: { value?: string; error?: boolean; errorText?: string; helperText?: string }) {
  return (
    <Input
      size="lg"
      label="Amount"
      type="text"
      readOnly
      value={props.value ?? ''}
      placeholder="0.00"
      error={props.error}
      errorText={props.errorText}
      helperText={props.helperText}
      iconLeading={<span style={AMT_DOLLAR}>$</span>}
    />
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={s.transferSection}>
      <span className={s.transferSectionLabel}>{label}</span>
      {children}
    </div>
  );
}

function ArrowDown() {
  return (
    <div className={s.arrowDivider} aria-hidden="true">
      <div className={s.arrowCircle}>
        <svg viewBox="0 0 256 256" fill="currentColor">
          <path d="M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z" />
        </svg>
      </div>
    </div>
  );
}

function Banner({ tone, icon, children }: { tone: 'warning' | 'info'; icon: 'warning' | 'info'; children: React.ReactNode }) {
  return (
    <div className={[e.banner, tone === 'warning' ? e.bannerWarning : e.bannerInfo].join(' ')}>
      <svg className={e.bannerIcon} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
        {icon === 'warning' ? (
          <path d="M236.8,188.09,149.35,36.22a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z" />
        ) : (
          <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm12,144a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40a8,8,0,0,0,8,8Zm-16-88a12,12,0,1,1,12-12A12,12,0,0,1,124,80Z" />
        )}
      </svg>
      <span>{children}</span>
    </div>
  );
}

const cardBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  width: '100%',
  padding: 16,
  border: '1px solid var(--color-border-primary, rgba(0,0,0,0.086))',
  borderRadius: 16,
  background: 'var(--color-bg-primary, #fff)',
};

function BankChaseLogo() {
  return (
    <div className={e.bankEmptyIcon}>
      <img src="/assets/illustrations/bank-chase.png" alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
    </div>
  );
}

/* ── the gallery ── */
export default function TransferEdgeCasesPage() {
  return (
    <div className={e.page}>
      {/* ─────────── Result & failure ─────────── */}
      <h2 className={e.groupTitle}>Result &amp; failure states</h2>
      <div className={e.grid}>
        <Frame label="Deposit · Failed">
          <div className={s.modalSheet} style={{ width: 560, maxWidth: 560 }}>
            <div className={s.modalStepContent}>
              <div className={s.modalHeader} style={{ justifyContent: 'flex-end' }}>
                <CloseX />
              </div>
              <div className={[s.modalBody, s.confirmModalBody].join(' ')}>
                <div className={s.successBody}>
                  <span className={[e.resultMark, e.resultMarkError].join(' ')} aria-hidden="true">
                    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
                      <path d="M17 17l14 14M31 17l-14 14" />
                    </svg>
                  </span>
                  <h2 className={s.successTitle}>Deposit couldn&rsquo;t be completed</h2>
                  <span className={s.successAmount}>$1,000.00</span>
                  <p className={[s.depositDisclaimer, s.successDisclaimer].join(' ')}>
                    Your bank declined this transfer. No money has moved. Check your balance and try again, or contact support if this keeps happening.
                  </p>
                  <button type="button" className={s.depositCta}>Try again</button>
                  <a className={s.depositSecondaryCta} href="#">Contact support</a>
                </div>
              </div>
            </div>
          </div>
        </Frame>

        <Frame label="Deposit · Pending / initiated">
          <div className={s.modalSheet} style={{ width: 560, maxWidth: 560 }}>
            <div className={s.modalStepContent}>
              <div className={s.modalHeader} style={{ justifyContent: 'flex-end' }}>
                <CloseX />
              </div>
              <div className={[s.modalBody, s.confirmModalBody].join(' ')}>
                <div className={s.successBody}>
                  <span className={[e.resultMark, e.resultMarkPending].join(' ')} aria-hidden="true">
                    <svg viewBox="0 0 256 256" fill="currentColor">
                      <path d="M128,40a88,88,0,1,0,88,88A88.1,88.1,0,0,0,128,40Zm0,160a72,72,0,1,1,72-72A72.08,72.08,0,0,1,128,200Zm64-72a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z" />
                    </svg>
                  </span>
                  <h2 className={s.successTitle}>Deposit on the way</h2>
                  <span className={s.successAmount}>$1,000.00</span>
                  <span className={s.successTime}>Arrives by Jul 9 · 1–4 business days</span>
                  <p className={[s.depositDisclaimer, s.successDisclaimer].join(' ')}>
                    We&rsquo;ve started your deposit. You can track its status anytime from Activity.
                  </p>
                  <button type="button" className={s.depositCta}>Done</button>
                  <a className={s.depositSecondaryCta} href="/activity">Track in Activity</a>
                </div>
              </div>
            </div>
          </div>
        </Frame>

        <Frame label="Close mid-flow · Discard confirm">
          <div className={e.dialogSheet}>
            <span className={e.dialogTitle}>Discard this transfer?</span>
            <p className={e.dialogBody}>
              You&rsquo;ve entered an amount and account. If you close now, these details won&rsquo;t be saved.
            </p>
            <div className={e.dialogActions}>
              <Button variant="secondary">Keep editing</Button>
              <Button variant="destructive">Discard</Button>
            </div>
          </div>
        </Frame>
      </div>

      {/* ─────────── Amount validation ─────────── */}
      <h2 className={e.groupTitle}>Amount validation &amp; limits</h2>
      <div className={e.grid}>
        <Frame label="Withdraw · Exceeds available balance">
          <Sheet title="Withdrawal">
            <div className={s.amountSection}>
              <AmountField value="15,000" error errorText="Exceeds your available balance of $10,432.18." />
              <QuickAmounts />
            </div>
            <hr className={s.sectionDivider} />
            <Section label="From"><AccountSelectorCard selected={SURMOUNT_SELECTABLE} groups={SURMOUNT_GROUPS} /></Section>
            <ArrowDown />
            <Section label="To"><AccountSelectorCard selected={BANK_SELECTABLE} readOnly trailingAction={{ label: 'Update' }} /></Section>
            <button type="button" className={s.depositCta} disabled>Continue</button>
          </Sheet>
        </Frame>

        <Frame label="Deposit · Below minimum">
          <Sheet title="Deposit">
            <div className={s.amountSection}>
              <AmountField value="0.50" error errorText="Enter at least $1.00." />
              <QuickAmounts />
            </div>
            <hr className={s.sectionDivider} />
            <Section label="From"><AccountSelectorCard selected={BANK_SELECTABLE} readOnly trailingAction={{ label: 'Update' }} /></Section>
            <ArrowDown />
            <Section label="To"><AccountSelectorCard selected={SURMOUNT_SELECTABLE} groups={SURMOUNT_GROUPS} /></Section>
            <button type="button" className={s.depositCta} disabled>Continue</button>
          </Sheet>
        </Frame>

        <Frame label="Deposit · Over daily limit">
          <Sheet title="Deposit">
            <div className={s.amountSection}>
              <AmountField value="75,000" error errorText="Above your $50,000 daily transfer limit." />
              <QuickAmounts />
            </div>
            <Banner tone="info" icon="info">
              Need to move more? Larger transfers can be arranged with our team.
            </Banner>
            <hr className={s.sectionDivider} />
            <Section label="From"><AccountSelectorCard selected={BANK_SELECTABLE} readOnly trailingAction={{ label: 'Update' }} /></Section>
            <ArrowDown />
            <Section label="To"><AccountSelectorCard selected={SURMOUNT_SELECTABLE} groups={SURMOUNT_GROUPS} /></Section>
            <button type="button" className={s.depositCta} disabled>Continue</button>
          </Sheet>
        </Frame>
      </div>

      {/* ─────────── Account states ─────────── */}
      <h2 className={e.groupTitle}>Funding-source states</h2>
      <div className={e.grid}>
        <Frame label="Deposit · No bank linked">
          <Sheet title="Deposit">
            <div className={s.amountSection}>
              <AmountField />
              <QuickAmounts />
            </div>
            <hr className={s.sectionDivider} />
            <Section label="From">
              <button type="button" className={e.bankEmptyCard}>
                <span className={e.bankEmptyIcon}>
                  <svg viewBox="0 0 256 256" fill="currentColor"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" /></svg>
                </span>
                <span className={e.bankEmptyText}>
                  <span className={e.bankEmptyTitle}>No bank linked</span>
                  <span className={e.bankEmptyMeta}>Connect a funding source to deposit</span>
                </span>
                <span className={e.bankEmptyLink}>Link a bank</span>
              </button>
            </Section>
            <ArrowDown />
            <Section label="To"><AccountSelectorCard selected={SURMOUNT_SELECTABLE} groups={SURMOUNT_GROUPS} /></Section>
            <button type="button" className={s.depositCta} disabled>Continue</button>
          </Sheet>
        </Frame>

        <Frame label="Deposit · Multiple linked banks">
          <Sheet title="Deposit">
            <div className={s.amountSection}>
              <AmountField value="1,000" />
              <QuickAmounts active="$1k" />
            </div>
            <hr className={s.sectionDivider} />
            <Section label="From">
              <div style={{ border: '1px solid var(--color-border-primary, rgba(0,0,0,0.086))', borderRadius: 16, overflow: 'hidden' }}>
                {[
                  { name: 'Chase Total Checking', meta: 'Checking · 4823', checked: true, chase: true },
                  { name: 'Bank of America', meta: 'Checking · 1180', checked: false, chase: false },
                ].map((b, i) => (
                  <div key={b.name} style={{ ...cardBase, border: 'none', borderTop: i ? '1px solid var(--color-border-tertiary, rgba(0,0,0,0.05))' : 'none', borderRadius: 0, background: b.checked ? 'var(--color-bg-secondary, #fafafa)' : '#fff' }}>
                    {b.chase ? <BankChaseLogo /> : (
                      <span className={e.bankEmptyIcon}>
                        <svg viewBox="0 0 256 256" fill="currentColor"><path d="M24,104H48v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16H208V104h24a8,8,0,0,0,4.19-14.81l-104-64a8,8,0,0,0-8.38,0l-104,64A8,8,0,0,0,24,104Zm40,0H96v64H64Zm80,0v64H112V104Zm48,64H160V104h32ZM128,41.39,203.74,88H52.26ZM240,208a8,8,0,0,1-8,8H24a8,8,0,0,1,0-16H232A8,8,0,0,1,240,208Z" /></svg>
                      </span>
                    )}
                    <div className={e.bankEmptyText}>
                      <span className={e.bankEmptyTitle}>{b.name}</span>
                      <span className={e.bankEmptyMeta}>{b.meta}</span>
                    </div>
                    <span style={{ width: 20, height: 20, borderRadius: 999, flexShrink: 0, border: b.checked ? '6px solid var(--color-fg-primary-900, #181d27)' : '1.5px solid rgba(10,13,18,0.24)' }} />
                  </div>
                ))}
              </div>
            </Section>
            <ArrowDown />
            <Section label="To"><AccountSelectorCard selected={SURMOUNT_SELECTABLE} groups={SURMOUNT_GROUPS} /></Section>
            <button type="button" className={s.depositCta}>Continue</button>
          </Sheet>
        </Frame>

        <Frame label="Deposit · Bank verification pending">
          <Sheet title="Deposit">
            <div className={s.amountSection}>
              <AmountField value="1,000" />
              <QuickAmounts active="$1k" />
            </div>
            <hr className={s.sectionDivider} />
            <Section label="From">
              <div style={cardBase}>
                <BankChaseLogo />
                <div className={e.bankEmptyText}>
                  <span className={e.bankEmptyTitle}>Chase Total Checking</span>
                  <span className={e.bankEmptyMeta}>Checking · 4823</span>
                </div>
                <span className={[e.badge, e.badgeWarning].join(' ')}>
                  <svg className={e.badgeIcon} viewBox="0 0 256 256" fill="currentColor"><path d="M128,40a88,88,0,1,0,88,88A88.1,88.1,0,0,0,128,40Zm0,160a72,72,0,1,1,72-72A72.08,72.08,0,0,1,128,200Zm64-72a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z" /></svg>
                  Verifying
                </span>
              </div>
            </Section>
            <Banner tone="warning" icon="warning">
              <span className={e.bannerStrong}>Verifying your bank.</span> You can deposit once it&rsquo;s confirmed — usually 1–2 business days.
            </Banner>
            <ArrowDown />
            <Section label="To"><AccountSelectorCard selected={SURMOUNT_SELECTABLE} groups={SURMOUNT_GROUPS} /></Section>
            <button type="button" className={s.depositCta} disabled>Continue</button>
          </Sheet>
        </Frame>
      </div>

      {/* ─────────── Recurring ─────────── */}
      <h2 className={e.groupTitle}>Recurring deposit</h2>
      <div className={e.grid}>
        <Frame label="Repeat · End condition">
          <Sheet title="Deposit">
            <div className={s.amountSection}>
              <AmountField value="500" />
              <QuickAmounts active="$500" />
            </div>
            <div className={s.repeatCard}>
              <div className={s.repeatRow}>
                <div className={s.repeatToggleGroup}>
                  <span className={s.repeatLabel}>Repeat</span>
                  <Toggle on onChange={() => {}} />
                </div>
                <div className={s.repeatControls} data-visible="true">
                  <button type="button" className={s.startsBtn}>
                    Starts today
                    <svg viewBox="0 0 256 256" fill="currentColor" style={{ width: 14, height: 14, color: 'rgba(10,13,18,0.35)', flexShrink: 0 }}>
                      <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160,136,75.31,152.69,92,68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188,164,103.31,180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z" />
                    </svg>
                  </button>
                  <span className={s.freqPill}>Bi-weekly
                    <svg viewBox="0 0 14 14" style={{ width: 14, height: 14, stroke: 'rgba(10,13,18,0.4)', fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', flexShrink: 0 }}><polyline points="3 5 7 9 11 5" /></svg>
                  </span>
                </div>
              </div>
              <div className={e.endsRow}>
                <span className={e.endsLabel}>Ends</span>
                <span className={s.freqPill}>After 12 deposits
                  <svg viewBox="0 0 14 14" style={{ width: 14, height: 14, stroke: 'rgba(10,13,18,0.4)', fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', flexShrink: 0 }}><polyline points="3 5 7 9 11 5" /></svg>
                </span>
              </div>
            </div>
            <hr className={s.sectionDivider} />
            <Section label="From"><AccountSelectorCard selected={BANK_SELECTABLE} readOnly trailingAction={{ label: 'Update' }} /></Section>
            <ArrowDown />
            <Section label="To"><AccountSelectorCard selected={SURMOUNT_SELECTABLE} groups={SURMOUNT_GROUPS} /></Section>
            <button type="button" className={s.depositCta}>Continue</button>
          </Sheet>
        </Frame>

        <Frame label="Repeat · Weekend start adjusted">
          <Sheet title="Deposit">
            <div className={s.amountSection}>
              <AmountField value="500" />
              <QuickAmounts active="$500" />
            </div>
            <div className={s.repeatCard}>
              <div className={s.repeatRow}>
                <div className={s.repeatToggleGroup}>
                  <span className={s.repeatLabel}>Repeat</span>
                  <Toggle on onChange={() => {}} />
                </div>
                <div className={s.repeatControls} data-visible="true">
                  <button type="button" className={s.startsBtn}>
                    Starts Mon, Jul 6
                    <svg viewBox="0 0 256 256" fill="currentColor" style={{ width: 14, height: 14, color: 'rgba(10,13,18,0.35)', flexShrink: 0 }}>
                      <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160,136,75.31,152.69,92,68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188,164,103.31,180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z" />
                    </svg>
                  </button>
                  <span className={s.freqPill}>Weekly
                    <svg viewBox="0 0 14 14" style={{ width: 14, height: 14, stroke: 'rgba(10,13,18,0.4)', fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', flexShrink: 0 }}><polyline points="3 5 7 9 11 5" /></svg>
                  </span>
                </div>
              </div>
              <div className={e.endsRow} style={{ borderTop: 'none', paddingTop: 4, marginTop: 0 }}>
                <Banner tone="info" icon="info">
                  Transfers don&rsquo;t run on weekends. Your Jul 4 pick moves to <span className={e.bannerStrong}>Mon, Jul 6</span>.
                </Banner>
              </div>
            </div>
            <hr className={s.sectionDivider} />
            <Section label="From"><AccountSelectorCard selected={BANK_SELECTABLE} readOnly trailingAction={{ label: 'Update' }} /></Section>
            <ArrowDown />
            <Section label="To"><AccountSelectorCard selected={SURMOUNT_SELECTABLE} groups={SURMOUNT_GROUPS} /></Section>
            <button type="button" className={s.depositCta}>Continue</button>
          </Sheet>
        </Frame>

        <Frame label="Manage recurring deposits">
          <Sheet title="Recurring deposits">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { amt: '$500.00', freq: 'Bi-weekly', next: 'Next Jul 17 · to Surmount Investing' },
                { amt: '$250.00', freq: 'Monthly', next: 'Next Aug 1 · to High Yield Cash' },
              ].map((r) => (
                <div key={r.amt} className={e.manageRow}>
                  <span className={e.bankEmptyIcon}>
                    <svg viewBox="0 0 256 256" fill="currentColor"><path d="M128,40a88,88,0,1,0,88,88A88.1,88.1,0,0,0,128,40Zm0,160a72,72,0,1,1,72-72A72.08,72.08,0,0,1,128,200Zm64-72a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z" /></svg>
                  </span>
                  <div className={e.manageInfo}>
                    <span className={e.manageTitle}>{r.amt} · {r.freq}</span>
                    <span className={e.manageMeta}>{r.next}</span>
                  </div>
                  <div className={e.manageActions}>
                    <Button variant="secondary" size="sm" fullWidth={false}>Edit</Button>
                  </div>
                </div>
              ))}
            </div>
            <p className={s.depositDisclaimer} style={{ marginTop: 4 }}>
              Editing or canceling only affects future transfers.
            </p>
            <button type="button" className={s.depositCta}>Set up a new recurring deposit</button>
          </Sheet>
        </Frame>
      </div>

      {/* ─────────── Update-bank guards ─────────── */}
      <h2 className={e.groupTitle}>Update-bank guards</h2>
      <div className={e.grid}>
        <Frame label="Update mid-transfer · Leave confirm">
          <div className={e.dialogSheet}>
            <span className={e.dialogTitle}>Update your bank?</span>
            <p className={e.dialogBody}>
              You&rsquo;ll leave this deposit to manage your linked bank. The amount and schedule you entered won&rsquo;t be saved.
            </p>
            <div className={e.dialogActions}>
              <Button variant="secondary">Stay here</Button>
              <Button variant="primary">Update bank</Button>
            </div>
          </div>
        </Frame>

        <Frame label="Remove bank · Breaks recurring">
          <Sheet title="Update bank account">
            <div style={cardBase}>
              <BankChaseLogo />
              <div className={e.bankEmptyText}>
                <span className={e.bankEmptyTitle}>Chase Total Checking</span>
                <span className={e.bankEmptyMeta}>Checking · 4823</span>
              </div>
            </div>
            <Banner tone="warning" icon="warning">
              <span className={e.bannerStrong}>This bank funds an active recurring deposit.</span> Removing it will pause your $500 bi-weekly schedule until you link a new source.
            </Banner>
            <div className={s.confirmActionRow}>
              <Button variant="secondary">Cancel</Button>
              <button type="button" className={[s.depositCta, s.confirmSubmitCta].join(' ')}>Replace bank</button>
            </div>
          </Sheet>
        </Frame>
      </div>

      {/* ─────────── Withdrawal-specific ─────────── */}
      <h2 className={e.groupTitle}>Withdrawal specifics</h2>
      <div className={e.grid}>
        <Frame label="Withdraw · Available vs settling">
          <Sheet title="Withdrawal">
            <div className={s.amountSection}>
              <AmountField value="8,000" />
              <QuickAmounts />
              <span className={e.amountHint}>
                <span className={e.amountHintStrong}>$8,200.00</span> available now · $2,232.18 still settling
              </span>
            </div>
            <hr className={s.sectionDivider} />
            <Section label="From"><AccountSelectorCard selected={SURMOUNT_SELECTABLE} groups={SURMOUNT_GROUPS} /></Section>
            <ArrowDown />
            <Section label="To"><AccountSelectorCard selected={BANK_SELECTABLE} readOnly trailingAction={{ label: 'Update' }} /></Section>
            <button type="button" className={s.depositCta}>Continue</button>
          </Sheet>
        </Frame>

        <Frame label="Withdraw · Review with tax notice">
          <div className={s.modalSheet} style={{ width: 560, maxWidth: 560 }}>
            <div className={s.modalStepContent}>
              <div className={[s.modalHeader, s.confirmModalHeader].join(' ')}>
                <span className={[s.modalTitle, s.confirmModalTitle].join(' ')}>Confirm withdrawal details</span>
                <CloseX />
              </div>
              <div className={[s.modalBody, s.confirmModalBody].join(' ')}>
                <div className={s.confirmDetailList}>
                  <div className={s.confirmDetailRow}><span className={s.confirmRowLabel}>From</span>
                    <div className={s.confirmRowValueWithIcon}><div className={[s.confirmRowIcon, s.confirmRowIconSurmount].join(' ')}><img src={HYCA_SELECTABLE.logoSrc} alt="" /></div><span className={s.confirmRowValue}>High Yield Cash</span></div>
                  </div>
                  <div className={s.confirmDetailRow}><span className={s.confirmRowLabel}>To</span>
                    <div className={s.confirmRowValueWithIcon}><div className={[s.confirmRowIcon, s.confirmRowIconBank].join(' ')}><img src={BANK_SELECTABLE.logoSrc} alt="" /></div><span className={s.confirmRowValue}>Chase Total Checking</span></div>
                  </div>
                  <div className={s.confirmDetailDivider} />
                  <div className={s.confirmDetailRow}><span className={s.confirmRowLabel}>Processing</span><span className={s.confirmRowValue}>1–4 business days</span></div>
                  <div className={s.confirmDetailDivider} />
                  <div className={s.confirmDetailRow}><span className={s.confirmRowLabel}>Amount</span><span className={[s.confirmRowValue, s.confirmRowValueAmount].join(' ')}>$8,000.00</span></div>
                </div>
                <Banner tone="warning" icon="warning">
                  Withdrawing from a retirement account may be taxable and could incur an early-withdrawal penalty.
                </Banner>
                <div className={s.confirmActionRow}>
                  <Button variant="secondary">Back</Button>
                  <button type="button" className={[s.depositCta, s.confirmSubmitCta].join(' ')}>Confirm withdrawal</button>
                </div>
              </div>
            </div>
          </div>
        </Frame>
      </div>
    </div>
  );
}
