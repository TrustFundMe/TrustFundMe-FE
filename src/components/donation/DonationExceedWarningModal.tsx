"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface DonationExceedWarningModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onAdjust: () => void;
  goalAmount: number;
  raisedAmount: number;
  donationAmount: number;
}

function fmt(n: number) {
  return n.toLocaleString("vi-VN");
}

export default function DonationExceedWarningModal({
  isOpen,
  onConfirm,
  onAdjust,
  goalAmount,
  raisedAmount,
  donationAmount,
}: DonationExceedWarningModalProps) {
  const remaining = Math.max(0, goalAmount - raisedAmount);
  const excess = Math.max(0, donationAmount - remaining);
  const canRenderPortal = typeof window !== "undefined";

  if (!canRenderPortal) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[2147483645] bg-black/50 backdrop-blur-[2px]"
            onClick={onAdjust}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-x-4 top-[26%] z-[2147483646] mx-auto w-[min(560px,calc(100vw-2rem))] -translate-y-1/2 rounded-2xl bg-white p-6 shadow-[0_35px_100px_rgba(2,6,23,0.45)] md:top-[20%] md:p-7"
          >
            {/* Icon */}
            <div className="mb-4 flex flex-col items-center gap-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    stroke="#f59e0b"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-[15px] font-extrabold text-slate-900">
                Số tiền vượt quá mục tiêu đợt này
              </h3>
              <p className="text-xs leading-relaxed text-slate-500">
                Đợt này chỉ cần thêm{" "}
                <span className="font-bold text-slate-700">
                  {fmt(remaining)} VNĐ
                </span>{" "}
                nữa là hoàn thành. Phần dư được ưu tiên cho đợt tiếp theo của
                cùng chiến dịch; nếu chiến dịch không mở thêm đợt hợp lệ, nền
                tảng sẽ điều phối theo Điều khoản sử dụng.
              </p>
            </div>

            {/* Summary cards */}
            <div className="mb-4 space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
              {/* Donation amount */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Bạn muốn quyên góp
                </span>
                <span className="text-xs font-extrabold text-slate-900">
                  {fmt(donationAmount)} VNĐ
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200" />

              {/* Goes to this milestone */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Vào đợt hiện tại
                </span>
                <span className="text-xs font-extrabold text-emerald-600">
                  {fmt(remaining)} VNĐ
                </span>
              </div>

              {/* Carried over */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Giữ cho đợt tiếp theo
                </span>
                <span className="text-xs font-extrabold text-[#ff5e14]">
                  +{fmt(excess)} VNĐ
                </span>
              </div>
            </div>

            {/* Note */}
            <p className="mb-4 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-700">
              Phần vượt mục tiêu được xử lý theo chính sách tại{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline underline-offset-2"
              >
                Điều khoản sử dụng
              </a>
              .
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className="w-full rounded-full bg-[#ff5e14] py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-[#ea550c]"
              >
                Tiếp tục quyên góp
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={onAdjust}
                className="w-full rounded-full border border-slate-200 py-3.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Điều chỉnh số tiền
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    ,
    document.body
  );
}
