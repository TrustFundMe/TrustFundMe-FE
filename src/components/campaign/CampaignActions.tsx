"use client";

import { useState } from "react";
import type { CampaignFollower } from "./types";

export default function CampaignActions({
  followed,
  flagged,
  followerCount,
  onToggleFollow,
  onToggleFlag,
  followers = [],
}: {
  followed: boolean;
  flagged: boolean;
  followerCount: number;
  onToggleFollow: () => void;
  onToggleFlag: () => void;
  followers?: CampaignFollower[];
}) {
  const [showFollowers, setShowFollowers] = useState(false);

  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3" style={{ position: "relative" }}>
      <div className="d-flex align-items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={onToggleFollow}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid rgba(0,0,0,0.08)",
            background: followed ? "rgba(15, 93, 81, 0.1)" : "#fff",
            color: followed ? "#0F5D51" : "inherit",
            padding: "10px 16px",
            borderRadius: 9999,
            lineHeight: 1,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <i className={followed ? "fas fa-user-check" : "far fa-user-plus"} style={{ opacity: 0.85 }} />
          {followed ? "Đang theo dõi" : "Theo dõi"}
        </button>

        <button
          type="button"
          onClick={() => setShowFollowers(!showFollowers)}
          style={{
            fontSize: 14,
            color: "#666",
            fontWeight: 500,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <i className="far fa-user" style={{ opacity: 0.7 }} />
          {followerCount} người theo dõi
        </button>

        <button
          type="button"
          onClick={onToggleFlag}
          aria-label="Báo cáo"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "1px solid rgba(0,0,0,0.08)",
            background: flagged ? "rgba(248, 77, 67, 0.1)" : "#fff",
            color: flagged ? "#F84D43" : "inherit",
            padding: "10px 12px",
            borderRadius: 9999,
            lineHeight: 1,
            fontWeight: 500,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          <i className={flagged ? "fas fa-flag" : "far fa-flag"} style={{ opacity: 0.75 }} />
        </button>
      </div>

      {showFollowers && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 8,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            padding: 16,
            minWidth: 280,
            maxHeight: 320,
            overflowY: "auto",
            zIndex: 100,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>
            Người theo dõi ({followerCount})
          </div>
          {followers.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {followers.map((follower) => (
                <div
                  key={follower.userId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <img
                    src={follower.avatarUrl || "/assets/img/about/01.jpg"}
                    alt={follower.userName}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{follower.userName}</div>
                    <div style={{ fontSize: 11, color: "#999" }}>
                      Theo dõi {new Date(follower.followedAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "#999", fontSize: 13, textAlign: "center", padding: 20 }}>
              Chưa có người theo dõi
            </div>
          )}
        </div>
      )}
    </div>
  );
}
