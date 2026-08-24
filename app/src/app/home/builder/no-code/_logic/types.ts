/* Figma 2103:85402 specifies the six mathematical comparisons. The previous
 * crossAbove/crossBelow (technical-analysis crossovers) aren't in that list and
 * were dropped with it. */
export type Comparator = 'gt' | 'lt' | 'eq' | 'neq' | 'gte' | 'lte';

export type ConditionSide = {
  functionId: string;
  ticker: string;
  /* Only set for parameterised indicators (Cumulative Return's lookback). Kept
   * on the side rather than the indicator so the two sides of a condition can
   * use the same function with different windows. */
  window?: number | null;
  /* Right-hand side only: compare against a literal percentage instead of a
   * function of an asset. When true, functionId/ticker are ignored. */
  isFixed?: boolean;
  fixedValue?: number | null;
};

export type TriggerData = {
  kind: 'trigger';
  frequency: string;
};

/* One comparison. A condition is a list of these; each carries the connector
 * that ties it to the clause before it, so a single condition can mix AND and
 * OR (A and B or C) rather than being governed by one global join. */
export type ConditionClause = {
  left: ConditionSide;
  comparator: Comparator;
  right: ConditionSide;
  /* Undefined on the first clause — that one is always the leading IF. */
  join?: 'AND' | 'OR';
};

export type ConditionData = {
  kind: 'condition';
  clauses: ConditionClause[];
  /* Which clause the side panel is editing — set by clicking a pill on the
   * canvas. */
  editing?: number;
};

/* One leg of an allocation: an asset picked on the Strategy builder tab, and
 * the share of the branch's capital that goes to it. */
export type Holding = {
  ticker: string;
  weight: number;
};

export type ActionData = {
  kind: 'action';
  label: string;
  holdings: Holding[];
};

/* The ELSE pill is its own node rather than a second outlet on the condition.
 * That's what lets the graph read as one vertical spine — condition branches
 * right to its action, then continues down into ELSE, which branches right to
 * its own action. It carries no editable state, so it has no panel. */
export type BranchData = {
  kind: 'branch';
  label: string;
};

export type LogicNodeData = TriggerData | ConditionData | ActionData | BranchData;
