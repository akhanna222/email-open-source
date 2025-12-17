import React from 'react';
import { Handle, Position } from 'reactflow';
import { Database, Binary, Table, Search } from 'lucide-react';

const getIcon = (nodeType: string) => {
  if (nodeType?.includes('vector') || nodeType?.includes('embedding')) return Binary;
  if (nodeType?.includes('query') || nodeType?.includes('read')) return Search;
  if (nodeType?.includes('table')) return Table;
  return Database;
};

const getDBBadge = (nodeType: string) => {
  if (nodeType?.includes('postgres')) {
    if (nodeType?.includes('vector')) return 'pgvector';
    return 'PostgreSQL';
  }
  if (nodeType?.includes('redis')) return 'Redis';
  if (nodeType?.includes('mongo')) return 'MongoDB';
  return 'Database';
};

export default function DatabaseNode({ data }: any) {
  const Icon = getIcon(data.nodeType);
  const badge = getDBBadge(data.nodeType);

  return (
    <div className="group">
      <Handle type="target" position={Position.Top} className="!bg-indigo-500 !w-3 !h-3" />
      <div className="px-5 py-4 shadow-xl rounded-xl bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-400 min-w-[200px] hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Icon className="text-indigo-600" size={22} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">
                Database
              </div>
              <div className="px-2 py-0.5 bg-indigo-200 text-indigo-700 text-[9px] font-bold rounded">
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
        <div className="mt-3 pt-3 border-t border-indigo-100 flex justify-between text-[10px]">
          <div className="text-gray-500">
            <span className="font-semibold">In:</span> {data.inputs?.join(', ') || 'query'}
          </div>
          <div className="text-gray-500">
            <span className="font-semibold">Out:</span> {data.outputs?.join(', ') || 'result'}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-3 !h-3" />
    </div>
  );
}
