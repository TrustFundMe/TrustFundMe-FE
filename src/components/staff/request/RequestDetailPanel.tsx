'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { RequestStatus, StaffRequestBase } from './RequestTypes';
import RequestStatusPill from './RequestStatusPill';

export default function RequestDetailPanel<T extends StaffRequestBase>({
  request,
  title,
  fields,
  onApprove,
  onReject,
  onActionClick,
  actionLabel,
  approveDisabled,
  approveDisabledReason,
  rejectDisabled,
  rejectDisabledReason,
}: {
  request: T | null;
  title: string;
  fields: Array<{ label: string; value?: React.ReactNode }>;
  onApprove?: (reason?: string) => void;
  onReject?: (reason?: string) => void;
  onActionClick?: () => void;
  actionLabel?: string;
  approveDisabled?: boolean;
  approveDisabledReason?: string;
  rejectDisabled?: boolean;
  rejectDisabledReason?: string;
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

          {/* Action Buttons for Pending Requests */}
          {isPending && (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              {actionLabel && onActionClick && (
                <button
                  onClick={onActionClick}
                  className="w-full rounded-xl border border-dashed border-gray-300 py-2 text-xs font-semibold text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                >
                  {actionLabel}
                </button>
              )}

              <div className="flex gap-2">
                {onReject && (
                  <div className="flex-1">
                    <button
                      onClick={() => {
                        if (note) {
                          onReject(note);
                          setNote('');
                        } else {
                          const reason = prompt('Please enter rejection reason:');
                          if (reason) onReject(reason);
                        }
                      }}
                      disabled={rejectDisabled}
                      title={rejectDisabledReason}
                      className="w-full rounded-xl bg-red-50 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {onApprove && (
                  <button
                    onClick={() => onApprove()}
                    disabled={approveDisabled}
                    title={approveDisabledReason}
                    className="flex-[2] rounded-xl bg-gray-900 py-2.5 text-xs font-bold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Approve
                  </button>
                )}
              </div>
              {/* Optional: Add a textarea for note if needed, 
                  but prompt is simpler for now as per design patterns often seen. 
                  Or I can add a dedicated textarea if preferred. 
                  Let's stick to prompt for rejection reason to keep UI clean unless requested.
                  Actually, user said "reject campaign đó kèm lí do". 
                  Let's add a small textarea for "Review Note" to be safe.
              */}
              <div className="pt-2">
                <label className="text-[10px] font-semibold text-gray-500">Review Note (Required for Rejection)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="w-full mt-1 rounded-lg border-gray-200 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
