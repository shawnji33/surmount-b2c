import type { Icon } from '@phosphor-icons/react';

/* §1 — core data model (the catalog is the contract) */

export type NodeCategory = 'trigger' | 'data' | 'logic' | 'action' | 'notify';
export type ParamValue = string | number | boolean | null;

export type FieldType =
  | 'select'
  | 'text'
  | 'number'
  | 'asset-search'
  | 'account-picker'
  | 'time'
  | 'toggle';

export interface ParamField {
  key: string;
  label: string;
  type: FieldType;
  section?: string; // labeled group in the inspector
  helper?: string; // contextual ⓘ help under the control
  options?: string[];
  affix?: '$' | '%';
  default?: ParamValue;
  required?: boolean;
  placeholder?: string;
  /** show this field only when another param equals a value (e.g. limitPrice when orderType=Limit) */
  showWhen?: { key: string; equals: ParamValue };
  /** mark an option disabled / "coming soon" */
  comingSoon?: string[];
}

export interface NodeOutput {
  ref: string; // bare field; rendered downstream as `<nodeId>.<ref>`
  label: string;
  type: 'number' | 'boolean' | 'timestamp' | 'string';
}

export type NodeTypeId =
  | 'trigger.schedule'
  | 'trigger.marketEvent'
  | 'trigger.orderFill'
  | 'data.priceFeed'
  | 'data.indicator'
  | 'data.account'
  | 'logic.condition'
  | 'logic.calculate'
  | 'logic.boundary'
  | 'action.trade'
  | 'action.moveCash'
  | 'action.options'
  | 'notify.alert'
  | 'notify.log';

export interface NodeTypeDef {
  id: NodeTypeId;
  category: NodeCategory;
  label: string;
  description: string;
  icon: Icon; // Phosphor icon component
  paramSchema: ParamField[];
  outputs: NodeOutput[];
  v1: boolean; // false → behind FEATURE flag / "coming soon"
  branching?: boolean; // condition + boundary (two outgoing paths)
}

export interface NodeInstance {
  id: string;
  type: NodeTypeId;
  category: NodeCategory;
  params: Record<string, ParamValue>;
  next?: string | null;
  branches?: { then: string | null; else: string | null };
  runState?: 'scheduled' | 'running' | 'done' | 'skipped' | 'failed';
}

export type SkillArea = string;
export interface ScheduleSpec {
  frequency: string;
  time?: string;
}
export interface Agent {
  id: string;
  name: string;
  description: string;
  skillTag: SkillArea;
  status: 'draft' | 'active' | 'paused';
  nodes: NodeInstance[];
  entryNodeId: string;
  brokerageConnectionId: string | null;
  schedule?: ScheduleSpec;
  createdAt: string;
  activatedAt?: string;
}

/* category → semantic color, mapped to Surmount design-system tokens.
   (purple / brand-blue / yellow-amber / success-green / fg-gray — the DS has
   no teal family, so "Action" uses the success/green ramp.) */
export const CATEGORY_META: Record<
  NodeCategory,
  { label: string; color: string; bg: string }
> = {
  trigger: { label: 'Triggers', color: 'var(--color-purple-600)', bg: 'var(--color-purple-100)' },
  data: { label: 'Data', color: 'var(--color-brand-600)', bg: 'var(--color-brand-100)' },
  logic: { label: 'Logic', color: 'var(--color-yellow-700)', bg: 'var(--color-yellow-100)' },
  action: { label: 'Actions', color: 'var(--color-success-700)', bg: 'var(--color-success-100)' },
  notify: { label: 'Notify', color: 'var(--color-fg-tertiary-600)', bg: 'var(--color-bg-tertiary)' },
};

export const CATEGORY_ORDER: NodeCategory[] = ['trigger', 'data', 'logic', 'action', 'notify'];
