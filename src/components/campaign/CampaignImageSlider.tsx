"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import ImageZoomModal, { type ZoomImage } from "@/components/feed-post/ImageZoomModal";

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
  const zoomImages: ZoomImage[] = useMemo(
    () => slides.map((url) => ({ url, alt })),
    [slides, alt]
  );

  return (
    <div
      style={{
        width: "100%",
      }}
    >
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
          }}
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            setZoomOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setZoomOpen(true);
            }
          }}
        >
          <Image
            src={slides[index]}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            style={{ objectFit: "cover" }}
            priority={false}
          />
        </div>

        {canNav ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() =>
                setIndex((i) => (i - 1 + slides.length) % slides.length)
              }
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.35)",
                background: "rgba(0,0,0,0.40)",
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                cursor: "pointer",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <button
              type="button"
              aria-label="Next image"
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
                background: "rgba(0,0,0,0.40)",
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                cursor: "pointer",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            <div
              style={{
                position: "absolute",
                left: 12,
                bottom: 12,
                display: "flex",
                gap: 6,
              }}
            >
              {slides.map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: i === index ? 18 : 8,
                    height: 8,
                    borderRadius: 9999,
                    background:
                      i === index ? "#F84D43" : "rgba(255,255,255,0.7)",
                    transition: "all 180ms ease",
                  }}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
      <ImageZoomModal
        open={zoomOpen}
        onOpenChange={setZoomOpen}
        images={zoomImages}
        initialIndex={index}
      />
    </div>
  );
}
