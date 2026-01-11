"use client";

import { useEffect, useRef, useState } from "react";
import { TestimonialsColumn } from "./ui/testimonials-columns-1";
import { motion } from "motion/react";

const testimonials = [
  {
    text: "This platform made fundraising so easy! I raised $15,000 for my medical expenses in just 3 weeks. The support team was incredibly helpful throughout.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    name: "Sarah Johnson",
    role: "Medical Campaign",
  },
  {
    text: "We successfully funded our community center renovation. The transparent fee structure and easy withdrawal process made everything smooth.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    name: "Michael Chen",
    role: "Community Project",
  },
  {
    text: "Amazing experience! The platform's reach helped us get donations from people worldwide. We exceeded our goal by 150%.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    name: "Emily Rodriguez",
    role: "Education Fund",
  },
  {
    text: "Starting a fundraiser was incredibly simple. Within hours, we were receiving donations. The social sharing features really amplified our reach.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    name: "David Thompson",
    role: "Emergency Relief",
  },
  {
    text: "The platform's credibility helped us gain trust from donors. We raised $50,000 for our animal shelter in just 2 months!",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    name: "Jessica Martinez",
    role: "Animal Welfare",
  },
  {
    text: "Fantastic platform! The mobile app made it easy to update supporters on the go. Our campaign went viral and exceeded expectations.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    name: "James Wilson",
    role: "Disaster Relief",
  },
  {
    text: "I was skeptical at first, but this platform proved to be the best choice. Transparent fees, quick payouts, and excellent customer support.",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
    name: "Amanda Lee",
    role: "Small Business",
  },
  {
    text: "Our nonprofit raised over $100,000 thanks to this platform. The analytics dashboard helped us optimize our campaign strategy.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    name: "Robert Garcia",
    role: "Nonprofit Director",
  },
  {
    text: "The best fundraising platform out there! Easy to use, great features, and the team genuinely cares about your success.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    name: "Lisa Anderson",
    role: "Personal Cause",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export const TestimonialsNew = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <section ref={sectionRef} className="bg-background section-padding relative" suppressHydrationWarning>
      <div className="container z-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <h2 
            className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-center transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            What Our Community Says
          </h2>
          <p 
            className={`text-center mt-5 opacity-75 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-75 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Real stories from people who've successfully raised funds and made a difference through our platform.
          </p>
        </motion.div>

        <div 
          className={`flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};
