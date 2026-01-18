import Image from "next/image";
import type { User } from "./types";

export default function CreatorInfo({ user }: { user: User }) {
  return (
    <div className="d-flex align-items-center gap-3">
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 9999,
          overflow: "hidden",
          flex: "0 0 auto",
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
        <div className="text-sm" style={{ opacity: 0.75 }}>
          Creator
        </div>
        <div className="fw-bold">{user.name}</div>
      </div>
    </div>
  );
}
