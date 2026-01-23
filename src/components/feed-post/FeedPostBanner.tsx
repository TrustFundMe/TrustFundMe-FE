import Link from "next/link";

interface FeedPostBannerProps {
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCreatePost?: () => void;
}

const FeedPostBanner = ({
  heading = "Community Communication",
  subheading = "Share updates, connect, and stay informed",
  ctaLabel = "Create Post",
  ctaHref = "/post/create",
  onCreatePost,
}: FeedPostBannerProps) => {
  return (
    <section
      className="relative w-full min-h-[calc(100vh-96px)] flex items-center justify-center overflow-hidden"
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

      {/* Content */}
      <div className="relative z-10 max-w-4xl px-4 md:px-6 lg:px-8 text-center text-white pt-12 md:pt-16">
        <p className="text-sm md:text-base font-medium tracking-[0.2em] uppercase text-[#FFD18B] mb-3 md:mb-4">
          {subheading}
        </p>
        <h1 className="font-bold leading-tight text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-6 md:mb-8 text-white">
          {heading}
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href={ctaHref}
            onClick={onCreatePost}
            className="inline-flex items-center justify-center rounded-full bg-[#F84D43] hover:bg-[#1A685B] text-white font-semibold text-sm md:text-base px-8 md:px-10 lg:px-12 py-3 md:py-3.5 lg:py-4 shadow-lg shadow-black/25 transition-colors duration-200"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeedPostBanner;
