import { createClient } from '@supabase/supabase-js'
import { errorResponse, successResponse } from '@/lib/api-response'
import { checkRateLimit } from '@/lib/rate-limit'
import { getRequiredEnv } from '@/lib/env'
import { contactLeadSchema } from '@/lib/validation'
import { sanitize } from '@/utils/sanitize'

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, { key: 'api-leads-post', limit: 5, windowMs: 10 * 60_000 })
  if (!rateLimit.allowed) {
    return errorResponse('Too many requests', 429)
  }

  try {
    const body = contactLeadSchema.parse(await request.json())
    const supabase = createClient(
      getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
      getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')
    )

    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: sanitize(body.name),
        phone: body.phone,
        budget: body.subject,
        property: 'General Inquiry',
        message: sanitize(`Email: ${body.email}\n\n${body.message || ''}`.trim()),
      })
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 400)
    }

    return successResponse({ lead: data }, 201)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return errorResponse(err.issues?.[0]?.message || 'Invalid enquiry payload', 400)
    }

    return errorResponse(err?.message || 'Server error', 500)
  }
}
