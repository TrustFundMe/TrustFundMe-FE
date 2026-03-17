"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import type { FeedPostComment } from "@/types/feedPost";

interface CommentItemProps {
  comment: FeedPostComment;
  isReply?: boolean;
  currentUserId?: string;
  onToggleLike?: (commentId: string) => void;
  onReply?: (commentId: string, authorName: string) => void;
  onEdit?: (commentId: string, currentContent: string) => void;
  onDelete?: (commentId: string) => void;
  isAuthenticated?: boolean;
}

export default function CommentItem({
  comment,
  isReply = false,
  currentUserId,
  onToggleLike,
  onReply,
  onEdit,
  onDelete,
  isAuthenticated = false,
}: CommentItemProps) {
  const [likeAnimating, setLikeAnimating] = useState(false);
  const replies = comment.replies || [];
  const isOwner = !!(currentUserId && (comment.userId === currentUserId || comment.user.id === currentUserId));

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày`;
    return commentDate.toLocaleDateString("vi-VN", {
      month: "numeric",
      day: "numeric",
    });
  };

  const handleLike = () => {
    if (!isAuthenticated || !onToggleLike) return;
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 400);
    onToggleLike(comment.id);
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
          src={comment.user.avatar || "/assets/img/defaul.jpg"}
          alt={comment.user.name}
          width={isReply ? 32 : 40}
          height={isReply ? 32 : 40}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 18,
            background: isReply ? "#f0f0f0" : "#f5f5f5",
            marginBottom: 6,
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
            marginBottom: replies.length > 0 ? 4 : 0,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "rgba(0,0,0,0.45)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {formatTimeAgo(comment.createdAt)}
          </span>

          {/* Like button */}
          <button
            type="button"
            onClick={handleLike}
            disabled={!isAuthenticated}
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: isAuthenticated ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: comment.liked ? "#F84D43" : "rgba(0,0,0,0.5)",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "var(--font-dm-sans)",
            }}
            title={isAuthenticated ? "Thích bình luận" : "Đăng nhập để thích"}
          >
            <motion.span
              animate={likeAnimating ? { scale: [1, 1.4, 0.9, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 0.35 }}
              style={{ display: "flex", alignItems: "center" }}
            >
              <Heart
                size={13}
                style={{
                  fill: comment.liked ? "#F84D43" : "none",
                  stroke: comment.liked ? "#F84D43" : "currentColor",
                }}
              />
            </motion.span>
            {(comment.likeCount ?? 0) > 0 ? comment.likeCount : "Thích"}
          </button>

          {/* Reply button — only for root comments */}
          {!isReply && onReply && isAuthenticated && (
            <button
              type="button"
              onClick={() => onReply(comment.id, comment.user.name)}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(0,0,0,0.5)",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              Phản hồi
            </button>
          )}

          {/* Edit / Delete — owner only */}
          {isOwner && (
            <>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(comment.id, comment.content)}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "rgba(0,0,0,0.45)",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                  title="Chỉnh sửa bình luận"
                >
                  <Pencil size={11} />
                  Sửa
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#F84D43",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                  title="Xóa bình luận"
                >
                  <Trash2 size={11} />
                  Xóa
                </button>
              )}
            </>
          )}
        </div>

        {/* Nested Replies */}
        {replies.length > 0 && (
          <div style={{ marginTop: 4 }}>
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isReply
                currentUserId={currentUserId}
                onToggleLike={onToggleLike}
                onEdit={onEdit}
                onDelete={onDelete}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
