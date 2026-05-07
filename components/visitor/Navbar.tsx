'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

const links = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Values', href: '#values' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' }
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)
      // Close menu when scrolling
      if (open) {
        setOpen(false)
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [open])

  // Close menu when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      // Don't close if clicking the menu button
      if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
        return
      }
      
      // Close if clicking outside the navbar
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    if (open) {
      // Use a small timeout to ensure state is updated before attaching listeners
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
        document.addEventListener('keydown', handleEscape)
      }, 0)
      
      return () => {
        clearTimeout(timer)
        document.removeEventListener('click', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [open])

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 top-20 z-40 bg-black/20 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      
      <header ref={navRef} className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? 'bg-white/95 shadow-sm backdrop-blur' : 'bg-transparent'}`}>
      <div className="container-shell flex h-20 items-center justify-between gap-4">
        <Link href="#home" className="flex items-center gap-2">
          <Image src="/branding.png" alt="S-Square Marketings Logo" width={160} height={40} className="h-10 w-auto" />
        </Link>

        <button
          ref={buttonRef}
          type="button"
          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border lg:hidden ${scrolled ? 'border-slate-300 text-primary' : 'border-white/30 text-white'}`}
          onClick={(e) => {
            e.stopPropagation()
            setOpen((value) => !value)
          }}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          <span className="sr-only">Toggle navigation</span>
          <span className="block h-0.5 w-5 bg-current" />
          <span className="absolute block h-0.5 w-5 translate-y-1.5 bg-current" />
          <span className="absolute block h-0.5 w-5 -translate-y-1.5 bg-current" />
        </button>

        <nav className={`absolute left-4 right-4 top-20 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition-all lg:static lg:flex lg:items-center lg:gap-6 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none ${open ? 'block' : 'hidden lg:flex'}`} onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-amber-100 hover:text-primary lg:text-white lg:hover:bg-white/10 lg:hover:text-white"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
          <a href="/admin/login" onClick={() => setOpen(false)} className="mt-3 inline-flex rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-primary lg:mt-0">
            Admin
          </a>
        </nav>
      </div>
    </header>
    </>
  )
}
