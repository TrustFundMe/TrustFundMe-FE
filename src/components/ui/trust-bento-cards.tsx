"use client"

import React from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion } from "framer-motion"

const cardContents = [
  {
    title: "Real-time Transparency",
    description:
      "No more waiting for end-of-month reports. Every donation and expense is updated instantly via Webhooks, allowing you to track money flow in real-time 24/7.",
  },
  {
    title: "AI-Powered Verification",
    description:
      "We eliminate manual errors with AI OCR technology. Every expense receipt is automatically extracted and verified by AI, ensuring every dollar you donate is used for the right purpose and amount.",
  },
  {
    title: "Community Governance",
    description:
      "You're not just a donor, you're a supervisor. With weighted voting mechanism, the community approves major expenses together, creating a democratic and fair charity ecosystem. From donation tracking to expense approval, every stakeholder has a voice in how funds are managed and distributed.",
  },  
  {
    title: "Blockchain Verified",
    description:
      "Every transaction is recorded on blockchain for immutable transparency and audit trails.",
  },
  {
    title: "100% Fund Transparency",
    description:
      "Track exactly where your money goes with detailed breakdowns and real-time updates on fund allocation.",
  },
]


const PlusCard: React.FC<{
  className?: string
  title: string
  description: string
  index: number
}> = ({
  className = "",
  title,
  description,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.25, 0.4, 0.25, 1]
      }}
      className={cn(
        "relative border border-dashed border-[#1A685B]/40 dark:border-zinc-700 rounded-lg p-6 bg-white dark:bg-zinc-950 min-h-[200px]",
        "flex flex-col justify-between hover:border-[#F84D43] hover:shadow-xl transition-all duration-300 group",
        className
      )}
    >
      <CornerPlusIcons />
      {/* Content */}
      <div className="relative z-10 space-y-2">
        <h3 className="text-xl font-bold text-[#202426] dark:text-gray-100 group-hover:text-[#F84D43] transition-colors">
          {title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

const CornerPlusIcons = () => (
  <>
    <PlusIcon className="absolute -top-3 -left-3" />
    <PlusIcon className="absolute -top-3 -right-3" />
    <PlusIcon className="absolute -bottom-3 -left-3" />
    <PlusIcon className="absolute -bottom-3 -right-3" />
  </>
)

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width={24}
    height={24}
    strokeWidth="1.5"
    stroke="currentColor"
    className={`text-[#F84D43] dark:text-white size-6 ${className}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
  </svg>
)

export default function TrustBentoCards() {
  return (
    <section className="bg-white dark:bg-black dark:bg-transparent border-t border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto container py-20 px-4">
        {/* Section Header */}
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#202426] dark:text-white mb-4">
            Donors • Recipients • Transparency
          </h2>
        </motion.div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 auto-rows-auto gap-4">
          <PlusCard {...cardContents[0]} index={0} className="lg:col-span-3 lg:row-span-2" />
          <PlusCard {...cardContents[1]} index={1} className="lg:col-span-2 lg:row-span-2" />
          <PlusCard {...cardContents[2]} index={2} className="lg:col-span-4 lg:row-span-1" />
          <PlusCard {...cardContents[3]} index={3} className="lg:col-span-2 lg:row-span-1" />
          <PlusCard {...cardContents[4]} index={4} className="lg:col-span-2 lg:row-span-1" />
        </div>

        {/* Section Footer Heading */}
        <motion.div 
          className="max-w-2xl ml-auto text-right px-4 mt-6 lg:-mt-20"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-[#202426] dark:text-white mb-4">
            Built for trust. Designed for impact.
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            TrustFundMe gives you complete visibility into every donation. Each feature is thoughtfully designed to ensure transparency, accountability, and maximum social impact.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link 
            href="/causes" 
            className="px-8 py-4 bg-gradient-to-r from-[#F84D43] to-[#FF6B6B] text-white rounded-lg font-bold hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Explore Projects
          </Link>
          <Link 
            href="/about" 
            className="px-8 py-4 border-2 border-[#1A685B] text-[#1A685B] rounded-lg font-bold hover:bg-[#1A685B] hover:text-white transition-all duration-300"
          >
            Learn More
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
