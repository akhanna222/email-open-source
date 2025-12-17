import React from 'react';
import { Handle, Position } from 'reactflow';
import { GitBranch, Filter, Split } from 'lucide-react';

const getIcon = (nodeType: string) => {
  if (nodeType?.includes('filter')) return Filter;
  if (nodeType?.includes('split')) return Split;
  return GitBranch;
};

export default function ConditionNode({ data }: any) {
  const Icon = getIcon(data.nodeType);

  return (
    <div className="group">
      <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-3 !h-3" />
      <div className="px-5 py-4 shadow-xl rounded-xl bg-gradient-to-br from-amber-50 to-white border-2 border-amber-400 min-w-[200px] hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Icon className="text-amber-600" size={22} />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">
              Condition
            </div>
            <div className="font-bold text-gray-800 text-sm mt-0.5">{data.label}</div>
            {data.description && (
              <div className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                {data.description}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between mt-3 px-2">
          <div className="text-[10px] text-gray-500 font-medium">TRUE</div>
          <div className="text-[10px] text-gray-500 font-medium">FALSE</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="true" className="!bg-amber-500 !w-3 !h-3" style={{ left: '33%' }} />
      <Handle type="source" position={Position.Bottom} id="false" className="!bg-amber-500 !w-3 !h-3" style={{ left: '66%' }} />
    </div>
  );
}
