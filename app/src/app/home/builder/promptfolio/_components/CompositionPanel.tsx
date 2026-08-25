'use client';

import { useState } from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Donut } from '../../_shared/_build/Donut';
import type { PromptfolioDraft } from '../_data';
import { DraftHoldingRow } from './DraftHoldingRow';
import { RuleSummaryList } from './RuleSummaryList';
import s from './CompositionPanel.module.css';

const STEP_LABELS = ['Name & description', 'Holdings', 'Rules', 'Ready'];

export function CompositionPanel({
  draft,
  revealStage,
  onContinue,
}: {
  draft: PromptfolioDraft | null;
  revealStage: number;
  onContinue: () => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const revealed = revealStage >= 1 && draft !== null;
  const totalWeight = draft ? draft.rows.reduce((sum, r) => sum + r.weight, 0) : 0;
  const complete = revealStage >= 4;

  return (
    <aside className={s.root} aria-label="Draft strategy">
      <div className={[s.tSkel, revealed ? s.isRevealed : ''].filter(Boolean).join(' ')}>
        <div className={s.tSkelSkeleton} aria-hidden="true">
          <div className={s.skelLine} style={{ width: '55%', height: 22 }} />
          <div className={s.skelLine} style={{ width: '85%', height: 14, marginTop: 8 }} />
          <div className={s.skelDonut} />
          <div className={s.skelRow} />
          <div className={s.skelRow} />
          <div className={s.skelRow} />
        </div>

        <div className={s.tSkelContent}>
          {draft && (
            <>
              <header className={s.header}>
                <h2 className={s.name}>{draft.name}</h2>
                <p className={s.description}>{draft.description}</p>
              </header>

              <div className={[s.section, revealStage >= 2 ? s.sectionVisible : ''].filter(Boolean).join(' ')}>
                <div className={s.chartRow}>
                  <Donut rows={draft.rows} totalWeight={totalWeight} hovered={hovered} onHover={setHovered} />
                </div>

                <div className={s.holdingsList}>
                  {revealStage >= 2 &&
                    draft.rows.map((row, i) => (
                      <DraftHoldingRow key={row.ticker} row={row} index={i} style={{ animationDelay: `${i * 80}ms` }} />
                    ))}
                </div>
              </div>

              <div className={[s.section, revealStage >= 3 ? s.sectionVisible : ''].filter(Boolean).join(' ')}>
                <h3 className={s.sectionTitle}>Custom rules</h3>
                <RuleSummaryList rules={draft.rules} />
              </div>

              <div className={s.footer}>
                <ol className={s.progress} aria-label="Draft progress">
                  {STEP_LABELS.map((label, i) => (
                    <li key={label} className={revealStage >= i + 1 ? s.progressDone : ''}>
                      <span className={s.progressDot} aria-hidden="true" />
                      {label}
                    </li>
                  ))}
                </ol>

                <Button type="button" size="lg" disabled={!complete} onClick={onContinue} className={s.continueBtn}>
                  {complete ? 'Continue to builder' : 'Drafting your strategy…'}
                  {complete && <ArrowRight weight="bold" />}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
