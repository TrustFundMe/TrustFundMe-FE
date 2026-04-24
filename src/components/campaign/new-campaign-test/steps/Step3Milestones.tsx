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
  'rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition duration-150 focus:border-brand focus:ring-2 focus:ring-orange-100';

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
  const diff = milestoneTotal - target;
  const barColor = milestonesOk ? '#10b981' : diff > 0 ? '#ef4444' : '#f97316';
  const scaleX = target > 0 ? Math.min(milestoneTotal / target, 1) : 0;

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

  // Cumulative progress for each milestone
  let cumulative = 0;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-xl font-bold tracking-tight text-gray-800">Bước 3 — Mốc giải ngân</h2>
      <p className="mt-0.5 text-sm text-gray-500">
        Thiết lập các chặng giải ngân. Chặng cuối tự động nhận phần còn lại. Tổng phải bằng mục tiêu quyên góp.
      </p>

      {/* Overall progress */}
      <div className="mt-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">Tổng giải ngân</p>
          <motion.span
            animate={{ color: milestonesOk ? '#059669' : diff > 0 ? '#dc2626' : '#6b7280' }}
            className="text-sm font-semibold tabular-nums"
          >
            {formatVnd(milestoneTotal)} / {formatVnd(target)} đ
            {diff !== 0 && target > 0 && (
              <span className="ml-1 text-xs font-medium">
                ({diff > 0 ? '+' : ''}{formatVnd(diff)})
              </span>
            )}
            {target > 0 && (
              <span className="ml-1.5 text-xs font-medium text-gray-400">
                ({((milestoneTotal / target) * 100).toFixed(1)}%)
              </span>
            )}
          </motion.span>
        </div>

        {target > 0 && (
          <div className="mb-5 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full w-full origin-left rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{ transform: `scaleX(${scaleX})`, backgroundColor: barColor }}
            />
          </div>
        )}
      </div>

      {/* Milestone cards */}
      <div className="space-y-4">
        {state.milestones.map((m, idx) => {
          const isLast = idx === state.milestones.length - 1;
          const sumBeforeLast = state.milestones
            .slice(0, state.milestones.length - 1)
            .reduce((sum, item) => sum + (item.plannedAmount || 0), 0);
          const autoLastAmount = Math.max(target - sumBeforeLast, 0);
          const effectiveAmount = isLast ? autoLastAmount : m.plannedAmount;
          const pct = target > 0 ? (effectiveAmount / target) * 100 : 0;
          cumulative += effectiveAmount;
          const cumulativePct = target > 0 ? (cumulative / target) * 100 : 0;
          const milestoneBarScale = target > 0 ? Math.min(effectiveAmount / target, 1) : 0;

          return (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50/80"
            >
              {/* Milestone progress bar (thin, at top) */}
              <div className="h-1.5 w-full bg-gray-100">
                <div
                  className="h-full rounded-r-full transition-all duration-500"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    backgroundColor: pct > 50 ? '#f59e0b' : '#f97316',
                  }}
                />
              </div>

              <div className="p-4">
                {/* Header row */}
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-brand">
                    {idx + 1}
                  </span>
                  <input
                    className={`${inCls} flex-1 font-semibold`}
                    value={m.title}
                    placeholder="Tên mốc giải ngân..."
                    onChange={(e) => updateMilestone(m.id, { title: e.target.value })}
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="whitespace-nowrap rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold tabular-nums text-brand">
                      {pct.toFixed(1)}%
                    </span>
                    <button
                      type="button"
                      disabled={state.milestones.length <= 1}
                      onClick={() => removeMilestone(m.id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 ring-1 ring-gray-200 transition hover:bg-red-50 hover:text-red-600 hover:ring-red-100 disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Xóa mốc"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-2.5">
                  <textarea
                    className={`${inCls} w-full resize-none text-sm leading-relaxed`}
                    rows={2}
                    placeholder="Mô tả mục tiêu cần đạt cho mốc này..."
                    value={m.description}
                    onChange={(e) => updateMilestone(m.id, { description: e.target.value })}
                  />
                </div>

                {/* Release condition + Amount */}
                <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_180px]">
                  <input
                    className={`${inCls} text-sm`}
                    placeholder="Điều kiện giải ngân..."
                    value={m.releaseCondition}
                    onChange={(e) => updateMilestone(m.id, { releaseCondition: e.target.value })}
                  />
                  <div className="relative">
                    <input
                      type="number"
                      className={`${inCls} w-full pr-11 text-right font-mono tabular-nums disabled:bg-gray-100 disabled:text-gray-500`}
                      value={effectiveAmount || ''}
                      disabled={isLast}
                      placeholder="0"
                      onChange={(e) => updateMilestone(m.id, { plannedAmount: Number(e.target.value) || 0 })}
                    />
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400">
                      đ
                    </span>
                  </div>
                </div>

                {/* Footer info */}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  {isLast && <p>Tự điền phần còn lại theo mục tiêu.</p>}
                  <p className="ml-auto tabular-nums">
                    Lũy kế: {formatVnd(cumulative)} đ ({cumulativePct.toFixed(1)}%)
                  </p>
                </div>

                {pct > 50 && (
                  <p className="mt-1 text-xs font-medium text-amber-600">
                    ⚠ Chặng này chiếm {pct.toFixed(1)}% mục tiêu.
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
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-orange-200 bg-orange-50/40 py-3 text-sm font-semibold text-brand transition hover:bg-orange-50 sm:w-auto sm:px-6"
      >
        <span className="text-base leading-none">+</span> Thêm mốc giải ngân
      </button>

      {/* Navigation */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <motion.button
          type="button"
          onClick={onPrev}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
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
