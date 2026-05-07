'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Projects', href: '/admin/projects' },
  { label: 'Leads', href: '/admin/leads' },
  { label: 'Reviews', href: '/admin/reviews' }
]

type SidebarProps = {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className={`fixed bottom-0 left-0 top-0 z-40 w-64 flex-col bg-primary px-5 py-6 text-white transition-transform md:static md:translate-x-0 md:z-0 ${
      isOpen ? 'flex translate-x-0' : '-translate-x-full flex'
    }`}>
      <div className="flex flex-col items-start">
        <Image src="/branding.png" alt="S-Square Marketings Logo" width={160} height={40} className="h-10 w-auto mb-2" />
        <p className="mt-1 text-sm text-white/70">Admin CMS</p>
      </div>

      <nav className="mt-8 grid gap-2">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-4 py-3 text-sm font-medium transition ${active ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
      >
        Back to Home
      </Link>

      <button
        type="button"
        className="mt-3 rounded-full border border-white/20 px-4 py-3 text-sm font-semibold transition hover:bg-white/10 md:mt-auto"
        onClick={handleLogout}
      >
        Logout
      </button>

      {/* Close button for mobile */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-auto rounded-full border border-white/20 px-4 py-3 text-sm font-semibold transition hover:bg-white/10 md:hidden"
        >
          Close Menu
        </button>
      )}
    </aside>
  )
}
