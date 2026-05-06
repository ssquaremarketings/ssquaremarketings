'use client'
import { PROJECT_TYPES } from '@/lib/types'

interface Props {
  activeType: string
  onChange: (type: string) => void
}

export default function TypeFilterBar({ activeType, onChange }: Props) {
  return (
    <nav className="bg-white border-b sticky top-16 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div
          className="flex gap-2 overflow-x-auto py-3 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <button
            onClick={() => onChange('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
              ${activeType === 'all'
                ? 'bg-[#1a3c5e] text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            🏘️ All Properties
          </button>

          {PROJECT_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => onChange(t.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                ${activeType === t.value
                  ? 'bg-[#1a3c5e] text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
