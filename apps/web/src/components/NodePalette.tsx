import React, { useEffect, useState } from 'react';
import { Zap, Play, GitBranch, Mail, Database, MessageSquare, Send, Brain, Sparkles } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { api, NodeSchema } from '../services/api';

const getIcon = (category: string) => {
  switch (category) {
    case 'trigger': return Zap;
    case 'messaging': return Mail;
    case 'database': return Database;
    case 'ai': return Brain;
    case 'condition': return GitBranch;
    case 'control': return GitBranch;
    case 'utility': return Play;
    default: return Play;
  }
};

const getColor = (category: string) => {
  switch (category) {
    case 'trigger': return 'blue';
    case 'messaging': return 'purple';
    case 'database': return 'indigo';
    case 'ai': return 'purple';
    case 'condition': return 'amber';
    case 'control': return 'amber';
    case 'action': return 'emerald';
    case 'utility': return 'emerald';
    default: return 'gray';
  }
};

export default function NodePalette() {
  const { addNode } = useWorkflowStore();
  const [nodeSchemas, setNodeSchemas] = useState<NodeSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNodes() {
      try {
        const schemas = await api.getNodeSchemas();
        console.log('Loaded node schemas:', schemas);
        if (!schemas || schemas.length === 0) {
          setError('No nodes available. Backend may not be running.');
        } else {
          setNodeSchemas(schemas);
        }
      } catch (error) {
        console.error('Failed to load node schemas:', error);
        setError(`Failed to load nodes: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  if (error) {
    return (
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <h2 className="text-lg font-bold mb-4">Available Nodes</h2>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm font-semibold text-red-800 mb-2">Error Loading Nodes</div>
          <div className="text-xs text-red-600">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (nodeSchemas.length === 0) {
    return (
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <h2 className="text-lg font-bold mb-4">Available Nodes</h2>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm font-semibold text-yellow-800 mb-2">No Nodes Found</div>
          <div className="text-xs text-yellow-600">
            Check that the backend API is running and accessible.
          </div>
        </div>
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
