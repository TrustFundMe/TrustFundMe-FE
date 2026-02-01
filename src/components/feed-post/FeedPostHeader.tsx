"use client";

import type { FeedPost } from "@/types/feedPost";

interface FeedPostHeaderProps {
  post: FeedPost;
  onToggleLike?: () => void;
  onToggleFlag?: () => void;
}

export default function FeedPostHeader({
  post,
  onToggleLike,
  onToggleFlag,
}: FeedPostHeaderProps) {
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return postDate.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      {/* Type and Visibility Badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 20,
            border: "1px solid rgba(0,0,0,0.08)",
            background: "rgba(248, 77, 67, 0.08)",
            fontWeight: 600,
            letterSpacing: 0.2,
            fontSize: 11,
            textTransform: "uppercase",
            color: "#F84D43",
          }}
        >
          {post.type === "DISCUSSION" ? "Thảo luận" : post.type === "QUESTION" ? "Hỏi đáp" : post.type === "ANNOUNCEMENT" ? "Thông báo" : post.type === "CAMPAIGN_UPDATE" ? "Cập nhật chiến dịch" : post.type}
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 20,
            border: "1px solid rgba(0,0,0,0.08)",
            background: "rgba(26, 104, 91, 0.08)",
            fontWeight: 600,
            letterSpacing: 0.2,
            fontSize: 11,
            textTransform: "uppercase",
            color: "#1A685B",
          }}
        >
          {post.visibility === "PUBLIC" ? "Công khai" : post.visibility === "PRIVATE" ? "Riêng tư" : post.visibility === "FOLLOWERS" ? "Người theo dõi" : post.visibility}
        </span>
        {post.status === "DRAFT" && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 20,
              border: "1px solid rgba(0,0,0,0.08)",
              background: "rgba(0,0,0,0.05)",
              fontWeight: 600,
              letterSpacing: 0.2,
              fontSize: 11,
              textTransform: "uppercase",
              color: "rgba(0,0,0,0.6)",
            }}
          >
            Nháp
          </span>
        )}
      </div>

      {/* Title */}
      {post.title && (
        <h1
          style={{
            marginBottom: 16,
            marginTop: 0,
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 700,
            lineHeight: 1.2,
            fontSize: 28,
            color: "#1a1a1a",
          }}
        >
          {post.title}
        </h1>
      )}

      {/* Author Info */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            overflow: "hidden",
            flex: "0 0 auto",
            background: "rgba(0,0,0,0.05)",
            border: "2px solid rgba(26, 104, 91, 0.1)",
          }}
        >
          <img
            src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=6366f1&color=fff`}
            alt={post.author.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div
            className="fw-bold"
            style={{
              fontSize: 16,
              color: "#1a1a1a",
              marginBottom: 4,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {post.author.name}
          </div>
          <div
            className="text-sm"
            style={{
              opacity: 0.6,
              fontSize: 13,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {formatTimeAgo(post.createdAt)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          fontSize: 16,
          lineHeight: 1.7,
          color: "#1a1a1a",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          marginBottom: 20,
          fontFamily: "var(--font-dm-sans)",
        }}
      >
        {post.content}
      </div>

      {/* Flag Button Only */}
      {onToggleFlag && (
        <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 16, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <button
            type="button"
            onClick={onToggleFlag}
            className="d-flex align-items-center gap-2"
            style={{
              border: "none",
              background: "transparent",
              padding: "8px 12px",
              borderRadius: 8,
              cursor: "pointer",
              transition: "background 0.2s",
              color: post.flagged ? "#F84D43" : "rgba(0,0,0,0.6)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <i
              className={post.flagged ? "fas fa-flag" : "far fa-flag"}
              style={{ fontSize: 18 }}
            />
          </button>
        </div>
      )}
    </div>
  );
}
