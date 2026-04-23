"use client";

import Link from "next/link";
import { Building2, Pin } from "lucide-react";
import type { FeedPost } from "@/types/feedPost";
import type { Expenditure } from "@/types/expenditure";
import type { CampaignInfo } from "@/components/feed-post/CampaignCard";

interface FeedPostHeaderProps {
  post: FeedPost & { campaign?: CampaignInfo };
  expenditure?: Expenditure | null;
  onToggleLike?: () => void;
  onToggleFlag?: () => void;
  onViewHistory?: () => void;
}

export default function FeedPostHeader({
  post,
  expenditure,
  onToggleLike,
  onToggleFlag,
  onViewHistory,
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
      {/* Author Info — top of the post */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
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
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1a1a1a",
              marginBottom: 2,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {post.author.name}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              opacity: 0.5,
              fontSize: 12,
              fontFamily: "var(--font-dm-sans)",
              flexWrap: "wrap",
            }}
          >
            <span>{formatTimeAgo(post.createdAt)}</span>
            {post.hasRevisions && post.updatedAt && (
              <>
                <span>·</span>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onViewHistory?.(); }}
                  style={{
                    border: "none",
                    background: "none",
                    padding: 0,
                    cursor: "pointer",
                    fontSize: 12,
                    color: "#1A685B",
                    fontWeight: 600,
                    fontFamily: "var(--font-dm-sans)",
                    textDecoration: "underline",
                    textUnderlineOffset: 2,
                    opacity: 1,
                  }}
                >
                  Đã chỉnh sửa
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Type and Visibility Badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
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
              padding: "4px 10px",
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
        {post.isPinned && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 20,
              border: "1px solid rgba(234, 88, 12, 0.35)",
              background: "rgba(255, 237, 213, 0.65)",
              fontWeight: 600,
              letterSpacing: 0.2,
              fontSize: 11,
              textTransform: "uppercase",
              color: "#c2410c",
            }}
            title="Bài được ghim nổi bật trên bảng tin"
          >
            <Pin size={12} strokeWidth={2.5} />
            Đã ghim
          </span>
        )}
      </div>

      {/* Target info (CAMPAIGN only — EXPENDITURE shown in inline card below) */}
      {post.targetId && post.targetType === "CAMPAIGN" && (
        <div style={{ marginBottom: 12 }}>
          <Link
            href={`/campaigns-details?id=${post.targetId}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 8,
              background: "rgba(59, 130, 246, 0.08)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              fontSize: 12,
              fontWeight: 600,
              color: "#2563eb",
              textDecoration: "none",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            <Building2 size={13} />
            <span>{post.targetName || `Chiến dịch #${post.targetId}`}</span>
          </Link>
        </div>
      )}

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

      {/* EXPENDITURE card — right after title */}
      {post.targetType === "EXPENDITURE" && expenditure && (() => {
        const isEvidence = post.targetName?.startsWith('evidence');
        return (
        <div
          style={{
            display: "block",
            padding: "14px 16px",
            background: isEvidence ? "rgba(124,58,237,0.03)" : "#FAFAFA",
            border: isEvidence ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(124,58,237,0.2)",
            borderRadius: 10,
            fontFamily: "var(--font-dm-sans)",
            cursor: "default",
            marginBottom: 16,
            transition: "border-color 0.2s, background 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = isEvidence ? "rgba(124,58,237,0.08)" : "#F5F0FF";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.4)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = isEvidence ? "rgba(124,58,237,0.03)" : "#FAFAFA";
            (e.currentTarget as HTMLElement).style.borderColor = isEvidence ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.2)";
          }}
        >
          {/* Badge */}
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: isEvidence ? "#7C3AED" : "#6B21A8", background: isEvidence ? "#EDE9FE" : "#F3E8FF", padding: "3px 10px", borderRadius: 20 }}>
              {isEvidence ? "Minh chứng" : "Đợt chi tiêu"}
            </span>
          </div>

          {/* Plan — at top of card */}
          {expenditure.plan && (
            <div style={{ fontSize: 13, color: "#6B21A8", fontWeight: 500, marginBottom: 10, fontFamily: "var(--font-dm-sans)", lineHeight: 1.5 }}>
              {expenditure.plan.length > 80 ? expenditure.plan.slice(0, 80) + "…" : expenditure.plan}
            </div>
          )}

          {/* Campaign name */}
          <div style={{ fontSize: 13, color: "rgba(0,0,0,0.6)", marginBottom: 10, fontFamily: "var(--font-dm-sans)" }}>
            Chiến dịch: <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{post.campaign?.title || expenditure.plan || `Chiến dịch #${expenditure.campaignId}`}</span>
          </div>

          {/* Trạng thái */}
          <div style={{ fontSize: 12, color: "rgba(0,0,0,0.6)", marginBottom: 6, fontFamily: "var(--font-dm-sans)" }}>
            <span style={{ fontWeight: 500 }}>Trạng thái: </span>
            <span style={{
              fontWeight: 600,
              color: expenditure.status === "APPROVED" ? "#16A34A" : expenditure.status === "REJECTED" ? "#DC2626" : "#D97706",
            }}>
              {expenditure.status === "PENDING" ? "Chờ duyệt"
                : expenditure.status === "APPROVED" ? "Đã duyệt"
                : expenditure.status === "REJECTED" ? "Từ chối"
                : expenditure.status === "WITHDRAWAL_REQUESTED" ? "Yêu cầu rút tiền"
                : expenditure.status === "DISBURSED" ? "Đã giải ngân"
                : expenditure.status}
            </span>
          </div>

          {/* Ngày tạo */}
          {expenditure.createdAt && (
            <div style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", marginBottom: 10, fontFamily: "var(--font-dm-sans)" }}>
              <span style={{ fontWeight: 500 }}>Ngày tạo: </span>
              {new Date(expenditure.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </div>
          )}

          {/* Footer: Số tiền rút + Link */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", fontFamily: "var(--font-dm-sans)" }}>
              Số tiền rút: <span style={{ color: "#7C3AED" }}>
                {(expenditure.totalReceivedAmount != null ? Number(expenditure.totalReceivedAmount) : Number(expenditure.totalExpectedAmount)).toLocaleString("vi-VN")}đ
              </span>
            </div>
            <a
              href={`/account/campaigns/expenditures/${post.targetId}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "5px 12px",
                borderRadius: 8,
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.3)",
                fontSize: 11,
                fontWeight: 700,
                color: "#7C3AED",
                textDecoration: "none",
                fontFamily: "var(--font-dm-sans)",
                transition: "background 0.15s, border-color 0.15s",
                whiteSpace: "nowrap",
              }}
              onClick={e => e.stopPropagation()}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.18)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.5)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.1)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.3)";
              }}
            >
              Xem chi tiết →
            </a>
          </div>
        </div>
      );})()}

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
