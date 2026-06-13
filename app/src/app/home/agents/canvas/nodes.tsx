'use client';

import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import s from './canvas.module.css';
import { EditableText } from './EditableText';
import { useNodeEdit } from './NodeEditContext';
import { NodeMenu } from './NodeMenu';
import { CatalogNode } from './CatalogNode';

/* Commit a node-data edit through the history-aware context if present,
   otherwise straight to React Flow. */
function useCommit(id: string) {
  const actions = useNodeEdit();
  const { updateNodeData } = useReactFlow();
  return (patch: Record<string, unknown>) =>
    actions ? actions.commit(id, patch) : updateNodeData(id, patch);
}

/* Shared handle styling lives in canvas.module.css (.handle). React Flow
   positions handles; we only theme them to match the Figma square ports. */
function Port({ type, position, id }: { type: 'source' | 'target'; position: Position; id?: string }) {
  return <Handle type={type} position={position} id={id} className={s.handle} />;
}

/* ---- Trigger node — Figma 1265:1288 (white card) ---- */
export function TriggerNode({ id, data }: NodeProps) {
  const d = data as { title: string; desc?: string };
  const commit = useCommit(id);
  return (
    <div className={s.wcard} style={{ width: 355 }}>
      <div className={s.wcHead}>
        <span className={s.wcIc}>
          <img src="/agent-canvas/icon-trigger.svg" alt="" />
        </span>
        <span className={s.wcT}>
          <EditableText value={d.title} onCommit={(v) => commit({ title: v })} />
        </span>
        <NodeMenu id={id} />
      </div>
      {d.desc !== undefined && (
        <div className={s.wcD}>
          <EditableText
            value={d.desc}
            multiline
            placeholder="Add a description"
            onCommit={(v) => commit({ desc: v })}
          />
        </div>
      )}
      <Port type="source" position={Position.Right} />
    </div>
  );
}

/* ---- Branch node — Figma 1265:1233 (gray IF / Else card) ---- */
export function BranchNode({ id, data }: NodeProps) {
  const d = data as {
    title: string;
    ifLabel: string;
    ifTitle: string;
    ifSub: string;
    elseTitle: string;
    elseSub: string;
  };
  const commit = useCommit(id);
  return (
    <div className={s.gcard}>
      <div className={s.gcTitle}>
        <span className={s.gcIc}>
          <img src="/agent-canvas/nvidia.png" alt="" />
        </span>
        <span className={s.gcT}>
          <EditableText value={d.title} onCommit={(v) => commit({ title: v })} />
        </span>
        <NodeMenu id={id} />
      </div>
      <div className={s.gcBranches}>
        <div className={s.branchw}>
          <span className={`${s.bwPill} ${s.bwIf}`}>
            <span className={s.bwK}>IF</span>
            <span className={s.bwV}>{d.ifLabel}</span>
          </span>
          <div>
            <div className={s.bwT}>{d.ifTitle}</div>
            <div className={s.bwS}>{d.ifSub}</div>
          </div>
        </div>
        <div className={`${s.branchw} ${s.branchFill}`}>
          <span className={`${s.bwPill} ${s.bwElse}`}>
            <span className={s.bwKElse}>Else</span>
          </span>
          <div>
            <div className={s.bwT}>{d.elseTitle}</div>
            <div className={s.bwS}>{d.elseSub}</div>
          </div>
        </div>
      </div>
      <Port type="target" position={Position.Left} />
      <Port type="source" position={Position.Right} />
    </div>
  );
}

/* ---- Notification node — Figma 1265:1299 (white card) ---- */
export function NotificationNode({ id, data }: NodeProps) {
  const d = data as { title: string; desc?: string };
  const commit = useCommit(id);
  return (
    <div className={s.wcard} style={{ width: 355 }}>
      <div className={s.wcHead}>
        <span className={s.wcIc}>
          <img src="/agent-canvas/icon-bell.svg" alt="" />
        </span>
        <span className={s.wcT}>
          <EditableText value={d.title} onCommit={(v) => commit({ title: v })} />
        </span>
        <NodeMenu id={id} />
      </div>
      {d.desc !== undefined && (
        <div className={s.wcD}>
          <EditableText
            value={d.desc}
            multiline
            placeholder="Add a description"
            onCommit={(v) => commit({ desc: v })}
          />
        </div>
      )}
      <Port type="target" position={Position.Left} />
    </div>
  );
}

export const nodeTypes = {
  trigger: TriggerNode,
  branch: BranchNode,
  notification: NotificationNode,
  catalog: CatalogNode,
};
