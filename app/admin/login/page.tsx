'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Toast } from '@/components/ui/Toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    let active = true

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.replace('/admin/dashboard')
        return
      }

      if (active) setCheckingSession(false)
    }

    checkSession()

    return () => {
      active = false
    }
  }, [router])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setToast({ message: 'Invalid email or password.', type: 'error' })
      return
    }

    router.replace('/admin/dashboard')
  }

  if (checkingSession) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-500">Checking session...</main>
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_rgba(232,160,32,0.12),_transparent_34%),linear-gradient(180deg,#f8fafc,#eef3f8)] px-4">
      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-500">Admin Login</p>
        <h1 className="mt-3 text-3xl font-bold text-primary">Welcome Back</h1>
        <p className="mt-2 text-sm text-slate-600">Use your Supabase auth email and password to enter the CMS.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-primary" suppressHydrationWarning />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-primary" suppressHydrationWarning />
          </div>
        </div>

        <button type="submit" disabled={loading} className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-amber-500 px-5 py-3 font-semibold text-primary disabled:opacity-60" suppressHydrationWarning>
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </main>
  )
}
