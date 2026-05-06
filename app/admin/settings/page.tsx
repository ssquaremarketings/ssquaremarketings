'use client'

import { Toast } from '@/components/ui/Toast'

export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-500">Settings</p>
        <h1 className="mt-2 text-3xl font-bold text-primary">Account Settings</h1>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Password changes are disabled in the admin dashboard. Use your Supabase Auth settings or an external password reset flow if you need to update credentials.
        </p>
      </div>
    </div>
  )
}
