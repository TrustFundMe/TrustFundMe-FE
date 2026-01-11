"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  imageSrc: string
  title: string
  description: string
  raised: number
  goal: number
  votes: number
  featured?: boolean
  className?: string
}

export default function ProjectCard({
  imageSrc,
  title,
  description,
  raised,
  goal,
  votes,
  featured = false,
  className,
}: ProjectCardProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const progress = (raised / goal) * 100

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px"
      }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current)
      }
    }
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        "flex flex-col bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden h-full transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
    >
      <div className={cn("relative w-full overflow-hidden", featured ? "h-[500px]" : "h-40")}>
        <img
          src={imageSrc}
          alt={title}
          className={cn(
            "w-full h-full object-cover hover:scale-110 transition-all duration-700",
            isVisible ? "scale-100 opacity-100" : "scale-110 opacity-0"
          )}
        />
      </div>
      
      <div className={cn("flex flex-col gap-3 flex-grow", featured ? "p-6" : "p-4")}>
        <div className="flex flex-col gap-1">
          <h3 className={cn(
            "font-semibold text-gray-900 dark:text-gray-100",
            featured ? "text-2xl" : "text-lg"
          )}>
            {title}
          </h3>
          <p className={cn(
            "text-gray-600 dark:text-gray-400",
            featured ? "text-base" : "text-sm"
          )}>
            {description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-2 mt-auto">
          <div className={cn(
            "relative w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden",
            featured ? "h-4" : "h-3"
          )}>
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: isVisible ? `${Math.min(progress, 100)}%` : '0%',
                background: 'linear-gradient(90deg, #ff5e14 0%, #ff8a4d 100%)',
                transitionDelay: '300ms'
              }}
            />
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className={cn(
                "font-bold text-gray-900 dark:text-gray-100",
                featured ? "text-xl" : "text-base"
              )}>
                {formatCurrency(raised)}
              </span>
              <span className={cn(
                "text-gray-500 dark:text-gray-400",
                featured ? "text-sm" : "text-xs"
              )}>
                raised of {formatCurrency(goal)}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className={cn(
                "font-bold text-gray-900 dark:text-gray-100",
                featured ? "text-xl" : "text-base"
              )}>
                {votes.toLocaleString()}
              </span>
              <span className={cn(
                "text-gray-500 dark:text-gray-400",
                featured ? "text-sm" : "text-xs"
              )}>
                votes
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
