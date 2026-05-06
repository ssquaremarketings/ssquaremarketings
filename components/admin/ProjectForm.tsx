'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useRef } from 'react'
import { sanitize } from '@/utils/sanitize'
import { PROJECT_TYPES } from '@/lib/types'
import VideoUpload from './VideoUpload'
import { useRouter } from 'next/navigation'
import type { Project, ProjectTag } from '@/lib/types'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { FileUpload } from '@/components/ui/FileUpload'
import { Toast } from '@/components/ui/Toast'
import MuxPlayer from '@mux/mux-player-react'
import Image from 'next/image'
import { projectCreateSchema, projectUpdateSchema } from '@/lib/validation'

type ProjectFormProps = {
  isEditing?: boolean
  project?: Project | null
}

const initialForm = {
  name: '',
  tag: 'available' as ProjectTag,
  type: '',
  location: '',
  price: '',
  price_per_sqyd: '',
  area: '',
  description: '',
  published: false
}

export function ProjectForm({ isEditing = false, project = null }: ProjectFormProps) {
  const router = useRouter()
  const [form, setForm] = useState(initialForm)
  // Video state
  const [muxAssetId, setMuxAssetId] = useState(project?.mux_asset_id ?? null)
  const [muxPlaybackId, setMuxPlaybackId] = useState(project?.mux_playback_id ?? null)
  const [videoStatus, setVideoStatus] = useState(project?.video_status ?? 'none')
  const [removingVideo, setRemovingVideo] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [brochureFile, setBrochureFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [brochureName, setBrochureName] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingSaveAfterUpload, setPendingSaveAfterUpload] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Multiple image upload handler
  async function handleMultipleUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    if (files.length > 10) {
      setToast({ message: 'You can upload up to 10 images at a time.', type: 'error' })
      return
    }

    setUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (const file of files) {
        const url = await uploadToCloudinary(file, 'project-images')
        uploadedUrls.push(url)
      }
      setImages((prev) => [...prev, ...uploadedUrls])
    } catch (error: any) {
      setToast({ message: error?.message || 'Image upload failed.', type: 'error' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Remove video handler (must be inside component and before return)
  async function removeVideo() {
    if (!project?.id) {
      setToast({ message: 'Project ID missing', type: 'error' })
      return
    }

    setRemovingVideo(true)

    try {
      const res = await fetch(`/api/projects/${project.id}/video`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to delete video')
      }

      setMuxPlaybackId(null)
      setMuxAssetId(null)
      setVideoStatus('none')
      setToast({ message: 'Video deleted successfully', type: 'success' })
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to delete video', type: 'error' })
    } finally {
      setRemovingVideo(false)
    }
  }

  useEffect(() => {
    if (!project) return
    setForm({
      name: project.name,
      tag: project.tag,
      type: project.type,
      location: project.location,
      price: project.price,
      price_per_sqyd: project.price_per_sqyd || '',
      area: project.area || '',
      description: project.description || '',
      published: project.published
    })
    setImagePreview(project.image_url || null)
    setBrochureName(project.brochure_url ? 'Existing brochure on file' : '')
    setMuxAssetId(project.mux_asset_id ?? null)
    setMuxPlaybackId(project.mux_playback_id ?? null)
    setVideoStatus(project.video_status ?? 'none')
    if (project.image_urls?.length) {
      setImages(project.image_urls)
    } else if (project.image_url) {
      setImages([project.image_url])
    } else {
      setImages([])
    }
  }, [project])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (uploading || !pendingSaveAfterUpload || loading) return

    setPendingSaveAfterUpload(false)
    void persistProject()
  }, [uploading, pendingSaveAfterUpload, loading])

  const canSubmit = useMemo(() => form.name.trim() && form.location.trim() && form.price.trim() && form.type, [form])

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleBrochureChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setBrochureFile(file)
    setBrochureName(file.name)
  }

  async function persistProject() {
    if (!canSubmit) {
      setToast({ message: 'Please fill the required fields.', type: 'error' })
      return
    }

    setLoading(true)

    try {
      let imageUrl = project?.image_url || ''
      let brochureUrl = project?.brochure_url || ''

      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile, 'project-images')
      }

      if (brochureFile) {
        brochureUrl = await uploadToCloudinary(brochureFile, 'brochures')
      }


      const payload = {
        name: sanitize(form.name.trim()),
        tag: form.tag,
        type: form.type,
        location: sanitize(form.location.trim()),
        price: sanitize(form.price.trim()),
        price_per_sqyd: sanitize(form.price_per_sqyd.trim()) || null,
        area: sanitize(form.area.trim()) || null,
        description: sanitize(form.description.trim()) || null,
        image_url: imageUrl || null,
        image_urls: images,
        brochure_url: brochureUrl || null,
        published: form.published,
        mux_asset_id: muxAssetId,
        mux_playback_id: muxPlaybackId,
      }

      // Validate with appropriate schema
      const validated = isEditing 
        ? projectUpdateSchema.parse(payload)
        : projectCreateSchema.parse(payload)

      if (isEditing && project) {
        const res = await fetch(`/api/projects/${project.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validated),
        })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Project update failed')
        }
      } else {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validated),
        })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Project insert failed')
        }
      }

      setToast({ message: 'Project saved successfully.', type: 'success' })
      setTimeout(() => router.push('/admin/projects'), 700)
    } catch (error: any) {
      setToast({ message: error?.message || 'Unable to save project.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (uploading) {
      setPendingSaveAfterUpload(true)
      setToast({ message: 'Image upload in progress. Saving will continue automatically when it finishes.', type: 'error' })
      return
    }

    await persistProject()
  }

  return (
    <div className="relative">
      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Project Type select (FIRST field) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3c5e]"
            >
              <option value="">Select type...</option>
              {PROJECT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Project Name *</label>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-primary" suppressHydrationWarning />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Location *</label>
            <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-primary" suppressHydrationWarning />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Price *</label>
            <input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-primary" placeholder="₹18 Lakhs onwards" suppressHydrationWarning />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Price per Sq.yd</label>
            <input value={form.price_per_sqyd} onChange={(event) => setForm({ ...form, price_per_sqyd: event.target.value })} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-primary" suppressHydrationWarning />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Area</label>
            <input value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-primary" suppressHydrationWarning />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={5} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-primary" suppressHydrationWarning />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Images</label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleMultipleUpload}
              disabled={uploading}
              className="block w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3c5e]"
            />
            {uploading && <div className="text-xs text-blue-600 mt-2">Uploading...</div>}
            <div className="flex gap-2 flex-wrap mt-3">
              {images.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {images.map((url, i) => (
                    <div key={i} className="relative h-24 w-24 overflow-hidden rounded">
                      <Image 
                        src={url} 
                        alt="Project image preview" 
                        fill 
                        className="object-cover" 
                        sizes="96px"
                        onError={(event) => {
                          (event.currentTarget as HTMLImageElement).src = '/placeholder-project.svg'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, index) => index !== i))}
                        className="absolute top-0 right-0 bg-red-500 text-white px-1"
                        aria-label="Remove image"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <FileUpload
              label="Brochure PDF"
              accept=".pdf,application/pdf"
              onChange={handleBrochureChange}
              fileName={brochureName || undefined}
              helperText={isEditing && project?.brochure_url ? 'Replace brochure if needed' : 'PDF brochure only'}
            />
            {project?.brochure_url ? (
              <a href={project.brochure_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-semibold text-primary underline">
                View existing brochure
              </a>
            ) : null}
          </div>
        </div>

        {/* Video Upload section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Video Tour
          </label>
          {muxPlaybackId ? (
            <div className="border rounded-xl overflow-hidden">
              <MuxPlayer playbackId={muxPlaybackId} style={{ width: '100%', aspectRatio: '16/9' }} />
              <div className="p-3 bg-gray-50 flex gap-3">
                <button
                  type="button"
                  onClick={removeVideo}
                  disabled={removingVideo}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {removingVideo && <span className="animate-spin">⏳</span>}
                  {removingVideo ? 'Removing...' : 'Remove Video'}
                </button>
              </div>
            </div>
          ) : isEditing && project?.id ? (
            <VideoUpload
              projectId={project.id}
              existingPlaybackId={muxPlaybackId}
              existingAssetId={muxAssetId}
              onVideoReady={(assetId, playbackId) => {
                setMuxAssetId(assetId)
                setMuxPlaybackId(playbackId)
                setVideoStatus('ready')
              }}
              onVideoRemoved={() => {
                setMuxAssetId(null)
                setMuxPlaybackId(null)
                setVideoStatus('none')
              }}
            />
          ) : (
            <p className="text-sm text-gray-500">
              Save project first before uploading video
            </p>
          )}
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <input checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary" suppressHydrationWarning />
          <span className="text-sm font-medium text-slate-700">Published</span>
        </label>

        <button type="submit" disabled={loading || uploading} className="inline-flex rounded-full bg-amber-500 px-6 py-3 font-semibold text-primary disabled:opacity-60" suppressHydrationWarning>
          {loading ? 'Saving...' : uploading ? 'Waiting for image upload...' : isEditing ? 'Update Project' : 'Save Project'}
        </button>
      </form>
    </div>
  )
}
