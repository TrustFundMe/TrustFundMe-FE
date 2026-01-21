"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { campaignService } from "@/services/campaignService";
import type { CampaignDto } from "@/types/campaign";
import { withFallbackImage } from "@/lib/image";

import DanboxLayout from "@/layout/DanboxLayout";
import CampaignsListBanner from "@/components/campaign/CampaignsListBanner";
import CampaignCard, {
  type CampaignCardItem,
} from "@/components/campaign/CampaignCard";

const PAGE_SIZE = 12;

export default function CampaignsListPage() {
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

    const category = categories.find((c) => c.id === categoryId);

    return { category };
  }, [categoryId]);

  const [campaigns, setCampaigns] = useState<CampaignCardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setError("");

      try {
        setLoading(true);
        const res = await campaignService.getAll();

        const items: CampaignCardItem[] = res.map((c: CampaignDto) => ({
          id: String(c.id),
          title: c.title,
          location: `Fund Owner #${c.fundOwnerId}`,
          raised: c.balance ?? 0,
          goal: Math.max(1, c.balance ?? 1),
          image: withFallbackImage(c.coverImage, "/assets/img/campaign/1.jpg"),
        }));

        if (!mounted) return;
        setCampaigns(items);
      } catch {
        if (!mounted) return;
        setError("Failed to load campaigns");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredCampaigns = useMemo(() => {
    if (!search.trim()) return campaigns;
    const q = search.trim().toLowerCase();
    return campaigns.filter((c) =>
      String(c.title ?? "").toLowerCase().includes(q),
    );
  }, [campaigns, search]);

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
