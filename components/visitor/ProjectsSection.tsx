'use client'

import { useMemo, useState } from 'react'
import type { Project, ProjectTag } from '@/lib/types'
import { ProjectCard } from './ProjectCard'
import EnquiryModal from './EnquiryModal'

type ProjectsSectionProps = {
  projects: Project[]
}

const filters: Array<{ label: string; value: ProjectTag | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'Hot Deal', value: 'hot-deal' },
  { label: 'Featured', value: 'featured' }
]

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [activeFilter, setActiveFilter] = useState<ProjectTag | 'all'>('all')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Project types for filtering
  const types = [
    'All',
    'Houses',
    'House/Plot',
    'Apartments',
    'Flats',
    'Agriculture Lands',
    'Commercial',
    'Open Plots',
    'Ventures',
  ]

  // Map UI type to backend type value
  const typeMap: Record<string, string> = {
    'Houses': 'houses',
    'House/Plot': 'house-plot',
    'Apartments': 'apartments',
    'Flats': 'apartments', // Alias for apartments
    'Agriculture Lands': 'agriculture-land',
    'Commercial': 'commercial-space',
    'Open Plots': 'open-plots',
    'Ventures': 'our-ventures',
  }

  // Filter by tag (existing)
  const tagFiltered = useMemo(() => {
    if (activeFilter === 'all') return projects
    return projects.filter((project) => project.tag === activeFilter)
  }, [activeFilter, projects])

  // Filter by type (new)
  const filteredProjects = useMemo(() => {
    if (selectedType === 'All') return tagFiltered
    const backendType = typeMap[selectedType]
    return tagFiltered.filter((p) => p.type === backendType)
  }, [selectedType, tagFiltered])

  const handleEnquire = (project: Project) => {
    setSelectedProject(project)
    setShowModal(true)
  }

  return (
    <section id="projects" className="section-gap bg-slate-100">
      <div className="container-shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-500">Projects</p>
          <h2 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">Popular Residences</h2>
          <p className="mt-4 text-slate-600">Explore our handpicked selection of premium properties.</p>
        </div>

        {/* Tag filter buttons (existing) */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeFilter === filter.value ? 'bg-amber-500 text-primary' : 'bg-white text-slate-700 shadow-sm hover:bg-slate-100'}`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Type filter buttons (new) */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {types.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition ${selectedType === type ? 'bg-primary text-white' : 'bg-white text-slate-700 shadow-sm hover:bg-slate-100'}`}
            >
              {type}
            </button>
          ))}
        </div>

        {filteredProjects.length === 0 ? (
          <div className="py-20 text-center text-slate-500">No projects available yet. Check back soon!</div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onEnquire={handleEnquire} />
            ))}
          </div>
        )}
      </div>

      <EnquiryModal project={selectedProject} isOpen={showModal} onClose={() => setShowModal(false)} />
    </section>
  )
}
