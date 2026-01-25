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
}: {
  rows: T[];
  columns: RequestTableColumn<T>[];
  selectedId?: string;
  onSelect: (row: T) => void;
}) {
  const hasRows = rows.length > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`px-4 py-3 text-left font-semibold ${c.className || ''}`}>
                {c.title}
              </th>
            ))}
            <th className="px-4 py-3 text-left font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {hasRows ? (
            rows.map((r) => {
              const isSelected = selectedId === r.id;
              return (
                <tr
                  key={r.id}
                  className={`cursor-pointer ${isSelected ? 'bg-orange-50/40' : 'hover:bg-gray-50'}`}
                  onClick={() => onSelect(r)}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 ${c.className || ''}`}>
                      {c.render(r)}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <RequestStatusPill status={r.status as RequestStatus} />
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td className="px-4 py-10 text-center text-sm text-gray-500" colSpan={columns.length + 1}>
                No requests found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
