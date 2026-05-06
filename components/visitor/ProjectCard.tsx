'use client'

import type { Project } from '@/lib/types'
import { PROJECT_TYPES } from '@/lib/types'
import { Badge } from '@/components/ui/Badge'
import { useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'
import Image from 'next/image'

type ProjectCardProps = {
  project: Project
  onEnquire: (project: Project) => void
}

export function ProjectCard({ project, onEnquire }: ProjectCardProps) {
  const imageSrc =
    project.image_urls?.length
      ? project.image_urls[0]
      : project.image_url || '/placeholder-project.svg'
  const typeInfo = PROJECT_TYPES.find((t) => t.value === project.type)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <article
      className="group overflow-hidden rounded-3xl bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-slate-100">
          {project.mux_playback_id && isHovered ? (
            <MuxPlayer
              playbackId={project.mux_playback_id}
              muted
              autoPlay
              loop
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
                display: 'block',
              }}
            />
          ) : (
            <Image
              src={imageSrc}
              alt={project.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              onError={(event) => {
                (event.currentTarget as HTMLImageElement).src = '/placeholder-project.svg'
              }}
            />
          )}
        </div>
        {/* Type badge (top-left) */}
        {typeInfo && (
          <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded-full ${typeInfo.color}`}>
            {typeInfo.icon} {typeInfo.label}
          </span>
        )}
        {/* Tag badge (top-right) */}
        <div className="absolute right-2 top-2">
          <Badge tag={project.tag} />
        </div>
        {/* Video Tour badge */}
        {project.mux_playback_id && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            ▶ Video Tour
          </span>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900">{project.name}</h3>
        <p className="mt-2 text-sm text-slate-500">📍 {project.location}</p>
        <p className="mt-3 line-clamp-3 text-sm text-slate-600">
          {project.description || 'Premium open-plot development designed for practical investment and strong growth.'}
        </p>

        <div className="mt-4">
          <p className="text-xl font-bold text-amber-600">{project.price}</p>
          {(project.price_per_sqyd || project.area) && (
            <p className="mt-1 text-sm text-slate-500">
              {project.price_per_sqyd}
              {project.price_per_sqyd && project.area ? ' · ' : ''}
              {project.area}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {project.brochure_url ? (
            <a
              href={project.brochure_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 justify-center rounded-full border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
            >
              View Brochure
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex flex-1 cursor-not-allowed justify-center rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-400"
            >
              No Brochure
            </button>
          )}
          <button
            type="button"
            className="inline-flex flex-1 justify-center rounded-full bg-amber-500 px-4 py-2.5 text-sm font-semibold text-primary transition hover:-translate-y-0.5"
            onClick={() => onEnquire(project)}
          >
            Enquire Now
          </button>
          {/* View Details button */}
          <a
            href={`/projects/${project.id}`}
            className="w-full text-center py-2 rounded-xl border border-[#1a3c5e] text-[#1a3c5e] text-sm font-medium hover:bg-[#1a3c5e] hover:text-white transition-colors"
          >
            View Details
          </a>
        </div>
      </div>
    </article>
  )
}
