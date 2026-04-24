'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { decree93SeparateAccountNotice, fullRiskTermsVietnamese, lawReferences } from '../mockData';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LegalModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4 md:px-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">Điều khoản pháp lý</p>
                <h2 id="legal-modal-title" className="mt-1 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
                  Chính sách tạo chiến dịch và KYC
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng"
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6">
              <div className="space-y-5">
                <p className="text-sm leading-relaxed text-gray-700">
                  Trước khi tạo chiến dịch, chủ quỹ cần hoàn tất KYC và dùng tài khoản ngân hàng chính chủ để tiếp nhận - giải ngân quỹ minh bạch.
                </p>

                <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
                  <h3 className="text-base font-semibold text-gray-900">Yêu cầu bắt buộc về KYC và tài khoản ngân hàng</h3>
                  <p className="mt-2 text-justify text-sm leading-relaxed text-gray-700">{decree93SeparateAccountNotice}</p>
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Lưu ý: Nếu KYC chưa đạt hoặc tài khoản ngân hàng không trùng tên KYC, hệ thống sẽ chặn bước tạo chiến dịch.
                  </div>
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
                  <h3 className="text-base font-semibold text-gray-900">Văn bản tham chiếu</h3>
                  <ul className="mt-2 space-y-2 text-sm text-gray-700">
                    {lawReferences.map((law) => (
                      <li key={law} className="rounded-lg bg-gray-50 px-3 py-2">
                        {law}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
                  <h3 className="text-base font-semibold text-gray-900">Toàn văn điều khoản</h3>
                  <pre className="mt-2 whitespace-pre-wrap text-justify text-sm leading-relaxed text-gray-700">{fullRiskTermsVietnamese}</pre>
                </section>
              </div>
            </div>

            <footer className="flex justify-end border-t border-gray-200 bg-white px-5 py-3 md:px-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
              >
                Đã hiểu
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
