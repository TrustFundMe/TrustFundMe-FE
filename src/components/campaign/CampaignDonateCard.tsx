"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@radix-ui/react-icons";

function CircularProgress({ value }: { value: number }) {
  const size = 84;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, value));
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="block">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(17,24,39,0.1)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#ff5e14"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center text-base font-extrabold text-slate-800">
          {progress}%
        </div>
      </div>

      <div className="min-w-0">
        <div className="text-[15px] font-bold leading-tight text-slate-900">Tiến trình gây quỹ</div>
        <div className="text-xs text-slate-500">Trạng thái gây quỹ hiện tại</div>
      </div>
    </div>
  );
}

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
  donorCount = 0,
  recentDonors = [],
  onDonate,
  onMoreDonorsClick,
}: {
  raisedAmount: number;
  goalAmount: number;
  progressPercentage: number;
  donorCount?: number;
  recentDonors?: { donorName: string; donorAvatar?: string | null; amount: number; anonymous?: boolean; createdAt: string }[];
  onDonate: (amount: number) => void;
  onMoreDonorsClick?: () => void;
}) {
  const progress = Math.max(0, Math.min(100, progressPercentage || 0));
  const remainingAmount = Math.max(0, goalAmount - raisedAmount);

  const [amount, setAmount] = useState<number>(50000);
  const normalizedAmount = Math.max(0, amount || 0);

  return (
    <div className="mt-2 mb-4 rounded-[14px] border border-[rgba(15,23,42,0.12)] bg-white">
      <div className="p-3.5 md:p-4">
        <div className="rounded-xl border border-[rgba(15,23,42,0.10)] bg-slate-50/70 p-2.5">
          <CircularProgress value={progress} />
        </div>

        <div className="mt-2.5 rounded-xl border border-[rgba(15,23,42,0.10)] bg-white px-3 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Mục tiêu chiến dịch</p>
              <p className="mt-1 truncate text-[15px] font-extrabold text-slate-900">{goalAmount.toLocaleString("vi-VN")} VNĐ</p>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-[rgba(15,23,42,0.10)] bg-slate-50 px-2.5 py-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">Đã góp</p>
              <p className="mt-0.5 truncate text-xs font-extrabold text-slate-900">{raisedAmount.toLocaleString("vi-VN")} VNĐ</p>
            </div>
            <div className="rounded-lg border border-[rgba(15,23,42,0.10)] bg-slate-50 px-2.5 py-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">Lượt ủng hộ</p>
              <p className="mt-0.5 truncate text-xs font-extrabold text-slate-900">{donorCount.toLocaleString("vi-VN")}</p>
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
            onClick={() => onDonate(normalizedAmount)}
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-[#ff5e14] px-4 py-2.5 text-xs font-extrabold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#ea550c]"
          >
            Quyên góp
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </span>
          </motion.button>
        </div>

        <div className="mt-1.5 text-[11px] font-semibold text-slate-500">
          Còn thiếu: <span className="font-extrabold text-slate-700">{remainingAmount.toLocaleString("vi-VN")} VNĐ</span>
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
    </div>
  );
}
