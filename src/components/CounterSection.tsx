"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import { GradientGridBg } from "@/components/ui/gradient-grid-bg";

// Animated Counter Component - Fast version with full number display
const AnimatedCounter = ({ 
  value, 
  suffix = ""
}: { 
  value: number; 
  suffix?: string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 200,
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("en-US").format(
          Math.floor(latest)
        ) + suffix;
      }
    });
  }, [springValue, suffix]);

  return <span ref={ref} />;
};

export const CounterSection1 = () => {
  const counterData: {
    label: string;
    value: number;
    suffix: string;
    prefix?: string;
    delay: number;
  }[] = [
    {
      label: "Total Funds Raised",
      value: 50000000,
      suffix: " VND",
      prefix: "$",
      delay: 0.1,
    },
    {
      label: "Total Disbursed",
      value: 35000000,
      suffix: " VND",
      prefix: "$",
      delay: 0.2,
    },
    {
      label: "Verified Expenses",
      value: 1234,
      suffix: " Invoices",
      delay: 0.3,
    },
    {
      label: "Active Donors",
      value: 567,
      suffix: " Users",
      delay: 0.4,
    },
  ];

  return (
    <section className="counter-section section-padding relative overflow-hidden">
      {/* Gradient Grid Background */}
      <GradientGridBg variant="default" className="absolute inset-0" />
      
      <div className="container relative z-10">
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          {counterData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: item.delay }}
              className="wow fadeInUp"
              data-wow-delay={item.delay + "s"}
            >
              <div className="text-center">
                <h2 className="!text-4xl md:!text-5xl lg:!text-6xl !leading-tight font-bold text-white whitespace-nowrap">
                  <span className="count">
                    {item.prefix && <span>{item.prefix}</span>}
                    <AnimatedCounter 
                      value={item.value} 
                      suffix={item.suffix}
                    />
                  </span>
                </h2>
                <p className="!text-base md:!text-lg lg:!text-xl !mt-2 text-white/80">{item.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
