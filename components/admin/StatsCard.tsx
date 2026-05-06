type StatsCardProps = {
  label: string
  value: string | number
}

export function StatsCard({ label, value }: StatsCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-primary">{value}</p>
    </article>
  )
}
