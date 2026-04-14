"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import ImageZoomModal, { type ZoomImage } from "@/components/feed-post/ImageZoomModal";

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|avi|mkv)$/i.test(url) || url.includes("video") || url.includes("stream");
}

export default function CampaignImageSlider({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const slides = useMemo(() => images.filter(Boolean), [images]);
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    if (index > slides.length - 1) setIndex(0);
  }, [index, slides.length]);

  if (!slides.length) return null;

  const canNav = slides.length > 1;
  const currentUrl = slides[index];
  const isVideo = isVideoUrl(currentUrl);

  const zoomImages: ZoomImage[] = useMemo(
    () => slides.filter(url => !isVideoUrl(url)).map((url) => ({ url, alt })),
    [slides, alt]
  );

  const originalImageIndex = useMemo(() => {
    let imageCount = 0;
    for (let i = 0; i < index; i++) {
      if (!isVideoUrl(slides[i])) imageCount++;
    }
    return imageCount;
  }, [slides, index]);

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          position: "relative",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 11",
            maxHeight: 360,
            background: "#000",
          }}
        >
          {isVideo ? (
            <video
              key={currentUrl}
              src={currentUrl}
              controls
              controlsList="nodownload"
              style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "all" }}
              className="relative z-10"
            />
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => setZoomOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setZoomOpen(true);
                }
              }}
              style={{ position: "absolute", inset: 0, cursor: "pointer", pointerEvents: "all" }}
            >
              <Image
                src={currentUrl}
                alt={alt}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                style={{ objectFit: "cover" }}
                priority={false}
              />
            </div>
          )}
        </div>

        {/* Navigation buttons — always shown if more than 1 slide */}
        {canNav ? (
          <>
            <button
              type="button"
              aria-label="Trước"
              onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.35)",
                background: "rgba(0,0,0,0.50)",
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
                cursor: "pointer",
                zIndex: 20,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <button
              type="button"
              aria-label="Sau"
              onClick={() => setIndex((i) => (i + 1) % slides.length)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.35)",
                background: "rgba(0,0,0,0.50)",
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
                cursor: "pointer",
                zIndex: 20,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {/* Dot indicators */}
            <div
              style={{
                position: "absolute",
                left: 12,
                bottom: 12,
                display: "flex",
                gap: 6,
                zIndex: 20,
              }}
            >
              {slides.map((url, i) => {
                const dotIsVideo = isVideoUrl(url);
                return (
                  <span
                    key={i}
                    style={{
                      width: i === index ? 18 : 8,
                      height: 8,
                      borderRadius: 9999,
                      background:
                        i === index
                          ? dotIsVideo
                            ? "#F84D43"
                            : "#F84D43"
                          : "rgba(255,255,255,0.7)",
                      transition: "all 180ms ease",
                      display: "inline-block",
                    }}
                  />
                );
              })}
            </div>

            {/* Type label badge */}
            {isVideo && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  background: "rgba(0,0,0,0.50)",
                  color: "#fff",
                  padding: "3px 10px",
                  borderRadius: 9999,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  zIndex: 20,
                }}
              >
                Video
              </div>
            )}
          </>
        ) : null}
      </div>
      {zoomImages.length > 0 && (
        <ImageZoomModal
          open={zoomOpen}
          onOpenChange={setZoomOpen}
          images={zoomImages}
          initialIndex={originalImageIndex}
        />
      )}
    </div>
  );
}
