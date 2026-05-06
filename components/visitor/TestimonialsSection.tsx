'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const defaultTestimonials = [
  {
    quote: 'The process was clear and transparent from site visit to booking.',
    name: 'Praveen Kumar',
    project: 'Jagathi Homes'
  },
  {
    quote: 'The team made land investment simple and trustworthy.',
    name: 'Sneha Reddy',
    project: 'Green Valley Meadows'
  },
  {
    quote: 'Excellent pricing and honest guidance for first-time investors.',
    name: 'Mahesh Babu',
    project: 'Royal Palm Gardens'
  }
]

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [testimonials, setTestimonials] = useState(defaultTestimonials)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('review_text, reviewer_name, property')
          .eq('approved', true)
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(6)

        if (!error && data && data.length > 0 && mounted) {
          const mapped = data.map((r: any) => ({
            quote: r.review_text,
            name: r.reviewer_name,
            project: r.property ?? ''
          }))
          setTestimonials(mapped)
        }
      } catch (e) {
        // ignore and keep defaults
      }
    })()

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, 4000)

    return () => {
      mounted = false
      window.clearInterval(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section id="testimonials" className="section-gap bg-slate-100">
      <div className="container-shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-500">Testimonials</p>
          <h2 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">What Our Clients Say</h2>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] bg-white p-8 shadow-soft">
          <p className="text-lg leading-8 text-slate-700">“{testimonials[activeIndex]?.quote}”</p>
          <div className="mt-6">
            <h3 className="text-xl font-bold text-primary">{testimonials[activeIndex]?.name}</h3>
            <p className="text-sm text-slate-500">Purchased: {testimonials[activeIndex]?.project}</p>
          </div>
          <div className="mt-6 flex gap-2">
            {testimonials.map((item, index) => (
              <button
                key={`${item.name}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition ${activeIndex === index ? 'w-8 bg-primary' : 'w-2.5 bg-slate-300'}`}
                aria-label={`Show testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
