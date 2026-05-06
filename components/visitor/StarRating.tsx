'use client'
import { useState } from 'react'

interface Props {
  value: number
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function StarRating({ value, onChange, readonly = false, size = 'md' }: Props) {
  const [hovered, setHovered] = useState(0)

  const sizeClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-4xl' : 'text-2xl'

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onChange?.(star)}
          className={`${sizeClass} transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <span className={star <= (hovered || value) ? 'text-amber-400' : 'text-gray-300'}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}
