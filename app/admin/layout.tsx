'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/admin/Sidebar'

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let active = true

    const verifySession = async () => {
      if (pathname === '/admin/login') {
        if (active) setChecking(false)
        return
      }

      if (active) setChecking(true)

      // Supabase session persistence can take a brief moment after login.
      // Retry a few times to avoid redirecting authenticated users back to login.
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          if (active) setChecking(false)
          return
        }

        await new Promise((resolve) => {
          window.setTimeout(resolve, 180)
        })
      }

      if (!active) return
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace('/admin/login')
        return
      }

      if (active) setChecking(false)
    }

    verifySession()

    return () => {
      active = false
    }
  }, [pathname, router])

  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-slate-50">{children}</div>
  }

  if (checking) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-500">Checking session...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8">{children}</main>
    </div>
  )
}
