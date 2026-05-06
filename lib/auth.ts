import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Session } from '@supabase/supabase-js'

function getAllowedAdminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
}

export function isAuthorizedAdmin(session: Session | null) {
  if (!session) return false

  const allowedEmails = getAllowedAdminEmails()
  if (allowedEmails.length === 0) return true

  return allowedEmails.includes((session.user.email || '').toLowerCase())
}

export async function requireAdminSession() {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    return { supabase, session: null, error: error.message, authorized: false }
  }

  const session = data.session ?? null
  return { supabase, session, error: null, authorized: isAuthorizedAdmin(session) }
}
