import Image from "next/image";
import Link from "next/link";
import type { User } from "./types";
import { Star } from "lucide-react";

interface CreatorInfoProps {
  user: User;
  onShowTrustScore?: () => void;
}

export default function CreatorInfo({ user, onShowTrustScore }: CreatorInfoProps) {
  const hasTrustScore = user.trustScore !== undefined && user.trustScore !== null && user.trustScore > 0;

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
        <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          {user.name}
          {hasTrustScore && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                background: "#fef3c7",
                color: "#d97706",
                borderRadius: 9999,
                padding: "1px 8px",
                fontSize: 11,
                fontWeight: 600,
                border: "1px solid #fcd34d",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[DEBUG badge click] onShowTrustScore exists:', !!onShowTrustScore);
                onShowTrustScore?.();
              }}
              title="Bấm vào để xem chi tiết điểm uy tín"
            >
              <Star size={10} />
              {user.trustScore}
            </div>
          )}
        </div>
        {hasTrustScore && onShowTrustScore && (
          <div
            style={{ fontSize: 10, color: '#d97706', marginTop: 2 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('[DEBUG text click] onShowTrustScore:', !!onShowTrustScore);
              onShowTrustScore();
            }}
          >
            Bấm vào để xem chi tiết
          </div>
        )}
      </div>
      <style jsx>{`
        .creator-info-link:hover {
          opacity: 0.8;
        }
      `}</style>
    </Link>
  );
}