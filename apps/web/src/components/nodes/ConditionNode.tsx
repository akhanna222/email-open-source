import React from 'react';
import { Handle, Position } from 'reactflow';
import { GitBranch } from 'lucide-react';

export default function ConditionNode({ data }: any) {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-purple-500 min-w-[180px]">
      <Handle type="target" position={Position.Top} className="!bg-purple-500" />
      <div className="flex items-center gap-2">
        <GitBranch className="text-purple-500" size={20} />
        <div>
          <div className="text-xs text-gray-500">Condition</div>
          <div className="font-semibold">{data.label}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="true" className="!bg-purple-500" style={{ left: '33%' }} />
      <Handle type="source" position={Position.Bottom} id="false" className="!bg-purple-500" style={{ left: '66%' }} />
    </div>
  );
}
