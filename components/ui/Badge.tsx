import type { ProjectTag } from '@/lib/types'

type BadgeProps = {
  tag: ProjectTag
}

const labelMap: Record<ProjectTag, string> = {
  available: 'Available',
  'hot-deal': 'Hot Deal',
  featured: 'Featured'
}

const classMap: Record<ProjectTag, string> = {
  available: 'bg-emerald-100 text-emerald-700',
  'hot-deal': 'bg-orange-100 text-orange-700',
  featured: 'bg-sky-100 text-sky-700'
}

export function Badge({ tag }: BadgeProps) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classMap[tag]}`}>{labelMap[tag]}</span>
}
