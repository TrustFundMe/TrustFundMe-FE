"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export type CampaignCardItem = {
  id: string;
  title: string;
  type?: string;
  fundDetail?: string;
  raised: number;
  goal: number;
  image: string;
  status?: string;
};

export default function CampaignCard({ item }: { item: CampaignCardItem }) {
  const targetAmount = Number(item.goal || 0);
  const raisedAmount = Number(item.raised || 0);
  const progress = targetAmount > 0
    ? Math.min(100, Math.max(0, Math.round((raisedAmount / targetAmount) * 100)))
    : 0;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Link
        href={`/campaigns-details?id=${encodeURIComponent(item.id)}`}
        className="group relative block h-full min-h-[248px] w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(min-width: 1280px) 32vw, (min-width: 1024px) 40vw, (min-width: 768px) 46vw, 92vw"
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${item.status === 'DISABLED' ? 'grayscale' : ''}`}
            priority={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-black/10" />

          {item.status === 'DISABLED' && (
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter shadow-lg shadow-black/20">
                ĐÃ VÔ HIỆU HÓA
              </span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
          <div>
            <h3 className="text-lg font-bold leading-snug text-slate-900 line-clamp-2">
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-slate-600 line-clamp-1">
              {item.fundDetail?.trim()
                ? item.fundDetail
                : item.type === "ITEMIZED"
                  ? "Quỹ vật phẩm"
                  : item.type === "AUTHORIZED"
                    ? "Quỹ ủy quyền"
                    : item.type || "Chung"}
            </p>
          </div>

          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-brand"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm font-semibold text-slate-700">
              <span>{targetAmount.toLocaleString("vi-VN")} VNĐ</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
