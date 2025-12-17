import React from 'react';
import { Handle, Position } from 'reactflow';
import { Mail, MessageSquare, Send } from 'lucide-react';

const getIcon = (nodeType: string) => {
  if (nodeType?.includes('gmail') || nodeType?.includes('outlook')) return Mail;
  if (nodeType?.includes('whatsapp') || nodeType?.includes('telegram')) return MessageSquare;
  return Send;
};

export default function MessagingNode({ data }: any) {
  const Icon = getIcon(data.nodeType);

  return (
    <div className="group">
      <Handle type="target" position={Position.Top} className="!bg-purple-500 !w-3 !h-3" />
      <div className="px-5 py-4 shadow-xl rounded-xl bg-gradient-to-br from-purple-50 to-white border-2 border-purple-400 min-w-[200px] hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Icon className="text-purple-600" size={22} />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-semibold text-purple-600 uppercase tracking-wide">
              Messaging
            </div>
            <div className="font-bold text-gray-800 text-sm mt-0.5">{data.label}</div>
            {data.description && (
              <div className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                {data.description}
              </div>
            )}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500 !w-3 !h-3" />
    </div>
  );
}
