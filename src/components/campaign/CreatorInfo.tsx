import Image from "next/image";
import type { User } from "./types";

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
        <div style={{ fontWeight: 700 }}>{user.name}</div>
      </div>
    </div>
  );
}
