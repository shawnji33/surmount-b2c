'use client';

import { createContext, useContext } from 'react';

/* Node-level actions provided by the build flow (history-aware). When absent
   (e.g. the standalone /canvas route), nodes fall back to React Flow directly. */
export type NodeActions = {
  commit: (id: string, patch: Record<string, unknown>) => void;
  duplicate: (id: string) => void;
  copy: (id: string) => void;
  remove: (id: string) => void;
};

export type CommitEdit = NodeActions['commit'];

export const NodeEditContext = createContext<NodeActions | null>(null);

export const useNodeEdit = () => useContext(NodeEditContext);
