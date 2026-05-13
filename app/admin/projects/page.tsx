'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/lib/types'
import { Badge } from '@/components/ui/Badge'
import { Toast } from '@/components/ui/Toast'

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedType, setSelectedType] = useState<string>('All')

  // Project types for dropdown
  const types = [
    'All',
    'Houses',
    'Apartments',
    'Flats',
    'Agriculture Lands',
    'Commercial',
    'Open Plots',
    'Ventures',
  ]
  const typeMap: Record<string, string> = {
    'Houses': 'houses',
    'Apartments': 'apartments',
    'Flats': 'apartments', // Alias for apartments
    'Agriculture Lands': 'agriculture-land',
    'Commercial': 'commercial-space',
    'Open Plots': 'open-plots',
    'Ventures': 'our-ventures',
  }

  // Filter projects by type
  const filteredProjects = selectedType === 'All'
    ? projects
    : projects.filter((p) => p.type === typeMap[selectedType])

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  const loadProjects = async () => {
    setLoading(true)
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    setProjects((data ?? []) as Project[])
    setLoading(false)
  }

  const togglePublished = async (project: Project) => {
    const { error } = await supabase.from('projects').update({ published: !project.published, updated_at: new Date().toISOString() }).eq('id', project.id)
    if (error) {
      setToast({ message: 'Could not update publish status.', type: 'error' })
      return
    }
    await loadProjects()
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) {
      setToast({ message: 'Could not delete project.', type: 'error' })
      return
    }
    await loadProjects()
    setToast({ message: 'Project deleted.', type: 'success' })
  }

  return (
    <div className="space-y-6">
      {toast ? <Toast message={toast.message} type={toast.type} /> : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-500">Projects</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Manage Projects</h1>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Type dropdown filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="rounded-full border px-4 py-2 text-sm font-medium text-slate-700 bg-white shadow-sm"
          >
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <Link href="/admin/projects/new" className="rounded-full bg-amber-500 px-5 py-3 font-semibold text-primary">
            Add New Project
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Thumbnail</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Tag</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-8 text-slate-500" colSpan={6}>Loading...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td className="px-4 py-8 text-slate-500" colSpan={6}>No projects yet.</td></tr>
            ) : filteredProjects.map((project) => (
              <tr key={project.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <img
                    src={
                      Array.isArray(project.image_urls) && project.image_urls.length > 0
                        ? project.image_urls[0]
                        : project.image_url || '/placeholder-project.svg'
                    }
                    loading="lazy"
                    alt={project.name}
                    className="h-12 w-16 rounded-lg object-cover"
                  />
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{project.name}</td>
                <td className="px-4 py-3"><Badge tag={project.tag} /></td>
                <td className="px-4 py-3 text-slate-600">{project.price}</td>
                <td className="px-4 py-3">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={project.published} onChange={() => togglePublished(project)} className="h-4 w-4" />
                    <span>{project.published ? 'Published' : 'Draft'}</span>
                  </label>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/projects/${project.id}/edit`} className="rounded-full border border-primary px-3 py-2 text-xs font-semibold text-primary">
                      Edit
                    </Link>
                    <button type="button" onClick={() => deleteProject(project.id)} className="rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
