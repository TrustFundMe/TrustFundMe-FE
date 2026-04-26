'use client';

import { motion } from 'framer-motion';
import { Milestone, NewCampaignTestState } from '../types';

interface Props {
  state: NewCampaignTestState;
  milestoneTotal: number;
  onPatch: (patch: Partial<NewCampaignTestState>) => void;
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
}

const inCls =
  'rounded-xl border border-[#d9e0e7] bg-white px-3 py-2.5 text-sm text-[#202426] outline-none transition duration-150 focus:border-[#ff5e14] focus:ring-2 focus:ring-[#ff5e14]/20';

function TrashIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M5 6h10M8 6V4h4v2M6 6l1 11h6l1-11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 9v6M12 9v6" strokeLinecap="round" />
    </svg>
  );
}

function formatVnd(n: number): string {
  return n.toLocaleString('vi-VN');
}

export default function Step3Milestones({ state, milestoneTotal, onPatch, onPrev, onNext, canNext }: Props) {
  const target = state.campaignCore.targetAmount;
  const milestonesOk = milestoneTotal === target && target > 0;

  const updateMilestone = (id: string, patch: Partial<Milestone>) => {
    onPatch({ milestones: state.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)) });
  };

  const addMilestone = () => {
    const newId = `m-${Math.random().toString(36).slice(2, 9)}`;
    onPatch({
      milestones: [
        ...state.milestones,
        {
          id: newId,
          title: `Đợt ${state.milestones.length + 1}`,
          description: '',
          plannedAmount: 0,
          releaseCondition: '',
        },
      ],
    });
  };

  const removeMilestone = (id: string) => {
    if (state.milestones.length <= 1) return;
    onPatch({
      milestones: state.milestones.filter((m) => m.id !== id),
      // Also remove budget lines for this milestone
      budgetLines: state.budgetLines.filter((b) => b.milestoneId !== id),
    });
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
      <h2 className="text-xl font-bold tracking-tight text-[#202426]">Bước 3 — Mốc giải ngân</h2>
      <p className="mt-0.5 text-sm text-[#2f3a44]">
        Thiết lập theo từng đợt. Chỉ cần nhập rõ tên đợt và mô tả đợt để staff dễ duyệt.
      </p>

      {/* Tổng giải ngân */}
      <div className="mt-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#dfe6ee] bg-[#fff8f3] px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a5a2b]">Tổng giải ngân</p>
          <motion.span
            animate={{ color: milestonesOk ? '#059669' : '#dc2626' }}
            className="text-sm font-semibold tabular-nums"
          >
            {formatVnd(milestoneTotal)} / {formatVnd(target)} đ
          </motion.span>
        </div>
      </div>

      {/* Milestone cards */}
      <div className="space-y-3">
        {state.milestones.map((m, idx) => {
          const isLast = idx === state.milestones.length - 1;
          const sumBeforeLast = state.milestones
            .slice(0, state.milestones.length - 1)
            .reduce((sum, item) => sum + (item.plannedAmount || 0), 0);
          const autoLastAmount = Math.max(target - sumBeforeLast, 0);
          const effectiveAmount = isLast ? autoLastAmount : m.plannedAmount;
          return (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative ml-4 overflow-visible rounded-xl border border-[#e5ebf1] bg-[#fcfdfd]"
            >
              <span className="absolute -left-6 top-5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#ffd8bf] bg-[#ffefe4] text-sm font-black text-[#ff5e14] shadow-sm">
                    {idx + 1}
              </span>
              <div className="p-3">
                <div className="grid gap-2.5 md:grid-cols-[1fr_1.35fr_auto] md:items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#202426]">Tên đợt</p>
                    <input
                      className={`${inCls} w-full font-semibold`}
                      value={m.title}
                      placeholder="Ví dụ: Đợt 1 - Cứu trợ khẩn cấp"
                      spellCheck={false}
                      onChange={(e) => updateMilestone(m.id, { title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#202426]">Mô tả đợt</p>
                    <textarea
                      className={`${inCls} w-full resize-none text-sm leading-relaxed`}
                      rows={3}
                      placeholder="Mô tả ngắn mục tiêu và công việc chính..."
                      value={m.description}
                      spellCheck={false}
                      onChange={(e) => updateMilestone(m.id, { description: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={state.milestones.length <= 1}
                    onClick={() => removeMilestone(m.id)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#9aa5b1] ring-1 ring-[#d9e0e7] transition hover:bg-[#fff1f1] hover:text-[#dc2626] hover:ring-[#fecaca] disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Xóa mốc"
                  >
                    <TrashIcon />
                  </button>
                </div>

                {isLast && (
                  <p className="mt-1.5 text-xs text-[#2f3a44]">
                    Đợt cuối tự động nhận phần kinh phí còn lại theo mục tiêu chiến dịch.
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add milestone button */}
      <button
        type="button"
        onClick={addMilestone}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#ffcfb3] bg-[#fff4ec] py-2.5 text-sm font-semibold text-[#ff5e14] transition hover:bg-[#ffe9db] sm:w-auto sm:px-5"
      >
        <span className="text-base leading-none">+</span> Thêm mốc giải ngân
      </button>

      {/* Navigation */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
        <motion.button
          type="button"
          onClick={onPrev}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-[#202426] ring-1 ring-[#d9e0e7] hover:bg-[#f7f9fb]"
        >
          Quay lại
        </motion.button>
        <motion.button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          whileHover={canNext ? { scale: 1.02 } : {}}
          whileTap={canNext ? { scale: 0.97 } : {}}
          className="rounded-full bg-brand px-7 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
        >
          Tiếp tục
        </motion.button>
      </div>
    </div>
  );
}
