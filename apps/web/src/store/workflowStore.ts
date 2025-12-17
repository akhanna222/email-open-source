import { create } from 'zustand';
import type { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect } from 'reactflow';

interface WorkflowState {
  workflowId: string;
  workflowName: string;
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  updateNode: (nodeId: string, updatedNode: Node) => void;
  setSelectedNode: (node: Node | null) => void;
  setWorkflowName: (name: string) => void;
  setWorkflowId: (id: string) => void;
  loadWorkflow: (workflow: { id: string; name: string; nodes: Node[]; edges: Edge[] }) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflowId: `workflow-${Date.now()}`,
  workflowName: 'Untitled Workflow',
  nodes: [],
  edges: [],
  selectedNode: null,
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
  updateNode: (nodeId, updatedNode) => {
    set({
      nodes: get().nodes.map((n) => (n.id === nodeId ? updatedNode : n)),
      selectedNode: get().selectedNode?.id === nodeId ? updatedNode : get().selectedNode,
    });
  },
  setSelectedNode: (node) => set({ selectedNode: node }),
  setWorkflowName: (name) => set({ workflowName: name }),
  setWorkflowId: (id) => set({ workflowId: id }),
  loadWorkflow: (workflow) =>
    set({
      workflowId: workflow.id,
      workflowName: workflow.name,
      nodes: workflow.nodes,
      edges: workflow.edges,
    }),
}));
