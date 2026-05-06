import { createClient } from '@supabase/supabase-js'
import { errorResponse, successResponse } from '@/lib/api-response'
import { requireAdminSession } from '@/lib/auth'
import { getRequiredEnv } from '@/lib/env'
import { checkRateLimit } from '@/lib/rate-limit'
import { projectCreateSchema } from '@/lib/validation'

function stripOptionalProjectFields(payload: Record<string, unknown>) {
  const { image_urls, video_status, ...rest } = payload
  return rest
}

export async function POST(req: Request) {
  try {
    const rateLimit = checkRateLimit(req, { key: 'api-projects-post', limit: 20, windowMs: 60_000 })
    if (!rateLimit.allowed) {
      return errorResponse('Too many requests', 429)
    }

    const { session, authorized } = await requireAdminSession()

    if (!session) {
      return errorResponse('Unauthorized', 401)
    }

    if (!authorized) {
      return errorResponse('Forbidden', 403)
    }

    const body = projectCreateSchema.parse(await req.json())
    const supabase = createClient(
      getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
      getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')
    )

    let { data, error } = await supabase.from('projects').insert([body]).select().single()

    if (error && /image_urls|video_status|column .* does not exist/i.test(error.message)) {
      ;({ data, error } = await supabase.from('projects').insert([stripOptionalProjectFields(body)]).select().single())
    }

    if (error) {
      return errorResponse(error.message, 400)
    }
    return successResponse({ project: data }, 201)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return errorResponse(err.issues?.[0]?.message || 'Invalid project payload', 400)
    }
    return errorResponse(err?.message || 'Unknown error', 500)
  }
}

export async function GET(req: Request) {
  try {
    const rateLimit = checkRateLimit(req, { key: 'api-projects-get', limit: 120, windowMs: 60_000 })
    if (!rateLimit.allowed) {
      return errorResponse('Too many requests', 429)
    }

    const { supabase, session, authorized } = await requireAdminSession()
    const query = supabase.from('projects').select('*').order('created_at', { ascending: false })
    const { data, error } = session && authorized ? await query : await query.eq('published', true)
    if (error) {
      return errorResponse(error.message, 400)
    }
    return successResponse({ projects: data }, 200)
  } catch (err: any) {
    return errorResponse(err?.message || 'Unknown error', 500)
  }
}
