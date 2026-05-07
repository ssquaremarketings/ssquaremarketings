import { createClient } from '@supabase/supabase-js'
import { errorResponse, successResponse } from '@/lib/api-response'
import { checkRateLimit } from '@/lib/rate-limit'
import { getRequiredEnv } from '@/lib/env'
import { enquirySchema } from '@/lib/validation'
import { sanitize } from '@/utils/sanitize'

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, { key: 'api-enquiries-post', limit: 5, windowMs: 10 * 60_000 })
  if (!rateLimit.allowed) {
    return errorResponse('Too many requests', 429)
  }

  try {
    const body = enquirySchema.parse(await request.json())
    
    const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
    const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[API/enquiries] Missing environment variables:', { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!serviceRoleKey 
      })
      return errorResponse('Server configuration error', 500)
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: sanitize(body.name),
        phone: body.phone,
        budget: sanitize(body.budget),
        property: sanitize(body.property),
        message: sanitize(body.message || ''),
      })
      .select()
      .single()

    if (error) {
      console.error('[API/enquiries] Supabase insert error:', error)
      return errorResponse(error.message, 400)
    }

    return successResponse({ lead: data }, 201)
  } catch (err: any) {
    console.error('[API/enquiries] Unexpected error:', err)
    if (err?.name === 'ZodError') {
      return errorResponse(err.issues?.[0]?.message || 'Invalid enquiry payload', 400)
    }

    return errorResponse(err?.message || 'Server error', 500)
  }
}
