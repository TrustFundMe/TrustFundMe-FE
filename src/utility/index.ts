import { useEffect } from "react";
export function useStickyHeader(): void {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("#header-sticky");
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle("sticky", window.scrollY >= 100);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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
