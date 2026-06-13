'use client';

import {
  myAgentsActivityItems,
  type ActiveAgent,
  type AgentCard,
  type MyAgentsActivityTab,
  type MyAgentsTab,
} from '../_data';
import s from '../page.module.css';

export function MyAgentsStage({
  myAgentsTab,
  setMyAgentsTab,
  myAgentsActivityTab,
  setMyAgentsActivityTab,
  allAgentCards,
  onSelectAgent,
}: {
  myAgentsTab: MyAgentsTab;
  setMyAgentsTab: (tab: MyAgentsTab) => void;
  myAgentsActivityTab: MyAgentsActivityTab;
  setMyAgentsActivityTab: (tab: MyAgentsActivityTab) => void;
  allAgentCards: AgentCard[];
  onSelectAgent: (agent: ActiveAgent) => void;
}) {
  return (
    <section className={s.myAgentsStage} aria-label="My Agents">
      <div className={s.myAgentsCanvas}>

        {/* Header */}
        <div className={s.myAgentsHeader}>
          <h2 className={s.myAgentsTitle}>My Agents</h2>
          <div className={s.myAgentsActions}>
            <button type="button" className={s.myAgentsActionBtn}>
              Share
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 3h3v3M13 3l-6 6M7 4H4a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V9" /></svg>
            </button>
            <button type="button" className={s.myAgentsActionBtn}>
              Import
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 3v8M5 8l3 4 3-4M3 13h10" /></svg>
            </button>
            <button type="button" className={[s.myAgentsActionBtn, s.myAgentsCreateBtn].join(' ')}>
              + Create new
            </button>
          </div>
        </div>

        {/* Active / Paused / Drafts tabs */}
        <div className={s.myAgentsTabs}>
          {(['active', 'paused', 'drafts'] as MyAgentsTab[]).map((tab) => (
            <button key={tab} type="button"
              className={[s.myAgentsTab, myAgentsTab === tab ? s.myAgentsTabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setMyAgentsTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Agent cards */}
        <div className={s.agentCardGrid}>
          {allAgentCards.filter(a => a.status === (myAgentsTab === 'drafts' ? 'draft' : myAgentsTab === 'paused' ? 'paused' : 'active')).map((agent) => (
            <div key={agent.id} className={s.agentCard} onClick={() => onSelectAgent({ id: agent.id, name: agent.name })}>
              <div className={s.agentCardStatusDot} aria-label="Active" />
              <h3 className={s.agentCardName}>{agent.name}</h3>
              <p className={s.agentCardDesc}>{agent.description}</p>
              <span className={s.agentCardTag}>{agent.tag}</span>
              <div className={s.agentCardFooter}>
                <span className={s.agentCardNextLabel}>Next</span>
                <span className={s.agentCardNextStep}>{agent.nextStep}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom activity section */}
        <div className={s.myAgentsBottomTabs}>
          {(['activity', 'history'] as MyAgentsActivityTab[]).map((tab) => (
            <button key={tab} type="button"
              className={[s.myAgentsTab, myAgentsActivityTab === tab ? s.myAgentsTabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setMyAgentsActivityTab(tab)}
            >
              {tab === 'activity' ? 'Agent activity' : 'Transaction history'}
            </button>
          ))}
        </div>

        {myAgentsActivityTab === 'activity' && (
          <div className={s.myAgentsActivityFeed}>
            <p className={s.myAgentsActivityDate}>Today, March 27</p>
            {myAgentsActivityItems.map((item) => (
              <div key={item.id} className={s.myAgentsActivityWrap}>
                <div className={s.myAgentsActivityRow}>
                  <div className={s.activityItemLeft}>
                    <span className={[
                      s.activityIcon,
                      item.status === 'success' ? s.activityIconSuccess :
                      item.status === 'running' ? s.activityIconSuccess :
                      s.activityIconPending,
                    ].join(' ')} aria-hidden="true">
                      {item.status === 'pending' ? null : (
                        <svg viewBox="0 0 20 20" fill="none"><path d="M5 10l3.5 3.5L15 7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      )}
                    </span>
                    <div className={s.myAgentsActivityLeft}>
                      <span className={[s.activityTitle, item.status === 'pending' ? s.myAgentsActivityPending : ''].filter(Boolean).join(' ')}>{item.title}</span>
                      {item.subtitle && <span className={s.myAgentsActivitySub}>{item.subtitle}</span>}
                    </div>
                  </div>
                  {item.time && <span className={s.activityTime}>{item.time}</span>}
                </div>
                <div className={s.activityDivider} aria-hidden="true" />
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
