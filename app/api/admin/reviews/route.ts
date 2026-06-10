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

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    console.log('[API/admin/reviews] request payload:', payload)

    const { reviewId, action, featured } = payload ?? {}

    if (!reviewId) {
      return errorResponse('Missing reviewId', 400)
    }

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

    if (action === 'delete') {
      const { data, error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .select('id, reviewer_name, property, review_text, approved, featured, created_at')
        .maybeSingle()

      console.log('[API/admin/reviews] Delete result:', data)
      console.log('[API/admin/reviews] Delete error:', error)

      if (error) {
        return errorResponse(error.message, 500)
      }

      if (!data) {
        return errorResponse('Review not found', 404)
      }

      return successResponse({ review: data }, 200)
    }

    if (action === 'feature') {
      const nextFeatured = typeof featured === 'boolean' ? featured : true
      const { data, error } = await supabase
        .from('reviews')
        .update({ featured: nextFeatured })
        .eq('id', reviewId)
        .select('id, approved, featured, reviewer_name, property, review_text, created_at')
        .maybeSingle()

      console.log('[API/admin/reviews] Feature result:', data)
      console.log('[API/admin/reviews] Feature error:', error)

      if (error) {
        return errorResponse(error.message, 500)
      }

      if (!data) {
        return errorResponse('Review not found', 404)
      }

      return successResponse({ review: data }, 200)
    }

    const { data, error } = await supabase
      .from('reviews')
      .update({ approved: true })
      .eq('id', reviewId)
      .select('id, approved, reviewer_name, property, review_text, created_at')
      .maybeSingle()

    console.log('[API/admin/reviews] Update result:', data)
    console.log('[API/admin/reviews] Update error:', error)

    if (error) {
      return errorResponse(error.message, 500)
    }

    if (!data) {
      return errorResponse('Review not found', 404)
    }

    return successResponse({ review: data }, 200)
  } catch (err: any) {
    console.error('[API/admin/reviews] Approval unexpected error:', err)
    return errorResponse(err?.message || 'Server error', 500)
  }
}