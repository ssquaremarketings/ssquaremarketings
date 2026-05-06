import 'server-only'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getOptionalAdminEmails } from '@/lib/env'
import type { Session, User } from '@supabase/supabase-js'

// Accept either a Session object or a User object and derive the email safely.
export function isAuthorizedAdmin(subject: Session | User | null) {
  if (!subject) return false

  // session.user.email OR user.email
  // @ts-ignore - both Session and User contain email in nested/flat shapes
  const email = (subject.user?.email ?? subject.email ?? '') as string
  if (!email) return false

  const allowedEmails = getOptionalAdminEmails()
  if (allowedEmails.length === 0) {
    return false
  }

  return allowedEmails.includes(email.toLowerCase())
}

// Server helper: returns supabase server client, session (for UI convenience), and an
// `authorized` boolean computed from supabase.auth.getUser(). All authorization
// decisions use getUser() to follow Supabase recommendations.
export async function requireAdminSession() {
  const supabase = createSupabaseServerClient()

  // Prefer getUser() for authorization decisions (secure). Keep getSession() for
  // returning the session object to callers that still rely on it for UI.
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) {
    return { supabase, session: null, error: userError.message, authorized: false }
  }

  const user = userData?.user ?? null

  // Retrieve session for compatibility with existing UI flows (not used for auth).
  const { data: sessionData } = await supabase.auth.getSession()
  const session = sessionData?.session ?? null

  return { supabase, session, error: null, authorized: isAuthorizedAdmin(user) }
}
