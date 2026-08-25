'use client';

import { useCallback, useRef, useState } from 'react';
import type { NodeInstance, ParamValue } from '../nodes/types';
import { CARD_ROWS, type CardRow, formatValue } from './agentModel';

export interface NLResult {
  rowId: string;
  label: string;
  formatted: string;
}

/* Both edit paths — direct token edits and natural-language messages — write
   the same Agent.nodes[].params through this reducer. */
export function useAgentEdits(initial: NodeInstance[]) {
  const [nodes, setNodes] = useState<NodeInstance[]>(initial);
  // the row that most recently changed → drives the highlight + number-roll
  const [changed, setChanged] = useState<string | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flagChanged = useCallback((rowId: string) => {
    setChanged(rowId);
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => setChanged(null), 900);
  }, []);

  const setParam = useCallback(
    (nodeId: string, key: string, value: ParamValue, rowId?: string) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, params: { ...n.params, [key]: value } } : n)),
      );
      if (rowId) flagChanged(rowId);
    },
    [flagChanged],
  );

  const setByRow = useCallback(
    (row: CardRow, value: ParamValue) => setParam(row.nodeId, row.key, value, row.id),
    [setParam],
  );

  /* heuristic NL parser for the demo — maps a freeform message onto a card row. */
  const applyNL = useCallback(
    (text: string): NLResult | null => {
      const t = text.toLowerCase();
      const money = (m: string) => Number(m.replace(/[$,\s]/g, ''));
      let target: { row: CardRow; value: ParamValue } | null = null;

      const find = (id: string) => CARD_ROWS.find((r) => r.id === id)!;
      const dollar = /\$?\s?([\d,]+(?:\.\d+)?)/;

      if (/\bcap\b|weekly limit|per week|deploy/.test(t)) {
        const m = t.match(dollar);
        if (m) target = { row: find('cap'), value: money(m[1]) };
      } else if (/buy|amount|invest|order size|each (dip|time)/.test(t)) {
        const m = t.match(dollar);
        if (m) target = { row: find('buy'), value: money(m[1]) };
      } else if (/drop|dip|fall|down/.test(t)) {
        const m = t.match(/([\d.]+)\s*%/);
        if (m) target = { row: find('drop'), value: Number(m[1]) };
      } else if (/push|notif|alert|text|sms/.test(t)) {
        const both = /email/.test(t);
        target = { row: find('notify'), value: both ? 'Email + Push' : 'Push' };
      } else if (/email/.test(t)) {
        target = { row: find('notify'), value: 'Email' };
      } else if (/market hours|extended|24\/7|after hours/.test(t)) {
        const v = /extended|after hours/.test(t) ? 'Extended hours' : /24\/7/.test(t) ? '24/7' : 'Market hours';
        target = { row: find('window'), value: v };
      } else if (/limit order|market order|stop order/.test(t)) {
        const v = /limit/.test(t) ? 'Limit' : /stop/.test(t) ? 'Stop' : 'Market';
        target = { row: find('orderType'), value: v };
      }

      if (!target) return null;
      setByRow(target.row, target.value);
      return {
        rowId: target.row.id,
        label: target.row.label,
        formatted: formatValue(target.row, target.value),
      };
    },
    [setByRow],
  );

  return { nodes, changed, setByRow, applyNL };
}
