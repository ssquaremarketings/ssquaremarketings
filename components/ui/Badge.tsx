import { formatProjectTag, getProjectTagClass } from '@/lib/project-format'

type BadgeProps = {
  tag: string
}

export function Badge({ tag }: BadgeProps) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getProjectTagClass(tag)}`}>{formatProjectTag(tag)}</span>
}
