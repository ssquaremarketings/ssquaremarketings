'use client'

import { useEffect, useRef, useState } from 'react'

const stats = [
  { label: 'Plots Sold', target: 1200 },
  { label: 'Customers', target: 1000 },
  { label: 'Projects', target: 8 },
  { label: 'Acres', target: 60 }
]

export function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [values, setValues] = useState(stats.map(() => 0))

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return

      const duration = 1400
      const start = performance.now()

      const tick = (time: number) => {
        const progress = Math.min((time - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setValues(stats.map((stat) => Math.floor(stat.target * eased)))
        if (progress < 1) requestAnimationFrame(tick)
      }

      requestAnimationFrame(tick)
      observer.disconnect()
    }, { threshold: 0.35 })

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="home" ref={sectionRef} className="relative flex min-h-screen items-center overflow-hidden bg-hero-pattern bg-cover bg-center text-white">
      <div className="absolute inset-0 bg-slate-950/35" />
      <div className="container-shell relative z-10 grid gap-12 py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="max-w-2xl">
          <p className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
            Premium Open Plots Since 2022
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Discover Most Suitable Property
          </h1>
          <p className="mt-5 max-w-xl text-base text-slate-200 sm:text-lg">
            Premium open plots, practical locations, and transparent pricing for smart long-term land investment.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#projects" className="inline-flex rounded-full bg-amber-500 px-6 py-3 font-semibold text-primary transition hover:-translate-y-0.5">
              Explore Projects
            </a>
            <a href="#contact" className="inline-flex rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
              Contact Us
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-[2rem] border border-white/10 bg-white/10 p-4 backdrop-blur-md">
          {values.map((value, index) => (
            <div key={stats[index].label} className="rounded-2xl bg-white/90 p-5 text-center text-slate-900 shadow-soft">
              <p className="text-3xl font-bold text-primary">{value}+</p>
              <p className="mt-1 text-sm font-medium text-slate-500">{stats[index].label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
