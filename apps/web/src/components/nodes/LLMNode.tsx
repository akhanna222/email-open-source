import React from 'react';
import { Handle, Position } from 'reactflow';
import { Brain, Sparkles, MessageSquare, Zap } from 'lucide-react';

const getIcon = (nodeType: string) => {
  if (nodeType?.includes('openai')) return Sparkles;
  if (nodeType?.includes('claude')) return MessageSquare;
  if (nodeType?.includes('agent')) return Brain;
  return Zap;
};

const getProviderBadge = (nodeType: string) => {
  if (nodeType?.includes('openai')) return 'OpenAI';
  if (nodeType?.includes('claude')) return 'Claude';
  if (nodeType?.includes('gemini')) return 'Gemini';
  if (nodeType?.includes('deepseek')) return 'DeepSeek';
  if (nodeType?.includes('agent')) return 'Agent';
  return 'LLM';
};

export default function LLMNode({ data }: any) {
  const Icon = getIcon(data.nodeType);
  const badge = getProviderBadge(data.nodeType);

  return (
    <div className="group">
      <Handle type="target" position={Position.Top} className="!bg-purple-500 !w-3 !h-3" />
      <div className="px-5 py-4 shadow-xl rounded-xl bg-gradient-to-br from-purple-50 to-white border-2 border-purple-400 min-w-[200px] hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Icon className="text-purple-600" size={22} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="text-[10px] font-semibold text-purple-600 uppercase tracking-wide">
                AI / LLM
              </div>
              <div className="px-2 py-0.5 bg-purple-200 text-purple-700 text-[9px] font-bold rounded">
                {badge}
              </div>
            </div>
            <div className="font-bold text-gray-800 text-sm mt-0.5">{data.label}</div>
            {data.description && (
              <div className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                {data.description}
              </div>
            )}
          </div>
        </div>

        {/* Input/Output indicators */}
        <div className="mt-3 pt-3 border-t border-purple-100 flex justify-between text-[10px]">
          <div className="text-gray-500">
            <span className="font-semibold">In:</span> {data.inputs?.join(', ') || 'prompt'}
          </div>
          <div className="text-gray-500">
            <span className="font-semibold">Out:</span> {data.outputs?.join(', ') || 'response'}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500 !w-3 !h-3" />
    </div>
  );
}
