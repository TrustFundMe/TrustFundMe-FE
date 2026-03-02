'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Upload, FileText, ExternalLink, Loader2 } from 'lucide-react';
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
  onUploadProof,
  onDisburse,
  uploading,
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
  onUploadProof?: (file: File) => void;
  onDisburse?: () => void;
  uploading?: boolean;
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

          {/* Disbursement Proof Section for APPROVED and DISBURSED Expenditures */}
          {(request.status === 'APPROVED' || request.status === 'WITHDRAWAL_REQUESTED' || request.status === 'DISBURSED') && (request as any).type === 'EXPENDITURE' && (
            <div className="border-t border-gray-100 pt-4 mt-2">
              <div className="text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Disbursement Proof (Minh chứng chuyển tiền)</div>

              {(request as any).disbursementProofUrl ? (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-xl border border-gray-200 overflow-hidden bg-gray-50 group">
                    <img
                      src={(request as any).disbursementProofUrl}
                      alt="Disbursement Proof"
                      className="h-full w-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a
                        href={(request as any).disbursementProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white rounded-lg text-gray-900 flex items-center gap-2 text-xs font-bold"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Xem gốc
                      </a>
                    </div>
                    {request.status === 'DISBURSED' && (
                      <div className="absolute top-4 right-4 rotate-12 bg-transparent pointer-events-none">
                        <div className="border-4 border-red-500/80 rounded-full p-4 flex flex-col items-center justify-center transform scale-75 opacity-80 shadow-lg">
                          <ShieldCheck className="h-8 w-8 text-red-500/80 mb-1" />
                          <span className="text-[10px] font-black text-red-500/80 uppercase tracking-widest">ĐÃ GIẢI NGÂN</span>
                          <span className="text-[8px] font-bold text-red-500/60 uppercase">
                            {(request as any).disbursedAt
                              ? new Date((request as any).disbursedAt).toLocaleDateString('vi-VN')
                              : new Date().toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    {request.status !== 'DISBURSED' && (
                      <label className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-xs font-bold cursor-pointer transition-colors w-fit">
                        <Upload className="h-4 w-4" />
                        <span>Thay đổi minh chứng</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && onUploadProof) onUploadProof(file);
                          }}
                        />
                      </label>
                    )}

                    {(request.status === 'APPROVED' || request.status === 'WITHDRAWAL_REQUESTED') && onDisburse && (
                      <button
                        onClick={onDisburse}
                        className="w-full py-3 bg-[#F84D43] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#D63D35] transition-all shadow-lg shadow-red-200/50 flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Xác nhận đã chuyển tiền
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    id="proof-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onUploadProof) onUploadProof(file);
                    }}
                    disabled={uploading}
                  />
                  <label
                    htmlFor="proof-upload"
                    className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-gray-200 transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-red-200 hover:bg-red-50/30'
                      }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-8 w-8 text-red-500 animate-spin mb-3" />
                        <span className="text-xs font-bold text-red-600">Đang tải lên...</span>
                      </>
                    ) : (
                      <>
                        <div className="p-3 bg-red-50 rounded-full mb-3 ring-4 ring-red-50/50">
                          <Upload className="h-6 w-6 text-red-500" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">Tải minh chứng chuyển tiền</span>
                        <span className="text-[10px] text-gray-500 mt-1 font-medium italic">(Ảnh chụp biên lai chuyển khoản)</span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>
          )}

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
                          toast.error('Vui lòng nhập lý do từ chối vào ô Review Note bên dưới.');
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
                <label className="text-[10px] font-semibold text-gray-500">Review Note <span className="text-red-500">(Bắt buộc khi từ chối)</span></label>
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
