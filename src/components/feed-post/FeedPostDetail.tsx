"use client";

import { useState, useEffect } from "react";
import { Heart, MessageCircle, Send, MoreHorizontal } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import FeedPostHeader from "./FeedPostHeader";
import CampaignCard from "./CampaignCard";
import CommentItem from "./CommentItem";
import type { FeedPost } from "@/types/feedPost";

interface FeedPostDetailProps {
  post: FeedPost;
  onToggleLike?: () => void;
  onToggleFlag?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onVisibilityChange?: () => void;
  canEdit?: boolean;
}

export default function FeedPostDetail({
  post,
  onToggleLike,
  onToggleFlag,
  onEdit,
  onDelete,
  onVisibilityChange,
  canEdit = false,
}: FeedPostDetailProps) {
  const campaign = (post as any).campaign;
  const [isMobile, setIsMobile] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setLiked(post.liked);
    setLikeCount(post.likeCount);
  }, [post.liked, post.likeCount]);

  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {/* Header Field */}
      <fieldset
        style={{
          margin: 0,
          padding: 20,
          border: "none",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          background: "#fafafa",
          position: "relative",
        }}
      >
        {canEdit && (
          <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                background: "rgba(0,0,0,0.06)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Cài đặt bài viết"
            >
              <MoreHorizontal className="w-5 h-5 text-zinc-600" />
            </button>
            {settingsOpen && (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 9 }}
                  onClick={() => setSettingsOpen(false)}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: 4,
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    minWidth: 160,
                    zIndex: 10,
                    overflow: "hidden",
                  }}
                >
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => { setSettingsOpen(false); onEdit(); }}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 16px",
                        border: "none",
                        background: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: 14,
                        color: "#1a1a1a",
                      }}
                    >
                      Chỉnh sửa
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => { setSettingsOpen(false); onDelete(); }}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 16px",
                        border: "none",
                        background: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: 14,
                        color: "#F84D43",
                      }}
                    >
                      Xóa bài viết
                    </button>
                  )}
                  {onVisibilityChange && (
                    <button
                      type="button"
                      onClick={() => { setSettingsOpen(false); onVisibilityChange(); }}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 16px",
                        border: "none",
                        background: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: 14,
                        color: "#1a1a1a",
                      }}
                    >
                      Đổi đối tượng xem
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        <FeedPostHeader
          post={post}
          onToggleLike={onToggleLike}
          onToggleFlag={onToggleFlag}
        />
      </fieldset>

      {/* Media Field: ảnh swipe ngang, file đính kèm list dưới */}
      {post.attachments && post.attachments.length > 0 && (() => {
        const imageAttachments = post.attachments.filter((a) => a.type === "image");
        const seenUrls = new Set<string>();
        const uniqueImageAttachments = imageAttachments.filter((a) => {
          if (seenUrls.has(a.url)) return false;
          seenUrls.add(a.url);
          return true;
        });
        const fileAttachments = post.attachments.filter((a) => a.type !== "image");
        return (
          <fieldset
            style={{
              margin: 0,
              padding: 0,
              border: "none",
              borderBottom: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            {uniqueImageAttachments.length > 0 && (
              <Swiper
                modules={[Pagination]}
                spaceBetween={0}
                slidesPerView={1}
                pagination={{ clickable: true }}
                className="post-detail-image-swiper"
                style={{
                  width: "100%",
                  aspectRatio: "3/4",
                  maxHeight: isMobile ? "100vw" : 480,
                  background: "#000",
                }}
              >
                {uniqueImageAttachments.map((attachment, index) => (
                  <SwiperSlide key={`${attachment.url}-${index}`}>
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        overflow: "hidden",
                        background: "#000",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={attachment.url}
                        alt={`Ảnh ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
            {fileAttachments.map((attachment, index) => (
              <div key={`file-${index}`} style={{ padding: "20px" }}>
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3"
                  style={{
                    padding: 16,
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 12,
                    background: "#fafafa",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "rgba(0,0,0,0.05)",
                    }}
                  >
                    <span style={{ opacity: 0.75, fontSize: 20 }}>📎</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-dm-sans)" }}>
                      {attachment.name || "Tệp đính kèm"}
                    </div>
                    <div style={{ opacity: 0.6, fontSize: 13, fontFamily: "var(--font-dm-sans)" }}>
                      Nhấn để tải xuống
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </fieldset>
        );
      })()}

      {/* Like / Bình luận / Chia sẻ - luôn hiển thị */}
      <fieldset
        style={{
          margin: 0,
          padding: "12px 20px",
          border: "none",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          background: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => { setLiked(!liked); setLikeCount(liked ? likeCount - 1 : likeCount + 1); onToggleLike?.(); }}
            style={{
              border: "none",
              background: "transparent",
              padding: "8px 0",
              cursor: "pointer",
              transition: "transform 0.2s",
              color: liked ? "#F84D43" : "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {liked ? <Heart className="w-5 h-5 fill-current" /> : <Heart className="w-5 h-5" />}
            {likeCount > 0 ? (
              <span>{likeCount.toLocaleString("vi-VN")} thích</span>
            ) : (
              <span>Thích</span>
            )}
          </button>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "rgba(0,0,0,0.8)" }}>
            <MessageCircle className="w-5 h-5" /> Bình luận {post.replyCount > 0 && `(${post.replyCount})`}
          </span>
          <button
            type="button"
            style={{
              border: "none",
              background: "transparent",
              padding: "8px 0",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            title="Chia sẻ (sắp ra mắt)"
          >
            <Send className="w-5 h-5" /> Chia sẻ
          </button>
        </div>
      </fieldset>

      {/* Campaign Field */}
      {campaign && (
        <fieldset
          style={{
            margin: 0,
            padding: 20,
            border: "none",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            background: "#ffffff",
          }}
        >
          <CampaignCard campaign={campaign} compact={false} />
        </fieldset>
      )}

      {/* Comments Field */}
      <fieldset
        style={{
          margin: 0,
          padding: 20,
          border: "none",
          borderBottom: canEdit ? "1px solid rgba(0,0,0,0.08)" : "none",
          background: "#ffffff",
        }}
      >
        <legend
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "#1A685B",
            padding: "0 8px",
            marginBottom: 16,
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          Bình luận ({post.comments.length})
        </legend>
        {post.comments.length === 0 ? (
          <p
            style={{
              color: "rgba(0,0,0,0.5)",
              fontSize: 14,
              margin: 0,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Chưa có bình luận nào.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {post.comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onToggleLike={(commentId) => {
                  // TODO: Implement comment like toggle
                  console.log("Toggle like for comment:", commentId);
                }}
                onReply={(commentId) => {
                  // TODO: Implement reply functionality
                  console.log("Reply to comment:", commentId);
                }}
              />
            ))}
          </div>
        )}

        {/* Comment Input Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Thêm bình luận..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 14,
              background: "transparent",
              color: "#1a1a1a",
              fontFamily: "var(--font-dm-sans)",
            }}
          />
          <button
            type="button"
            disabled={!commentText.trim()}
            style={{
              border: "none",
              background: "transparent",
              cursor: commentText.trim() ? "pointer" : "not-allowed",
              padding: 0,
              fontSize: 14,
              color: "#1A685B",
              fontWeight: 600,
              opacity: commentText.trim() ? 1 : 0.5,
              transition: "opacity 0.2s",
              fontFamily: "var(--font-dm-sans)",
            }}
            onClick={() => {
              // TODO: call API post comment when backend ready
              if (commentText.trim()) setCommentText("");
            }}
          >
            Đăng
          </button>
        </div>
      </fieldset>
    </article>
  );
}
