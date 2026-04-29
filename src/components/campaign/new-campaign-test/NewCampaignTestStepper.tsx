'use client';

import { motion } from 'framer-motion';
type StepItem = { id: string; title: string; subtitle: string };

interface Props {
  steps: StepItem[];
  activeIndex: number;
  /** Bước xa nhất đã đạt tới — cho phép nhảy tự do trong [0, maxReached] */
  maxReached?: number;
  onJump: (idx: number) => void;
}

/**
 * Horizontal stepper — tông cam chuyên nghiệp, fit trong header.
 * - Marker 20px, connector 1px.
 * - Done: orange-500 solid + check; Active: orange-600 đậm + ring halo; Pending: outline xám.
 * - Click nhảy trong vùng [0, maxReached] (đã validate).
 */
export default function NewCampaignTestStepper({
  steps,
  activeIndex,
  maxReached,
  onJump,
}: Props) {
  const reached = typeof maxReached === 'number' ? maxReached : activeIndex;

  return (
    <nav aria-label="Quy trình tạo chiến dịch" className="w-full">
      <ol className="grid grid-cols-1 gap-2 md:grid-cols-5 md:gap-3">
        {steps.map((step, idx) => {
          const done = idx < activeIndex;
          const active = idx === activeIndex;
          const canClick = idx !== activeIndex && idx <= reached;

          return (
            <li key={step.id} className="min-w-0">
              <button
                type="button"
                aria-current={active ? 'step' : undefined}
                onClick={() => canClick && onJump(idx)}
                disabled={!canClick && !active}
                title={step.title}
                className={`group relative w-full overflow-hidden rounded-xl border px-2.5 py-1.5 text-left transition-all ${
                  active
                    ? 'border-orange-200 bg-orange-50 shadow-[0_4px_12px_-6px_rgba(249,115,22,0.5)]'
                    : done
                      ? 'border-emerald-200 bg-emerald-50/60'
                      : 'border-slate-200 bg-white'
                } ${canClick ? 'cursor-pointer hover:border-orange-200 hover:bg-orange-50/50' : 'cursor-default'}`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold leading-none tabular-nums transition-colors ${
                      done
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : active
                          ? 'border-orange-600 bg-orange-600 text-white'
                          : 'border-slate-300 bg-white text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className={`min-w-0 truncate whitespace-nowrap text-[11px] font-bold leading-none ${
                      active ? 'text-orange-700' : done ? 'text-emerald-700' : 'text-slate-700'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {active && (
                  <motion.span
                    layoutId="active-step-highlight"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-orange-500"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
