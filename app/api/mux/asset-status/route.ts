import Mux from '@mux/mux-node'

export const runtime = 'nodejs';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uploadId = searchParams.get('uploadId');

  if (!uploadId) {
    return Response.json({ error: 'Missing uploadId' }, { status: 400 });
  }

  try {
    const upload = await mux.video.uploads.retrieve(uploadId);
    // Optional: log for debugging

    let assetId = upload.asset_id ?? null;
    let playbackId = null;
    let status: 'waiting' | 'asset_created' | 'errored' | 'cancelled' | 'timed_out' | 'preparing' | 'ready' = upload.status as any;

    if (upload.status === 'asset_created' && upload.asset_id) {
      const asset = await mux.video.assets.retrieve(upload.asset_id);
      status = asset.status as any;
      assetId = asset.id;
      playbackId = asset.playback_ids?.[0]?.id ?? null;
    }

    return Response.json({
      status,
      assetId,
      playbackId,
    });
  } catch (error: any) {
    console.error('Mux asset-status error:', error);
    return Response.json({ error: error.message || 'Mux error' }, { status: 500 });
  }
}
