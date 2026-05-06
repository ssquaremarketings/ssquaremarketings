import Mux from '@mux/mux-node'
import { errorResponse, successResponse } from '@/lib/api-response'
import { requireAdminSession } from '@/lib/auth'
import { getRequiredEnv } from '@/lib/env'
import { checkRateLimit } from '@/lib/rate-limit'
import { assetIdSchema } from '@/lib/validation'

const mux = new Mux({
  tokenId: getRequiredEnv('MUX_TOKEN_ID'),
  tokenSecret: getRequiredEnv('MUX_TOKEN_SECRET'),
})

export async function DELETE(request: Request) {
  try {
    const rateLimit = checkRateLimit(request, { key: 'api-mux-delete', limit: 10, windowMs: 60_000 })
    if (!rateLimit.allowed) {
      return errorResponse('Too many requests', 429)
    }

    const { session, authorized } = await requireAdminSession()
    if (!session) return errorResponse('Unauthorized', 401)

    if (!authorized) {
      return errorResponse('Forbidden', 403)
    }

    const { assetId } = await request.json()
    if (!assetIdSchema.safeParse(assetId).success) return errorResponse('Missing assetId', 400)

    await mux.video.assets.delete(assetId)
    return successResponse({ deleted: true })
  } catch (error: any) {
    return errorResponse(error?.message || 'Server error', 500)
  }
}
