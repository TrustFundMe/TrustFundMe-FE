"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import DonationExceedWarningModal from "@/components/donation/DonationExceedWarningModal";

function formatTimeAgo(dateString: string) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;

    return date.toLocaleDateString("vi-VN");
  } catch {
    return dateString;
  }
}

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

export default function CampaignDonateCard({
  raisedAmount,
  goalAmount,
  progressPercentage,
  campaignEndDate,
  donorCount = 0,
  recentDonors = [],
  onDonate,
  onMoreDonorsClick,
}: {
  raisedAmount: number;
  goalAmount: number;
  progressPercentage: number;
  campaignEndDate?: string | null;
  donorCount?: number;
  recentDonors?: { donorName: string; donorAvatar?: string | null; amount: number; anonymous?: boolean; createdAt: string }[];
  onDonate: (amount: number, isAnonymous: boolean, isAgreed: boolean) => void;
  onMoreDonorsClick?: () => void;
}) {
  const actualProgress =
    goalAmount > 0 ? Math.max(0, Math.round((raisedAmount / goalAmount) * 100)) : 0;
  const progress = Math.max(0, Math.min(100, actualProgress || progressPercentage || 0));
  const remainingAmount = Math.max(0, goalAmount - raisedAmount);
  const remainingDays = (() => {
    if (!campaignEndDate) return null;
    const end = new Date(campaignEndDate);
    if (Number.isNaN(end.getTime())) return null;
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  })();

  const [amount, setAmount] = useState<number>(50000);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [showExceedWarning, setShowExceedWarning] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const normalizedAmount = Math.max(0, amount || 0);

  const canDonate = isAgreed && normalizedAmount > 0;

  const handleDonateClick = () => {
    if (remainingAmount > 0 && normalizedAmount > remainingAmount) {
      setShowExceedWarning(true);
      return;
    }
    onDonate(normalizedAmount, isAnonymous, isAgreed);
  };

  return (
    <div className="mt-2 mb-4 rounded-[14px] border border-[rgba(15,23,42,0.12)] bg-white">
      <div className="p-3.5 md:p-4">
        <div className="rounded-xl border border-[rgba(15,23,42,0.10)] bg-white px-3 py-2.5">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-500">Mục tiêu chiến dịch</p>
              <p className="mt-0.5 text-[22px] font-extrabold text-slate-900">{goalAmount.toLocaleString("vi-VN")} VNĐ</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold text-slate-500">Thời gian còn lại</p>
              <p className="mt-0.5 text-xl font-extrabold text-slate-900">
                {remainingDays === null ? "—" : `${remainingDays} ngày`}
              </p>
            </div>
          </div>

          <div className="mt-2.5">
            <div className="mb-1 flex items-center justify-between text-[13px]">
              <span className="font-semibold text-slate-700">
                Đã đạt được <span className="font-extrabold text-[#ff5e14]">{raisedAmount.toLocaleString("vi-VN")} VNĐ</span>
              </span>
              <span className="font-extrabold text-slate-700">{actualProgress}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-[#ff8a1f] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1.5 text-[13px] font-semibold text-slate-700">
              Lượt ủng hộ: <span className="font-extrabold">{donorCount.toLocaleString("vi-VN")}</span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {QUICK_AMOUNTS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAmount(v)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                amount === v
                  ? "border-[#ff5e14]/40 bg-[#ff5e14]/10 text-[#a3471a]"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              {v >= 1000 ? `${v / 1000}k` : v}
            </button>
          ))}
        </div>

        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
            <input
              ref={amountInputRef}
              type="text"
              value={amount.toLocaleString("vi-VN")}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\./g, "").replace(/\D/g, "");
                setAmount(Number(rawValue) || 0);
              }}
              className="w-full bg-transparent text-right text-sm font-bold text-slate-900 outline-none"
            />
            <span className="text-[11px] font-bold text-slate-500">VNĐ</span>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            disabled={!canDonate}
            onClick={handleDonateClick}
            className={`group inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-extrabold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              canDonate
                ? "bg-[#ff5e14] hover:bg-[#ea550c] cursor-pointer"
                : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            Quyên góp
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </span>
          </motion.button>
        </div>

        {remainingAmount > 0 && (
          <div className="mt-1.5 text-[11px] font-semibold text-slate-500">
            Còn thiếu: <span className="font-extrabold text-slate-700">{remainingAmount.toLocaleString("vi-VN")} VNĐ</span>
          </div>
        )}

        {/* Checkboxes */}
        <div className="mt-3 space-y-2.5 border-t border-[rgba(15,23,42,0.10)] pt-3">
          <label className="flex cursor-pointer items-center gap-2.5 select-none">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 shrink-0 rounded border-slate-300 text-[#ff5e14] accent-[#ff5e14]"
            />
            <span className="text-xs font-semibold text-slate-700">Quyên góp ẩn danh</span>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5 select-none">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[#ff5e14] accent-[#ff5e14]"
            />
            <span className="text-xs leading-relaxed text-slate-600">
              Tôi đồng ý với{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#ff5e14] underline underline-offset-2 hover:text-[#ea550c]"
              >
                điều khoản sử dụng
              </a>{" "}
              của nền tảng
            </span>
          </label>
        </div>

        <div className="mt-3 border-t border-[rgba(15,23,42,0.10)] pt-3">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <h5 className="m-0 whitespace-nowrap text-sm font-extrabold text-slate-900">Người vừa ủng hộ</h5>
            <button
              type="button"
              onClick={onMoreDonorsClick}
              className="rounded-md px-2 py-1 text-xs font-bold text-[#ff5e14] transition-colors hover:bg-orange-50"
            >
              Xem thêm
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {recentDonors.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[rgba(15,23,42,0.12)] py-4 text-center text-sm italic text-slate-400">
                Chưa có người ủng hộ nào
              </div>
            ) : (
              recentDonors.map((donor, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-[rgba(15,23,42,0.10)] bg-slate-50/60 p-2.5"
                >
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-200">
                    <img
                      src={donor.donorAvatar || "/assets/img/defaul.jpg"}
                      alt={donor.donorName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/img/defaul.jpg";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 text-xs font-bold text-slate-900">
                      {donor.anonymous ? "Người ủng hộ ẩn danh" : donor.donorName}
                    </div>
                    <div className="text-[11px] text-slate-500">{formatTimeAgo(donor.createdAt)}</div>
                  </div>
                  <div className="text-right text-xs font-extrabold text-[#ff5e14]">
                    +{donor.amount.toLocaleString("vi-VN")} đ
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Exceed Warning Modal */}
      <DonationExceedWarningModal
        isOpen={showExceedWarning}
        onConfirm={() => {
          setShowExceedWarning(false);
          onDonate(normalizedAmount, isAnonymous, isAgreed);
        }}
        onAdjust={() => {
          setShowExceedWarning(false);
          setTimeout(() => {
            amountInputRef.current?.focus();
            amountInputRef.current?.select();
          }, 100);
        }}
        goalAmount={goalAmount}
        raisedAmount={raisedAmount}
        donationAmount={normalizedAmount}
      />
    </div>
  );
}
