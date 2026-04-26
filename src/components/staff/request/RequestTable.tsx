'use client';

import { useMemo } from 'react';
import type { RequestStatus, StaffRequestBase } from './RequestTypes';
import RequestStatusPill from './RequestStatusPill';

export type RequestTableColumn<T> = {
  key: string;
  title: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

export default function RequestTable<T extends StaffRequestBase>({
  rows,
  columns,
  selectedId,
  onSelect,
  statusClassName,
  actionColumn,
}: {
  rows: T[];
  columns: RequestTableColumn<T>[];
  selectedId?: string;
  onSelect: (row: T) => void;
  statusClassName?: string;
  actionColumn?: RequestTableColumn<T>;
}) {
  const hasRows = rows.length > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead className="sticky top-0 z-10 bg-[#ff5e14] text-white text-[10px] font-black uppercase tracking-widest shadow-sm">
          <tr className="whitespace-nowrap">
            <th className="px-4 py-2 text-left w-[50px] border-r border-white/5 whitespace-nowrap" title="Số Thứ Tự">STT</th>
            {columns.map((c) => (
              <th key={c.key} className={`px-4 py-2 text-left border-r border-white/5 last:border-r-0 whitespace-nowrap ${c.className || ''}`} title={c.title}>
                {c.title}
              </th>
            ))}
            <th className={`px-4 py-2 text-left whitespace-nowrap ${statusClassName || ''}`} title="Trạng thái yêu cầu">TRẠNG THÁI</th>
            {actionColumn && (
              <th className={`px-4 py-2 text-center whitespace-nowrap border-l border-white/5 ${actionColumn.className || ''}`} title={actionColumn.title}>
                {actionColumn.title}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {hasRows ? (
            rows.map((r, index) => {
              const isSelected = selectedId === r.id;
              return (
                <tr
                  key={r.id}
                  className={`group cursor-pointer transition-colors ${isSelected ? 'bg-[#ff5e14]/5' : 'hover:bg-gray-50'}`}
                  onClick={() => onSelect(r)}
                >
                  <td className="px-4 py-2 text-[10px] font-black text-gray-400 border-r border-gray-50/50 whitespace-nowrap">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-2 text-xs font-bold text-gray-600 border-r border-gray-50/50 last:border-r-0 ${c.className || ''}`}>
                      {c.render(r) || <span className="text-gray-300 font-medium italic text-[10px]">Chưa cập nhật</span>}
                    </td>
                  ))}
                  <td className={`px-4 py-2 whitespace-nowrap ${statusClassName || ''}`}>
                    <RequestStatusPill status={r.status as RequestStatus} />
                  </td>
                  {actionColumn && (
                    <td className={`px-4 py-2 whitespace-nowrap border-l border-gray-50/50 ${actionColumn.className || ''}`}>
                      {actionColumn.render(r)}
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td className="px-4 py-20 text-center" colSpan={columns.length + 2}>
                <div className="flex flex-col items-center opacity-20">
                  <span className="text-[10px] font-black uppercase tracking-widest mt-2">Không có yêu cầu nào</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
