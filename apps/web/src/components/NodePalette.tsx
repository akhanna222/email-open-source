import React from 'react';
import { Zap, Play, GitBranch, Mail, Database, MessageSquare } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';

const nodeTemplates = [
  { type: 'trigger', label: 'Webhook Trigger', icon: Zap, color: 'blue' },
  { type: 'trigger', label: 'Schedule Trigger', icon: Zap, color: 'blue' },
  { type: 'action', label: 'Send Email', icon: Mail, color: 'green' },
  { type: 'action', label: 'HTTP Request', icon: Play, color: 'green' },
  { type: 'action', label: 'Database Query', icon: Database, color: 'green' },
  { type: 'condition', label: 'If/Else', icon: GitBranch, color: 'purple' },
  { type: 'action', label: 'AI Agent', icon: MessageSquare, color: 'green' },
];

export default function NodePalette() {
  const { addNode, nodes } = useWorkflowStore();

  const handleAddNode = (template: typeof nodeTemplates[0]) => {
    const newNode = {
      id: `${Date.now()}`,
      type: template.type,
      data: { label: template.label },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
    };
    addNode(newNode);
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Nodes</h2>

      <div className="space-y-2">
        {nodeTemplates.map((template, idx) => {
          const Icon = template.icon;
          return (
            <button
              key={idx}
              onClick={() => handleAddNode(template)}
              className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all cursor-pointer"
            >
              <Icon
                size={20}
                className={`text-${template.color}-500`}
              />
              <span className="text-sm font-medium">{template.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="text-xs text-gray-600">
          <strong>Tip:</strong> Click on a node to add it to the canvas
        </div>
      </div>
    </div>
  );
}
