"use client";

import Image from "next/image";
import { useMemo } from "react";
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
          borderRadius: 12,
          overflow: "hidden",
          background: "#f2f2f2",
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
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 12,
        padding: 14,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "rgba(0,0,0,0.05)",
            flex: "0 0 auto",
          }}
        >
          <i className="far fa-file" style={{ opacity: 0.75 }} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            className="fw-bold"
            style={{
              lineHeight: 1.15,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {attachment.name ?? "Tệp đính kèm"}
          </div>
          <div className="text-sm" style={{ opacity: 0.6 }}>
            Nhấn để tải / xem
          </div>
        </div>
      </div>

      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          width: 34,
          height: 34,
          borderRadius: 9999,
          background: "rgba(0,0,0,0.05)",
          flex: "0 0 auto",
        }}
      >
        <i className="far fa-arrow-right" style={{ opacity: 0.7 }} />
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

  const mediaHeight = hasText && hasMedia ? 130 : 160;

  return (
    <button
      type="button"
      onClick={() => onOpen?.(post.id)}
      className="w-100"
      style={{
        textAlign: "left",
        borderRadius: 14,
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.10)",
        boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: 0,
      }}
    >
      <div style={{ padding: 14, flex: "0 0 auto" }}>
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 9999,
                overflow: "hidden",
                flex: "0 0 auto",
                background: "rgba(0,0,0,0.05)",
              }}
            >
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={40}
                height={40}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                className="fw-bold"
                style={{
                  lineHeight: 1.1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 220,
                }}
              >
                {post.author.name}
              </div>
              <div className="text-sm" style={{ opacity: 0.6 }}>
                {post.createdAt}
              </div>
            </div>
          </div>

          <span style={{ opacity: 0.6, padding: 6 }}>
            <i className="far fa-ellipsis-h" />
          </span>
        </div>

        {hasText ? (
          <div
            style={{
              marginTop: 10,
              fontSize: 14,
              lineHeight: 1.55,
              color: "#202426",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: hasMedia ? 2 : 5,
              WebkitBoxOrient: "vertical",
            }}
          >
            {post.content}
          </div>
        ) : null}
      </div>

      {hasMedia ? (
        <div style={{ padding: "0 14px 12px 14px", flex: "0 0 auto" }}>
          {attachment?.type === "file" ? (
            <a
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <MediaArea attachment={attachment} height={mediaHeight} />
            </a>
          ) : (
            <MediaArea attachment={attachment!} height={mediaHeight} />
          )}
        </div>
      ) : null}

      <div
        className="d-flex align-items-center justify-content-between"
        style={{
          padding: "10px 14px",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          flex: "0 0 auto",
          opacity: 0.85,
          background: "#fff",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
            <i className="far fa-thumbs-up" />
            <span>{post.likeCount.toLocaleString()}</span>
          </div>

          <div className="d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
            <i className="far fa-comment" />
            <span>{post.comments.length.toLocaleString()}</span>
          </div>

          <span style={{ opacity: 0.75 }}>
            <i className="far fa-share-square" />
          </span>
        </div>

        <span style={{ opacity: 0.75 }}>
          <i className="far fa-bookmark" />
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
    <div className="d-flex flex-column" style={{ gap: 14 }}>
      {displayed.map((post) => (
        <PostCard key={post.id} post={post} onOpen={onOpenPost} />
      ))}
    </div>
  );
}
