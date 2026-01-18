"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export default function CampaignImageSlider({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const slides = useMemo(() => images.filter(Boolean), [images]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index > slides.length - 1) setIndex(0);
  }, [index, slides.length]);

  if (!slides.length) return null;

  const canNav = slides.length > 1;

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
              }}
            >
              <i className="far fa-angle-left" />
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
              }}
            >
              <i className="far fa-angle-right" />
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
    </div>
  );
}
