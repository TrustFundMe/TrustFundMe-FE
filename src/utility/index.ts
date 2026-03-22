import { useEffect } from "react";
export function useStickyHeader(): void {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("#header-sticky");
    if (!header) return;

    // Some header variants have a top section above `#header-sticky`
    const headerTop =
      (document.querySelector<HTMLElement>(".header-top-section-3") ||
        document.querySelector<HTMLElement>(".header-top-section")) ?? null;

    // Preserve original display so we don't "reveal" sections that are intentionally hidden (e.g. style={{display:'none'}})
    const headerTopInitialDisplay = headerTop
      ? headerTop.style.display || getComputedStyle(headerTop).display
      : "";

    // Avoid duplicate placeholders if this hook is mounted twice
    const existingPlaceholder = document.getElementById("header-sticky-placeholder");
    const placeholder =
      (existingPlaceholder as HTMLDivElement | null) ?? document.createElement("div");
    placeholder.id = "header-sticky-placeholder";
    placeholder.style.display = "none";
    placeholder.style.width = "100%";
    placeholder.style.transition = "none"; // no transitions during stick/un-stick
    placeholder.style.margin = "0";
    placeholder.style.padding = "0";

    const targetElement = headerTop || header;
    targetElement.parentElement?.insertBefore(placeholder, targetElement);

    const calculateTotalHeight = (): number => {
      const headerTopHeight = headerTop?.offsetHeight ?? 0;
      const headerHeight = header.offsetHeight ?? 0;
      return headerTopHeight + headerHeight;
    };

    let stickyStartY = 0;
    const recalcStickyStart = () => {
      const rect = header.getBoundingClientRect();
      stickyStartY = rect.top + (window.scrollY || document.documentElement.scrollTop);
    };
    recalcStickyStart();

    const applySticky = (shouldStick: boolean) => {
      const isCurrentlySticky = header.classList.contains("sticky");
      if (shouldStick && !isCurrentlySticky) {
        placeholder.style.height = `${calculateTotalHeight()}px`;
        placeholder.style.display = "block";
        header.classList.add("sticky");

        if (headerTop) {
          headerTop.style.transition = "none";
          headerTop.style.display = "none";
        }
      } else if (!shouldStick && isCurrentlySticky) {
        header.classList.remove("sticky");
        placeholder.style.display = "none";

        if (headerTop) {
          headerTop.style.transition = "none";
          headerTop.style.display = headerTopInitialDisplay || "";
        }
      }
    };

    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      applySticky(scrollTop >= stickyStartY);
    };

    // Initial check
    onScroll();

    const handleResize = () => {
      recalcStickyStart();
      // If we're currently sticky, keep placeholder height in sync
      if (header.classList.contains("sticky")) {
        placeholder.style.height = `${calculateTotalHeight()}px`;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    // React to content size changes (e.g. images/fonts affecting header height)
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(header);
    if (headerTop) resizeObserver.observe(headerTop);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();

      header.classList.remove("sticky");
      if (headerTop) {
        headerTop.style.transition = "none";
        headerTop.style.display = headerTopInitialDisplay || "";
      }
      placeholder.remove();
    };
  }, []);
}

export function useScrollTop(): void {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const scrollUp = document.querySelector<HTMLElement>(".scroll-up");
    const scrollPath =
      document.querySelector<SVGPathElement>(".scroll-up path");
    if (!scrollUp || !scrollPath) return;
    const pathLength = scrollPath.getTotalLength();
    scrollPath.style.transition = "none";
    scrollPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
    scrollPath.style.strokeDashoffset = `${pathLength}`;
    scrollPath.getBoundingClientRect();
    scrollPath.style.transition = "stroke-dashoffset 10ms linear";
    const updateScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollHeight = pathLength - (scrollTop * pathLength) / docHeight;
      scrollPath.style.strokeDashoffset = `${scrollHeight}`;
      scrollUp.classList.toggle("active-scroll", scrollTop > 50);
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll);
    return () => {
      window.removeEventListener("scroll", updateScroll);
    };
  }, []);
}

export function scrollAnimation() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Dynamic import — loads wowjs only after page is interactive, not during initial render
    import("wowjs").then(({ WOW }) => {
      new WOW({ live: false }).init();
    }).catch(console.error);
  }, []);
}
