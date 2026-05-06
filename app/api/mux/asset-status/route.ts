import Mux from '@mux/mux-node'
import { errorResponse, successResponse } from '@/lib/api-response'
import { requireAdminSession } from '@/lib/auth'
import { getRequiredEnv } from '@/lib/env'
import { checkRateLimit } from '@/lib/rate-limit'
import { uploadIdSchema } from '@/lib/validation'

export const runtime = 'nodejs'

const mux = new Mux({
  tokenId: getRequiredEnv('MUX_TOKEN_ID'),
  tokenSecret: getRequiredEnv('MUX_TOKEN_SECRET'),
})

export async function GET(request: Request) {
  const rateLimit = checkRateLimit(request, { key: 'api-mux-asset-status', limit: 30, windowMs: 60_000 })
  if (!rateLimit.allowed) {
    return errorResponse('Too many requests', 429)
  }

  const { searchParams } = new URL(request.url)
  const uploadId = searchParams.get('uploadId')

  if (!uploadId) {
    return errorResponse('Missing uploadId', 400)
  }

  try {
    const { session, authorized } = await requireAdminSession()

    if (!session) {
      return errorResponse('Unauthorized', 401)
    }

    if (!authorized) {
      return errorResponse('Forbidden', 403)
    }

    if (!uploadIdSchema.safeParse(uploadId).success) {
      return errorResponse('Invalid uploadId', 400)
    }

    const upload = await mux.video.uploads.retrieve(uploadId)

    let assetId = upload.asset_id ?? null
    let playbackId = null
    let status: 'waiting' | 'asset_created' | 'errored' | 'cancelled' | 'timed_out' | 'preparing' | 'ready' = upload.status as any

    if (upload.status === 'asset_created' && upload.asset_id) {
      const asset = await mux.video.assets.retrieve(upload.asset_id)
      status = asset.status as any
      assetId = asset.id
      playbackId = asset.playback_ids?.[0]?.id ?? null
    }

    return successResponse({
      status,
      assetId,
      playbackId,
    })
  } catch (error: any) {
    return errorResponse(error.message || 'Mux error', 500)
  }
}
