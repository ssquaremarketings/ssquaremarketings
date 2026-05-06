import { createClient } from '@supabase/supabase-js'
import { getMuxClient } from '../mux'
import { errorResponse, successResponse } from '@/lib/api-response'
import { requireAdminSession } from '@/lib/auth'
import { assetIdSchema } from '@/lib/validation'

export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * DELETE /api/projects/[id]/video
 * Deletes video from Mux and clears Mux fields from Supabase
 * - Requires admin authentication
 * - Safely handles already-deleted Mux assets
 * - Clears both mux_asset_id and mux_playback_id from project
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
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

    // Fetch project to get Mux asset ID
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('mux_asset_id, mux_playback_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      return errorResponse(fetchError.message, 500)
    }

    if (!project) {
      return errorResponse('Project not found', 404)
    }

    // Delete from Mux if asset exists
    let muxDeleted = false
    if (project.mux_asset_id) {
      try {
        const mux = getMuxClient()
        await mux.video.assets.delete(project.mux_asset_id)
        muxDeleted = true
      } catch (muxErr: any) {
        // If asset already deleted or not found, continue with DB cleanup
        // This prevents orphaned records if Mux asset was manually deleted
        if (muxErr?.status !== 404) {
          // Only suppress 404 errors; other errors are legitimate
          console.error('Mux deletion error:', muxErr)
        }
      }
    }

    // Clear Mux fields from Supabase
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        mux_asset_id: null,
        mux_playback_id: null,
      })
      .eq('id', id)

    if (updateError) {
      return errorResponse(updateError.message, 500)
    }

    return successResponse({
      deleted: true,
      muxDeleted,
      message: 'Video deleted successfully',
    })
  } catch (err: any) {
    console.error('Video deletion error:', err)
    return errorResponse(err?.message || 'Server error', 500)
  }
}
