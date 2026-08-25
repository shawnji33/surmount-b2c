'use client';

import { CaretDown, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { useState } from 'react';
import type { ActivityRun } from '../_data';
import s from '../page.module.css';

const VISIBLE_GROUPS = 2;

export function ActivityDetails({ runs }: { runs: ActivityRun[] }) {
  const [expanded, setExpanded] = useState(false);
  const visibleRuns = expanded ? runs : runs.slice(0, VISIBLE_GROUPS);

  return (
    <div className={s.activitySectionOuter}>
      <div className={s.activitySectionHeaderRow}>
        <span className={s.activitySectionTitle}>Details</span>
      </div>

      <div className={s.activityWhiteCard}>
        {runs.length === 0 ? (
          <p className={s.activityEmptyState}>No activity yet</p>
        ) : (
          <>
            {visibleRuns.map((run, ri) => (
              <div key={ri} className={s.detailsGroup}>
                <span className={s.detailsGroupLabel}>{run.label}</span>
                <div className={s.detailsList}>
                  {run.items.map((item, ii) => (
                    <div
                      key={item.id}
                      className={[s.detailsRow, ii < run.items.length - 1 ? s.detailsRowDivider : ''].filter(Boolean).join(' ')}
                    >
                      {item.status === 'success' ? (
                        <CheckCircle size={14} weight="regular" color="var(--color-utility-success-600, #3b7e3f)" className={s.detailsIcon} />
                      ) : (
                        <WarningCircle size={14} weight="regular" color="#de5b18" className={s.detailsIcon} />
                      )}
                      <span className={s.detailsRowMain}>
                        <span className={s.detailsTitle}>{item.title}</span>
                        {item.tooltip && <span className={s.detailsMeta}>{item.tooltip}</span>}
                      </span>
                      <span className={s.detailsTime}>{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {runs.length > VISIBLE_GROUPS && (
              <button type="button" className={s.detailsShowMore} onClick={() => setExpanded((e) => !e)}>
                {expanded ? 'Show less' : 'Show more'}
                <CaretDown
                  size={14}
                  weight="bold"
                  className={[s.detailsShowMoreCaret, expanded ? s.detailsShowMoreCaretOpen : ''].filter(Boolean).join(' ')}
                />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
