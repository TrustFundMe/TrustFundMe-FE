"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

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
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  const safeItems = useMemo(
    () => (items && items.length > 0 ? items : defaultItems),
    [items]
  );
  const current = safeItems[index];

  useEffect(() => {
    if (safeItems.length <= 1) return;
    const t = window.setInterval(() => {
      setDirection(1);
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

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 24 : -24, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -24 : 24, opacity: 0 }),
  };

  const [direction, setDirection] = useState(0);
  const handlePrevWithDir = () => {
    setDirection(-1);
    handlePrev();
  };
  const handleNextWithDir = () => {
    setDirection(1);
    handleNext();
  };

  return (
    <motion.div
      ref={ref}
      className="relative z-20 -mt-14 md:-mt-20"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:min-h-[280px]">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={current.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={current.image}
                    alt={current.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                  <div className="relative z-10 flex h-full flex-col justify-center p-5 md:p-6 text-white min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/80">
                      Voting
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2 text-xs font-semibold">
                      <span className="text-red-300 shrink-0">Disagree</span>
                      <span className="text-green-300 shrink-0">Agree</span>
                    </div>
                    <div className="mt-1.5 flex h-2.5 w-full overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full bg-[#F84D43] transition-[width] duration-300"
                        style={{ width: percent(disagreeRatio) }}
                        aria-label={`Disagree ${percent(disagreeRatio)}`}
                      />
                      <div
                        className="h-full bg-[#1A685B] transition-[width] duration-300"
                        style={{ width: percent(agreeRatio) }}
                        aria-label={`Agree ${percent(agreeRatio)}`}
                      />
                    </div>
                    <p className="mt-1.5 flex items-center justify-between gap-2 text-xs font-semibold tabular-nums">
                      <span>{current.disagree.toLocaleString("en-US")}</span>
                      <span>{current.agree.toLocaleString("en-US")}</span>
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative min-h-[200px] md:min-h-[280px] bg-white min-w-0 overflow-hidden">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={current.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 p-5 md:p-6 flex flex-col justify-center"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-[#F84D43]">
                    {current.subtitle}
                  </p>
                  <h2 className="mt-2 text-lg md:text-xl font-extrabold text-slate-900 line-clamp-2">
                    {current.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                    Featured campaign. Arrows to browse.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href="/campaigns/campaignsList"
                      className="inline-flex items-center justify-center rounded-full bg-[#F84D43] px-4 py-2 text-sm font-bold text-white hover:bg-[#1A685B] transition-colors"
                    >
                      View
                    </Link>
                    <Link
                      href="#campaigns"
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                    >
                      Explore all
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {safeItems.length > 1 && (
            <>
              <motion.button
                type="button"
                onClick={handlePrevWithDir}
                className="absolute left-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-md hover:bg-white"
                aria-label="Previous slide"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="h-5 w-5 text-slate-800" />
              </motion.button>
              <motion.button
                type="button"
                onClick={handleNextWithDir}
                className="absolute right-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-md hover:bg-white"
                aria-label="Next slide"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="h-5 w-5 text-slate-800" />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
