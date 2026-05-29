'use client';

import { ArrowLeft, ArrowRight, X } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Brand from '../_components/Brand';
import q from './page.module.css';

type Option = {
  value: string;
  label: string;
  sub?: string;
  bars?: 1 | 2 | 3;
};

type Question =
  | { id: string; type: 'single'; question: string; options: Option[] }
  | { id: string; type: 'multi'; layout: 'pills'; question: string; sub: string; options: Option[] };

const QUESTIONS: Question[] = [
  {
    id: 'goal',
    type: 'single',
    question: 'What are you investing for?',
    options: [
      { value: 'wealth', label: 'Long-term wealth growth', sub: 'Building wealth over many years' },
      { value: 'retirement', label: 'Retirement', sub: 'Saving for life after work' },
      { value: 'purchase', label: 'A major purchase', sub: 'A house, education, or other big goal' },
      { value: 'started', label: 'Just getting started', sub: 'Exploring investing without a specific goal yet' },
    ],
  },
  {
    id: 'horizon',
    type: 'single',
    question: 'When will you need this money?',
    options: [
      { value: '2yr', label: 'Within 2 years' },
      { value: '5yr', label: '2 to 5 years' },
      { value: '10yr', label: '5 to 10 years' },
      { value: '10plus', label: '10+ years' },
    ],
  },
  {
    id: 'risk',
    type: 'single',
    question: 'Imagine your portfolio drops 20% in a month. What do you do?',
    options: [
      { value: 'sell', label: 'Sell everything', sub: 'Preserve what I have left' },
      { value: 'reduce', label: 'Sell some to reduce risk', sub: 'Cut exposure, wait and see' },
      { value: 'hold', label: 'Stay the course', sub: "Hold steady - it'll recover" },
      { value: 'buy', label: 'Buy more', sub: "It's a discount - buy the dip" },
    ],
  },
  {
    id: 'experience',
    type: 'single',
    question: 'How would you describe your investing experience?',
    options: [
      { value: 'beginner', label: 'First-time investor', sub: 'New to investing', bars: 1 },
      { value: 'some', label: 'Some experience', sub: "I've bought stocks or ETFs before", bars: 2 },
      { value: 'expert', label: 'Experienced investor', sub: 'Comfortable managing a portfolio', bars: 3 },
    ],
  },
  {
    id: 'themes',
    type: 'multi',
    layout: 'pills',
    question: 'What themes interest you?',
    sub: 'Pick as many as you like',
    options: [
      { value: 'top-gainers', label: 'Top gainers' },
      { value: 'popular', label: 'Most popular' },
      { value: 'equity', label: 'Equity focused' },
      { value: 'crypto', label: 'Crypto and blockchain' },
      { value: 'dividend', label: 'Dividend and income strategies' },
      { value: 'sustainable', label: 'Sustainable and impact investing' },
      { value: 'ai', label: 'AI and disruptive tech' },
      { value: 'trading', label: 'Trading strategies' },
      { value: 'value', label: 'Value investing' },
      { value: 'biotech', label: 'Biotech and healthcare innovation' },
      { value: 'emerging', label: 'Emerging markets and global exposure' },
      { value: 'volatility', label: 'Market volatility and hedging' },
    ],
  },
];

type Answers = Record<string, string | string[]>;
type TransitionClass = '' | 'leave-forward' | 'leave-backward' | 'enter-forward' | 'enter-backward';

function ExperienceBars({ level }: { level: 1 | 2 | 3 }) {
  const heights = [7, 11, 16];

  return (
    <span className={q.expBars} aria-hidden="true">
      {heights.map((height, index) => (
        <span
          key={height}
          className={q.expBar}
          style={{
            height,
            background: index < level ? 'rgba(24,29,39,0.9)' : 'rgba(24,29,39,0.12)',
          }}
        />
      ))}
    </span>
  );
}

export default function StrategyQuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [transitionClass, setTransitionClass] = useState<TransitionClass>('');
  const [exitOpen, setExitOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingSub, setLoadingSub] = useState('Analyzing your answers...');
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const loadingTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const current = QUESTIONS[step];
  const currentAnswer = answers[current.id];
  const progress = ((step + 1) / QUESTIONS.length) * 100;
  const selectedThemes = Array.isArray(currentAnswer) ? currentAnswer : [];

  useEffect(() => {
    return () => {
      clearTimeout(transitionTimer.current);
      clearTimeout(advanceTimer.current);
      loadingTimers.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!exitOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExitOpen(false);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [exitOpen]);

  function goToStep(nextStep: number, direction: 1 | -1) {
    clearTimeout(transitionTimer.current);
    const leaveClass = direction > 0 ? 'leave-forward' : 'leave-backward';
    const enterClass = direction > 0 ? 'enter-forward' : 'enter-backward';

    setTransitionClass(leaveClass);
    transitionTimer.current = setTimeout(() => {
      setStep(nextStep);
      setTransitionClass(enterClass);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setTransitionClass(''));
      });
    }, 200);
  }

  function startLoading() {
    setLoading(true);
    setLoadingProgress(0);
    setLoadingSub('Analyzing your answers...');

    requestAnimationFrame(() => setLoadingProgress(100));
    loadingTimers.current.forEach(clearTimeout);
    loadingTimers.current = [
      setTimeout(() => setLoadingSub('Finding your best matches...'), 1100),
      setTimeout(() => router.push('/onboarding/strategy-results'), 2500),
    ];
  }

  function selectSingle(question: Question, value: string) {
    if (question.type !== 'single') return;

    clearTimeout(advanceTimer.current);
    setAnswers((currentAnswers) => ({ ...currentAnswers, [question.id]: value }));
    advanceTimer.current = setTimeout(() => {
      if (step < QUESTIONS.length - 1) {
        goToStep(step + 1, 1);
      } else {
        startLoading();
      }
    }, 280);
  }

  function toggleTheme(value: string) {
    setAnswers((currentAnswers) => {
      const currentValues = Array.isArray(currentAnswers.themes) ? currentAnswers.themes : [];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return { ...currentAnswers, themes: nextValues };
    });
  }

  function handleBack() {
    clearTimeout(advanceTimer.current);
    if (step > 0) {
      goToStep(step - 1, -1);
      return;
    }

    router.push('/onboarding/pick-strategy');
  }

  return (
    <div className={q.page}>
      <header className={q.topbar}>
        <button className={q.topbarButton} type="button" onClick={handleBack}>
          <ArrowLeft aria-hidden="true" />
          <span>Back</span>
        </button>

        <div className={q.brand}>
          <Brand size={28} />
          <span>Surmount</span>
        </div>

        <button className={q.topbarButton} type="button" onClick={() => setExitOpen(true)}>
          <span>Close</span>
          <X aria-hidden="true" />
        </button>
      </header>

      <div className={q.progress} aria-hidden="true">
        <div className={q.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <main className={[q.main, transitionClass ? q[transitionClass] : ''].filter(Boolean).join(' ')}>
        <div key={step} className={q.stack}>
          <div className={q.hero}>
            <h1 className={q.title}>{current.question}</h1>
            {current.type === 'multi' && <p className={q.subtitle}>{current.sub}</p>}
          </div>

          {current.type === 'single' ? (
            <fieldset className={q.radioGroup} aria-label={current.question}>
              {current.options.map((option) => {
                const selected = currentAnswer === option.value;

                return (
                  <label key={option.value} className={q.radioRow}>
                    <input
                      type="radio"
                      name={current.id}
                      value={option.value}
                      checked={selected}
                      onChange={() => selectSingle(current, option.value)}
                    />
                    {option.bars != null && <ExperienceBars level={option.bars} />}
                    <span className={q.optionText}>
                      <span className={q.optionLabel}>{option.label}</span>
                      {option.sub != null && <span className={q.optionSubLabel}>{option.sub}</span>}
                    </span>
                  </label>
                );
              })}
            </fieldset>
          ) : (
            <>
              <div className={q.themeGroup} role="group" aria-label={current.question}>
                {current.options.map((option) => {
                  const selected = selectedThemes.includes(option.value);

                  return (
                    <label key={option.value} className={q.themeChip}>
                      <input
                        type="checkbox"
                        name={current.id}
                        value={option.value}
                        checked={selected}
                        onChange={() => toggleTheme(option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>

              <button
                className={q.cta}
                type="button"
                disabled={selectedThemes.length === 0}
                onClick={startLoading}
              >
                <span>See my strategies</span>
                <ArrowRight aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </main>

      {exitOpen && (
        <div
          className={q.modalRoot}
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-modal-title"
        >
          <div className={q.modalBackdrop} onClick={() => setExitOpen(false)} />
          <div className={q.modalCard}>
            <button
              className={q.modalDismiss}
              type="button"
              aria-label="Close dialog"
              onClick={() => setExitOpen(false)}
            >
              <X aria-hidden="true" />
            </button>
            <div className={q.modalBody}>
              <h2 id="exit-modal-title" className={q.modalTitle}>Exit quiz?</h2>
              <p className={q.modalDesc}>
                Your answers won&apos;t be saved. You can retake the quiz anytime from the strategy picker.
              </p>
            </div>
            <div className={q.modalActions}>
              <button className={q.modalPrimary} type="button" onClick={() => router.push('/home')}>
                Exit quiz
              </button>
              <button className={q.modalSecondary} type="button" onClick={() => setExitOpen(false)}>
                Keep going
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={[q.loadingScreen, loading ? q.loadingVisible : ''].filter(Boolean).join(' ')} aria-hidden={!loading}>
        <div className={q.loadingInner}>
          <div className={q.loadingBrand}>
            <Brand size={28} />
            <span>Surmount</span>
          </div>
          <div className={q.loadingText}>
            <p className={q.loadingTitle}>Finding strategies for you</p>
            <p className={q.loadingSub}>{loadingSub}</p>
          </div>
          <div className={q.loadingTrack} aria-hidden="true">
            <div className={q.loadingFill} style={{ width: `${loadingProgress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
