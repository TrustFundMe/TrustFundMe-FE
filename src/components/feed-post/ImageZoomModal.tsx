"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export type ZoomImage = {
  url: string;
  alt?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function ImageZoomModal({
  open,
  onOpenChange,
  images,
  initialIndex,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: ZoomImage[];
  initialIndex: number;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  const safeImages = useMemo(() => images.filter((i) => Boolean(i?.url)), [images]);
  const safeIndex = clamp(index, 0, Math.max(0, safeImages.length - 1));

  useEffect(() => {
    if (!open) return;
    setIndex(initialIndex);
    setScale(1);
  }, [open, initialIndex]);

  const current = safeImages[safeIndex];

  const handleZoomIn = () => setScale((s) => clamp(s * 1.2, 1, 5));
  const handleZoomOut = () => setScale((s) => clamp(s / 1.2, 1, 5));

  const handleWheel = (e: React.WheelEvent) => {
    if (!open) return;
    // Prevent page scroll while zooming
    e.preventDefault();
    const delta = e.deltaY;
    if (delta < 0) handleZoomIn();
    else if (delta > 0) handleZoomOut();
  };

  const canNav = safeImages.length > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 bg-black/95 border-none shadow-2xl max-w-[95vw] w-[95vw] h-[95vh] rounded-2xl overflow-hidden">
        <div className="relative w-full h-full">
          {/* Close */}
          <button
            type="button"
            aria-label="Close image"
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            ×
          </button>

          {/* Image canvas */}
          <div
            className="w-full h-full flex items-center justify-center"
            onWheel={handleWheel}
          >
            {current ? (
              <img
                src={current.url}
                alt={current.alt ?? "Zoomed image"}
                draggable={false}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  transform: `scale(${scale})`,
                  transformOrigin: "center center",
                  userSelect: "none",
                  cursor: "zoom-in",
                }}
              />
            ) : (
              <div className="text-white/70">Không có ảnh</div>
            )}
          </div>

          {/* Prev / Next */}
          {canNav && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => {
                  setIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
                  setScale(1);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() => {
                  setIndex((i) => (i + 1) % safeImages.length);
                  setScale(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                ›
              </button>
            </>
          )}

          {/* Zoom controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-white/10 backdrop-blur px-4 py-3 rounded-full border border-white/10">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={handleZoomOut}
              className="w-10 h-10 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors font-bold text-xl leading-none"
            >
              -
            </button>
            <div className="text-white text-sm font-bold min-w-[64px] text-center">
              {Math.round(scale * 100)}%
            </div>
            <button
              type="button"
              aria-label="Zoom in"
              onClick={handleZoomIn}
              className="w-10 h-10 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors font-bold text-xl leading-none"
            >
              +
            </button>
          </div>

          {/* Index hint */}
          {safeImages.length > 0 && (
            <div className="absolute top-3 left-3 z-20 text-white/70 text-xs font-bold bg-black/20 rounded-full px-3 py-1 border border-white/10">
              {safeIndex + 1} / {safeImages.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

