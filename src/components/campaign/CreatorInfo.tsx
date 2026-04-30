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

  const handleTrustScoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShowTrustScore?.();
  };

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
                background: "rgba(255,94,20,0.08)",
                color: "#ea580c",
                borderRadius: 9999,
                padding: "1px 8px",
                fontSize: 11,
                fontWeight: 600,
                border: "1px solid rgba(255,94,20,0.25)",
                cursor: "pointer",
              }}
              onClick={handleTrustScoreClick}
              title="Bấm vào để xem chi tiết điểm uy tín"
            >
              <Star size={10} />
              {user.trustScore}
            </div>
          )}
        </div>
        {hasTrustScore && onShowTrustScore && (
          <div
            style={{ fontSize: 10, color: '#ea580c', marginTop: 2, cursor: 'pointer' }}
            onClick={handleTrustScoreClick}
          >
            Bấm vào để xem chi tiết
          </div>
        )}
      </div>
    </Link>
  );
}
