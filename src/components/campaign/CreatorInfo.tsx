import Image from "next/image";
import type { User } from "./types";
import { Star } from "lucide-react";

export default function CreatorInfo({ user }: { user: User }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "nowrap" }}>
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
          {user.trustScore !== undefined && user.trustScore !== null && user.trustScore > 0 && (
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
              }}
            >
              <Star size={10} />
              {user.trustScore}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
