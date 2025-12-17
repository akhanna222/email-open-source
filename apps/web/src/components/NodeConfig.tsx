import React from 'react';
import { X } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';

export default function NodeConfig() {
  const { selectedNode, updateNode, setSelectedNode } = useWorkflowStore();

  if (!selectedNode) return null;

  const handleClose = () => setSelectedNode(null);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedNode) {
      updateNode(selectedNode.id, {
        ...selectedNode,
        data: { ...selectedNode.data, label: e.target.value },
      });
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Node Configuration</h2>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Node Type
          </label>
          <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm">
            {selectedNode.data.nodeType || selectedNode.type}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={selectedNode.data.label || ''}
            onChange={handleLabelChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        {selectedNode.data.description && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <p className="text-sm text-gray-600">{selectedNode.data.description}</p>
          </div>
        )}

        {selectedNode.data.inputs && selectedNode.data.inputs.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inputs
            </label>
            <div className="space-y-1">
              {selectedNode.data.inputs.map((input: string) => (
                <div key={input} className="px-3 py-2 bg-blue-50 rounded text-sm">
                  {input}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedNode.data.outputs && selectedNode.data.outputs.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Outputs
            </label>
            <div className="space-y-1">
              {selectedNode.data.outputs.map((output: string) => (
                <div key={output} className="px-3 py-2 bg-green-50 rounded text-sm">
                  {output}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
