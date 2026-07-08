'use client';

import {
  CaretDown,
  CaretLeft,
  CaretRight,
  EnvelopeSimple,
  Lightbulb,
  Question,
} from '@phosphor-icons/react';
import { useState } from 'react';
import s from '../SettingsModal.module.css';
import { ContactModal, ModalShell } from './ContactSupportModal';

type Faq = { q: string; a: string };
type FaqCategory = { title: string; items: Faq[] };

// FAQ content. Answers are plain strings; emails and URLs are auto-linked at render.
const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: 'About Surmount',
    items: [
      {
        q: 'What is Surmount?',
        a: 'Surmount is an automated investing platform that lets you run proven, rules-based strategies inside your existing brokerage account — or directly through a Surmount-managed account. It brings institutional-grade automation, strategy access, and portfolio management tools to everyday investors.',
      },
      {
        q: 'Who is Surmount for?',
        a: "Surmount is built for self-directed investors who want to automate their portfolios without giving up control. Whether you're a beginner getting started or an advanced trader seeking scalable automation, Surmount helps you invest smarter with less effort.",
      },
      {
        q: 'What strategies are available on Surmount?',
        a: 'You can choose from pre-built strategies, create your own with no-code tools, or use advanced builders like the Code and AI Strategy Builder (available on Pro plans). Every strategy is transparent, rules-based, and backtested.',
      },
      {
        q: 'How does Surmount make money?',
        a: "We earn revenue from monthly subscription fees (for connected external accounts) and a 1% AUM fee for managed Surmount accounts. We don't charge commissions or sell your data — our business model is fully aligned with your investment success.",
      },
      {
        q: 'Is Surmount secure?',
        a: "Yes. Surmount uses bank-level encryption and works with Plaid to securely connect your accounts. We're also a registered investment adviser with the U.S. Securities and Exchange Commission (SEC), and all internal accounts are fully regulated and protected.",
      },
      {
        q: 'Is Surmount available for users outside the U.S.?',
        a: "Users can sign up and have limited use of the platform if they're not a US citizen — they can build strategies, run backtests, and connect supported brokerage accounts. To create a Surmount brokerage account, you need to be a US citizen.",
      },
      {
        q: 'Does Quantbase own Surmount, or does Surmount own Quantbase?',
        a: 'Surmount acquired Quantbase in March of 2025.',
      },
    ],
  },
  {
    title: 'Pricing & plans',
    items: [
      {
        q: 'How much does Surmount cost?',
        a: "You can create a free Surmount account to access strategies and backtest results. If you're using your own brokerage account, you'll choose a subscription plan (Core, Plus, or Pro) starting at a low monthly rate. If you open a Surmount-managed account, you'll pay a 1% annual AUM (assets-under-management) fee with no subscription required. You can view the tiers and pricing on the Plans page.",
      },
      {
        q: 'Is there a minimum to open an account?',
        a: 'No minimum is required to open or fund a Surmount account. You can start automating your portfolio with whatever amount fits your goals.',
      },
      {
        q: 'How do I cancel my Surmount subscription?',
        a: "To cancel your Surmount subscription, reach out to support@surmount.ai and we'll handle your account cancellation.",
      },
    ],
  },
  {
    title: 'Account & access',
    items: [
      {
        q: 'How long do I need to wait for my onboarding to be completed?',
        a: 'Onboarding a new account typically takes 1–2 business days for account approval, and 1–3 days for initial deposited funds to clear. Expect 2–5 days for onboarding to be completed.',
      },
      {
        q: 'How long does account approval take?',
        a: 'Account approvals typically take 1–2 business days.',
      },
      {
        q: 'My account approval is stuck, what do I do?',
        a: "Sometimes approvals take a bit longer. If it's been more than 5 days and your approval seems stuck, reach out to support@surmount.ai and we'll investigate and help find a resolution.",
      },
      {
        q: 'How do I change my password if I forgot it?',
        a: 'Go to https://app.surmount.ai/forgot-password or click "Forgot password" on the login page. Fill in your email address and a link to reset your password will be sent to you.',
      },
      {
        q: "I'm unable to change my password or log in to my account, what do I do?",
        a: "If the 'Forgot password' process isn't working and you still can't log in, reach out to support@surmount.ai and we'll provide assistance.",
      },
      {
        q: 'Can I still get my tax documents after closing my account?',
        a: 'Yes — email support@surmount.ai and we can help you get access to the documents.',
      },
      {
        q: 'Is my money held by Surmount?',
        a: 'No. Your assets are held by a qualified custodian. Surmount manages your investments but does not take custody of your funds.',
      },
    ],
  },
  {
    title: 'Funding & transfers',
    items: [
      {
        q: 'After I connect a brokerage account, how long until I can start trading with those funds?',
        a: 'This should be instantaneous, but can take up to 24 hours. If you experience longer than this, please reach out to support@surmount.ai.',
      },
      {
        q: 'How long does a deposit take before reflecting in my account?',
        a: 'Deposits typically show up within 1–4 business days.',
      },
      {
        q: 'How long does it take to divest funds?',
        a: 'This can take up to 4 hours to execute, and will then be unavailable for withdrawal for 1–3 business days. After divesting, the funds can be re-invested in alternative strategies.',
      },
      {
        q: 'How long does it take for my withdrawal to be successful?',
        a: 'Withdrawals can take 1–3 days to execute.',
      },
      {
        q: 'How can I switch bank accounts that I make deposits from?',
        a: 'Click ‘Transfer funds’ at the top of the Dashboard page, then click ‘Deposit’. You’ll see a line reading "Bank details" — click ‘Update’ on that line and we’ll walk you through linking a new bank account.',
      },
      {
        q: 'Why does my account show a negative balance?',
        a: 'Accounts can temporarily show a negative balance as funds are moving or adjusting. This should resolve itself within 24 hours.',
      },
      {
        q: 'My deposit is stuck, what do I do?',
        a: 'Please wait at least 3 days to see if it resolves itself — funds can sometimes be held up while the transfer is processed. If 3 days have passed and the deposit is still stuck, reach out to support@surmount.ai.',
      },
      {
        q: "I'm unable to divest funds, what do I do?",
        a: 'Please reach out to support@surmount.ai immediately.',
      },
    ],
  },
];

// Linkify emails and http(s) URLs inside an answer string.
const LINK_RE = /(https?:\/\/[^\s]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
function renderAnswer(text: string) {
  const parts = text.split(LINK_RE);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      const href = part.includes('@') ? `mailto:${part}` : part;
      const isExternal = !part.includes('@');
      return (
        <a
          key={i}
          className={s.faqLink}
          href={href}
          {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

// Replace with the live Surmount feature-request Typeform id.
const TYPEFORM_ID = 'PLACEHOLDER';

type ActiveModal = null | 'feature' | 'contact';

export function SupportPanel() {
  const [active, setActive] = useState<ActiveModal>(null);
  const [view, setView] = useState<'menu' | 'faq'>('menu');
  // Bumped each time we navigate back, so the menu re-plays its slide-in.
  // Stays 0 on the first open so the panel doesn't animate when the tab loads.
  const [backNonce, setBackNonce] = useState(0);

  // FAQs is a second-level view inside the same modal, not a separate overlay.
  if (view === 'faq') {
    return (
      <FaqPanel
        onBack={() => {
          setView('menu');
          setBackNonce((n) => n + 1);
        }}
      />
    );
  }

  return (
    <div className={[s.panel, backNonce > 0 ? s.panelEnterBack : ''].filter(Boolean).join(' ')}>
      <div className={s.section}>
        <h3 className={s.sectionTitle}>Support</h3>
        <p className={s.sectionDesc}>Get help or help shape what we build next.</p>

        <div className={s.supportList}>
          <button type="button" className={s.supportItem} onClick={() => setActive('feature')}>
            <span className={s.supportIcon} aria-hidden="true">
              <Lightbulb weight="regular" />
            </span>
            <span className={s.supportItemText}>
              <span className={s.supportItemTitle}>Request a feature</span>
              <span className={s.supportItemSub}>Suggest an idea or improvement for Surmount.</span>
            </span>
            <CaretRight className={s.supportChevron} weight="regular" aria-hidden="true" />
          </button>

          <button type="button" className={s.supportItem} onClick={() => setActive('contact')}>
            <span className={s.supportIcon} aria-hidden="true">
              <EnvelopeSimple weight="regular" />
            </span>
            <span className={s.supportItemText}>
              <span className={s.supportItemTitle}>Contact us</span>
              <span className={s.supportItemSub}>Email our team about an issue and we&apos;ll respond promptly.</span>
            </span>
            <CaretRight className={s.supportChevron} weight="regular" aria-hidden="true" />
          </button>

          <button type="button" className={s.supportItem} onClick={() => setView('faq')}>
            <span className={s.supportIcon} aria-hidden="true">
              <Question weight="regular" />
            </span>
            <span className={s.supportItemText}>
              <span className={s.supportItemTitle}>FAQs</span>
              <span className={s.supportItemSub}>Browse answers to common questions about Surmount.</span>
            </span>
            <CaretRight className={s.supportChevron} weight="regular" aria-hidden="true" />
          </button>
        </div>
      </div>

      {active === 'feature' && <FeatureRequestModal onClose={() => setActive(null)} />}
      {active === 'contact' && <ContactModal onClose={() => setActive(null)} />}
    </div>
  );
}

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className={s.faqItem}>
      <button type="button" className={s.faqQ} onClick={onToggle} aria-expanded={open}>
        <span className={s.faqQText}>{q}</span>
        <CaretDown
          className={[s.faqChevron, open ? s.faqChevronOpen : ''].filter(Boolean).join(' ')}
          weight="regular"
          aria-hidden="true"
        />
      </button>
      <div className={[s.faqA, open ? s.faqAOpen : ''].filter(Boolean).join(' ')}>
        <div className={s.faqAInner}>
          <p className={s.faqAnswer}>{renderAnswer(a)}</p>
        </div>
      </div>
    </div>
  );
}

function FaqPanel({ onBack }: { onBack: () => void }) {
  // Single-open accordion: opening one collapses any other.
  const [openId, setOpenId] = useState<string | null>(null);

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <div className={[s.panel, s.panelEnterFwd].join(' ')}>
      <button type="button" className={s.faqBack} onClick={onBack}>
        <CaretLeft weight="regular" aria-hidden="true" />
        Support
      </button>

      <div className={s.section}>
        <h3 className={s.sectionTitle}>FAQs</h3>
        <p className={s.sectionDesc}>Find quick answers to common questions about Surmount.</p>

        <div className={s.faqList}>
          {FAQ_CATEGORIES.map((cat) => (
            <div className={s.faqCategory} key={cat.title}>
              <span className={s.faqCategoryTitle}>{cat.title}</span>
              {cat.items.map((item) => (
                <FaqItem
                  key={item.q}
                  q={item.q}
                  a={item.a}
                  open={openId === item.q}
                  onToggle={() => toggle(item.q)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureRequestModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell
      title="Request a feature"
      subtitle="Tell us what would make Surmount better — it takes under a minute."
      onClose={onClose}
      wide
    >
      <div className={s.typeformWrap}>
        <iframe
          className={s.typeformFrame}
          src={`https://form.typeform.com/to/${TYPEFORM_ID}?typeform-embed=embed-widget&embed-hide-footer=true`}
          title="Feature request form"
          allow="camera; microphone; autoplay; encrypted-media;"
        />
      </div>
    </ModalShell>
  );
}
