'use client';

import { motion } from 'framer-motion';
import { useCallback, useMemo, useRef, useState } from 'react';
import { BudgetLine, NewCampaignTestState } from '../types';

interface Props {
  state: NewCampaignTestState;
  onPatch: (patch: Partial<NewCampaignTestState>) => void;
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
}

const MAX_VND = 9_999_999_999_999;

function parseAmountDigits(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return 0;
  const n = Number(digits);
  if (!Number.isFinite(n)) return 0;
  return Math.min(n, MAX_VND);
}

function formatVnd(n: number): string {
  return n.toLocaleString('vi-VN');
}

function newBudgetLineId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `b-${Math.random().toString(36).slice(2, 11)}`;
}

function GripIcon() {
  return (
    <svg className="h-4 w-4 text-gray-300" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <circle cx="5" cy="3" r="1.2" />
      <circle cx="11" cy="3" r="1.2" />
      <circle cx="5" cy="8" r="1.2" />
      <circle cx="11" cy="8" r="1.2" />
      <circle cx="5" cy="13" r="1.2" />
      <circle cx="11" cy="13" r="1.2" />
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

const inCls =
  'rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-800 outline-none transition duration-150 focus:border-brand focus:ring-2 focus:ring-orange-100';

export default function Step4BudgetPerMilestone({ state, onPatch, onPrev, onNext, canNext }: Props) {
  const [activeMilestoneIdx, setActiveMilestoneIdx] = useState(0);
  const [dragId, setDragId] = useState<string | null>(null);
  const dragOverId = useRef<string | null>(null);

  const milestones = state.milestones;
  const activeMilestone = milestones[activeMilestoneIdx];

  // Budget lines for the active milestone
  const milestoneLines = useMemo(
    () =>
      activeMilestone
        ? state.budgetLines
            .filter((b) => b.milestoneId === activeMilestone.id)
            .sort((a, b) => a.priority - b.priority)
        : [],
    [state.budgetLines, activeMilestone],
  );

  const milestoneTarget = activeMilestone
    ? activeMilestoneIdx === milestones.length - 1
      ? Math.max(
          state.campaignCore.targetAmount -
            milestones.slice(0, -1).reduce((s, m) => s + (m.plannedAmount || 0), 0),
          0,
        )
      : activeMilestone.plannedAmount
    : 0;

  const milestoneAllocated = milestoneLines.reduce((s, b) => s + (b.plannedAmount || 0), 0);
  const milestoneDiff = milestoneAllocated - milestoneTarget;
  const milestoneOk = milestoneTarget > 0 && milestoneDiff === 0;
  const milestoneOver = milestoneTarget > 0 && milestoneDiff > 0;
  const barColor = milestoneOk ? '#10b981' : milestoneOver ? '#ef4444' : '#f97316';
  const scaleX = milestoneTarget > 0 ? Math.min(milestoneAllocated / milestoneTarget, 1) : 0;

  // Check all milestones budget status
  const allMilestoneBudgetStatus = useMemo(() => {
    return milestones.map((m, idx) => {
      const lines = state.budgetLines.filter((b) => b.milestoneId === m.id);
      const allocated = lines.reduce((s, b) => s + (b.plannedAmount || 0), 0);
      const mTarget =
        idx === milestones.length - 1
          ? Math.max(
              state.campaignCore.targetAmount -
                milestones.slice(0, -1).reduce((s2, m2) => s2 + (m2.plannedAmount || 0), 0),
              0,
            )
          : m.plannedAmount;
      return { ok: mTarget > 0 && allocated === mTarget, allocated, target: mTarget };
    });
  }, [state.budgetLines, milestones, state.campaignCore.targetAmount]);

  const updateLine = useCallback(
    (id: string, patch: Partial<BudgetLine>) => {
      onPatch({ budgetLines: state.budgetLines.map((b) => (b.id === id ? { ...b, ...patch } : b)) });
    },
    [state.budgetLines, onPatch],
  );

  const addLine = () => {
    if (!activeMilestone) return;
    const nextPri = milestoneLines.length + 1;
    onPatch({
      budgetLines: [
        ...state.budgetLines,
        {
          id: newBudgetLineId(),
          milestoneId: activeMilestone.id,
          category: 'DIRECT_AID',
          title: '',
          plannedAmount: 0,
          priority: nextPri,
          notes: '',
        },
      ],
    });
  };

  const removeLine = (id: string) => {
    if (milestoneLines.length <= 1) return;
    const next = state.budgetLines
      .filter((b) => b.id !== id)
      .map((b, i) => ({ ...b, priority: b.milestoneId === activeMilestone?.id ? i + 1 : b.priority }));
    onPatch({ budgetLines: next });
  };

  // Drag & drop reorder
  const handleDragStart = (id: string) => setDragId(id);
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    dragOverId.current = id;
  };
  const handleDrop = () => {
    if (!dragId || !dragOverId.current || dragId === dragOverId.current || !activeMilestone) {
      setDragId(null);
      return;
    }
    const sorted = [...milestoneLines];
    const fromIdx = sorted.findIndex((l) => l.id === dragId);
    const toIdx = sorted.findIndex((l) => l.id === dragOverId.current);
    if (fromIdx < 0 || toIdx < 0) { setDragId(null); return; }
    const [moved] = sorted.splice(fromIdx, 1);
    sorted.splice(toIdx, 0, moved!);

    const reordered = sorted.map((l, i) => ({ ...l, priority: i + 1 }));
    const otherLines = state.budgetLines.filter((b) => b.milestoneId !== activeMilestone.id);
    onPatch({ budgetLines: [...otherLines, ...reordered] });
    setDragId(null);
    dragOverId.current = null;
  };

  if (!activeMilestone) return null;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-xl font-bold tracking-tight text-gray-800">Bước 4 — Dự toán ngân sách</h2>
      <p className="mt-0.5 text-sm text-gray-500">
        Thiết lập hạng mục chi phí cho từng mốc giải ngân. Tổng hạng mục phải bằng đúng số tiền của mốc.
      </p>

      {/* Info banner */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-orange-100 bg-orange-50/80 px-3.5 py-2.5">
        <InfoIcon />
        <p className="text-justify text-sm leading-relaxed text-gray-900">
          Nền tảng áp dụng mô hình <strong>Quỹ Mục Tiêu Minh Bạch</strong>. Các hạng mục dưới đây là{' '}
          <strong>dự toán ngân sách</strong> cho mốc giải ngân đang chọn.
        </p>
      </div>

      {/* Milestone tabs */}
      <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-gutter:stable]">
        {milestones.map((m, idx) => {
          const isActive = idx === activeMilestoneIdx;
          const status = allMilestoneBudgetStatus[idx];
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveMilestoneIdx(idx)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                isActive ? 'bg-white/25 text-white' : status?.ok ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'
              }`}>
                {status?.ok ? '✓' : idx + 1}
              </span>
              <span className="max-w-[120px] truncate">{m.title}</span>
            </button>
          );
        })}
      </div>

      {/* Progress bar for current milestone */}
      <div className="mt-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-gray-500">
            {activeMilestone.title}
          </p>
          <span
            className={`text-sm font-semibold tabular-nums ${
              milestoneOk ? 'text-emerald-600' : milestoneOver ? 'text-red-600' : 'text-gray-600'
            }`}
          >
            {formatVnd(milestoneAllocated)} / {formatVnd(milestoneTarget)} đ
            {milestoneDiff !== 0 && milestoneTarget > 0 && (
              <span className="ml-1 text-xs font-medium">
                ({milestoneDiff > 0 ? '+' : ''}{formatVnd(milestoneDiff)})
              </span>
            )}
            {milestoneTarget > 0 && (
              <span className="ml-1.5 text-xs font-medium text-gray-400">
                ({((milestoneAllocated / milestoneTarget) * 100).toFixed(1)}%)
              </span>
            )}
          </span>
        </div>

        {milestoneTarget > 0 && (
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full w-full origin-left rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{ transform: `scaleX(${scaleX})`, backgroundColor: barColor }}
            />
          </div>
        )}
      </div>

      {/* Column headers (desktop) */}
      <div className="hidden gap-2 border-b border-gray-100 pb-2 md:grid md:grid-cols-[28px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,140px)_48px_36px]">
        <span className="sr-only">Kéo</span>
        <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Tên hạng mục</p>
        <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Mô tả ngắn</p>
        <p className="px-1 text-right text-[10px] font-semibold uppercase tracking-wide text-gray-400">Số tiền</p>
        <p className="px-1 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">%</p>
        <span className="sr-only">Xóa</span>
      </div>

      {/* Budget line rows */}
      <div className="space-y-2 mt-1">
        {milestoneLines.map((line) => {
          const rowPct = milestoneTarget > 0 && line.plannedAmount > 0 ? (line.plannedAmount / milestoneTarget) * 100 : 0;

          return (
            <motion.div
              key={line.id}
              layout
              draggable
              onDragStart={() => handleDragStart(line.id)}
              onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent, line.id)}
              onDrop={handleDrop}
              className={`grid grid-cols-1 gap-2 rounded-xl border bg-gray-50/50 p-3 transition md:grid-cols-[28px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,140px)_48px_36px] md:items-center md:border-0 md:bg-transparent md:p-1 ${
                dragId === line.id ? 'border-blue-300 bg-blue-50/50 opacity-60' : 'border-gray-100'
              }`}
            >
              {/* Drag handle */}
              <div className="hidden cursor-grab md:flex md:items-center md:justify-center active:cursor-grabbing">
                <GripIcon />
              </div>

              {/* Title */}
              <input
                className={`${inCls} text-sm`}
                placeholder="Tên hạng mục..."
                value={line.title}
                onChange={(e) => updateLine(line.id, { title: e.target.value })}
              />

              {/* Notes / description */}
              <input
                className={`${inCls} text-sm`}
                placeholder="Mô tả ngắn..."
                value={line.notes}
                onChange={(e) => updateLine(line.id, { notes: e.target.value })}
              />

              {/* Amount */}
              <div className="relative">
                <input
                  inputMode="numeric"
                  autoComplete="off"
                  className={`${inCls} w-full pr-8 text-right font-mono text-sm tabular-nums`}
                  value={line.plannedAmount ? formatVnd(line.plannedAmount) : ''}
                  placeholder="0"
                  onChange={(e) => updateLine(line.id, { plannedAmount: parseAmountDigits(e.target.value) })}
                />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400">
                  đ
                </span>
              </div>

              {/* Percentage */}
              <div className="flex items-center justify-center">
                <span className="font-mono text-xs tabular-nums text-gray-500">
                  {milestoneTarget > 0 ? `${rowPct.toFixed(1)}%` : '—'}
                </span>
              </div>

              {/* Delete */}
              <div className="flex justify-end md:justify-center">
                <button
                  type="button"
                  disabled={milestoneLines.length <= 1}
                  onClick={() => removeLine(line.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="Xóa hạng mục"
                >
                  <TrashIcon />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add line button */}
      <button
        type="button"
        onClick={addLine}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-orange-200 bg-orange-50/40 py-2.5 text-sm font-semibold text-brand transition hover:bg-orange-50 sm:w-auto sm:px-5"
      >
        <span className="text-base leading-none">+</span> Thêm hạng mục
      </button>

      {/* Overfund notice */}
      <div className="mt-4 rounded-xl bg-gray-50 p-3 text-justify text-xs leading-relaxed text-gray-500">
        Nếu chiến dịch vượt mục tiêu: hệ thống vẫn ghi nhận đóng góp trong phạm vi mục đích công bố. Phần vượt được
        công khai cách phân bổ theo chính sách minh bạch của nền tảng.
      </div>

      {/* Navigation */}
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
