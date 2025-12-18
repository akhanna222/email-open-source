import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import NodePalette from '../components/NodePalette';
import NodeConfig from '../components/NodeConfig';
import { Play, Save, CheckCircle, FolderOpen, X } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { api, SampleWorkflow, Workflow } from '../services/api';

// Dynamically import WorkflowCanvas to avoid SSR issues with ReactFlow
const WorkflowCanvas = dynamic(
  () => import('../components/WorkflowCanvas'),
  { ssr: false }
);

export default function Home() {
  const { workflowId, workflowName, nodes, edges, setWorkflowName, loadWorkflow, selectedNode, deleteNode } = useWorkflowStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<number | null>(null);
  const [showSamples, setShowSamples] = useState(false);
  const [samples, setSamples] = useState<SampleWorkflow[]>([]);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [showSavedWorkflows, setShowSavedWorkflows] = useState(false);
  const [savedWorkflows, setSavedWorkflows] = useState<Workflow[]>([]);
  const [loadingSavedWorkflows, setLoadingSavedWorkflows] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!workflowName || workflowName.trim() === '') {
      alert('Please enter a workflow name before saving');
      return;
    }

    if (nodes.length === 0) {
      const confirmed = window.confirm(
        'Your workflow is empty (no nodes). Do you still want to save it?'
      );
      if (!confirmed) return;
    }

    setSaving(true);
    try {
      const result = await api.saveWorkflow({
        id: workflowId,
        name: workflowName,
        nodes,
        edges,
      });

      // Capture version info
      if (result.version) {
        setCurrentVersion(result.version);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save workflow:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to save workflow: ${errorMessage}\n\nPlease check that the backend is running.`);
    } finally {
      setSaving(false);
    }
  };

  const fetchSamples = async () => {
    setLoadingSamples(true);
    try {
      const samplesList = await api.getSampleWorkflows();
      setSamples(samplesList);
    } catch (error) {
      console.error('Failed to load samples:', error);
    } finally {
      setLoadingSamples(false);
    }
  };

  const loadSample = async (sampleId: string) => {
    try {
      const workflow = await api.loadSampleWorkflow(sampleId);
      if (workflow && workflow.nodes) {
        loadWorkflow(workflow);
        setShowSamples(false);
      } else {
        alert('Invalid workflow data received from server');
      }
    } catch (error) {
      console.error('Failed to load sample workflow:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to load sample workflow: ${errorMessage}\n\nPlease check that the backend is running.`);
    }
  };

  const fetchSavedWorkflows = async () => {
    setLoadingSavedWorkflows(true);
    try {
      const workflows = await api.getWorkflows();
      setSavedWorkflows(workflows);
    } catch (error) {
      console.error('Failed to load saved workflows:', error);
    } finally {
      setLoadingSavedWorkflows(false);
    }
  };

  const loadSavedWorkflow = async (workflowToLoad: Workflow) => {
    try {
      if (workflowToLoad && workflowToLoad.nodes) {
        loadWorkflow(workflowToLoad);
        setShowSavedWorkflows(false);
      } else {
        alert('Invalid workflow data');
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to load workflow: ${errorMessage}`);
    }
  };

  useEffect(() => {
    if (showSamples && samples.length === 0) {
      fetchSamples();
    }
  }, [showSamples]);

  useEffect(() => {
    if (showSavedWorkflows) {
      fetchSavedWorkflows();
    }
  }, [showSavedWorkflows]);

  // Keyboard shortcuts for delete
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Delete or Backspace is pressed
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Don't delete if user is typing in an input field
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }

        // Delete selected node
        if (selectedNode) {
          event.preventDefault(); // Prevent browser back navigation on Backspace

          const { edges } = useWorkflowStore.getState();
          const affectedEdges = edges.filter(
            (edge) => edge.source === selectedNode.id || edge.target === selectedNode.id
          );
          const connectionCount = affectedEdges.length;

          // Show confirmation
          let confirmed = false;
          if (connectionCount > 0) {
            confirmed = window.confirm(
              `Deleting this node will break ${connectionCount} connection${connectionCount > 1 ? 's' : ''}.\n\nAre you sure you want to delete "${selectedNode.data.label || selectedNode.type}"?`
            );
          } else {
            confirmed = window.confirm(
              `Are you sure you want to delete "${selectedNode.data.label || selectedNode.type}"?`
            );
          }

          if (confirmed) {
            deleteNode(selectedNode.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, deleteNode]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with gradient */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Workflow Agent Studio</h1>
              <p className="text-xs text-blue-100">Build intelligent automation workflows</p>
            </div>
          </div>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="ml-4 px-4 py-2 border-2 border-white/20 bg-white/10 text-white placeholder-white/60 rounded-lg text-sm focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all min-w-[250px]"
            placeholder="Enter workflow name..."
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSamples(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all"
          >
            <FolderOpen size={18} />
            <span className="font-medium">Samples</span>
          </button>
          <button
            onClick={() => setShowSavedWorkflows(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all"
          >
            <FolderOpen size={18} />
            <span className="font-medium">Load Saved</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all disabled:opacity-50"
          >
            {saved ? <CheckCircle size={18} className="text-green-300" /> : <Save size={18} />}
            <div className="flex flex-col items-start">
              <span className="font-medium">{saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}</span>
              {currentVersion && (
                <span className="text-[10px] text-white/70">v{currentVersion}</span>
              )}
            </div>
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium shadow-lg">
            <Play size={18} />
            Execute
          </button>
        </div>
      </header>

      {/* Main Content with proper overflow handling */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <NodePalette />
        <div className="flex-1 flex flex-col min-w-0">
          <WorkflowCanvas />
        </div>
        <NodeConfig />
      </div>

      {/* Sample Workflows Modal */}
      {showSamples && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Sample Workflows</h2>
              <button
                onClick={() => setShowSamples(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingSamples ? (
                <div className="text-center py-12 text-gray-500">Loading samples...</div>
              ) : samples.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No sample workflows available</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {samples.map((sample) => (
                    <div
                      key={sample.id}
                      className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => loadSample(sample.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-2">{sample.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{sample.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {sample.metadata?.tags?.map((tag: string) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                              {sample.metadata?.complexity || 'basic'}
                            </span>
                          </div>
                        </div>
                        <button
                          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            loadSample(sample.id);
                          }}
                        >
                          Load
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Saved Workflows Modal */}
      {showSavedWorkflows && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Saved Workflows</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Location: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">data/workflows/</code>
                </p>
              </div>
              <button
                onClick={() => setShowSavedWorkflows(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingSavedWorkflows ? (
                <div className="text-center py-12 text-gray-500">Loading saved workflows...</div>
              ) : savedWorkflows.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-3">
                    <FolderOpen size={48} className="mx-auto mb-2" />
                  </div>
                  <div className="text-gray-600 font-medium">No saved workflows yet</div>
                  <div className="text-sm text-gray-400 mt-2">
                    Create and save workflows to see them here
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {savedWorkflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50"
                      onClick={() => loadSavedWorkflow(workflow)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-2">{workflow.name}</h3>
                          {workflow.description && (
                            <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                          )}
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">ID:</span>
                              <code className="bg-gray-100 px-2 py-0.5 rounded">{workflow.id}</code>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Nodes:</span>
                              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                                {workflow.nodes?.length || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Edges:</span>
                              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                                {workflow.edges?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium shadow-md hover:shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            loadSavedWorkflow(workflow);
                          }}
                        >
                          Load
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
