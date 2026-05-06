"use client";

import { useState, useEffect } from "react";
import MuxPlayer from "@mux/mux-player-react";

export default function MediaGallery({ project }: any) {
  const media = [
    ...(project?.mux_playback_id
      ? [{ type: "video", id: project.mux_playback_id }]
      : []),
    ...(Array.isArray(project?.image_urls) && project.image_urls.length
      ? project.image_urls.map((url: string) => ({ type: "image", url }))
      : project?.image_url
        ? [{ type: "image", url: project.image_url }]
        : []),
  ];

  type MediaItem = { type: 'video'; id: string } | { type: 'image'; url: string };
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (media.length > 0) {
      setActiveMedia(media[0]);
    }
  }, [media.length]);

  useEffect(() => {
    setVideoError(false);
  }, [activeMedia]);

  if (!media.length) return null;
  if (!activeMedia) return null;

  return (
    <div>
      {/* MAIN MEDIA */}
      <div className="w-full rounded-xl overflow-hidden mb-4">
        {activeMedia.type === "video" ? (
          videoError ? (
            <div className="w-full aspect-video flex items-center justify-center bg-gray-100 text-gray-500">
              No video available
            </div>
          ) : (
            <MuxPlayer
              playbackId={activeMedia.id}
              style={{ width: "100%", aspectRatio: "16/9" }}
              onError={() => setVideoError(true)}
            />
          )
        ) : (
          <img
            src={activeMedia.url}
            alt="project"
            className="w-full h-auto object-contain rounded-xl"
          />
        )}
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-3 overflow-x-auto">
        {media.map((item, index) => {
          return (
            <div
              key={index}
              onClick={() => setActiveMedia(item)}
              className={`cursor-pointer border rounded-lg overflow-hidden w-24 h-16 ${
                activeMedia &&
                activeMedia.type === item.type &&
                (item.type === "video"
                  ? (activeMedia.type === "video" && activeMedia.id === item.id)
                  : (activeMedia.type === "image" && activeMedia.url === item.url))
                  ? "ring-2 ring-blue-500"
                  : ""
              }`}
            >
              {item.type === "video" ? (
                <div className="flex items-center justify-center h-full bg-gray-200">
                  🎥
                </div>
              ) : (
                <img
                  src={item.url}
                  alt="thumb"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}