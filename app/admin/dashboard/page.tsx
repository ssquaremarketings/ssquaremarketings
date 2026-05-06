import { createSupabaseServerClient } from '@/lib/supabase-server'
import { StatsCard } from '@/components/admin/StatsCard'

export default async function AdminDashboardPage() {
  const supabase = createSupabaseServerClient()

  const [projectsResult, leadsResult, recentLeadsResult] = await Promise.all([
    supabase.from('projects').select('id, published'),
    supabase.from('leads').select('id, status'),
    supabase.from('leads').select('id, name, phone, budget, property, status, created_at').order('created_at', { ascending: false }).limit(5)
  ])

  const projects = projectsResult.data ?? []
  const leads = leadsResult.data ?? []
  const recentLeads = recentLeadsResult.data ?? []

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-500">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-primary">Overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total Projects" value={projects.length} />
        <StatsCard label="Published" value={projects.filter((project) => project.published).length} />
        <StatsCard label="Total Leads" value={leads.length} />
        <StatsCard label="New Leads" value={leads.filter((lead) => lead.status === 'new').length} />
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-primary">Recent Leads</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((lead) => (
                <tr key={lead.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{lead.name}</td>
                  <td className="px-4 py-3 text-slate-600">{lead.phone}</td>
                  <td className="px-4 py-3 text-slate-600">{lead.budget || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{lead.property || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{lead.status}</td>
                </tr>
              ))}
              {recentLeads.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>
                    No leads yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
