import { useEffect } from "react";
export function useStickyHeader(): void {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("#header-sticky");
    const headerTop = document.querySelector<HTMLElement>(".header-top-section-3");
    if (!header) return;
    
    // Fixed scroll threshold
    const STICKY_THRESHOLD = 48;
    
    // Create placeholder element (no transitions for smooth behavior)
    const placeholder = document.createElement("div");
    placeholder.id = "header-sticky-placeholder";
    placeholder.style.display = "none";
    placeholder.style.width = "100%";
    placeholder.style.transition = "none"; // NO TRANSITIONS
    placeholder.style.margin = "0";
    placeholder.style.padding = "0";
    
    // Insert placeholder before headerTop or header
    const targetElement = headerTop || header;
    targetElement.parentElement?.insertBefore(placeholder, targetElement);
    
    // Function to calculate exact total height
    const calculateTotalHeight = (): number => {
      const headerTopHeight = headerTop?.offsetHeight || 0;
      const headerHeight = header.offsetHeight || 0;
      return headerTopHeight + headerHeight;
    };
    
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const shouldStick = scrollTop >= STICKY_THRESHOLD;
      
      if (shouldStick && !header.classList.contains("sticky")) {
        // Calculate height BEFORE adding sticky class
        const totalHeight = calculateTotalHeight();
        
        // Set placeholder height and show it (instant, no transition)
        placeholder.style.height = `${totalHeight}px`;
        placeholder.style.display = "block";
        
        // Add sticky class (CSS has no transitions)
        header.classList.add("sticky");
        
        // Hide header-top when sticky
        if (headerTop) {
          headerTop.style.transition = "none"; // NO TRANSITIONS
          headerTop.style.display = "none";
        }
      } else if (!shouldStick && header.classList.contains("sticky")) {
        // Remove sticky
        header.classList.remove("sticky");
        
        // Hide placeholder (instant)
        placeholder.style.display = "none";
        
        // Show header-top again
        if (headerTop) {
          headerTop.style.transition = "none"; // NO TRANSITIONS
          headerTop.style.display = "block";
        }
      }
    };
    
    // Initial check
    onScroll();
    
    // Add scroll listener
    window.addEventListener("scroll", onScroll, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener("scroll", onScroll);
      header.classList.remove("sticky");
      if (headerTop) {
        headerTop.style.display = "block";
      }
      placeholder?.remove();
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
    if (typeof window !== "undefined") {
      // @ts-ignore
      window.WOW = require("wowjs");
    }
    // @ts-ignore
    new WOW.WOW().init();
  }, []);
}
