'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '../_components/OnboardingFlow';
import { DSInput } from '../_components/DSInput';
import { DSDropdown } from '../_components/DSDropdown';
import s from '../_components/onboarding.module.css';

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

export default function AddressPage() {
  const router = useRouter();
  const [street, setStreet] = useState('');
  const [unit, setUnit] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [errors, setErrors] = useState({ street: '', city: '', state: '', zip: '' });

  function handleNext() {
    const e = {
      street: street.trim() ? '' : 'Street address is required.',
      city: city.trim() ? '' : 'City is required.',
      state: state ? '' : 'Please select a state.',
      zip: zip.trim().length === 5 ? '' : 'Please enter a valid 5-digit ZIP code.',
    };
    setErrors(e);
    if (Object.values(e).every(v => !v)) router.push('/onboarding/citizenship');
  }

  return (
    <OnboardingFlow back="/onboarding/date-of-birth">
      <main className={s.main}>
        <div className={s.stack}>
          <div className={s.hero}>
            <h1 className={s.title}>What is your residential address?</h1>
            <p className={s.subtitle}>Enter your current home address. PO boxes are not accepted.</p>
          </div>

          <div className={s.form}>
            <DSInput
              label="Street address"
              id="street"
              type="text"
              placeholder="123 Main St"
              autoComplete="address-line1"
              autoFocus
              value={street}
              error={!!errors.street}
              errorText={errors.street || undefined}
              onChange={e => { setStreet(e.target.value); if (errors.street) setErrors(p => ({ ...p, street: '' })); }}
            />
            <DSInput
              label="Apt / unit (optional)"
              id="unit"
              type="text"
              placeholder="Apt 4B"
              autoComplete="address-line2"
              value={unit}
              onChange={e => setUnit(e.target.value)}
            />
            <DSInput
              label="City"
              id="city"
              type="text"
              placeholder="San Francisco"
              autoComplete="address-level2"
              value={city}
              error={!!errors.city}
              errorText={errors.city || undefined}
              onChange={e => { setCity(e.target.value); if (errors.city) setErrors(p => ({ ...p, city: '' })); }}
            />
            <div className={s.fieldRow}>
              <DSDropdown
                label="State"
                id="state"
                options={US_STATES}
                value={state}
                onChange={v => { setState(v); if (errors.state) setErrors(p => ({ ...p, state: '' })); }}
                error={!!errors.state}
                errorText={errors.state || undefined}
                placeholder="Select"
              />
              <DSInput
                label="ZIP code"
                id="zip"
                type="text"
                inputMode="numeric"
                placeholder="94102"
                autoComplete="postal-code"
                maxLength={5}
                value={zip}
                error={!!errors.zip}
                errorText={errors.zip || undefined}
                onChange={e => { setZip(e.target.value.replace(/\D/g, '').slice(0, 5)); if (errors.zip) setErrors(p => ({ ...p, zip: '' })); }}
              />
            </div>
          </div>

          <button className={s.cta} type="button" onClick={handleNext}>
            Next
            <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
            </svg>
          </button>
        </div>
      </main>
    </OnboardingFlow>
  );
}
