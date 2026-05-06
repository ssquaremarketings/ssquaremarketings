'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Lead, LeadStatus } from '@/lib/types'
import { SAMPLE_LEADS } from '@/lib/sample-data'
import { LeadsTable } from '@/components/admin/LeadsTable'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all')
  const [propertyFilter, setPropertyFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    loadLeads()
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  const loadLeads = async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    setLeads((data ?? []) as Lead[])
  }

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
      const matchesProperty = propertyFilter === 'all' || (lead.property || '') === propertyFilter
      const query = search.trim().toLowerCase()
      const matchesSearch = !query || lead.name.toLowerCase().includes(query) || lead.phone.toLowerCase().includes(query)
      return matchesStatus && matchesProperty && matchesSearch
    })
  }, [leads, statusFilter, propertyFilter, search])

  const propertyOptions = useMemo(() => {
    return Array.from(new Set(leads.map((lead) => lead.property).filter(Boolean) as string[]))
  }, [leads])

  const updateStatus = async (leadId: string, status: LeadStatus) => {
    const { error } = await supabase.from('leads').update({ status }).eq('id', leadId)
    if (error) {
      setToast({ message: 'Could not update status.', type: 'error' })
      return
    }
    await loadLeads()
  }

  const deleteLead = async (leadId: string) => {
    if (!confirm('Delete this lead?')) return
    const { error } = await supabase.from('leads').delete().eq('id', leadId)
    if (error) {
      setToast({ message: 'Could not delete lead.', type: 'error' })
      return
    }
    await loadLeads()
    setToast({ message: 'Lead deleted.', type: 'success' })
  }

  const exportCsv = () => {
    const rows = [['Name', 'Phone', 'Budget', 'Property', 'Message', 'Status', 'Created At']]
    filteredLeads.forEach((lead) => {
      rows.push([lead.name, lead.phone, lead.budget || '', lead.property || '', lead.message || '', lead.status, lead.created_at])
    })
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'leads.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const seedSampleLeads = async () => {
    const { data: existing } = await supabase.from('leads').select('name, phone, property')
    const existingKeys = new Set((existing ?? []).map((lead) => `${lead.name}-${lead.phone}-${lead.property || ''}`))
    const rowsToInsert = SAMPLE_LEADS.filter((lead) => !existingKeys.has(`${lead.name}-${lead.phone}-${lead.property || ''}`))

    if (rowsToInsert.length === 0) {
      setToast({ message: 'Sample leads are already present.', type: 'success' })
      return
    }

    const { error } = await supabase.from('leads').insert(rowsToInsert)
    if (error) {
      setToast({ message: 'Could not seed sample leads.', type: 'error' })
      return
    }

    await loadLeads()
    setToast({ message: `Inserted ${rowsToInsert.length} sample leads.`, type: 'success' })
  }

  return (
    <div className="space-y-6">
      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-500">Leads</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Lead Management</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={seedSampleLeads} className="rounded-full border border-primary px-5 py-3 font-semibold text-primary">
            Seed Sample Leads
          </button>
          <button type="button" onClick={exportCsv} className="rounded-full bg-amber-500 px-5 py-3 font-semibold text-primary">
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | LeadStatus)} className="rounded-2xl border border-slate-300 px-4 py-3">
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="called">Called</option>
          <option value="visited">Visited</option>
          <option value="closed">Closed</option>
        </select>
        <select value={propertyFilter} onChange={(event) => setPropertyFilter(event.target.value)} className="rounded-2xl border border-slate-300 px-4 py-3">
          <option value="all">All Properties</option>
          {propertyOptions.map((property) => <option key={property} value={property}>{property}</option>)}
        </select>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or phone" className="rounded-2xl border border-slate-300 px-4 py-3" />
      </div>

      <LeadsTable leads={filteredLeads} onStatusChange={updateStatus} onDelete={deleteLead} onView={setSelectedLead} />

      <Modal open={Boolean(selectedLead)} title="Lead Enquiry Details" onClose={() => setSelectedLead(null)}>
        {selectedLead ? (
          <div className="space-y-4 text-sm text-slate-700">
            <div className="grid gap-3 sm:grid-cols-2">
              <p><span className="font-semibold text-slate-900">Name:</span> {selectedLead.name}</p>
              <p><span className="font-semibold text-slate-900">Phone:</span> {selectedLead.phone}</p>
              <p><span className="font-semibold text-slate-900">Property:</span> {selectedLead.property || '-'}</p>
              <p><span className="font-semibold text-slate-900">Budget:</span> {selectedLead.budget || '-'}</p>
              <p><span className="font-semibold text-slate-900">Status:</span> {selectedLead.status}</p>
              <p><span className="font-semibold text-slate-900">Date:</span> {new Date(selectedLead.created_at).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 font-semibold text-slate-900">Message</p>
              <p className="whitespace-pre-wrap text-slate-700">{selectedLead.message?.trim() || 'No message provided.'}</p>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
