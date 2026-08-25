'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CATALOG_BY_ID } from '../nodes/catalog';
import type { NodeTypeId, ParamValue } from '../nodes/types';
import s from './canvas.module.css';
import { NodeMenu } from './NodeMenu';

/* Generic, catalog-driven node card. Same clean shell as the trigger/
   notification cards — bordered icon box + title + kebab + description.
   No category color strip (kept simple per design). */
export function CatalogNode({ id, data }: NodeProps) {
  const d = data as { typeId: NodeTypeId; params?: Record<string, ParamValue> };
  const def = CATALOG_BY_ID[d.typeId];
  if (!def) return null;
  const Icon = def.icon;

  const setValues = def.paramSchema
    .map((f) => d.params?.[f.key])
    .filter((v) => v !== undefined && v !== null && v !== '');
  const summary = setValues.length ? setValues.slice(0, 2).join(' · ') : def.description;

  const isTrigger = def.category === 'trigger';

  return (
    <div className={s.wcard} style={{ width: 300 }}>
      <div className={s.wcHead}>
        <span className={s.wcIc} style={{ color: 'var(--color-fg-secondary-700)' }}>
          <Icon size={16} />
        </span>
        <span className={s.wcT}>{def.label}</span>
        <NodeMenu id={id} />
      </div>
      <div className={s.wcD}>{summary}</div>
      {!isTrigger && <Handle type="target" position={Position.Left} className={s.handle} />}
      <Handle type="source" position={Position.Right} className={s.handle} />
    </div>
  );
}
