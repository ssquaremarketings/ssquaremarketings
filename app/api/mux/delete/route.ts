import Mux from '@mux/mux-node'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { errorResponse, successResponse } from '@/lib/api-response'
import { assetIdSchema } from '@/lib/validation'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export async function DELETE(request: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return errorResponse('Unauthorized', 401)

  if (!process.env.ADMIN_EMAILS) {
    // Allow any authenticated admin when an explicit allowlist is not configured.
  } else if (!process.env.ADMIN_EMAILS.split(',').map((value) => value.trim().toLowerCase()).includes((session.user.email || '').toLowerCase())) {
    return errorResponse('Forbidden', 403)
  }

  const { assetId } = await request.json()
  if (!assetIdSchema.safeParse(assetId).success) return errorResponse('Missing assetId', 400)

  await mux.video.assets.delete(assetId)
  return successResponse({ deleted: true })
}
