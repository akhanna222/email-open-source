import React, { useEffect, useState } from 'react';
import { Zap, Play, GitBranch, Mail, Database, MessageSquare, Send } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { api, NodeSchema } from '../services/api';

const getIcon = (category: string) => {
  switch (category) {
    case 'trigger': return Zap;
    case 'messaging': return Mail;
    case 'database': return Database;
    case 'condition': return GitBranch;
    default: return Play;
  }
};

const getColor = (category: string) => {
  switch (category) {
    case 'trigger': return 'blue';
    case 'messaging': return 'purple';
    case 'condition': return 'amber';
    case 'action': return 'emerald';
    default: return 'emerald';
  }
};

export default function NodePalette() {
  const { addNode } = useWorkflowStore();
  const [nodeSchemas, setNodeSchemas] = useState<NodeSchema[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNodes() {
      try {
        const schemas = await api.getNodeSchemas();
        setNodeSchemas(schemas);
      } catch (error) {
        console.error('Failed to load node schemas:', error);
      } finally {
        setLoading(false);
      }
    }
    loadNodes();
  }, []);

  const handleAddNode = (schema: NodeSchema) => {
    const newNode = {
      id: `${Date.now()}`,
      type: schema.category,
      data: {
        label: schema.name,
        nodeType: schema.type,
        description: schema.description,
        inputs: schema.inputs,
        outputs: schema.outputs,
      },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
    };
    addNode(newNode);
  };

  if (loading) {
    return (
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading nodes...</div>
      </div>
    );
  }

  const groupedNodes = nodeSchemas.reduce((acc, schema) => {
    if (!acc[schema.category]) acc[schema.category] = [];
    acc[schema.category].push(schema);
    return acc;
  }, {} as Record<string, NodeSchema[]>);

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Available Nodes</h2>

      {Object.entries(groupedNodes).map(([category, schemas]) => (
        <div key={category} className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">{category}</h3>
          <div className="space-y-2">
            {schemas.map((schema) => {
              const Icon = getIcon(schema.category);
              const color = getColor(schema.category);
              return (
                <button
                  key={schema.type}
                  onClick={() => handleAddNode(schema)}
                  className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all cursor-pointer text-left"
                >
                  <Icon size={18} className={`text-${color}-500 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{schema.name}</div>
                    <div className="text-xs text-gray-500 truncate">{schema.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="text-xs text-gray-600">
          <strong>{nodeSchemas.length} nodes</strong> available from backend
        </div>
      </div>
    </div>
  );
}
