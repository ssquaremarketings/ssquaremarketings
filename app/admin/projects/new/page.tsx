import { ProjectForm } from '@/components/admin/ProjectForm'

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-500">Projects</p>
        <h1 className="mt-2 text-3xl font-bold text-primary">Add New Project</h1>
      </div>
      <ProjectForm />
    </div>
  )
}
