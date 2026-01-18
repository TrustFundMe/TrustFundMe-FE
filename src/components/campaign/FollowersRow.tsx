"use client";

import Image from "next/image";
import type { User } from "./types";

export default function FollowersRow({
  followers,
  onClick,
}: {
  followers: User[];
  onClick: () => void;
}) {
  const preview = followers.slice(0, 10);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-100"
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        textAlign: "left",
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {preview.map((f) => (
          <span
            key={f.id}
            style={{
              width: 32,
              height: 32,
              borderRadius: 9999,
              overflow: "hidden",
              border: "2px solid #fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
              display: "inline-block",
            }}
          >
            <Image
              src={f.avatar}
              alt={f.name}
              width={32}
              height={32}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </span>
        ))}

        <span style={{ marginLeft: 6, opacity: 0.75 }}>
          {followers.length} followers
        </span>
      </div>
    </button>
  );
}
