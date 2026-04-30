"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import Link from "next/link";
import CampaignBannerCta from "@/components/campaign/CampaignBannerCta";

interface CampaignBannerProps {
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

const CampaignBanner = ({
  heading = "Support Life‑Changing Campaigns",
  subheading = "Helping them today for a better tomorrow",
  ctaLabel = "Explore Campaigns",
  ctaHref = "#campaigns",
}: CampaignBannerProps) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      className="relative w-full h-[380px] md:h-[440px] lg:h-[500px] flex items-center overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/assets/img/campaign/treemvungcao.jpg")',
        }}
      />

      {/* Gradient overlay — stronger on left for text readability */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.25) 100%)" }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-8 md:px-24 lg:px-48">
        <motion.div
          className="max-w-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1
            className="font-bold leading-[1.1] text-3xl md:text-5xl lg:text-5xl xl:text-6xl mb-3 md:mb-4 text-white tracking-tight"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
          >
            {heading.split('\\n').map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h1>
          <p
            className="text-base md:text-lg font-medium text-white/85 mb-8"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
          >
            {subheading}
          </p>

          {/* CTA buttons — pill style */}
          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            {/* Primary: Khám phá chiến dịch (for donors) */}
            <Link
              href="#campaigns"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#ff5e14] text-white text-sm md:text-base font-bold transition-all duration-300 hover:bg-[#ea550c] hover:shadow-lg hover:shadow-orange-500/25"
            >
              Khám phá chiến dịch
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
            </Link>

            {/* Secondary: Tạo chiến dịch (for fund owners) */}
            {ctaHref === '/new-campaign-test' ? (
              <CampaignBannerCta
                label={ctaLabel}
                toWhenAuthed="/new-campaign-test"
                toWhenGuest="/sign-in"
                returnTo="/new-campaign-test"
                className="inline-flex items-center px-7 py-3.5 rounded-full border-2 border-white/60 bg-white/10 backdrop-blur-sm text-white text-sm md:text-base font-bold transition-all duration-300 hover:bg-white hover:!text-[#111827] hover:border-white"
              />
            ) : (
              <Link
                href={ctaHref}
                className="inline-flex items-center px-7 py-3.5 rounded-full border-2 border-white/60 bg-white/10 backdrop-blur-sm text-white text-sm md:text-base font-bold transition-all duration-300 hover:bg-white hover:!text-[#111827] hover:border-white"
              >
                {ctaLabel}
              </Link>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CampaignBanner;
