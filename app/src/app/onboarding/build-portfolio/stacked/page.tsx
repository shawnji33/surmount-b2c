'use client';

import { usePortfolioBuilder } from '../_components/usePortfolioBuilder';
import StrategyBrowser from '../_components/StrategyBrowser';
import AllocationPanel from '../_components/AllocationPanel';
import OverviewPanel from '../_components/OverviewPanel';
import StrategyDetailDrawer from '../_components/StrategyDetailDrawer';
import { TopBar, ContinueBar } from '../_components/BuildChrome';
import p from '../_components/panels.module.css';
import c from '../_components/chrome.module.css';
import s from './stacked.module.css';

export default function StackedLayout() {
  const builder = usePortfolioBuilder();

  return (
    <div className={s.shell}>
      <TopBar />
      <div className={s.scroll}>
        <div className={s.container}>
          <header className={s.header}>
            <h1 className={s.title}>Build your portfolio</h1>
            <p className={s.subtitle}>Choose the strategies you want to invest in, set how much goes to each, and preview your blended exposure.</p>
          </header>

          <section className={s.section}>
            <div className={s.sectionHead}>
              <h2 className={c.sectionTitle}>Choose strategies</h2>
              <p className={c.sectionSub}>Browse the available strategies and add any you&apos;d like to invest in.</p>
            </div>
            <div className={s.browserArea}>
              <StrategyBrowser builder={builder} />
            </div>
          </section>

          <section className={s.section}>
            <div className={s.sectionHead}>
              <h2 className={c.sectionTitle}>Strategy allocation</h2>
              <p className={c.sectionSub}>Enter your investment amount for today — you can adjust this later.</p>
            </div>
            <div className={`${p.card} ${s.padCard}`}>
              <AllocationPanel builder={builder} />
            </div>
          </section>

          <section className={s.section}>
            <div className={s.sectionHead}>
              <h2 className={c.sectionTitle}>Strategy overview</h2>
              <p className={c.sectionSub}>Your blended exposure across the strategies you picked.</p>
            </div>
            <div className={`${p.card} ${s.padCard}`}>
              <OverviewPanel builder={builder} />
            </div>
          </section>
        </div>
      </div>
      <ContinueBar builder={builder} />
      <StrategyDetailDrawer builder={builder} />
    </div>
  );
}
