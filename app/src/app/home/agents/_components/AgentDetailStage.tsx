'use client';

import { type ActiveAgent, type DemoConfig, type DetailTab } from '../_data';
import s from '../page.module.css';

export function AgentDetailStage({
  selectedAgent,
  detailDemoConfig,
  activeDetailTab,
  setActiveDetailTab,
  expandedTx,
  toggleTx,
  onBack,
}: {
  selectedAgent: ActiveAgent;
  detailDemoConfig: DemoConfig;
  activeDetailTab: DetailTab;
  setActiveDetailTab: (tab: DetailTab) => void;
  expandedTx: Set<string>;
  toggleTx: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <section className={s.agentDetailStage} aria-label={selectedAgent.name}>
      <div className={s.agentDetailCanvas}>

        {/* Header */}
        <header className={s.agentDetailHeader}>
          <div className={s.agentDetailHeaderLeft}>
            <button
              type="button"
              className={s.agentDetailBackBtn}
              onClick={onBack}
              aria-label="Back"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
            </button>
            <div className={s.agentDetailTitleRow}>
              <h2 className={s.agentDetailName}>{selectedAgent.name}</h2>
            </div>
          </div>
          <div className={s.agentDetailActions}>
            <button type="button" className={s.agentDetailActionBtn}>
              Share
              <img src="/assets/detail/icon-share.svg" alt="" style={{ width: 13, height: 13, display: 'block', flexShrink: 0 }} />
            </button>
            <button type="button" className={s.agentDetailActionBtn}>
              Pause
              <img src="/assets/detail/icon-pause.svg" alt="" style={{ width: 13, height: 13, display: 'block', flexShrink: 0 }} />
            </button>
            <button type="button" className={s.agentDetailMoreBtn} aria-label="More options">
              <img src="/assets/detail/icon-more.svg" alt="" style={{ width: 16, height: 16, display: 'block' }} />
            </button>
          </div>
        </header>

        {/* Summary — no category tag (matches Figma) */}
        <p className={s.agentDetailSummary}>{detailDemoConfig.summary}</p>

        {/* Info cards — next check + monitoring */}
        <div className={s.agentInfoCards}>
          {/* Next check — green status dot */}
          <div className={[s.agentInfoCard, s.agentInfoCardNextCheck].join(' ')}>
            <div className={s.agentInfoDot}>
              <div className={s.agentInfoDotRing} aria-hidden="true" />
            </div>
            <div className={s.agentInfoCardBody}>
              <span className={s.agentInfoCardLabel}>Next check</span>
              <span className={s.agentInfoCardValue}>{detailDemoConfig.nextCheck}</span>
            </div>
          </div>
          {/* Monitoring — blue circle icon */}
          <div className={[s.agentInfoCard, s.agentInfoCardMonitoring].join(' ')}>
            <div className={s.agentMonitoringCircle}>
              <img src="/assets/detail/icon-monitoring.svg" alt="" />
            </div>
            <div className={s.agentInfoCardBody}>
              <span className={s.agentInfoCardLabel}>Monitoring</span>
              <span className={s.agentInfoCardValue}>{detailDemoConfig.monitoring}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={s.agentDetailTabs}>
          {(['workflow', 'activity', 'history'] as DetailTab[]).map((tab) => (
            <button key={tab} type="button"
              className={[s.agentDetailTab, activeDetailTab === tab ? s.agentDetailTabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setActiveDetailTab(tab)}
            >
              {tab === 'workflow' ? 'Workflow' : tab === 'activity' ? 'Agent activity' : 'Transaction history'}
            </button>
          ))}
        </div>

        {/* Workflow */}
        {activeDetailTab === 'workflow' && (
          <div className={s.agentDetailBody}>
            {detailDemoConfig.legs.map((leg) => (
              <div key={leg.title} className={s.agentSteps}>
                <div className={s.agentLegHeader}>
                  <span className={s.agentLegLabel}>{leg.title}</span>
                  <div className={s.agentLegLine} aria-hidden="true" />
                </div>
                {leg.steps.map((step, i) => (
                  <div key={step.id} className={s.agentStepWrap}>
                    <div className={s.agentStepRow}>
                      <span className={s.agentStepNum}>{step.id}</span>
                      <div className={s.agentStepCard}>
                        {step.branches ? (
                          <div className={s.agentStepBranches}>
                            <span className={s.agentBranchCondition}>{step.branches[0]?.condition}</span>
                            <div className={s.agentBranchRow}>
                              <span className={s.agentBranchTagThen}>Then</span>
                              <div className={s.agentBranchContent}>
                                <span className={s.agentStepLabel}>{step.branches[0]?.title}</span>
                                {step.branches[0]?.meta && <span className={s.agentStepMeta}>{step.branches[0].meta}</span>}
                              </div>
                            </div>
                            <div className={s.agentBranchDivider} aria-hidden="true" />
                            <div className={s.agentBranchRow}>
                              <span className={s.agentBranchTagElse}>Else</span>
                              <div className={s.agentBranchContent}>
                                <span className={[s.agentStepLabel, s.agentStepLabelMuted].join(' ')}>{step.branches[1]?.title}</span>
                                {step.branches[1]?.meta && <span className={s.agentStepMeta}>{step.branches[1].meta}</span>}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className={s.agentStepInline}>
                            <span className={s.agentStepLabel}>{step.title}</span>
                            {step.meta && <span className={s.agentStepMeta}>{step.meta}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    {i < leg.steps.length - 1 && (
                      <div className={s.agentStepArrow} aria-hidden="true">
                        <img src="/assets/detail/icon-connector.svg" alt="" style={{ width: 12, height: 24, display: 'block' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Agent activity */}
        {activeDetailTab === 'activity' && (
          <div className={s.activityFeed}>
            {detailDemoConfig.activity.map((run, ri) => (
              <div key={ri} className={s.activityRun}>
                <div className={s.activityRunLabel}>
                  <span>{run.label}</span>
                  <div className={s.activityRunLine} aria-hidden="true" />
                </div>
                <div className={s.activityList}>
                  {run.items.map((item) => (
                    <div key={item.id} className={s.activityItemWrap}>
                      <div className={s.activityItem}>
                        <div className={s.activityItemLeft}>
                          <span className={[s.activityIcon, item.status === 'success' ? s.activityIconSuccess : s.activityIconWarning].join(' ')} aria-hidden="true">
                            {item.status === 'success' ? (
                              <svg viewBox="0 0 20 20" fill="none"><path d="M5 10l3.5 3.5L15 7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            ) : (
                              <svg viewBox="0 0 20 20" fill="none"><path d="M10 6v5M10 13.5v.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
                            )}
                          </span>
                          <span className={s.activityTitle}>{item.title}</span>
                        </div>
                        <span className={s.activityTime}>{item.time}</span>
                      </div>
                      {item.tooltip && (
                        <div className={s.activityTooltip} role="tooltip">{item.tooltip}</div>
                      )}
                      <div className={s.activityDivider} aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transaction history */}
        {activeDetailTab === 'history' && (
          <div className={s.txFeed}>
            {detailDemoConfig.transactions.map((group) => (
              <div key={group.label} className={s.txGroup}>
                <h3 className={s.txGroupLabel}>{group.label}</h3>
                <div className={s.txList}>
                  {group.items.map((tx) => (
                    <div key={tx.id} className={s.txItemWrap}>
                      <div
                        className={[s.txRow, tx.detail ? s.txRowClickable : ''].filter(Boolean).join(' ')}
                        onClick={() => tx.detail && toggleTx(tx.id)}
                        role={tx.detail ? 'button' : undefined}
                        tabIndex={tx.detail ? 0 : undefined}
                      >
                        <div className={s.txLeft}>
                          {tx.pending && <span className={s.txPendingLabel}>Pending</span>}
                          <span className={s.txTitle}>{tx.title}</span>
                          <span className={s.txDate}>{tx.date}</span>
                        </div>
                        <div className={s.txRight}>
                          <div className={s.txAmountRow}>
                            <span className={s.txAmount}>{tx.amount}</span>
                            {tx.detail && (
                              <svg className={[s.txChevron, expandedTx.has(tx.id) ? s.txChevronOpen : ''].filter(Boolean).join(' ')} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 6l4 4 4-4" /></svg>
                            )}
                          </div>
                          <span className={s.txShares}>{tx.shares}</span>
                        </div>
                      </div>

                      {expandedTx.has(tx.id) && tx.detail && (
                        <div className={s.txDetail}>
                          <div className={s.txDetailGrid}>
                            {[
                              { label: 'Account',           value: tx.detail.account },
                              { label: 'Order type',        value: tx.detail.orderType },
                              { label: 'Order status',      value: tx.detail.orderStatus },
                              { label: 'Duration',          value: tx.detail.duration },
                              { label: 'Submitted',         value: tx.detail.submitted },
                              { label: 'Filed',             value: tx.detail.filed },
                              { label: 'Price',             value: tx.detail.price },
                              { label: 'Submitted amount',  value: tx.detail.submittedAmount },
                              { label: 'Filled quantity',   value: tx.detail.filledQty },
                              { label: 'Commission',        value: tx.detail.commission },
                              { label: 'SEC & TAF fee',     value: tx.detail.secFee },
                              { label: 'Tip',               value: tx.detail.tip },
                              { label: 'Total',             value: tx.detail.total },
                            ].map(({ label, value }) => (
                              <div key={label} className={s.txDetailField}>
                                <span className={s.txDetailLabel}>{label}</span>
                                <span className={s.txDetailValue}>{value}</span>
                              </div>
                            ))}
                          </div>
                          <button type="button" className={s.txViewLink}>{detailDemoConfig.txViewLabel}</button>
                        </div>
                      )}

                      <div className={s.txDivider} aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
