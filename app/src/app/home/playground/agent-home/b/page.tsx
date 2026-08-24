'use client';

import { ArrowsClockwise, Clock, Pulse } from '@phosphor-icons/react';
import { AgentPromptInput } from '../_components/AgentPromptInput';
import { MOCK_AGENTS, ROLE_TEMPLATES, agentStatusLine, type AgentCondition } from '../_data';
import s from './page.module.css';

function ConditionIcon({ condition }: { condition: AgentCondition }) {
  const props = { weight: 'regular' as const, className: s.agentCardIcon, 'aria-hidden': true };
  if (condition.kind === 'scheduled') return <Clock {...props} />;
  if (condition.kind === 'threshold-live') return <Pulse {...props} />;
  return <ArrowsClockwise {...props} />;
}

// VARIANT B — Chat + Agents balanced
// Hierarchy decision under test: the chat input still leads (larger, more whitespace, top of
// page), but "My Agents" gets real card-based presence right underneath it — comparable visual
// weight to the input itself, on the premise that a returning user's running-agent status is
// arguably as load-bearing as the input for them. Templates are pushed below the fold.
export default function AgentHomeVariantB() {
  return (
    <main className={s.shell}>
      <section className={s.hero}>
        <h1 className={s.title}>What should your agent do?</h1>
        <AgentPromptInput size="hero" />
      </section>

      <section className={s.agentsSection} aria-labelledby="my-agents-title">
        <h2 id="my-agents-title" className={s.sectionTitle}>My agents</h2>
        {MOCK_AGENTS.length === 0 ? (
          <div className={s.agentsEmpty}>
            <p>No agents running yet.</p>
            <span>Describe a task above to create your first one.</span>
          </div>
        ) : (
          <div className={s.agentGrid}>
            {MOCK_AGENTS.map((agent) => (
              <div key={agent.id} className={s.agentCard}>
                <div className={s.agentCardTop}>
                  <ConditionIcon condition={agent.condition} />
                  <span className={s.agentCardBadge}>Active</span>
                </div>
                <p className={s.agentCardName}>{agent.name}</p>
                <p className={s.agentCardStatus}>{agentStatusLine(agent.condition)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={s.templatesSection} aria-labelledby="templates-title">
        <h2 id="templates-title" className={s.sectionTitleQuiet}>Or start from a template</h2>
        <div className={s.templateRow}>
          {ROLE_TEMPLATES.map((tpl) => (
            <button key={tpl.id} type="button" className={s.templateChip}>
              <span className={s.templateChipName}>{tpl.name}</span>
              <span className={s.templateChipDesc}>{tpl.description}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
