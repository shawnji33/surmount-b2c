import type { Metadata } from 'next';
import s from './flow.module.css';

export const metadata: Metadata = {
  title: 'Onboarding flow — Surmount',
};

type Node = {
  route: string;
  tag?: string;
  title: string;
  desc: string;
  notes?: string[];
};

const ACCOUNT: Node = {
  route: '/',
  tag: '/',
  title: 'Log in / Sign up',
  desc: 'Email + password sign-up with live 4-rule password validation.',
  notes: ['States: sign-in · sign-up · check-email · forgot/reset', 'Sign-up → "Check your email" → Open verification link'],
};

const ONBOARDING: Node[] = [
  {
    route: '/onboarding/welcome',
    title: 'Welcome',
    desc: 'First screen after the email link — two-step overview of what’s ahead.',
    notes: ['No back/close (entry point)'],
  },
  {
    route: '/onboarding/about-you',
    title: 'About you',
    desc: '5 KYC / get-to-know-you questions with slide transitions.',
    notes: ['Required vs optional steps', 'Forward-slide hand-off into the next screen'],
  },
  {
    route: '/onboarding/start-investing',
    title: 'Start investing',
    desc: 'Choose how to begin: connect a brokerage, or open a Surmount account.',
    notes: ['Two paths → A and B below'],
  },
];

const BRANCH_A: Node[] = [
  {
    route: '/onboarding/connect-brokerage',
    title: 'Connect a brokerage',
    desc: 'Pick a supported broker → secure-connect modal.',
    notes: ['Supported: E*Trade, Alpaca, TradeStation, Coinbase, Kraken, paper', 'Unsupported shown disabled as "Coming soon"', 'Paper accounts have a hover explainer'],
  },
  {
    route: '/onboarding/brokerage-connected?broker=kraken',
    title: 'Connected',
    desc: 'Success screen → lands on the empty dashboard.',
  },
];

const BRANCH_B: Node[] = [
  {
    route: '/onboarding/investing-account',
    title: 'Surmount Investing',
    desc: 'Opens the full KYC + funding flow (legal-name → … → fund).',
    notes: ['Back → start-investing (recoverable)'],
  },
];

const DASHBOARD: Node = {
  route: '/home?state=empty&connected=kraken',
  title: 'Empty dashboard',
  desc: 'First-time state after connecting: available cash, empty sections, marketplace CTA, and two banners.',
  notes: ['?state=empty toggles the variant', '?connected=<broker> selects the account'],
};

function ScreenCard({ node, wide }: { node: Node; wide?: boolean }) {
  return (
    <a className={`${s.card} ${wide ? s.cardWide : ''}`} href={node.route} target="_blank" rel="noreferrer">
      <div className={`${s.thumb} ${wide ? s.thumbWide : ''}`}>
        <span className={s.openPill}>Open ↗</span>
        <iframe className={s.thumbFrame} src={node.route} title={node.title} scrolling="no" loading="lazy" />
      </div>
      <div className={s.cardBody}>
        <div className={s.cardTitleRow}>
          <span className={s.cardTitle}>{node.title}</span>
          <span className={s.route}>{node.tag ?? node.route}</span>
        </div>
        <p className={s.cardDesc}>{node.desc}</p>
        {node.notes && (
          <ul className={s.notes}>
            {node.notes.map((n) => <li key={n} className={s.note}>{n}</li>)}
          </ul>
        )}
      </div>
    </a>
  );
}

function ArrowDown({ label }: { label?: string }) {
  return (
    <div className={s.connector}>
      <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="128" y1="40" x2="128" y2="216" />
        <polyline points="56 144 128 216 200 144" />
      </svg>
      {label && <span className={s.connectorLabel}>{label}</span>}
    </div>
  );
}

export default function FlowPage() {
  return (
    <div className={s.shell}>
      <div className={s.inner}>
        <header className={s.header}>
          <div className={s.brand}>
            <img src="/assets/sidebar/logo-mark.svg" alt="" className={s.brandMark} />
            <img src="/assets/sidebar/wordmark.svg" alt="Surmount" className={s.brandWord} />
          </div>
          <h1 className={s.title}>Onboarding flow</h1>
          <p className={s.subtitle}>
            The full account-creation journey, from sign-up to landing on the investing dashboard.
            Each tile is a live preview — click any one to open the real screen in a new tab and
            click through it yourself.
          </p>
        </header>

        <div className={s.legend}>
          <span className={s.legendItem}><span className={s.legendDot} style={{ background: '#181d27' }} />Live, clickable previews</span>
          <span className={s.legendItem}>↓ = next step</span>
          <span className={s.legendItem}>A / B = the two ways to start investing</span>
        </div>

        {/* Account */}
        <section className={s.phase}>
          <span className={s.phaseLabel}>1 · Account</span>
          <div className={s.row}><ScreenCard node={ACCOUNT} /></div>
        </section>

        <ArrowDown label="Sign up → open the verification link" />

        {/* Onboarding */}
        <section className={s.phase}>
          <span className={s.phaseLabel}>2 · Onboarding</span>
          <div className={s.row}>
            {ONBOARDING.map((n) => <ScreenCard key={n.route} node={n} />)}
          </div>
        </section>

        <ArrowDown label="Two ways to start investing" />

        {/* Fork */}
        <section className={s.phase}>
          <div className={s.fork}>
            <div className={s.branch}>
              <span className={s.branchHead}><span className={s.branchTag}>A</span>Connect an existing brokerage</span>
              {BRANCH_A.map((n) => <ScreenCard key={n.route} node={n} />)}
            </div>
            <div className={s.branch}>
              <span className={s.branchHead}><span className={s.branchTag}>B</span>Open a Surmount account</span>
              {BRANCH_B.map((n) => <ScreenCard key={n.route} node={n} />)}
            </div>
          </div>
        </section>

        <ArrowDown label="Both paths land on the dashboard" />

        {/* Dashboard */}
        <section className={s.phase}>
          <span className={s.phaseLabel}>3 · Dashboard</span>
          <div className={s.row}><ScreenCard node={DASHBOARD} wide /></div>
        </section>
      </div>
    </div>
  );
}
