'use client';

import { usePortfolioBuilder } from '../_components/usePortfolioBuilder';
import StrategyBrowser from '../_components/StrategyBrowser';
import AllocationPanel from '../_components/AllocationPanel';
import OverviewPanel from '../_components/OverviewPanel';
import StrategyDetailDrawer from '../_components/StrategyDetailDrawer';
import { TopBar, ContinueBar } from '../_components/BuildChrome';
import p from '../_components/panels.module.css';
import c from '../_components/chrome.module.css';
import s from './split.module.css';

export default function SplitLayout() {
  const builder = usePortfolioBuilder();

  return (
    <div className={s.shell}>
      <TopBar />
      <main className={s.main}>
        {/* Left — strategy browser */}
        <section className={s.left}>
          <div className={s.leftHead}>
            <h1 className={s.title}>Build your portfolio</h1>
            <p className={s.subtitle}>Pick strategies on the left and watch your portfolio take shape on the right.</p>
          </div>
          <div className={s.browserArea}>
            <StrategyBrowser builder={builder} />
          </div>
        </section>

        {/* Right — live portfolio */}
        <aside className={s.right}>
          <div className={s.rightInner}>
            <div className={s.block}>
              <h2 className={c.sectionTitle}>Strategy allocation</h2>
              <div className={`${p.card} ${s.padCard}`}>
                <AllocationPanel builder={builder} />
              </div>
            </div>
            <div className={s.block}>
              <h2 className={c.sectionTitle}>Strategy overview</h2>
              <div className={`${p.card} ${s.padCard}`}>
                <OverviewPanel builder={builder} />
              </div>
            </div>
          </div>
        </aside>
      </main>
      <ContinueBar builder={builder} />
      <StrategyDetailDrawer builder={builder} />
    </div>
  );
}
