// Single source of truth for the user's payment method.
// Shared by the Settings → Billing tab and the Plans upgrade modal so both
// always show the same card and route to the same update flow.

export type PaymentMethod = {
  brand: string;
  last4: string;
  expMonth: string;
  expYear: string;
};

export const PAYMENT_METHOD: PaymentMethod = {
  brand: 'Visa',
  last4: '4242',
  expMonth: '08',
  expYear: '2028',
};

// Route the "Update"/edit payment-method actions navigate to.
export const PAYMENT_UPDATE_ROUTE = '/onboarding/link-bank?mode=update';

// "Visa ending in 4242"
export const paymentLabel = (pm: PaymentMethod = PAYMENT_METHOD) => `${pm.brand} ending in ${pm.last4}`;

// "Expires 08 / 2028"
export const paymentExpiry = (pm: PaymentMethod = PAYMENT_METHOD) => `Expires ${pm.expMonth} / ${pm.expYear}`;
