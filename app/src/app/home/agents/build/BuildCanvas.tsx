'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Plus,
  ArrowBendUpLeft,
  ArrowBendUpRight,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowCounterClockwise,
} from '@phosphor-icons/react';
import { nodeTypes } from '../canvas/nodes';
import { NodeEditContext, type CommitEdit, type NodeActions } from '../canvas/NodeEditContext';
import cv from '../canvas/canvas.module.css';
import s from './build.module.css';
import NodePanel from './NodePanel';
import NodePicker from './NodePicker';
import RunProgress from './RunProgress';
import { CATALOG_BY_ID, defaultParams } from '../nodes/catalog';
import type { NodeTypeId } from '../nodes/types';

/* initial graph — mirrors Figma 1265:1104 (positions ported from the demo) */
const initialNodes: Node[] = [
  {
    id: 'trigger',
    type: 'trigger',
    position: { x: 360, y: 60 },
    data: {
      title: 'Every 15 minutes, Mon-Friday, Market Hours',
      desc: 'Trigger the agent every 15 minutes, on Monday to Friday during market hours',
    },
  },
  {
    id: 'getNvda',
    type: 'branch',
    position: { x: 300, y: 330 },
    data: {
      title: 'Get NVDA current & opening price',
      ifLabel: 'daily drop > 5%',
      ifTitle: 'Buy $5,000 NVDA',
      ifSub: 'Market order',
      elseTitle: 'No actions',
      elseSub: 'Position hold',
    },
  },
  {
    id: 'notify',
    type: 'notification',
    position: { x: 360, y: 600 },
    data: {
      title: 'Send email and in-app notifications',
      desc: 'Send Email and in-app notification',
    },
  },
];

const smooth = (id: string, source: string, target: string): Edge =>
  ({ id, source, target, type: 'smoothstep', pathOptions: { borderRadius: 16 } }) as Edge;

const initialEdges: Edge[] = [
  smooth('e-trigger-getNvda', 'trigger', 'getNvda'),
  smooth('e-getNvda-notify', 'getNvda', 'notify'),
];

type Snapshot = { nodes: Node[]; edges: Edge[] };

type FlowProps = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: React.ComponentProps<typeof ReactFlow>['onNodesChange'];
  onEdgesChange: React.ComponentProps<typeof ReactFlow>['onEdgesChange'];
  onConnect: (params: Connection) => void;
  onDragStart: () => void;
  live: boolean;
  hasWorkflow: boolean;
  onSelect: (id: string | null) => void;
  onAddNode: (typeId: NodeTypeId, at?: { x: number; y: number }) => void;
  onOpenChat: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

function Flow(p: FlowProps) {
  const { fitView } = useReactFlow();

  // frame the graph the moment it appears
  useEffect(() => {
    if (p.hasWorkflow) {
      const t = setTimeout(() => fitView({ padding: 0.22, duration: 600 }), 80);
      return () => clearTimeout(t);
    }
  }, [p.hasWorkflow, fitView]);

  return (
    <ReactFlow
      nodes={p.nodes}
      edges={p.edges}
      onNodesChange={p.onNodesChange}
      onEdgesChange={p.onEdgesChange}
      onConnect={p.onConnect}
      onNodeDragStart={p.onDragStart}
      onNodeClick={(_, n) => p.onSelect(n.id)}
      onPaneClick={() => p.onSelect(null)}
      nodeTypes={nodeTypes}
      nodesDraggable={p.live}
      nodesConnectable={p.live}
      elementsSelectable={p.live}
      minZoom={0.3}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
      className={cv.canvas}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="#e3e4e8" />
      {p.live && (
        <BottomToolbar
          onAddNode={p.onAddNode}
          onOpenChat={p.onOpenChat}
          undo={p.undo}
          redo={p.redo}
          canUndo={p.canUndo}
          canRedo={p.canRedo}
        />
      )}
    </ReactFlow>
  );
}

function BottomToolbar({
  onAddNode,
  onOpenChat,
  undo,
  redo,
  canUndo,
  canRedo,
}: {
  onAddNode: (typeId: NodeTypeId, at?: { x: number; y: number }) => void;
  onOpenChat: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  const { zoomIn, zoomOut, screenToFlowPosition } = useReactFlow();
  const [pickerOpen, setPickerOpen] = useState(false);

  // drop the new node at the center of the area that stays visible once the
  // detail panel opens (panel ≈ 404px on the right), so it never lands off-screen
  const addNode = (typeId: NodeTypeId) => {
    const pane = document.querySelector<HTMLElement>('.react-flow');
    if (!pane) return onAddNode(typeId);
    const r = pane.getBoundingClientRect();
    const panelW = 404;
    const cx = r.left + Math.max(160, (r.width - panelW) / 2);
    const cy = r.top + r.height / 2;
    onAddNode(typeId, screenToFlowPosition({ x: cx, y: cy }));
  };

  return (
    <div className={s.toolbar}>
      {pickerOpen && (
        <div className={s.pickerWrap}>
          <NodePicker onPick={addNode} onClose={() => setPickerOpen(false)} />
        </div>
      )}
      <button className={s.tbAsk} onClick={onOpenChat}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/agent-canvas/ask-ai-sparkle.svg" width={16} height={16} alt="" />
        <span className={s.grad}>Ask AI</span>
      </button>
      <button className={`${s.tbAdd} ${pickerOpen ? s.tbAddActive : ''}`} onClick={() => setPickerOpen((o) => !o)}>
        <Plus size={14} weight="bold" />
        Add
      </button>
      <span className={s.tbDiv} />
      <button className={s.tbI} onClick={undo} disabled={!canUndo} aria-label="Undo">
        <ArrowBendUpLeft size={16} />
      </button>
      <button className={s.tbI} onClick={redo} disabled={!canRedo} aria-label="Redo">
        <ArrowBendUpRight size={16} />
      </button>
      <span className={s.tbDiv} />
      <button className={s.tbI} aria-label="Zoom in" onClick={() => zoomIn({ duration: 200 })}>
        <MagnifyingGlassPlus size={16} />
      </button>
      <button className={s.tbI} aria-label="Zoom out" onClick={() => zoomOut({ duration: 200 })}>
        <MagnifyingGlassMinus size={16} />
      </button>
    </div>
  );
}

let addCounter = 0;

export default function BuildCanvas({
  live,
  hasWorkflow,
  onReplay,
  onOpenChat,
  running = false,
  onRunComplete,
}: {
  live: boolean;
  hasWorkflow: boolean;
  onReplay: () => void;
  onOpenChat: () => void;
  running?: boolean;
  onRunComplete?: () => void;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [runVisible, setRunVisible] = useState(false);
  const [, bump] = useState(0); // forces re-render when the history stacks change

  // reveal the run-progress panel the moment a test run starts
  useEffect(() => {
    if (running) setRunVisible(true);
  }, [running]);

  // mirror the latest committed state so history captures pre-change snapshots
  const stateRef = useRef<Snapshot>({ nodes, edges });
  stateRef.current = { nodes, edges };
  const past = useRef<Snapshot[]>([]);
  const future = useRef<Snapshot[]>([]);
  const prevHasWorkflow = useRef(hasWorkflow);

  const record = useCallback(() => {
    past.current.push(stateRef.current);
    if (past.current.length > 60) past.current.shift();
    future.current = [];
    bump((v) => v + 1);
  }, []);

  // populate the workflow when it ghosts in; clear only on reset (replay).
  // user-added nodes on the empty canvas are left untouched.
  useEffect(() => {
    const was = prevHasWorkflow.current;
    prevHasWorkflow.current = hasWorkflow;
    if (hasWorkflow && !was) {
      setNodes(initialNodes);
      setEdges(initialEdges);
      past.current = [];
      future.current = [];
      bump((v) => v + 1);
    } else if (!hasWorkflow && was) {
      setNodes([]);
      setEdges([]);
      past.current = [];
      future.current = [];
      bump((v) => v + 1);
    }
  }, [hasWorkflow, setNodes, setEdges]);

  // close the panel whenever we leave the live (editable) state
  useEffect(() => {
    if (!live) setSelectedId(null);
  }, [live]);

  const onConnect = useCallback(
    (params: Connection) => {
      record();
      setEdges((eds) =>
        addEdge({ ...params, type: 'smoothstep', pathOptions: { borderRadius: 16 } } as unknown as Edge, eds),
      );
    },
    [record, setEdges],
  );

  const onAddNode = useCallback(
    (typeId: NodeTypeId, at?: { x: number; y: number }) => {
      record();
      const def = CATALOG_BY_ID[typeId];
      const id = `node-${++addCounter}`;
      const center = at ?? { x: 360, y: 240 };
      setNodes((nds) => [
        ...nds.map((n) => ({ ...n, selected: false })),
        {
          id,
          type: 'catalog',
          position: { x: center.x - 110, y: center.y - 32 },
          data: { typeId, params: defaultParams(def) },
          selected: true,
        },
      ]);
    },
    [record, setNodes],
  );

  const commitEdit = useCallback<CommitEdit>(
    (id, patch) => {
      record();
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
      );
    },
    [record, setNodes],
  );

  const duplicate = useCallback(
    (id: string) => {
      record();
      setNodes((nds) => {
        const n = nds.find((x) => x.id === id);
        if (!n) return nds;
        return [
          ...nds.map((x) => ({ ...x, selected: false })),
          {
            ...n,
            id: `${id}-copy-${Date.now()}`,
            position: { x: n.position.x + 40, y: n.position.y + 40 },
            selected: true,
          },
        ];
      });
    },
    [record, setNodes],
  );

  const copy = useCallback((id: string) => {
    const n = stateRef.current.nodes.find((x) => x.id === id);
    if (n) navigator.clipboard?.writeText(JSON.stringify(n)).catch(() => {});
  }, []);

  const remove = useCallback(
    (id: string) => {
      record();
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setSelectedId((sel) => (sel === id ? null : sel));
    },
    [record, setNodes, setEdges],
  );

  const nodeActions = useMemo<NodeActions>(
    () => ({ commit: commitEdit, duplicate, copy, remove }),
    [commitEdit, duplicate, copy, remove],
  );

  const undo = useCallback(() => {
    if (!past.current.length) return;
    future.current.push(stateRef.current);
    const prev = past.current.pop()!;
    setNodes(prev.nodes);
    setEdges(prev.edges);
    bump((v) => v + 1);
  }, [setNodes, setEdges]);

  const redo = useCallback(() => {
    if (!future.current.length) return;
    past.current.push(stateRef.current);
    const next = future.current.pop()!;
    setNodes(next.nodes);
    setEdges(next.edges);
    bump((v) => v + 1);
  }, [setNodes, setEdges]);

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

  return (
    <main className={`${s.canvasWrap} ${hasWorkflow && !live ? s.ghost : ''}`}>
      <button className={s.replay} onClick={onReplay}>
        <ArrowCounterClockwise size={14} />
        Replay
      </button>
      {nodes.length === 0 && (
        <div className={s.cvEmpty}>Add a step, or describe your agent in the chat to generate one</div>
      )}
      <NodeEditContext.Provider value={nodeActions}>
        <ReactFlowProvider>
          <Flow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragStart={record}
            live={live}
            hasWorkflow={hasWorkflow}
            onSelect={(id) => setSelectedId(live ? id : null)}
            onAddNode={onAddNode}
            onOpenChat={onOpenChat}
            undo={undo}
            redo={redo}
            canUndo={past.current.length > 0}
            canRedo={future.current.length > 0}
          />
          <NodePanel node={selectedNode} onClose={() => setSelectedId(null)} onUpdate={commitEdit} />
        </ReactFlowProvider>
      </NodeEditContext.Provider>
      {runVisible && (
        <RunProgress
          nodes={nodes}
          running={running}
          onComplete={() => onRunComplete?.()}
          onClose={() => {
            setRunVisible(false);
            onRunComplete?.();
          }}
        />
      )}
    </main>
  );
}
