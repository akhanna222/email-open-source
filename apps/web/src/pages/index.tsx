import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import NodePalette from '../components/NodePalette';
import NodeConfig from '../components/NodeConfig';
import { Play, Save, CheckCircle } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { api } from '../services/api';

// Dynamically import WorkflowCanvas to avoid SSR issues with ReactFlow
const WorkflowCanvas = dynamic(
  () => import('../components/WorkflowCanvas'),
  { ssr: false }
);

export default function Home() {
  const { workflowId, workflowName, nodes, edges, setWorkflowName } = useWorkflowStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.saveWorkflow({
        id: workflowId,
        name: workflowName,
        nodes,
        edges,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Workflow Agent Studio</h1>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            placeholder="Workflow name"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {saved ? <CheckCircle size={18} className="text-green-500" /> : <Save size={18} />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            <Play size={18} />
            Execute
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <NodePalette />
        <div className="flex-1">
          <WorkflowCanvas />
        </div>
        <NodeConfig />
      </div>
    </div>
  );
}
