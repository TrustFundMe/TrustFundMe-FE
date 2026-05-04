'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';
import { fullRiskTermsVietnamese } from '../mockData';
import { NewCampaignTestState } from '../types';
import StepFooter from '../parts/StepFooter';

interface Props {
  state: NewCampaignTestState;
  onPatch: (patch: Partial<NewCampaignTestState>) => void;
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
}

/* ────────────────────────────────────────────
   Inline markdown → React renderer
   Supports: **bold**, *italic*, line breaks
   ──────────────────────────────────────────── */
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Regex: **bold** or *italic*
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (match[1]) {
      nodes.push(<strong key={key++} className="font-semibold text-gray-800">{match[1]}</strong>);
    } else if (match[2]) {
      nodes.push(<em key={key++} className="text-gray-600 italic">{match[2]}</em>);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/* ────────────────────────────────────────────
   Parse markdown blocks from the raw terms
   ──────────────────────────────────────────── */
type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list-item'; text: string }
  | { type: 'hr' };

function parseMarkdown(raw: string): Block[] {
  const lines = raw.split('\n');
  const blocks: Block[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^---+$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
    } else if (/^##\s+/.test(trimmed)) {
      blocks.push({ type: 'heading', level: 2, text: trimmed.replace(/^##\s+/, '') });
    } else if (/^###\s+/.test(trimmed)) {
      blocks.push({ type: 'heading', level: 3, text: trimmed.replace(/^###\s+/, '') });
    } else if (/^-\s+/.test(trimmed)) {
      blocks.push({ type: 'list-item', text: trimmed.replace(/^-\s+/, '') });
    } else {
      blocks.push({ type: 'paragraph', text: trimmed });
    }
  }
  return blocks;
}

const parsedBlocks = parseMarkdown(fullRiskTermsVietnamese);

/* ────────────────────────────────────────────
   Key points for quick summary
   ──────────────────────────────────────────── */

/* ────────────────────────────────────────────
   Component
   ──────────────────────────────────────────── */
export default function Step5RiskTerms({ state, onPatch, onPrev, onNext, canNext }: Props) {
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const accepted = state.acknowledgements.termsAccepted;

  const handleScroll: React.UIEventHandler<HTMLDivElement> = useCallback((e) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) {
      setScrolledToEnd(true);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  return (
    <div className="rounded-xl bg-white p-4 md:p-6">
      {/* ── Header with shield icon ── */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 shadow-sm">
          <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900">Điều khoản quản trị rủi ro</h2>
          <p className="mt-0.5 text-sm text-gray-500">Đọc kỹ và chấp nhận vô điều kiện trước khi gửi duyệt hồ sơ.</p>
        </div>
      </div>


      {/* ── Full terms document ── */}
      <div className="relative mt-5">
        <div className="mb-2 flex items-center gap-2">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Nội dung đầy đủ</span>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="max-h-[420px] overflow-y-auto rounded-xl border border-gray-200 bg-gradient-to-b from-slate-50/80 to-white p-5 md:p-6"
        >
          {/* Document title */}
          <div className="mb-5 border-b border-gray-100 pb-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Tài liệu nền tảng</p>
            <h3 className="mt-2 text-sm font-bold text-gray-800 md:text-base">
              Quy tắc Quản trị Tài chính & Xử lý Rủi ro
            </h3>
            <p className="mt-1 text-[11px] text-gray-400">Phiên bản: risk-tos-v1 · Hiệu lực: 01/01/2026</p>
          </div>

          {/* Rendered markdown blocks */}
          <div className="space-y-2">
            {parsedBlocks.map((block, i) => {
              switch (block.type) {
                case 'heading':
                  return block.level === 2 ? (
                    <h4 key={i} className="mt-4 text-sm font-bold text-gray-900 md:text-[15px]">
                      {renderInline(block.text)}
                    </h4>
                  ) : (
                    <h5 key={i} className="mt-3 text-sm font-semibold text-gray-800">
                      {renderInline(block.text)}
                    </h5>
                  );
                case 'paragraph':
                  return (
                    <p key={i} className="text-justify text-[13px] leading-relaxed text-gray-600">
                      {renderInline(block.text)}
                    </p>
                  );
                case 'list-item':
                  return (
                    <div key={i} className="flex gap-2 pl-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                      <p className="text-[13px] leading-relaxed text-gray-600">
                        {renderInline(block.text)}
                      </p>
                    </div>
                  );
                case 'hr':
                  return <hr key={i} className="my-4 border-gray-100" />;
                default:
                  return null;
              }
            })}
          </div>
        </div>

        {/* Scroll fade overlay */}
        {!scrolledToEnd && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 rounded-b-xl bg-gradient-to-t from-white via-white/80 to-transparent" />
        )}
      </div>

      {/* Scroll prompt */}
      {!scrolledToEnd && (
        <div className="mt-2 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={scrollToBottom}
            className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
          >
            <svg className="h-3.5 w-3.5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            Cuộn xuống để đọc hết
          </button>
        </div>
      )}

      {/* ── Checkbox acceptance ── */}
      <motion.label
        animate={{ opacity: scrolledToEnd ? 1 : 0.45 }}
        transition={{ duration: 0.3 }}
        className={`mt-5 flex items-start gap-3 rounded-xl border-2 p-4 transition-colors ${
          accepted
            ? 'border-emerald-300 bg-emerald-50/50'
            : scrolledToEnd
              ? 'border-orange-200 bg-orange-50/40 hover:border-orange-300'
              : 'border-gray-100 bg-gray-50'
        } ${scrolledToEnd ? 'cursor-pointer' : 'cursor-not-allowed'}`}
      >
        <div className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            className="peer h-5 w-5 rounded border-gray-300 text-emerald-600 accent-emerald-600 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
            checked={accepted}
            disabled={!scrolledToEnd}
            onChange={(e) =>
              onPatch({
                acknowledgements: {
                  ...state.acknowledgements,
                  termsAccepted: e.target.checked,
                  overfundPolicyAccepted: e.target.checked,
                  transparencyAccepted: e.target.checked,
                  legalLiabilityAccepted: e.target.checked,
                },
              })
            }
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-800">
            {accepted ? '✓ Đã chấp nhận điều khoản' : 'Tôi đã đọc và chấp nhận vô điều kiện'}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
            Tôi hiểu rõ các quy tắc quản trị tài chính, xử lý rủi ro, cơ chế hậu kiểm và miễn trừ trách nhiệm của nền tảng TrustFundMe.
          </p>
          {!scrolledToEnd && (
            <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              Vui lòng đọc hết tài liệu trước khi tick chấp nhận
            </p>
          )}
        </div>
      </motion.label>

      <StepFooter canNext={canNext} onPrev={onPrev} onNext={onNext} nextLabel="Tới bước cuối" />
    </div>
  );
}
