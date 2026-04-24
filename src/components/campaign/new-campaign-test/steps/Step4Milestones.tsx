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

export default function Step4Milestones({ state, milestoneTotal, onPatch, onPrev, onNext, canNext }: Props) {
  const target = state.campaignCore.targetAmount;
  const milestonesOk = milestoneTotal === target;

  const updateMilestone = (id: string, patch: Partial<Milestone>) => {
    onPatch({ milestones: state.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)) });
  };

  const addMilestone = () => {
    onPatch({
      milestones: [
        ...state.milestones,
        {
          id: Math.random().toString(36).slice(2, 9),
          title: `Đợt ${state.milestones.length + 1}`,
          description: 'Mô tả chặng giải ngân',
          plannedAmount: 0,
          releaseCondition: 'Điều kiện duyệt rút tiền',
        },
      ],
    });
  };

  const removeMilestone = (id: string) => {
    if (state.milestones.length <= 1) return;
    onPatch({ milestones: state.milestones.filter((m) => m.id !== id) });
  };

  const diff = milestoneTotal - target;
  const barOk = target > 0 && milestonesOk;
  const barColor = barOk ? '#10b981' : diff > 0 ? '#ef4444' : '#f97316';
  const scaleX = target > 0 ? Math.min(milestoneTotal / target, 1) : 0;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-xl font-bold tracking-tight text-gray-800">Bước 4 — Mốc giải ngân</h2>
      <p className="mt-0.5 text-sm text-gray-500">
        Thiết lập bao nhiêu chặng cũng được. Chặng cuối tự động nhận phần còn lại của mục tiêu.
      </p>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">Các mốc giải ngân</p>
          <motion.span
            animate={{ color: milestonesOk ? '#059669' : diff > 0 ? '#dc2626' : '#6b7280' }}
            className="text-sm font-semibold tabular-nums"
          >
            {milestoneTotal.toLocaleString('vi-VN')} / {target.toLocaleString('vi-VN')} đ
          </motion.span>
        </div>

        {target > 0 && (
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full w-full origin-left rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{
                transform: `scaleX(${scaleX})`,
                backgroundColor: barColor,
              }}
            />
          </div>
        )}

        <div className="space-y-3">
          {state.milestones.map((m, idx) => {
            const isLast = idx === state.milestones.length - 1;
            const sumBeforeLast = state.milestones
              .slice(0, state.milestones.length - 1)
              .reduce((sum, item) => sum + (item.plannedAmount || 0), 0);
            const autoLastAmount = Math.max(target - sumBeforeLast, 0);
            const effectiveAmount = isLast ? autoLastAmount : m.plannedAmount;
            const pct = target > 0 ? (effectiveAmount / target) * 100 : 0;

            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-gray-50/80 p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-brand">
                    {idx + 1}
                  </span>
                  <input
                    className={`${inCls} flex-1 font-semibold`}
                    value={m.title}
                    onChange={(e) => updateMilestone(m.id, { title: e.target.value })}
                  />
                  <button
                    type="button"
                    disabled={state.milestones.length <= 1}
                    onClick={() => removeMilestone(m.id)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 ring-1 ring-gray-200 transition hover:bg-red-50 hover:text-red-600 hover:ring-red-100 disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Xóa mốc"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                      <path d="M5 6h10M8 6V4h4v2M6 6l1 11h6l1-11" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 9v6M12 9v6" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="mt-2.5 grid gap-2 sm:grid-cols-[1fr_160px]">
                  <input
                    className={`${inCls} text-sm`}
                    placeholder="Điều kiện để giải ngân mốc này..."
                    value={m.releaseCondition}
                    onChange={(e) => updateMilestone(m.id, { releaseCondition: e.target.value })}
                  />
                  <div className="relative">
                    <input
                      type="number"
                      className={`${inCls} w-full pr-12 text-right tabular-nums disabled:bg-gray-100 disabled:text-gray-500`}
                      value={effectiveAmount || ''}
                      disabled={isLast}
                      onChange={(e) => updateMilestone(m.id, { plannedAmount: Number(e.target.value) || 0 })}
                    />
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      VNĐ
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {isLast && (
                    <p className="text-xs text-gray-400">Tự điền phần còn lại theo mục tiêu.</p>
                  )}
                  {pct > 50 && (
                    <p className="text-xs font-medium text-amber-600">Cảnh báo: chặng này chiếm {pct.toFixed(1)}% mục tiêu.</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addMilestone}
          className="mt-3 flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-brand ring-1 ring-orange-200 hover:bg-orange-50"
        >
          <span className="text-base leading-none">+</span> Thêm mốc
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
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
