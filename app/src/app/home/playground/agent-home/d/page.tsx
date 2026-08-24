'use client';

import { useState } from 'react';
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

// VARIANT D — State-adaptive
// Hierarchy decision under test: rather than picking one fixed composition, let the layout
// itself change based on whether there's anything to show. A brand-new user has nothing to
// reengage with, so the input gets the full hero treatment and templates fill the empty space
// as inspiration. A returning user with running agents has something concrete to look at, so
// the input recedes to a compact persistent bar and My Agents takes the dominant position.
// The demo toggle below simulates both states — the real trigger would just be agent count.
export default function AgentHomeVariantD() {
  const [hasAgents, setHasAgents] = useState(true);
  const agents = hasAgents ? MOCK_AGENTS : [];

  return (
    <main className={s.shell}>
      {/* Demo-only control — not part of the design, just lets both adaptive states be seen
          without wiring up real agent data. */}
      <div className={s.demoToggle} role="radiogroup" aria-label="Demo state">
        <button
          type="button"
          role="radio"
          aria-checked={!hasAgents}
          className={!hasAgents ? `${s.demoToggleOption} ${s.demoToggleOptionActive}` : s.demoToggleOption}
          onClick={() => setHasAgents(false)}
        >
          New user
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={hasAgents}
          className={hasAgents ? `${s.demoToggleOption} ${s.demoToggleOptionActive}` : s.demoToggleOption}
          onClick={() => setHasAgents(true)}
        >
          Returning user
        </button>
      </div>

      {!hasAgents ? (
        // ── Empty state: chat input is the entire hero ─────────────────────────────
        <div className={s.emptyHero}>
          <h1 className={s.emptyTitle}>What should your agent do?</h1>
          <AgentPromptInput size="hero" />

          <section className={s.templatesGenerous} aria-labelledby="templates-title-empty">
            <h2 id="templates-title-empty" className={s.templatesGenerousTitle}>Or get inspired by a template</h2>
            <div className={s.templateGrid}>
              {ROLE_TEMPLATES.map((tpl) => (
                <button key={tpl.id} type="button" className={s.templateCard}>
                  <span className={s.templateCardName}>{tpl.name}</span>
                  <span className={s.templateCardDesc}>{tpl.description}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : (
        // ── Returning-user state: input recedes, My Agents leads ───────────────────
        <div className={s.activeLayout}>
          <div className={s.compactBar}>
            <AgentPromptInput size="compact" />
          </div>

          <section className={s.agentsSection} aria-labelledby="my-agents-title-active">
            <h2 id="my-agents-title-active" className={s.sectionTitle}>My agents</h2>
            <div className={s.agentGrid}>
              {agents.map((agent) => (
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
          </section>

          <section className={s.templatesQuiet} aria-labelledby="templates-title-active">
            <h2 id="templates-title-active" className={s.templatesQuietTitle}>Templates</h2>
            <div className={s.templateChips}>
              {ROLE_TEMPLATES.map((tpl) => (
                <button key={tpl.id} type="button" className={s.templateChip} title={tpl.description}>
                  {tpl.name}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
