'use client';

import { motion } from 'framer-motion';
import { NewCampaignTestState } from '../types';
import StepFooter from '../parts/StepFooter';

interface Props {
  state: NewCampaignTestState;
  checks: Record<string, boolean>;
  onOpenFullPreview: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  /** Optional callback to jump to a specific step index for editing */
  onGoToStep?: (stepIndex: number) => void;
}

/* ─────────────── helpers ─────────────── */

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatMoney(amount: number | undefined): string {
  if (amount == null || isNaN(amount)) return '0 đ';
  return amount.toLocaleString('vi-VN') + ' đ';
}

/* ─────────────── icons ─────────────── */

function CheckIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <svg className="h-4 w-4 shrink-0 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="h-4 w-4 shrink-0 text-red-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  );
}

function EditButton({ label, onClick }: { label: string; onClick?: () => void }) {
  if (!onClick) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-orange-600 transition hover:bg-orange-50 hover:text-orange-700"
    >
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
      {label}
    </button>
  );
}

/* ─────────────── section card wrapper ─────────────── */

function SectionCard({
  icon,
  title,
  editButton,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  editButton?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50">{icon}</div>
          <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        </div>
        {editButton}
      </div>
      {children}
    </div>
  );
}

/* ─────────────── check labels ─────────────── */

const CHECK_LABELS: Record<string, string> = {
  coreOk: 'Thông tin chiến dịch',
  milestoneOk: 'Mốc giải ngân hợp lệ',
  bankOk: 'Tài khoản ngân hàng',
  acknowledgementsOk: 'Chấp nhận điều khoản',
  gatesOk: 'KYC & đối soát cổng',
};

/* ═══════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════ */

export default function Step6ReviewSubmit({
  state,
  checks,
  onOpenFullPreview,
  onPrev,
  onSubmit,
  canSubmit,
  onGoToStep,
}: Props) {
  const milestones = state.milestones;
  const firstMilestoneStart = milestones.length > 0 ? milestones[0]?.startDate : undefined;
  const lastMilestoneEnd =
    milestones.length > 0 ? milestones[milestones.length - 1]?.endDate : undefined;

  return (
    <div className="rounded-xl bg-white p-4 md:p-6">
      {/* ── Header ── */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-green-50 shadow-sm">
          <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900">Tóm tắt & Gửi duyệt</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Kiểm tra lại thông tin, sau đó gửi hồ sơ chờ Staff duyệt.
          </p>
        </div>
      </div>

      {/* ── Campaign summary card ── */}
      <div className="mt-5 flex gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-3 shadow-sm">
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-200">
          {state.campaignCore.coverImageUrl ? (
            <img
              src={state.campaignCore.coverImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg className="h-7 w-7 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="9" cy="9" r="2" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-900">
            {state.campaignCore.title || '(Chưa đặt tên)'}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
            {formatMoney(state.campaignCore.targetAmount)}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 font-medium text-orange-700">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
              {milestones.length} đợt giải ngân
            </span>
            {state.campaignCore.category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
                {state.campaignCore.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Preview button ── */}
      <div className="mt-4">
        <motion.button
          type="button"
          onClick={onOpenFullPreview}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 py-2.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-100"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2.458 10C3.732 6.943 6.523 5 10 5s6.268 1.943 7.542 5c-1.274 3.057-4.065 5-7.542 5S3.732 13.057 2.458 10z" />
            <circle cx="10" cy="10" r="2" />
          </svg>
          Xem trước trang quyên góp công khai
        </motion.button>
      </div>

      {/* ── Detail sections ── */}
      <div className="mt-5 space-y-3">
        {/* Timeline summary */}
        <SectionCard
          icon={
            <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
          title="Thời gian chiến dịch"
          editButton={
            <EditButton label="Sửa" onClick={onGoToStep ? () => onGoToStep(2) : undefined} />
          }
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Bắt đầu</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-gray-800">
                {formatDate(firstMilestoneStart)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Kết thúc</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-gray-800">
                {formatDate(lastMilestoneEnd)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Tổng đợt</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-gray-800">
                {milestones.length} đợt giải ngân
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Bank account info */}
        <SectionCard
          icon={
            <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          }
          title="Tài khoản ngân hàng"
          editButton={
            <EditButton label="Sửa" onClick={onGoToStep ? () => onGoToStep(3) : undefined} />
          }
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-28 shrink-0 text-xs text-gray-400">Ngân hàng</span>
              <span className="text-sm font-medium text-gray-800">
                {state.bankInfo.bankName || '—'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-28 shrink-0 text-xs text-gray-400">Số tài khoản</span>
              <span className="text-sm font-mono font-medium text-gray-800">
                {state.bankInfo.accountNumber || '—'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-28 shrink-0 text-xs text-gray-400">Chủ tài khoản</span>
              <span className="text-sm font-medium text-gray-800">
                {state.bankInfo.accountHolderName || '—'}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Milestones details */}
        {milestones.length > 0 && (
          <SectionCard
            icon={
              <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
            }
            title="Chi tiết các đợt giải ngân"
            editButton={
              <EditButton label="Sửa" onClick={onGoToStep ? () => onGoToStep(2) : undefined} />
            }
          >
            <div className="space-y-2">
              {milestones.map((m, idx) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-gray-100 bg-gray-50/60 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-700">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-bold text-gray-800">{m.title || `Đợt ${idx + 1}`}</p>
                    </div>
                    <span className="whitespace-nowrap text-sm font-bold tabular-nums text-orange-600">
                      {formatMoney(m.plannedAmount)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 pl-7 text-xs text-gray-500">
                    <span>
                      <span className="text-gray-400">Bắt đầu:</span>{' '}
                      <span className="font-medium tabular-nums text-gray-600">{formatDate(m.startDate)}</span>
                    </span>
                    <span>
                      <span className="text-gray-400">Kết thúc:</span>{' '}
                      <span className="font-medium tabular-nums text-gray-600">{formatDate(m.endDate)}</span>
                    </span>
                    {m.evidenceDueAt && (
                      <span>
                        <span className="text-gray-400">Nộp minh chứng:</span>{' '}
                        <span className="font-medium tabular-nums text-gray-600">{formatDate(m.evidenceDueAt)}</span>
                      </span>
                    )}
                  </div>
                  {/* Milestone categories (if any) */}
                  {m.categories && m.categories.length > 0 && (
                    <div className="mt-2 space-y-1 pl-7">
                      {m.categories.map((cat) => (
                        <div key={cat.id} className="text-xs text-gray-500">
                          <span className="font-semibold text-gray-600">
                            {cat.name || '(Chưa đặt tên)'}
                          </span>
                          <span className="ml-1.5 text-gray-400">— {cat.items.length} hạng mục</span>
                          <span className="ml-1.5 font-bold tabular-nums text-orange-500">
                            {formatMoney(
                              cat.items.reduce(
                                (s, i) =>
                                  s + (Number(i.expectedQuantity) || 0) * (Number(i.expectedPrice) || 0),
                                0,
                              ),
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>

      {/* ── Validation checklist ── */}
      <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
        <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Kiểm tra tự động trước khi gửi
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(checks)
            .filter(([key]) => key !== 'otpOk')
            .map(([key, ok]) => (
              <div key={key} className="flex items-center gap-2">
                <CheckIcon ok={ok} />
                <span className={`text-sm ${ok ? 'text-gray-700' : 'font-medium text-red-500'}`}>
                  {CHECK_LABELS[key] ?? key}
                </span>
              </div>
            ))}
        </div>
      </div>

      <StepFooter canNext={canSubmit} onPrev={onPrev} onNext={onSubmit} nextLabel="Gửi duyệt hồ sơ" />
    </div>
  );
}
