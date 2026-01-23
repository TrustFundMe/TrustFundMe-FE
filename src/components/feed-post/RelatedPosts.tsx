"use client";

import Image from "next/image";
import Link from "next/link";
import type { FeedPost } from "@/types/feedPost";

interface RelatedPostsProps {
  posts: FeedPost[];
  currentPostId: string;
}

export default function RelatedPosts({
  posts,
  currentPostId,
}: RelatedPostsProps) {
  const related = posts
    .filter((p) => p.id !== currentPostId)
    .slice(0, 4);

  if (related.length === 0) {
    return null;
  }

  return (
    <fieldset
      style={{
        margin: 0,
        padding: 20,
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 12,
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
          fontFamily: "var(--font-dm-sans)",
        }}
      >
        Related Posts
      </legend>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {related.map((post) => {
          const attachment = post.attachments?.[0];
          const hasImage = attachment && attachment.type === "image";

          return (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                gap: 12,
                padding: 12,
                background: "#fafafa",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 8,
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
              {hasImage && (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    overflow: "hidden",
                    flex: "0 0 auto",
                    background: "#e5e5e5",
                  }}
                >
                  <Image
                    src={attachment.url}
                    alt={post.title || "Post image"}
                    width={80}
                    height={80}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                {post.title && (
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: 1.3,
                      marginBottom: 6,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      color: "#1a1a1a",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    {post.title}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.4,
                    color: "rgba(0,0,0,0.6)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    marginBottom: 8,
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {post.content}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  <span>{post.likeCount} likes</span>
                  <span>•</span>
                  <span>{post.comments.length} comments</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </fieldset>
  );
}
