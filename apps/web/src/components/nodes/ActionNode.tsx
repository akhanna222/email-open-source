import React from 'react';
import { Handle, Position } from 'reactflow';
import { Play } from 'lucide-react';

export default function ActionNode({ data }: any) {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-green-500 min-w-[180px]">
      <Handle type="target" position={Position.Top} className="!bg-green-500" />
      <div className="flex items-center gap-2">
        <Play className="text-green-500" size={20} />
        <div>
          <div className="text-xs text-gray-500">Action</div>
          <div className="font-semibold">{data.label}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
    </div>
  );
}
