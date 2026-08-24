'use client';

import Link from 'next/link';
import { CaretRight } from '@phosphor-icons/react';
import { AgentPromptInput } from '../_components/AgentPromptInput';
import { MOCK_AGENTS, agentStatusLine } from '../_data';
import s from './page.module.css';

// VARIANT A — Chat-first minimal
// Hierarchy decision under test: how far can "My Agents" and templates be demoted before the
// screen stops feeling useful to a returning user? My Agents collapses to a single-line status
// ticker (no cards, no shadows); templates drop to one plain text link. Everything else is
// whitespace around the input — the "empty canvas, just ask" extreme of the range.
export default function AgentHomeVariantA() {
  return (
    <main className={s.shell}>
      <div className={s.hero}>
        <span className={s.eyebrow}>Investing agents</span>
        <AgentPromptInput size="hero" />
      </div>

      {/* My Agents — demoted to a thin status ticker, not cards. */}
      <div className={s.ticker} aria-label="My agents">
        {MOCK_AGENTS.length === 0 ? (
          <span className={s.tickerEmpty}>No agents running yet — ask above to create one.</span>
        ) : (
          MOCK_AGENTS.map((agent, i) => (
            <span key={agent.id} className={s.tickerItem}>
              {i > 0 && <span className={s.tickerDivider} aria-hidden="true" />}
              <span className={s.tickerDot} data-kind={agent.condition.kind} aria-hidden="true" />
              <span className={s.tickerName}>{agent.name}</span>
              <span className={s.tickerStatus}>{agentStatusLine(agent.condition)}</span>
            </span>
          ))
        )}
      </div>

      {/* Templates — barely present: a single text link, not a visual row. */}
      <Link href="#" className={s.templatesLink}>
        Browse agent templates
        <CaretRight weight="regular" aria-hidden="true" />
      </Link>
    </main>
  );
}
