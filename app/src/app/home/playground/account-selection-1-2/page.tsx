'use client';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  WealthsimpleNetWorthChart,
  type WealthsimpleChartPoint,
} from '@/components/charts/WealthsimpleNetWorthChart';
import {
  CaretDown,
  Check,
  Plus,
  SquaresFour,
  X,
} from '@phosphor-icons/react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import s from './page.module.css';

type InvestingAccount = {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  value: number;
  change: number;
  color: string;
  data: WealthsimpleChartPoint[];
};

type StrategyAccountValue = {
  value: number;
  returnAbs: number;
};

type Strategy = {
  id: string;
  name: string;
  cover: string;
  accounts: Record<string, StrategyAccountValue>;
};

const DATES = [
  '2026-04-21', '2026-04-24', '2026-04-25', '2026-04-28', '2026-04-29',
  '2026-04-30', '2026-05-01', '2026-05-02', '2026-05-05', '2026-05-06',
  '2026-05-07', '2026-05-08', '2026-05-09', '2026-05-12', '2026-05-13',
  '2026-05-14', '2026-05-15', '2026-05-16', '2026-05-19', '2026-05-20',
  '2026-05-21',
];

function makeSeries(start: number, end: number, wobble: number, phase: number): WealthsimpleChartPoint[] {
  return DATES.map((time, index) => {
    const progress = index / (DATES.length - 1);
    const curve = Math.sin(index * 0.92 + phase) * wobble;
    return { time, value: Number((start + (end - start) * progress + curve).toFixed(2)) };
  });
}

const INVESTING_ACCOUNTS: InvestingAccount[] = [
  {
    id: 'surmount', name: 'Surmount Investing', shortName: 'Surmount',
    logo: '/assets/brokers/surmount.png', value: 85420.54, change: 1204.88, color: '#2367f6',
    data: makeSeries(79240, 85420.54, 420, 0.3),
  },
  {
    id: 'ibkr', name: 'Interactive Brokers', shortName: 'IBKR',
    logo: '/assets/brokers/ibkr.png', value: 142350.3, change: 2921.4, color: '#d02222',
    data: makeSeries(134880, 142350.3, 760, 1.1),
  },
  {
    id: 'schwab', name: 'Schwab', shortName: 'Schwab',
    logo: '/assets/brokers/schwab.png', value: 31200.5, change: 512.66, color: '#1474bb',
    data: makeSeries(29210, 31200.5, 210, 0.8),
  },
];

const STRATEGIES: Strategy[] = [
  {
    id: 'quantum-computing-leaders',
    name: 'Quantum Computing Leaders',
    cover: '/assets/strategy-covers/Quantum Computing Leaders.png',
    accounts: {
      surmount: { value: 21424.82, returnAbs: 1180.32 },
      ibkr: { value: 70842.4, returnAbs: 4251.08 },
    },
  },
  {
    id: 'artificial-intelligence-innovators',
    name: 'Artificial Intelligence Innovators',
    cover: '/assets/strategy-covers/AI Innovators.png',
    accounts: {
      surmount: { value: 38472.16, returnAbs: 2804.42 },
      ibkr: { value: 51530.72, returnAbs: 3912.2 },
      schwab: { value: 17410.4, returnAbs: 734.18 },
    },
  },
  {
    id: 'biotechnology-ventures',
    name: 'Biotechnology Ventures',
    cover: '/assets/strategy-covers/Biotech Breakthroughs.png',
    accounts: {
      schwab: { value: 9575.28, returnAbs: 318.52 },
    },
  },
  {
    id: 'next-gen-data-infrastructure',
    name: 'Next-Gen Data Infrastructure',
    cover: '/assets/strategy-covers/Next-Gen Data Infrastructure.png',
    accounts: {
      surmount: { value: 25523.56, returnAbs: 1652.14 },
      ibkr: { value: 19977.18, returnAbs: 906.44 },
      schwab: { value: 4214.82, returnAbs: 188.02 },
    },
  },
];

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatSignedCurrency(value: number) {
  return `${value < 0 ? '-' : '+'}${formatCurrency(Math.abs(value))}`;
}
function formatPercent(value: number) {
  return `${value < 0 ? '-' : '+'}${Math.abs(value).toFixed(2)}%`;
}
function sumValues(values: number[]) {
  return values.reduce((t, v) => t + v, 0);
}
function aggregateSeries(accounts: InvestingAccount[]) {
  return DATES.map((time, i) => ({
    time,
    value: Number(sumValues(accounts.map((a) => a.data[i]?.value ?? 0)).toFixed(2)),
  }));
}

function AccountLogo({ account, className }: { account: InvestingAccount; className: string }) {
  return <img src={account.logo} alt={account.name} className={className} />;
}

function PortfolioAccountSwitcher({
  selected,
  onToggle,
}: {
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropPos, setDropPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const closeDropdown = useCallback(() => { setOpen(false); setDropPos(null); }, []);
  const openDropdown = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !dropdownRef.current?.contains(t)) closeDropdown();
    };
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDropdown(); };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeDropdown, open]);

  const selectedAccounts = INVESTING_ACCOUNTS.filter((a) => selected.has(a.id));
  const allSelected = selectedAccounts.length === INVESTING_ACCOUNTS.length;
  const visibleAccounts = selectedAccounts.slice(0, 3);
  const overflowCount = selectedAccounts.length > 3 ? selectedAccounts.length - 3 : 0;
  const label = allSelected
    ? 'All investing accounts'
    : selectedAccounts.length === 1
      ? selectedAccounts[0].name
      : `${selectedAccounts.length} investing accounts`;

  // FLIP width animation
  const prevWidthRef = useRef<number | null>(null);
  useLayoutEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const newWidth = el.getBoundingClientRect().width;
    const oldWidth = prevWidthRef.current;
    prevWidthRef.current = newWidth;

    if (oldWidth === null || Math.abs(oldWidth - newWidth) < 1) return;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.style.width = '';
      el.style.transition = '';
    };

    el.style.width = `${oldWidth}px`;
    el.style.transition = 'none';
    void el.offsetWidth;

    const raf = requestAnimationFrame(() => {
      el.style.transition = 'width 220ms cubic-bezier(0.4, 0, 0.2, 1)';
      el.style.width = `${newWidth}px`;
    });

    const timer = setTimeout(finish, 300);
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName === 'width' && e.target === el) {
        el.removeEventListener('transitionend', onEnd);
        clearTimeout(timer);
        finish();
      }
    };
    el.addEventListener('transitionend', onEnd);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      el.removeEventListener('transitionend', onEnd);
      finish();
    };
  }, [label]);

  const dropdown = (
    <div
      ref={dropdownRef}
      className={s.switcherDropdown}
      style={{ top: dropPos?.top, left: dropPos?.left }}
      role="listbox"
      aria-label="Investing accounts"
      aria-multiselectable="true"
    >
      {INVESTING_ACCOUNTS.map((account) => {
        const isSelected = selected.has(account.id);
        const isLocked = isSelected && selected.size === 1;
        return (
          <button
            key={account.id}
            type="button"
            className={[s.switcherAccountRow, isLocked ? s.switcherAccountRowLocked : ''].filter(Boolean).join(' ')}
            onClick={() => onToggle(account.id)}
            role="option"
            aria-selected={isSelected}
            aria-disabled={isLocked}
          >
            <AccountLogo account={account} className={s.switcherAccountLogo} />
            <span className={s.switcherAccountName}>{account.name}</span>
            <span className={s.switcherAccountValue}>{formatCurrency(account.value)}</span>
            <span className={[s.switcherCheckbox, isSelected ? s.switcherCheckboxSelected : ''].filter(Boolean).join(' ')}>
              {isSelected && <Check weight="bold" aria-hidden="true" />}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={[s.switcherTrigger, open ? s.switcherTriggerOpen : ''].filter(Boolean).join(' ')}
        onClick={() => open ? closeDropdown() : openDropdown()}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={s.switcherAvatarStack} aria-hidden="true">
          {allSelected && <span className={s.switcherAllIcon}><SquaresFour weight="bold" /></span>}
          {!allSelected && visibleAccounts.map((a) => (
            <AccountLogo key={a.id} account={a} className={s.switcherAvatar} />
          ))}
          {!allSelected && overflowCount > 0 && (
            <span className={s.switcherAvatarOverflow}>+{overflowCount}</span>
          )}
        </span>
        <span key={label} className={s.switcherLabel}>{label}</span>
        <CaretDown className={s.switcherChevron} weight="bold" aria-hidden="true" />
      </button>
      {mounted && open && dropPos && createPortal(dropdown, document.body)}
    </>
  );
}

export default function AccountSelection12Page() {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(INVESTING_ACCOUNTS.map((a) => a.id)),
  );

  const selectedAccounts = useMemo(
    () => INVESTING_ACCOUNTS.filter((a) => selected.has(a.id)),
    [selected],
  );

  // Chart responds to account selection
  const chartData = useMemo(() => aggregateSeries(selectedAccounts), [selectedAccounts]);
  const totalValue = useMemo(() => sumValues(selectedAccounts.map((a) => a.value)), [selectedAccounts]);
  const totalChange = useMemo(() => sumValues(selectedAccounts.map((a) => a.change)), [selectedAccounts]);
  const startingValue = totalValue - totalChange;
  const totalChangePct = startingValue !== 0 ? (totalChange / startingValue) * 100 : 0;

  // Strategies are static — always show everything regardless of account selection
  const allStrategies = useMemo(() => (
    STRATEGIES.map((strategy) => {
      const accountIds = Object.keys(strategy.accounts);
      const value = sumValues(accountIds.map((id) => strategy.accounts[id].value));
      const returnAbs = sumValues(accountIds.map((id) => strategy.accounts[id].returnAbs));
      const costBasis = value - returnAbs;
      const returnPct = costBasis !== 0 ? (returnAbs / costBasis) * 100 : 0;
      const accounts = INVESTING_ACCOUNTS.filter((a) => accountIds.includes(a.id));
      return { ...strategy, accounts, value, returnAbs, returnPct };
    })
  ), []);

  const toggleAccount = useCallback((id: string) => {
    setSelected((prev) => {
      if (prev.has(id) && prev.size === 1) return prev;
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  return (
    <main className={s.main}>
      <DashboardHeader title="Account selection — 1.2" />

      <div className={s.contentArea}>
        <section className={s.portfolioSection}>
          <div className={s.sectionHeader}>
            <div className={s.sectionTitleRow}>
              <PortfolioAccountSwitcher selected={selected} onToggle={toggleAccount} />
            </div>
            <div className={s.sectionActions}>
              <button type="button" className={s.actionLink}>Edit</button>
              <button type="button" className={s.btnSecondary}>
                <Plus weight="bold" aria-hidden="true" />
                Connect accounts
              </button>
            </div>
          </div>

          <WealthsimpleNetWorthChart
            value={totalValue}
            changeText={`${formatSignedCurrency(totalChange)} (${formatPercent(totalChangePct)})`}
            changePeriod="this month"
            data={chartData}
            initialRange="1D"
            height={237}
          />
        </section>

        {/* Strategies — static, not affected by account selection */}
        <section className={s.leftSection}>
          <div className={s.sectionHeader}>
            <span className={s.sectionTitle}>Active strategies</span>
            <div className={s.sectionActions}>
              <button type="button" className={s.actionLink}>Edit</button>
              <button type="button" className={s.btnSecondary}>
                <Plus weight="bold" aria-hidden="true" />
                Add strategies
              </button>
            </div>
          </div>

          <div className={s.strategiesTable}>
            <div className={s.tableHeader}>
              <div className={[s.th, s.thStrategy].join(' ')}>Strategy</div>
              <div className={[s.th, s.thValue].join(' ')}>Value</div>
              <div className={[s.th, s.thReturn].join(' ')}>Total return</div>
              <div className={[s.th, s.thAccount].join(' ')}>Accounts</div>
            </div>

            {allStrategies.map((strategy) => (
              <div key={strategy.id} className={s.tableRow}>
                <div className={[s.td, s.tdStrategy].join(' ')}>
                  <div className={s.strategyIcon}>
                    <img src={strategy.cover} alt={strategy.name} />
                  </div>
                  <span className={s.strategyName}>{strategy.name}</span>
                </div>
                <div className={[s.td, s.tdValue].join(' ')}>
                  <span className={s.tdValueText}>{formatCurrency(strategy.value)}</span>
                </div>
                <div className={[s.td, s.tdReturn, strategy.returnAbs < 0 ? s.tdReturnNegative : ''].filter(Boolean).join(' ')}>
                  <span className={s.tdReturnPrimary}>{formatPercent(strategy.returnPct)}</span>
                  <span className={s.tdReturnSecondary}>{formatSignedCurrency(strategy.returnAbs)}</span>
                </div>
                <div className={[s.td, s.tdAccount].join(' ')}>
                  <div className={s.avatarGroup}>
                    {strategy.accounts.slice(0, 3).map((account) => (
                      <AccountLogo key={account.id} account={account} className={s.accountAvatar} />
                    ))}
                    {strategy.accounts.length > 3 && (
                      <span className={[s.accountAvatar, s.accountAvatarOverflow].join(' ')}>
                        +{strategy.accounts.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={s.leftSection}>
          <div className={s.sectionHeader}>
            <span className={s.savingSectionTitle}>Saving accounts</span>
          </div>

          <div className={s.savingAccounts}>
            <div className={s.savingAccountCard}>
              <div className={s.savingAccountInfo}>
                <span className={s.savingAccountIcon}>
                  <img src="/assets/brokers/surmount.png" alt="" />
                </span>
                <span className={s.savingAccountName}>Surmount High Yield Cash</span>
                <span className={s.interestBadge}>3.25% interest</span>
              </div>
              <span className={s.savingAccountValue}>$351,242.54</span>
            </div>

            <div className={s.savingPromptCard}>
              <div className={s.savingAccountInfo}>
                <span className={s.savingAccountIcon}>
                  <img src="/assets/brokers/surmount.png" alt="" />
                </span>
                <div className={s.savingPromptText}>
                  <div className={s.savingPromptTitleRow}>
                    <span className={s.savingAccountName}>High yield cash account (HYCA)</span>
                    <span className={s.interestBadge}>3.25% interest</span>
                  </div>
                  <span className={s.savingPromptDescription}>Earn money on your idle cash.</span>
                </div>
              </div>
              <div className={s.savingPromptActions}>
                <button type="button" className={s.openAccountButton}>Open account</button>
                <button type="button" className={s.dismissSavingPrompt} aria-label="Dismiss">
                  <X weight="bold" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
