"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  HeartHandshake,
  Milk,
  Package,
  School,
  Stethoscope,
} from "lucide-react";

import CampaignCard, { type CampaignCardItem } from "@/components/campaign/CampaignCard";

interface CampaignCategoryItem {
  id: string;
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const categories: CampaignCategoryItem[] = [
  {
    id: "community-kitchens",
    title: "Community Kitchens",
    description:
      "Support community kitchens where volunteers prepare meals for people in need.",
    Icon: Package,
  },
  {
    id: "school-feeding",
    title: "School Feeding Programs",
    description:
      "Help schools provide meals to students so kids can focus on learning.",
    Icon: School,
  },
  {
    id: "health-wellness",
    title: "Health & Wellness",
    description:
      "Fund medical supplies, checkups, and wellness support for vulnerable groups.",
    Icon: Stethoscope,
  },
  {
    id: "emergency-food",
    title: "Emergency Food Relief",
    description:
      "Deliver urgent food assistance during disasters and crisis situations.",
    Icon: HeartHandshake,
  },
  {
    id: "nutritional-support",
    title: "Nutritional Support",
    description:
      "Provide nutrition packs and education to improve long-term health outcomes.",
    Icon: Milk,
  },
];

const baseCampaignByCategoryId: Record<string, Omit<CampaignCardItem, "id">> = {
  "community-kitchens": {
    title: "Renovate community kitchen",
    location: "Hue, Vietnam",
    raised: 5600,
    goal: 12000,
    image: "/assets/img/campaign/1.jpg",
  },
  "school-feeding": {
    title: "Milk for primary students",
    location: "Lagos, Nigeria",
    raised: 3100,
    goal: 8000,
    image: "/assets/img/campaign/2.jpg",
  },
  "health-wellness": {
    title: "Medical kits for rural clinics",
    location: "Quang Tri, Vietnam",
    raised: 7200,
    goal: 14000,
    image: "/assets/img/campaign/1.jpg",
  },
  "emergency-food": {
    title: "Flood relief food packs",
    location: "Central Vietnam",
    raised: 15400,
    goal: 25000,
    image: "/assets/img/campaign/2.jpg",
  },
  "nutritional-support": {
    title: "Micronutrient packs for moms",
    location: "Phnom Penh, Cambodia",
    raised: 4800,
    goal: 10000,
    image: "/assets/img/campaign/1.jpg",
  },
};

function buildManyCampaigns(categoryId: string, n: number): CampaignCardItem[] {
  const base = baseCampaignByCategoryId[categoryId];
  if (!base) return [];

  return Array.from({ length: n }).map((_, i) => ({
    id: `${categoryId}-${i + 1}`,
    ...base,
    title: `${base.title} #${i + 1}`,
    raised: Math.max(100, base.raised + i * 350),
  }));
}

const categoryCampaigns: Record<string, CampaignCardItem[]> = {
  "community-kitchens": buildManyCampaigns("community-kitchens", 12),
  "school-feeding": buildManyCampaigns("school-feeding", 12),
  "health-wellness": buildManyCampaigns("health-wellness", 12),
  "emergency-food": buildManyCampaigns("emergency-food", 12),
  "nutritional-support": buildManyCampaigns("nutritional-support", 12),
};

const CategoryCard = ({
  id,
  title,
  Icon,
  onClick,
}: {
  id: string;
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
  onClick: (categoryId: string) => void;
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className="group flex w-full min-w-0 flex-col items-center justify-start gap-2 rounded-2xl bg-white px-3 py-4 text-center shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
      style={{ minHeight: 140 }}
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F84D43] text-white transition group-hover:bg-[#1A685B]">
        <Icon className="h-6 w-6" />
      </span>
      <span className="w-full text-sm sm:text-base font-bold text-slate-900 leading-snug break-words">
        {title}
      </span>
    </button>
  );
};

const CATEGORY_SECTIONS_PER_PAGE = 3;
const CAMPAIGNS_PER_SECTION = 5;

function getPageIndexByCategoryId(categoryId: string) {
  const idx = categories.findIndex((c) => c.id === categoryId);
  if (idx < 0) return 0;
  return Math.floor(idx / CATEGORY_SECTIONS_PER_PAGE);
}

function getCategoryIdsByPageIndex(pageIndex: number) {
  const start = pageIndex * CATEGORY_SECTIONS_PER_PAGE;
  return categories
    .slice(start, start + CATEGORY_SECTIONS_PER_PAGE)
    .map((c) => c.id);
}

export function CampaignCategoriesSection() {
  const [pageIndex, setPageIndex] = useState(0);

  const totalPages = useMemo(
    () => Math.ceil(categories.length / CATEGORY_SECTIONS_PER_PAGE),
    [],
  );

  const visibleCategories = useMemo(() => {
    const start = pageIndex * CATEGORY_SECTIONS_PER_PAGE;
    return categories.slice(start, start + CATEGORY_SECTIONS_PER_PAGE);
  }, [pageIndex]);

  const canPrev = pageIndex > 0;
  const canNext = pageIndex < totalPages - 1;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (!hash) return;

    const categoryId = decodeURIComponent(hash.replace("#", ""));
    if (!categoryId) return;

    const targetPage = getPageIndexByCategoryId(categoryId);
    setPageIndex(targetPage);

    const timeout = window.setTimeout(() => {
      const el = document.getElementById(categoryId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    const targetPage = getPageIndexByCategoryId(categoryId);

    setPageIndex(targetPage);

    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${categoryId}`);
      window.setTimeout(() => {
        const el = document.getElementById(categoryId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  };

  const handlePrev = () => {
    if (!canPrev) return;

    const nextPage = pageIndex - 1;
    const ids = getCategoryIdsByPageIndex(nextPage);

    setPageIndex(nextPage);

    if (typeof window !== "undefined") {
      const nextHash = ids[0] ?? "campaigns";
      window.history.replaceState(null, "", `#${nextHash}`);
      window.setTimeout(() => {
        const el = document.getElementById(nextHash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  };

  const handleNext = () => {
    if (!canNext) return;

    const nextPage = pageIndex + 1;
    const ids = getCategoryIdsByPageIndex(nextPage);

    setPageIndex(nextPage);

    if (typeof window !== "undefined") {
      const nextHash = ids[0] ?? "campaigns";
      window.history.replaceState(null, "", `#${nextHash}`);
      window.setTimeout(() => {
        const el = document.getElementById(nextHash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  };

  return (
    <section id="campaigns" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-10 md:mb-14 flex items-start justify-between gap-6">
          <div className="hidden md:flex items-center gap-2 text-[#1A685B]">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#1A685B]" />
            <span className="inline-flex h-2 w-2 rounded-full bg-[#1A685B]/70" />
            <span className="inline-flex h-2 w-2 rounded-full bg-[#1A685B]/40" />
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-5xl gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories.map(({ title, id, Icon }) => (
            <CategoryCard
              key={id}
              id={id}
              title={title}
              Icon={Icon}
              onClick={handleCategoryClick}
            />
          ))}
        </div>

        <div className="mx-auto mt-10 flex flex-wrap w-full max-w-5xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={!canPrev}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Previous
          </button>
          <div className="text-sm font-semibold text-slate-700">
            Page {pageIndex + 1} / {totalPages}
          </div>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canNext}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Next
          </button>
        </div>

        <div className="mt-12 md:mt-16 space-y-12 md:space-y-16">
          {visibleCategories.map(({ id, title, description }) => {
            const all = categoryCampaigns[id] ?? [];
            const visible = all.slice(0, CAMPAIGNS_PER_SECTION);
            const showArrow = all.length > CAMPAIGNS_PER_SECTION;

            return (
              <div key={id} id={id} className="scroll-mt-28">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-[#F84D43]">
                      {title}
                    </p>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                      Featured campaigns
                    </h3>
                    <p className="mt-2 text-slate-600 max-w-2xl">
                      {description}
                    </p>
                  </div>
                  <Link
                    href={`/campaigns/campaignsList?categoryId=${id}`}
                    className="inline-flex w-fit shrink-0 items-center justify-center rounded-full bg-[#F84D43] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1A685B]"
                  >
                    See more
                  </Link>
                </div>

                <div className="flex flex-col lg:flex-row items-stretch gap-4">
                  <div className="flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {visible.map((item) => (
                        <CampaignCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>

                  {showArrow && (
                    <Link
                      href={`/campaigns/campaignsList?categoryId=${id}`}
                      className="shrink-0 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 shadow-sm hover:bg-slate-50 self-center lg:self-auto"
                      aria-label="See more"
                    >
                      <ChevronRight className="h-6 w-6 text-slate-800" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
