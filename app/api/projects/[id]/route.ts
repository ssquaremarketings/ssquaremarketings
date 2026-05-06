
import { createClient } from "@supabase/supabase-js";
import { getMuxClient } from "./mux";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    console.log("Incoming body:", body);

    if (!id) {
      return Response.json({ error: "Missing id" }, { status: 400 });
    }

    // Fetch current project
    const { data: project, error: fetchError } = await supabase
      .from("projects")
      .select("mux_asset_id, mux_playback_id")
      .eq("id", id)
      .single();
    if (fetchError) {
      return Response.json({ error: fetchError.message }, { status: 500 });
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
          // Log but do not block DB update
          console.error("Failed to delete Mux asset:", muxErr);
        }
      }
    }

    // Build updateData object, only include fields present
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.price) updateData.price = body.price;
    if (body.type) updateData.type = body.type;
    if (body.tag) updateData.tag = body.tag;
    if (body.location) updateData.location = body.location;
    if (body.price_per_sqyd !== undefined) updateData.price_per_sqyd = body.price_per_sqyd;
    if (body.area !== undefined) updateData.area = body.area;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.image_urls !== undefined && Array.isArray(body.image_urls)) {
      updateData.image_urls = body.image_urls;
    }
    console.log("API updateData.image_urls:", updateData.image_urls);
    if (body.brochure_url !== undefined) updateData.brochure_url = body.brochure_url;
    if (body.published !== undefined) updateData.published = body.published;
    if (body.updated_at) updateData.updated_at = body.updated_at;
    if (body.video_status) updateData.video_status = body.video_status;

    // If mux_playback_id is being removed, also clear mux_asset_id
    if (project?.mux_playback_id && (body.mux_playback_id === null || body.mux_playback_id === "")) {
      updateData.mux_playback_id = null;
      updateData.mux_asset_id = null;
    } else {
      if (body.mux_asset_id) updateData.mux_asset_id = body.mux_asset_id;
      if (body.mux_playback_id) updateData.mux_playback_id = body.mux_playback_id;
    }

    const { data, error } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    if (!data || data.length === 0) {
      return Response.json(
        { error: "No rows updated. Check ID or RLS." },
        { status: 400 }
      );
    }
    return Response.json({ success: true, data, deletedMux });
  } catch (err: any) {
    console.error("Server error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}