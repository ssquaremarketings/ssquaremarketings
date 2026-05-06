import 'server-only'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getOptionalAdminEmails } from '@/lib/env'
import type { Session } from '@supabase/supabase-js'

export function isAuthorizedAdmin(session: Session | null) {
  if (!session) return false

  const allowedEmails = getOptionalAdminEmails()
  if (allowedEmails.length === 0) {
    return false
  }

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
