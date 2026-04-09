import Image from "next/image";
import Link from "next/link";
import type { User } from "./types";

export default function CreatorInfo({ user }: { user: User }) {
  return (
    <Link
      href={`/fund-owner-details?id=${user.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "nowrap",
        cursor: "pointer",
        textDecoration: "none",
        color: "inherit",
        transition: "opacity 0.2s"
      }}
      className="creator-info-link"
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 9999,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Image
          src={user.avatar}
          alt={user.name}
          width={48}
          height={48}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div>
        <div style={{ opacity: 0.75, fontSize: 13 }}>Người tạo</div>
        <div style={{ fontWeight: 700 }}>{user.name}</div>
      </div>
      <style jsx>{`
        .creator-info-link:hover {
          opacity: 0.8;
        }
      `}</style>
    </Link>
  );
}
