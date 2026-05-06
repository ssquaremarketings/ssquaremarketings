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
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null)

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

  useEffect(() => {
    const value = sessionStorage.getItem('admin-login-lockout-until')
    if (value) {
      const parsed = Number(value)
      if (Number.isFinite(parsed) && parsed > Date.now()) {
        setLockoutUntil(parsed)
      } else {
        sessionStorage.removeItem('admin-login-lockout-until')
      }
    }
  }, [])

  useEffect(() => {
    if (!lockoutUntil) return
    const timer = window.setInterval(() => {
      if (Date.now() >= lockoutUntil) {
        sessionStorage.removeItem('admin-login-lockout-until')
        setLockoutUntil(null)
      }
    }, 1000)

    return () => window.clearInterval(timer)
  }, [lockoutUntil])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (lockoutUntil && Date.now() < lockoutUntil) {
      setToast({ message: 'Please wait before trying again.', type: 'error' })
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      const attempts = Number(sessionStorage.getItem('admin-login-attempts') || '0') + 1
      sessionStorage.setItem('admin-login-attempts', String(attempts))
      if (attempts >= 5) {
        const until = Date.now() + 15 * 60_000
        sessionStorage.setItem('admin-login-lockout-until', String(until))
        setLockoutUntil(until)
        sessionStorage.removeItem('admin-login-attempts')
      }
      setToast({ message: 'Invalid email or password.', type: 'error' })
      return
    }

    sessionStorage.removeItem('admin-login-attempts')
    sessionStorage.removeItem('admin-login-lockout-until')

    window.location.assign('/admin/dashboard')
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

        <button type="submit" disabled={loading || (lockoutUntil ? Date.now() < lockoutUntil : false)} className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-amber-500 px-5 py-3 font-semibold text-primary disabled:opacity-60" suppressHydrationWarning>
          {loading ? 'Signing in...' : lockoutUntil && Date.now() < lockoutUntil ? 'Try again later' : 'Login'}
        </button>
      </form>
    </main>
  )
}
