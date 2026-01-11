import { motion } from 'framer-motion';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';

// Define the props for reusability
interface ActionProps {
  text: string;
  onClick: () => void;
  variant?: ButtonProps['variant'];
  className?: string;
}

interface HeroSectionProps {
  title: React.ReactNode;
  subtitle: string;
  actions: ActionProps[];
  images: string[];
  className?: string;
}

// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
};

const floatingVariants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

const HeroSection = ({ title, subtitle, actions, images, className }: HeroSectionProps) => {
  return (
    <section className={cn('w-full bg-white py-12 sm:py-24 relative', className)}>
      {/* Watercolor Background */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="watercolor-bleed">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.03" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="100" />
        </filter>
      </svg>
      <div className="watercolor-canvas">
        <div className="splotch splotch-1"></div>
        <div className="splotch splotch-2"></div>
        <div className="splotch splotch-3"></div>
      </div>
      
      <div className="container mx-auto grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8 relative z-10">
        {/* Left Column: Text Content */}
        <motion.div
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl font-bold tracking-tight text-[#202426] sm:text-6xl leading-tight text-left"
            variants={itemVariants}
          >
            {title}
          </motion.h1>
          <motion.p className="mt-6 max-w-md text-lg text-gray-600 leading-relaxed text-justify" variants={itemVariants}>
            {subtitle}
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap justify-center gap-6 lg:justify-start" variants={itemVariants}>
            {actions.map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ 
                  scale: 1.08, 
                  y: -4,
                  filter: "brightness(1.1)"
                }}
                whileTap={{ scale: 0.95 }}
                variants={index === 0 ? pulseVariants : undefined}
                animate={index === 0 ? "animate" : undefined}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button 
                  onClick={action.onClick} 
                  variant={action.variant} 
                  size="lg" 
                  className={cn(
                    action.className,
                    "relative overflow-hidden group rounded-lg",
                    index === 0 && "animate-pulse-glow"
                  )}
                  style={{ borderRadius: '0.5rem' }}
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 rounded-lg"
                    style={{ borderRadius: '0.5rem' }}
                    animate={{
                      x: ["-200%", "200%"],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "linear",
                    }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    {action.text}
                    {index === 0 && (
                      <motion.span
                        animate={{
                          x: [0, 4, 0],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "easeInOut",
                        }}
                      >
                        →
                      </motion.span>
                    )}
                  </span>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column: Image Collage */}
        <motion.div
          className="relative h-[400px] w-full sm:h-[500px]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Images - Scattered collage layout like reference image */}
          {/* Large image - top left center */}
          <motion.div
            className="absolute right-40 top-4 h-48 w-48 rounded-3xl bg-white p-3 shadow-xl sm:h-72 sm:w-72 cursor-pointer overflow-hidden z-20"
            style={{ transformOrigin: 'center' }}
            variants={imageVariants as import('framer-motion').Variants}
            whileHover={{ scale: 1.05, rotate: 2, boxShadow: "0 25px 60px rgba(26, 104, 91, 0.25)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.img 
              src={images[0]} 
              alt="Charity work" 
              className="h-full w-full rounded-2xl object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              variants={imageVariants as import('framer-motion').Variants}
            />
          </motion.div>
          
          {/* Medium image - right side middle */}
          <motion.div
            className="absolute right-0 top-1/3 h-40 w-40 rounded-3xl bg-white p-3 shadow-xl sm:h-64 sm:w-64 cursor-pointer overflow-hidden z-10"
            style={{ transformOrigin: 'center' }}
            variants={imageVariants as import('framer-motion').Variants}
            whileHover={{ scale: 1.05, rotate: -2, boxShadow: "0 25px 60px rgba(248, 77, 67, 0.25)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.img 
              src={images[1]} 
              alt="Community support" 
              className="h-full w-full rounded-2xl object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
          
          {/* Small image - bottom left */}
          <motion.div
            className="absolute left-0 bottom-4 h-32 w-32 rounded-3xl bg-white p-2 shadow-xl sm:h-48 sm:w-48 cursor-pointer overflow-hidden z-30"
            style={{ transformOrigin: 'center' }}
            variants={imageVariants}
            whileHover={{ scale: 1.05, rotate: 3, boxShadow: "0 25px 60px rgba(255, 225, 69, 0.25)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.img 
              src={images[2]} 
              alt="Volunteer activities" 
              className="h-full w-full rounded-2xl object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
