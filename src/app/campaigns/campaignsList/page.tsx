"use client";

import { Search } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import DanboxLayout from "@/layout/DanboxLayout";
import CampaignsListBanner from "@/components/campaign/CampaignsListBanner";
import CampaignCard, { type CampaignCardItem } from "@/components/campaign/CampaignCard";

const PAGE_SIZE = 12;

function CampaignsListContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId") ?? "";

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const data = useMemo(() => {
    const categories = [
      {
        id: "community-kitchens",
        title: "Community Kitchens",
        description:
          "Support community kitchens where volunteers prepare meals for people in need.",
        image: "/assets/img/campaign/1.jpg",
      },
      {
        id: "school-feeding",
        title: "School Feeding Programs",
        description:
          "Help schools provide meals to students so kids can focus on learning.",
        image: "/assets/img/campaign/2.jpg",
      },
      {
        id: "health-wellness",
        title: "Health & Wellness",
        description:
          "Fund medical supplies, checkups, and wellness support for vulnerable groups.",
        image: "/assets/img/campaign/1.jpg",
      },
      {
        id: "emergency-food",
        title: "Emergency Food Relief",
        description:
          "Deliver urgent food assistance during disasters and crisis situations.",
        image: "/assets/img/campaign/2.jpg",
      },
      {
        id: "nutritional-support",
        title: "Nutritional Support",
        description:
          "Provide nutrition packs and education to improve long-term health outcomes.",
        image: "/assets/img/campaign/1.jpg",
      },
    ];

    const base: Record<string, Omit<CampaignCardItem, "id">> = {
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

    const buildMany = (key: keyof typeof base, n: number) =>
      Array.from({ length: n }).map((_, i) => ({
        id: `${key}-${i + 1}`,
        ...base[key],
        title: `${base[key].title} #${i + 1}`,
        raised: Math.max(100, base[key].raised + i * 350),
      }));

    const categoryCampaigns: Record<string, CampaignCardItem[]> = {
      "community-kitchens": buildMany("community-kitchens", 18),
      "school-feeding": buildMany("school-feeding", 18),
      "health-wellness": buildMany("health-wellness", 18),
      "emergency-food": buildMany("emergency-food", 18),
      "nutritional-support": buildMany("nutritional-support", 18),
    };

    const category = categories.find((c) => c.id === categoryId);
    const campaigns = categoryCampaigns[categoryId] ?? [];

    return { category, campaigns };
  }, [categoryId]);

  const filteredCampaigns = useMemo(() => {
    if (!search.trim()) return data.campaigns;
    const q = search.trim().toLowerCase();
    return data.campaigns.filter((c) =>
      String(c.title ?? "").toLowerCase().includes(q),
    );
  }, [data.campaigns, search]);

  useEffect(() => {
    setPage(1);
  }, [categoryId, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = filteredCampaigns.slice(start, start + PAGE_SIZE);

  const categoryTitle = data.category?.title ?? "Campaigns";
  const categoryDescription =
    data.category?.description ??
    "Please select a valid category to view available campaigns.";
  const categoryImage = data.category?.image ?? "/assets/img/campaign/1.jpg";

  return (
    <DanboxLayout>
      <div className="font-dm-sans">
        <section className="bg-white py-10 md:py-14">
          <div className="container mx-auto px-4">
            <CampaignsListBanner
              categoryTitle={categoryTitle}
              heading="All campaigns"
              description={categoryDescription}
              image={categoryImage}
              backHref="/campaigns"
              backLabel="Back"
            />

            <div className="mt-8 md:mt-10 flex flex-col md:flex-row md:items-center gap-4">
              <div className="hidden md:block h-[2px] flex-1 bg-slate-300" />

              <div className="w-full md:max-w-2xl">
                <div className="flex items-center gap-1 rounded-full bg-white px-5 py-3 ring-[3px] ring-slate-400 shadow-sm">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search campaigns..."
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                  <Search className="h-5 w-5 text-slate-800 shrink-0" />
                </div>
              </div>

              <div className="hidden md:block h-[2px] flex-1 bg-slate-300" />
            </div>

            <div className="mt-8 md:mt-12 mx-auto grid w-full max-w-5xl grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {pageItems.map((item) => (
                <CampaignCard key={item.id} item={item} />
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Previous
              </button>
              <div className="text-sm font-bold text-slate-800">
                Page {safePage} / {totalPages}
              </div>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </DanboxLayout>
  );
}

export default function CampaignsListPage() {
  return (
    <Suspense fallback={
      <DanboxLayout>
        <div className="font-dm-sans">
          <section className="bg-white py-10 md:py-14">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading campaigns...</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </DanboxLayout>
    }>
      <CampaignsListContent />
    </Suspense>
  );
}
