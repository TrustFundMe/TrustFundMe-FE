'use client';

import { motion } from 'framer-motion';

export const BackgroundDotsWave = () => {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
      {/* Multiple layers for complex wave effect */}
      
      {/* Layer 1: Diagonal wave */}
      <motion.div
        className={[
          "absolute inset-0",
          "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]",
          "[background-size:16px_16px]",
          "[mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]",
          "[-webkit-mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]",
          "[mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat]",
        ].join(" ")}
        animate={{
          backgroundPosition: [
            "0px 0px",
            "32px 32px",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Layer 2: Opposite diagonal wave (creates ripple effect) */}
      <motion.div
        className={[
          "absolute inset-0",
          "bg-[radial-gradient(#d1d5db_0.5px,transparent_0.5px)]",
          "[background-size:20px_20px]",
          "[mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]",
          "[-webkit-mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]",
          "[mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat]",
          "opacity-50",
        ].join(" ")}
        animate={{
          backgroundPosition: [
            "0px 20px",
            "20px 0px",
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};
