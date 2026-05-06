import Mux from '@mux/mux-node'

export const runtime = 'nodejs'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export async function POST(request: Request) {
  try {
    const upload = await mux.video.uploads.create({
      new_asset_settings: { playback_policy: ['public'] },
      cors_origin: '*',
    })
    return Response.json({
      uploadId: upload.id,
      uploadUrl: upload.url,
    })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Internal Server Error', details: error }, { status: 500 })
  }
}
