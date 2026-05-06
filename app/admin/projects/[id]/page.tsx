import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Project } from '@/lib/types'
import MuxPlayer from '@mux/mux-player-react'
import Image from 'next/image'

async function getProject(id: string): Promise<Project | null> {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase.from('projects').select('*').eq('id', id).single()
  return (data as Project | null) ?? null
}

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params
  const project = await getProject(id)

  if (!project) {
    return <div className="p-8 text-center text-red-500">Project not found.</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-500">Projects</p>
        <h1 className="mt-2 text-3xl font-bold text-primary">{project.name}</h1>
      </div>
      {/* Video or image */}
      {project.mux_playback_id ? (
        <MuxPlayer
          playbackId={project.mux_playback_id}
          style={{ width: '100%', aspectRatio: '16/9' }}
        />
      ) : project.image_url ? (
        <div className="relative w-full overflow-hidden rounded-xl border aspect-video">
          <Image
            src={project.image_url}
            alt={project.name}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ) : (
        <div className="w-full aspect-[16/9] bg-slate-100 flex items-center justify-center rounded-xl border text-slate-400">
          No video or image available
        </div>
      )}
      {/* Other project details can go here */}
    </div>
  )
}
