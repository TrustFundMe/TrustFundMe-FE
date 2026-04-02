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
      className="relative w-full h-[450px] md:h-[550px] lg:h-[650px] flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/assets/img/campaign/treemvungcao.jpg")',
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 md:bg-black/45 lg:bg-black/40" />

      {/* Content - animate when in view / on load */}
      <div className="relative z-10 container mx-auto px-8 md:px-24 lg:px-48 flex flex-col md:flex-row items-center justify-between text-white pt-24 md:pt-32">
        <motion.div
          className="max-w-xl text-left"
          style={{ textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}
          initial={{ opacity: 0, x: -48 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -48 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="font-bold leading-[1.1] text-3xl md:text-5xl lg:text-5xl xl:text-6xl mb-4 md:mb-6 text-white tracking-tight">
            {heading.split('\\n').map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h1>
          <p className="text-base md:text-lg lg:text-xl font-medium text-white/90">
            {subheading}
          </p>
        </motion.div>

        <motion.div
          className="mt-16 md:mt-0 md:ml-8 lg:ml-12 shrink-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          {ctaHref === '/campaign-creation' ? (
            <CampaignBannerCta
              label={ctaLabel}
              toWhenAuthed="/campaign-creation"
              toWhenGuest="/sign-in"
              returnTo="/campaign-creation"
              className="inline-flex items-center justify-center w-28 h-28 md:w-36 md:h-36 lg:w-[150px] lg:h-[150px] rounded-full border-2 border-white bg-transparent hover:bg-white/10 text-white font-medium text-sm md:text-base lg:text-lg transition-all duration-300 backdrop-blur-sm text-center px-2"
            />
          ) : (
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center w-28 h-28 md:w-36 md:h-36 lg:w-[150px] lg:h-[150px] rounded-full border-2 border-white bg-transparent hover:bg-white/10 text-white font-medium text-sm md:text-base lg:text-lg transition-all duration-300 backdrop-blur-sm text-center px-2"
            >
              {ctaLabel}
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default CampaignBanner;

