'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { BudgetLine, NewCampaignTestState } from '../types';

interface Props {
  state: NewCampaignTestState;
  budgetTotal: number;
  onPatch: (patch: Partial<NewCampaignTestState>) => void;
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
}

const CATEGORY_LABELS: Record<BudgetLine['category'], string> = {
  DIRECT_AID: 'Hỗ trợ trực tiếp',
  LOGISTICS: 'Vận chuyển & kho',
  OPERATIONS: 'Vận hành',
  COMPLIANCE_AUDIT: 'Kiểm toán',
  COMMUNICATION: 'Truyền thông',
};

const categories = Object.keys(CATEGORY_LABELS) as BudgetLine['category'][];

const MAX_VND = 9_999_999_999_999;

function parseAmountDigits(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return 0;
  const n = Number(digits);
  if (!Number.isFinite(n)) return 0;
  return Math.min(n, MAX_VND);
}

/** Đọc nhanh số tiền (không thay thế kiểm toán — chỉ hỗ trợ nhập liệu). */
function readVndQuick(n: number): string {
  if (!n || !Number.isFinite(n)) return '';
  if (n < 1_000) return `${n} đồng`;
  if (n < 1_000_000) {
    const k = n / 1_000;
    return `Khoảng ${k.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} nghìn đồng`;
  }
  if (n < 1_000_000_000) {
    const m = n / 1_000_000;
    const s = Number.isInteger(m) ? m.toLocaleString('vi-VN') : m.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
    return `Khoảng ${s} triệu đồng`;
  }
  const t = n / 1_000_000_000;
  const s = Number.isInteger(t) ? t.toLocaleString('vi-VN') : t.toLocaleString('vi-VN', { maximumFractionDigits: 3 });
  return `Khoảng ${s} tỷ đồng`;
}

function newBudgetLineId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `b-${Math.random().toString(36).slice(2, 11)}`;
}

function InfoIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-brand" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M5 6h10M8 6V4h4v2M6 6l1 11h6l1-11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 9v6M12 9v6" strokeLinecap="round" />
    </svg>
  );
}

export default function Step3BudgetMilestones({ state, budgetTotal, onPatch, onPrev, onNext, canNext }: Props) {
  const target = state.campaignCore.targetAmount;
  const diff = budgetTotal - target;
  const budgetsOk = target > 0 && diff === 0;
  const over = target > 0 && diff > 0;

  const barColor = budgetsOk ? '#10b981' : over ? '#ef4444' : '#f97316';
  const scaleX = target > 0 ? Math.min(budgetTotal / target, 1) : 0;

  const sortedLines = useMemo(
    () => [...state.budgetLines].sort((a, b) => a.priority - b.priority),
    [state.budgetLines],
  );

  const updateBudget = (id: string, patch: Partial<BudgetLine>) => {
    onPatch({ budgetLines: state.budgetLines.map((b) => (b.id === id ? { ...b, ...patch } : b)) });
  };

  const reorderLine = (id: string, newOneBased: number) => {
    const sorted = [...state.budgetLines].sort((a, b) => a.priority - b.priority);
    const oldIdx = sorted.findIndex((l) => l.id === id);
    if (oldIdx < 0 || newOneBased === oldIdx + 1) return;
    const item = sorted[oldIdx]!;
    const without = sorted.filter((l) => l.id !== id);
    const insertAt = Math.max(0, Math.min(newOneBased - 1, without.length));
    const merged = [...without.slice(0, insertAt), item, ...without.slice(insertAt)];
    onPatch({ budgetLines: merged.map((l, i) => ({ ...l, priority: i + 1 })) });
  };

  const addBudgetLine = () => {
    const nextPri = state.budgetLines.length + 1;
    onPatch({
      budgetLines: [
        ...state.budgetLines,
        {
          id: newBudgetLineId(),
          category: 'DIRECT_AID',
          title: '',
          plannedAmount: 0,
          priority: nextPri,
          notes: '',
        },
      ],
    });
  };

  const removeBudgetLine = (id: string) => {
    if (state.budgetLines.length <= 1) return;
    const next = state.budgetLines
      .filter((b) => b.id !== id)
      .map((b, i) => ({ ...b, priority: i + 1 }));
    onPatch({ budgetLines: next });
  };

  const inCls =
    'rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-800 outline-none transition duration-150 focus:border-brand focus:ring-2 focus:ring-orange-100';

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-xl font-bold tracking-tight text-gray-800">Bước 3 — Dự toán ngân sách</h2>
      <p className="mt-0.5 text-sm text-gray-500">Tổng hạng mục phải bằng đúng mục tiêu quyên góp.</p>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-orange-100 bg-orange-50/80 px-3.5 py-2.5">
        <InfoIcon />
        <p className="text-justify text-sm leading-relaxed text-gray-900">
          Nền tảng áp dụng mô hình <strong>Quỹ Mục Tiêu Minh Bạch</strong>. Toàn bộ tiền quyên góp gom vào một quỹ tổng
          và giải ngân theo các mốc bạn thiết lập. Các hạng mục dưới đây đóng vai trò <strong>dự toán ngân sách</strong>,
          không phải ví riêng biệt.
        </p>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">Hạng mục chi phí</p>
          <span
            className={`text-sm font-semibold tabular-nums ${
              budgetsOk ? 'text-emerald-600' : over ? 'text-red-600' : 'text-gray-600'
            }`}
          >
            {budgetTotal.toLocaleString('vi-VN')} / {target.toLocaleString('vi-VN')} đ
            {diff !== 0 && target > 0 && (
              <span className="ml-1 text-xs font-medium">
                ({diff > 0 ? '+' : ''}
                {diff.toLocaleString('vi-VN')})
              </span>
            )}
            {target > 0 && (
              <span className="ml-1.5 text-xs font-medium text-gray-400">
                ({((budgetTotal / target) * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%)
              </span>
            )}
          </span>
        </div>

        {target > 0 && (
          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full w-full origin-left rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{
                transform: `scaleX(${scaleX})`,
                backgroundColor: barColor,
              }}
            />
          </div>
        )}

        <div className="hidden gap-2 border-b border-gray-100 pb-2 md:grid md:grid-cols-[minmax(0,130px)_minmax(0,1fr)_minmax(0,132px)_52px_64px_44px]">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Danh mục</p>
          <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Mô tả</p>
          <p className="px-1 text-right text-[10px] font-semibold uppercase tracking-wide text-gray-400">Số tiền</p>
          <p className="px-1 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">%</p>
          <p className="px-1 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">Ưu tiên</p>
          <span className="sr-only">Xóa</span>
        </div>

        <div className="space-y-3">
          {sortedLines.map((line) => {
            const pos = sortedLines.findIndex((l) => l.id === line.id) + 1;
            const rowPct = target > 0 && line.plannedAmount > 0 ? (line.plannedAmount / target) * 100 : 0;
            const readout = readVndQuick(line.plannedAmount);

            return (
              <motion.div
                key={line.id}
                layout
                className="grid grid-cols-1 gap-2 rounded-xl border border-gray-100 bg-gray-50/50 p-3 md:grid-cols-[minmax(0,130px)_minmax(0,1fr)_minmax(0,132px)_52px_64px_44px] md:border-0 md:bg-transparent md:p-0"
              >
                <select
                  className={`${inCls} text-xs`}
                  value={line.category}
                  onChange={(e) => updateBudget(line.id, { category: e.target.value as BudgetLine['category'] })}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>

                <input
                  className={`${inCls} text-sm`}
                  placeholder="Tên hạng mục..."
                  value={line.title}
                  onChange={(e) => updateBudget(line.id, { title: e.target.value })}
                />

                <div className="space-y-0.5">
                  <div className="relative">
                    <input
                      inputMode="numeric"
                      autoComplete="off"
                      className={`${inCls} w-full pr-11 text-right font-mono text-sm tabular-nums`}
                      value={line.plannedAmount ? line.plannedAmount.toLocaleString('vi-VN') : ''}
                      placeholder="0"
                      onChange={(e) => updateBudget(line.id, { plannedAmount: parseAmountDigits(e.target.value) })}
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400">
                      đ
                    </span>
                  </div>
                  {readout ? (
                    <p className="text-right text-[10px] leading-tight text-gray-400">{readout}</p>
                  ) : (
                    <p className="text-right text-[10px] text-transparent">.</p>
                  )}
                </div>

                <div className="flex items-start justify-center pt-2 md:pt-2.5">
                  <span className="font-mono text-xs tabular-nums text-gray-500">
                    {target > 0 ? `${rowPct.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%` : '—'}
                  </span>
                </div>

                <div className="flex items-start justify-center">
                  <select
                    className={`${inCls} w-full max-w-[4.5rem] py-1.5 text-center text-xs`}
                    value={pos}
                    onChange={(e) => reorderLine(line.id, Number(e.target.value))}
                    aria-label="Thứ tự ưu tiên"
                  >
                    {sortedLines.map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end md:justify-center">
                  <button
                    type="button"
                    disabled={state.budgetLines.length <= 1}
                    onClick={() => removeBudgetLine(line.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 ring-1 ring-gray-200 transition hover:bg-red-50 hover:text-red-600 hover:ring-red-100 disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Xóa hạng mục"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addBudgetLine}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-orange-200 bg-orange-50/40 py-2.5 text-sm font-semibold text-brand transition hover:bg-orange-50 md:w-auto md:px-5"
        >
          <span className="text-base leading-none">+</span> Thêm hạng mục
        </button>
      </div>

      <div className="mt-4 rounded-xl bg-gray-50 p-3 text-justify text-xs leading-relaxed text-gray-500">
        Nếu chiến dịch vượt mục tiêu: hệ thống vẫn ghi nhận đóng góp trong phạm vi mục đích công bố. Phần vượt được
        công khai cách phân bổ theo chính sách minh bạch của nền tảng.
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
