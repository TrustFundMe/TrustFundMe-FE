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
    <nav aria-label="Quy trình tạo chiến dịch" className="w-full md:h-[56px]">
      <ol className="grid grid-cols-1 gap-2 md:h-full md:grid-cols-5 md:gap-3.5 md:items-stretch">
        {steps.map((step, idx) => {
          const done = idx < activeIndex;
          const active = idx === activeIndex;
          const canClick = idx !== activeIndex && idx <= reached;

          return (
            <li key={step.id} className="min-w-0 md:h-full">
              <button
                type="button"
                aria-current={active ? 'step' : undefined}
                onClick={() => canClick && onJump(idx)}
                disabled={!canClick && !active}
                title={step.title}
                className={`group relative w-full overflow-hidden rounded-xl border px-3 py-2 text-left transition-all md:h-full ${
                  active
                    ? 'border-orange-300 bg-orange-50 shadow-[0_6px_16px_-8px_rgba(249,115,22,0.6)]'
                    : done
                      ? 'border-emerald-300 bg-emerald-50/70'
                      : 'border-slate-300 bg-white'
                } ${canClick ? 'cursor-pointer hover:border-orange-300 hover:bg-orange-50/60' : 'cursor-default'}`}
              >
                <div className="flex items-center gap-2 md:h-full md:justify-center">
                  <span
                    className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-black leading-none tabular-nums transition-colors ${
                      done
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : active
                          ? 'border-orange-600 bg-orange-600 text-white'
                          : 'border-slate-400 bg-white text-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className={`min-w-0 text-[13px] font-black leading-tight break-words ${
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
