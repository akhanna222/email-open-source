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
    // Initialize parameters with default values from schema
    const parameters: Record<string, any> = {};
    if (schema.schema?.properties) {
      Object.entries(schema.schema.properties).forEach(([key, prop]: [string, any]) => {
        if (prop.default !== undefined) {
          parameters[key] = prop.default;
        }
      });
    }

    const newNode = {
      id: `${Date.now()}`,
      type: schema.category,
      data: {
        label: schema.name,
        nodeType: schema.type,
        description: schema.description,
        inputs: schema.inputs,
        outputs: schema.outputs,
        parameters: parameters, // Store configurable parameters
        schema: schema.schema, // Store schema for rendering form
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
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      {/* Header - Fixed */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">📦</span>
          Available Nodes
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Drag and drop to add to canvas
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(groupedNodes).map(([category, schemas]) => (
          <div key={category}>
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-gray-300 rounded"></span>
              {category}
              <span className="flex-1 h-0.5 bg-gray-300 rounded"></span>
            </h3>
            <div className="space-y-2">
              {schemas.map((schema) => {
                const Icon = getIcon(schema.category);
                const color = getColor(schema.category);
                return (
                  <button
                    key={schema.type}
                    onClick={() => handleAddNode(schema)}
                    className="w-full flex items-center gap-3 p-3 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer text-left group"
                  >
                    <div className={`p-2 rounded-lg bg-${color}-50 group-hover:bg-${color}-100 transition-colors`}>
                      <Icon size={18} className={`text-${color}-600 flex-shrink-0`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{schema.name}</div>
                      <div className="text-xs text-gray-500 truncate leading-tight">{schema.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer - Fixed */}
      <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
        <div className="text-xs text-gray-700 flex items-center justify-between">
          <div>
            <span className="font-bold text-blue-600">{nodeSchemas.length}</span>
            <span className="text-gray-600"> nodes available</span>
          </div>
          <span className="text-green-600 font-medium">● Connected</span>
        </div>
      </div>
    </div>
  );
}
