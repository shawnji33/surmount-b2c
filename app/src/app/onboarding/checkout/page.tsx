'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, CaretDown, AppleLogo, ArrowCircleRight } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/Button';
import s from './page.module.css';

const TIERS: Record<string, { name: string; price: number }> = {
  core: { name: 'Surmount Core', price: 5 },
  plus: { name: 'Surmount Plus', price: 10 },
  pro: { name: 'Surmount Pro', price: 30 },
};

const COUNTRIES = ['United States', 'Canada', 'United Kingdom'];

// This is a prototype — no backend, no real Stripe SDK, no charge. The checkout below is a
// visual stand-in modeled on Stripe's actual Checkout UI (docs.stripe.com/sandboxes); wiring a
// real Stripe Checkout Session or Elements integration needs a server endpoint this app doesn't
// have yet. Apple Pay / Link / "Add promotion code" are inert — they mirror Stripe's layout but
// don't do anything, consistent with the rest of this mock flow.
const PROCESSING_DURATION_MS = 1400;

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldReduceMotion = useReducedMotion();
  const tierId = searchParams.get('tier') ?? 'core';
  const tier = TIERS[tierId] ?? TIERS.core;
  const priceText = `${tier.price}.00`;

  const [email, setEmail] = useState('logan@surmount.ai');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12 / 28');
  const [cvc, setCvc] = useState('123');
  const [cardholderName, setCardholderName] = useState('Logan Weaver');
  const [country, setCountry] = useState('United States');
  const [countryOpen, setCountryOpen] = useState(false);
  const [postalCode, setPostalCode] = useState('10001');
  const [saveInfo, setSaveInfo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => {
      router.push(`/home?state=empty&unlocked=${tierId}`);
    }, PROCESSING_DURATION_MS);
  };

  return (
    <div className={s.shell}>
      <motion.div
        className={s.grid}
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* ── Left: order summary ── */}
        <div className={s.left}>
          <div className={s.leftInner}>
            <button type="button" className={s.backButton} onClick={() => router.back()}>
              <ArrowLeft weight="regular" aria-hidden="true" />
            </button>

            <div className={s.brandRow}>
              <img src="/assets/brokers/surmount.png" alt="" className={s.brandLogo} />
              <span className={s.brandName}>Surmount</span>
              <span className={s.sandboxBadge}>Sandbox</span>
            </div>

            <div className={s.summaryHeading}>
              <p className={s.summaryLabel}>Subscribe to {tier.name}</p>
              <div className={s.priceRow}>
                <span className={s.priceValue}>${tier.price}</span>
                <span className={s.priceMeta}>per<br />month</span>
              </div>
            </div>

            <div className={s.lineItems}>
              <div className={s.lineItemRow}>
                <div className={s.lineItemLabel}>
                  <span className={s.lineItemName}>{tier.name}</span>
                  <span className={s.lineItemSub}>Billed monthly</span>
                </div>
                <span className={s.lineItemPrice}>${priceText}</span>
              </div>

              <div className={s.lineDivider} />

              <div className={s.lineItemRow}>
                <span className={s.lineItemName}>Subtotal</span>
                <span className={s.lineItemPrice}>${priceText}</span>
              </div>

              <button type="button" className={s.promoButton}>Add promotion code</button>

              <div className={s.lineDivider} />

              <div className={s.lineItemRow}>
                <span className={s.totalLabel}>Total due today</span>
                <span className={s.totalPrice}>${priceText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: payment form ── */}
        <div className={s.right}>
          <form className={s.rightInner} onSubmit={handleSubmit}>
            <div className={s.walletRow}>
              <button type="button" className={s.applePayButton}>
                <AppleLogo weight="fill" aria-hidden="true" />
                Pay
              </button>
              <button type="button" className={s.linkButton}>
                <ArrowCircleRight weight="fill" aria-hidden="true" />
                link
              </button>
            </div>

            <div className={s.orDivider}>
              <span>Or</span>
            </div>

            <div className={s.formSection}>
              <p className={s.formSectionTitle}>Contact information</p>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="checkout-email">Email</label>
                <input
                  id="checkout-email"
                  type="email"
                  className={s.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className={s.formSection}>
              <p className={s.formSectionTitle}>Payment method</p>

              <div className={s.cardBox}>
                <div className={s.cardTab}>
                  <CreditCard weight="regular" aria-hidden="true" />
                  Card
                </div>

                <div className={s.field}>
                  <span className={s.fieldLabel}>Card information</span>
                  <div className={s.cardGroup}>
                    <div className={s.cardNumberRow}>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 1234 1234 1234"
                        inputMode="numeric"
                        required
                      />
                      <CreditCard weight="regular" aria-hidden="true" className={s.cardBrandIcon} />
                    </div>
                    <div className={s.cardSplitRow}>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM / YY"
                        inputMode="numeric"
                        required
                      />
                      <input
                        type="text"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        placeholder="CVC"
                        inputMode="numeric"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={s.field}>
                  <label className={s.fieldLabel} htmlFor="checkout-name">Cardholder name</label>
                  <div className={s.cardGroup}>
                    <input
                      id="checkout-name"
                      type="text"
                      className={s.soloInput}
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="Full name on card"
                      required
                    />
                  </div>
                </div>

                <div className={s.field}>
                  <label className={s.fieldLabel}>Country or region</label>
                  <div className={s.cardGroup}>
                    <div className={s.selectRow}>
                      <button
                        type="button"
                        className={s.selectTrigger}
                        onClick={() => setCountryOpen((o) => !o)}
                        aria-haspopup="listbox"
                        aria-expanded={countryOpen}
                      >
                        {country}
                        <CaretDown weight="regular" aria-hidden="true" />
                      </button>
                      {countryOpen && (
                        <div className={s.selectPopover} role="listbox">
                          {COUNTRIES.map((c) => (
                            <div
                              key={c}
                              role="option"
                              aria-selected={c === country}
                              className={c === country ? `${s.selectOption} ${s.selectOptionActive}` : s.selectOption}
                              onClick={() => { setCountry(c); setCountryOpen(false); }}
                            >
                              {c}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      className={s.soloInput}
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="ZIP code"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <label className={s.saveRow}>
              <input
                type="checkbox"
                className={s.saveCheckbox}
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
              />
              <span className={s.saveText}>
                <span className={s.saveTitle}>Save my information for faster checkout</span>
                <span className={s.saveDesc}>Pay securely at Surmount and everywhere Link is accepted.</span>
              </span>
            </label>

            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span className={s.spinner} aria-hidden="true" />
                  Processing...
                </span>
              ) : (
                'Subscribe'
              )}
            </Button>

            <p className={s.disclaimer}>
              By subscribing, you authorize Surmount to charge you ${priceText} today and ${priceText} monthly until you cancel.
              This is a preview — no real charge occurs, and the test card is pre-filled.
            </p>

            <p className={s.poweredBy}>Powered by stripe</p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutForm />
    </Suspense>
  );
}
