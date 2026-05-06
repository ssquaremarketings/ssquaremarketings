'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { Toast } from '@/components/ui/Toast'

export function ContactSection() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (name.trim().length < 3) {
      setToast({ message: 'Please enter your name.', type: 'error' })
      return
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      setToast({ message: 'Phone must be exactly 10 digits.', type: 'error' })
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setToast({ message: 'Please enter a valid email address.', type: 'error' })
      return
    }

    if (!subject) {
      setToast({ message: 'Please select a subject.', type: 'error' })
      return
    }

    setLoading(true)
    const { error } = await supabase.from('leads').insert({
      name: name.trim(),
      phone: phone.trim(),
      budget: subject,
      property: 'General Inquiry',
      message: `Email: ${email.trim()}\n\n${message.trim()}`
    })
    setLoading(false)

    if (error) {
      setToast({ message: 'Message could not be sent.', type: 'error' })
      return
    }

    setName('')
    setPhone('')
    setEmail('')
    setSubject('')
    setMessage('')
    setToast({ message: 'Thanks for reaching out. We will contact you shortly.', type: 'success' })
  }

  return (
    <section id="contact" className="section-gap bg-white">
      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
      <div className="container-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-500">Contact</p>
          <h2 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">Get In Touch</h2>
          <p className="mt-4 text-slate-600">Proddatur, YSR Kadapa District, Andhra Pradesh</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              ['Call', '+91-XXXXXXXXXX', 'tel:+91XXXXXXXXXX'],
              ['WhatsApp', 'Quick chat support', 'https://wa.me/91XXXXXXXXXX'],
              ['Email', 'info@sreeinfra.com', 'mailto:info@sreeinfra.com'],
              ['Instagram', 'Follow project updates', 'https://instagram.com']
            ].map(([title, detail, href]) => (
              <article key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <h3 className="font-bold text-primary">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{detail}</p>
                <a href={href} className="mt-4 inline-flex rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-primary">
                  Open
                </a>
              </article>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
              <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-primary" suppressHydrationWarning />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
              <input value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-primary" suppressHydrationWarning />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-primary" suppressHydrationWarning />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
              <select value={subject} onChange={(event) => setSubject(event.target.value)} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-primary">
                <option value="">Select a subject</option>
                <option>General Inquiry</option>
                <option>Plot Inquiry</option>
                <option>Site Visit</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">Message</label>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-primary" suppressHydrationWarning />
          </div>
          <button type="submit" disabled={loading} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 font-semibold text-white disabled:opacity-60" suppressHydrationWarning>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </section>
  )
}
