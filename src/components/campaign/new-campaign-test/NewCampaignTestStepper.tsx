'use client';

import { motion } from 'framer-motion';
import { Fragment } from 'react';

type StepItem = { id: string; title: string; subtitle: string };

interface Props {
  steps: StepItem[];
  activeIndex: number;
  /** Bước xa nhất đã đạt tới — cho phép nhảy tự do trong [0, maxReached] */
  maxReached?: number;
  onJump: (idx: number) => void;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden>
      <path
        d="M3.5 8.5l3 3 6-6.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
      <ol className="flex items-center">
        {steps.map((step, idx) => {
          const done = idx < activeIndex;
          const active = idx === activeIndex;
          const canClick = idx !== activeIndex && idx <= reached;
          const isLast = idx === steps.length - 1;
          // Connector "đã qua" khi bước kế tiếp đã từng đạt tới
          const connectorDone = idx < reached;

          return (
            <Fragment key={step.id}>
              <li className="flex min-w-0 shrink-0 items-center">
                <button
                  type="button"
                  aria-current={active ? 'step' : undefined}
                  onClick={() => canClick && onJump(idx)}
                  disabled={!canClick && !active}
                  title={`${step.title} — ${step.subtitle}`}
                  className={`group flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors ${
                    canClick ? 'cursor-pointer hover:bg-orange-50' : 'cursor-default'
                  }`}
                >
                  {/* Marker */}
                  <span
                    className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10.5px] font-semibold tabular-nums transition-colors ${
                      done
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : active
                          ? 'border-orange-600 bg-orange-600 text-white'
                          : 'border-slate-300 bg-white text-slate-400 group-hover:border-orange-300'
                    }`}
                  >
                    {done ? <CheckIcon /> : idx + 1}
                    {active && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -inset-[3px] rounded-full ring-2 ring-orange-500/25"
                      />
                    )}
                  </span>

                  {/* Label */}
                  <span
                    className={`whitespace-nowrap text-[12.5px] font-medium leading-none transition-colors ${
                      active
                        ? 'text-orange-700'
                        : done
                          ? 'text-slate-700 group-hover:text-orange-700'
                          : 'text-slate-500'
                    } ${active ? 'inline' : 'hidden md:inline'}`}
                  >
                    {step.title}
                  </span>
                </button>
              </li>

              {!isLast && (
                <li
                  aria-hidden
                  className="relative mx-2 h-px min-w-[16px] flex-1 bg-slate-200 md:mx-3"
                >
                  <motion.span
                    initial={false}
                    animate={{ scaleX: connectorDone ? 1 : 0 }}
                    style={{ transformOrigin: 'left center' }}
                    transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                    className="absolute inset-0 block bg-orange-500"
                  />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
