import React from 'react';
import { X, Settings, Tag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';

export default function NodeConfig() {
  const { selectedNode, updateNode, setSelectedNode } = useWorkflowStore();

  if (!selectedNode) {
    return (
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-sm">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-gray-400">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Settings size={40} className="text-gray-300" />
            </div>
            <div className="text-sm font-medium text-gray-600">No Node Selected</div>
            <div className="text-xs text-gray-400 mt-2">Click on a node to configure it</div>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-sm">
      {/* Header - Fixed */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Settings size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Configuration</h2>
            <p className="text-xs text-gray-500">Node properties</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title="Close"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Node Type Badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-xs font-bold uppercase">
            {selectedNode.data.nodeType || selectedNode.type}
          </div>
          <div className="text-xs text-gray-400">Type</div>
        </div>

        {/* Label Input */}
        <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Tag size={16} className="text-gray-500" />
            Node Label
          </label>
          <input
            type="text"
            value={selectedNode.data.label || ''}
            onChange={handleLabelChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm font-medium"
            placeholder="Enter node label..."
          />
        </div>

        {/* Inputs Section */}
        {selectedNode.data.inputs && selectedNode.data.inputs.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border-2 border-blue-200">
            <label className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-3">
              <ArrowRight size={16} />
              Input Parameters
            </label>
            <div className="space-y-2">
              {selectedNode.data.inputs.map((input: string) => (
                <div
                  key={input}
                  className="flex items-center gap-2 px-3 py-2 bg-white text-blue-700 rounded-lg text-sm border border-blue-300 font-medium"
                >
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  {input}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outputs Section */}
        {selectedNode.data.outputs && selectedNode.data.outputs.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border-2 border-green-200">
            <label className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-3">
              <ArrowLeft size={16} />
              Output Parameters
            </label>
            <div className="space-y-2">
              {selectedNode.data.outputs.map((output: string) => (
                <div
                  key={output}
                  className="flex items-center gap-2 px-3 py-2 bg-white text-green-700 rounded-lg text-sm border border-green-300 font-medium"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {output}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {selectedNode.data.description && (
          <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-200">
            <label className="text-sm font-semibold text-purple-700 mb-2 block">
              Description
            </label>
            <p className="text-sm text-gray-600 leading-relaxed">
              {selectedNode.data.description}
            </p>
          </div>
        )}
      </div>

      {/* Footer - Fixed */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="text-xs text-gray-500 flex items-center justify-between">
          <span>Node ID: {selectedNode.id}</span>
          <span className="text-blue-600 font-medium">● Active</span>
        </div>
      </div>
    </div>
  );
}
