import React from 'react';
import { AlertCircle, Clock, RefreshCw, Database, StickyNote, Palette } from 'lucide-react';

interface NodeSettingsProps {
  settings: {
    // Error Handling
    continueOnFail?: boolean;
    onError?: 'stopWorkflow' | 'continueRegularOutput' | 'continueErrorOutput';
    retryOnFail?: boolean;
    maxTries?: number;
    waitBetweenTries?: number;

    // Data & Execution
    alwaysOutputData?: boolean;
    executeOnce?: boolean;
    timeout?: number;
    disabled?: boolean;

    // UI & Metadata
    notes?: string;
    notesInFlow?: boolean;
    color?: number;
  };
  onChange: (settings: any) => void;
}

const COLORS = [
  { name: 'Default', value: 0, color: 'bg-gray-500' },
  { name: 'Blue', value: 1, color: 'bg-blue-500' },
  { name: 'Green', value: 2, color: 'bg-green-500' },
  { name: 'Orange', value: 3, color: 'bg-orange-500' },
  { name: 'Red', value: 4, color: 'bg-red-500' },
  { name: 'Purple', value: 5, color: 'bg-purple-500' },
  { name: 'Pink', value: 6, color: 'bg-pink-500' },
  { name: 'Teal', value: 7, color: 'bg-teal-500' },
];

export default function NodeSettings({ settings, onChange }: NodeSettingsProps) {
  const updateSetting = (key: string, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Error Handling Section */}
      <div className="bg-gradient-to-br from-red-50 to-white p-4 rounded-xl border-2 border-red-200">
        <h3 className="flex items-center gap-2 text-sm font-bold text-red-700 mb-4">
          <AlertCircle size={16} />
          Error Handling
        </h3>
        <div className="space-y-3">
          {/* Continue on Fail */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.continueOnFail || false}
              onChange={(e) => updateSetting('continueOnFail', e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Continue on Fail</span>
              <p className="text-xs text-gray-500">Allow workflow to continue if this node fails</p>
            </div>
          </label>

          {/* On Error */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">On Error</label>
            <select
              value={settings.onError || 'stopWorkflow'}
              onChange={(e) => updateSetting('onError', e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all text-sm"
            >
              <option value="stopWorkflow">Stop Workflow</option>
              <option value="continueRegularOutput">Continue (Regular Output)</option>
              <option value="continueErrorOutput">Continue (Error Output)</option>
            </select>
          </div>

          {/* Retry on Fail */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.retryOnFail || false}
              onChange={(e) => updateSetting('retryOnFail', e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Retry on Fail</span>
              <p className="text-xs text-gray-500">Automatically retry failed operations</p>
            </div>
          </label>

          {/* Max Tries & Wait Between Tries (shown when retryOnFail is enabled) */}
          {settings.retryOnFail && (
            <div className="pl-6 space-y-3 border-l-2 border-red-300">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Max Tries</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={settings.maxTries || 3}
                  onChange={(e) => updateSetting('maxTries', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all text-sm font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">Maximum retry attempts (1-5)</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Wait Between Tries (ms)</label>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  step="100"
                  value={settings.waitBetweenTries || 1000}
                  onChange={(e) => updateSetting('waitBetweenTries', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all text-sm font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">Milliseconds to wait (0-5000)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data & Execution Section */}
      <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border-2 border-blue-200">
        <h3 className="flex items-center gap-2 text-sm font-bold text-blue-700 mb-4">
          <Database size={16} />
          Data & Execution
        </h3>
        <div className="space-y-3">
          {/* Always Output Data */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.alwaysOutputData || false}
              onChange={(e) => updateSetting('alwaysOutputData', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Always Output Data</span>
              <p className="text-xs text-gray-500">Output data even with empty results</p>
            </div>
          </label>

          {/* Execute Once */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.executeOnce || false}
              onChange={(e) => updateSetting('executeOnce', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Execute Once</span>
              <p className="text-xs text-gray-500">Run once for all items instead of per item</p>
            </div>
          </label>

          {/* Timeout */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Clock size={14} />
              Timeout (seconds)
            </label>
            <input
              type="number"
              min="0"
              max="3600"
              value={settings.timeout || 60}
              onChange={(e) => updateSetting('timeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">Maximum execution time (0 = no limit)</p>
          </div>

          {/* Disabled */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.disabled || false}
              onChange={(e) => updateSetting('disabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Disabled</span>
              <p className="text-xs text-gray-500">Skip this node during execution</p>
            </div>
          </label>
        </div>
      </div>

      {/* UI & Metadata Section */}
      <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border-2 border-purple-200">
        <h3 className="flex items-center gap-2 text-sm font-bold text-purple-700 mb-4">
          <StickyNote size={16} />
          UI & Notes
        </h3>
        <div className="space-y-3">
          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Notes</label>
            <textarea
              value={settings.notes || ''}
              onChange={(e) => updateSetting('notes', e.target.value)}
              placeholder="Add notes about this node..."
              rows={3}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all text-sm resize-y"
            />
          </div>

          {/* Show Notes in Flow */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notesInFlow || false}
              onChange={(e) => updateSetting('notesInFlow', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">Show Notes on Canvas</span>
          </label>

          {/* Node Color */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Palette size={14} />
              Node Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  onClick={() => updateSetting('color', colorOption.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                    settings.color === colorOption.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${colorOption.color}`} />
                  <span className="text-xs font-medium">{colorOption.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
