"use client";

import { useState } from "react";
import ImageZoomModal, { type ZoomImage } from "@/components/feed-post/ImageZoomModal";
import { Trash2 } from "lucide-react";

interface MediaItem {
  id: number;
  url: string;
  description?: string;
  mediaType?: string;
}

interface ExpenditureItemGalleryProps {
  media: MediaItem[];
  loading?: boolean;
  onDelete?: (mediaId: number) => void;
  maxGrid?: number; // max ảnh hiển thị trong grid (default 9)
  compact?: boolean; // true = grid nhỏ (cho modal update), false = grid lớn (cho expanded row)
}

export default function ExpenditureItemGallery({
  media,
  loading = false,
  onDelete,
  maxGrid = 9,
  compact = false,
}: ExpenditureItemGalleryProps) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);

  const safeMedia = Array.isArray(media) ? media : [];
  const visible = safeMedia.slice(0, maxGrid);
  const hasMore = safeMedia.length > maxGrid;

  const zoomImages: ZoomImage[] = safeMedia.map((m) => ({
    url: m.url,
    alt: m.description || `Minh chứng ${m.id}`,
  }));

  const handleThumbClick = (idx: number) => {
    setZoomIndex(idx);
    setZoomOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!media.length) {
    return (
      <div className="text-center text-xs text-gray-400 py-2 italic">
        Chưa có ảnh
      </div>
    );
  }

  // Grid layout — 3x3
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact ? "repeat(3, 1fr)" : "repeat(3, 1fr)",
          gap: compact ? 6 : 8,
        }}
      >
        {visible.map((item, idx) => (
          <div
            key={item.id}
            className="relative group/img cursor-pointer overflow-hidden rounded-xl"
            style={{
              aspectRatio: "1 / 1",
              border: "2px solid rgba(0,0,0,0.06)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            onClick={() => handleThumbClick(idx)}
          >
            <img
              src={item.url}
              alt={item.description || `Minh chứng ${item.id}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 200ms ease",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/assets/img/placeholder.png";
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLImageElement).style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLImageElement).style.transform = "scale(1)";
              }}
            />

            {/* Overlay on hover */}
            <div
              className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all duration-200 rounded-xl"
              style={{ pointerEvents: "none" }}
            />

            {/* Delete button */}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all hover:bg-red-600 shadow-md"
                title="Xóa ảnh"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}

            {/* "+N" badge on last visible slot if more images exist */}
            {hasMore && idx === visible.length - 1 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                <span className="text-white font-black text-lg leading-none drop-shadow-md">
                  +{media.length - maxGrid}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <ImageZoomModal
        open={zoomOpen}
        onOpenChange={setZoomOpen}
        images={zoomImages}
        initialIndex={zoomIndex}
      />
    </>
  );
}
