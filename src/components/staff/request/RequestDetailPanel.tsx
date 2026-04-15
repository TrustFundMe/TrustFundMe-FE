'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Upload, ExternalLink, Loader2, X, Megaphone, XCircle, Mail } from 'lucide-react';
import type { RequestStatus, StaffRequestBase } from './RequestTypes';
import RequestStatusPill from './RequestStatusPill';

interface RequestDetailPanelProps<T extends StaffRequestBase> {
  request: T | null;
  title: string;
  fields: Array<{ label: string; value?: React.ReactNode }>;
  onApprove?: (reason?: string) => void;
  onReject?: (reason?: string) => void;
  onDisable?: (reason?: string) => void;
  onActionClick?: () => void;
  actionLabel?: string;
  approveDisabled?: boolean;
  approveDisabledReason?: string;
  rejectDisabled?: boolean;
  rejectDisabledReason?: string;
  onUploadProof?: (file: File) => void;
  onDisburse?: () => void;
  uploading?: boolean;
  onVerifyKYC?: () => void;
  onClose?: () => void;
  onSendCommitmentEmail?: () => void;
  commitmentSent?: boolean;
  commitmentSigned?: boolean;
  kycVerified?: boolean;
  readOnly?: boolean;
  hideActions?: boolean;
}

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
  onVerifyKYC,
  onDisable,
  onClose,
  onSendCommitmentEmail,
  commitmentSent,
  commitmentSigned,
  kycVerified,
  readOnly,
  hideActions,
}: RequestDetailPanelProps<T>) {
  const [note, setNote] = useState('');

  const isPending = request?.status === 'PENDING';
  const isApproved = request?.status === 'APPROVED';

  if (!request) {
    return (
      <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30 p-8 text-center opacity-40">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
          <Megaphone className="h-8 w-8 text-gray-300" />
        </div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-loose">
          Vui lòng chọn 1 mục<br />để xem chi tiết
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-50 pb-3">
        <div className="flex items-center gap-3">
          <div className="text-sm font-black text-gray-900 uppercase tracking-tight">{title}</div>
          <RequestStatusPill status={request.status as RequestStatus} />
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            title="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 gap-3">
        {fields.map((f) => (
          <div key={f.label} className="rounded-xl bg-gray-50/80 p-2 border border-gray-100/50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{f.label}</p>
            {f.label === 'Mô tả' ? (
              <div className="max-h-32 overflow-y-auto pr-2 custom-scrollbar text-xs font-bold text-gray-700 leading-relaxed bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                {f.value || <span className="text-gray-300 font-medium italic text-[10px]">Chưa cập nhật</span>}
              </div>
            ) : (
              <div className="text-xs font-bold text-gray-700 leading-tight">
                {f.value || <span className="text-gray-300 font-medium italic text-[10px]">Chưa cập nhật</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Disable Campaign Section */}
      {onDisable && isApproved && (request as any).type === 'APPROVE_CAMPAIGN' && !hideActions && (
        <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100 space-y-2">
           <div className="italic text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              ⚠️ Ghi chú vô hiệu hóa:
           </div>
           <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập lý do vô hiệu hóa chiến dịch này..."
              className="w-full rounded-xl border-gray-100 text-xs shadow-sm focus:border-gray-500 focus:ring-gray-500 p-2.5"
              rows={2}
            />
           <button
            onClick={() => {
              if (note.trim()) {
                onDisable(note);
                setNote('');
              } else {
                toast.error('Vui lòng nhập lý do vô hiệu hóa');
              }
            }}
            className="w-full rounded-xl bg-gray-500 py-2.5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-gray-600 flex items-center justify-center gap-2 transition-all shadow-lg shadow-gray-100 active:scale-95"
          >
            <XCircle className="h-4 w-4" />
            Vô hiệu hóa chiến dịch
          </button>
        </div>
      )}

      {/* Disbursement Proof Section */}
      {(request.status === 'APPROVED' || request.status === 'WITHDRAWAL_REQUESTED' || request.status === 'DISBURSED') && (request as any).type === 'EXPENDITURE' && (
        <div className="border-t border-gray-100 pt-3 space-y-3">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Minh chứng chuyển tiền</div>

          {(request as any).disbursementProofUrl ? (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 group shadow-sm">
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
                    className="px-4 py-2 bg-white rounded-xl text-gray-900 flex items-center gap-2 text-xs font-black uppercase tracking-wider shadow-xl"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Xem ảnh gốc
                  </a>
                </div>
              </div>

              {!readOnly && request.status !== 'DISBURSED' && (
                <label className="flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all border-2 border-dashed border-blue-100">
                  <Upload className="h-4 w-4" />
                  Thay đổi ảnh
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

              {(request.status === 'APPROVED' || request.status === 'WITHDRAWAL_REQUESTED') && onDisburse && !hideActions && (
                <button
                  onClick={onDisburse}
                  className="w-full py-3 bg-[#446b5f] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#355249] transition-all shadow-lg shadow-green-100 active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="h-5 w-5" />
                  Xác nhận đã chuyển tiền
                </button>
              )}
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
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-200 transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-green-200 hover:bg-green-50/30'
                  }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-6 w-6 text-green-600 animate-spin mb-2" />
                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Đang tải lên...</span>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-gray-50 rounded-full mb-2 ring-4 ring-gray-50/50">
                      <Upload className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="text-xs font-black text-gray-700 uppercase tracking-tight">Tải lên minh chứng</span>
                    <span className="text-[9px] text-gray-400 mt-1 font-bold italic">(Ảnh chụp chuyển tiền)</span>
                  </>
                )}
              </label>
            </div>
          )}
        </div>
      )}

      {/* Review Actions for Pending */}
      {isPending && !hideActions && (
        <div className="border-t border-gray-100 pt-3 space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ghi chú phản hồi <span className="text-red-500">(Bắt buộc nếu từ chối)</span></label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập lý do từ chối hoặc ghi chú góp ý..."
              className="w-full rounded-xl border-gray-200 text-sm shadow-sm focus:border-[#446b5f] focus:ring-4 focus:ring-[#446b5f]/5 p-2.5"
              rows={3}
            />
          </div>

          {onSendCommitmentEmail && (request as any).type === 'APPROVE_CAMPAIGN' && !hideActions && (
            <div className="space-y-1 mb-2">
              <button
                onClick={onSendCommitmentEmail}
                disabled={!kycVerified || commitmentSigned}
                title={commitmentSigned ? "Người dùng đã ký cam kết, không cần gửi lại" : (!kycVerified ? "Cần xác minh KYC người dùng trước khi gửi mail cam kết" : "Gửi yêu cầu ký cam kết qua email")}
                className="w-full rounded-xl border-2 border-dashed border-[#446b5f]/30 py-2.5 text-[11px] font-black uppercase tracking-widest text-[#446b5f] hover:border-[#446b5f] hover:bg-[#446b5f]/5 disabled:opacity-40 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Gửi mail yêu cầu ký cam kết
              </button>
              {commitmentSigned && (
                <p className="text-[10px] text-center font-bold text-emerald-600 italic">
                   (Người dùng đã ký bản cam kết này)
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2.5">
            {onReject && (
              <button
                onClick={() => {
                  if (note.trim()) {
                    onReject(note);
                    setNote('');
                  } else {
                    toast.error('Vui lòng nhập lý do từ chối');
                  }
                }}
                disabled={rejectDisabled}
                className="flex-1 rounded-xl bg-gray-100 py-2.5 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 border border-gray-200"
              >
                TỪ CHỐI
              </button>
            )}
            {onApprove && (
              <button
                onClick={() => onApprove(note)}
                disabled={approveDisabled || !commitmentSigned}
                title={!kycVerified ? "Cần xác minh KYC trước" : !commitmentSigned ? "Chờ người dùng ký cam kết" : approveDisabledReason}
                className="flex-[1.5] rounded-xl bg-[#446b5f] py-2.5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-[#355249] disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg shadow-green-100 transition-all active:scale-95"
              >
                {(!kycVerified || !commitmentSigned) ? "CHƯA ĐỦ ĐIỀU KIỆN" : "DUYỆT YÊU CẦU"}
              </button>
            )}
          </div>

          {/* Workflow Guide */}
          {isPending && (request as any).type === 'APPROVE_CAMPAIGN' && (
            <div className="mt-4 rounded-xl bg-blue-50/50 border border-blue-100 p-3 space-y-2">
              <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Hướng dẫn quy trình duyệt:
              </p>
              <div className="space-y-1.5">
                <div className={`flex items-center gap-2 text-[10px] font-bold ${kycVerified ? 'text-green-600' : 'text-gray-500'}`}>
                   <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${kycVerified ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>1</div>
                   <span>Xác thực KYC người dùng {kycVerified && '✓'}</span>
                </div>
                <div className={`flex items-center gap-2 text-[10px] font-bold ${(commitmentSent || commitmentSigned) ? 'text-green-600' : 'text-gray-500'}`}>
                   <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${(commitmentSent || commitmentSigned) ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>2</div>
                   <span>Gửi mail yêu cầu ký cam kết {(commitmentSent || commitmentSigned) && '✓'}</span>
                </div>
                <div className={`flex items-center gap-2 text-[10px] font-bold ${commitmentSigned ? 'text-green-600' : 'text-gray-500'}`}>
                   <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${commitmentSigned ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>3</div>
                   <span>Người dùng ký cam kết (E-sign) {commitmentSigned ? '✓' : '(Đang chờ)'}</span>
                </div>
              </div>
              
              {/* Nút hành động nhanh (Ví dụ: Chuyển sang KYC) */}
              {actionLabel && onActionClick && (
                <button
                  onClick={onActionClick}
                  className="w-full mt-3 py-2.5 bg-blue-600 rounded-xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-95 animate-in zoom-in-95 duration-300"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {actionLabel}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
