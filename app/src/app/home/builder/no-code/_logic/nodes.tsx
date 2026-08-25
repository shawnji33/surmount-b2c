'use client';

import { useState } from 'react';

import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { Clock, Plus, X } from '@phosphor-icons/react';
import { ASSET_UNIVERSE } from '../../_data';
import { CHILD_X, COMPARATORS, GROUP_SPAN, SPINE_X, belongsToGroup, createGroup, edge, emptyClause, rootPlusY } from './data';
import { sideLabel } from './ConditionEditor';
import type { ActionData, BranchData, ConditionData, ConditionSide, TriggerData } from './types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import s from './logic.module.css';

/* Node visuals ported from the investing-agent workflow canvas
 * (~/Surmount/investing-agent/src/components/chat-shell/agent-flow-diagram.tsx
 * and its read-only twin agent-detail/workflow-diagram.tsx).
 *
 * Same three shapes: a white card for the trigger, a brand-blue capsule for
 * conditions, a near-black capsule for actions — each with the inset
 * highlight/shade pair that gives the capsules their raised feel. Two
 * departures from the source, both required by Surmount's rules: the IF/ELSE
 * label drops from font-bold to 500 (only 400/500 are allowed anywhere in
 * Surmount UI), and every color comes from a token rather than a literal. */

/* Handles sit a fixed distance from each node's own left edge rather than
 * centered, so the dots on the schedule / IF / ELSE spine land on the same x
 * no matter how wide each pill is. */
function SpineHandle({ type, id }: { type: 'source' | 'target'; id?: string }) {
  return (
    <Handle
      type={type}
      id={id}
      position={type === 'target' ? Position.Top : Position.Bottom}
      className={[s.dot, type === 'target' ? s.dotTop : s.dotBottom].join(' ')}
    />
  );
}

function TickerBadge({ ticker }: { ticker: string }) {
  const asset = ASSET_UNIVERSE.find((a) => a.ticker === ticker);
  return (
    <span className={s.ticker}>
      {asset?.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset.logo} alt="" className={s.tickerLogo} />
      ) : (
        // Most tickers here are ETFs with no logo asset, and a bare colored
        // circle reads as a broken image — fall back to initials, same as the
        // asset rows in the Strategy builder tab.
        <span
          className={[s.tickerLogo, s.tickerFallback].join(' ')}
          style={{ background: asset?.fallbackColor }}
          aria-hidden="true"
        >
          {ticker.slice(0, 2)}
        </span>
      )}
      {ticker}
    </span>
  );
}

export function TriggerNode({ data }: NodeProps) {
  const d = data as unknown as TriggerData;
  return (
    <div className={s.scheduleCard}>
      <span className={s.scheduleLead}>
        <Clock weight="regular" aria-hidden="true" />
        Schedule
      </span>
      <span className={s.scheduleDivider} aria-hidden="true" />
      {/* Unset until the user picks one — the whole canvas starts blank. */}
      <span className={s.scheduleText} data-empty={d.frequency ? undefined : 'true'}>
        {d.frequency ? `Runs every ${d.frequency}` : 'Set a frequency'}
      </span>
      <SpineHandle type="source" />
    </div>
  );
}

/* Figma 2103:85719 — the clause reads as a sentence: the function is emphasised,
 * "of" recedes, and the ticker sits in its own inset chip so the assets are
 * scannable at a glance across a graph of several conditions. */
function SideExpression({ side }: { side: ConditionSide }) {
  if (side.isFixed) {
    return <strong className={s.pillStrong}>{sideLabel(side)}</strong>;
  }
  return (
    <>
      <strong className={s.pillStrong}>{sideLabel(side) ?? 'Choose function'}</strong>
      <span className={s.pillJoin}>of</span>
      <span className={s.pillChip}>{side.ticker || '—'}</span>
    </>
  );
}


/* The condition is a group on the canvas: the leading IF statement, then any
 * number of follow-on statements each introduced by its own and/or connector.
 * The connector is per-clause, so one condition can mix them (A and B or C).
 * Clicking a pill opens the side panel on that clause; "+" picks the connector
 * for the clause it appends. */
export function ConditionNode({ id, data }: NodeProps) {
  const d = data as unknown as ConditionData;
  const { setNodes } = useReactFlow();
  const [addOpen, setAddOpen] = useState(false);

  const patch = (next: Partial<ConditionData>) =>
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...next } } : n)));

  const setJoin = (i: number, join: 'AND' | 'OR') =>
    patch({ clauses: d.clauses.map((c, j) => (j === i ? { ...c, join } : c)) });

  const addClause = (join: 'AND' | 'OR') => {
    patch({ clauses: [...d.clauses, emptyClause(join)], editing: d.clauses.length });
    setAddOpen(false);
  };

  return (
    <div className={s.conditionGroup}>
      {/* Enters from the left (the outer spine comes across), leaves from the
          bottom-left dot that the inner spine drops from. */}
      <Handle type="target" position={Position.Left} id="left" className={[s.dot, s.dotLeft].join(' ')} />

      {/* Clause 0 is the IF pill itself; everything after it hangs off a rail
          drawn under that pill — see .branchRail. */}
      {d.clauses.slice(0, 1).map((clause, i) => {
        const comparator = COMPARATORS.find((c) => c.id === clause.comparator);
        return (
          <div className={s.clauseRow} key={i}>
            <div
              className={s.pill}
              data-active={d.editing === i || undefined}
              /* No stopPropagation — the click must also reach React Flow's
               * onNodeClick, which opens the side panel. */
              onClick={() => patch({ editing: i })}
            >
              <span className={s.pillText}>
                {i === 0 && <span className={s.pillLead}>IF</span>}
                <SideExpression side={clause.left} />
                <span className={s.pillJoin}>is {comparator?.label.toLowerCase()}</span>
                <SideExpression side={clause.right} />
              </span>
              <span className={s.pillInset} aria-hidden="true" />
            </div>

          </div>
        );
      })}


      {/* Two source handles stacked on the exact same point so they read as one
          dot — distinct ids stop React Flow from fanning the two edges apart. */}
      <SpineHandle type="source" id="branch" />
      <SpineHandle type="source" id="continue" />
    </div>
  );
}

export function BranchNode({ data }: NodeProps) {
  const d = data as unknown as BranchData;
  return (
    <div className={[s.pill, s.pillBare].join(' ')}>
      <Handle type="target" position={Position.Top} id="top" className={[s.dot, s.dotTop].join(' ')} />
      <span className={s.pillLabel}>{d.label}</span>
      <span className={s.pillInset} aria-hidden="true" />
      <SpineHandle type="source" id="branch" />
    </div>
  );
}

export function ActionNode({ data }: NodeProps) {
  const d = data as unknown as ActionData;
  return (
    <div className={s.actionPill}>
      <Handle type="target" position={Position.Left} id="left" className={[s.dot, s.dotLeft].join(' ')} />
      {d.holdings.length === 0 ? (
        <span className={s.actionPlaceholder}>Set allocation</span>
      ) : (
        d.holdings.map((h) => (
          <span className={s.holding} key={h.ticker}>
            <TickerBadge ticker={h.ticker} />
            <span className={s.holdingShare}>{Math.round(h.weight * 10) / 10}%</span>
          </span>
        ))
      )}
      <span className={s.pillInset} aria-hidden="true" />
    </div>
  );
}

/* The dashed "add a statement" slot, and the root "+" that closes the outer
 * spine — both are real nodes so React Flow wires them like everything else. */
/* Height one clause row occupies — everything below the insertion point shifts
 * by this much so the spine keeps its rhythm. */
const CLAUSE_H = 72;

export function AddAndOrNode({ id }: NodeProps) {
  const { setNodes, setEdges, getNodes } = useReactFlow();
  const [open, setOpen] = useState(false);
  const group = id.replace('add-andor-', '');

  function addClause(join: 'AND' | 'OR') {
    setOpen(false);
    const nodes = getNodes();
    const self = nodes.find((n) => n.id === id);
    if (!self) return;

    const seq = nodes.filter((n) => n.id.startsWith(`clause-${group}-`)).length;
    const clauseId = `clause-${group}-${seq}`;
    const y = self.position.y;

    setNodes(
      nodes
        // Everything at or below the slot slides down to make room.
        .map((n) => (n.position.y >= y && n.id !== clauseId
          ? { ...n, position: { ...n.position, y: n.position.y + CLAUSE_H } }
          : n))
        .concat({
          id: clauseId,
          type: 'clause',
          position: { x: CHILD_X, y },
          data: { kind: 'condition', join, clauses: [emptyClause(join)] },
        }),
    );

    setEdges((eds) => [
      ...eds,
      edge(`e-${clauseId}`, `condition-${group}`, clauseId, {
        sourceHandle: 'branch',
        targetHandle: 'left',
      }),
    ]);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={s.addClause} aria-label="Add an And/Or statement">
        <Handle type="target" position={Position.Left} id="left" className={[s.dot, s.dotLeft].join(' ')} />
        <Plus weight="bold" />
        And/Or
      </PopoverTrigger>
      <PopoverContent className={s.addMenu}>
        {(['AND', 'OR'] as const).map((j) => (
          <button type="button" key={j} className={s.addMenuItem} onClick={() => addClause(j)}>
            {j === 'AND' ? 'And' : 'Or'}
            <span className={s.addMenuHint}>
              {j === 'AND' ? 'both must be true' : 'either can be true'}
            </span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

/* An added statement: the And/Or chip and its condition pill, joined by a short
 * link. One node rather than two so the pair always moves together. */
export function ClauseNode({ id, data }: NodeProps) {
  const d = data as unknown as ConditionData & { join: 'AND' | 'OR' };
  const { setNodes, setEdges, getNode } = useReactFlow();
  const y = getNode(id)?.position.y ?? 0;
  const clause = d.clauses[0];
  const comparator = COMPARATORS.find((c) => c.id === clause.comparator);

  const flip = () =>
    setNodes((nds) => nds.map((n) => (n.id === id
      ? { ...n, data: { ...n.data, join: d.join === 'AND' ? 'OR' : 'AND' } }
      : n)));

  /* Removing a statement closes the gap it left, so the spine keeps its rhythm. */
  function remove() {
    setNodes((nds) => nds
      .filter((n) => n.id !== id)
      .map((n) => (n.position.y > y ? { ...n, position: { ...n.position, y: n.position.y - CLAUSE_H } } : n)));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }

  return (
    <div className={s.clauseNode}>
      <button
        type="button"
        className={s.joinField}
        onClick={(e) => { e.stopPropagation(); flip(); }}
        aria-label={`Connector: ${d.join}. Click to switch.`}
      >
        <Handle type="target" position={Position.Left} id="left" className={[s.dot, s.dotLeft].join(' ')} />
        {d.join === 'AND' ? 'And' : 'Or'}
      </button>
      <span className={s.railLink} aria-hidden="true" />
      <div className={s.pill}>
        <span className={s.pillText}>
          <SideExpression side={clause.left} />
          <span className={s.pillJoin}>is {comparator?.label.toLowerCase()}</span>
          <SideExpression side={clause.right} />
        </span>
        <span className={s.pillInset} aria-hidden="true" />
      </div>
      <button
        type="button"
        className={s.nodeRemove}
        onClick={(e) => { e.stopPropagation(); remove(); }}
        aria-label="Remove this statement"
      >
        <X weight="bold" />
      </button>
    </div>
  );
}

export function AddRootNode() {
  const { setNodes, setEdges, getNodes } = useReactFlow();

  /* Appends a whole if/else group below the last one and slides the "+" down to
   * sit under it, so the outer spine keeps its shape as the strategy grows. */
  function addGroup() {
    const existing = getNodes().filter((n) => n.type === 'condition').length;
    const group = createGroup(existing);
    setNodes((nds) => [
      ...nds.filter((n) => n.id !== 'add-root'),
      ...group.nodes,
      { id: 'add-root', type: 'addRoot', position: { x: SPINE_X, y: rootPlusY(existing + 1) }, data: {} },
    ]);
    setEdges((eds) => [
      ...eds,
      edge(`e-trigger-condition-${existing}`, 'trigger', `condition-${existing}`, { targetHandle: 'left' }),
      ...group.edges,
    ]);
  }

  return (
    <div className={s.addRoot} onClick={addGroup} role="button" aria-label="Add an if/else group">
      <Handle type="target" position={Position.Left} id="left" className={[s.dot, s.dotLeft].join(' ')} />
      <Plus weight="bold" />
    </div>
  );
}

export function GroupLabelNode({ id, data }: NodeProps) {
  const { index } = data as unknown as { index: number };
  const { setNodes, setEdges, getNodes } = useReactFlow();

  /* The first rule can't be removed — a strategy needs at least one. */
  const removable = getNodes().filter((n) => n.type === 'groupLabel').length > 1 && index > 0;

  function removeGroup() {
    const nodes = getNodes();
    const self = nodes.find((n) => n.id === id);
    if (!self) return;
    const doomed = new Set(nodes.filter((n) => belongsToGroup(n.id, index)).map((n) => n.id));
    // How far the group actually spanned, so what follows closes the real gap
    // rather than a nominal one (clauses may have stretched it).
    const ys = nodes.filter((n) => doomed.has(n.id)).map((n) => n.position.y);
    const span = Math.max(...ys) - Math.min(...ys) + GROUP_SPAN - 260;

    setNodes(nodes
      .filter((n) => !doomed.has(n.id))
      .map((n) => (n.position.y > self.position.y
        ? { ...n, position: { ...n.position, y: n.position.y - span } }
        : n))
      // Relabel what's left so the numbering stays sequential.
      .map((n) => (n.type === 'groupLabel' ? { ...n, data: { ...n.data } } : n))
      .map((n, _i, all) => {
        if (n.type !== 'groupLabel') return n;
        const order = all.filter((x) => x.type === 'groupLabel')
          .sort((a, b) => a.position.y - b.position.y)
          .findIndex((x) => x.id === n.id);
        return { ...n, data: { ...n.data, index: order } };
      }));
    setEdges((eds) => eds.filter((e) => !doomed.has(e.source) && !doomed.has(e.target)));
  }

  return (
    <div className={s.groupLabel}>
      Rule {index + 1}
      {removable && (
        <button
          type="button"
          className={s.groupRemove}
          onClick={(e) => { e.stopPropagation(); removeGroup(); }}
          aria-label={`Remove rule ${index + 1}`}
        >
          <X weight="bold" />
        </button>
      )}
    </div>
  );
}

export const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  branch: BranchNode,
  action: ActionNode,
  addAndOr: AddAndOrNode,
  clause: ClauseNode,
  addRoot: AddRootNode,
  groupLabel: GroupLabelNode,
};
