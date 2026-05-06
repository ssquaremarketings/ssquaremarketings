import { createClient } from '@supabase/supabase-js'
import { errorResponse, successResponse } from '@/lib/api-response'
import { checkRateLimit } from '@/lib/rate-limit'
import { getRequiredEnv } from '@/lib/env'
import { reviewSchema } from '@/lib/validation'
import { sanitize } from '@/utils/sanitize'

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, { key: 'api-reviews-post', limit: 3, windowMs: 15 * 60_000 })
  if (!rateLimit.allowed) {
    return errorResponse('Too many requests', 429)
  }

  try {
    const body = reviewSchema.parse(await request.json())
    const supabase = createClient(
      getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
      getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')
    )

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        reviewer_name: sanitize(body.reviewer_name),
        phone: body.phone ? sanitize(body.phone) : null,
        property: body.property ? sanitize(body.property) : null,
        project_id: body.project_id ?? null,
        rating: body.rating,
        review_text: sanitize(body.review_text),
      })
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 400)
    }

    return successResponse({ review: data }, 201)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return errorResponse(err.issues?.[0]?.message || 'Invalid review payload', 400)
    }

    return errorResponse(err?.message || 'Server error', 500)
  }
}
