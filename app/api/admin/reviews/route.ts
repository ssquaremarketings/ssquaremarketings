import { createClient } from '@supabase/supabase-js'
import { errorResponse, successResponse } from '@/lib/api-response'
import { requireAdminSession } from '@/lib/auth'
import { getRequiredEnv } from '@/lib/env'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const { session, authorized } = await requireAdminSession()

    if (!session) {
      return errorResponse('Unauthorized', 401)
    }

    if (!authorized) {
      return errorResponse('Forbidden', 403)
    }

    const supabase = createClient(
      getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
      getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')
    )

    const { data, error } = await supabase
      .from('reviews')
      .select('id, reviewer_name, phone, property, project_id, rating, review_text, approved, featured, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API/admin/reviews] Supabase fetch error:', error)
      return errorResponse(error.message, 500)
    }

    const reviews = data || []
    console.log('[API/admin/reviews] total reviews returned:', reviews.length)
    console.log('[API/admin/reviews] response payload:', reviews)

    return successResponse({ reviews }, 200)
  } catch (err: any) {
    console.error('[API/admin/reviews] Unexpected error:', err)
    return errorResponse(err?.message || 'Server error', 500)
  }
}