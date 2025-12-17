import React, { useState } from 'react';
import { X, Settings, Tag, ArrowRight, ArrowLeft, Trash2, ChevronDown, ChevronRight, Key } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';

// Component to render a single parameter field based on JSON schema
function ParameterField({
  name,
  schema,
  value,
  onChange,
  required
}: {
  name: string;
  schema: any;
  value: any;
  onChange: (value: any) => void;
  required: boolean;
}) {
  const isPassword = schema.format === 'password';
  const isEnum = schema.enum && Array.isArray(schema.enum);
  const isNumber = schema.type === 'number' || schema.type === 'integer';
  const isBoolean = schema.type === 'boolean';
  const isTextarea = schema.type === 'string' && !isEnum && !isPassword;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let newValue: any = e.target.value;

    if (isNumber) {
      newValue = schema.type === 'integer' ? parseInt(newValue) : parseFloat(newValue);
      if (isNaN(newValue)) newValue = schema.default || 0;
    } else if (isBoolean) {
      newValue = (e.target as HTMLInputElement).checked;
    }

    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
        <span className="capitalize">{name.replace(/_/g, ' ')}</span>
        {required && <span className="text-red-500">*</span>}
      </label>

      {schema.description && (
        <p className="text-xs text-gray-500">{schema.description}</p>
      )}

      {isEnum ? (
        <select
          value={value || schema.default || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
        >
          <option value="">Select {name}</option>
          {schema.enum.map((option: string) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : isBoolean ? (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value || false}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">Enable</span>
        </label>
      ) : isNumber ? (
        <input
          type="number"
          value={value !== undefined ? value : schema.default || ''}
          onChange={handleChange}
          min={schema.minimum}
          max={schema.maximum}
          step={schema.type === 'integer' ? 1 : 0.1}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-mono"
        />
      ) : isPassword ? (
        <input
          type="password"
          value={value || ''}
          onChange={handleChange}
          placeholder={`Enter ${name}`}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-mono"
        />
      ) : isTextarea && name.toLowerCase().includes('prompt') ? (
        <textarea
          value={value || ''}
          onChange={handleChange}
          placeholder={`Enter ${name}`}
          rows={3}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm resize-y"
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={handleChange}
          placeholder={`Enter ${name}`}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
        />
      )}

      {isNumber && (schema.minimum !== undefined || schema.maximum !== undefined) && (
        <p className="text-xs text-gray-400">
          Range: {schema.minimum ?? '∞'} - {schema.maximum ?? '∞'}
        </p>
      )}
    </div>
  );
}

export default function NodeConfig() {
  const { selectedNode, updateNode, deleteNode, setSelectedNode } = useWorkflowStore();
  const [showParameters, setShowParameters] = useState(true);

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

  const handleParameterChange = (paramName: string, value: any) => {
    if (selectedNode) {
      const updatedParameters = {
        ...(selectedNode.data.parameters || {}),
        [paramName]: value,
      };

      updateNode(selectedNode.id, {
        ...selectedNode,
        data: { ...selectedNode.data, parameters: updatedParameters },
      });
    }
  };

  const handleDelete = () => {
    if (!selectedNode) return;

    // Calculate affected connections by checking edges before deletion
    const { edges } = useWorkflowStore.getState();
    const affectedEdges = edges.filter(
      (edge) => edge.source === selectedNode.id || edge.target === selectedNode.id
    );
    const connectionCount = affectedEdges.length;

    // Show confirmation if there are connections
    if (connectionCount > 0) {
      const confirmed = window.confirm(
        `Deleting this node will break ${connectionCount} connection${connectionCount > 1 ? 's' : ''}.\n\nAre you sure you want to delete "${selectedNode.data.label || selectedNode.type}"?`
      );
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${selectedNode.data.label || selectedNode.type}"?`
      );
      if (!confirmed) return;
    }

    // Delete the node
    deleteNode(selectedNode.id);
  };

  const hasParameters = selectedNode.data.schema?.properties && Object.keys(selectedNode.data.schema.properties).length > 0;
  const requiredFields = selectedNode.data.schema?.required || [];

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

        {/* Parameters Section - NEW! */}
        {hasParameters && (
          <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-xl border-2 border-orange-200">
            <button
              onClick={() => setShowParameters(!showParameters)}
              className="w-full flex items-center justify-between text-sm font-semibold text-orange-700 mb-3 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Key size={16} />
                Configuration Parameters
              </span>
              {showParameters ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {showParameters && (
              <div className="space-y-4 mt-4">
                {Object.entries(selectedNode.data.schema.properties).map(([paramName, paramSchema]: [string, any]) => (
                  <ParameterField
                    key={paramName}
                    name={paramName}
                    schema={paramSchema}
                    value={selectedNode.data.parameters?.[paramName]}
                    onChange={(value) => handleParameterChange(paramName, value)}
                    required={requiredFields.includes(paramName)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

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
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 space-y-3">
        <div className="text-xs text-gray-500 flex items-center justify-between">
          <span>Node ID: {selectedNode.id}</span>
          <span className="text-blue-600 font-medium">● Active</span>
        </div>
        <button
          onClick={handleDelete}
          className="w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-2 font-semibold text-sm shadow-md hover:shadow-lg"
          title="Delete this node (Delete/Backspace)"
        >
          <Trash2 size={16} />
          Delete Node
        </button>
      </div>
    </div>
  );
}
