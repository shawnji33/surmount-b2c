'use client';

import { useState } from 'react';
import { CaretDown, ChartLineUp, Lightning, LockSimple } from '@phosphor-icons/react';
import { ASSET_UNIVERSE } from '@/app/home/builder/_data';
import type { AllocationRow, RuleState } from '@/app/home/builder/_shared/types';
import s from './DeployStep.module.css';

const AVATAR_CAP = 4;

function ruleSummary(rules: RuleState): { label: string; enabled: boolean }[] {
  return [
    { label: `Auto rebalance every ${rules.rebalance.every} ${rules.rebalance.unit.toLowerCase()}`, enabled: rules.rebalance.enabled },
    { label: `Stop loss at ${rules.stopLoss.percent}%`, enabled: rules.stopLoss.enabled },
    { label: `Take profit at ${rules.takeProfit.percent}%`, enabled: rules.takeProfit.enabled },
  ];
}

function NextItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className={s.nextItem}>
      <span className={s.nextIcon} aria-hidden="true">{icon}</span>
      <div className={s.nextText}>
        <div className={s.nextTitle}>{title}</div>
        <div className={s.nextDesc}>{desc}</div>
      </div>
    </div>
  );
}

// Verbatim approved copy — do not paraphrase. Collapsed by default (per the request that this
// page not feel disclaimer-heavy); the full text is still reachable, just not forced on every
// viewer by default.
function ExecutionDisclosure() {
  const [open, setOpen] = useState(false);
  return (
    <div className={s.disclosure}>
      <button
        type="button"
        className={s.disclosureTrigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Order execution details
        <CaretDown weight="bold" className={s.disclosureCaret} data-open={open} />
      </button>
      <div className={[s.disclosureBody, open ? '' : s.disclosureBodyClosed].join(' ')}>
        <div className={s.disclosureInner} inert={!open}>
          <p>Submitting this order authorizes Surmount to buy, sell, and rebalance positions for this strategy in your linked brokerage account.</p>
          <p>Surmount submits orders to your brokerage; your brokerage executes them. Orders are placed at the next available market price, which may differ from prices shown here. Orders placed outside market hours are submitted when trading next opens.</p>
          <p>Execution practices differ by brokerage — including whether fractional shares are supported, order minimums, and how quickly funds settle. As a result, a portion of your investment amount may remain un-invested in your account. Un-invested cash is included in the balance used to calculate your Surmount advisory fee. Any interest paid on cash is determined by your brokerage, not by Surmount.</p>
          <p>Some brokerages only support whole-share purchases. If your account doesn&apos;t support fractional shares, a position that would otherwise require one may not be bought — the cash allocated to it will remain un-invested in your account instead.</p>
          <p>Because of these differences, your holdings and returns will differ from the strategy&apos;s target allocations and its published performance.</p>
        </div>
      </div>
    </div>
  );
}

export function DeployStep({
  name,
  description,
  rows,
  totalWeight,
  rules,
  onDeploy,
}: {
  name: string;
  description: string;
  rows: AllocationRow[];
  totalWeight: number;
  rules: RuleState;
  onDeploy: () => void;
}) {
  const balanced = Math.round(totalWeight) === 100;
  const activeRules = ruleSummary(rules).filter((r) => r.enabled);
  const shownRows = rows.slice(0, AVATAR_CAP);
  const overflow = rows.length - shownRows.length;

  return (
    <div className={s.screen}>
      <div className={s.card}>
        <div className={s.name}>{name || 'Strategy name'}</div>
        <div className={s.desc}>{description || 'A brief description of this strategy'}</div>
        <div className={s.statRow}>
          <div className={s.stat}>
            <span className={s.statLabel}>Positions</span>
            <div className={s.avatarStack}>
              {shownRows.map((row) => {
                const asset = ASSET_UNIVERSE.find((a) => a.ticker === row.ticker);
                return (
                  <span className={s.avatar} key={row.ticker}>
                    {asset?.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={asset.logo} alt="" />
                    ) : (
                      <span className={s.avatarFallback} style={{ background: asset?.fallbackColor }}>
                        {row.ticker.slice(0, 2)}
                      </span>
                    )}
                  </span>
                );
              })}
              {overflow > 0 && <span className={[s.avatar, s.avatarMore].join(' ')}>+{overflow}</span>}
              {rows.length === 0 && <span className={s.statVal}>0</span>}
            </div>
          </div>
          <div className={s.stat}>
            <span className={s.statLabel}>Allocated</span>
            <span className={[s.statVal, balanced ? s.balanced : s.unbalanced].join(' ')}>{Math.round(totalWeight)}%</span>
          </div>
          <div className={s.stat}>
            <span className={s.statLabel}>Active rules</span>
            <span className={s.statVal}>{activeRules.length}</span>
          </div>
        </div>
      </div>

      <div className={s.nextSection}>
        <h2 className={s.nextHeading}>Here&apos;s what happens next</h2>
        <div className={s.nextCard}>
          <NextItem
            icon={<ChartLineUp weight="bold" />}
            title="We'll invest your money"
            desc="This usually takes 1 business day."
          />
          <NextItem
            icon={<LockSimple weight="bold" />}
            title="Your allocation locks in"
            desc="You can keep investing or withdraw anytime, but you won't be able to change this strategy's holdings once it's deployed."
          />
        </div>
      </div>

      <div className={s.legal}>
        <ExecutionDisclosure />
        <p className={s.selfDirected}>
          Self-directed strategy: you chose this strategy&apos;s holdings, allocation, and rules. Surmount doesn&apos;t review, recommend, or manage self-directed strategies, and isn&apos;t responsible for their performance — the outcomes are yours.
        </p>
      </div>

      <button type="button" className={s.deployBtn} onClick={onDeploy} disabled={rows.length === 0}>
        Deploy
        <Lightning weight="regular" />
      </button>
    </div>
  );
}
