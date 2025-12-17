import React from 'react';
import { Handle, Position } from 'reactflow';
import { Zap, Webhook, Clock, Mail } from 'lucide-react';

const getIcon = (nodeType: string) => {
  if (nodeType?.includes('webhook')) return Webhook;
  if (nodeType?.includes('schedule') || nodeType?.includes('cron')) return Clock;
  if (nodeType?.includes('email')) return Mail;
  return Zap;
};

export default function TriggerNode({ data }: any) {
  const Icon = getIcon(data.nodeType);

  return (
    <div className="group">
      <div className="px-5 py-4 shadow-xl rounded-xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-400 min-w-[200px] hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="text-blue-600" size={22} />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">
              Trigger
            </div>
            <div className="font-bold text-gray-800 text-sm mt-0.5">{data.label}</div>
            {data.description && (
              <div className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                {data.description}
              </div>
            )}
          </div>
        </div>

        {/* Output indicator */}
        {data.outputs && data.outputs.length > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-100 text-[10px] text-gray-500">
            <span className="font-semibold">Out:</span> {data.outputs.join(', ')}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-3 !h-3" />
    </div>
  );
}
