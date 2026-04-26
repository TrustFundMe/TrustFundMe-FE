'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  X,
  ChevronDown,
  ShieldCheck,
  Landmark,
  FileText,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Users,
  Target,
  CheckCircle2,
  XCircle,
  Mail,
} from 'lucide-react';
import type { CampaignRequest, RequestStatus } from './RequestTypes';
import RequestStatusPill from './RequestStatusPill';

interface Props {
  request: CampaignRequest;
  onClose: () => void;
  onApprove: (reason?: string) => void;
  onReject: (reason?: string) => void;
  onDisable: (reason?: string) => void;
  onSendCommitmentEmail?: () => void;
  commitmentSent?: boolean;
  commitmentSigned?: boolean;
  onNavigateToKYC?: () => void;
  square?: boolean;
}

function formatVnd(n: number): string {
  return n.toLocaleString('vi-VN') + 'đ';
}

function Section({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 bg-gray-50/80 text-left transition-colors hover:bg-gray-100/80"
      >
        <Icon className="h-4 w-4 text-[#ff5e14] shrink-0" />
        <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest flex-1">{title}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-3.5 py-3 space-y-2.5 bg-white">{children}</div>}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
      <div className="text-xs font-bold text-gray-700 leading-snug">{children}</div>
    </div>
  );
}

function AckCheck({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
      )}
      <span className={`text-[11px] font-bold ${ok ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
}

export default function CampaignNewFlowDetail({
  request,
  onClose,
  onApprove,
  onReject,
  onDisable,
  onSendCommitmentEmail,
  commitmentSent,
  commitmentSigned,
  onNavigateToKYC,
  square = false,
}: Props) {
  const [note, setNote] = useState('');
  const nf = request.newFlowData!;
  const isPending = request.status === 'PENDING';
  const isApproved = request.status === 'APPROVED';
  const kycOk = request.kycVerified;

  const milestoneTotal = nf.milestones.reduce((s, m) => s + m.plannedAmount, 0);
  const milestoneMatch = milestoneTotal === nf.targetAmount;
  const ackAll = Object.values(nf.acknowledgements).every(Boolean);
  const coverImg = nf.campaignImages.find((i) => i.id === nf.coverImageId);

  return (
    <div className={`${square ? 'rounded-none' : 'rounded-2xl'} border border-gray-200 bg-white shadow-sm space-y-2.5 overflow-hidden`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-3.5 pt-3.5 pb-2 border-b border-gray-50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-black text-gray-900 uppercase tracking-tight">Chi tiết chiến dịch</span>
            <RequestStatusPill status={request.status as RequestStatus} />
          </div>
          <p className="text-xs font-bold text-gray-600 line-clamp-2">{request.campaignTitle}</p>
          <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-black text-brand bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-100 uppercase tracking-wider">
            Quy trình mới
          </span>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3.5 pb-3.5 space-y-2">
        {/* 1. Eligibility */}
        <Section title="Xác thực & tài khoản" icon={ShieldCheck} defaultOpen>
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              nf.eligibility.kycStatus === 'APPROVED'
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : nf.eligibility.kycStatus === 'PENDING'
                  ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                  : 'bg-red-50 text-red-600 ring-1 ring-red-200'
            }`}>
              <ShieldCheck className="h-3 w-3" />
              KYC: {nf.eligibility.kycStatus === 'APPROVED' ? 'Đã xác thực' : nf.eligibility.kycStatus === 'PENDING' ? 'Đang chờ' : 'Chưa đạt'}
            </span>
          </div>
          <InfoRow label="Tên KYC">{nf.eligibility.kycFullName}</InfoRow>

          <div className="rounded-lg bg-gray-50 p-2.5 border border-gray-100 space-y-1.5">
            <div className="flex items-center gap-2">
              <Landmark className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Tài khoản nhận tiền</span>
            </div>
            <InfoRow label="Ngân hàng">{nf.eligibility.bankInfo.bankName}</InfoRow>
            <InfoRow label="Chủ TK">{nf.eligibility.bankInfo.accountHolderName}</InfoRow>
            <InfoRow label="Số TK">
              {nf.eligibility.bankInfo.accountNumber.replace(/(.{4})/g, '$1 ').trim()}
            </InfoRow>
          </div>

          {nf.eligibility.credibilityFiles.length > 0 && (
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Hồ sơ năng lực</p>
              <div className="space-y-1">
                {nf.eligibility.credibilityFiles.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 text-xs text-gray-600">
                    <FileText className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-bold truncate flex-1">{f.name}</span>
                    <span className="text-[10px] text-gray-400 shrink-0">{f.sizeKb}KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {nf.eligibility.credibilityPitch && (
            <InfoRow label="Giới thiệu năng lực">
              <p className="text-[11px] font-medium text-gray-600 leading-relaxed italic">{nf.eligibility.credibilityPitch}</p>
            </InfoRow>
          )}
        </Section>

        {/* 2. Campaign Core */}
        <Section title="Thông tin chiến dịch" icon={Target} defaultOpen>
          {/* Image gallery */}
          {nf.campaignImages.length > 0 && (
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Hình ảnh ({nf.campaignImages.length})</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {nf.campaignImages.map((img) => (
                  <div
                    key={img.id}
                    className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 ${
                      img.id === nf.coverImageId ? 'border-[#ff5e14] ring-1 ring-[#ff5e14]/20' : 'border-gray-200'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    {img.id === nf.coverImageId && (
                      <span className="absolute bottom-0 inset-x-0 bg-[#ff5e14]/90 text-white text-[7px] font-black text-center py-0.5 uppercase tracking-wider">
                        Bìa
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <InfoRow label="Mục tiêu">{formatVnd(nf.targetAmount)}</InfoRow>
          <InfoRow label="Mô tả chi tiết">
            <p className="text-[11px] font-medium text-gray-600 leading-relaxed max-h-24 overflow-y-auto custom-scrollbar">
              {nf.objective}
            </p>
          </InfoRow>

          <div className="grid grid-cols-2 gap-2">
            <InfoRow label="Danh mục">{request.category || '—'}</InfoRow>
            <InfoRow label="Đối tượng thụ hưởng">{nf.beneficiaryType}</InfoRow>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <InfoRow label="Khu vực">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                {nf.region}
              </span>
            </InfoRow>
            <InfoRow label="Thời gian">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                {new Date(nf.startDate).toLocaleDateString('vi-VN')} — {new Date(nf.endDate).toLocaleDateString('vi-VN')}
              </span>
            </InfoRow>
          </div>

          <InfoRow label="Lời cảm ơn">
            <p className="text-[11px] font-medium text-gray-500 italic">"{nf.thankMessage}"</p>
          </InfoRow>
        </Section>

        {/* 3. Milestones */}
        <Section title={`Giai đoạn (${nf.milestones.length})`} icon={Target}>
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
              <span className="text-gray-400">Tổng giai đoạn</span>
              <span className={milestoneMatch ? 'text-emerald-600' : 'text-amber-600'}>
                {formatVnd(milestoneTotal)} / {formatVnd(nf.targetAmount)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${milestoneMatch ? 'bg-emerald-500' : milestoneTotal > nf.targetAmount ? 'bg-red-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min((milestoneTotal / nf.targetAmount) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Milestone list */}
          <div className="space-y-2 mt-1">
            {nf.milestones.map((m, idx) => (
              <div key={m.id} className="rounded-lg border border-gray-100 p-2.5 bg-gray-50/50">
                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ff5e14] text-[9px] font-black text-white mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-gray-800">{m.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{m.description}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] font-black text-[#ff5e14]">{formatVnd(m.plannedAmount)}</span>
                      <span className="text-[9px] text-gray-400 italic truncate max-w-[55%]">{m.releaseCondition}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 4. Terms & Acknowledgements */}
        <Section title="Điều khoản & cam kết" icon={FileText}>
          <div className="space-y-1.5">
            <AckCheck label="Đã đọc quy định pháp lý" ok={nf.acknowledgements.legalRead} />
            <AckCheck label="Đồng ý SLA duyệt hồ sơ" ok={nf.acknowledgements.slaAccepted} />
            <AckCheck label="Chấp nhận chính sách vượt mục tiêu" ok={nf.acknowledgements.overfundPolicyAccepted} />
            <AckCheck label="Chấp nhận điều khoản sử dụng" ok={nf.acknowledgements.termsAccepted} />
            <AckCheck label="Cam kết minh bạch tài chính" ok={nf.acknowledgements.transparencyAccepted} />
            <AckCheck label="Chịu trách nhiệm pháp lý" ok={nf.acknowledgements.legalLiabilityAccepted} />
          </div>
          <div className={`mt-2 rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${ackAll ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
            {ackAll ? 'Đã chấp nhận tất cả điều khoản ✓' : `Còn ${Object.values(nf.acknowledgements).filter((v) => !v).length} điều khoản chưa chấp nhận`}
          </div>
        </Section>

        {/* Readiness Summary */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1.5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tóm tắt sẵn sàng</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'KYC', ok: nf.eligibility.kycStatus === 'APPROVED' },
              { label: 'Ngân hàng', ok: Boolean(nf.eligibility.bankInfo.accountNumber) },
              { label: 'Milestones', ok: milestoneMatch },
              { label: 'Điều khoản', ok: ackAll },
              { label: 'Hồ sơ năng lực', ok: nf.eligibility.credibilityFiles.length > 0 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                {item.ok ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-400" />
                )}
                <span className={`text-[10px] font-bold ${item.ok ? 'text-gray-600' : 'text-gray-400'}`}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disable action for approved */}
        {isApproved && (
          <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 space-y-2">
            <div className="italic text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Ghi chú vô hiệu hóa:
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

        {/* Actions for pending */}
        {isPending && (
          <div className="border-t border-gray-100 pt-3 space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Ghi chú phản hồi <span className="text-red-500">(Bắt buộc nếu từ chối)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập lý do từ chối hoặc ghi chú góp ý..."
                className="w-full rounded-xl border-gray-200 text-sm shadow-sm focus:border-[#ff5e14] focus:ring-4 focus:ring-[#ff5e14]/5 p-2.5"
                rows={3}
              />
            </div>

            {onSendCommitmentEmail && (
              <button
                onClick={onSendCommitmentEmail}
                disabled={!kycOk || commitmentSigned}
                title={
                  commitmentSigned
                    ? 'Đã ký cam kết'
                    : !kycOk
                      ? 'Cần xác minh KYC trước'
                      : 'Gửi yêu cầu ký cam kết qua email'
                }
                className="w-full rounded-xl border-2 border-dashed border-[#ff5e14]/30 py-2.5 text-[11px] font-black uppercase tracking-widest text-[#ff5e14] hover:border-[#ff5e14] hover:bg-[#ff5e14]/5 disabled:opacity-40 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Gửi mail yêu cầu ký cam kết
              </button>
            )}
            {commitmentSigned && (
              <p className="text-[10px] text-center font-bold text-emerald-600 italic">
                (Người dùng đã ký bản cam kết này)
              </p>
            )}

            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  if (note.trim()) {
                    onReject(note);
                    setNote('');
                  } else {
                    toast.error('Vui lòng nhập lý do từ chối');
                  }
                }}
                className="flex-1 rounded-xl bg-gray-100 py-2.5 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-200 transition-all active:scale-95 border border-gray-200"
              >
                Từ chối
              </button>
              <button
                onClick={() => onApprove(note)}
                disabled={!kycOk || !commitmentSigned}
                title={!kycOk ? 'Cần xác minh KYC trước' : !commitmentSigned ? 'Chờ ký cam kết' : ''}
                className="flex-[1.5] rounded-xl bg-[#ff5e14] py-2.5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-[#ea550c] disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg shadow-green-100 transition-all active:scale-95"
              >
                {!kycOk || !commitmentSigned ? 'Chưa đủ điều kiện' : 'Duyệt yêu cầu'}
              </button>
            </div>

            {/* Quick action */}
            {!kycOk && onNavigateToKYC && (
              <button
                onClick={onNavigateToKYC}
                className="w-full py-2.5 bg-blue-600 rounded-xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-95"
              >
                <ShieldCheck className="h-4 w-4" />
                Đi tới trang KYC
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
