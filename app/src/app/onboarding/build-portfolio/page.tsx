import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import s from './index.module.css';

const VARIANTS = [
  {
    href: '/onboarding/build-portfolio/stacked',
    name: 'Stacked / guided',
    desc: 'Single centered column — Choose strategies → Allocation → Overview, stacked top to bottom. Feels like a guided onboarding step.',
  },
  {
    href: '/onboarding/build-portfolio/split',
    name: 'Split workspace',
    desc: 'Two columns — browse and select on the left while your allocation and overview update live on the right.',
  },
    {
    href: '/onboarding/build-portfolio/tabs',
    name: 'Guided steps',
    desc: 'A guided 3-step flow — Browse → Allocate → Overview. Continue advances each step with a progress stepper and slide transitions.',
  },
];

export default function BuildPortfolioIndex() {
  return (
    <div className={s.shell}>
      <div className={s.container}>
        <header className={s.header}>
          <h1 className={s.title}>Build your portfolio — layout options</h1>
          <p className={s.subtitle}>Three structures for the same content (choose strategies · allocation · overview). Open each to compare with the team.</p>
        </header>
        <div className={s.grid}>
          {VARIANTS.map((v, i) => (
            <Link key={v.href} href={v.href} className={s.cardLink}>
              <span className={s.cardNum}>{i + 1}</span>
              <span className={s.cardBody}>
                <span className={s.cardName}>{v.name}</span>
                <span className={s.cardDesc}>{v.desc}</span>
              </span>
              <ArrowRight className={s.cardArrow} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
