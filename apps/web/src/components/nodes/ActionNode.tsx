import React from 'react';
import { Handle, Position } from 'reactflow';
import { Play, Database, Zap, Code } from 'lucide-react';

const getIcon = (nodeType: string) => {
  if (nodeType?.includes('database')) return Database;
  if (nodeType?.includes('code') || nodeType?.includes('transform')) return Code;
  if (nodeType?.includes('http')) return Zap;
  return Play;
};

export default function ActionNode({ data }: any) {
  const Icon = getIcon(data.nodeType);

  return (
    <div className="group">
      <Handle type="target" position={Position.Top} className="!bg-emerald-500 !w-3 !h-3" />
      <div className="px-5 py-4 shadow-xl rounded-xl bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-400 min-w-[200px] hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Icon className="text-emerald-600" size={22} />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">
              Action
            </div>
            <div className="font-bold text-gray-800 text-sm mt-0.5">{data.label}</div>
            {data.description && (
              <div className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                {data.description}
              </div>
            )}
          </div>
        </div>

        {/* Input/Output indicators */}
        {(data.inputs?.length > 0 || data.outputs?.length > 0) && (
          <div className="mt-3 pt-3 border-t border-emerald-100 flex justify-between text-[10px]">
            {data.inputs && data.inputs.length > 0 && (
              <div className="text-gray-500">
                <span className="font-semibold">In:</span> {data.inputs.join(', ')}
              </div>
            )}
            {data.outputs && data.outputs.length > 0 && (
              <div className="text-gray-500">
                <span className="font-semibold">Out:</span> {data.outputs.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-3 !h-3" />
    </div>
  );
}
