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
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div style={{ minWidth: 0 }}>
            <div
              className="fw-bold"
              style={{
                lineHeight: 1.1,
                fontSize: isReply ? 14 : 15,
                ...clampLinesStyle(1),
              }}
            >
              {comment.user.name}
            </div>
            <div className="text-sm" style={{ opacity: 0.6, fontSize: isReply ? 12 : 13 }}>
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
              flex: "0 0 auto",
            }}
          >
            <i className="far fa-ellipsis-h" style={{ fontSize: 14 }} />
          </button>
        </div>

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

        <div
          className="d-flex align-items-center gap-3"
          style={{ marginTop: 8, fontSize: 13, opacity: 0.7, flexWrap: "wrap" }}
        >
          <span className="d-flex align-items-center gap-1">
            <i className="far fa-thumbs-up" style={{ fontSize: 13 }} />
            <span>{comment.likes}</span>
          </span>
          {!isReply ? (
            <span className="d-flex align-items-center gap-1">
              <i className="far fa-comment-dots" style={{ fontSize: 13 }} />
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
        className="d-flex align-items-center justify-content-between"
        style={{
          height: headerHeight,
          padding: "0 16px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <div className="fw-bold">Comments</div>
        <div className="text-sm" style={{ opacity: 0.65 }}>
          Most Recent
        </div>
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
          className="d-flex align-items-center justify-content-between"
          style={{
            height: pagerHeight,
            padding: "0 16px",
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
            }}
          >
            Previous
          </button>

          <div className="text-sm" style={{ opacity: 0.7 }}>
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
            }}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
