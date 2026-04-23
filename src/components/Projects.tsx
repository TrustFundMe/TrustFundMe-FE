"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import ProjectCard from "./ui/project-card"
import { ChevronLeft, ChevronRight, Globe, Target, Rocket, Zap, TrendingUp } from "lucide-react"
import { campaignService } from "@/services/campaignService"
import type { CampaignDto } from "@/types/campaign"

export const Projects1 = () => {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const sectionRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update dropdown position when it opens
  useEffect(() => {
    if (dropdownOpen && buttonRef.current) {
      const updatePosition = () => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect()
          setDropdownPosition({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX
          })
        }
      }
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [dropdownOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        buttonRef.current && 
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setDropdownOpen(false)
      }
    }

    // Use setTimeout to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)
    
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  useEffect(() => {
    if (!mounted) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px"
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [mounted])

  useEffect(() => {
    let isActive = true

    const loadCampaigns = async () => {
      try {
        const response = await campaignService.getAll(0, 24)
        if (!isActive) return
        const activeCampaigns = (response.content ?? []).filter((campaign) => campaign.status === "APPROVED")
        setCampaigns(activeCampaigns)
      } catch (error) {
        console.error("Failed to load campaigns for landing page:", error)
        if (isActive) {
          setCampaigns([])
        }
      }
    }

    void loadCampaigns()

    return () => {
      isActive = false
    }
  }, [])
  
  const allProjects = campaigns
    .map((campaign) => {
      const raised = Math.max(Number(campaign.balance) || 0, 0)
      const goal = Math.max(Number(campaign.activeGoal?.targetAmount) || 0, raised, 1)
      const progress = (raised / goal) * 100

      let category = "needs-momentum"
      if (progress >= 80) category = "close-to-goal"
      else if (progress < 25) category = "just-launched"
      else if (progress >= 50) category = "worldwide"

      return {
        id: campaign.id,
        imageSrc: campaign.coverImageUrl || "https://placehold.co/600x400?text=Campaign&bg=f5f5f5&color=111111",
        title: campaign.title,
        description: campaign.description || "Chiến dịch đang cập nhật nội dung chi tiết.",
        raised,
        goal,
        votes: Math.max(raised > 0 ? Math.floor(raised / 100000) : 0, 0),
        category,
      }
    })
    .sort((a, b) => b.raised - a.raised)

  const filters = [
    { id: "all", label: "Tất cả chiến dịch", Icon: Globe },
    { id: "close-to-goal", label: "Gần đạt mục tiêu", Icon: Target },
    { id: "just-launched", label: "Vừa khởi động", Icon: Rocket },
    { id: "needs-momentum", label: "Cần thêm ủng hộ", Icon: Zap },
    { id: "worldwide", label: "Được ủng hộ nhiều", Icon: TrendingUp },
  ]

  const filteredProjects = selectedFilter === "all" 
    ? allProjects 
    : allProjects.filter(p => p.category === selectedFilter)

  const projectsPerPage = 5
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage)
  const startIndex = currentPage * projectsPerPage
  const displayedProjects = filteredProjects.slice(startIndex, startIndex + projectsPerPage)

  useEffect(() => {
    if (totalPages === 0 && currentPage !== 0) {
      setCurrentPage(0)
      return
    }

    if (currentPage > totalPages - 1 && totalPages > 0) {
      setCurrentPage(Math.max(totalPages - 1, 0))
    }
  }, [currentPage, totalPages])
  
  const featuredProject = displayedProjects[0]
  const otherProjects = displayedProjects.slice(1)

  const handlePrevious = () => {
    if (currentPage > 0) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentPage(prev => prev - 1)
        setTimeout(() => setIsTransitioning(false), 50)
      }, 300)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentPage(prev => prev + 1)
        setTimeout(() => setIsTransitioning(false), 50)
      }, 300)
    }
  }

  const handleFilterChange = (newFilter: string) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setSelectedFilter(newFilter)
      setCurrentPage(0)
      setTimeout(() => setIsTransitioning(false), 50)
    }, 300)
  }

  if (!mounted) {
    return null
  }

  return (
    <section 
      ref={sectionRef}
      className="projects-section fix section-padding"
      suppressHydrationWarning
    >
      <div className="container">
        {/* Filter Dropdown */}
        <div 
          className={`flex justify-between items-center mb-5 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="relative">
            <button
              ref={buttonRef}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (buttonRef.current) {
                  const rect = buttonRef.current.getBoundingClientRect()
                  setDropdownPosition({
                    top: rect.bottom + window.scrollY + 8,
                    left: rect.left + window.scrollX
                  })
                }
                setDropdownOpen((prev) => !prev)
              }}
              className="hidden appearance-none bg-white border-2 border-gray-300 rounded-full px-6 py-3 pr-10 text-base font-semibold text-gray-800 hover:border-gray-400 focus:outline-none focus:border-gray-400 transition-all cursor-pointer shadow-sm hover:shadow-md relative z-50"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              {(() => {
                const currentFilter = filters.find(f => f.id === selectedFilter)
                const Icon = currentFilter?.Icon || Globe
                return (
                  <>
                    <Icon className="w-5 h-5 text-gray-700 flex-shrink-0" />
                    <span className="whitespace-nowrap">{currentFilter?.label}</span>
                  </>
                )
              })()}
              <ChevronRight className={`w-4 h-4 flex-shrink-0 rotate-90 text-gray-600 transition-transform duration-200 ${dropdownOpen ? 'rotate-[-90deg]' : ''}`} />
            </button>
            
            {mounted && dropdownOpen && createPortal(
              <div 
                ref={dropdownRef}
                data-dropdown="filter"
                className="fixed bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden min-w-[280px] max-w-[320px] z-[9999]"
                style={{ 
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  animation: 'fadeInDown 0.2s ease-out'
                }}
                onClick={(e) => e.stopPropagation()}
                role="menu"
                aria-orientation="vertical"
              >
                {filters.filter(filter => filter.id !== "all").map((filter, index, filteredArray) => {
                  const Icon = filter.Icon
                  const isActive = selectedFilter === filter.id
                  return (
                    <button
                      key={filter.id}
                      onClick={() => {
                        handleFilterChange(filter.id)
                        setDropdownOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-all duration-200 ${
                        isActive 
                          ? 'bg-orange-50 border-l-4 border-[#ff5e14]' 
                          : 'hover:bg-gray-50'
                      } ${index !== filteredArray.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#ff5e14]' : 'text-gray-600'}`} />
                      <span className={`font-medium text-base flex-1 ${isActive ? 'text-[#ff5e14]' : 'text-gray-700'}`}>
                        {filter.label}
                      </span>
                      {isActive && (
                        <svg className="w-5 h-5 text-[#ff5e14] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>,
              document.body
            )}
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary hover:bg-primary hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent disabled:hover:text-gray-600"
              aria-label="Previous projects"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages - 1}
              className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary hover:bg-primary hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent disabled:hover:text-gray-600"
              aria-label="Next projects"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div 
          className={`row g-4 transition-all duration-700 relative ${
            isTransitioning 
              ? 'opacity-0 translate-y-4' 
              : isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: isVisible && !isTransitioning ? '400ms' : '0ms', zIndex: 1 }}
        >
          {/* Featured Project - 50% width */}
          {featuredProject && (
            <div className="col-12 col-lg-6">
              <ProjectCard
                imageSrc={featuredProject.imageSrc}
                title={featuredProject.title}
                description={featuredProject.description}
                raised={featuredProject.raised}
                goal={featuredProject.goal}
                votes={featuredProject.votes}
                featured={true}
              />
            </div>
          )}

          {/* Other Projects - 50% width total, arranged in 2x2 grid */}
          <div className="col-12 col-lg-6">
            <div className="row g-4">
              {otherProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className="col-12 col-md-6"
                  style={{
                    animation: isTransitioning ? 'none' : `fadeInUp 0.6s ease-out ${(index + 1) * 0.1}s both`
                  }}
                >
                  <ProjectCard
                    imageSrc={project.imageSrc}
                    title={project.title}
                    description={project.description}
                    raised={project.raised}
                    goal={project.goal}
                    votes={project.votes}
                    featured={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Page Indicator */}
        <div className="text-center mt-4 text-sm text-gray-600">
          {totalPages > 0 ? `Page ${currentPage + 1} of ${totalPages}` : "Chưa có chiến dịch phù hợp"}
        </div>
      </div>
    </section>
  )
}
