import Mux from '@mux/mux-node'
import { errorResponse, successResponse } from '@/lib/api-response'
import { requireAdminSession } from '@/lib/auth'

export const runtime = 'nodejs'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export async function POST(request: Request) {
  try {
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
