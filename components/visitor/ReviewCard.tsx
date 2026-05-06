import StarRating from './StarRating'
import { Review } from '@/lib/types'

export default function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString('en-IN', {
    month: 'long', year: 'numeric'
  })

  return (
    <div className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow">
      <StarRating value={review.rating} readonly size="sm" />
      <p className="text-gray-700 mt-3 text-sm leading-relaxed line-clamp-4">
        "{review.review_text}"
      </p>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-[#1a3c5e] text-sm">{review.reviewer_name}</p>
          {review.property && (
            <p className="text-xs text-gray-500">{review.property}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
            ✓ Verified Buyer
          </span>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
      </div>
    </div>
  )
}
