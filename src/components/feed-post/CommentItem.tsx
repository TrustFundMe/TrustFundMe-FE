"use client";

import { useState } from "react";
import Image from "next/image";
import type { FeedPostComment } from "@/types/feedPost";

interface CommentItemProps {
  comment: FeedPostComment;
  isReply?: boolean;
  onToggleLike?: (commentId: string) => void;
  onReply?: (commentId: string) => void;
}

export default function CommentItem({
  comment,
  isReply = false,
  onToggleLike,
  onReply,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const liked = comment.liked ?? false;
  const likeCount = comment.likeCount ?? 0;
  const replies = comment.replies || [];

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return commentDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: isReply ? "12px 0 0 0" : "0",
        marginLeft: isReply ? 52 : 0,
      }}
    >
      <div
        style={{
          width: isReply ? 32 : 40,
          height: isReply ? 32 : 40,
          borderRadius: "50%",
          overflow: "hidden",
          flex: "0 0 auto",
          background: "rgba(0,0,0,0.05)",
          border: "2px solid rgba(26, 104, 91, 0.1)",
        }}
      >
        <Image
          src={comment.user.avatar || "/assets/img/about/01.jpg"}
          alt={comment.user.name}
          width={isReply ? 32 : 40}
          height={isReply ? 32 : 40}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 18,
            background: isReply ? "#f0f0f0" : "#f5f5f5",
            marginBottom: 8,
          }}
        >
          <div
            className="fw-bold"
            style={{
              fontSize: isReply ? 13 : 14,
              color: "#1a1a1a",
              marginBottom: 4,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {comment.user.name}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: isReply ? 13 : 14,
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              color: "#1a1a1a",
              fontFamily: "var(--font-dm-sans)",
              wordBreak: "break-word",
            }}
          >
            {comment.content}
          </p>
        </div>

        {/* Comment Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            paddingLeft: 4,
            marginBottom: replies.length > 0 ? 8 : 0,
          }}
        >
          <button
            type="button"
            onClick={() => onToggleLike?.(comment.id)}
            style={{
              border: "none",
              background: "transparent",
              padding: "4px 8px",
              borderRadius: 8,
              cursor: "pointer",
              transition: "background 0.2s",
              color: liked ? "#F84D43" : "rgba(0,0,0,0.6)",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "var(--font-dm-sans)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <i
              className={liked ? "fas fa-heart" : "far fa-heart"}
              style={{ fontSize: 12, marginRight: 4 }}
            />
            {likeCount > 0 && likeCount}
          </button>

          {onReply && !isReply && (
            <button
              type="button"
              onClick={() => onReply(comment.id)}
              style={{
                border: "none",
                background: "transparent",
                padding: "4px 8px",
                borderRadius: 8,
                cursor: "pointer",
                transition: "background 0.2s",
                color: "rgba(0,0,0,0.6)",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "var(--font-dm-sans)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0,0,0,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              Reply
            </button>
          )}

          <span
            style={{
              fontSize: 12,
              color: "rgba(0,0,0,0.5)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {formatTimeAgo(comment.createdAt)}
          </span>

          {replies.length > 0 && (
            <button
              type="button"
              onClick={() => setShowReplies(!showReplies)}
              style={{
                border: "none",
                background: "transparent",
                padding: "4px 8px",
                borderRadius: 8,
                cursor: "pointer",
                transition: "background 0.2s",
                color: "rgba(0,0,0,0.6)",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "var(--font-dm-sans)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0,0,0,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {showReplies ? "Hide" : "View"} {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>

        {/* Nested Replies */}
        {showReplies && replies.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 8,
            }}
          >
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isReply={true}
                onToggleLike={onToggleLike}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
