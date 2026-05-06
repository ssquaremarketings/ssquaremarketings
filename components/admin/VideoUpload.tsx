'use client'
import { useRef, useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'

interface Props {
  projectId: string
  existingPlaybackId?: string | null
  existingAssetId?: string | null
  onVideoReady: (assetId: string, playbackId: string) => void
  onVideoRemoved: () => void
}

type Stage = 'idle' | 'getting-url' | 'uploading' | 'processing' | 'ready' | 'error'

export default function VideoUpload({
  projectId,
  existingPlaybackId,
  existingAssetId,
  onVideoReady,
  onVideoRemoved,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<Stage>(existingPlaybackId ? 'ready' : 'idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [currentPlaybackId, setCurrentPlaybackId] = useState(existingPlaybackId ?? null)
  const [currentAssetId, setCurrentAssetId] = useState(existingAssetId ?? null)
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [processingSeconds, setProcessingSeconds] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function startUpload(file: File) {
    setFileName(file.name)
    setStage('getting-url')
    setErrorMessage(null)
    setIsProcessing(false)
    setIsSaving(false)

    try {

      const res = await fetch('/api/mux/upload-url', { method: 'POST' })
      if (!res.ok) throw new Error('Could not get upload URL')
      const response = await res.json()
      const { uploadId, uploadUrl } = response.data
      if (!uploadId || !uploadUrl) {
        throw new Error('Upload URL missing')
      }
      setCurrentUploadId(uploadId)
      setStage('uploading')
      setUploadProgress(0)

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error('Upload failed')))
        xhr.onerror = () => reject(new Error('Network error during upload'))
        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      setStage('processing')
      setProcessingSeconds(0)
      setIsProcessing(true)
      timerRef.current = setInterval(() => setProcessingSeconds((s) => s + 1), 1000)

      pollingRef.current = setInterval(async () => {
        const pollRes = await fetch(`/api/mux/asset-status?uploadId=${uploadId}`)
        const pollJson = await pollRes.json()
        const poll = pollJson.data
        if (poll?.status === 'ready' && poll?.playbackId) {
          clearInterval(pollingRef.current!)
          clearInterval(timerRef.current!)
          setCurrentPlaybackId(poll.playbackId)
          setCurrentAssetId(poll.assetId)
          setStage('ready')
          setIsProcessing(false)

          // --- Save playbackId to project only if present ---
          if (poll.playbackId && projectId) {
            setIsSaving(true)
            try {
              const saveRes = await fetch(`/api/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mux_playback_id: poll.playbackId }),
              })
              if (!saveRes.ok) {
                setErrorMessage('Failed to save video to project. Please try again.')
                throw new Error('Failed to save video to project')
              } else {
                setErrorMessage(null)
              }
            } catch (err) {
              setErrorMessage('Failed to save video to project. Please try again.')
            } finally {
              setIsSaving(false)
            }
          } else {
            // No video uploaded, skipping video save
          }

          onVideoReady(poll.assetId, poll.playbackId)
        } else if (poll?.status === 'errored') {
          clearInterval(pollingRef.current!)
          clearInterval(timerRef.current!)
          setStage('error')
          setIsProcessing(false)
          setErrorMessage('Mux processing failed. Please try uploading again.')
        }
      }, 5000)
    } catch (err: any) {
      setStage('error')
      setIsProcessing(false)
      setErrorMessage(err.message ?? 'Upload failed')
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      setErrorMessage('Please select a video file (MP4, MOV, AVI, etc.)')
      return
    }
    if (file.size > 2 * 1024 * 1024 * 1024) {
      setErrorMessage('File exceeds 2GB. Please compress the video first.')
      return
    }
    startUpload(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const fakeEvent = { target: { files: [file] } } as any
      handleFileSelect(fakeEvent)
    }
  }

  const [isRemoving, setIsRemoving] = useState(false)

  async function handleRemove() {
    if (!projectId) {
      setErrorMessage('Project ID missing. Cannot delete video.')
      return
    }

    if (!currentAssetId && !currentPlaybackId) {
      return
    }

    setIsRemoving(true)
    setErrorMessage(null)

    try {
      const res = await fetch(`/api/projects/${projectId}/video`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to delete video')
      }

      setCurrentPlaybackId(null)
      setCurrentAssetId(null)
      setStage('idle')
      onVideoRemoved()
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete video')
    } finally {
      setIsRemoving(false)
    }
  }

  // --- RENDER ---

  if (stage === 'idle') return (
    <div>
      <div
        className={`border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#1a3c5e] hover:bg-blue-50 transition-colors ${isProcessing || isSaving ? 'opacity-60 pointer-events-none' : ''}`}
        onClick={() => !isProcessing && !isSaving && fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="text-4xl mb-2">🎥</div>
        <p className="font-semibold text-gray-700">Click or drag a video file here</p>
        <p className="text-sm text-gray-500 mt-1">MP4, MOV, AVI — up to 2GB</p>
        <p className="text-xs text-gray-400 mt-2">
          Video is processed for smooth playback on all devices including iPhone
        </p>
        {(isProcessing || isSaving) && (
          <div className="mt-4 flex flex-col items-center">
            <span className="animate-spin text-2xl mb-2">⏳</span>
            <span className="text-sm text-gray-500">{isProcessing ? 'Processing video...' : 'Saving video...'}</span>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} disabled={isProcessing || isSaving} />
      {errorMessage && <p className="text-red-600 text-sm mt-2">{errorMessage}</p>}
    </div>
  )

  if (stage === 'getting-url') return (
    <div className="border rounded-xl p-6 text-center text-gray-500">
      <div className="animate-spin text-2xl mb-2">⏳</div>
      Preparing upload...
    </div>
  )

  if (stage === 'uploading') return (
    <div className="border rounded-xl p-6">
      <p className="text-sm font-medium text-gray-700 mb-3 truncate">Uploading: {fileName}</p>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-[#1a3c5e] h-3 rounded-full transition-all duration-300"
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
      <p className="text-sm text-gray-500 mt-2">{uploadProgress}% — uploading directly to Mux</p>
    </div>
  )

  if (stage === 'processing') return (
    <div className="border rounded-xl p-6 text-center">
      <div className="animate-spin text-3xl mb-3">⚙️</div>
      <p className="font-medium text-gray-700">Processing video...</p>
      <p className="text-sm text-gray-500 mt-1">
        This takes 1–3 minutes. Please keep this page open.
      </p>
      <p className="text-xs text-gray-400 mt-2">{processingSeconds}s elapsed</p>
    </div>
  )

  if (stage === 'ready') return (
    <div className="border rounded-xl overflow-hidden">
      {currentPlaybackId && (
        <MuxPlayer
          playbackId={currentPlaybackId}
          style={{ width: '100%', aspectRatio: '16/9' }}
          muted
          loop
          accentColor="#e8a020"
        />
      )}
      <div className="p-3 flex gap-3 bg-gray-50">
        <button
          type="button"
          onClick={handleRemove}
          disabled={isRemoving}
          className="text-sm text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {isRemoving && <span className="animate-spin">⏳</span>}
          {isRemoving ? 'Removing...' : 'Remove video'}
        </button>
        <button
          type="button"
          onClick={() => { setStage('idle'); setCurrentPlaybackId(null); setCurrentAssetId(null); onVideoRemoved() }}
          disabled={isRemoving}
          className="text-sm text-gray-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Replace video
        </button>
      </div>
      {errorMessage && <p className="text-red-600 text-sm mt-2 px-3">{errorMessage}</p>}
    </div>
  )

  if (stage === 'error') return (
    <div className="border border-red-200 rounded-xl p-6 text-center bg-red-50">
      <p className="text-red-700 font-medium">Upload failed</p>
      <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
      <button
        type="button"
        onClick={() => { setStage('idle'); setErrorMessage(null) }}
        className="mt-3 text-sm text-[#1a3c5e] underline"
      >
        Try again
      </button>
    </div>
  )

  return null
}
