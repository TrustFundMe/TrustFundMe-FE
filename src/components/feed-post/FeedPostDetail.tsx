"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
  canEdit?: boolean;
}

export default function FeedPostDetail({
  post,
  onToggleLike,
  onToggleFlag,
  onEdit,
  onDelete,
  canEdit = false,
}: FeedPostDetailProps) {
  const campaign = (post as any).campaign;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
        }}
      >
        <FeedPostHeader
          post={post}
          onToggleLike={onToggleLike}
          onToggleFlag={onToggleFlag}
        />
      </fieldset>

      {/* Media Field */}
      {post.attachments && post.attachments.length > 0 && (
        <fieldset
          style={{
            margin: 0,
            padding: 0,
            border: "none",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {post.attachments.map((attachment, index) => (
              <div key={index}>
                {attachment.type === "image" ? (
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: isMobile ? "1" : "4/3",
                      overflow: "hidden",
                      background: "#f2f2f2",
                      maxHeight: isMobile ? "100vw" : "600px",
                    }}
                  >
                    <Image
                      src={attachment.url}
                      alt={`Attachment ${index + 1}`}
                      fill
                      style={{
                        objectFit: "cover",
                      }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 800px, 1000px"
                    />
                  </div>
                ) : (
                  <div style={{ padding: "20px" }}>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="d-flex align-items-center gap-3"
                      style={{
                        padding: 16,
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 12,
                        background: "#fafafa",
                        textDecoration: "none",
                        color: "inherit",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f5f5f5";
                        e.currentTarget.style.borderColor = "rgba(26, 104, 91, 0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fafafa";
                        e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
                      }}
                    >
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: "rgba(0,0,0,0.05)",
                          flexShrink: 0,
                        }}
                      >
                        <i className="far fa-file" style={{ opacity: 0.75, fontSize: 20 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className="fw-bold"
                          style={{
                            fontSize: 15,
                            fontFamily: "var(--font-dm-sans)",
                          }}
                        >
                          {attachment.name || "File"}
                        </div>
                        <div
                          className="text-sm"
                          style={{
                            opacity: 0.6,
                            fontSize: 13,
                            fontFamily: "var(--font-dm-sans)",
                          }}
                        >
                          Click to download
                        </div>
                      </div>
                      <i
                        className="far fa-arrow-right"
                        style={{ opacity: 0.7, fontSize: 16, flexShrink: 0 }}
                      />
                    </a>
                  </div>
                )}
              </div>
            ))}
          
            {/* Like Button Below Media (Instagram style) - Only show if there are images */}
            {post.attachments.some((att) => att.type === "image") && (
              <div
                style={{
                  padding: "12px 20px",
                  borderTop: "1px solid rgba(0,0,0,0.08)",
                  background: "#ffffff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={onToggleLike}
                    className="d-flex align-items-center gap-2"
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "8px 0",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      color: post.liked ? "#F84D43" : "rgba(0,0,0,0.8)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <i
                      className={post.liked ? "fas fa-heart" : "far fa-heart"}
                      style={{ fontSize: 24 }}
                    />
                  </button>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      fontFamily: "var(--font-dm-sans)",
                      color: "#1a1a1a",
                    }}
                  >
                    {post.likeCount > 0 ? (
                      <>
                        <strong>{post.likeCount.toLocaleString()}</strong>{" "}
                        {post.likeCount === 1 ? "like" : "likes"}
                      </>
                    ) : (
                      "Be the first to like this"
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </fieldset>
      )}

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
          Comments ({post.comments.length})
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
            No comments yet.
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
      </fieldset>

      {/* Action Buttons Field */}
      {canEdit && (
        <fieldset
          style={{
            margin: 0,
            padding: 20,
            border: "none",
            background: "#fafafa",
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                style={{
                  background: "#1A685B",
                  border: "none",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 14,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#155a4f";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#1A685B";
                }}
              >
                <i className="far fa-edit" style={{ marginRight: 8 }} />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                style={{
                  background: "#F84D43",
                  border: "none",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 14,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e6392f";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#F84D43";
                }}
              >
                <i className="far fa-trash-alt" style={{ marginRight: 8 }} />
                Delete
              </button>
            )}
          </div>
        </fieldset>
      )}
    </article>
  );
}
