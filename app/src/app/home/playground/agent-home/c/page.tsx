'use client';

import { ArrowsClockwise, Clock, Pulse } from '@phosphor-icons/react';
import { AgentPromptInput } from '../_components/AgentPromptInput';
import { MOCK_AGENTS, ROLE_TEMPLATES, agentStatusLine, type AgentCondition } from '../_data';
import s from './page.module.css';

function ConditionIcon({ condition }: { condition: AgentCondition }) {
  const props = { weight: 'regular' as const, className: s.rowIcon, 'aria-hidden': true };
  if (condition.kind === 'scheduled') return <Clock {...props} />;
  if (condition.kind === 'threshold-live') return <Pulse {...props} />;
  return <ArrowsClockwise {...props} />;
}

// VARIANT C — Split panel
// Hierarchy decision under test: instead of stacking supporting content below the input
// (variants A/B), give "My Agents" its own persistent column so status is always visible with
// zero scrolling — a different kind of prominence than card size (position + permanence rather
// than visual size). Templates move inside the chat column, nested under the input as a
// secondary row rather than living independently.
export default function AgentHomeVariantC() {
  return (
    <main className={s.shell}>
      <section className={s.chatColumn} aria-label="Create an agent">
        <div className={s.chatColumnInner}>
          <h1 className={s.title}>What should your agent do?</h1>
          <AgentPromptInput size="hero" />

          <div className={s.templatesRow} aria-label="Agent templates">
            <span className={s.templatesLabel}>Or start from a template</span>
            <div className={s.templateChips}>
              {ROLE_TEMPLATES.map((tpl) => (
                <button key={tpl.id} type="button" className={s.templateChip} title={tpl.description}>
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <aside className={s.agentsPanel} aria-label="My agents">
        <div className={s.agentsPanelHeader}>
          <h2 className={s.agentsPanelTitle}>My agents</h2>
          <span className={s.agentsPanelCount}>{MOCK_AGENTS.length}</span>
        </div>

        {MOCK_AGENTS.length === 0 ? (
          <div className={s.agentsPanelEmpty}>
            <p>No agents yet.</p>
            <span>Create one from the chat.</span>
          </div>
        ) : (
          <div className={s.agentRows}>
            {MOCK_AGENTS.map((agent) => (
              <div key={agent.id} className={s.agentRow}>
                <ConditionIcon condition={agent.condition} />
                <div className={s.agentRowBody}>
                  <p className={s.agentRowName}>{agent.name}</p>
                  <p className={s.agentRowStatus}>{agentStatusLine(agent.condition)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>
    </main>
  );
}
