import type { Metadata } from 'next';
import s from './flows.module.css';

export const metadata: Metadata = {
  title: 'Plan management — flows',
  description: 'Design handoff: cancel-plan and reactivate-plan flows for the Surmount Settings → Billing experience.',
};

type Step = { title: string; desc: string; src: string; w: number; h: number };
type Flow = { id: string; index: number; title: string; description: string; steps: Step[] };

const HOME = { w: 1440, h: 900 };
const PLANS = { w: 1320, h: 880 };

const FLOWS: Flow[] = [
  {
    id: 'cancel',
    index: 1,
    title: 'Cancel plan',
    description:
      'A member on Surmount Plus cancels their paid plan from Settings → Billing. The cancellation is scheduled for the end of the current term.',
    steps: [
      {
        title: 'Dashboard',
        desc: 'The member starts on their investing dashboard.',
        src: '/home',
        ...HOME,
      },
      {
        title: 'Open the account menu',
        desc: 'They click the avatar (bottom-left) to open the account menu.',
        src: '/home?menu=open',
        ...HOME,
      },
      {
        title: 'Settings · Billing',
        desc: 'Choosing Settings opens the modal on the Billing tab — current plan and the renewal banner.',
        src: '/home?settings=billing',
        ...HOME,
      },
      {
        title: 'Confirm cancellation',
        desc: '“Cancel plan” opens a confirmation — “Keep your Plus plan” or the destructive “Cancel plan”.',
        src: '/home?settings=billing&step=cancel-confirm',
        ...HOME,
      },
      {
        title: 'Scheduled + toast',
        desc: 'The banner switches to the scheduled downgrade and a “Downgrade to Surmount Free scheduled” toast slides in.',
        src: '/home?settings=billing&step=toast',
        ...HOME,
      },
    ],
  },
  {
    id: 'renew',
    index: 2,
    title: 'Reactivate plan',
    description:
      'After a downgrade is scheduled, the member can reactivate to keep their current plan. This reverts the scheduled downgrade.',
    steps: [
      {
        title: 'Downgrade scheduled',
        desc: 'The Billing banner shows the scheduled downgrade with a primary “Reactivate current Plus plan” button.',
        src: '/home?settings=billing&step=scheduled',
        ...HOME,
      },
      {
        title: 'Confirm reactivation',
        desc: '“Reactivate current Plus plan” opens a confirmation — “Reactivate subscription” or “Go back”.',
        src: '/home?settings=billing&step=renew-confirm',
        ...HOME,
      },
      {
        title: 'Reactivated',
        desc: 'On reactivate, the scheduled downgrade is cleared, a “Subscription reactivated” toast appears, and the banner returns to the renews state.',
        src: '/home?settings=billing&step=renewed',
        ...HOME,
      },
    ],
  },
  {
    id: 'plans-downgrade',
    index: 4,
    title: 'Plans — cancel plan (downgrade to Free)',
    description:
      'From Upgrade plan (account menu) or Adjust plan (Settings → Billing), the member opens the Plans page and downgrades all the way to Free — cancelling their paid plan. The cancellation is scheduled for the end of the term.',
    steps: [
      {
        title: 'Open the account menu',
        desc: 'Open the account menu and choose “Upgrade plan” — or Settings → Billing → “Adjust plan” — to reach the Plans page.',
        src: '/home?menu=open',
        ...HOME,
      },
      {
        title: 'Plans page',
        desc: 'The Plans page shows all tiers with the current plan (Surmount Plus) highlighted.',
        src: '/plans',
        ...PLANS,
      },
      {
        title: 'Confirm downgrade',
        desc: '“Downgrade to Free” opens a confirmation — “Keep your Plus plan” or the destructive “Cancel plan”.',
        src: '/plans?step=downgrade-confirm',
        ...PLANS,
      },
      {
        title: 'Scheduled + toast',
        desc: 'The banner shows the scheduled downgrade, the Free card locks to “Downgrade scheduled”, and a toast confirms.',
        src: '/plans?step=scheduled-toast',
        ...PLANS,
      },
    ],
  },
  {
    id: 'plans-downgrade-core',
    index: 5,
    title: 'Plans — downgrade to Core',
    description:
      'On the Plans page, a Surmount Plus member steps down to Core instead of cancelling outright. They keep a paid plan — the change is scheduled for the end of the term, and the Core card locks to the scheduled state.',
    steps: [
      {
        title: 'Plans page',
        desc: 'The Plans page shows all tiers with the current plan (Surmount Plus) highlighted; Core sits one tier below.',
        src: '/plans',
        ...PLANS,
      },
      {
        title: 'Confirm downgrade',
        desc: '“Downgrade to Core” opens a confirmation — “Keep your Plus plan” or the non-destructive “Downgrade plan” (not “Cancel plan”, since a paid tier is retained).',
        src: '/plans?step=downgrade-confirm&target=core',
        ...PLANS,
      },
      {
        title: 'Scheduled + toast',
        desc: 'The banner shows the scheduled downgrade to Core, the Core card locks to “Downgrade scheduled”, and a “Downgrade to Surmount Core scheduled” toast confirms.',
        src: '/plans?step=scheduled-toast&target=core',
        ...PLANS,
      },
    ],
  },
  {
    id: 'plans-renew',
    index: 6,
    title: 'Plans — reactivate',
    description:
      'With a downgrade scheduled, the member reactivates from the Plans page banner to keep Surmount Plus. This reverts the scheduled downgrade.',
    steps: [
      {
        title: 'Downgrade scheduled',
        desc: 'The banner shows the scheduled downgrade with a primary “Reactivate current Plus plan” button; the Free card is locked.',
        src: '/plans?step=scheduled',
        ...PLANS,
      },
      {
        title: 'Confirm reactivation',
        desc: '“Reactivate current Plus plan” opens a confirmation — “Reactivate subscription” or “Go back”.',
        src: '/plans?step=renew-confirm',
        ...PLANS,
      },
      {
        title: 'Reactivated',
        desc: 'On reactivate, the schedule is cleared, a “Subscription reactivated” toast appears, and the banner returns to the auto-renews state.',
        src: '/plans?step=renewed',
        ...PLANS,
      },
    ],
  },
  {
    id: 'plans-cycle',
    index: 3,
    title: 'Plans — billing cycle',
    description:
      'On the Plans page (Adjust plan), the member toggles between Monthly and Yearly pricing. Prices roll between the two with a slot-machine animation.',
    steps: [
      {
        title: 'Monthly',
        desc: 'Monthly pricing — $5 / $10 / $30 per month across Core, Plus, and Pro.',
        src: '/plans?cycle=monthly',
        ...PLANS,
      },
      {
        title: 'Yearly',
        desc: 'Yearly pricing — $50 / $100 / $300 per year, with the “Save 2 months” badge.',
        src: '/plans?cycle=yearly',
        ...PLANS,
      },
    ],
  },
];

const FRAME_W = 460;

function ScreenFrame({ step }: { step: Step }) {
  const scale = FRAME_W / step.w;
  const frameH = Math.round(step.h * scale);
  return (
    <a className={s.screen} href={step.src} target="_blank" rel="noreferrer" style={{ width: FRAME_W, height: frameH }}>
      <iframe
        className={s.iframe}
        src={step.src}
        width={step.w}
        height={step.h}
        style={{ transform: `scale(${scale})` }}
        loading="lazy"
        title={step.title}
        tabIndex={-1}
      />
      <span className={s.screenOpen}>Open ↗</span>
    </a>
  );
}

export default function FlowsPage() {
  return (
    <div className={s.page}>
      <div className={s.inner}>
        <header className={s.header}>
          <span className={s.eyebrow}>Design handoff</span>
          <h1 className={s.title}>Plan management — flows</h1>
          <p className={s.subtitle}>
            Cancel-plan and reactivate-plan flows for the Surmount Settings → Billing experience. Each frame is a live screen —
            click any one to open it full-size.
          </p>
        </header>

        {[...FLOWS].sort((a, b) => a.index - b.index).map((flow) => (
          <section className={s.flow} key={flow.id}>
            <div className={s.flowHead}>
              <span className={s.flowIndex}>Flow {flow.index}</span>
              <h2 className={s.flowTitle}>{flow.title}</h2>
              <p className={s.flowDesc}>{flow.description}</p>
            </div>

            <div className={s.track}>
              {flow.steps.map((step, i) => (
                <div className={s.stepWrap} key={step.title}>
                  <div className={s.step}>
                    <div className={s.stepHead}>
                      <span className={s.stepNum}>{i + 1}</span>
                      <span className={s.stepTitle}>{step.title}</span>
                    </div>
                    <ScreenFrame step={step} />
                    <p className={s.stepDesc}>{step.desc}</p>
                  </div>
                  {i < flow.steps.length - 1 && (
                    <span className={s.arrow} aria-hidden="true">
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <footer className={s.footer}>
          Built from the live app — frames render the real screens at <code>/home</code> and{' '}
          <code>/dev/settings-modal</code>.
        </footer>
      </div>
    </div>
  );
}
