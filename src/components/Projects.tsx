"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import ProjectCard from "./ui/project-card"
import { ChevronLeft, ChevronRight, Globe, Target, Rocket, Zap, TrendingUp } from "lucide-react"

export const Projects1 = () => {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
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
  
  const allProjects = [
    {
      id: 1,
      imageSrc: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?fit=crop&w=800&h=600",
      title: "Education for All",
      description: "Building Schools in Rural Areas",
      raised: 125000,
      goal: 200000,
      votes: 1543,
      category: "close-to-goal",
    },
    {
      id: 2,
      imageSrc: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?fit=crop&w=400&h=300",
      title: "Clean Water Initiative",
      description: "Wells for Communities",
      raised: 78500,
      goal: 100000,
      votes: 892,
      category: "close-to-goal",
    },
    {
      id: 3,
      imageSrc: "https://images.unsplash.com/photo-1593113598332-cd288d649433?fit=crop&w=400&h=300",
      title: "Healthcare Access",
      description: "Mobile Clinics",
      raised: 95000,
      goal: 150000,
      votes: 1205,
      category: "worldwide",
    },
    {
      id: 4,
      imageSrc: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?fit=crop&w=400&h=300",
      title: "Food Security",
      description: "Community Gardens",
      raised: 42000,
      goal: 75000,
      votes: 634,
      category: "needs-momentum",
    },
    {
      id: 5,
      imageSrc: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?fit=crop&w=400&h=300",
      title: "Youth Empowerment",
      description: "Skills Training Programs",
      raised: 68000,
      goal: 120000,
      votes: 978,
      category: "just-launched",
    },
    {
      id: 6,
      imageSrc: "https://images.unsplash.com/photo-1509099652299-30938b0aeb63?fit=crop&w=400&h=300",
      title: "Women Empowerment",
      description: "Supporting Women Entrepreneurs",
      raised: 55000,
      goal: 100000,
      votes: 721,
      category: "worldwide",
    },
    {
      id: 7,
      imageSrc: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?fit=crop&w=400&h=300",
      title: "Technology Access",
      description: "Computers for Rural Schools",
      raised: 32000,
      goal: 80000,
      votes: 456,
      category: "needs-momentum",
    },
    {
      id: 8,
      imageSrc: "https://images.unsplash.com/photo-1509099863731-ef4bff19e808?fit=crop&w=400&h=300",
      title: "Environmental Protection",
      description: "Reforestation Initiative",
      raised: 15000,
      goal: 50000,
      votes: 289,
      category: "just-launched",
    },
  ]

  const filters = [
    { id: "all", label: "Happening worldwide", Icon: Globe },
    { id: "close-to-goal", label: "Close to goal", Icon: Target },
    { id: "just-launched", label: "Just launched", Icon: Rocket },
    { id: "needs-momentum", label: "Needs momentum", Icon: Zap },
    { id: "worldwide", label: "High donor activity", Icon: TrendingUp },
  ]

  const filteredProjects = selectedFilter === "all" 
    ? allProjects 
    : allProjects.filter(p => p.category === selectedFilter)

  const projectsPerPage = 5
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage)
  const startIndex = currentPage * projectsPerPage
  const displayedProjects = filteredProjects.slice(startIndex, startIndex + projectsPerPage)
  
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
        <div 
          className={`section-title text-center mb-4 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <span className="sub-title color-2">
            <i className="far fa-heart" />
            Our Impact
          </span>
          <h2 className="mt-char-animation">Discover fundraisers inspired by what you care about</h2>
        </div>

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
          Page {currentPage + 1} of {totalPages}
        </div>
      </div>
    </section>
  )
}
