import type { Metadata } from 'next';
import s from './map.module.css';

export const metadata: Metadata = { title: 'Onboarding map — Surmount' };

type Badge = { label: string; kind: keyof typeof BADGE_CLASS };
const BADGE_CLASS = {
  default: s.bDefault, conditional: s.bConditional, scenario: s.bScenario,
  edge: s.bEdge, alt: s.bAlt, explore: s.bExplore,
  approved: s.bApproved, pending: s.bPending, rejected: s.bRejected,
} as const;

type Node = { route?: string; tag?: string; title: string; desc: string; badges?: Badge[]; ghost?: boolean };

function Pill({ b }: { b: Badge }) {
  return <span className={`${s.badge} ${BADGE_CLASS[b.kind]}`}>{b.label}</span>;
}

function Card({ n }: { n: Node }) {
  const inner = (
    <>
      <span className={s.cardTitle}>{n.title}</span>
      {n.tag && <span className={s.cardRoute}>{n.tag}</span>}
      <span className={s.cardDesc}>{n.desc}</span>
      {n.badges && <div className={s.cardBadges}>{n.badges.map((b) => <Pill key={b.label} b={b} />)}</div>}
    </>
  );
  const cls = `${s.card} ${n.ghost ? s.cardGhost : ''}`;
  return n.route
    ? <a className={cls} href={n.route} target="_blank" rel="noreferrer">{inner}</a>
    : <div className={cls}>{inner}</div>;
}

function Down({ label }: { label?: string }) {
  return (
    <div className={s.down}>
      <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="128" y1="40" x2="128" y2="216" /><polyline points="56 144 128 216 200 144" />
      </svg>
      {label && <span className={s.downLabel}>{label}</span>}
    </div>
  );
}

const KYC: Node[] = [
  { route: '/onboarding/legal-name', tag: 'legal-name', title: 'Identity & KYC', desc: 'legal-name → date-of-birth → address → citizenship → ssn → phone → verify-phone', badges: [{ label: 'Phase 1 (13 steps)', kind: 'default' }, { label: 'edge: DOB + OTP validation', kind: 'edge' }] },
  { route: '/onboarding/employment', tag: 'employment', title: 'Financial profile', desc: 'employment → occupation → annual-income → net-worth → funding-source → regulatory', badges: [{ label: 'Phase 1 cont.', kind: 'default' }] },
  { route: '/onboarding/investing-style', tag: 'investing-style', title: 'Investment profile', desc: 'investing-style → financial-goal → financial-situation → time-horizon → risk-tolerance → investment-allocation → terms', badges: [{ label: 'Phase 2 (7 steps)', kind: 'default' }] },
];

export default function OnboardingMapPage() {
  return (
    <div className={s.shell}>
      <div className={s.inner}>
        <div className={s.brand}>
          <img src="/assets/sidebar/logo-mark.svg" alt="" className={s.brandMark} />
          <img src="/assets/sidebar/wordmark.svg" alt="Surmount" className={s.brandWord} />
        </div>
        <h1 className={s.title}>Onboarding map</h1>
        <p className={s.subtitle}>
          The whole onboarding surface at a glance — every flow, the branch conditions, the
          scenario-gated screens (which only appear in certain states), and the edge cases.
          Click any screen to open it. For the linear happy-path walkthrough, see <code style={{ fontFamily: 'inherit' }}>/flow</code>.
        </p>

        <div className={s.legend}>
          <span className={s.legendItem}><Pill b={{ label: 'Conditional', kind: 'conditional' }} /> branches on input/state</span>
          <span className={s.legendItem}><Pill b={{ label: 'Scenario', kind: 'scenario' }} /> only shows in a specific outcome</span>
          <span className={s.legendItem}><Pill b={{ label: 'Edge case', kind: 'edge' }} /> validation / special state</span>
          <span className={s.legendItem}><Pill b={{ label: 'Alt path', kind: 'alt' }} /> reachable elsewhere</span>
          <span className={s.legendItem}><Pill b={{ label: 'Exploration', kind: 'explore' }} /> not wired into the flow</span>
        </div>

        {/* 1 — Account */}
        <section className={s.phase}>
          <div className={s.phaseHead}><span className={s.phaseNum}>1</span><span className={s.phaseName}>Account creation</span><span className={s.phaseNote}>· before onboarding</span></div>
          <div className={s.row}>
            <Card n={{ route: '/', tag: '/', title: 'Log in / Sign up', desc: 'Email + password sign-up; or sign in.', badges: [{ label: 'edge: 4-rule password', kind: 'edge' }, { label: 'states: sign-in/up/forgot', kind: 'conditional' }] }} />
            <Card n={{ route: '/', tag: 'verify-email', title: 'Check your email', desc: 'Verification link sent. "Open link" → welcome.', badges: [{ label: 'edge: resend 60s cooldown', kind: 'edge' }] }} />
          </div>
        </section>
        <Down label="sign up → open the email link" />

        {/* 2 — Onboarding */}
        <section className={s.phase}>
          <div className={s.phaseHead}><span className={s.phaseNum}>2</span><span className={s.phaseName}>Get to know you</span></div>
          <div className={s.row}>
            <Card n={{ route: '/onboarding/welcome', tag: 'welcome', title: 'Welcome', desc: 'Two-step overview. No back/close (entry point).' }} />
            <Card n={{ route: '/onboarding/about-you', tag: 'about-you', title: 'About you', desc: '5 KYC / get-to-know-you questions.', badges: [{ label: 'conditional: required vs optional steps', kind: 'conditional' }] }} />
          </div>
        </section>
        <Down label="continue" />

        {/* 3 — Start investing fork */}
        <section className={s.phase}>
          <div className={s.phaseHead}><span className={s.phaseNum}>3</span><span className={s.phaseName}>Start investing</span><span className={s.phaseNote}>· the fork — two ways to begin</span></div>
          <div className={s.row}><Card n={{ route: '/onboarding/start-investing', tag: 'start-investing', title: 'Choose how', desc: 'Connect a brokerage, or open a Surmount account.', badges: [{ label: 'conditional: A or B', kind: 'conditional' }] }} /></div>
          <div style={{ height: 14 }} />
          <div className={s.fork}>
            {/* Branch A */}
            <div className={s.branch}>
              <span className={s.branchHead}><span className={s.branchTag}>A</span>Connect an existing brokerage</span>
              <span className={s.branchSub}>Fast path — pull holdings & cash from a broker you already use.</span>
              <div className={s.chain}>
                <Card n={{ route: '/onboarding/connect-brokerage', tag: 'connect-brokerage', title: 'Connect a brokerage', desc: 'Pick a broker → secure-connect modal.', badges: [{ label: 'conditional: supported vs Coming soon', kind: 'conditional' }, { label: 'edge: paper-account explainer', kind: 'edge' }] }} />
                <span className={s.chainArrow}>↓ continue to broker</span>
                <Card n={{ route: '/onboarding/brokerage-connected?broker=kraken', tag: 'brokerage-connected', title: 'Connected', desc: 'Success → lands on the empty dashboard.', badges: [{ label: 'conditional: ?broker=<id>', kind: 'conditional' }] }} />
              </div>
            </div>
            {/* Branch B */}
            <div className={s.branch}>
              <span className={s.branchHead}><span className={s.branchTag}>B</span>Open a Surmount account</span>
              <span className={s.branchSub}>Full brokerage-opening flow (KYC + funding).</span>
              <div className={s.chain}>
                <Card n={{ route: '/onboarding/investing-account', tag: 'investing-account', title: 'Surmount Investing', desc: 'Entry to the KYC flow.', badges: [{ label: 'edge: Back recovers an accidental pick', kind: 'edge' }] }} />
                <span className={s.chainArrow}>↓ open account</span>
                {KYC.map((n) => <Card key={n.tag} n={n} />)}
              </div>
            </div>
          </div>
        </section>
        <Down label="Path B: submit application (terms → application-loading)" />

        {/* 4 — Application outcomes */}
        <section className={s.phase}>
          <div className={s.phaseHead}><span className={s.phaseNum}>4</span><span className={s.phaseName}>Application outcomes</span><span className={s.phaseNote}>· one of three — the screen shown depends on the result</span></div>
          <div className={s.outcomes}>
            <div className={s.outcome}>
              <span className={s.outcomeHead}><Pill b={{ label: '✓ Approved', kind: 'approved' }} /></span>
              <Card n={{ route: '/onboarding/application-submitted', tag: 'application-submitted', title: '"You’re in"', desc: 'Approved → connect bank / fund.', badges: [{ label: 'scenario: approved', kind: 'scenario' }] }} />
              <Card n={{ route: '/onboarding/account-ready', tag: 'account-ready', title: 'Ready to invest', desc: 'Account active → explore strategies.', badges: [{ label: 'scenario: approved', kind: 'scenario' }] }} />
            </div>
            <div className={s.outcome}>
              <span className={s.outcomeHead}><Pill b={{ label: '⏳ Under review', kind: 'pending' }} /></span>
              <Card n={{ route: '/onboarding/application-review', tag: 'application-review', title: '"Under review"', desc: 'Pending manual review — wait state.', badges: [{ label: 'scenario: pending', kind: 'scenario' }] }} />
            </div>
            <div className={s.outcome}>
              <span className={s.outcomeHead}><Pill b={{ label: '📄 Needs documents', kind: 'rejected' }} /></span>
              <Card n={{ route: '/onboarding/account-setup', tag: 'account-setup', title: '"Almost ready"', desc: 'Identity docs required.', badges: [{ label: 'scenario: needs docs', kind: 'scenario' }] }} />
              <Card n={{ route: '/onboarding/verify-documents', tag: 'verify-documents', title: 'Upload documents', desc: 'Drag-drop ID upload → submit.', badges: [{ label: 'scenario: needs docs', kind: 'scenario' }] }} />
              <Card n={{ route: '/onboarding/documents-received', tag: 'documents-received', title: 'Docs received', desc: '"Thanks" → approved.', badges: [{ label: 'scenario: needs docs', kind: 'scenario' }] }} />
            </div>
          </div>
        </section>
        <Down label="approved → fund the account" />

        {/* 5 — Funding */}
        <section className={s.phase}>
          <div className={s.phaseHead}><span className={s.phaseNum}>5</span><span className={s.phaseName}>Funding</span><span className={s.phaseNote}>· Surmount-account path</span></div>
          <div className={s.row}>
            <Card n={{ route: '/onboarding/funding-source', tag: 'funding-source', title: 'Funding source', desc: 'How you’ll fund the account.' }} />
            <Card n={{ route: '/onboarding/link-bank', tag: 'link-bank', title: 'Link your bank', desc: 'Plaid connect.', badges: [{ label: 'conditional: ?mode=update re-links', kind: 'conditional' }] }} />
            <Card n={{ route: '/onboarding/bank-linked', tag: 'bank-linked', title: 'Bank linked', desc: 'Success + change-account menu.', badges: [{ label: 'conditional: update vs first-time', kind: 'conditional' }] }} />
            <Card n={{ route: '/onboarding/fund-amount', tag: 'fund-amount', title: 'Fund amount', desc: 'Amount + frequency.', badges: [{ label: 'conditional: one-time vs recurring', kind: 'conditional' }] }} />
            <Card n={{ route: '/onboarding/fund-review', tag: 'fund-review', title: 'Review', desc: 'Confirm the deposit.' }} />
            <Card n={{ route: '/onboarding/fund-success', tag: 'fund-success', title: 'Funded', desc: 'Done → dashboard.' }} />
          </div>
        </section>
        <Down label="both paths land on the dashboard" />

        {/* 6 — Dashboard */}
        <section className={s.phase}>
          <div className={s.phaseHead}><span className={s.phaseNum}>6</span><span className={s.phaseName}>Dashboard</span></div>
          <div className={s.row}>
            <Card n={{ route: '/home?state=empty&connected=kraken', tag: '/home?state=empty', title: 'Empty dashboard', desc: 'First-time: available cash, empty sections, marketplace CTA.', badges: [{ label: 'conditional: ?state=empty', kind: 'conditional' }, { label: 'conditional: ?connected=<broker>', kind: 'conditional' }] }} />
            <Card n={{ route: '/home', tag: '/home', title: 'Populated dashboard', desc: 'Returning user: holdings, returns, activity.' }} />
          </div>
        </section>

        {/* Alt / exploration screens */}
        <div className={s.section}>
          <div className={s.sectionTitle}>Alternate & exploration screens</div>
          <div className={s.sectionSub}>Reachable, but not part of the linear onboarding above.</div>
          <div className={s.row}>
            <Card n={{ route: '/onboarding/pick-strategy', tag: 'pick-strategy', title: 'Strategy discovery', desc: 'pick-strategy → strategy-quiz → strategy-results. Launched from the home carousel, not onboarding.', badges: [{ label: 'alt path: from /home', kind: 'alt' }] }} />
            <Card n={{ route: '/onboarding/cash-account', tag: 'cash-account', title: 'Cash account (HYCA)', desc: 'Alt entry from the home carousel; restarts at legal-name.', badges: [{ label: 'alt path: from /home', kind: 'alt' }] }} />
            <Card n={{ route: '/onboarding/build-portfolio/tabs', tag: 'build-portfolio/*', title: 'Build portfolio', desc: 'split / tabs / stacked layout variants — design exploration, not wired in.', badges: [{ label: 'exploration', kind: 'explore' }] }} />
          </div>
        </div>

        {/* Scenarios reference */}
        <div className={s.section}>
          <div className={s.sectionTitle}>Scenarios — when a screen does or doesn’t appear</div>
          <div className={s.sectionSub}>The same flow shows different screens depending on these states.</div>
          <div className={s.refList}>
            {[
              ['Application result', <>After submitting KYC, exactly one outcome shows: <b>Approved</b> → application-submitted/account-ready; <b>Under review</b> → application-review; <b>Needs documents</b> → account-setup → verify-documents → documents-received. (Prototype: pick the outcome from <code>/dev</code>.)</>],
              ['Entry path', <>The user never sees both: choosing <b>Connect a brokerage</b> skips the entire Surmount KYC + funding flow; choosing <b>Open a Surmount account</b> runs it.</>],
              ['Bank: first-time vs update', <><code>link-bank</code> / <code>bank-linked</code> render different copy, CTAs, and a replace-warning when opened with <code>?mode=update</code> (re-linking from the dashboard) vs first-time funding.</>],
              ['Dashboard: empty vs populated', <><code>/home?state=empty&connected=&lt;broker&gt;</code> shows the first-time state (cash only, empty sections, banners); plain <code>/home</code> shows holdings/returns. The <code>connected</code> param picks which broker’s cash is shown.</>],
              ['Brokerage support', <>In <code>connect-brokerage</code>, supported brokers are selectable; unsupported ones are pushed to the bottom, disabled, with a <b>Coming soon</b> tag — clicking does nothing.</>],
            ].map(([name, body], i) => (
              <div key={i} className={s.ref}>
                <div className={s.refLabel}><span className={s.refName}>{name as string}</span><Pill b={{ label: 'Scenario', kind: 'scenario' }} /></div>
                <div className={s.refBody}>{body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Edge cases reference */}
        <div className={s.section}>
          <div className={s.sectionTitle}>Edge cases</div>
          <div className={s.sectionSub}>Validation, special states, and intentional constraints.</div>
          <div className={s.refList}>
            {[
              ['Password rules', <>Sign-up password must meet 4 live rules (8+ chars, uppercase, number, special). Failing all → field error + the requirements popover stays open.</>],
              ['Email resend', <>"Check your email" resend has a 60-second cooldown showing <code>Resend in Ns</code>.</>],
              ['No exit mid-flow', <>start-investing, connect-brokerage, and investing-account have <b>no Close button</b> — you can’t abandon the flow to nowhere. investing-account has a Back to recover an accidental "Open a Surmount account".</>],
              ['Paper accounts', <>Alpaca Paper / Surmount Paper show an info (i); hovering explains they use virtual money (practice, not real funds).</>],
              ['Coming-soon brokers', <>Robinhood, Charles Schwab, Interactive Brokers, Webull are disabled with a Coming soon tag — inert, not selectable.</>],
              ['DOB + OTP', <>Date-of-birth validates a real, non-future date (year ≥ 1900); verify-phone accepts any 6 digits and auto-advances (demo).</>],
              ['Regulatory gating', <>The Continue on regulatory is disabled until at least one compliance option is selected.</>],
            ].map(([name, body], i) => (
              <div key={i} className={s.ref}>
                <div className={s.refLabel}><span className={s.refName}>{name as string}</span><Pill b={{ label: 'Edge case', kind: 'edge' }} /></div>
                <div className={s.refBody}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
