'use client';

import {
  CalendarBlank,
  CheckCircle,
  CreditCard,
  Lifebuoy,
  Lock,
  SlidersHorizontal,
  Warning,
  X,
  type Icon,
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PAYMENT_UPDATE_ROUTE, paymentExpiry, paymentLabel } from '@/lib/payment-method';
import { Button } from './Button';
import { GeneralPanel } from './settings/GeneralPanel';
import { PrivacyPanel } from './settings/PrivacyPanel';
import { SupportPanel } from './settings/SupportPanel';
import s from './SettingsModal.module.css';

type SettingsTab = 'general' | 'privacy' | 'billing' | 'support';

// Lets a preview/handoff route render the Billing tab in a specific state.
export type BillingStep = 'default' | 'cancel-confirm' | 'scheduled' | 'renew-confirm' | 'toast' | 'renewed';

const NAV_ITEMS: { key: SettingsTab; label: string; icon: Icon }[] = [
  { key: 'billing', label: 'Billing', icon: CreditCard },
  { key: 'general', label: 'General', icon: SlidersHorizontal },
  { key: 'privacy', label: 'Privacy & security', icon: Lock },
  { key: 'support', label: 'Support', icon: Lifebuoy },
];

const INVOICES = [
  { date: 'Jun 9, 2026', amount: '$20.00', status: 'Paid' },
  { date: 'May 9, 2026', amount: '$20.00', status: 'Paid' },
  { date: 'Apr 9, 2026', amount: '$20.00', status: 'Paid' },
  { date: 'Mar 9, 2026', amount: '$20.00', status: 'Paid' },
];

export function SettingsModal({
  onClose,
  captureMode = false,
  initialTab = 'billing',
  previewStep,
}: {
  onClose: () => void;
  captureMode?: boolean;
  initialTab?: SettingsTab;
  previewStep?: BillingStep;
}) {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset scroll state when switching tabs so the gradient starts hidden.
  useEffect(() => {
    setScrolled(false);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    if (captureMode) {
      return () => document.removeEventListener('keydown', handleKey);
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, captureMode]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={[s.overlay, captureMode ? s.overlayBare : ''].filter(Boolean).join(' ')}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className={[s.modal, captureMode ? s.modalBare : ''].filter(Boolean).join(' ')}>
        <aside className={s.nav}>
          <span className={s.navLabel}>Settings</span>
          <nav className={s.navList}>
            {NAV_ITEMS.map(({ key, label, icon: ItemIcon }) => (
              <button
                key={key}
                type="button"
                className={[s.navItem, tab === key ? s.navItemActive : ''].filter(Boolean).join(' ')}
                onClick={() => setTab(key)}
              >
                <ItemIcon className={s.navIcon} weight="regular" aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className={s.contentWrap}>
          <header className={s.contentHeader}>
            <button type="button" className={s.closeBtn} onClick={onClose} aria-label="Close settings">
              <X weight="regular" aria-hidden="true" />
            </button>
          </header>
          <div className={[s.topFade, scrolled ? s.topFadeVisible : ''].filter(Boolean).join(' ')} aria-hidden="true" />

          <div
            ref={scrollRef}
            className={[s.content, captureMode ? s.contentBare : ''].filter(Boolean).join(' ')}
            onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
          >
            {tab === 'billing' ? (
              <BillingPanel previewStep={previewStep} />
            ) : tab === 'privacy' ? (
              <PrivacyPanel />
            ) : tab === 'support' ? (
              <SupportPanel />
            ) : (
              <GeneralPanel />
            )}
          </div>
        </section>
      </div>
    </div>,
    document.body,
  );
}

function ConfirmDialog({
  title,
  body,
  summary,
  warning,
  primaryLabel,
  primaryVariant = 'primary',
  secondaryLabel,
  onPrimary,
  onSecondary,
}: {
  title: string;
  body: string;
  summary?: { name: string; sub: string; price: string };
  warning?: string;
  primaryLabel: string;
  primaryVariant?: 'primary' | 'destructive';
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSecondary();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onSecondary]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={s.confirmOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSecondary();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={s.confirmModal}>
        <h2 className={s.confirmTitle}>{title}</h2>
        <p className={s.confirmBody}>{body}</p>
        {summary && (
          <div className={s.confirmSummary}>
            <div className={s.confirmSummaryLeft}>
              <span className={s.confirmSummaryName}>{summary.name}</span>
              <span className={s.confirmSummarySub}>{summary.sub}</span>
            </div>
            <span className={s.confirmSummaryPrice}>{summary.price}</span>
          </div>
        )}
        {warning && (
          <div className={s.confirmWarning}>
            <Warning className={s.confirmWarningIcon} weight="fill" aria-hidden="true" />
            <p className={s.confirmWarningText}>{warning}</p>
          </div>
        )}
        <div className={s.confirmActions}>
          <Button type="button" variant="secondary" fullWidth={false} onClick={onSecondary}>
            {secondaryLabel}
          </Button>
          <Button type="button" variant={primaryVariant} fullWidth={false} onClick={onPrimary}>
            {primaryLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function BillingPanel({ previewStep }: { previewStep?: BillingStep }) {
  const router = useRouter();
  const [scheduled, setScheduled] = useState(
    previewStep === 'scheduled' || previewStep === 'renew-confirm' || previewStep === 'toast',
  );
  const [cancelOpen, setCancelOpen] = useState(previewStep === 'cancel-confirm');
  const [renewOpen, setRenewOpen] = useState(previewStep === 'renew-confirm');

  const [mounted, setMounted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(
    previewStep === 'toast'
      ? 'Downgrade to Surmount Free scheduled'
      : previewStep === 'renewed'
        ? 'Subscription reactivated'
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

  function goToPlans() {
    // Came from Settings → Billing — back should reopen Settings on the Billing tab.
    try {
      sessionStorage.setItem('surmount:plansReturn', 'settings-billing');
    } catch {
      /* ignore */
    }
    router.push('/plans');
  }

  return (
    <>
      <div className={s.panel}>
        {/* Current plan */}
        <div className={[s.planCard, s.planTintPlus].join(' ')}>
          <div className={s.planCardLeft}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/illustrations/plus-plan-mark.svg" alt="" className={s.planCardLogo} />
            <div className={s.planCardMeta}>
              <div className={s.planCardNameRow}>
                <span className={s.planCardName}>Plus plan</span>
                <span className={s.planBadge}>Yearly</span>
              </div>
              <span className={s.planCardDesc}>Invest up to $150K with no-code strategy builders.</span>
            </div>
          </div>
          <Button type="button" variant="primary" size="sm" fullWidth={false} onClick={goToPlans}>
            Adjust plan
          </Button>
        </div>

        <div className={s.statusBanner}>
          <div className={s.statusLeft}>
            <CalendarBlank className={s.statusIcon} weight="regular" aria-hidden="true" />
            <span className={s.statusText}>
              {scheduled
                ? 'Your downgrade to the Free monthly plan is scheduled for Jul 9, 2026.'
                : 'Your plan renews on Jul 9, 2026.'}
            </span>
          </div>
          {scheduled ? (
            <Button type="button" variant="primary" size="sm" fullWidth={false} onClick={() => setRenewOpen(true)}>
              Reactivate current Plus plan
            </Button>
          ) : (
            <Button type="button" variant="secondary" size="sm" fullWidth={false} onClick={() => setCancelOpen(true)}>
              Cancel plan
            </Button>
          )}
        </div>

        {scheduled && (
          <div className={s.statusWarning}>
            <Warning className={s.statusWarningIcon} weight="fill" aria-hidden="true" />
            <span className={s.statusWarningText}>
              On Jul 9, 2026, strategies you invested in through a connected external brokerage will be liquidated and
              your external trading connections removed.
            </span>
          </div>
        )}

        <div className={s.divider} />

      {/* Payment */}
      <div className={s.section}>
        <h3 className={s.sectionTitle}>Payment method</h3>
        <div className={s.rowBetween}>
          <div className={s.payLeft}>
            <span className={s.cardBrand}>
              <CreditCard weight="fill" aria-hidden="true" />
            </span>
            <div className={s.payMeta}>
              <span className={s.payPrimary}>{paymentLabel()}</span>
              <span className={s.paySub}>{paymentExpiry()}</span>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            fullWidth={false}
            onClick={() => router.push(PAYMENT_UPDATE_ROUTE)}
          >
            Update
          </Button>
        </div>
      </div>

      <div className={s.divider} />

      {/* Invoices */}
      <div className={s.section}>
        <h3 className={s.sectionTitle}>Billing history</h3>
        <div className={s.table}>
          <div className={[s.tableRow, s.tableHead].join(' ')}>
            <span>Date</span>
            <span>Amount</span>
            <span>Status</span>
            <span className={s.tableActions}>Invoice</span>
          </div>
            {INVOICES.map((inv) => (
              <div className={s.tableRow} key={inv.date}>
                <span className={s.tableDate}>{inv.date}</span>
                <span className={s.tableAmount}>{inv.amount}</span>
                <span>
                  <span className={s.statusBadge}>{inv.status}</span>
                </span>
                <span className={s.tableActions}>
                  <button type="button" className={s.linkBtn}>View</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {cancelOpen && (
        <ConfirmDialog
          title="Downgrade to the Free plan?"
          body="Your downgrade to the Free monthly plan is scheduled for Jul 9, 2026. You'll keep Surmount Plus and all its features until then."
          warning="When your plan changes to Free on Jul 9, 2026, any strategies you invested in through a connected external brokerage will be liquidated, and your external trading connections will be removed."
          primaryLabel="Cancel plan"
          primaryVariant="destructive"
          secondaryLabel="Keep your Plus plan"
          onPrimary={() => {
            setScheduled(true);
            setCancelOpen(false);
            showToast('Downgrade to Surmount Free scheduled');
          }}
          onSecondary={() => setCancelOpen(false)}
        />
      )}

      {renewOpen && (
        <ConfirmDialog
          title="Reactivate subscription"
          body="You'll keep access to Surmount Plus and your next charge will be processed on Jul 9, 2026."
          summary={{ name: 'Surmount Plus', sub: 'Next charge Jul 9, 2026', price: '$100 USD / year' }}
          primaryLabel="Reactivate subscription"
          primaryVariant="primary"
          secondaryLabel="Go back"
          onPrimary={() => {
            setScheduled(false);
            setRenewOpen(false);
            showToast('Subscription reactivated');
          }}
          onSecondary={() => setRenewOpen(false)}
        />
      )}

      {mounted &&
        toastMsg &&
        createPortal(
          <div className={s.toastRegion} aria-live="polite" aria-atomic="true">
            <div className={[s.toastAlert, toastLeaving ? s.toastAlertLeaving : ''].filter(Boolean).join(' ')}>
              <CheckCircle className={s.toastIcon} weight="fill" aria-hidden="true" />
              <p className={s.toastText}>{toastMsg}</p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

