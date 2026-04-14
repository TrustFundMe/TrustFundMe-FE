"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  Dumbbell,
  Baby,
  Flame,
  Users,
  Gamepad2,
  Waves,
  Stethoscope,
  School,
  Milk,
  Package,
} from "lucide-react";
import { motion, useInView } from "framer-motion";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import CampaignCard, { type CampaignCardItem } from "@/components/campaign/CampaignCard";
import { useToast } from "@/components/ui/Toast";

import { campaignCategoryService } from "@/services/campaignCategoryService";
import { campaignService } from "@/services/campaignService";
import type { CampaignCategory, CampaignDto } from "@/types/campaign";
import { withFallbackImage } from "@/lib/image";
import { FundTypeSection } from "./FundTypeSection";
import { TopFundOwnersSection } from "./TopFundOwnersSection";
import { GeneralDonationSection } from "./GeneralDonationSection";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }> | string> = {
  // English
  "Community Kitchens": Package,
  "School Feeding Programs": "https://cdn-icons-png.flaticon.com/512/114/114806.png",
  "Health & Wellness": "https://cdn-icons-png.flaticon.com/512/1988/1988521.png",
  "Emergency Food Relief": HeartHandshake,
  "Nutritional Support": Milk,
  "Swimming & Aquatics": Waves,
  "Health & Fitness": Dumbbell,
  "Childcare": Baby,
  "Overnight Camps": Flame,
  "Community Programs": Users,
  "Youth & Family Programs": Gamepad2,
  // Vietnamese
  "Môi trường": "https://cdn-icons-png.flaticon.com/512/794/794931.png",
  "Động vật": "https://cdn-icons-png.flaticon.com/512/672/672716.png",
  "Nông nghiệp": "http://cdn-icons-png.flaticon.com/512/10144/10144740.png",
  "Giáo dục": "https://cdn-icons-png.flaticon.com/512/114/114806.png",
  "Y tế": "https://cdn-icons-png.flaticon.com/512/1988/1988521.png",
  "Bơi lội": Waves,
  "Sức khỏe": "https://cdn-icons-png.flaticon.com/512/1988/1988521.png",
  "Thể hình": Dumbbell,
  "Trẻ em": Baby,
  "Cắm trại": Flame,
  "Cộng đồng": Users,
  "Thực phẩm": Package,
  "Cứu trợ": HeartHandshake,
};

function getIcon(title: string = "") {
  const t = title.toLowerCase();
  for (const [key, icon] of Object.entries(ICON_MAP)) {
    if (t.includes(key.toLowerCase()) || key.toLowerCase().includes(t)) {
      return icon;
    }
  }
  return HeartHandshake;
}

function mapDtoToCardItem(dto: CampaignDto, targetAmount: number = 0): CampaignCardItem {
  return {
    id: dto.id.toString(),
    title: dto.title,
    type: dto.type || dto.categoryName || dto.category || "Chung",
    raised: dto.balance || 0,
    goal: targetAmount,
    image: withFallbackImage(dto.coverImageUrl || "", "/assets/img/campaign/1.png"),
    status: dto.status,
  };
}

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
          Xem thêm
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
  iconUrl,
  onClick,
}: {
  id: string;
  title: string;
  iconUrl?: string | null;
  onClick: (categoryId: string) => void;
}) => {
  // Resolve icon: DB iconUrl > ICON_MAP URL > fallback Lucide icon
  const fallbackIcon = getIcon(title);
  const resolvedUrl = iconUrl || (typeof fallbackIcon === "string" ? fallbackIcon : null);

  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className="group flex flex-col items-center justify-center gap-3 py-6 px-6 hover:bg-slate-50 border-b-2 border-transparent hover:border-[#F84D43] transition-all duration-300 min-w-[120px] md:min-w-[140px]"
    >
      <div className="text-slate-400 group-hover:text-[#F84D43] transition-all duration-300 transform group-hover:scale-110">
        {resolvedUrl ? (
          <img
            src={resolvedUrl}
            alt={title}
            className="h-14 w-14 md:h-16 md:w-16 object-contain opacity-50 contrast-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:contrast-100 transition-all duration-300"
          />
        ) : (
          <HeartHandshake className="h-14 w-14 md:h-16 md:w-16 stroke-[1.2]" />
        )}
      </div>
      <span className="text-[12px] md:text-sm font-semibold text-slate-500 group-hover:text-slate-900 tracking-tight text-center leading-tight whitespace-nowrap">
        {title}
      </span>
    </button>
  );
};

export function CampaignCategoriesSection() {
  const [categories, setCategories] = useState<CampaignCategory[]>([]);
  const [categoryCampaigns, setCategoryCampaigns] = useState<Record<number, CampaignCardItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setError(null);
        const data = await campaignCategoryService.getAll();
        setCategories(data);
      } catch (e) {
        console.error("Failed to fetch categories:", e);
        setError("Không thể tải danh sách danh mục.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();

    // Handle anchor scroll on mount
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 800); // Wait for components to render
    }
  }, []);

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
              const approvedDtos = dtos.filter((dto) => dto.status === "APPROVED");
              const mapped = await Promise.all(approvedDtos.map(async (dto) => {
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

  const handleCategoryClick = (categoryId: string) => {
    const el = document.getElementById(categoryId);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="py-12 text-center bg-white border-b border-slate-100 shadow-sm">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#F84D43] border-r-transparent"></div>
        <p className="mt-4 text-slate-500 font-medium tracking-wide">Đang tải danh mục...</p>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="py-12 text-center bg-white border-b border-slate-100 shadow-sm flex flex-col items-center justify-center gap-4">
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

  const showSlider = categories.length > 7;

  return (
    <section id="campaigns" className="pt-0 pb-8 bg-white overflow-hidden border-b border-slate-100 shadow-sm">
      <div className="mx-auto w-full max-w-[1440px] px-0 relative">
        {/* Navigation Arrows - Only show if slider is active and on desktop */}
        {showSlider && (
          <>
            <div className="absolute top-1/2 -translate-y-1/2 left-2 z-20 pointer-events-none hidden md:block">
              <button
                ref={prevRef}
                className="pointer-events-auto h-10 w-10 flex items-center justify-center text-slate-300 hover:text-[#F84D43] transition-colors duration-300"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20 pointer-events-none hidden md:block">
              <button
                ref={nextRef}
                className="pointer-events-auto h-10 w-10 flex items-center justify-center text-slate-300 hover:text-[#F84D43] transition-colors duration-300"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </div>
          </>
        )}

        {/* Categories Layout */}
        <div className="flex justify-center w-full">
          {!showSlider ? (
            <div className="flex flex-wrap items-center justify-center">
              {categories.map(({ name, id, iconUrl }) => (
                <CategoryCard
                  key={id}
                  id={id.toString()}
                  title={name}
                  iconUrl={iconUrl}
                  onClick={handleCategoryClick}
                />
              ))}
            </div>
          ) : (
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={0}
              slidesPerView={2}
              centeredSlides={false}
              navigation={{
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              }}
              onBeforeInit={(swiper) => {
                // @ts-ignore
                swiper.params.navigation.prevEl = prevRef.current;
                // @ts-ignore
                swiper.params.navigation.nextEl = nextRef.current;
              }}
              breakpoints={{
                640: { slidesPerView: 3 },
                768: { slidesPerView: 4 },
                1024: { slidesPerView: 6 },
                1280: { slidesPerView: 7 },
              }}
              className="category-swiper w-full px-12"
            >
              {categories.map(({ name, id, iconUrl }) => (
                <SwiperSlide key={id}>
                  <CategoryCard
                    id={id.toString()}
                    title={name}
                    iconUrl={iconUrl}
                    onClick={handleCategoryClick}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>

      <div className="mt-8">
        <FundTypeSection />
      </div>

      <TopFundOwnersSection />

      {/* Category-based Campaign Blocks */}
      <div className="container mx-auto px-4 mt-16 space-y-16">
        {categories.map(({ id, name, description }) => {
          const all = categoryCampaigns[id] ?? [];
          if (all.length === 0) return null;

          const visible = all.slice(0, 5);

          return (
            <FeaturedBlock
              key={id}
              id={id.toString()}
              title={name}
              description={description || ""}
              visible={visible}
            />
          );
        })}
      </div>

      <div className="mt-24">
        <GeneralDonationSection />
      </div>
    </section>
  );
}


