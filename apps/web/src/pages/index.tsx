import React from 'react';
import dynamic from 'next/dynamic';
import NodePalette from '../components/NodePalette';
import { Play, Save } from 'lucide-react';

// Dynamically import WorkflowCanvas to avoid SSR issues with ReactFlow
const WorkflowCanvas = dynamic(
  () => import('../components/WorkflowCanvas'),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Workflow Agent Studio</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Save size={18} />
            Save
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
      </div>
    </div>
  );
}
