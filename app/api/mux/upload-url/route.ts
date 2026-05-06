import Mux from '@mux/mux-node'
import { errorResponse, successResponse } from '@/lib/api-response'
import { requireAdminSession } from '@/lib/auth'
import { getRequiredEnv } from '@/lib/env'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const mux = new Mux({
  tokenId: getRequiredEnv('MUX_TOKEN_ID'),
  tokenSecret: getRequiredEnv('MUX_TOKEN_SECRET'),
})

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(request, { key: 'api-mux-upload-url', limit: 10, windowMs: 60_000 })
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin

    const upload = await mux.video.uploads.create({
      new_asset_settings: { playback_policy: ['public'] },
      cors_origin: siteUrl,
    })
    return successResponse({
      uploadId: upload.id,
      uploadUrl: upload.url,
    })
  } catch (error: any) {
    return errorResponse(error?.message || 'Internal Server Error', 500)
  }
}
