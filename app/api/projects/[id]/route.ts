import { createClient } from '@supabase/supabase-js'
import { getMuxClient } from './mux'
import { errorResponse, successResponse } from '@/lib/api-response'
import { requireAdminSession } from '@/lib/auth'
import { getRequiredEnv } from '@/lib/env'
import { checkRateLimit } from '@/lib/rate-limit'
import { assetIdSchema, projectUpdateSchema } from '@/lib/validation'

export const runtime = 'nodejs'

const supabase = createClient(
  getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
  getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')
)

function stripOptionalProjectFields(payload: Record<string, unknown>) {
  const { image_urls, video_status, ...rest } = payload
  return rest
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const rateLimit = checkRateLimit(req, { key: 'api-projects-put', limit: 30, windowMs: 60_000 })
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

    const { id } = params

    if (!assetIdSchema.safeParse(id).success) {
      return errorResponse('Invalid project id', 400)
    }

    const body = projectUpdateSchema.parse(await req.json())

    if (!id) {
      return errorResponse('Missing id', 400)
    }

    // Fetch current project
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('mux_asset_id, mux_playback_id')
      .eq('id', id)
      .single()
    if (fetchError) {
      return errorResponse(fetchError.message, 500)
    }

    // If mux_playback_id is being removed, delete from Mux
    let deletedMux = false;
    if (
      project?.mux_playback_id &&
      (body.mux_playback_id === null || body.mux_playback_id === "")
    ) {
      if (project.mux_asset_id) {
        try {
          const mux = getMuxClient();
          await mux.video.assets.delete(project.mux_asset_id);
          deletedMux = true;
        } catch (muxErr: any) {
          void muxErr
        }
      }
    }

    // Build updateData object, only include fields present
    const updateData: Record<string, unknown> = {}
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value
      }
    })

    // If mux_playback_id is being removed, also clear mux_asset_id
    if (project?.mux_playback_id && body.mux_playback_id === null) {
      updateData.mux_playback_id = null
      updateData.mux_asset_id = null
    } else {
      if (body.mux_asset_id !== undefined) updateData.mux_asset_id = body.mux_asset_id
      if (body.mux_playback_id !== undefined) updateData.mux_playback_id = body.mux_playback_id
    }

    let { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error && /image_urls|video_status|column .* does not exist/i.test(error.message)) {
      ;({ data, error } = await supabase
        .from('projects')
        .update(stripOptionalProjectFields(updateData))
        .eq('id', id)
        .select()
        .single())
    }

    if (error) {
      return errorResponse(error.message, 500)
    }
    if (!data) {
      return errorResponse('No rows updated. Check ID or RLS.', 400)
    }
    return successResponse({ project: data, deletedMux })
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return errorResponse(err.issues?.[0]?.message || 'Invalid project payload', 400)
    }
    return errorResponse(err?.message || 'Server error', 500)
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const rateLimit = checkRateLimit(_req, { key: 'api-projects-delete', limit: 20, windowMs: 60_000 })
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

    const { id } = params
    if (!assetIdSchema.safeParse(id).success) {
      return errorResponse('Invalid project id', 400)
    }

    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('mux_asset_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      return errorResponse(fetchError.message, 404)
    }

    if (project?.mux_asset_id) {
      try {
        const mux = getMuxClient()
        await mux.video.assets.delete(project.mux_asset_id)
      } catch {
        // Continue removing the project record even if the remote asset is already gone.
      }
    }

    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) {
      return errorResponse(error.message, 500)
    }

    return successResponse({ deleted: true })
  } catch (err: any) {
    return errorResponse(err?.message || 'Server error', 500)
  }
}