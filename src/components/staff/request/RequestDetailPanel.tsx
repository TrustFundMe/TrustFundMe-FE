'use client';

import { useMemo, useState } from 'react';
import type { RequestStatus, StaffRequestBase } from './RequestTypes';
import RequestStatusPill from './RequestStatusPill';

export default function RequestDetailPanel<T extends StaffRequestBase>({
  request,
  title,
  fields,
  onApprove,
  onReject,
}: {
  request: T | null;
  title: string;
  fields: Array<{ label: string; value?: React.ReactNode }>;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  const [note, setNote] = useState('');

  const isPending = request?.status === 'PENDING';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {!request ? (
        <div className="text-sm text-gray-500">Select a request to view details.</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">{title}</div>
              <div className="mt-1 text-xs text-gray-500">ID: {request.id}</div>
            </div>
            <RequestStatusPill status={request.status as RequestStatus} />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {fields.map((f) => (
              <div key={f.label} className="rounded-xl bg-gray-50 p-3">
                <div className="text-[11px] font-semibold text-gray-500">{f.label}</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">{f.value ?? '-'}</div>
              </div>
            ))}
          </div>

          {(onApprove || onReject) && (
            <div className="space-y-2">
              <div>
                <div className="text-xs font-semibold text-gray-700">Staff note</div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 h-20 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="Optional note..."
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!isPending || !onReject}
                  onClick={() => request && onReject?.(request.id)}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={!isPending || !onApprove}
                  onClick={() => request && onApprove?.(request.id)}
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Approve
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
