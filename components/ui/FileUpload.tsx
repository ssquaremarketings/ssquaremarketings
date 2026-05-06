'use client'

import { ChangeEvent } from 'react'

type FileUploadProps = {
  label: string
  accept: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  previewUrl?: string | null
  fileName?: string | null
  helperText?: string
}

export function FileUpload({ label, accept, onChange, previewUrl, fileName, helperText }: FileUploadProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-primary hover:bg-slate-100">
        <span className="font-medium text-primary">Click to choose file</span>
        <span className="mt-1 text-xs text-slate-500">{helperText || accept}</span>
        <input type="file" accept={accept} onChange={onChange} className="hidden" />
      </label>
      {fileName ? <p className="mt-2 text-sm text-slate-600">Selected: {fileName}</p> : null}
      {previewUrl ? <img src={previewUrl} loading="lazy" alt={`${label} preview`} className="mt-3 h-48 w-full rounded-2xl object-cover" /> : null}
    </div>
  )
}
