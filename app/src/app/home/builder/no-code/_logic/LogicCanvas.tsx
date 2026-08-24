'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
  type DefaultEdgeOptions,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes';
import { LogicPanel } from './LogicPanel';
import { INITIAL_NODES, INITIAL_EDGES } from './data';
import s from './logic.module.css';

/* Mirrors --panel-close-dur in logic.module.css — the panel must stay mounted
 * at least this long for its exit transition to be seen. */
const PANEL_CLOSE_MS = 350;

const EDITABLE_NODES = new Set(['trigger', 'condition', 'action', 'clause']);

/* No markerEnd: connectors terminate in the dot on each node's handle, not an
 * arrowhead — an arrow on top of the dot reads as two terminals. */
const defaultEdgeOptions: DefaultEdgeOptions = {
  type: 'smoothstep',
};

function CanvasInner({ selectedAssets }: { selectedAssets: string[] }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(INITIAL_EDGES);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({
        ...params,
        ...defaultEdgeOptions,
      } as unknown as Edge, eds)),
    [setEdges],
  );

  const updateNodeData = useCallback((id: string, patch: Record<string, unknown>) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));
  }, [setNodes]);

  /* The panel is kept mounted for the length of its close transition so it can
   * animate out instead of vanishing — `selectedId` drives the open state,
   * `panelId` drives what's rendered. Keyed on the id, not the node object,
   * which changes identity on every edit and would restart the timer. */
  const [panelId, setPanelId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (selectedId) {
      setPanelId(selectedId);
      /* Flip open on a later frame. The wrapper mounts in the same commit, so
       * setting data-open="true" immediately gives the browser no closed state
       * to start from and the enter transition is skipped entirely — only the
       * exit would animate. Two frames: one for the closed state to paint, one
       * to change it. */
      let second = 0;
      const first = window.requestAnimationFrame(() => {
        second = window.requestAnimationFrame(() => setPanelOpen(true));
      });
      return () => {
        window.cancelAnimationFrame(first);
        window.cancelAnimationFrame(second);
      };
    }
    setPanelOpen(false);
    const t = window.setTimeout(() => setPanelId(null), PANEL_CLOSE_MS);
    return () => window.clearTimeout(t);
  }, [selectedId]);

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;
  const panelNode = nodes.find((n) => n.id === panelId) ?? null;
  const { fitView } = useReactFlow();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      // maxZoom must match the initial fitViewOptions — without it this re-fit
      // scales a small graph well past 1:1 and every pill renders oversized.
      fitView({ padding: selectedNode ? 0.2 : 0.24, maxZoom: 1, duration: 220 });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [fitView, selectedNode]);

  return (
    <div className={[s.workspace, selectedId ? s.workspaceWithPanel : ''].filter(Boolean).join(' ')}>
      <div className={s.canvasWrap}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          /* Only the node types the panel can actually edit open it. ELSE, the
           * dashed And/Or slot and the root "+" carry no editable state, and
           * selecting them rendered an empty panel. */
          onNodeClick={(_, node) =>
            setSelectedId(EDITABLE_NODES.has(node.type ?? '') ? node.id : null)
          }
          nodesDraggable={false}
          onPaneClick={() => setSelectedId(null)}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          fitViewOptions={{ padding: 0.24, maxZoom: 1 }}
          minZoom={0.5}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          className={s.canvas}
        >
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      {panelNode && (
        <div className={s.panelSlide} data-open={panelOpen ? 'true' : 'false'}>
          <LogicPanel
            node={panelNode}
            onChange={(patch) => updateNodeData(panelNode.id, patch)}
            onClose={() => setSelectedId(null)}
            selectedAssets={selectedAssets}
          />
        </div>
      )}
    </div>
  );
}

export function LogicCanvas({ selectedAssets }: { selectedAssets: string[] }) {
  return (
    <ReactFlowProvider>
      <CanvasInner selectedAssets={selectedAssets} />
    </ReactFlowProvider>
  );
}
