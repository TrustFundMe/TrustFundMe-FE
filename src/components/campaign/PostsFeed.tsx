"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  DotsHorizontalIcon,
  FileIcon,
  ArrowRightIcon,
  HeartIcon,
  ChatBubbleIcon,
  Share2Icon,
  BookmarkIcon,
} from "@radix-ui/react-icons";
import type { CampaignPost, CampaignPostAttachment } from "./types";

function MediaArea({
  attachment,
  height,
}: {
  attachment: CampaignPostAttachment;
  height: number;
}) {
  if (attachment.type === "image") {
    return (
      <div
        style={{
          width: "100%",
          height,
          borderRadius: 10,
          overflow: "hidden",
          background: "#f1f5f9",
        }}
      >
        <Image
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          src={attachment.url}
          alt="post-image"
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height,
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 10,
        padding: 12,
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "#fff",
            border: "1px solid rgba(15,23,42,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FileIcon style={{ width: 14, height: 14, opacity: 0.5 }} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "#0f172a",
            }}
          >
            {attachment.name ?? "Tệp đính kèm"}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
            Nhấn để tải / xem
          </div>
        </div>
      </div>

      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "rgba(15,23,42,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <ArrowRightIcon style={{ width: 12, height: 12, opacity: 0.5 }} />
      </div>
    </div>
  );
}

function PostCard({
  post,
  onOpen,
}: {
  post: CampaignPost;
  onOpen?: (postId: string) => void;
}) {
  const attachment = post.attachments?.[0];
  const hasText = Boolean(post.content?.trim());
  const hasMedia = Boolean(attachment);

  return (
    <button
      type="button"
      onClick={() => onOpen?.(post.id)}
      style={{
        width: "100%",
        textAlign: "left",
        borderRadius: 12,
        background: "#fff",
        border: "1px solid rgba(15,23,42,0.08)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: 0,
        cursor: "pointer",
        transition: "border-color 200ms, box-shadow 200ms",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(15,23,42,0.16)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(15,23,42,0.08)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Author row */}
      <div style={{ padding: "12px 14px 0", flex: "0 0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                overflow: "hidden",
                flexShrink: 0,
                background: "#f1f5f9",
              }}
            >
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={36}
                height={36}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: "#0f172a",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 200,
                }}
              >
                {post.author.name}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, lineHeight: 1.3 }}>
                {post.createdAt}
              </div>
            </div>
          </div>

          <span style={{ opacity: 0.4, padding: 4, flexShrink: 0 }}>
            <DotsHorizontalIcon style={{ width: 14, height: 14 }} />
          </span>
        </div>

        {/* Post content text */}
        {hasText && (
          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              lineHeight: 1.5,
              color: "#334155",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: hasMedia ? 2 : 4,
              WebkitBoxOrient: "vertical",
            }}
          >
            {post.content}
          </div>
        )}
      </div>

      {/* Media / attachment */}
      {hasMedia && (
        <div style={{ padding: "10px 14px", flex: "0 0 auto" }}>
          {attachment?.type === "file" ? (
            <a
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <MediaArea attachment={attachment} height={56} />
            </a>
          ) : (
            <MediaArea attachment={attachment!} height={140} />
          )}
        </div>
      )}

      {/* Footer actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 14px",
          borderTop: "1px solid rgba(15,23,42,0.06)",
          flex: "0 0 auto",
          background: "#fafbfc",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b", fontWeight: 600 }}>
            <HeartIcon style={{ width: 14, height: 14 }} />
            <span>{post.likeCount}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b", fontWeight: 600 }}>
            <ChatBubbleIcon style={{ width: 14, height: 14 }} />
            <span>{post.comments.length}</span>
          </div>

          <span style={{ opacity: 0.4 }}>
            <Share2Icon style={{ width: 13, height: 13 }} />
          </span>
        </div>

        <span style={{ opacity: 0.4 }}>
          <BookmarkIcon style={{ width: 13, height: 13 }} />
        </span>
      </div>
    </button>
  );
}

export default function PostsFeed({
  posts,
  campaignCreatorId,
  onOpenPost,
}: {
  posts: CampaignPost[];
  campaignCreatorId: string;
  onOpenPost?: (postId: string) => void;
}) {
  const displayed = useMemo(() => {
    const owner = posts
      .filter((p) => p.author.id === campaignCreatorId)
      .slice(0, 2);
    const users = posts
      .filter((p) => p.author.id !== campaignCreatorId)
      .slice(0, 2);
    return [...owner, ...users].slice(0, 4);
  }, [posts, campaignCreatorId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {displayed.map((post) => (
        <PostCard key={post.id} post={post} onOpen={onOpenPost} />
      ))}
    </div>
  );
}
