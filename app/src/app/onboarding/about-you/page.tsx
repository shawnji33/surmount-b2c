'use client';

import { ArrowLeft, ArrowRight, X } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import s from './page.module.css';

type TransitionClass = '' | 'leaveForward' | 'leaveBackward' | 'enterForward' | 'enterBackward';

type PillQuestion = {
  id: string;
  step: string;
  type: 'single' | 'multi';
  question: string;
  sub?: string;
  required?: boolean;
  hasOther?: boolean;
  options: { value: string; label: string }[];
};

type CardQuestion = {
  id: string;
  step: string;
  type: 'cards';
  question: string;
  sub?: string;
  required?: boolean;
  options: { value: string; label: string; sub: string; emoji: string }[];
};

type Question = PillQuestion | CardQuestion;

const QUESTIONS: Question[] = [
  {
    id: 'motivation',
    step: 'Motivation',
    type: 'single',
    required: true,
    question: 'What brings you to Surmount?',
    sub: 'This helps us tailor the experience to what you came here to do.',
    options: [
      { value: 'ai-custom', label: 'To have AI create a custom portfolio for me' },
      { value: 'prebuilt', label: 'To invest in prebuilt portfolios' },
      { value: 'professionals', label: 'To invest along professional investors' },
      { value: 'own-strategies', label: 'To create my own investment strategies' },
    ],
  },
  {
    id: 'involvement',
    step: 'Involvement',
    type: 'single',
    required: true,
    question: 'How involved do you want to be?',
    sub: 'There is no wrong answer — we will match the experience to your style.',
    options: [
      { value: 'hands-off', label: 'Completely hands off' },
      { value: 'green-light', label: "I'd like to see what's happening and give the green light" },
      { value: 'test-ideas', label: 'I want to test ideas and play with different strategies' },
      { value: 'full-control', label: "I know what I'm doing and want full control" },
    ],
  },
  {
    id: 'style',
    step: 'Style',
    type: 'cards',
    required: true,
    question: 'Which of these best describes your style?',
    options: [
      { value: 'data-driven', label: 'Data-driven', sub: 'I care about signals, stats, and systematic edges', emoji: '📈' },
      { value: 'big-ideas', label: 'Big ideas', sub: 'Invest in trends, themes, and emerging markets', emoji: '🚀' },
      { value: 'follow-experts', label: 'Follow the experts', sub: 'Trust hedge fund moves, insider trades, and smart money', emoji: '🧑🏽‍💼' },
      { value: 'build-own', label: 'Build my own', sub: 'I want full control', emoji: '🛠️' },
    ],
  },
  {
    id: 'interests',
    step: 'Interests',
    type: 'multi',
    hasOther: true,
    question: 'What are you most interested in?',
    sub: 'Pick as many as you like.',
    options: [
      { value: 'trading', label: 'Trading strategies' },
      { value: 'long-term', label: 'Long-term portfolios' },
      { value: 'values', label: 'Values investing portfolios' },
      { value: 'copying', label: 'Copying professionals' },
      { value: 'other', label: 'Other (specify)' },
    ],
  },
  {
    id: 'themes',
    step: 'Themes',
    type: 'multi',
    hasOther: true,
    question: 'Are there any themes or creators you follow?',
    sub: 'Pick as many as you like.',
    options: [
      { value: 'copying-politicians', label: 'Copying politicians' },
      { value: 'overseas', label: 'Investing overseas' },
      { value: 'value', label: 'Value investing' },
      { value: 'quantum', label: 'Quantum computing' },
      { value: 'tomorrow-tech', label: "Tomorrow's technology" },
      { value: 'real-estate', label: 'Real estate' },
      { value: 'other', label: 'Other (specify)' },
    ],
  },
];

type Answers = Record<string, string | string[]>;

export default function AboutYouPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [otherText, setOtherText] = useState<Record<string, string>>({});
  const [transitionClass, setTransitionClass] = useState<TransitionClass>('');
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(transitionTimer.current), []);

  const current = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  // Directional slide + fade between question screens.
  const changeStep = (nextStep: number, direction: 1 | -1) => {
    clearTimeout(transitionTimer.current);
    setTransitionClass(direction > 0 ? 'leaveForward' : 'leaveBackward');
    transitionTimer.current = setTimeout(() => {
      setStep(nextStep);
      setTransitionClass(direction > 0 ? 'enterForward' : 'enterBackward');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setTransitionClass(''));
      });
    }, 200);
  };

  const selectSingle = (id: string, value: string) =>
    setAnswers(prev => ({ ...prev, [id]: prev[id] === value ? '' : value }));

  const toggleMulti = (id: string, value: string) =>
    setAnswers(prev => {
      const cur = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value];
      return { ...prev, [id]: next };
    });

  const isSelected = (id: string, value: string) => {
    const a = answers[id];
    return Array.isArray(a) ? a.includes(value) : a === value;
  };

  const currentAnswered = (() => {
    const a = answers[current.id];
    return Array.isArray(a) ? a.length > 0 : Boolean(a);
  })();
  // Required (single / cards) steps gate Next; optional multi steps can be skipped.
  const canAdvance = current.required ? currentAnswered : true;

  const goBack = () => {
    if (step === 0) router.push('/onboarding/welcome');
    else changeStep(step - 1, -1);
  };

  const goNext = () => {
    if (isLast) {
      // Play the forward exit, then hand off to the start-investing screen,
      // which mounts with a matching forward enter for a continuous transition.
      clearTimeout(transitionTimer.current);
      setTransitionClass('leaveForward');
      transitionTimer.current = setTimeout(() => router.push('/onboarding/start-investing'), 240);
      return;
    }
    changeStep(step + 1, 1);
  };

  return (
    <div className={s.shell}>
      <header className={s.topbar}>
        <button type="button" className={s.topbarBtn} onClick={goBack}>
          <ArrowLeft aria-hidden="true" />
          <span>Back</span>
        </button>
        <div className={s.topbarBrand}>
          <img src="/assets/sidebar/logo-mark.svg" alt="" className={s.topbarBrandIcon} />
          <img src="/assets/sidebar/wordmark.svg" alt="Surmount" className={s.topbarBrandName} />
        </div>
        <button type="button" className={s.topbarBtn} onClick={() => router.push('/home')}>
          <span>Close</span>
          <X aria-hidden="true" />
        </button>
      </header>

      {/* Stepper — single continuous bar, fills as you advance */}
      <div className={s.progress} aria-label={`Step ${step + 1} of ${QUESTIONS.length}`}>
        <div className={s.progressFill} style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
      </div>

      <main className={s.main}>
        <div className={[s.questionView, transitionClass ? s[transitionClass] : ''].filter(Boolean).join(' ')}>
          <div className={s.hero}>
            <h1 className={s.title}>{current.question}</h1>
            {current.sub && <p className={s.subtitle}>{current.sub}</p>}
          </div>

          {current.type === 'cards' ? (
            <div className={s.cardGrid} role="radiogroup" aria-label={current.question}>
              {current.options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected(current.id, opt.value)}
                  className={`${s.styleCard} ${isSelected(current.id, opt.value) ? s.styleCardSelected : ''}`}
                  onClick={() => selectSingle(current.id, opt.value)}
                >
                  <span className={s.styleCardText}>
                    <span className={s.styleCardTitle}>{opt.label}</span>
                    <span className={s.styleCardSub}>{opt.sub}</span>
                  </span>
                  <span className={s.styleCardEmoji} aria-hidden="true">{opt.emoji}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className={s.pillBlock}>
              <div
                className={s.pillGroup}
                role={current.type === 'single' ? 'radiogroup' : 'group'}
                aria-label={current.question}
              >
                {current.options.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    role={current.type === 'single' ? 'radio' : 'checkbox'}
                    aria-checked={isSelected(current.id, opt.value)}
                    className={`${s.pill} ${isSelected(current.id, opt.value) ? s.pillSelected : ''}`}
                    onClick={() => current.type === 'single' ? selectSingle(current.id, opt.value) : toggleMulti(current.id, opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {current.hasOther && isSelected(current.id, 'other') && (
                <input
                  type="text"
                  className={s.otherInput}
                  placeholder="Tell us more..."
                  value={otherText[current.id] ?? ''}
                  onChange={e => setOtherText(prev => ({ ...prev, [current.id]: e.target.value }))}
                />
              )}
            </div>
          )}

          <button className={s.cta} type="button" disabled={!canAdvance} onClick={goNext}>
            <span>{isLast ? 'Continue' : 'Next'}</span>
            <ArrowRight aria-hidden="true" weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
