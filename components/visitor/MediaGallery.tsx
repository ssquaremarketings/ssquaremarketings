"use client";

import { useEffect, useMemo, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import Image from 'next/image'

export default function MediaGallery({ project }: any) {
  type MediaItem = { type: 'video'; id: string } | { type: 'image'; url: string };
  const media = useMemo<MediaItem[]>(() => [
    ...(project?.mux_playback_id
      ? [{ type: 'video', id: project.mux_playback_id }]
      : []),
    ...(Array.isArray(project?.image_urls) && project.image_urls.length
      ? project.image_urls.map((url: string) => ({ type: 'image', url }))
      : project?.image_url
        ? [{ type: 'image', url: project.image_url }]
        : []),
  ], [project?.mux_playback_id, project?.image_url, project?.image_urls])

  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (media.length > 0) {
      setActiveMedia(media[0]);
    }
  }, [media]);

  useEffect(() => {
    setVideoError(false);
  }, [activeMedia]);

  if (!media.length) return null;
  if (!activeMedia) return null;

  const fallbackImage = media.find((item) => item.type === 'image')

  return (
    <div>
      {/* MAIN MEDIA */}
      <div className="w-full rounded-xl overflow-hidden mb-4">
        {activeMedia.type === "video" ? (
          videoError ? (
            fallbackImage && fallbackImage.type === "image" ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100">
                <Image 
                  src={fallbackImage.url} 
                  alt="project" 
                  fill 
                  className="object-contain" 
                  sizes="100vw"
                  onError={(event) => {
                    (event.currentTarget as HTMLImageElement).src = '/placeholder-project.svg'
                  }}
                />
              </div>
            ) : (
              <div className="w-full aspect-video flex items-center justify-center bg-gray-100 text-gray-500">
                Video is no longer available
              </div>
            )
          ) : (
            <MuxPlayer
              playbackId={activeMedia.id}
              style={{ width: "100%", aspectRatio: "16/9" }}
              onError={() => setVideoError(true)}
            />
          )
        ) : (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100">
            <Image
              src={activeMedia.url}
              alt="project"
              fill
              className="object-contain"
              sizes="100vw"
              onError={(event) => {
                (event.currentTarget as HTMLImageElement).src = '/placeholder-project.svg'
              }}
            />
          </div>
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
                <div className="relative h-full w-full">
                  <Image
                    src={item.url}
                    alt="thumb"
                    fill
                    className="object-cover"
                    onError={(event) => {
                      (event.currentTarget as HTMLImageElement).src = '/placeholder-project.svg'
                    }}
                    sizes="96px"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}