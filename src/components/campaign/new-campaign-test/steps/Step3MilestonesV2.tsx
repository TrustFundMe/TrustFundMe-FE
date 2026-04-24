'use client';

import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { Milestone, NewCampaignTestState } from '../types';
import { Field, FIELD_INPUT_CLS, FIELD_TEXTAREA_CLS } from '../parts/Field';
import { MilestoneMetaBar } from '../parts/MilestoneMetaBar';
import { AddMilestoneButton } from '../parts/AddMilestoneButton';
import { NextStepBridge } from '../parts/NextStepBridge';
import { EmptyMilestonesHint } from '../parts/EmptyMilestonesHint';
import {
  MILESTONE_LIMITS,
  validateMilestone,
  validateMilestoneStep,
  type MilestoneInput,
} from '../validation/milestoneValidation';

interface Props {
  state: NewCampaignTestState;
  /**
   * `milestoneTotal` không dùng nữa ở Bước 3 (đã chuyển sang Bước 4),
   * giữ trong props để tương thích với chữ ký cũ.
   */
  milestoneTotal?: number;
  onPatch: (patch: Partial<NewCampaignTestState>) => void;
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
}

/**
 * Adapter: Milestone (legacy shape: description, releaseCondition, plannedAmount, ...)
 *      → MilestoneInput (V2: goal, evidence, estimatedStart?, estimatedEnd?)
 *
 * Đọc thêm `estimatedStart` / `estimatedEnd` nếu có (sẽ được lưu vào legacy
 * dưới dạng cast — TS cho phép vì legacy không khai báo). Backend chưa cần đụng.
 */
function toV2(m: Milestone): MilestoneInput {
  const anyM = m as unknown as Milestone & { estimatedStart?: string; estimatedEnd?: string };
  return {
    id: m.id,
    title: m.title ?? '',
    goal: m.description ?? '',
    evidence: m.releaseCondition ?? '',
    estimatedStart: anyM.estimatedStart,
    estimatedEnd: anyM.estimatedEnd,
  };
}

function TrashIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path d="M5 6h10M8 6V4h4v2M6 6l1 11h6l1-11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 9v6M12 9v6" strokeLinecap="round" />
    </svg>
  );
}

export default function Step3MilestonesV2({ state, onPatch, onPrev, onNext }: Props) {
  // Lazy validation — chỉ show error sau khi user blur hoặc bấm "Tiếp tục" lần đầu.
  const [touched, setTouched] = useState<Record<string, Partial<Record<keyof MilestoneInput | 'all', boolean>>>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);

  const v2List = useMemo(() => state.milestones.map(toV2), [state.milestones]);
  const stepValidation = useMemo(() => validateMilestoneStep(v2List), [v2List]);

  const updateMilestone = (id: string, patch: Partial<Milestone & { estimatedStart?: string; estimatedEnd?: string }>) => {
    onPatch({
      milestones: state.milestones.map((m) => (m.id === id ? ({ ...m, ...patch } as Milestone) : m)),
    });
  };

  const markTouched = (id: string, field: keyof MilestoneInput | 'all') => {
    setTouched((prev) => ({ ...prev, [id]: { ...prev[id], [field]: true } }));
  };

  const addMilestone = () => {
    if (state.milestones.length >= MILESTONE_LIMITS.hardMax) return;
    const newId = `m-${Math.random().toString(36).slice(2, 9)}`;
    onPatch({
      milestones: [
        ...state.milestones,
        {
          id: newId,
          title: `Đợt ${state.milestones.length + 1}`,
          description: '',
          plannedAmount: 0, // legacy field — Bước 4 vẫn dùng
          releaseCondition: '',
        },
      ],
    });
  };

  const removeMilestone = (id: string) => {
    if (state.milestones.length <= 1) return;
    onPatch({
      milestones: state.milestones.filter((m) => m.id !== id),
      budgetLines: state.budgetLines.filter((b) => b.milestoneId !== id),
    });
  };

  const handleNext = () => {
    if (stepValidation.ok) {
      onNext();
    } else {
      setShowAllErrors(true);
      // Focus vào card lỗi đầu tiên
      const firstBadId = state.milestones.find((m) => {
        const e = stepValidation.perItem[m.id];
        return e && (e.title || e.goal || e.evidence || e.dateRange);
      })?.id;
      if (firstBadId) {
        const el = document.querySelector<HTMLElement>(`[data-milestone-card="${firstBadId}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const isFirstRunBanner =
    state.milestones.length === 1 &&
    (state.milestones[0]?.title?.length ?? 0) <= 8 &&
    !(state.milestones[0]?.description ?? '').trim();

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-xl font-semibold tracking-tight text-gray-900 md:text-2xl">
        Bước 3 — Các giai đoạn
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-gray-600">
        Chia chiến dịch thành các giai đoạn rõ ràng. Mỗi giai đoạn có mục tiêu và bằng chứng hoàn
        thành cụ thể. Phần ngân sách sẽ phân bổ ở <strong className="font-semibold">Bước 4 — Dự toán</strong>.
      </p>

      <MilestoneMetaBar count={state.milestones.length} valid={stepValidation.ok} />

      <div className="mt-5">
        <EmptyMilestonesHint visible={isFirstRunBanner} />

        <div className="space-y-4">
          {state.milestones.map((m, idx) => {
            const v2 = toV2(m);
            const errors = validateMilestone(v2);
            const t = touched[m.id] ?? {};
            const showErr = (field: keyof MilestoneInput | 'dateRange') =>
              showAllErrors || (field !== 'dateRange' && (t as Record<string, boolean>)[field]);

            return (
              <motion.div
                key={m.id}
                data-milestone-card={m.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 focus-within:border-brand focus-within:ring-2 focus-within:ring-orange-100 md:p-5"
              >
                {/* Header */}
                <div className="mb-3 flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-brand">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                      Giai đoạn {idx + 1}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={state.milestones.length <= 1}
                    onClick={() => removeMilestone(m.id)}
                    aria-label={`Xoá giai đoạn ${idx + 1}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                  >
                    <TrashIcon />
                  </button>
                </div>

                {/* Body */}
                <div className="space-y-4">
                  <Field
                    label="Tên giai đoạn"
                    required
                    error={showErr('title') ? errors.title : undefined}
                  >
                    {(p) => (
                      <input
                        {...p}
                        className={`${FIELD_INPUT_CLS} font-semibold`}
                        value={m.title}
                        maxLength={MILESTONE_LIMITS.titleMax}
                        placeholder="VD: Đợt 1 — Cứu trợ khẩn cấp"
                        onChange={(e) => updateMilestone(m.id, { title: e.target.value })}
                        onBlur={() => markTouched(m.id, 'title')}
                      />
                    )}
                  </Field>

                  <Field
                    label="Mục tiêu cụ thể của giai đoạn"
                    required
                    hint="Mô tả ngắn gọn kết quả bạn cam kết đạt được."
                    valueLength={(m.description ?? '').length}
                    maxLength={MILESTONE_LIMITS.goalMax}
                    error={showErr('goal') ? errors.goal : undefined}
                  >
                    {(p) => (
                      <textarea
                        {...p}
                        rows={3}
                        className={FIELD_TEXTAREA_CLS}
                        value={m.description}
                        maxLength={MILESTONE_LIMITS.goalMax}
                        placeholder="VD: Phân phối nhu yếu phẩm cho 200 hộ tại xã X trong 7 ngày đầu sau bão."
                        onChange={(e) => updateMilestone(m.id, { description: e.target.value })}
                        onBlur={() => markTouched(m.id, 'goal')}
                      />
                    )}
                  </Field>

                  <Field
                    label="Tiêu chí hoàn thành / Bằng chứng"
                    required
                    hint="Bằng chứng cần thiết để giai đoạn này được duyệt qua."
                    valueLength={(m.releaseCondition ?? '').length}
                    maxLength={MILESTONE_LIMITS.evidenceMax}
                    error={showErr('evidence') ? errors.evidence : undefined}
                  >
                    {(p) => (
                      <textarea
                        {...p}
                        rows={2}
                        className={FIELD_TEXTAREA_CLS}
                        value={m.releaseCondition}
                        maxLength={MILESTONE_LIMITS.evidenceMax}
                        placeholder="VD: Có biên bản nhận hàng có chữ ký trưởng thôn + ảnh."
                        onChange={(e) => updateMilestone(m.id, { releaseCondition: e.target.value })}
                        onBlur={() => markTouched(m.id, 'evidence')}
                      />
                    )}
                  </Field>

                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-gray-800">
                      Thời gian dự kiến <span className="font-normal text-gray-400">(tuỳ chọn)</span>
                    </p>
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                      <Field label="Bắt đầu" hint="">
                        {(p) => (
                          <input
                            {...p}
                            type="date"
                            className={FIELD_INPUT_CLS}
                            value={v2.estimatedStart ?? ''}
                            onChange={(e) =>
                              updateMilestone(m.id, { estimatedStart: e.target.value || undefined })
                            }
                          />
                        )}
                      </Field>
                      <span className="hidden text-gray-400 sm:inline" aria-hidden>
                        →
                      </span>
                      <Field label="Kết thúc" hint="">
                        {(p) => (
                          <input
                            {...p}
                            type="date"
                            className={FIELD_INPUT_CLS}
                            value={v2.estimatedEnd ?? ''}
                            onChange={(e) =>
                              updateMilestone(m.id, { estimatedEnd: e.target.value || undefined })
                            }
                          />
                        )}
                      </Field>
                    </div>
                    {errors.dateRange && (
                      <p role="alert" className="mt-1.5 text-[11px] font-medium text-red-600">
                        {errors.dateRange}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <AddMilestoneButton count={state.milestones.length} onAdd={addMilestone} />

        <NextStepBridge />
      </div>

      {/* Navigation */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200/70 pt-5">
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
          onClick={handleNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className={`rounded-full px-7 py-2.5 text-sm font-semibold shadow-sm transition ${
            stepValidation.ok
              ? 'bg-brand text-white hover:bg-brand-hover'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          {stepValidation.ok ? 'Tiếp tục' : 'Kiểm tra lại'}
        </motion.button>
      </div>
    </div>
  );
}
