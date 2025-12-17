import React from 'react';
import { Handle, Position } from 'reactflow';
import { Zap } from 'lucide-react';

export default function TriggerNode({ data }: any) {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-blue-500 min-w-[180px]">
      <div className="flex items-center gap-2">
        <Zap className="text-blue-500" size={20} />
        <div>
          <div className="text-xs text-gray-500">Trigger</div>
          <div className="font-semibold">{data.label}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  );
}
