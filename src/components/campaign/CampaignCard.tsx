"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fundraisingGoalService } from "@/services/fundraisingGoalService";
import type { FundraisingGoalDto } from "@/types/campaign";

export type CampaignCardItem = {
  id: string;
  title: string;
  type?: string;
  raised: number;
  goal: number;
  image: string;
  status?: string;
};

export default function CampaignCard({ item }: { item: CampaignCardItem }) {
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const goals = await fundraisingGoalService.getByCampaignId(Number(item.id));
        const total = goals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0);
        setTargetAmount(total);
      } catch (error) {
        console.error("Error fetching fundraising goals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, [item.id]);

  // Force progress to 0 as requested
  const progress = 0;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Link
        href={`/campaigns-details?id=${encodeURIComponent(item.id)}`}
        className="group relative block w-full h-full overflow-hidden rounded-xl bg-slate-200 shadow-sm ring-1 ring-slate-200"
      >
        <div className="relative aspect-[2/3] w-full">
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className={`object-cover ${item.status === 'DISABLED' ? 'grayscale' : ''}`}
            priority={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-black/20" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {item.status === 'DISABLED' && (
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter shadow-lg shadow-black/20">
                ĐÃ VÔ HIỆU HÓA
              </span>
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-2.5">
          <div className="flex flex-col gap-1">
            <div>
              <h3 className="text-sm font-bold leading-snug text-white line-clamp-2">
                {item.title}
              </h3>
              <p className="mt-0.5 text-xs text-white/90 line-clamp-1">
                {item.type === "ITEMIZED"
                  ? "Quỹ vật phẩm"
                  : item.type === "AUTHORIZED"
                    ? "Quỹ ủy quyền"
                    : item.type || "Chung"}
              </p>
            </div>

            <div>
              <div className="h-1 w-full rounded-full bg-white/60 overflow-hidden">
                <div
                  className="h-full bg-[#F84D43]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs font-semibold text-white">
                <span>{targetAmount.toLocaleString("vi-VN")} VNĐ</span>
                <span>{progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
