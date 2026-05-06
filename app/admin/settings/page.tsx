'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { Toast } from '@/components/ui/Toast'

export default function AdminSettingsPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password.length < 6) {
      setToast({ message: 'Password must be at least 6 characters.', type: 'error' })
      return
    }

    if (password !== confirmPassword) {
      setToast({ message: 'Passwords do not match.', type: 'error' })
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setToast({ message: 'Could not change password.', type: 'error' })
      return
    }

    setPassword('')
    setConfirmPassword('')
    setToast({ message: 'Password updated successfully.', type: 'success' })
  }

  return (
    <div className="max-w-2xl space-y-6">
      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-500">Settings</p>
        <h1 className="mt-2 text-3xl font-bold text-primary">Change Password</h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="w-full rounded-2xl border border-slate-300 px-4 py-3" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</label>
            <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" className="w-full rounded-2xl border border-slate-300 px-4 py-3" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="mt-6 rounded-full bg-amber-500 px-5 py-3 font-semibold text-primary disabled:opacity-60">
          {loading ? 'Saving...' : 'Save Password'}
        </button>
      </form>
    </div>
  )
}
