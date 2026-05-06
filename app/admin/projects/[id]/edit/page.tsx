import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Project } from '@/lib/types'
import { ProjectForm } from '@/components/admin/ProjectForm'

async function getProject(id: string): Promise<Project | null> {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase.from('projects').select('*').eq('id', id).single()
  return (data as Project | null) ?? null
}

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const { id } = params
  const project = await getProject(id)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-500">Projects</p>
        <h1 className="mt-2 text-3xl font-bold text-primary">Edit Project</h1>
      </div>
      <ProjectForm isEditing project={project} />
    </div>
  )
}
