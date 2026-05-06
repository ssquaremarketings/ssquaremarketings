'use client'
import { useState } from 'react'
import { sanitize } from '@/utils/sanitize'
import { supabase } from '@/lib/supabase'
import StarRating from './StarRating'
import { reviewSchema } from '@/lib/validation'

interface Props {
  projectId?: string
  projectName?: string
}

export default function ReviewForm({ projectId, projectName }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [property, setProperty] = useState(projectName ?? '')
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim() || name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (rating === 0) e.rating = 'Please select a rating'
    if (reviewText.trim().length < 20) e.reviewText = 'Review must be at least 20 characters'
    const parsed = reviewSchema.safeParse({
      reviewer_name: name,
      phone: phone || null,
      property: property || null,
      project_id: projectId ?? null,
      rating,
      review_text: reviewText,
    })
    if (!parsed.success) e.form = parsed.error.issues[0]?.message || 'Invalid review data'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    const { error } = await supabase.from('reviews').insert({
      reviewer_name: sanitize(name.trim()),
      phone: phone.trim() || null,
      property: property.trim() || null,
      project_id: projectId ?? null,
      rating,
      review_text: sanitize(reviewText.trim()),
    })

    setSubmitting(false)
    if (!error) setSubmitted(true)
  }

  if (submitted) return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
      <div className="text-3xl mb-2">🙏</div>
      <p className="font-semibold text-green-800">Thank you for your review!</p>
      <p className="text-sm text-green-700 mt-1">
      </p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-6 space-y-4">
      <h3 className="text-lg font-bold text-[#1a3c5e]">Write a Review</h3>
      {errors.form ? <p className="text-sm text-red-600">{errors.form}</p> : null}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3c5e]"
          placeholder="e.g. Ramesh Kumar"
          suppressHydrationWarning
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Phone (optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone (optional — not shown publicly)
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3c5e]"
          placeholder="Your phone number"
          suppressHydrationWarning
        />
      </div>

      {/* Property (pre-filled if from detail page) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Property Purchased
        </label>
        <input
          type="text"
          value={property}
          onChange={(e) => setProperty(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3c5e]"
          placeholder="e.g. Avasa Living"
          suppressHydrationWarning
        />
      </div>

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
      </div>

      {/* Review Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3c5e]"
          placeholder="Share your experience... (min 20 characters)"
          suppressHydrationWarning
        />
        <p className="text-xs text-gray-400 mt-1">{reviewText.length} characters</p>
        {errors.reviewText && <p className="text-red-500 text-xs mt-1">{errors.reviewText}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#1a3c5e] text-white py-3 rounded-xl font-semibold hover:bg-[#163251] transition-colors disabled:opacity-50"
        suppressHydrationWarning
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
