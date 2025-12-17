import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import NodePalette from '../components/NodePalette';
import NodeConfig from '../components/NodeConfig';
import { Play, Save, CheckCircle, FolderOpen, X } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { api, SampleWorkflow } from '../services/api';

// Dynamically import WorkflowCanvas to avoid SSR issues with ReactFlow
const WorkflowCanvas = dynamic(
  () => import('../components/WorkflowCanvas'),
  { ssr: false }
);

export default function Home() {
  const { workflowId, workflowName, nodes, edges, setWorkflowName, loadWorkflow } = useWorkflowStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<number | null>(null);
  const [showSamples, setShowSamples] = useState(false);
  const [samples, setSamples] = useState<SampleWorkflow[]>([]);
  const [loadingSamples, setLoadingSamples] = useState(false);

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

  useEffect(() => {
    if (showSamples && samples.length === 0) {
      fetchSamples();
    }
  }, [showSamples]);

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
    </div>
  );
}
