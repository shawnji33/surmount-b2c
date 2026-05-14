'use client';

import { ArrowLeft, CheckCircle, EnvelopeSimple, Eye, EyeSlash, Password, WarningCircle, X } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Input } from './Input';
import styles from './LoginPage.module.css';

type AuthMode = 'sign-in' | 'sign-up' | 'verify-email' | 'forgot-password' | 'reset-sent';
type ToastTone = 'success' | 'error';

const EMAIL_SENT_MESSAGE = 'Email has been sent for verification.';
const RESEND_COOLDOWN_SECONDS = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GoogleIcon() {
  return (
    <span className={styles.googleIcon} aria-hidden="true">
      <img src="/assets/sign-in/google-vector-blue.svg" alt="" className={styles.googleBlue} />
      <img src="/assets/sign-in/google-vector-green.svg" alt="" className={styles.googleGreen} />
      <img src="/assets/sign-in/google-vector-yellow.svg" alt="" className={styles.googleYellow} />
      <img src="/assets/sign-in/google-vector-red.svg" alt="" className={styles.googleRed} />
    </span>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>('sign-in');
  const [cardContentHeight, setCardContentHeight] = useState<number>();
  const [verificationEmail, setVerificationEmail] = useState('logan@surmount.ai');
  const [resetEmail, setResetEmail] = useState('logan@surmount.ai');
  const [toastMessage, setToastMessage] = useState('');
  const [toastTone, setToastTone] = useState<ToastTone>('success');
  const [isToastLeaving, setIsToastLeaving] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const [hasHeroVideoStarted, setHasHeroVideoStarted] = useState(false);
  const [isHeroVideoPlaying, setIsHeroVideoPlaying] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [signUpEmailError, setSignUpEmailError] = useState('');
  const [signUpPasswordError, setSignUpPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const cardContentRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const toastTimerRef = useRef<number | undefined>(undefined);
  const toastLeaveTimerRef = useRef<number | undefined>(undefined);
  const isSignUp = authMode === 'sign-up';
  const isVerifyEmail = authMode === 'verify-email';
  const isForgotPassword = authMode === 'forgot-password';
  const isResetSent = authMode === 'reset-sent';

  useLayoutEffect(() => {
    const content = cardContentRef.current;
    if (!content) return;

    const animationFrame = window.requestAnimationFrame(() => {
      setCardContentHeight(content.scrollHeight);
    });
    const settleTimer = window.setTimeout(() => {
      setCardContentHeight(undefined);
    }, 260);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(settleTimer);
    };
  }, [authMode]);

  useEffect(() => {
    if (resendSeconds <= 0) return;

    const interval = window.setInterval(() => {
      setResendSeconds((currentSeconds) => Math.max(0, currentSeconds - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [resendSeconds]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) window.clearTimeout(toastTimerRef.current);
      if (toastLeaveTimerRef.current != null) window.clearTimeout(toastLeaveTimerRef.current);
    };
  }, []);

  function dismissToast() {
    if (toastLeaveTimerRef.current != null) window.clearTimeout(toastLeaveTimerRef.current);
    setIsToastLeaving(true);
    toastLeaveTimerRef.current = window.setTimeout(() => {
      setToastMessage('');
      setIsToastLeaving(false);
    }, 200);
  }

  function showToast(message: string, tone: ToastTone) {
    if (toastTimerRef.current != null) window.clearTimeout(toastTimerRef.current);
    if (toastLeaveTimerRef.current != null) window.clearTimeout(toastLeaveTimerRef.current);
    setIsToastLeaving(false);
    setToastTone(tone);
    setToastMessage('');
    window.requestAnimationFrame(() => {
      setToastMessage(message);
      toastTimerRef.current = window.setTimeout(dismissToast, 4200);
    });
  }

  function showEmailSentAlert() {
    showToast(EMAIL_SENT_MESSAGE, 'success');
  }

  function changeAuthMode(nextMode: AuthMode) {
    if (nextMode === authMode) return;

    const content = cardContentRef.current;
    if (content) setCardContentHeight(content.offsetHeight);
    setEmailError('');
    setPasswordError('');
    setFirstNameError('');
    setLastNameError('');
    setSignUpEmailError('');
    setSignUpPasswordError('');
    setConfirmPasswordError('');
    setCaptchaError('');
    setAuthMode(nextMode);
  }

  function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    if (authMode === 'sign-in') {
      const formData = new FormData(form);
      const email = String(formData.get('signin-email') ?? '').trim();
      const password = String(formData.get('signin-password') ?? '').trim();

      let hasError = false;

      if (!email) {
        setEmailError('Email is required.');
        hasError = true;
      } else if (!EMAIL_PATTERN.test(email)) {
        setEmailError('Invalid email format.');
        hasError = true;
      } else {
        setEmailError('');
      }

      if (!password) {
        setPasswordError('Password is required.');
        hasError = true;
      } else {
        setPasswordError('');
      }

      if (hasError) return;

      if (email === 'logan@surmount.ai' && password === '12345678') {
        router.push('/home');
        return;
      }

      showToast('Incorrect email or password. Please try again.', 'error');
      return;
    }

    if (authMode === 'sign-up') {
      const formData = new FormData(form);
      const firstName = String(formData.get('first-name') ?? '').trim();
      const lastName = String(formData.get('last-name') ?? '').trim();
      const email = String(formData.get('signup-email') ?? '').trim();
      const password = String(formData.get('password') ?? '');
      const confirmPassword = String(formData.get('confirm-password') ?? '');
      const captcha = String(formData.get('captcha') ?? '').trim();

      let hasError = false;

      if (!firstName) { setFirstNameError('First name is required.'); hasError = true; }
      else setFirstNameError('');

      if (!lastName) { setLastNameError('Last name is required.'); hasError = true; }
      else setLastNameError('');

      if (!email) { setSignUpEmailError('Email is required.'); hasError = true; }
      else if (!EMAIL_PATTERN.test(email)) { setSignUpEmailError('Invalid email format.'); hasError = true; }
      else setSignUpEmailError('');

      if (!password) { setSignUpPasswordError('Password is required.'); hasError = true; }
      else if (password.length < 8) { setSignUpPasswordError('Password must be at least 8 characters.'); hasError = true; }
      else setSignUpPasswordError('');

      if (!confirmPassword) { setConfirmPasswordError('Please confirm your password.'); hasError = true; }
      else if (confirmPassword !== password) { setConfirmPasswordError('Passwords do not match.'); hasError = true; }
      else setConfirmPasswordError('');

      if (!captcha) { setCaptchaError('Please enter the captcha.'); hasError = true; }
      else setCaptchaError('');

      if (hasError) return;

      setVerificationEmail(email);
      changeAuthMode('verify-email');
      showEmailSentAlert();
      return;
    }

    if (authMode === 'forgot-password') {
      if (!form.reportValidity()) return;

      const formData = new FormData(form);
      const email = String(formData.get('reset-email') ?? '').trim();
      setResetEmail(email || 'logan@surmount.ai');
      changeAuthMode('reset-sent');
      showEmailSentAlert();
    }
  }

  function handleResendEmail() {
    if (resendSeconds > 0) return;

    showEmailSentAlert();
    setResendSeconds(RESEND_COOLDOWN_SECONDS);
  }

  function handleGoogleAuth() {
    showToast('Google sign-in was interrupted. Please try again.', 'error');
  }

  async function handleToggleHeroVideo() {
    const video = heroVideoRef.current;
    if (!video) return;

    if (isHeroVideoPlaying) {
      video.pause();
      setIsHeroVideoPlaying(false);
      return;
    }

    setHasHeroVideoStarted(true);
    try {
      await video.play();
      setIsHeroVideoPlaying(true);
    } catch {
      setIsHeroVideoPlaying(false);
    }
  }

  return (
    <main className={styles.page}>
      {toastMessage !== '' && (
        <div className={styles.toastRegion} aria-live="polite" aria-atomic="true">
          <div
            className={[
              styles.toastAlert,
              toastTone === 'error' ? styles.toastAlertError : '',
              isToastLeaving ? styles.toastAlertLeaving : '',
            ].filter(Boolean).join(' ')}
            role="status"
          >
            {toastTone === 'error' ? (
              <WarningCircle className={styles.toastIcon} weight="fill" aria-hidden="true" />
            ) : (
              <CheckCircle className={styles.toastIcon} weight="fill" aria-hidden="true" />
            )}
            <p className={styles.toastText}>{toastMessage}</p>
            <button
              type="button"
              className={styles.toastDismiss}
              aria-label="Dismiss alert"
              onClick={dismissToast}
            >
              <X aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <section className={styles.heroSection} aria-label="Surmount">
        <div className={styles.heroPanel}>
          <video
            ref={heroVideoRef}
            className={styles.heroVideo}
            data-active={hasHeroVideoStarted}
            src="/assets/sign-in/auth-hero-video.mp4"
            poster="/assets/sign-in/auth-hero-video-poster.png"
            preload="metadata"
            loop
            playsInline
            onPlay={() => {
              setHasHeroVideoStarted(true);
              setIsHeroVideoPlaying(true);
            }}
            onPause={() => setIsHeroVideoPlaying(false)}
          />
          <img
            className={styles.heroLogo}
            src="/assets/sign-in/surmount-logo.svg"
            alt="Surmount"
          />
          <button
            className={styles.heroPlayButton}
            type="button"
            aria-label={isHeroVideoPlaying ? 'Pause Surmount preview video' : 'Play Surmount preview video'}
            aria-pressed={isHeroVideoPlaying}
            onClick={handleToggleHeroVideo}
          >
            <span
              className={isHeroVideoPlaying ? styles.heroPauseIcon : styles.heroPlayIcon}
              aria-hidden="true"
            />
          </button>
        </div>
      </section>

      <section
        className={styles.formPanel}
        aria-label={
          isVerifyEmail
            ? 'Verify your Surmount email'
            : (isForgotPassword || isResetSent)
              ? 'Reset your Surmount password'
              : isSignUp
                ? 'Sign up for Surmount'
                : 'Sign in to Surmount'
        }
      >
        <div className={styles.formScroll}>
          <form
            className={[
              styles.card,
              (isVerifyEmail || isForgotPassword || isResetSent) ? styles.cardVerification : '',
            ].filter(Boolean).join(' ')}
            onSubmit={handleAuthSubmit}
          >
            <div
              className={styles.cardContentFrame}
              style={cardContentHeight != null ? { height: cardContentHeight } : undefined}
            >
              <div
                key={authMode}
                ref={cardContentRef}
                className={[
                  styles.cardContent,
                  isSignUp ? styles.cardContentSignUp : styles.cardContentSignIn,
                ].join(' ')}
              >
                {isVerifyEmail ? (
                  <>
                    <div className={styles.verifyHeader}>
                      <EnvelopeSimple
                        className={styles.verifyIcon}
                        weight="duotone"
                        aria-hidden="true"
                      />
                      <h1 className={styles.cardTitle}>Check your email</h1>
                    </div>

                    <div className={styles.verifyMessage}>
                      <p>We sent a verification link to</p>
                      <strong>{verificationEmail}</strong>
                    </div>

                    <div className={styles.verifyActions}>
                      <p className={styles.authSwitchLine}>
                        Didn&apos;t receive a link?
                        <button
                          type="button"
                          className={styles.authSwitchButton}
                          disabled={resendSeconds > 0}
                          onClick={handleResendEmail}
                        >
                          {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : 'Resend'}
                        </button>
                      </p>
                      <button
                        type="button"
                        className={styles.backLoginButton}
                        onClick={() => changeAuthMode('sign-in')}
                      >
                        <ArrowLeft className={styles.backLoginIcon} aria-hidden="true" />
                        Back to login
                      </button>
                    </div>
                  </>
                ) : isResetSent ? (
                  <>
                    <div className={styles.verifyHeader}>
                      <EnvelopeSimple
                        className={styles.verifyIcon}
                        weight="duotone"
                        aria-hidden="true"
                      />
                      <h1 className={styles.cardTitle}>Check your email</h1>
                    </div>

                    <div className={styles.verifyMessage}>
                      <p>We sent a password reset link to</p>
                      <strong>{resetEmail}</strong>
                    </div>

                    <div className={styles.verifyActions}>
                      <p className={styles.authSwitchLine}>
                        Didn&apos;t receive a link?
                        <button
                          type="button"
                          className={styles.authSwitchButton}
                          disabled={resendSeconds > 0}
                          onClick={handleResendEmail}
                        >
                          {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : 'Resend'}
                        </button>
                      </p>
                      <button
                        type="button"
                        className={styles.backLoginButton}
                        onClick={() => changeAuthMode('sign-in')}
                      >
                        <ArrowLeft className={styles.backLoginIcon} aria-hidden="true" />
                        Back to login
                      </button>
                    </div>
                  </>
                ) : isForgotPassword ? (
                  <>
                    <div className={styles.verifyHeader}>
                      <Password
                        className={styles.verifyIcon}
                        weight="duotone"
                        aria-hidden="true"
                      />
                      <div className={styles.cardHeader}>
                        <h1 className={styles.cardTitle}>Forgot password?</h1>
                        <p className={styles.cardSubtitle}>
                          No worries, we&apos;ll send you reset instructions.
                        </p>
                      </div>
                    </div>

                    <Input
                      size="sm"
                      label="Email"
                      name="reset-email"
                      type="text"
                      inputMode="email"
                      pattern={'[^\\s@]+@[^\\s@]+\\.[^\\s@]+'}
                      title="Enter a valid email address."
                      autoComplete="email"
                      required
                    />

                    <div className={styles.verifyActions}>
                      <Button type="submit">Reset password</Button>
                      <button
                        type="button"
                        className={styles.backLoginButton}
                        onClick={() => changeAuthMode('sign-in')}
                      >
                        <ArrowLeft className={styles.backLoginIcon} aria-hidden="true" />
                        Back to login
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.cardHeader}>
                      <h1 className={styles.cardTitle}>{isSignUp ? 'Sign up' : 'Welcome back'}</h1>
                      <p className={styles.cardSubtitle}>
                        {isSignUp
                          ? 'Start your personalized investment strategy now!'
                          : 'Login to your Surmount account'}
                      </p>
                    </div>

                    {isSignUp ? (
                      <>
                        <div className={styles.fields}>
                          <div className={styles.nameRow}>
                            <Input
                              size="sm"
                              label="First name"
                              name="first-name"
                              autoComplete="given-name"
                              error={Boolean(firstNameError)}
                              errorText={firstNameError || undefined}
                              onChange={() => setFirstNameError('')}
                            />
                            <Input
                              size="sm"
                              label="Last name"
                              name="last-name"
                              autoComplete="family-name"
                              error={Boolean(lastNameError)}
                              errorText={lastNameError || undefined}
                              onChange={() => setLastNameError('')}
                            />
                          </div>

                          <Input
                            size="sm"
                            label="Email"
                            name="signup-email"
                            type="text"
                            inputMode="email"
                            autoComplete="email"
                            error={Boolean(signUpEmailError)}
                            errorText={signUpEmailError || undefined}
                            onChange={() => setSignUpEmailError('')}
                          />

                          <Input
                            size="sm"
                            label="Password"
                            name="password"
                            type={showSignUpPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            error={Boolean(signUpPasswordError)}
                            errorText={signUpPasswordError || undefined}
                            onChange={() => setSignUpPasswordError('')}
                            iconTrailing={
                              <button
                                type="button"
                                className={styles.eyeButton}
                                aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                                onClick={() => setShowSignUpPassword((v) => !v)}
                              >
                                {showSignUpPassword
                                  ? <EyeSlash weight="regular" aria-hidden="true" />
                                  : <Eye weight="regular" aria-hidden="true" />
                                }
                              </button>
                            }
                          />

                          <Input
                            size="sm"
                            label="Confirm password"
                            name="confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            error={Boolean(confirmPasswordError)}
                            errorText={confirmPasswordError || undefined}
                            onChange={() => setConfirmPasswordError('')}
                            iconTrailing={
                              <button
                                type="button"
                                className={styles.eyeButton}
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                onClick={() => setShowConfirmPassword((v) => !v)}
                              >
                                {showConfirmPassword
                                  ? <EyeSlash weight="regular" aria-hidden="true" />
                                  : <Eye weight="regular" aria-hidden="true" />
                                }
                              </button>
                            }
                          />

                          <div className={styles.captchaRow}>
                            <Input
                              size="sm"
                              label="Captcha"
                              name="captcha"
                              autoComplete="off"
                              error={Boolean(captchaError)}
                              errorText={captchaError || undefined}
                              onChange={() => setCaptchaError('')}
                            />
                            <div className={styles.captchaBox} aria-label="Captcha image">
                              <img src="/assets/sign-in/captcha.png" alt="" />
                            </div>
                          </div>
                        </div>

                        <div className={styles.actions}>
                          <Button type="submit">Continue</Button>
                          <Button type="button" variant="secondary" iconLeading={<GoogleIcon />} onClick={handleGoogleAuth}>
                            Sign up with Google
                          </Button>
                          <p className={styles.authSwitchLine}>
                            Already have an account?
                            <button
                              type="button"
                              className={styles.authSwitchButton}
                              onClick={() => changeAuthMode('sign-in')}
                            >
                              Sign in
                            </button>
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={styles.fields}>
                          <Input
                            size="sm"
                            label="Email"
                            name="signin-email"
                            type="text"
                            inputMode="email"
                            autoComplete="email"
                            error={Boolean(emailError)}
                            errorText={emailError || undefined}
                            onChange={() => setEmailError('')}
                          />

                          <Input
                            size="sm"
                            label="Password"
                            name="signin-password"
                            type={showSignInPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            error={Boolean(passwordError)}
                            errorText={passwordError || undefined}
                            onChange={() => setPasswordError('')}
                            iconTrailing={
                              <button
                                type="button"
                                className={styles.eyeButton}
                                aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                                onClick={() => setShowSignInPassword((v) => !v)}
                              >
                                {showSignInPassword
                                  ? <EyeSlash weight="regular" aria-hidden="true" />
                                  : <Eye weight="regular" aria-hidden="true" />
                                }
                              </button>
                            }
                          />

                          <div className={styles.checkRow}>
                            <Checkbox
                              label="Remember me for 30 days"
                              checked={rememberMe}
                              onChange={(event) => setRememberMe(event.currentTarget.checked)}
                            />
                            <button
                              type="button"
                              className={styles.forgotLink}
                              onClick={() => changeAuthMode('forgot-password')}
                            >
                              Forgot password?
                            </button>
                          </div>
                        </div>

                        <div className={styles.actions}>
                          <Button type="submit">Sign in</Button>
                          <Button type="button" variant="secondary" iconLeading={<GoogleIcon />} onClick={handleGoogleAuth}>
                            Sign in with Google
                          </Button>
                          <p className={styles.authSwitchLine}>
                            Don&apos;t have an account?
                            <button
                              type="button"
                              className={styles.authSwitchButton}
                              onClick={() => changeAuthMode('sign-up')}
                            >
                              Sign up
                            </button>
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </form>
        </div>

        <footer className={styles.footer}>
          <span>©Surmount AI</span>
        </footer>
      </section>
    </main>
  );
}
