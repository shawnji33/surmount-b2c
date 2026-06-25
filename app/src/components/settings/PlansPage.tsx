'use client';

import { Button } from '@/components/Button';
import { ArrowLeft, CalendarBlank, Check, CheckCircle, CreditCard, Info, PencilSimple, X } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import s from './PlansPage.module.css';

type Cycle = 'monthly' | 'yearly';
type Action = 'current' | 'downgrade' | 'upgrade';

// Lets a preview/handoff route render the Plans page in a specific state.
export type PlansStep =
  | 'downgrade-confirm'
  | 'scheduled'
  | 'scheduled-toast'
  | 'renew-confirm'
  | 'renewed'
  | 'upgrade-confirm';

type Tier = {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  tint: 'tintFree' | 'tintCore' | 'tintPlus' | 'tintPro';
  featuresTitle: string;
  features: string[];
};

const RENEW_DATE = 'Jul 9, 2026';
const PLAN_ORDER = ['free', 'core', 'plus', 'pro'];
const TAX_RATE = 0.0825;

const TAGLINES: Record<string, string> = {
  free: 'Track your portfolio and explore strategies',
  core: 'External accounts and free templates',
  plus: 'No-code strategy builders',
  pro: 'Unlimited investing and every builder',
};

const fmt = (n: number) => `$${n.toFixed(2)}`;

const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Surmount Free',
    priceMonthly: 0,
    priceYearly: 0,
    tint: 'tintFree',
    featuresTitle: 'Includes:',
    features: [
      'Open a Surmount account and start investing right away (applicable fees may apply)',
      'Track and manage your portfolio from your Dashboard',
      'Discover investment strategies on the Marketplace',
      'Research markets with screeners and insights on the Markets page',
    ],
  },
  {
    id: 'core',
    name: 'Surmount Core',
    priceMonthly: 5,
    priceYearly: 50,
    tint: 'tintCore',
    featuresTitle: 'Everything in Free and:',
    features: [
      'Connect and invest in external accounts (up to $50,000)',
      'Access to Dashboard for external + Surmount accounts',
      'Access free strategy templates',
    ],
  },
  {
    id: 'plus',
    name: 'Surmount Plus',
    priceMonthly: 10,
    priceYearly: 100,
    tint: 'tintPlus',
    featuresTitle: 'Everything in Core and:',
    features: [
      'Invest up to $150,000 in connected accounts',
      'Access No-Code Strategy Builders (ETF Builder + No-Code Strategy Builder)',
    ],
  },
  {
    id: 'pro',
    name: 'Surmount Pro',
    priceMonthly: 30,
    priceYearly: 300,
    tint: 'tintPro',
    featuresTitle: 'Everything in Plus and:',
    features: [
      'Unlimited investing across internal, external, and paper accounts',
      'Access all strategy builders (No-Code, Code, AI Builder, ETF Builder)',
      'Unlock Paper Trading for testing ideas',
    ],
  },
];

const shortName = (name: string) => name.replace('Surmount ', '');

function actionFor(planId: string, currentId: string): Action {
  const a = PLAN_ORDER.indexOf(planId);
  const b = PLAN_ORDER.indexOf(currentId);
  if (a === b) return 'current';
  return a < b ? 'downgrade' : 'upgrade';
}

// Slot-machine style rolling number. Each digit is a reel of 0–9 that slides to its value.
function RollingNumber({ value }: { value: number }) {
  const digits = String(value).split('');
  const len = digits.length;
  return (
    <span className={s.roller} aria-label={String(value)} role="img">
      {digits.map((d, i) => {
        const place = len - 1 - i;
        return (
          <span className={s.reelWindow} key={place} aria-hidden="true">
            <span
              className={s.reel}
              style={{ transform: `translateY(${-Number(d) * 10}%)`, transitionDelay: `${place * 70}ms` }}
            >
              {Array.from({ length: 10 }).map((_, n) => (
                <span className={s.reelDigit} key={n}>
                  {n}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

function PlanCard({
  plan,
  cycle,
  action,
  cta,
  scheduledTarget = false,
  onSelect,
}: {
  plan: Tier;
  cycle: Cycle;
  action: Action;
  cta: string;
  scheduledTarget?: boolean;
  onSelect: (plan: Tier, action: Action) => void;
}) {
  const amount = cycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  const meta = plan.id === 'free' ? 'Free forever' : cycle === 'yearly' ? 'USD / year' : 'USD / month';
  const locked = action === 'current' || scheduledTarget;
  const label = scheduledTarget ? 'Downgrade scheduled' : cta;

  return (
    <div className={[s.card, s[plan.tint]].filter(Boolean).join(' ')}>
      <div className={s.cardTop}>
        <span className={s.cardName}>{plan.name}</span>

        <div className={s.priceRow}>
          <span className={s.price}>
            <span className={s.currency}>$</span>
            <RollingNumber value={amount} />
          </span>
          <span className={s.priceMeta}>{meta}</span>
        </div>

        <Button
          type="button"
          variant={action === 'current' ? 'secondary' : 'primary'}
          disabled={locked}
          onClick={() => onSelect(plan, action)}
        >
          {label}
        </Button>
      </div>

      <div className={s.divider} />

      <div className={s.features}>
        <span className={s.featuresTitle}>{plan.featuresTitle}</span>
        <ul className={s.featureList}>
          {plan.features.map((f) => (
            <li className={s.feature} key={f}>
              <Check className={s.check} weight="bold" aria-hidden="true" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DowngradeModal({
  target,
  currentName,
  onKeep,
  onConfirm,
}: {
  target: Tier;
  currentName: string;
  onKeep: () => void;
  onConfirm: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onKeep();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onKeep]);

  if (!mounted) return null;

  const target_ = shortName(target.name);
  const current_ = shortName(currentName);

  return createPortal(
    <div
      className={s.cdOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onKeep();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Downgrade to ${target_}`}
    >
      <div className={s.cdModal}>
        <h2 className={s.cdTitle}>Downgrade to the {target_} plan?</h2>
        <p className={s.cdBody}>
          Your downgrade to the {target_} monthly plan is scheduled for {RENEW_DATE}. You&apos;ll keep {currentName} and
          all its features until then.
        </p>
        <div className={s.cdActions}>
          <Button type="button" variant="secondary" fullWidth={false} onClick={onKeep}>
            Keep your {current_} plan
          </Button>
          <Button type="button" variant="destructive" fullWidth={false} onClick={onConfirm}>
            {target.id === 'free' ? 'Cancel plan' : 'Downgrade plan'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function RenewModal({
  currentName,
  onGoBack,
  onRenew,
}: {
  currentName: string;
  onGoBack: () => void;
  onRenew: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onGoBack();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onGoBack]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={s.cdOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onGoBack();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Renew subscription"
    >
      <div className={s.cdModal}>
        <h2 className={s.cdTitle}>Renew subscription</h2>
        <p className={s.cdBody}>
          You&apos;ll keep access to {currentName} and your next charge will be processed on {RENEW_DATE}.
        </p>
        <div className={s.cdActions}>
          <Button type="button" variant="secondary" fullWidth={false} onClick={onGoBack}>
            Go back
          </Button>
          <Button type="button" variant="primary" fullWidth={false} onClick={onRenew}>
            Renew subscription
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function UpgradeModal({
  target,
  current,
  onClose,
  onConfirm,
}: {
  target: Tier;
  current: Tier;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!mounted) return null;

  const target_ = shortName(target.name);
  const current_ = shortName(current.name);
  // Mock prorated credit for the unused remainder of the current plan.
  const credit = Number((current.priceMonthly * 0.645).toFixed(2));
  const subtotal = Number((target.priceMonthly - credit).toFixed(2));
  const tax = Number((subtotal * TAX_RATE).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  return createPortal(
    <div
      className={s.upOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Upgrade to ${target_}`}
    >
      <div className={s.upModal}>
        <div className={s.upHeader}>
          <h2 className={s.upTitle}>Upgrade to {target_}</h2>
          <button type="button" className={s.upClose} onClick={onClose} aria-label="Close">
            <X weight="regular" aria-hidden="true" />
          </button>
        </div>

        <div className={s.upBody}>
          {/* Plan comparison */}
          <div className={s.upPlans}>
            <div className={s.upPlanCard}>
              <span className={s.upTag}>Current plan</span>
              <span className={s.upPlanName}>{current.name}</span>
              <span className={s.upPlanPrice}>{fmt(current.priceMonthly)}/month + tax</span>
            </div>
            <div className={[s.upPlanCard, s.upPlanCardSelected].join(' ')}>
              <span className={s.upRadio} aria-hidden="true" />
              <span className={s.upPlanName}>{target.name}</span>
              <span className={s.upPlanPrice}>{fmt(target.priceMonthly)}/month + tax</span>
            </div>
          </div>

          {/* Order details */}
          <div className={s.upOrder}>
            <span className={s.upOrderTitle}>Order details</span>

            <div className={s.upOrderRow}>
              <div className={s.upOrderLabel}>
                <span className={s.upOrderName}>{target_} plan</span>
                <span className={s.upOrderSub}>{TAGLINES[target.id]}</span>
              </div>
              <span className={s.upOrderValue}>{fmt(target.priceMonthly)}</span>
            </div>

            <div className={s.upOrderRow}>
              <div className={s.upOrderLabel}>
                <span className={s.upOrderName}>Adjustments</span>
                <span className={s.upOrderSub}>Prorated credit for the remainder of {current_} plan</span>
              </div>
              <span className={s.upOrderValue}>-{fmt(credit)}</span>
            </div>

            <div className={s.upOrderDivider} />

            <div className={s.upOrderRow}>
              <span className={s.upOrderName}>Subtotal</span>
              <span className={s.upOrderValue}>{fmt(subtotal)}</span>
            </div>
            <div className={s.upOrderRow}>
              <span className={s.upOrderName}>Tax</span>
              <span className={s.upOrderValue}>{fmt(tax)}</span>
            </div>

            <div className={s.upOrderDivider} />

            <div className={s.upOrderRow}>
              <span className={s.upOrderTotal}>Total due today</span>
              <span className={s.upOrderTotal}>{fmt(total)}</span>
            </div>
          </div>

          {/* Renewal info */}
          <div className={s.upInfo}>
            <Info className={s.upInfoIcon} weight="regular" aria-hidden="true" />
            <span>
              Your subscription will auto-renew on {RENEW_DATE}. You&apos;ll be charged {fmt(target.priceMonthly)}/month +
              tax.
            </span>
          </div>

          {/* Payment method */}
          <div className={s.upPayment}>
            <span className={s.upPaymentLabel}>Payment method</span>
            <div className={s.upPaymentRight}>
              <span className={s.upCardChip}>
                <CreditCard weight="fill" aria-hidden="true" />
              </span>
              <span className={s.upPaymentValue}>Visa ending in 4242</span>
              <button type="button" className={s.upEdit} aria-label="Edit payment method">
                <PencilSimple weight="regular" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Agreement */}
          <label className={s.upAgree}>
            <input
              type="checkbox"
              className={s.upCheckInput}
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className={[s.upCheckbox, agreed ? s.upCheckboxOn : ''].filter(Boolean).join(' ')}>
              {agreed && <Check weight="bold" aria-hidden="true" />}
            </span>
            <span className={s.upAgreeText}>
              You agree that Surmount will charge your card in the amount above now and on a recurring monthly basis
              until you cancel in accordance with our terms. You can cancel at any time in your account settings.
            </span>
          </label>
        </div>

        <div className={s.upFooter}>
          <Button type="button" variant="primary" disabled={!agreed} onClick={onConfirm}>
            Upgrade to {target_}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function PlansPage({
  initialCycle = 'monthly',
  previewStep,
}: {
  initialCycle?: Cycle;
  previewStep?: PlansStep;
}) {
  const router = useRouter();
  const [cycle, setCycle] = useState<Cycle>(initialCycle);
  const [currentPlanId, setCurrentPlanId] = useState('plus');
  const [confirmTarget, setConfirmTarget] = useState<Tier | null>(
    previewStep === 'downgrade-confirm' ? TIERS[0] : null,
  );
  const [upgradeTarget, setUpgradeTarget] = useState<Tier | null>(
    previewStep === 'upgrade-confirm' ? TIERS[3] : null,
  );
  const [scheduled, setScheduled] = useState<{ name: string; date: string } | null>(
    previewStep === 'scheduled' || previewStep === 'scheduled-toast' || previewStep === 'renew-confirm'
      ? { name: 'Free', date: RENEW_DATE }
      : null,
  );
  const [renewOpen, setRenewOpen] = useState(previewStep === 'renew-confirm');

  const [mounted, setMounted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(
    previewStep === 'scheduled-toast'
      ? 'Downgrade to Surmount Free scheduled'
      : previewStep === 'renewed'
        ? 'Subscription renewed'
        : null,
  );
  const [toastLeaving, setToastLeaving] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);
  const toastLeaveTimer = useRef<number | undefined>(undefined);

  useEffect(() => setMounted(true), []);
  useEffect(
    () => () => {
      if (toastTimer.current != null) window.clearTimeout(toastTimer.current);
      if (toastLeaveTimer.current != null) window.clearTimeout(toastLeaveTimer.current);
    },
    [],
  );

  const currentTier = TIERS.find((t) => t.id === currentPlanId) ?? TIERS[2];
  const currentName = currentTier.name;
  const currentShort = shortName(currentName);

  function showToast(message: string) {
    if (toastTimer.current != null) window.clearTimeout(toastTimer.current);
    if (toastLeaveTimer.current != null) window.clearTimeout(toastLeaveTimer.current);
    setToastLeaving(false);
    setToastMsg(message);
    toastTimer.current = window.setTimeout(() => {
      setToastLeaving(true);
      toastLeaveTimer.current = window.setTimeout(() => {
        setToastMsg(null);
        setToastLeaving(false);
      }, 220);
    }, 3200);
  }

  function handleSelect(plan: Tier, action: Action) {
    if (action === 'downgrade') setConfirmTarget(plan);
    else if (action === 'upgrade') setUpgradeTarget(plan);
  }

  function confirmUpgrade() {
    if (upgradeTarget) {
      const name = upgradeTarget.name;
      setCurrentPlanId(upgradeTarget.id);
      setScheduled(null);
      setUpgradeTarget(null);
      showToast(`You're now on ${name}`);
    }
  }

  function confirmDowngrade() {
    if (confirmTarget) {
      const name = confirmTarget.name;
      setScheduled({ name: shortName(confirmTarget.name), date: RENEW_DATE });
      setConfirmTarget(null);
      showToast(`Downgrade to ${name} scheduled`);
    } else {
      setConfirmTarget(null);
    }
  }

  function handleRenew() {
    setScheduled(null);
    setRenewOpen(false);
    showToast('Subscription renewed');
  }

  const bannerText = scheduled
    ? `Your downgrade to the ${scheduled.name} monthly plan is scheduled for ${scheduled.date}.`
    : `Your ${currentName} plan auto-renews on ${RENEW_DATE}.`;

  function handleBack() {
    // Only reopen Settings (Billing) if the user arrived here from Settings → Billing.
    try {
      const ret = sessionStorage.getItem('surmount:plansReturn');
      sessionStorage.removeItem('surmount:plansReturn');
      if (ret === 'settings-billing') sessionStorage.setItem('surmount:openSettings', 'billing');
    } catch {
      /* ignore */
    }
    router.back();
  }

  return (
    <div className={s.page}>
      <button type="button" className={s.back} onClick={handleBack} aria-label="Go back">
        <ArrowLeft weight="regular" aria-hidden="true" />
      </button>

      <div className={s.inner}>
        <h1 className={s.heading}>Plans that grow with you</h1>

        <div className={s.scheduleBanner}>
          <div className={s.scheduleLeft}>
            <CalendarBlank className={s.scheduleIcon} weight="regular" aria-hidden="true" />
            <span className={s.scheduleText}>{bannerText}</span>
          </div>
          {scheduled && (
            <Button type="button" variant="primary" size="sm" fullWidth={false} onClick={() => setRenewOpen(true)}>
              Renew current {currentShort} plan
            </Button>
          )}
        </div>

        <div className={s.cycleToggle}>
          <button
            type="button"
            className={[s.cycleOption, cycle === 'monthly' ? s.cycleOptionActive : ''].filter(Boolean).join(' ')}
            onClick={() => setCycle('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            className={[s.cycleOption, cycle === 'yearly' ? s.cycleOptionActive : ''].filter(Boolean).join(' ')}
            onClick={() => setCycle('yearly')}
          >
            Yearly <span className={s.cycleSave}>· Save 2 months</span>
          </button>
        </div>

        <div className={s.grid}>
          {TIERS.map((plan) => {
            const action = actionFor(plan.id, currentPlanId);
            const cta =
              action === 'current'
                ? 'Current plan'
                : `${action === 'downgrade' ? 'Downgrade' : 'Upgrade'} to ${shortName(plan.name)}`;
            const scheduledTarget = scheduled !== null && scheduled.name === shortName(plan.name);
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                cycle={cycle}
                action={action}
                cta={cta}
                scheduledTarget={scheduledTarget}
                onSelect={handleSelect}
              />
            );
          })}
        </div>

        <p className={s.footnote}>Prices and plans are subject to change at Surmount&apos;s discretion.</p>
      </div>

      {confirmTarget && (
        <DowngradeModal
          target={confirmTarget}
          currentName={currentName}
          onKeep={() => setConfirmTarget(null)}
          onConfirm={confirmDowngrade}
        />
      )}

      {renewOpen && (
        <RenewModal currentName={currentName} onGoBack={() => setRenewOpen(false)} onRenew={handleRenew} />
      )}

      {upgradeTarget && (
        <UpgradeModal
          target={upgradeTarget}
          current={currentTier}
          onClose={() => setUpgradeTarget(null)}
          onConfirm={confirmUpgrade}
        />
      )}

      {mounted &&
        toastMsg &&
        createPortal(
          <div className={s.toastRegion} aria-live="polite" aria-atomic="true">
            <div className={[s.toast, toastLeaving ? s.toastLeaving : ''].filter(Boolean).join(' ')}>
              <CheckCircle className={s.toastIcon} weight="fill" aria-hidden="true" />
              <p className={s.toastText}>{toastMsg}</p>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
