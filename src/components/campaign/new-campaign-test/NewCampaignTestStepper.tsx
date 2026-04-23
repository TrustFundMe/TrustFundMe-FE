'use client';

import { motion } from 'framer-motion';
import { Fragment } from 'react';

type StepItem = { id: string; title: string; subtitle: string };

interface Props {
  steps: StepItem[];
  activeIndex: number;
  onJump: (idx: number) => void;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M5 10.5l3.5 3.5L15 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function NewCampaignTestStepper({ steps, activeIndex, onJump }: Props) {
  return (
    <nav className="mb-5" aria-label="Quy trình tạo chiến dịch">
      <div className="flex items-start">
        {steps.map((step, idx) => {
          const done = idx < activeIndex;
          const active = idx === activeIndex;
          /** Chỉ cho lùi: không mở tắt các bước phía trước khi chưa hoàn tất bước hiện tại bằng Tiếp tục. */
          const canClick = idx < activeIndex;

          return (
            <Fragment key={step.id}>
              <button
                type="button"
                aria-current={active ? 'step' : undefined}
                title={`${step.title}. ${step.subtitle}`}
                onClick={() => canClick && onJump(idx)}
                disabled={!canClick && !active}
                className={`flex shrink-0 flex-col items-center gap-1.5 ${canClick ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <motion.div
                  className={`relative flex items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300 ${
                    done
                      ? 'h-9 w-9 bg-emerald-500 text-white'
                      : active
                        ? 'h-10 w-10 bg-brand text-white'
                        : 'h-9 w-9 bg-gray-100 text-gray-400 ring-1 ring-gray-200'
                  }`}
                  animate={{ scale: active ? 1.08 : 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                >
                  {done ? <CheckIcon /> : <span>{idx + 1}</span>}
                  {active && (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-brand/25"
                      animate={{ scale: [1, 1.7, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </motion.div>

                <span
                  className={`hidden text-center text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200 md:block ${
                    active ? 'text-brand' : done ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                  style={{ maxWidth: 72 }}
                >
                  {step.title}
                </span>
              </button>

              {idx < steps.length - 1 && (
                <motion.div
                  className={`mt-[18px] h-[2px] flex-1 self-start rounded-full md:mt-[20px] mx-1 sm:mx-2`}
                  animate={{ backgroundColor: done ? '#34d399' : '#e5e7eb' }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </Fragment>
          );
        })}
      </div>

      <div className="mt-3 text-center md:hidden">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">
          Bước {activeIndex + 1} / {steps.length} — {steps[activeIndex].title}
        </p>
      </div>
    </nav>
  );
}
