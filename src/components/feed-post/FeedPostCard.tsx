"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FeedPost } from "@/types/feedPost";
import { useAuth } from "@/contexts/AuthContextProxy";
import CampaignCard, { type CampaignInfo } from "./CampaignCard";

interface FeedPostCardProps {
  post: FeedPost;
  onOpen?: (postId: string) => void;
  onEdit?: (post: FeedPost) => void;
}

export default function FeedPostCard({
  post,
  onOpen,
  onEdit,
}: FeedPostCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showOptions, setShowOptions] = useState(false);

  const isAuthor = user?.id && String(user.id) === String(post.author.id);
  // Debug log (remove in production)
  // console.log(`Post ${post.id}: user=${user?.id}, author=${post.author.id}, isAuthor=${isAuthor}`);

  const images = (post.attachments || []).filter((a) => a.type === "image");
  const hasMedia = images.length > 0;
  const campaign = (post as any).campaign as CampaignInfo | undefined;
  const isHtml = /<[a-z][\s\S]*>/i.test(post.content || "");

  const handleClick = () => {
    if (onOpen) {
      onOpen(post.id);
    } else {
      router.push(`/post/${post.id}`);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return postDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 12,
        marginBottom: 24,
        overflow: "hidden",
        maxWidth: 614,
        width: "100%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {/* Header Field */}
      <fieldset
        style={{
          margin: 0,
          padding: "12px 16px",
          border: "none",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          background: "#fafafa",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
            }}
            onClick={handleClick}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid rgba(26, 104, 91, 0.1)",
                flex: "0 0 auto",
              }}
            >
              <Image
                src={post.author.avatar || "/assets/img/about/01.jpg"}
                alt={post.author.name}
                width={40}
                height={40}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  lineHeight: 1.2,
                  color: "#1a1a1a",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {post.author.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(0,0,0,0.6)",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {formatTimeAgo(post.createdAt)}
              </div>
            </div>
          </div>
          {isAuthor && (
            <div className="relative">
              <button
                type="button"
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: 8,
                  fontSize: 16,
                  color: "rgba(0,0,0,0.6)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptions(!showOptions);
                }}
              >
                <i className="far fa-ellipsis-h" />
              </button>

              {showOptions && (
                <div
                  className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-100 dark:border-zinc-700 py-1 z-10 w-32 origin-top-right transform transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      if (onEdit) {
                        onEdit(post);
                      } else {
                        router.push(`/post/${post.id}/edit`);
                      }
                      setShowOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                  >
                    <i className="far fa-edit text-xs" /> Edit
                  </button>
                  <button
                    onClick={() => alert("Delete mocked")}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2"
                  >
                    <i className="far fa-trash text-xs" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </fieldset>

      {/* Media Field - 1 ảnh full, nhiều ảnh lưới kiểu Facebook */}
      {hasMedia && (
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
              display: "grid",
              gridTemplateColumns: images.length === 1 ? "1fr" : images.length === 2 ? "1fr 1fr" : "repeat(3, 1fr)",
              gap: 2,
              maxHeight: images.length <= 2 ? 400 : 360,
              overflow: "hidden",
              cursor: "pointer",
            }}
            onClick={handleClick}
          >
            {images.slice(0, 9).map((att, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  aspectRatio: images.length === 1 ? "1" : "1",
                  background: "#f2f2f2",
                  overflow: "hidden",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={att.url}
                  alt={post.title || `Image ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </fieldset>
      )}

      {/* Content Field */}
      <fieldset
        style={{
          margin: 0,
          padding: "16px",
          border: "none",
          borderBottom: campaign ? "1px solid rgba(0,0,0,0.08)" : "none",
          background: "#ffffff",
        }}
      >
        {post.title && (
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              lineHeight: 1.3,
              color: "#1a1a1a",
              marginBottom: 12,
              marginTop: 0,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {post.title}
          </h3>
        )}
        <div
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: "#1a1a1a",
            whiteSpace: isHtml ? "normal" : "pre-wrap",
            wordBreak: "break-word",
            fontFamily: "var(--font-dm-sans)",
          }}
          {...(isHtml
            ? { dangerouslySetInnerHTML: { __html: post.content || "" } }
            : { children: post.content })}
        />
      </fieldset>

      {/* Campaign Field */}
      {campaign && (
        <fieldset
          style={{
            margin: 0,
            padding: "16px",
            border: "none",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            background: "#ffffff",
          }}
        >
          <CampaignCard campaign={campaign} compact={true} />
        </fieldset>
      )}

      {/* Actions Field */}
      <fieldset
        style={{
          margin: 0,
          padding: "12px 16px 8px",
          border: "none",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <button
            type="button"
            onClick={handleLike}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              fontSize: 24,
              color: liked ? "#F84D43" : "rgba(0,0,0,0.6)",
              transition: "transform 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <i className={liked ? "fas fa-heart" : "far fa-heart"} />
          </button>
          <button
            type="button"
            onClick={handleClick}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              fontSize: 24,
              color: "rgba(0,0,0,0.6)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <i className="far fa-comment" />
          </button>
          <button
            type="button"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              fontSize: 24,
              color: "rgba(0,0,0,0.6)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <i className="far fa-share-square" />
          </button>
          <div style={{ marginLeft: "auto" }}>
            <button
              type="button"
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0,
                fontSize: 24,
                color: "rgba(0,0,0,0.6)",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <i className="far fa-bookmark" />
            </button>
          </div>
        </div>
      </fieldset>

      {/* Engagement Field */}
      <fieldset
        style={{
          margin: 0,
          padding: "0 16px 12px",
          border: "none",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          background: "#ffffff",
        }}
      >
        {likeCount > 0 && (
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: "#1a1a1a",
              marginBottom: 8,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {likeCount.toLocaleString()} likes
          </div>
        )}

        {post.comments.length > 0 && (
          <button
            type="button"
            onClick={handleClick}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              fontSize: 14,
              color: "rgba(0,0,0,0.6)",
              marginTop: 4,
            }}
          >
            View all {post.comments.length} comments
          </button>
        )}

        <div
          style={{
            fontSize: 12,
            color: "rgba(0,0,0,0.5)",
            marginTop: 8,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {formatTimeAgo(post.createdAt)}
        </div>
      </fieldset>

      {/* Comment Input Field */}
      <fieldset
        style={{
          margin: 0,
          padding: "12px 16px",
          border: "none",
          background: "#fafafa",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <input
            type="text"
            placeholder="Add a comment..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 14,
              background: "transparent",
              color: "#1a1a1a",
              fontFamily: "var(--font-dm-sans)",
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              fontSize: 14,
              color: "#1A685B",
              fontWeight: 600,
              opacity: 0.7,
              transition: "opacity 0.2s",
              fontFamily: "var(--font-dm-sans)",
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.7";
            }}
          >
            Post
          </button>
        </div>
      </fieldset>
    </article>
  );
}
