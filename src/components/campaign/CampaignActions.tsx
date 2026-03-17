"use client";

import { useState } from "react";
import type { CampaignFollower } from "./types";

// ─── Report Modal ─────────────────────────────────────────────────────────────
const REPORT_REASONS = [
  "Nội dung gian lận / lừa đảo",
  "Chiến dịch không hoạt động hoặc bị bỏ rơi",
  "Thông tin sai lệch về mục tiêu",
  "Vi phạm điều khoản sử dụng",
  "Nội dung phản cảm hoặc không phù hợp",
  "Khác",
];

function FlagModal({
  onClose,
  onSubmit,
  submitting,
}: {
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  submitting: boolean;
}) {
  const [selected, setSelected] = useState<string>("");
  const [custom, setCustom] = useState("");

  const reason = selected === "Khác" ? custom.trim() : selected;

  const handleSubmit = async () => {
    if (!reason) return;
    await onSubmit(reason);
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-100">
          <div
            style={{
              width: 40, height: 40, borderRadius: 14,
              background: "rgba(239,68,68,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <i className="fas fa-flag" style={{ color: "#ef4444" }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#111", lineHeight: 1.3 }}>
              Tố cáo chiến dịch
            </h3>
            <p style={{ margin: 0, fontSize: 11, color: "#aaa", marginTop: 2 }}>
              Báo cáo sẽ được gửi đến đội kiểm duyệt
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto", width: 32, height: 32, borderRadius: 10,
              border: "none", background: "#f5f5f5", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#999", fontSize: 13,
            }}
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "#555" }}>
            Chọn lý do tố cáo:
          </p>
          {REPORT_REASONS.map((r) => (
            <label
              key={r}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                borderRadius: 14,
                border: `2px solid ${selected === r ? "#f87171" : "#f0f0f0"}`,
                background: selected === r ? "rgba(239,68,68,0.05)" : "#fafafa",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <input
                type="radio"
                name="flag-reason"
                value={r}
                checked={selected === r}
                onChange={() => setSelected(r)}
                style={{ accentColor: "#ef4444" }}
              />
              <span style={{ fontSize: 13, fontWeight: 500, color: selected === r ? "#b91c1c" : "#444" }}>
                {r}
              </span>
            </label>
          ))}

          {selected === "Khác" && (
            <textarea
              autoFocus
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Mô tả chi tiết lý do tố cáo..."
              maxLength={500}
              rows={3}
              style={{
                marginTop: 4,
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                border: "2px solid #f0f0f0",
                fontSize: 13,
                fontWeight: 500,
                color: "#333",
                background: "#fafafa",
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              flex: 1, padding: "12px 0", borderRadius: 14,
              border: "2px solid #f0f0f0", background: "#fff",
              fontSize: 13, fontWeight: 700, color: "#888", cursor: "pointer",
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || submitting}
            style={{
              flex: 1, padding: "12px 0", borderRadius: 14, border: "none",
              background: !reason || submitting ? "#f0f0f0" : "#ef4444",
              color: !reason || submitting ? "#ccc" : "#fff",
              fontSize: 13, fontWeight: 800,
              cursor: !reason || submitting ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {submitting ? (
              <>
                <span
                  style={{
                    width: 14, height: 14,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    display: "inline-block",
                  }}
                />
                Đang gửi...
              </>
            ) : (
              "Gửi tố cáo"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CampaignActions ──────────────────────────────────────────────────────────
export default function CampaignActions({
  followed,
  flagged,
  followerCount,
  onToggleFollow,
  onToggleFlag,
  onSubmitFlag,
  followers = [],
}: {
  followed: boolean;
  flagged: boolean;
  followerCount: number;
  onToggleFollow: () => void;
  onToggleFlag: () => void;
  onSubmitFlag?: (reason: string) => Promise<void>;
  followers?: CampaignFollower[];
}) {
  const [showFollowers, setShowFollowers] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenFlag = () => {
    if (flagged) return;
    setShowModal(true);
  };

  const handleSubmitFlag = async (reason: string) => {
    setSubmitting(true);
    try {
      if (onSubmitFlag) await onSubmitFlag(reason);
      onToggleFlag();
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {/* Follow button */}
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
            {/* User-plus / user-check SVG */}
            {followed ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
                <polyline points="16 11 18 13 22 9" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            )}
            {followed ? "Đang theo dõi" : "Theo dõi"}
          </button>

          {/* Follower count */}
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
            {/* User icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {followerCount} người theo dõi
          </button>

          {/* Flag / Report button */}
          <button
            type="button"
            onClick={handleOpenFlag}
            aria-label={flagged ? "Đã tố cáo" : "Tố cáo chiến dịch"}
            title={flagged ? "Bạn đã gửi tố cáo cho chiến dịch này" : "Tố cáo chiến dịch này"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              border: `1px solid ${flagged ? "rgba(248,77,67,0.3)" : "rgba(0,0,0,0.08)"}`,
              background: flagged ? "rgba(248,77,67,0.08)" : "#fff",
              color: flagged ? "#F84D43" : "#888",
              padding: "10px 14px",
              borderRadius: 9999,
              lineHeight: 1,
              fontWeight: 600,
              fontSize: 13,
              cursor: flagged ? "default" : "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {/* Flag icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill={flagged ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.85 }}>
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
            {flagged ? "Đã tố cáo" : "Tố cáo"}
          </button>
        </div>

        {/* Followers dropdown */}
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
                      src={follower.avatarUrl || "/assets/img/defaul.jpg"}
                      alt={follower.userName}
                      style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
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

      {/* Flag modal portal */}
      {showModal && (
        <FlagModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitFlag}
          submitting={submitting}
        />
      )}
    </>
  );
}
