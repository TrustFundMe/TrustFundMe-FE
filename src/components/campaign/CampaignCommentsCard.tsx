"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { CampaignPostComment } from "./types";

type CommentVM = CampaignPostComment & {
  likes: number;
  replies: number;
  parentId?: string;
};

function clampLinesStyle(lines: number) {
  return {
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical" as const,
    wordBreak: "break-word" as const,
  };
}

function CommentRow({ comment, isReply = false }: { comment: CommentVM; isReply?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isReply ? "34px 1fr" : "44px 1fr",
        gap: 12,
        padding: isReply ? "10px 0 0 0" : "14px 0",
        marginLeft: isReply ? 24 : 0,
        borderLeft: isReply ? "2px solid rgba(0,0,0,0.06)" : "none",
        paddingLeft: isReply ? 12 : 0,
      }}
    >
      <div
        style={{
          width: isReply ? 34 : 44,
          height: isReply ? 34 : 44,
          borderRadius: 9999,
          overflow: "hidden",
          background: "rgba(0,0,0,0.06)",
          flexShrink: 0,
        }}
      >
        <Image
          src={comment.user.avatar}
          alt={comment.user.name}
          width={isReply ? 34 : 44}
          height={isReply ? 34 : 44}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <div style={{ minWidth: 0 }}>
        {/* Name + more-button row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                lineHeight: 1.1,
                fontSize: isReply ? 14 : 15,
                ...clampLinesStyle(1),
              }}
            >
              {comment.user.name}
            </div>
            <div style={{ opacity: 0.6, fontSize: isReply ? 12 : 13 }}>
              {comment.createdAt}
            </div>
          </div>

          <button
            type="button"
            aria-label="More"
            style={{
              border: "none",
              background: "transparent",
              padding: 6,
              opacity: 0.6,
              flexShrink: 0,
              cursor: "pointer",
            }}
          >
            {/* Three dots icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>

        {/* Comment content — no broken icon here */}
        <div
          style={{
            marginTop: 6,
            opacity: 0.9,
            lineHeight: 1.5,
            fontSize: isReply ? 13 : 14,
            ...clampLinesStyle(isReply ? 2 : 3),
          }}
        >
          {comment.content}
        </div>

        {/* Like & reply count */}
        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            opacity: 0.7,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            {/* Thumbs up SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            <span>{comment.likes}</span>
          </span>
          {!isReply ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              {/* Comment bubble SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>{comment.replies}</span>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function computeAdaptivePageSize(comments: CommentVM[], maxPageSize: number) {
  const sample = comments.slice(0, maxPageSize);
  const hasVeryLong = sample.some((c) => (c.content ?? "").length > 220);
  const hasLong = sample.some((c) => (c.content ?? "").length > 140);
  if (hasVeryLong) return Math.max(2, maxPageSize - 2);
  if (hasLong) return Math.max(3, maxPageSize - 1);
  return maxPageSize;
}

export default function CampaignCommentsCard({
  comments,
  pageSizeMax = 4,
  maxListHeight = 520,
}: {
  comments: CommentVM[];
  pageSizeMax?: number;
  maxListHeight?: number;
}) {
  const parents = useMemo(() => comments.filter((c) => !c.parentId), [comments]);
  const repliesByParent = useMemo(() => {
    const map = new Map<string, CommentVM[]>();
    comments
      .filter((c) => c.parentId)
      .forEach((c) => {
        const pid = c.parentId as string;
        map.set(pid, [...(map.get(pid) ?? []), c]);
      });
    return map;
  }, [comments]);

  const pageSize = useMemo(
    () => computeAdaptivePageSize(parents, pageSizeMax),
    [parents, pageSizeMax],
  );

  const totalPages = Math.max(1, Math.ceil(parents.length / pageSize));
  const [page, setPage] = useState(1);

  const pageParents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return parents.slice(start, start + pageSize);
  }, [parents, page, pageSize]);

  const headerHeight = 52;
  const pagerHeight = parents.length > pageSize ? 56 : 0;
  const listHeight = Math.max(220, maxListHeight - headerHeight - pagerHeight);

  return (
    <div
      className="single-sidebar-widgets"
      style={{ marginTop: 24, marginBottom: 24 }}
    >
      <div
        style={{
          height: headerHeight,
          padding: "0 16px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 15 }}>Bình luận</div>
        <div style={{ opacity: 0.65, fontSize: 13 }}>Mới nhất</div>
      </div>

      <div
        style={{
          height: listHeight,
          overflowY: "auto",
        }}
      >
        {pageParents.map((p) => (
          <div
            key={p.id}
            style={{
              padding: "0 16px",
              borderBottom: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <CommentRow comment={p} />
            {(repliesByParent.get(p.id) ?? []).map((r) => (
              <CommentRow key={r.id} comment={r} isReply />
            ))}
          </div>
        ))}
      </div>

      {parents.length > pageSize ? (
        <div
          style={{
            height: pagerHeight,
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "nowrap",
          }}
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              border: "1px solid rgba(0,0,0,0.10)",
              background: "#fff",
              borderRadius: 9999,
              padding: "8px 12px",
              opacity: page === 1 ? 0.5 : 1,
              cursor: page === 1 ? "default" : "pointer",
              fontWeight: 500,
            }}
          >
            Trước
          </button>

          <div style={{ opacity: 0.7, fontSize: 13 }}>
            {page}/{totalPages}
          </div>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              border: "1px solid rgba(0,0,0,0.10)",
              background: "#fff",
              borderRadius: 9999,
              padding: "8px 12px",
              opacity: page === totalPages ? 0.5 : 1,
              cursor: page === totalPages ? "default" : "pointer",
              fontWeight: 500,
            }}
          >
            Sau
          </button>
        </div>
      ) : null}
    </div>
  );
}
