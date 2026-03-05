"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  HeartHandshake,
  Milk,
  Package,
  School,
  Stethoscope,
} from "lucide-react";
import { motion, useInView } from "framer-motion";

import CampaignCard, { type CampaignCardItem } from "@/components/campaign/CampaignCard";
import { useToast } from "@/components/ui/Toast";

import { campaignCategoryService } from "@/services/campaignCategoryService";
import { campaignService } from "@/services/campaignService";
import type { CampaignCategory, CampaignDto } from "@/types/campaign";
import { withFallbackImage } from "@/lib/image";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "Community Kitchens": Package,
  "School Feeding Programs": School,
  "Health & Wellness": Stethoscope,
  "Emergency Food Relief": HeartHandshake,
  "Nutritional Support": Milk,
};

function getIcon(title: string) {
  return ICON_MAP[title] || HeartHandshake;
}

function mapDtoToCardItem(dto: CampaignDto, targetAmount: number = 0): CampaignCardItem {
  return {
    id: dto.id.toString(),
    title: dto.title,
    type: dto.type || dto.categoryName || dto.category || "Chung",
    raised: dto.balance || 0,
    goal: targetAmount,
    image: withFallbackImage(dto.coverImageUrl || "", "/assets/img/campaign/1.png"),
  };
}



const categoryCardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
};

const featuredBlockContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const featuredBlockItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const featuredCardItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function FeaturedBlock({
  id,
  title,
  description,
  visible,
}: {
  id: string;
  title: string;
  description: string;
  visible: CampaignCardItem[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });

  return (
    <motion.div
      ref={ref}
      id={id}
      className="scroll-mt-28"
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={featuredBlockContainer}
    >
      <motion.div
        className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        variants={featuredBlockItem}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#F84D43]">
            {title}
          </p>
          <p className="mt-1 text-slate-600 text-sm md:text-base max-w-xl line-clamp-2">
            {description}
          </p>
        </div>
        <Link
          href={`/campaigns/campaignsList?categoryId=${id}`}
          className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#F84D43] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1A685B]"
        >
          See more
          <ChevronRight className="h-4 w-4" />
        </Link>
      </motion.div>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
      >
        {visible.map((item) => (
          <motion.div key={item.id} variants={featuredCardItem}>
            <CampaignCard item={item} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

const CategoryCard = ({
  id,
  title,
  Icon,
  onClick,
  index,
}: {
  id: string;
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
  onClick: (categoryId: string) => void;
  index: number;
}) => {
  return (
    <motion.button
      type="button"
      onClick={() => onClick(id)}
      variants={categoryCardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className="group flex w-full min-w-0 flex-col items-center justify-start gap-2 rounded-2xl bg-white px-3 py-4 text-center shadow-sm ring-1 ring-slate-200 hover:shadow-md"
      style={{ minHeight: 140 }}
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F84D43] text-white transition group-hover:bg-[#1A685B]">
        <Icon className="h-6 w-6" />
      </span>
      <span className="w-full text-sm sm:text-base font-bold text-slate-900 leading-snug truncate" title={title}>
        {title}
      </span>
    </motion.button>
  );
};

export function CampaignCategoriesSection() {
  const [categories, setCategories] = useState<CampaignCategory[]>([]);
  const [categoryCampaigns, setCategoryCampaigns] = useState<Record<number, CampaignCardItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, amount: 0.08 });

  const { toast } = useToast();

  // 1. Fetch Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setError(null);
        const data = await campaignCategoryService.getAll();
        setCategories(data);
      } catch (e) {
        console.error("Failed to fetch categories:", e);
        setError("Không thể tải danh sách danh mục (hệ thống có thể đang khởi động).");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // 2. Fetch Campaigns for all categories
  useEffect(() => {
    if (categories.length === 0) return;

    const fetchCampaigns = async () => {
      const newCampaigns = { ...categoryCampaigns };
      let changed = false;

      await Promise.all(
        categories.map(async (cat) => {
          if (!newCampaigns[cat.id]) {
            try {
              const dtos = await campaignService.getByCategory(cat.id);
              const mapped = await Promise.all(dtos.map(async (dto) => {
                let goalAmount = 0;
                try {
                  const activeGoal = await campaignService.getActiveGoalByCampaignId(dto.id);
                  if (activeGoal) goalAmount = activeGoal.targetAmount;
                } catch (err) { }
                return mapDtoToCardItem(dto, goalAmount);
              }));
              newCampaigns[cat.id] = mapped;
              changed = true;
            } catch (e) {
              console.error(`Failed to fetch campaigns for category ${cat.id}:`, e);
            }
          }
        })
      );

      if (changed) {
        setCategoryCampaigns(newCampaigns);
      }
    };

    fetchCampaigns();
  }, [categories]);

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (!hash || categories.length === 0) return;

    const categoryId = decodeURIComponent(hash.replace("#", ""));
    const idx = categories.findIndex((c) => c.id.toString() === categoryId);
    if (idx < 0) return;

    const t = setTimeout(() => {
      const el = document.getElementById(categoryId);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);
    return () => clearTimeout(t);
  }, [categories]);

  const handleCategoryClick = (categoryId: string) => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${categoryId}`);

      const tryScroll = (attempts = 0) => {
        const el = document.getElementById(categoryId);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: "smooth" });
        } else if (attempts < 10) {
          setTimeout(() => tryScroll(attempts + 1), 50);
        }
      };
      tryScroll();
    }
  };

  // Calculate balanced grid: at least 5 per row
  const totalCategories = categories.length;
  const itemsPerRow = totalCategories > 5 ? Math.max(5, Math.ceil(totalCategories / 2)) : totalCategories;
  // lg:w-[200px] + gap-4 (16px) = 216px
  const balancedMaxWidth = totalCategories > 5 ? `${itemsPerRow * 216}px` : "100%";

  if (loading && categories.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Đang tải danh mục...</p>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-xl bg-[#F84D43] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1A685B]"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <section ref={sectionRef} id="campaigns" className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="mx-auto flex flex-wrap justify-center w-full gap-4"
          style={{ maxWidth: balancedMaxWidth }}
          initial="hidden"
          animate={sectionInView ? "visible" : "hidden"}
          variants={{
            visible: { transition: { staggerChildren: 0.06 } },
            hidden: {},
          }}
        >
          {categories.map(({ name, id }, i) => (
            <div key={id} className="w-[calc(50%-1rem)] sm:w-[calc(33.333%-1rem)] md:w-[calc(25%-1rem)] lg:w-[200px]">
              <CategoryCard
                id={id.toString()}
                title={name}
                Icon={getIcon(name)}
                onClick={handleCategoryClick}
                index={i}
              />
            </div>
          ))}
        </motion.div>

        <div className="mt-10 md:mt-14 space-y-10 md:space-y-14">
          {categories.map(({ id, name, description }) => {
            const all = categoryCampaigns[id] ?? [];
            if (all.length === 0) return null;

            const visible = all.slice(0, 5); // CAMPAIGNS_PER_SECTION was 5

            return (
              <FeaturedBlock key={id} id={id.toString()} title={name} description={description || ""} visible={visible} />
            );
          })}
        </div>
      </div>
    </section>
  );
}
