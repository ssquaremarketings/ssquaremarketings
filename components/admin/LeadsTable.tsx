'use client'

import type { Lead, LeadStatus } from '@/lib/types'

type LeadsTableProps = {
  leads: Lead[]
  onStatusChange: (leadId: string, status: LeadStatus) => void
  onDelete: (leadId: string) => void
  onView: (lead: Lead) => void
}

const statusClasses: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  called: 'bg-amber-100 text-amber-700',
  visited: 'bg-teal-100 text-teal-700',
  closed: 'bg-emerald-100 text-emerald-700'
}

export function LeadsTable({ leads, onStatusChange, onDelete, onView }: LeadsTableProps) {
  if (!leads.length) {
    return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">No leads found.</div>
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Budget</th>
            <th className="px-4 py-3">Property</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {leads.map((lead, index) => (
            <tr key={lead.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-500">{index + 1}</td>
              <td className="px-4 py-3 font-medium text-slate-900">{lead.name}</td>
              <td className="px-4 py-3 text-slate-600">{lead.phone}</td>
              <td className="px-4 py-3 text-slate-600">{lead.budget || '-'}</td>
              <td className="px-4 py-3 text-slate-600">{lead.property || '-'}</td>
              <td className="px-4 py-3 text-slate-600">{new Date(lead.created_at).toLocaleString()}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses[lead.status]}`}>
                  {lead.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={lead.status}
                    onChange={(event) => onStatusChange(lead.id, event.target.value as LeadStatus)}
                    className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs"
                  >
                    <option value="new">New</option>
                    <option value="called">Called</option>
                    <option value="visited">Visited</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => onView(lead)}
                    className="rounded-full border border-primary px-3 py-2 text-xs font-semibold text-primary"
                  >
                    View
                  </button>
                  <button type="button" onClick={() => onDelete(lead.id)} className="rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
