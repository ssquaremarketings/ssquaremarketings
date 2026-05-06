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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [brochureFile, setBrochureFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [brochureName, setBrochureName] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Multiple image upload handler
  async function handleMultipleUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const uploadedUrls: string[] = []
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      if (data.secure_url) uploadedUrls.push(data.secure_url)
    }
    setImages((prev) => [...prev, ...uploadedUrls])
    setUploading(false)
    // Reset input value so same file can be uploaded again if needed
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Remove video handler (must be inside component and before return)
  async function removeVideo() {
    if (!project) return;
    await fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mux_playback_id: null,
        mux_asset_id: null
      })
    });
    setMuxPlaybackId(null);
    setMuxAssetId(null);
    setVideoStatus('none');
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
    console.log("Project from DB image_urls:", project.image_urls);
  }, [project])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

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


      const payload: any = {
        name: sanitize(form.name.trim()),
        tag: form.tag,
        type: form.type,
        location: form.location.trim(),
        price: form.price.trim(),
        price_per_sqyd: form.price_per_sqyd.trim() || null,
        area: form.area.trim() || null,
        description: form.description.trim() || null,
        image_url: imageUrl || null,
        image_urls: images,
        brochure_url: brochureUrl || null,
        published: form.published,
        updated_at: new Date().toISOString(),
        video_status: videoStatus,
      }
      if (muxAssetId) payload.mux_asset_id = muxAssetId;
      if (muxPlaybackId) payload.mux_playback_id = muxPlaybackId;


      if (isEditing && project) {
        // Update via Next.js API route
        const res = await fetch(`/api/projects/${project.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const text = await res.text();
          console.error('Update failed:', text);
          throw new Error('Project update failed');
        }
      } else {
        // Insert via Supabase (if allowed by RLS, otherwise migrate to API route)
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const text = await res.text();
          console.error('Insert failed:', text);
          throw new Error('Project insert failed');
        }
      }

      setToast({ message: 'Project saved successfully.', type: 'success' })
      setTimeout(() => router.push('/admin/projects'), 700)
    } catch (error) {
      setToast({ message: 'Unable to save project.', type: 'error' })
    } finally {
      setLoading(false)
    }
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
                    <div key={i} className="relative">
                      <img src={url} className="w-24 h-24 object-cover rounded" loading="lazy" />
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
            <div className="mb-2">
              <MuxPlayer playbackId={muxPlaybackId} style={{ width: '100%', aspectRatio: '16/9' }} />
              <button
                type="button"
                onClick={removeVideo}
                className="mt-2 px-3 py-1 rounded bg-red-500 text-white text-xs"
              >
                Remove Video
              </button>
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

        <button type="submit" disabled={loading} className="inline-flex rounded-full bg-amber-500 px-6 py-3 font-semibold text-primary disabled:opacity-60" suppressHydrationWarning>
          {loading ? 'Saving...' : isEditing ? 'Update Project' : 'Save Project'}
        </button>
      </form>
    </div>
  )
}
