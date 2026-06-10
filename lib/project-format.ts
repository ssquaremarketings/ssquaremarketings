export const PRESET_PROJECT_TAGS = [
  { value: 'available', label: 'Available' },
  { value: 'featured', label: 'Featured' },
  { value: 'hot-deal', label: 'Hot Deal' },
]

const presetTagLabelMap: Record<string, string> = {
  available: 'Available',
  featured: 'Featured',
  'hot-deal': 'Hot Deal',
}

const presetTagClassMap: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-700',
  featured: 'bg-sky-100 text-sky-700',
  'hot-deal': 'bg-orange-100 text-orange-700',
}

export function formatProjectTag(tag: string | null | undefined) {
  if (!tag) return ''
  return presetTagLabelMap[tag] ?? tag
}

export function getProjectTagClass(tag: string | null | undefined) {
  if (!tag) return 'bg-slate-100 text-slate-700'
  return presetTagClassMap[tag] ?? 'bg-slate-100 text-slate-700'
}

export function extractFirstNumericValue(value: string | null | undefined) {
  if (!value) return ''

  const cleaned = value.replace(/,/g, '').trim()
  const match = cleaned.match(/\d+(?:\.\d+)?/)

  return match?.[0] ?? ''
}

export function isPositiveNumberInput(value: string) {
  const trimmed = value.trim()

  if (!trimmed) return false

  return /^\d+(?:\.\d+)?$/.test(trimmed) && Number(trimmed) > 0
}

export function formatPricePerCent(value: string | null | undefined) {
  const numericValue = extractFirstNumericValue(value)

  if (!numericValue) return ''

  return `Rs${numericValue}/Cent`
}

export function formatAreaInCents(value: string | null | undefined) {
  const trimmed = value?.trim()

  if (!trimmed) return ''

  if (/sq\.yd/i.test(trimmed)) {
    return trimmed.replace(/sq\.yd/gi, 'Cents')
  }

  if (/cents?/i.test(trimmed)) {
    return trimmed
  }

  const numericValue = extractFirstNumericValue(trimmed)

  if (numericValue) {
    return `${numericValue} Cents`
  }

  return trimmed
}