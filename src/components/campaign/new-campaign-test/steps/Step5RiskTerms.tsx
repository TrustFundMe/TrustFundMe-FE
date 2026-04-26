'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { fullRiskTermsVietnamese } from '../mockData';
import { NewCampaignTestState } from '../types';

interface Props {
  state: NewCampaignTestState;
  onPatch: (patch: Partial<NewCampaignTestState>) => void;
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
}

/** Parse raw ToS text into sections for styled rendering */
function parseTerms(raw: string): { type: 'preamble' | 'article'; heading?: string; body: string }[] {
  const sections: { type: 'preamble' | 'article'; heading?: string; body: string }[] = [];
  const parts = raw.split(/(?=Điều \d+\.)/);
  parts.forEach((part, i) => {
    const trimmed = part.trim();
    if (!trimmed) return;
    if (i === 0) {
      sections.push({ type: 'preamble', body: trimmed });
      return;
    }
    const firstNewline = trimmed.indexOf('\n');
    if (firstNewline === -1) {
      sections.push({ type: 'article', heading: trimmed, body: '' });
    } else {
      sections.push({
        type: 'article',
        heading: trimmed.slice(0, firstNewline).trim(),
        body: trimmed.slice(firstNewline + 1).trim(),
      });
    }
  });
  return sections;
}

const parsedSections = parseTerms(fullRiskTermsVietnamese);

export default function Step5RiskTerms({ state, onPatch, onPrev, onNext, canNext }: Props) {
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const accepted = state.acknowledgements.termsAccepted;

  const handleScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) {
      setScrolledToEnd(true);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-xl font-bold tracking-tight text-gray-800">Bước 5 — Điều khoản quản trị rủi ro</h2>
      <p className="mt-1 text-sm text-gray-500">Đọc và chấp nhận vô điều kiện trước khi gửi duyệt hồ sơ.</p>

      {/* Document container */}
      <div
        onScroll={handleScroll}
        className="relative mt-6 max-h-[500px] overflow-y-auto rounded-xl bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_4px_24px_-4px_rgba(0,0,0,0.08)] md:p-8"
      >
        {/* Doc header */}
        <div className="mb-6 border-b border-gray-100 pb-5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Tài liệu nền tảng</p>
          <h3 className="mt-2 text-base font-bold text-gray-800">
            Quy tắc Quản trị Tài chính & Xử lý Rủi ro
          </h3>
          <p className="mt-1 text-xs text-gray-400">Phiên bản áp dụng: risk-tos-v1 · Ngày hiệu lực: 01/01/2026</p>
        </div>

        {/* Preamble */}
        {parsedSections
          .filter((s) => s.type === 'preamble')
          .map((s, i) => (
            <div key={i} className="mb-6">
              {s.body.split('\n').map((line, j) => (
                line.trim() ? (
                  <p key={j} className="mb-2 text-justify text-sm leading-relaxed text-gray-600">
                    {line}
                  </p>
                ) : null
              ))}
            </div>
          ))}

        {/* Articles */}
        <div className="space-y-6">
          {parsedSections
            .filter((s) => s.type === 'article')
            .map((s, i) => (
              <div key={i}>
                <h4 className="mb-2 text-sm font-bold text-gray-800">{s.heading}</h4>
                <div className="space-y-1.5">
                  {s.body.split('\n').map((line, j) =>
                    line.trim() ? (
                      <p key={j} className="text-justify text-sm leading-relaxed text-gray-600">
                        {line}
                      </p>
                    ) : null,
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Scroll fade overlay */}
        {!scrolledToEnd && (
          <div className="pointer-events-none sticky bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>

      {!scrolledToEnd && (
        <p className="mt-2 text-center text-xs text-gray-400">
          Cuộn xuống để đọc toàn bộ nội dung trước khi chấp nhận.
        </p>
      )}

      {/* Checkbox acceptance */}
      <motion.label
        animate={{ opacity: scrolledToEnd ? 1 : 0.5 }}
        transition={{ duration: 0.3 }}
        className={`mt-5 flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 ${scrolledToEnd ? 'cursor-pointer' : 'cursor-not-allowed'}`}
      >
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            className="peer h-5 w-5 rounded border-gray-300 accent-brand disabled:cursor-not-allowed"
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
          {accepted && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center rounded text-white"
            />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Tôi đã đọc và chấp nhận vô điều kiện
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Tôi hiểu rõ các quy tắc quản trị tài chính, xử lý rủi ro và cơ chế hậu kiểm của nền tảng.
          </p>
          {!scrolledToEnd && (
            <p className="mt-1 text-[11px] font-medium text-amber-700">
              Vui lòng đọc hết tài liệu trước khi tick chấp nhận.
            </p>
          )}
        </div>
      </motion.label>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
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
          disabled={!canNext}
          onClick={onNext}
          whileHover={canNext ? { scale: 1.02 } : {}}
          whileTap={canNext ? { scale: 0.97 } : {}}
          className="rounded-full bg-brand px-7 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
        >
          Tới bước cuối
        </motion.button>
      </div>
    </div>
  );
}
