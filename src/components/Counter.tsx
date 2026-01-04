"use client"; // for Next.js App Router

import { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";

const Counter = ({
  end = 100,
  decimals = 0,
}: {
  end?: number;
  decimals?: number;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const node = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStart(true);
          observer.unobserve(node); // stop observing after it starts
        }
      },
      {
        threshold: 0.3,
      }
    );

    observer.observe(node);

    const rect = (node as HTMLElement).getBoundingClientRect();
    const inView =
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth);

    if (inView) {
      setStart(true);
      observer.unobserve(node);
    }

    return () => {
      observer.unobserve(node);
    };
  }, []);

  return (
    <span ref={ref}>
      {start && <CountUp end={end} duration={3} decimals={decimals} />}
    </span>
  );
};

export default Counter;
