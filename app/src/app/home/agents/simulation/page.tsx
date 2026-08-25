'use client';

import { useState } from 'react';
import { CaretLeft, CaretDown, ArrowRight, ArrowSquareOut, Info } from '@phosphor-icons/react';
import { DEMO_AGENT, CARD_ROWS, summarize } from '../cards/agentModel';
import { useAgentEdits } from '../cards/useAgentEdits';
import { ValueToken } from '../cards/ValueToken';
import { ActivationGate } from '../cards/ActivationGate';
import { useSimulation } from './useSimulation';
import { RollNumber } from './RollNumber';
import { SimChart } from './SimChart';
import { WINDOW_LABEL, type SimWindow } from './simulation';
import s from './simulation.module.css';

const WINDOWS: SimWindow[] = ['3M', '6M', '1Y'];

const fmtMoney = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
const fmtInt = (n: number) => `${Math.round(n)}`;

export default function SimulationPage() {
  const { nodes, changed, setByRow } = useAgentEdits(DEMO_AGENT.nodes);
  const [win, setWin] = useState<SimWindow>('3M');
  const { result, loading } = useSimulation(nodes, win);
  const [editing, setEditing] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [activated, setActivated] = useState(false);

  const summaryRows = CARD_ROWS.filter((r) => !r.detail);
  const triggered = result && result.triggerCount > 0;

  return (
    <div className={s.app}>
      <header className={s.bar}>
        <button className={s.back} aria-label="Back">
          <CaretLeft size={18} />
        </button>
        <div className={s.ttl}>
          <span>{DEMO_AGENT.name}</span>
          <CaretDown className={s.cr} size={14} />
        </div>
        <span className={s.sp} />
        {activated ? (
          <span className={s.statusActive}>
            <span className={s.statusDot} />
            Active
          </span>
        ) : (
          <span className={s.statusHint}>Draft</span>
        )}
      </header>

      <div className={s.scroll}>
        <div className={s.inner}>
          {/* ── outcome hero ── */}
          <div className={s.eyebrow}>If this agent had been running…</div>
          <h1 className={s.headline}>
            {triggered ? (
              <>
                it would have triggered <strong>{result!.triggerCount}</strong>{' '}
                {result!.triggerCount === 1 ? 'time' : 'times'} in {WINDOW_LABEL[win]}.
              </>
            ) : (
              <>it wouldn&apos;t have triggered in {WINDOW_LABEL[win]}.</>
            )}
          </h1>

          <div className={`${s.stats} ${loading ? s.statsLoading : ''}`}>
            <StatCard label="Invested" value={result?.totalInvested ?? 0} format={fmtMoney} />
            <StatCard
              label="Est. return"
              value={result?.estReturn ?? 0}
              format={fmtPct}
              tone={(result?.estReturn ?? 0) >= 0 ? 'pos' : 'neg'}
            />
            <StatCard label={result?.triggerCount === 1 ? 'Buy' : 'Buys'} value={result?.triggerCount ?? 0} format={fmtInt} />
          </div>

          <SimChart result={result} loading={loading} />

          <div className={s.chartFoot}>
            <div className={s.windowToggle}>
              {WINDOWS.map((wv) => (
                <button
                  key={wv}
                  className={`${s.winBtn} ${win === wv ? s.winBtnOn : ''}`}
                  onClick={() => setWin(wv)}
                >
                  {wv}
                </button>
              ))}
            </div>
            {result?.isMock && <span className={s.mockBadge}>Illustrative estimate</span>}
          </div>

          <div className={s.disclaimer}>
            <Info size={14} />
            <span>
              Hypothetical, simulated performance over a modeled price path — not a prediction or a
              guarantee, and not investment advice. Past or simulated results don&apos;t indicate future
              returns.
            </span>
          </div>

          {/* ── secondary logic strip ── */}
          <div className={s.strip}>
            <button className={s.stripHead} onClick={() => setEditing((v) => !v)}>
              <span className={s.stripLabel}>Strategy</span>
              <span className={s.stripSummary}>{summarize(nodes)}</span>
              <span className={s.stripEdit}>
                {editing ? 'Done' : 'Edit logic'}
                <CaretDown size={14} className={`${s.stripChevron} ${editing ? s.stripChevronOpen : ''}`} />
              </span>
            </button>
            <div className={`${s.collapse} ${editing ? s.collapseOpen : ''}`}>
              <div>
                <div className={s.stripRows}>
                  {summaryRows.map((row) => (
                    <div className={s.stripRow} key={row.id}>
                      <span className={s.stripRowLabel}>{row.label}</span>
                      <span className={s.stripDots} />
                      <ValueToken
                        row={row}
                        value={nodes.find((n) => n.id === row.nodeId)?.params[row.key] ?? null}
                        changed={changed === row.id}
                        readOnly={activated}
                        onCommit={(v) => setByRow(row, v)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── activation ── */}
          <div className={s.foot}>
            {activated ? (
              <span className={s.footActive}>Running — you&apos;ll be notified on the first fill.</span>
            ) : (
              <button className={s.activate} onClick={() => setGateOpen(true)}>
                Review &amp; activate
                <ArrowRight size={15} weight="bold" />
              </button>
            )}
            <a className={s.fullView} href="/home/agents/cards">
              <ArrowSquareOut size={14} />
              Edit full strategy
            </a>
          </div>
        </div>
      </div>

      <ActivationGate
        open={gateOpen}
        agentName={DEMO_AGENT.name}
        nodes={nodes}
        onClose={() => setGateOpen(false)}
        onConfirm={() => {
          setGateOpen(false);
          setActivated(true);
        }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  format,
  tone,
}: {
  label: string;
  value: number;
  format: (n: number) => string;
  tone?: 'pos' | 'neg';
}) {
  return (
    <div className={s.stat}>
      <div className={`${s.statVal} ${tone === 'pos' ? s.statPos : tone === 'neg' ? s.statNeg : ''}`}>
        <RollNumber value={value} format={format} />
      </div>
      <div className={s.statLabel}>{label}</div>
    </div>
  );
}
