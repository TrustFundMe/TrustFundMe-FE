"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type HighlightCampaign = {
  id: string;
  title: string;
  subtitle: string;
  agree: number;
  disagree: number;
  image: string;
};

const defaultItems: HighlightCampaign[] = [
  {
    id: "highlight-1",
    title: "Water For All Children, America",
    subtitle: "Healthcare",
    agree: 40802,
    disagree: 10000,
    image: "/assets/img/campaign/1.jpg",
  },
  {
    id: "highlight-2",
    title: "New School Library for Rural Kids",
    subtitle: "Education",
    agree: 25000,
    disagree: 5000,
    image: "/assets/img/campaign/2.jpg",
  },
  {
    id: "highlight-3",
    title: "Emergency Shelter for Flood Victims",
    subtitle: "Disaster Relief",
    agree: 75000,
    disagree: 2000,
    image: "/assets/img/campaign/1.jpg",
  },
];

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function percent(n: number) {
  return `${Math.round(n * 100)}%`;
}

export default function CampaignHighlightSlider({
  items,
  autoMs = 4500,
}: {
  items?: HighlightCampaign[];
  autoMs?: number;
}) {
  const [index, setIndex] = useState(0);

  const safeItems = useMemo(
    () => (items && items.length > 0 ? items : defaultItems),
    [items]
  );
  const current = safeItems[index];

  useEffect(() => {
    if (safeItems.length <= 1) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % safeItems.length);
    }, autoMs);
    return () => window.clearInterval(t);
  }, [autoMs, safeItems.length]);

  const handlePrev = () => {
    setIndex((i) => (i === 0 ? safeItems.length - 1 : i - 1));
  };

  const handleNext = () => {
    setIndex((i) => (i + 1) % safeItems.length);
  };

  if (!current) return null;

  const total = Math.max(1, current.agree + current.disagree);
  const agreeRatio = clamp01(current.agree / total);
  const disagreeRatio = clamp01(current.disagree / total);

  return (
    <div className="relative z-20 -mt-14 md:-mt-20">
      <div className="container mx-auto px-4">
        <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative overflow-hidden">
              <Image
                src={current.image}
                alt={current.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

              <div className="relative z-10 flex h-full flex-col justify-center p-5 md:p-6 text-white">
                <div className="text-xs font-bold uppercase tracking-wider text-white/80">
                  Voting
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="text-red-300">Phản đối</span>
                    <span className="text-green-300">Đồng ý</span>
                  </div>

                  <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full bg-[#F84D43]"
                      style={{ width: percent(disagreeRatio) }}
                      aria-label={`Phản đối ${percent(disagreeRatio)}`}
                    />
                    <div
                      className="h-full bg-[#1A685B]"
                      style={{ width: percent(agreeRatio) }}
                      aria-label={`Đồng ý ${percent(agreeRatio)}`}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs font-semibold">
                    <span>{current.disagree.toLocaleString()} phản đối</span>
                    <span>{current.agree.toLocaleString()} đồng ý</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 md:p-6 bg-white">
              <div className="text-xs font-bold uppercase tracking-wider text-[#F84D43]">
                {current.subtitle}
              </div>
              <div className="mt-2 text-xl md:text-2xl font-extrabold text-slate-900">
                {current.title}
              </div>
              <div className="mt-3 text-sm text-slate-600">
                Slide demo: bấm mũi tên để đổi campaign. (Sau này có thể nối
                data/API thật.)
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-[#F84D43] px-4 py-2 text-sm font-bold text-white hover:bg-[#1A685B] transition-colors"
                >
                  Xem chi tiết
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Bỏ qua
                </button>
              </div>
            </div>
          </div>

          {safeItems.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-md hover:bg-white"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5 text-slate-800" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-md hover:bg-white"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5 text-slate-800" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
