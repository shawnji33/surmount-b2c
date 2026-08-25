'use client';

import { ArrowLeft, ArrowRight, BookmarkSimple, CaretDown, CheckCircle, X } from '@phosphor-icons/react';
import { Input } from '@/components/Input';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import Brand from '../_components/Brand';
import {
  DEMO_ACCOUNTS,
  PROJECTION_RANGES,
  RANGE_YEARS,
  STRATEGIES,
  type Holding,
  type ProjectionRange,
  type BuyStep,
} from './_data';
import {
  buildProjectionPoints,
  formatCompactMoney,
  formatMoney,
  formatOrderInput,
  formatProjectionRange,
  formatWholeInput,
  parseAmount,
  parseAnnualReturn,
  useAnimatedHeight,
} from './_helpers';
import { ProjectionChart } from './_components/ProjectionChart';
import { RiskBadge } from './_components/RiskBadge';
import s from './page.module.css';

export default function StrategyResultsPage() {
  const [selectedId, setSelectedId] = useState(STRATEGIES[0].id);
  const [range, setRange] = useState<ProjectionRange>('1Y');
  const [investToday, setInvestToday] = useState('50,000');
  const [investMonthly, setInvestMonthly] = useState('1,000');
  const [activeProjectionIndex, setActiveProjectionIndex] = useState<number | null>(null);
  const [holdingsView, setHoldingsView] = useState<'overview' | 'sector'>('overview');
  const [buyStep, setBuyStep] = useState<BuyStep>('about');
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isHoldingBreakdownOpen, setIsHoldingBreakdownOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderAmount, setOrderAmount] = useState('0.00');
  const [investedAmounts, setInvestedAmounts] = useState<Record<string, Record<string, number>>>({});
  const [watchlistedIds, setWatchlistedIds] = useState<string[]>([]);
  const [toastId, setToastId] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastLeaving, setIsToastLeaving] = useState(false);
  const toastTimerRef = useRef<number | undefined>(undefined);
  const toastLeaveTimerRef = useRef<number | undefined>(undefined);
  const selected = useMemo(
    () => STRATEGIES.find((strategy) => strategy.id === selectedId) ?? STRATEGIES[0],
    [selectedId],
  );
  const selectedAccount = useMemo(
    () => DEMO_ACCOUNTS.find((account) => account.id === selectedAccountId) ?? null,
    [selectedAccountId],
  );
  const watchlisted = watchlistedIds.includes(selected.id);
  const parsedInvestToday = parseAmount(investToday);
  const parsedInvestMonthly = parseAmount(investMonthly);
  const projectionYears = RANGE_YEARS[range];
  const projectionAnnualReturn = parseAnnualReturn(selected.oneYearReturn) * 1.65 + 0.04;
  const projectionPoints = useMemo(
    () => buildProjectionPoints({
      initialInvestment: parsedInvestToday,
      monthlyInvestment: parsedInvestMonthly,
      years: projectionYears,
      annualReturn: projectionAnnualReturn,
      shape: selected.projection.points,
    }),
    [parsedInvestMonthly, parsedInvestToday, projectionAnnualReturn, projectionYears, selected.projection.points],
  );
  const terminalProjection = projectionPoints[projectionPoints.length - 1];
  const projectionUncertainty = 0.08 + projectionYears * 0.012;
  const projectedLowValue = terminalProjection.value * (1 - projectionUncertainty);
  const projectedHighValue = terminalProjection.value * (1 + projectionUncertainty);
  const projectedContributionValue = terminalProjection.contributions;
  const projectedGainValue = terminalProjection.gains;
  const parsedOrderAmount = parseAmount(orderAmount);
  const estimatedCost = parsedOrderAmount > 0 ? parsedOrderAmount + 11 : 0;
  const canReviewOrder = Boolean(selectedAccount) && parsedOrderAmount > 0;
  const accountHoldings = investedAmounts[selected.id] ?? {};
  const holdingRows = DEMO_ACCOUNTS.map((account) => ({
    account,
    amount: accountHoldings[account.id] ?? 0,
  })).filter(({ amount }) => amount > 0);
  const investedAmount = holdingRows.reduce((total, { amount }) => total + amount, 0);
  const orderAccount = selectedAccount ?? DEMO_ACCOUNTS[0];
  const projectionCardRef = useAnimatedHeight<HTMLDivElement>([selected.id, range]);
  const reasonGridRef = useAnimatedHeight<HTMLDivElement>([selected.id]);
  const holdingsCardRef = useAnimatedHeight<HTMLDivElement>([selected.id]);
  const infoShellRef = useAnimatedHeight<HTMLDivElement>([
    selected.id,
    watchlisted,
    buyStep,
    isAccountOpen,
    selectedAccountId,
    isSubmittingOrder,
    orderAmount,
    investedAmount,
  ]);

  useEffect(() => () => {
    if (toastTimerRef.current != null) window.clearTimeout(toastTimerRef.current);
    if (toastLeaveTimerRef.current != null) window.clearTimeout(toastLeaveTimerRef.current);
  }, []);

  useEffect(() => {
    setInvestToday(selected.projection.investToday);
    setInvestMonthly(selected.projection.investMonthly);
    setActiveProjectionIndex(null);
    setBuyStep('about');
    setIsAccountOpen(false);
    setSelectedAccountId(null);
    setIsHoldingBreakdownOpen(false);
    setIsSubmittingOrder(false);
    setOrderAmount('0.00');
  }, [selected.id, selected.projection.investMonthly, selected.projection.investToday]);

  useEffect(() => {
    if (!isSubmittingOrder || !selectedAccountId) return undefined;

    const timeout = window.setTimeout(() => {
      setInvestedAmounts((current) => ({
        ...current,
        [selected.id]: {
          ...(current[selected.id] ?? {}),
          [selectedAccountId]: ((current[selected.id] ?? {})[selectedAccountId] ?? 0) + parsedOrderAmount,
        },
      }));
      setIsSubmittingOrder(false);
      setBuyStep('submitted');
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [isSubmittingOrder, parsedOrderAmount, selected.id, selectedAccountId]);

  const dismissToast = () => {
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = undefined;
    }
    if (toastLeaveTimerRef.current != null) window.clearTimeout(toastLeaveTimerRef.current);
    setIsToastLeaving(true);
    toastLeaveTimerRef.current = window.setTimeout(() => {
      setToastMessage('');
      setIsToastLeaving(false);
      toastLeaveTimerRef.current = undefined;
    }, 220);
  };

  const showToast = (message: string) => {
    if (toastTimerRef.current != null) window.clearTimeout(toastTimerRef.current);
    if (toastLeaveTimerRef.current != null) window.clearTimeout(toastLeaveTimerRef.current);
    setIsToastLeaving(false);
    setToastId((id) => id + 1);
    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(dismissToast, 4200);
  };

  const handleWatchlistToggle = () => {
    if (watchlisted) {
      setWatchlistedIds((current) => current.filter((id) => id !== selected.id));
      showToast(`${selected.name} has been removed from your watchlist.`);
      return;
    }

    setWatchlistedIds((current) => (current.includes(selected.id) ? current : [...current, selected.id]));
    showToast(`${selected.name} has been added to your watchlist.`);
  };

  const selectStrategyByIndex = (index: number) => {
    const normalizedIndex = (index + STRATEGIES.length) % STRATEGIES.length;
    setSelectedId(STRATEGIES[normalizedIndex].id);
  };

  const handleProjectionInputChange = (
    setter: (value: string) => void,
  ) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, '');
    setter(value ? Number(value).toLocaleString('en-US') : '');
  };

  const handleProjectionInputBlur = (
    value: string,
    setter: (value: string) => void,
  ) => {
    const parsedValue = parseAmount(value);
    setter(parsedValue > 0 ? formatWholeInput(parsedValue) : '0');
  };

  const handleOrderAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9.]/g, '');
    const [whole = '', ...decimalParts] = value.split('.');
    const decimalValue = decimalParts.join('').slice(0, 2);
    setOrderAmount(decimalParts.length > 0 ? `${whole}.${decimalValue}` : whole);
  };

  const handleOrderAmountBlur = () => {
    if (parsedOrderAmount > 0) {
      setOrderAmount(formatOrderInput(parsedOrderAmount));
    }
  };

  const applyMaxAmount = () => {
    setOrderAmount(formatOrderInput((selectedAccount ?? DEMO_ACCOUNTS[0]).orderAmount));
  };

  const submitOrder = () => {
    if (!canReviewOrder) return;
    setIsSubmittingOrder(true);
  };

  const resetBuyFlow = () => {
    setBuyStep('about');
    setIsAccountOpen(false);
    setSelectedAccountId(null);
    setIsHoldingBreakdownOpen(false);
    setIsSubmittingOrder(false);
    setOrderAmount('0.00');
  };

  return (
    <div className={s.page}>
      {toastMessage !== '' && (
        <div className={s.toastRegion} aria-live="polite" aria-atomic="true">
          <div
            key={toastId}
            className={[s.toast, isToastLeaving ? s.toastLeaving : ''].filter(Boolean).join(' ')}
            role="status"
          >
            <CheckCircle className={s.toastIcon} weight="fill" aria-hidden="true" />
            <p className={s.toastText}>{toastMessage}</p>
            <button type="button" className={s.toastDismiss} aria-label="Dismiss alert" onClick={dismissToast}>
              <X aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <header className={s.topbar}>
        <Link href="/onboarding/strategy-quiz" className={s.topbarButton}>
          <ArrowLeft aria-hidden="true" />
          <span>Back</span>
        </Link>

        <div className={s.brand}>
          <Brand size={32} />
          <span>Surmount</span>
        </div>

        <Link href="/home" className={s.topbarButton}>
          <span>Close</span>
          <X aria-hidden="true" />
        </Link>
      </header>

      <main className={s.main}>
        <section className={s.heading}>
          <h1>Your top match, Shawn</h1>
          <p>
            We analyzed all strategies against your goals, time horizon, risk tolerance,
            experience, and theme preferences. Here&apos;s what fits you best.
          </p>
        </section>

        <div className={[s.carouselRail, s.matchSelector].join(' ')} aria-label="Choose strategy match">
          {STRATEGIES.map((strategy, index) => (
            <button
              key={strategy.id}
              type="button"
              className={strategy.id === selected.id ? s.carouselRailActive : ''}
              onClick={() => selectStrategyByIndex(index)}
              aria-pressed={strategy.id === selected.id}
            >
              <span className={s.railImage}>
                <img src={strategy.cover} alt="" />
              </span>
              <span>
                <strong>{strategy.name}</strong>
                <small>{strategy.oneYearReturn} · {strategy.risk} risk</small>
              </span>
            </button>
          ))}
        </div>

        <div className={s.contentGrid}>
          <section className={s.strategyColumn} aria-label="Strategy match details">
            <div className={s.heroCarousel}>
              <article className={s.heroCard}>
                <img key={`hero-media-${selected.id}`} className={s.heroMediaSwap} src={selected.cover} alt="" />
                <span className={s.heroProgressiveBlur} aria-hidden="true" />
                <div className={s.heroOverlay} />
                <div key={`hero-copy-${selected.id}`} className={[s.heroDetails, s.contentSwap].join(' ')}>
                  <h2>{selected.name}</h2>
                  <dl className={s.heroMetrics}>
                    <div>
                      <dt>1-Year return</dt>
                      <dd className={s.positive}>{selected.oneYearReturn}</dd>
                    </div>
                    <div>
                      <dt>Risk</dt>
                      <dd>
                        <span
                          className={[s.riskDot, selected.risk === 'Medium' ? s.riskDotWarning : s.riskDotSuccess].join(' ')}
                          aria-hidden="true"
                        />
                        {selected.risk}
                      </dd>
                    </div>
                    <div>
                      <dt>Top industry</dt>
                      <dd>{selected.industry}</dd>
                    </div>
                    <div>
                      <dt>Holdings</dt>
                      <dd>{selected.holdingsCount}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            </div>

            <section className={s.sectionBlock} aria-labelledby="projection-title">
              <h2 id="projection-title" className={s.sectionTitle}>Projected portfolio value</h2>
              <div ref={projectionCardRef} className={s.projectionCard}>
                <div key={`projection-copy-${selected.id}`} className={[s.projectionBody, s.contentSwap].join(' ')}>
                  <div className={s.projectionTop}>
                    <div>
                      <p className={s.projectionValue}>{formatProjectionRange(projectedLowValue, projectedHighValue)}</p>
                      <div className={s.legend}>
                        <span><i className={s.legendContributions} /> Contributions <strong>{formatCompactMoney(projectedContributionValue)}</strong></span>
                        <span><i className={s.legendGains} /> Gains <strong>{formatCompactMoney(projectedGainValue)}</strong></span>
                      </div>
                    </div>
                    <div className={s.rangeControl} aria-label="Projection range">
                      {PROJECTION_RANGES.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className={range === item ? s.rangeActive : ''}
                          onClick={() => setRange(item)}
                          aria-pressed={range === item}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ProjectionChart
                    points={projectionPoints}
                    activeIndex={activeProjectionIndex}
                    onActiveIndexChange={setActiveProjectionIndex}
                  />
                </div>
                <div className={s.inputGrid}>
                  <Input
                    size="sm"
                    label="Invest today"
                    value={investToday}
                    onChange={handleProjectionInputChange(setInvestToday)}
                    onBlur={() => handleProjectionInputBlur(investToday, setInvestToday)}
                    inputMode="numeric"
                    className={s.projectionInput}
                    iconLeading={<span className={s.inputCurrency}>$</span>}
                  />
                  <Input
                    size="sm"
                    label="Invest every month"
                    value={investMonthly}
                    onChange={handleProjectionInputChange(setInvestMonthly)}
                    onBlur={() => handleProjectionInputBlur(investMonthly, setInvestMonthly)}
                    inputMode="numeric"
                    className={s.projectionInput}
                    iconLeading={<span className={s.inputCurrency}>$</span>}
                  />
                </div>
              </div>
            </section>

            <section className={s.sectionBlock} aria-labelledby="recommended-title">
              <h2 id="recommended-title" className={s.sectionTitle}>Why this was recommended for you</h2>
              <div ref={reasonGridRef} className={s.reasonGrid}>
                {selected.reasons.map((reason, index) => (
                  <article key={index} className={s.reasonCard}>
                    <div key={`${selected.id}-${reason.title}`} className={s.contentSwap}>
                      <h3>{reason.title}</h3>
                      <p>{reason.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className={s.sectionBlock} aria-labelledby="holdings-title">
              <h2 id="holdings-title" className={s.sectionTitle}>Holdings</h2>
              <div ref={holdingsCardRef} className={s.holdingsCard}>
                <div className={s.tabs} aria-label="Holdings view">
                  <button
                    type="button"
                    className={holdingsView === 'overview' ? s.tabActive : ''}
                    onClick={() => setHoldingsView('overview')}
                    aria-pressed={holdingsView === 'overview'}
                  >
                    Asset
                  </button>
                  <button
                    type="button"
                    className={holdingsView === 'sector' ? s.tabActive : ''}
                    onClick={() => setHoldingsView('sector')}
                    aria-pressed={holdingsView === 'sector'}
                  >
                    Sector
                  </button>
                </div>
                <div key={`allocation-${selected.id}-${holdingsView}`} className={[s.allocationWrap, s.contentSwap].join(' ')}>
                  <div className={s.allocationBar} aria-label={`${holdingsView === 'overview' ? 'Asset' : 'Sector'} allocation chart`}>
                    {(holdingsView === 'overview' ? selected.holdings : selected.sectors).map((item) => {
                      const label = holdingsView === 'overview' ? (item as Holding).name : item.name;
                      const value = holdingsView === 'overview' ? (item as Holding).weight : item.weight;

                      return (
                        <button
                          key={holdingsView === 'overview' ? (item as Holding).symbol : item.name}
                          type="button"
                          className={s.allocationSegment}
                          style={{ background: item.color }}
                          aria-label={`${label}: ${value}`}
                        >
                          <span className={s.allocationTooltip} role="tooltip">
                            <span>
                              <i style={{ background: item.color }} aria-hidden="true" />
                              {label}
                            </span>
                            <strong>{value}</strong>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div key={`holdings-list-${selected.id}-${holdingsView}`} className={[s.holdingsList, s.contentSwap].join(' ')}>
                  {holdingsView === 'overview'
                    ? selected.holdings.map((holding, index) => (
                      <div key={index} className={s.holdingItem}>
                        <div className={s.holdingDetails}>
                          <span className={s.holdingDot} style={{ background: holding.color }} aria-hidden="true" />
                          <img src={holding.logo} alt="" />
                          <span>
                            <strong>{holding.symbol}</strong>
                            <small>{holding.name}</small>
                          </span>
                        </div>
                        <span>{holding.weight}</span>
                      </div>
                    ))
                    : selected.sectors.map((sector, index) => (
	                      <div key={index} className={s.holdingItem}>
	                        <div className={s.holdingDetails}>
	                          <span className={s.sectorDot} style={{ background: sector.color }} aria-hidden="true" />
	                          <span>
	                            <strong>{sector.name}</strong>
	                          </span>
	                        </div>
                        <span>{sector.weight}</span>
                      </div>
                    ))}
                </div>
              </div>
            </section>
          </section>

          <aside className={s.sidebar} aria-label="Strategy actions">
            <div ref={infoShellRef} className={s.infoShell}>
              {buyStep === 'about' && (
                <>
                  <div className={s.infoCard}>
                    <div key={`info-copy-${selected.id}`} className={s.contentSwap}>
                      <h2>About this strategy</h2>
                      <div className={s.tagRow}>
                        <RiskBadge risk={selected.risk} tone={selected.badgeTone} />
                        <span className={[s.badge, s.badgeGray].join(' ')}>{selected.tags[1]}</span>
                      </div>
                      <p>{selected.description}</p>
                    </div>
                  </div>
                  <button className={s.primaryButton} type="button" onClick={() => setBuyStep('details')}>
                    Invest in this strategy
                    <ArrowRight aria-hidden="true" />
                  </button>
                  <button className={s.secondaryButton} type="button" onClick={handleWatchlistToggle}>
                    <BookmarkSimple weight={watchlisted ? 'fill' : 'regular'} aria-hidden="true" />
                    {watchlisted ? 'Added to watchlist' : 'Add to watchlist'}
                  </button>
                  {investedAmount > 0 && (
                    <div className={s.holdingSummaryShell}>
                      <button
                        className={s.holdingSummary}
                        type="button"
                        onClick={() => setIsHoldingBreakdownOpen((isOpen) => !isOpen)}
                        aria-expanded={isHoldingBreakdownOpen}
                      >
                        <span>Current holding</span>
                        <strong className={s.holdingSummaryValue}>
                          {formatMoney(investedAmount)}
                          <CaretDown aria-hidden="true" />
                        </strong>
                      </button>

                      {isHoldingBreakdownOpen && (
                        <div className={s.holdingBreakdown}>
                          {holdingRows.map(({ account, amount }) => (
                            <div key={account.id} className={s.holdingBreakdownRow}>
                              <span className={s.accountValue}>
                                <img src={account.logo} alt="" />
                                {account.name}
                              </span>
                              <strong>{formatMoney(amount)}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {buyStep === 'details' && (
                <div key="buy-details" className={s.buyFlowPanel}>
                  <div className={s.buyTitle}>
                    <button type="button" onClick={() => setBuyStep('about')} aria-label="Back to strategy summary">
                      <ArrowLeft aria-hidden="true" />
                    </button>
                    <span>Invest in “{selected.name}”</span>
                  </div>

                  <div className={[s.buyCard, s.reviewCard].join(' ')}>
                    <div className={s.buyRow}>
                      <span>Account</span>
                      <div className={s.accountSelectWrap}>
                        <button
                          type="button"
                          className={s.accountSelect}
                          onClick={() => setIsAccountOpen((isOpen) => !isOpen)}
                          aria-expanded={isAccountOpen}
                        >
                          {selectedAccount ? (
                            <span className={s.accountValue}>
                              <img src={selectedAccount.logo} alt="" />
                              {selectedAccount.name}
                            </span>
                          ) : (
                            <span className={s.placeholderText}>Select an account</span>
                          )}
                          <CaretDown aria-hidden="true" />
                        </button>
                        {isAccountOpen && (
                          <div className={s.accountMenu}>
                            {DEMO_ACCOUNTS.map((account) => (
                              <button
                                key={account.id}
                                type="button"
                                className={selectedAccountId === account.id ? s.accountMenuActive : ''}
                                onClick={() => {
                                  setSelectedAccountId(account.id);
                                  setIsAccountOpen(false);
                                }}
                              >
                                <span className={s.accountValue}>
                                  <img src={account.logo} alt="" />
                                  {account.name}
                                </span>
                                <small>{formatMoney(account.balance)}</small>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedAccount && (
                      <div className={[s.buyRow, s.buyRowSubtle].join(' ')}>
                        <span>Available balance</span>
                        <strong>{formatMoney(selectedAccount.balance)}</strong>
                      </div>
                    )}

                    <div className={s.buyRow}>
                      <span>Investment amount</span>
                      <label className={[s.orderInput, parsedOrderAmount > 0 ? s.orderInputFilled : ''].join(' ')}>
                        <span>$</span>
                        <input
                          value={orderAmount}
                          onChange={handleOrderAmountChange}
                          onBlur={handleOrderAmountBlur}
                          inputMode="decimal"
                          aria-label="Investment amount"
                        />
                        <button type="button" onClick={applyMaxAmount}>Max</button>
                      </label>
                    </div>

                    <div className={s.buyDivider} />

                    <div className={s.buyRow}>
                      <span>Estimated cost</span>
                      <strong>{formatMoney(estimatedCost)}</strong>
                    </div>
                  </div>

                  <button className={s.primaryButton} type="button" onClick={() => setBuyStep('review')} disabled={!canReviewOrder}>
                    Next
                  </button>
                </div>
              )}

              {buyStep === 'review' && (
                <div key="buy-review" className={s.buyFlowPanel}>
                  <div className={s.buyTitle}>
                    <button type="button" onClick={() => setBuyStep('details')} aria-label="Back to investment amount">
                      <ArrowLeft aria-hidden="true" />
                    </button>
                    <span>Review order</span>
                  </div>

                  <div className={[s.buyCard, s.reviewCard].join(' ')}>
                    <div className={s.buyRow}>
                      <span>Strategy</span>
                      <strong>{selected.name.replace(' Leaders', '')}</strong>
                    </div>
                    <div className={s.buyRow}>
                      <span>Account</span>
                      <strong className={s.accountValue}>
                        <img src={orderAccount.logo} alt="" />
                        {orderAccount.name}
                      </strong>
                    </div>
                    <div className={s.buyRow}>
                      <span>Investment amount</span>
                      <strong>{formatMoney(parsedOrderAmount)}</strong>
                    </div>
                    <div className={s.buyDivider} />
                    <div className={s.buyRow}>
                      <span>Estimated cost</span>
                      <strong className={s.costValue}>{formatMoney(estimatedCost)}</strong>
                    </div>
                  </div>

                  <p className={[s.disclaimer, s.orderDisclaimer, s.reviewOutsideDisclaimer].join(' ')}>
                    This order will execute at the next available market price. Surmount will rebalance your portfolio according to the strategy&apos;s current allocations.
                  </p>

                  <button
                    className={[s.primaryButton, isSubmittingOrder ? s.primaryButtonLoading : ''].join(' ')}
                    type="button"
                    onClick={submitOrder}
                    disabled={isSubmittingOrder}
                    aria-busy={isSubmittingOrder}
                  >
                    {isSubmittingOrder && <span className={s.buttonSpinner} aria-hidden="true" />}
                    {isSubmittingOrder ? 'Submitting order' : 'Submit order'}
                  </button>
                </div>
              )}

              {buyStep === 'submitted' && (
                <div key="buy-submitted" className={s.buyFlowPanel}>
                  <div className={s.buyTitle}>
                    <span>Confirmation</span>
                  </div>

                  <div className={[s.buyCard, s.reviewCard, s.confirmationCard].join(' ')}>
                    <div className={s.confirmationHero}>
                      <span className={s.successMark} aria-hidden="true">
                        <svg viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="25" />
                          <path d="M21.5 32.5 28.5 39.5 43 24.5" />
                        </svg>
                      </span>
                      <strong>Order submitted!</strong>
                      <small>Today at 6:20 pm</small>
                    </div>

                    <div className={s.buyDivider} />

                    <div className={s.buyRow}>
                      <span>Strategy</span>
                      <strong>{selected.name.replace(' Leaders', '')}</strong>
                    </div>
                    <div className={s.buyRow}>
                      <span>Account</span>
                      <strong className={s.accountValue}>
                        <img src={orderAccount.logo} alt="" />
                        {orderAccount.name}
                      </strong>
                    </div>
                    <div className={s.buyRow}>
                      <span>Investment amount</span>
                      <strong>{formatMoney(parsedOrderAmount)}</strong>
                    </div>
                    <div className={s.buyDivider} />
                    <div className={s.buyRow}>
                      <span>Estimated cost</span>
                      <strong className={s.costValue}>{formatMoney(estimatedCost)}</strong>
                    </div>
                  </div>

                  <p className={[s.disclaimer, s.orderDisclaimer, s.confirmationDisclaimer].join(' ')}>
                    This order will execute at the next available market price. Surmount will rebalance your portfolio according to the strategy&apos;s current allocations.
                  </p>

                  <button className={s.primaryButton} type="button" onClick={resetBuyFlow}>
                    Done
                  </button>
                  <button className={s.secondaryButton} type="button" onClick={() => setBuyStep('review')}>
                    View details
                  </button>
                </div>
              )}
            </div>

            <p className={s.sidebarNote}>
              Use the strategy carousel to compare matches. The projection, reasons, and holdings update with the selected strategy.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
