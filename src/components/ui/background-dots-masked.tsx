'use client';

import { motion } from 'framer-motion';

export const BackgroundDotsMasked = () => {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
      {/* Animated Dots layer with wave effect */}
      <motion.div
        className={[
          "absolute inset-0",
          "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]",
          "[background-size:16px_16px]",
          // Mask the edges so the dots fade out toward the sides
          "[mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]",
          "[-webkit-mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]",
          "[mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat]",
        ].join(" ")}
        animate={{
          backgroundPosition: [
            "0px 0px",
            "16px 16px",
            "0px 0px"
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};
