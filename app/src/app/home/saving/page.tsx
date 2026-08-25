'use client';

import { ClockCountdown, ArrowsCounterClockwise, GearSix } from '@phosphor-icons/react';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { TransactionList } from '@/components/transactions/TransactionList';
import { useState } from 'react';
import { type SavingFilter } from './_data';
import { filterGroups } from './_helpers';
import { MoneyMovementModal } from './_components/MoneyMovementModal';
import s from './page.module.css';

export default function SavingPage() {
  const [interestTooltipOpen, setInterestTooltipOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SavingFilter>(null);
  const [transferOpen, setTransferOpen] = useState(false);

  function openTransfer() {
    setTransferOpen(true);
  }

  return (
    <main className={s.main}>
      <DashboardHeader
        title="Good morning, Logan"
        onDeposit={openTransfer}
        onWithdraw={openTransfer}
      />

      <div className={s.savingContent}>
        <div className={s.pageLayout}>

          {/* ── Left column ── */}
          <div className={s.leftCol}>
            <div className={s.balanceHeader}>
              <p className={s.balanceValue}>$351,242.54</p>
              <button
                type="button"
                className={s.sweepIndicator}
                onClick={() => { /* TODO: open sweep settings panel */ }}
                aria-label="Open idle cash sweep settings"
              >
                <span className={s.sweepDot} aria-hidden="true" />
                <span className={s.sweepLabel}>Idle cash sweep on</span>
              </button>
            </div>

            <div className={s.pendingRow}>
              <button
                type="button"
                className={[s.pendingCard, activeFilter === 'pending' ? s.pendingCardActive : ''].filter(Boolean).join(' ')}
                onClick={() => setActiveFilter(f => f === 'pending' ? null : 'pending')}
              >
                <span className={[s.pendingIconCircle, s.pendingIconWarning].join(' ')}>
                  <ClockCountdown size={16} weight="regular" color="#c05221" />
                </span>
                <span className={s.pendingCardInfo}>
                  <span className={s.pendingCardTitle}>Pending transfers</span>
                  <span className={s.pendingCardMeta}>3 transactions</span>
                </span>
              </button>
              <button
                type="button"
                className={[s.pendingCard, activeFilter === 'recurring' ? s.pendingCardActive : ''].filter(Boolean).join(' ')}
                onClick={() => setActiveFilter(f => f === 'recurring' ? null : 'recurring')}
              >
                <span className={[s.pendingIconCircle, s.pendingIconBrand].join(' ')}>
                  <ArrowsCounterClockwise size={16} weight="regular" color="#3757be" />
                </span>
                <span className={s.pendingCardInfo}>
                  <span className={s.pendingCardTitle}>Recurring deposits</span>
                  <span className={s.pendingCardMeta}>2 transactions</span>
                </span>
              </button>
            </div>

            <TransactionList groups={filterGroups(activeFilter)} />
          </div>

          {/* ── Right column ── */}
          <aside className={s.rightCol}>

            <div className={s.actionsRow}>
              <button type="button" className={[s.actionTile, s.actionTileSingle].join(' ')} onClick={openTransfer}>
                <img src="/assets/figma/hyca-transfer-money.svg" alt="" className={s.actionTileIcon} aria-hidden="true" />
                <span className={s.actionTileLabel}>Transfer money</span>
              </button>
            </div>

            <div className={s.interestCard}>
              <div className={s.interestHeader}>
                <span className={s.interestLabel}>Earned interest (This month)</span>
                <span className={s.interestBadge}>4.56% interest</span>
              </div>
              <div className={s.interestAmountRow}>
                <p className={s.interestAmount}>$1,334.72</p>
                <span
                  className={s.interestInfo}
                  onMouseEnter={() => setInterestTooltipOpen(true)}
                  onMouseLeave={() => setInterestTooltipOpen(false)}
                  onFocus={() => setInterestTooltipOpen(true)}
                  onBlur={() => setInterestTooltipOpen(false)}
                >
                  <button type="button" className={s.interestInfoButton} aria-describedby="hyca-interest-tooltip">
                    <img src="/assets/figma/hyca-interest-info.svg" alt="" className={s.interestInfoIcon} aria-hidden="true" />
                    <span className={s.srOnly}>Interest information</span>
                  </button>
                  <span
                    id="hyca-interest-tooltip"
                    role="tooltip"
                    className={[s.interestTooltip, interestTooltipOpen ? s.interestTooltipOpen : ''].filter(Boolean).join(' ')}
                  >
                    Interest amounts vary based on your daily balance. Earnings will be paid out within the first seven business days of the next month.
                  </span>
                </span>
              </div>
              <div className={s.interestProjectionCard}>
                <div className={s.interestProjectionRow}>
                  <span>Next month</span>
                  <strong>+$1,339.79</strong>
                </div>
                <div className={s.interestProjectionRow}>
                  <span>Next 12 months</span>
                  <strong>+$16,338.59</strong>
                </div>
                <div className={s.interestProjectionRow}>
                  <span>In 5 years</span>
                  <strong>+$89,431.27</strong>
                </div>
              </div>
            </div>

            <div className={s.utilityLinkGroup}>
              <Link href="/home/saving/settings" className={s.viewStatements}>
                Setting
                <GearSix weight="regular" aria-hidden="true" />
              </Link>

              <button type="button" className={s.viewStatements}>
                View statements
                <img src="/assets/figma/hyca-arrow-right.svg" alt="" aria-hidden="true" />
              </button>
            </div>

          </aside>
        </div>
      </div>

      {transferOpen ? <MoneyMovementModal onClose={() => setTransferOpen(false)} /> : null}
    </main>
  );
}
