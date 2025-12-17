import { create } from 'zustand';
import type { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect, applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [
    {
      id: '1',
      type: 'trigger',
      data: { label: 'Webhook Trigger' },
      position: { x: 250, y: 50 },
    },
  ],
  edges: [],
  onNodesChange: (changes) => {
    set({
      nodes: (window as any).RF?.applyNodeChanges(changes, get().nodes) || get().nodes,
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: (window as any).RF?.applyEdgeChanges(changes, get().edges) || get().edges,
    });
  },
  onConnect: (connection) => {
    set({
      edges: (window as any).RF?.addEdge(connection, get().edges) || get().edges,
    });
  },
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  addNode: (node) => set({ nodes: [...get().nodes, node] }),
}));
