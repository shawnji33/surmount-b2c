'use client';

import { useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type DefaultEdgeOptions,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes';
import s from './canvas.module.css';

/* ---- initial graph — mirrors Figma 1265:1104 ---- */
const initialNodes: Node[] = [
  {
    id: 'trigger',
    type: 'trigger',
    position: { x: 560, y: 40 },
    data: {
      title: 'Every 15 minutes, Mon-Friday, Market Hours',
      desc: 'Trigger the agent every 15 minutes, on Monday to Friday during market hours',
    },
  },
  {
    id: 'getNvda',
    type: 'branch',
    position: { x: 420, y: 300 },
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
    position: { x: 560, y: 560 },
    data: {
      title: 'Send email and in-app notifications',
      desc: 'Send Email and in-app notification',
    },
  },
];

const smooth = (id: string, source: string, target: string): Edge =>
  ({
    id,
    source,
    target,
    type: 'smoothstep',
    pathOptions: { borderRadius: 16 },
  }) as Edge;

const initialEdges: Edge[] = [
  smooth('e-trigger-getNvda', 'trigger', 'getNvda'),
  smooth('e-getNvda-notify', 'getNvda', 'notify'),
];

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: 'smoothstep',
};

let addCounter = 0;

function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, type: 'smoothstep', pathOptions: { borderRadius: 16 } } as unknown as Edge, eds),
      ),
    [setEdges],
  );

  const addNode = useCallback(() => {
    const id = `node-${++addCounter}`;
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: 'trigger',
        position: { x: 120, y: 120 + addCounter * 40 },
        data: { title: 'New step', desc: 'Drag a handle to connect this into the workflow' },
      },
    ]);
  }, [setNodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      fitView
      fitViewOptions={{ padding: 0.25 }}
      minZoom={0.3}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
      className={s.canvas}
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1.5} color="#e3e4e8" />
      <Controls showInteractive={false} />
      <MiniMap pannable zoomable nodeColor="#e9e9eb" maskColor="rgba(10,13,18,0.04)" />
      <Toolbar onAdd={addNode} />
    </ReactFlow>
  );
}

function Toolbar({ onAdd }: { onAdd: () => void }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 22,
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.09)',
        boxShadow: '0 4px 16px rgba(10,13,18,0.08)',
        borderRadius: 12,
        padding: 7,
        zIndex: 10,
        fontFamily: 'Geist, sans-serif',
        letterSpacing: '-0.5px',
      }}
    >
      <button
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, height: 36, padding: '0 14px',
          border: '1px solid #7c4dff', color: '#7c4dff', borderRadius: 9, fontSize: 12,
          fontWeight: 500, background: '#fff', cursor: 'pointer',
        }}
      >
        ✦ Ask AI
      </button>
      <button
        onClick={onAdd}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, height: 36, padding: '0 15px',
          background: '#181d27', color: '#fff', borderRadius: 9, fontSize: 12,
          fontWeight: 500, border: 'none', cursor: 'pointer',
        }}
      >
        + Add
      </button>
    </div>
  );
}

export default function CanvasPage() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fff' }}>
      <ReactFlowProvider>
        <Canvas />
      </ReactFlowProvider>
    </div>
  );
}
