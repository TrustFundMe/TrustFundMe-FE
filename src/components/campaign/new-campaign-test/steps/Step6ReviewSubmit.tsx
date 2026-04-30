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
}

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

const CHECK_LABELS: Record<string, string> = {
  coreOk: 'Thông tin chiến dịch',
  budgetOk: 'Dự toán = mục tiêu',
  milestoneOk: 'Mốc giải ngân = mục tiêu',
  bankOk: 'Tài khoản ngân hàng',
  acknowledgementsOk: 'Chấp nhận điều khoản',
  gatesOk: 'KYC & đối soát cổng',
};

export default function Step6ReviewSubmit({
  state,
  checks,
  onOpenFullPreview,
  onPrev,
  onSubmit,
  canSubmit,
}: Props) {
  return (
    <div className="rounded-xl bg-white p-4 md:p-5">
      <h2 className="text-lg font-bold tracking-tight text-black">Bước 5 — Tóm tắt & Gửi duyệt</h2>
      <p className="mt-1 text-sm text-gray-500">
        Kiểm tra thông tin, ký xác nhận điện tử, sau đó gửi hồ sơ chờ Staff duyệt.
      </p>

      {/* Summary card */}
      <div className="mt-5 flex gap-3 rounded-xl bg-gray-50 p-3">
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-200">
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
          <p className="truncate text-sm font-semibold text-gray-800">{state.campaignCore.title}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
            {state.campaignCore.targetAmount.toLocaleString('vi-VN')}
            <span className="ml-1 text-sm font-medium text-gray-400">đ</span>
          </p>
          <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-gray-500">
            <span>{state.milestones.length} mốc giải ngân</span>
            <span>·</span>
            <span>{state.budgetLines.length} hạng mục</span>
            <span>·</span>
            <span>{state.milestones.reduce((s, m) => s + (m.categories?.length || 0), 0)} danh mục chi tiêu</span>
            <span>·</span>
            <span>{state.campaignCore.region}</span>
          </div>
        </div>
      </div>

      {/* Preview button */}
      <div className="mt-4">
        <motion.button
          type="button"
          onClick={onOpenFullPreview}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-orange-100"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2.458 10C3.732 6.943 6.523 5 10 5s6.268 1.943 7.542 5c-1.274 3.057-4.065 5-7.542 5S3.732 13.057 2.458 10z" />
            <circle cx="10" cy="10" r="2" />
          </svg>
          Xem trước trang quyên góp công khai
        </motion.button>
      </div>

      {/* Validation checklist */}
      <div className="mt-5 rounded-xl bg-gray-50 p-3">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
          Kiểm tra tự động trước khi gửi
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(checks)
            .filter(([key]) => key !== 'otpOk')
            .map(([key, ok]) => (
            <div key={key} className="flex items-center gap-2">
              <CheckIcon ok={ok} />
              <span className={`text-sm ${ok ? 'text-gray-700' : 'text-red-500 font-medium'}`}>
                {CHECK_LABELS[key] ?? key}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Milestone categories review */}
      {state.milestones.some((m) => m.categories && m.categories.length > 0) && (
        <div className="mt-6 rounded-xl bg-gray-50 p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Danh mục chi tiêu theo mốc giải ngân
          </p>
          <div className="space-y-3">
            {state.milestones.map((m) => {
              if (!m.categories || m.categories.length === 0) return null;
              return (
                <div key={m.id}>
                  <p className="text-sm font-semibold text-gray-700">{m.title}</p>
                  {m.categories.map((cat) => (
                    <div key={cat.id} className="ml-4 mt-1">
                      <p className="text-xs font-semibold text-gray-600">
                        {cat.name || '(Chưa đặt tên)'}
                        <span className="ml-2 font-normal text-gray-400">— {cat.items.length} hạng mục</span>
                        <span className="ml-2 font-bold text-orange-500 tabular-nums">
                          {cat.items.reduce((s, i) => s + (Number(i.expectedQuantity) || 0) * (Number(i.expectedPrice) || 0), 0).toLocaleString('vi-VN')} đ
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <StepFooter canNext={canSubmit} onPrev={onPrev} onNext={onSubmit} nextLabel="Gửi duyệt hồ sơ" />
    </div>
  );
}
