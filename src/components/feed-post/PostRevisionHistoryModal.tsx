"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { X, Clock, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { FeedPostRevisionDto, RevisionMediaItem } from "@/types/feedPost";
import { feedPostService } from "@/services/feedPostService";
import { mediaService } from "@/services/mediaService";

export interface PostRevisionHistoryModalProps {
  postId: number;
  open: boolean;
  onClose: () => void;
  /** Current post state — used to diff the LATEST revision against the live version */
  currentTitle?: string | null;
  currentContent?: string;
  currentMediaCount?: number;
}

// ─── Diff engine (word-level) ────────────────────────────────────────────────

type DiffSeg = { type: "same" | "added" | "removed"; text: string };

function wordDiff(before: string, after: string): DiffSeg[] {
  // Tokenise preserving whitespace tokens so reassembly looks natural
  const bWords = before.split(/(\s+)/);
  const aWords = after.split(/(\s+)/);
  const m = bWords.length;
  const n = aWords.length;

  // LCS table (capped to avoid quadratic blow-up on huge texts)
  const MAX = 400;
  const bW = bWords.slice(0, MAX);
  const aW = aWords.slice(0, MAX);
  const bm = bW.length;
  const an = aW.length;

  const lcs: number[][] = Array.from({ length: bm + 1 }, () =>
    new Array(an + 1).fill(0)
  );
  for (let i = 1; i <= bm; i++) {
    for (let j = 1; j <= an; j++) {
      lcs[i][j] =
        bW[i - 1] === aW[j - 1]
          ? lcs[i - 1][j - 1] + 1
          : Math.max(lcs[i - 1][j], lcs[i][j - 1]);
    }
  }

  const segs: DiffSeg[] = [];
  let i = bm;
  let j = an;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && bW[i - 1] === aW[j - 1]) {
      segs.unshift({ type: "same", text: bW[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      segs.unshift({ type: "added", text: aW[j - 1] });
      j--;
    } else {
      segs.unshift({ type: "removed", text: bW[i - 1] });
      i--;
    }
  }

  // Append remaining (if capped)
  if (m > MAX || n > MAX) {
    segs.push({ type: "same", text: "…" });
  }

  return segs;
}

// ─── Change summary ──────────────────────────────────────────────────────────

interface VersionState {
  title?: string | null;
  content: string;
  mediaCount: number;
  mediaSnapshot?: { url: string }[];
}

interface ChangeTag {
  label: string;
  kind: "title" | "content" | "media-add" | "media-remove" | "link";
}

function computeChangeTags(before: VersionState, after: VersionState, editNote?: string | null): ChangeTag[] {
  const tags: ChangeTag[] = [];
  if ((before.title ?? "") !== (after.title ?? ""))
    tags.push({ label: "Sửa tiêu đề", kind: "title" });
  if (before.content !== after.content)
    tags.push({ label: "Sửa nội dung", kind: "content" });

  // Use URL-level comparison when snapshots are available, fall back to count
  const beforeUrls = before.mediaSnapshot?.map((m) => m.url) ?? [];
  const afterUrls = after.mediaSnapshot?.map((m) => m.url) ?? [];
  const added = afterUrls.filter((u) => !beforeUrls.includes(u)).length;
  const removed = beforeUrls.filter((u) => !afterUrls.includes(u)).length;
  if (added > 0) tags.push({ label: `+${added} ảnh`, kind: "media-add" });
  if (removed > 0) tags.push({ label: `${removed} ảnh xóa`, kind: "media-remove" });
  // Fallback when no snapshots available (count-only)
  if (added === 0 && removed === 0 && before.mediaCount !== after.mediaCount) {
    const diff = after.mediaCount - before.mediaCount;
    if (diff > 0) tags.push({ label: `+${diff} ảnh`, kind: "media-add" });
    if (diff < 0) tags.push({ label: `${Math.abs(diff)} ảnh xóa`, kind: "media-remove" });
  }
  // editNote from backend signals non-content changes (e.g. target link changed)
  if (editNote && tags.length === 0) {
    tags.push({ label: editNote, kind: "link" });
  }
  return tags;
}

const TAG_COLORS: Record<ChangeTag["kind"], { bg: string; color: string }> = {
  title:        { bg: "rgba(59,130,246,0.1)",  color: "#2563eb" },
  link:         { bg: "rgba(245,158,11,0.1)",  color: "#d97706" },
  content:      { bg: "rgba(26,104,91,0.1)",   color: "#1A685B" },
  "media-add":  { bg: "rgba(16,185,129,0.1)",  color: "#059669" },
  "media-remove":{ bg: "rgba(239,68,68,0.1)",  color: "#dc2626" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const d = new Date(iso.replace(" ", "T"));
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function revToState(r: FeedPostRevisionDto): VersionState {
  return {
    title: r.title,
    content: r.content,
    mediaCount: r.mediaSnapshot?.length ?? 0,
    mediaSnapshot: r.mediaSnapshot?.map((m) => ({ url: m.url })),
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ChangeBadges({ tags }: { tags: ChangeTag[] }) {
  if (tags.length === 0)
    return (
      <span style={{ fontSize: 11, color: "rgba(0,0,0,0.35)", fontStyle: "italic" }}>
        Không phát hiện thay đổi
      </span>
    );
  return (
    <span style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {tags.map((t) => (
        <span
          key={t.label}
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: "2px 7px",
            borderRadius: 20,
            background: TAG_COLORS[t.kind].bg,
            color: TAG_COLORS[t.kind].color,
            fontFamily: "var(--font-dm-sans)",
            letterSpacing: "0.01em",
          }}
        >
          {t.label}
        </span>
      ))}
    </span>
  );
}

function DiffText({ segs }: { segs: DiffSeg[] }) {
  return (
    <span style={{ lineHeight: 1.7, wordBreak: "break-word" }}>
      {segs.map((s, i) => {
        if (s.type === "same") return <span key={i}>{s.text}</span>;
        if (s.type === "added")
          return (
            <mark
              key={i}
              style={{
                background: "rgba(16,185,129,0.18)",
                color: "#065f46",
                borderRadius: 2,
                padding: "0 1px",
              }}
            >
              {s.text}
            </mark>
          );
        // removed
        return (
          <del
            key={i}
            style={{
              background: "rgba(239,68,68,0.12)",
              color: "#991b1b",
              textDecoration: "line-through",
              borderRadius: 2,
              padding: "0 1px",
            }}
          >
            {s.text}
          </del>
        );
      })}
    </span>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

interface DetailPanelProps {
  revision: FeedPostRevisionDto;
  /** The "after" state for this revision (next revision or current post) */
  after: VersionState & { mediaSnapshot?: FeedPostRevisionDto["mediaSnapshot"] };
  editIndex: number; // 1-based human readable
}

function DetailPanel({ revision, after, editIndex }: DetailPanelProps) {
  const before = revToState(revision);
  const tags = computeChangeTags(before, after, revision.editNote);

  const titleChanged = (before.title ?? "") !== (after.title ?? "");
  const contentChanged = before.content !== after.content;

  const titleSegs = useMemo(
    () => (titleChanged ? wordDiff(before.title ?? "", after.title ?? "") : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [revision.id]
  );
  const contentSegs = useMemo(
    () => (contentChanged ? wordDiff(before.content, after.content) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [revision.id]
  );

  const removedMedia = (revision.mediaSnapshot ?? []).filter(
    (bm) => !(after.mediaSnapshot ?? []).some((am) => am.url === bm.url)
  );
  const addedMedia = (after.mediaSnapshot ?? []).filter(
    (am) => !(revision.mediaSnapshot ?? []).some((bm) => bm.url === am.url)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Meta */}
      <div
        style={{
          padding: "10px 14px",
          background: "rgba(26,104,91,0.04)",
          border: "1px solid rgba(26,104,91,0.12)",
          borderRadius: 10,
          fontSize: 12,
          color: "rgba(0,0,0,0.5)",
          fontFamily: "var(--font-dm-sans)",
          lineHeight: 1.7,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <strong style={{ color: "#1A685B" }}>Lần chỉnh sửa #{editIndex}</strong>
          <span>·</span>
          <span>{fmtDate(revision.createdAt)}</span>
          {revision.editedByName && (
            <>
              <span>·</span>
              <span>bởi <strong style={{ color: "#1a1a1a" }}>{revision.editedByName}</strong></span>
            </>
          )}
        </div>
        {revision.editNote && (
          <div style={{ marginTop: 4, fontStyle: "italic" }}>"{revision.editNote}"</div>
        )}
        <div style={{ marginTop: 6 }}>
          <ChangeBadges tags={tags} />
        </div>
      </div>

      {/* Title diff */}
      {titleChanged && (
        <Section label="Tiêu đề">
          <DiffRow
            before={<span style={{ color: "#991b1b" }}>{before.title || "(Trống)"}</span>}
            after={<span style={{ color: "#065f46" }}>{after.title || "(Trống)"}</span>}
          />
          <div style={{ marginTop: 8, fontSize: 14, fontFamily: "var(--font-dm-sans)" }}>
            <DiffText segs={titleSegs} />
          </div>
        </Section>
      )}

      {!titleChanged && before.title && (
        <Section label="Tiêu đề">
          <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>{before.title}</span>
        </Section>
      )}

      {/* Content diff */}
      {contentChanged ? (
        <Section label="Nội dung (thay đổi)">
          <div style={{ fontSize: 13, fontFamily: "var(--font-dm-sans)" }}>
            <DiffText segs={contentSegs} />
          </div>
        </Section>
      ) : (
        <Section label="Nội dung (không đổi)">
          <div
            style={{
              fontSize: 13,
              color: "#374151",
              whiteSpace: "pre-wrap",
              fontFamily: "var(--font-dm-sans)",
              lineHeight: 1.6,
            }}
          >
            {before.content}
          </div>
        </Section>
      )}

      {/* Media changes */}
      {(addedMedia.length > 0 || removedMedia.length > 0) && (
        <Section label="Hình ảnh">
          {addedMedia.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#059669",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "rgba(16,185,129,0.15)",
                    fontSize: 11,
                    color: "#059669",
                    fontWeight: 700,
                  }}
                >
                  +
                </span>
                Thêm {addedMedia.length} ảnh
              </div>
              <MediaGrid items={addedMedia} accent="green" />
            </div>
          )}
          {removedMedia.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#dc2626",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "rgba(239,68,68,0.12)",
                    fontSize: 11,
                    color: "#dc2626",
                    fontWeight: 700,
                  }}
                >
                  −
                </span>
                Xóa {removedMedia.length} ảnh
              </div>
              <MediaGrid items={removedMedia} accent="red" />
            </div>
          )}
        </Section>
      )}

      {/* No changes edge case */}
      {tags.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "20px 0",
            color: "rgba(0,0,0,0.4)",
            fontSize: 13,
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          Không phát hiện sự thay đổi nào trong lần chỉnh sửa này.
        </div>
      )}
    </div>
  );
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "rgba(0,0,0,0.35)",
          marginBottom: 6,
          fontFamily: "var(--font-dm-sans)",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function DiffRow({ before, after }: { before: React.ReactNode; after: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <div
        style={{
          flex: 1,
          minWidth: 120,
          padding: "7px 10px",
          borderRadius: 8,
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.15)",
          fontSize: 13,
          fontFamily: "var(--font-dm-sans)",
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 700, color: "#dc2626", marginBottom: 3, letterSpacing: "0.06em" }}>TRƯỚC</div>
        {before}
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 120,
          padding: "7px 10px",
          borderRadius: 8,
          background: "rgba(16,185,129,0.06)",
          border: "1px solid rgba(16,185,129,0.18)",
          fontSize: 13,
          fontFamily: "var(--font-dm-sans)",
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 700, color: "#059669", marginBottom: 3, letterSpacing: "0.06em" }}>SAU</div>
        {after}
      </div>
    </div>
  );
}

function MediaGrid({
  items,
  accent,
}: {
  items: FeedPostRevisionDto["mediaSnapshot"];
  accent: "green" | "red";
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
      {(items ?? []).map((img, i) => (
        <div
          key={i}
          style={{
            aspectRatio: "1/1",
            borderRadius: 8,
            overflow: "hidden",
            background: "rgba(0,0,0,0.05)",
            outline: `2px solid ${accent === "green" ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.35)"}`,
            position: "relative",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt={`Ảnh ${i + 1}`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/120x120?text=Lỗi+ảnh";
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function PostRevisionHistoryModal({
  postId,
  open,
  onClose,
  currentTitle,
  currentContent = "",
  currentMediaCount = 0,
}: PostRevisionHistoryModalProps) {
  const [revisions, setRevisions] = useState<FeedPostRevisionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  /** Live media list fetched from media-service so we can accurately diff the latest revision */
  const [liveMedia, setLiveMedia] = useState<RevisionMediaItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, mediaList] = await Promise.all([
        feedPostService.getRevisions(postId, { page: 0, size: 50 }),
        mediaService.getMediaByPostId(postId).catch(() => []),
      ]);
      const items: FeedPostRevisionDto[] = (res.content ?? []).sort(
        (a, b) => a.revisionNo - b.revisionNo
      );
      setRevisions(items);
      setLiveMedia(
        (mediaList ?? []).map((m) => ({
          mediaId: m.id,
          url: m.url,
          mediaType: m.mediaType,
        }))
      );
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) setError("Bài viết không tồn tại hoặc đã bị xóa.");
      else if (status === 403) setError("Bạn không có quyền xem lịch sử chỉnh sửa.");
      else setError("Không tải được lịch sử chỉnh sửa. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (open) {
      setSelectedIdx(null);
      setRevisions([]);
      setLiveMedia([]);
      load();
    }
  }, [open, load]);

  /**
   * For revision[i], the "after" state is:
   *  - revision[i+1]  if it exists  (snapshot before the NEXT edit = state after THIS edit)
   *  - current post   otherwise     (fetched live from media-service)
   */
  const afterStates = useMemo<(VersionState & { mediaSnapshot?: FeedPostRevisionDto["mediaSnapshot"] })[]>(() => {
    return revisions.map((_, i) => {
      if (i + 1 < revisions.length) {
        const next = revisions[i + 1];
        return {
          title: next.title,
          content: next.content,
          mediaCount: next.mediaSnapshot?.length ?? 0,
          mediaSnapshot: next.mediaSnapshot,
        };
      }
      return {
        title: currentTitle,
        content: currentContent,
        mediaCount: liveMedia.length > 0 ? liveMedia.length : currentMediaCount,
        mediaSnapshot: liveMedia.length > 0 ? liveMedia : undefined,
      };
    });
  }, [revisions, currentTitle, currentContent, currentMediaCount, liveMedia]);

  const changeTags = useMemo(
    () =>
      revisions.map((rev, i) =>
        computeChangeTags(revToState(rev), afterStates[i], rev.editNote)
      ),
    [revisions, afterStates]
  );

  // Display in reverse chronological (newest first)
  const displayOrder = useMemo(
    () => revisions.map((_, i) => i).reverse(),
    [revisions]
  );

  const selectedRev = selectedIdx !== null ? revisions[selectedIdx] : null;
  const editNumber = selectedIdx !== null ? selectedIdx + 1 : null; // 1-based

  return (
    <AnimatePresence>
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            style={{
              position: "relative",
              zIndex: 1,
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              width: "100%",
              maxWidth: 560,
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "15px 20px",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {selectedIdx !== null && (
                  <button
                    type="button"
                    onClick={() => setSelectedIdx(null)}
                    style={{
                      border: "none",
                      background: "rgba(0,0,0,0.06)",
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}
                <Clock size={17} color="#1A685B" />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#1a1a1a",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {selectedIdx !== null
                    ? `Lần chỉnh sửa #${editNumber}`
                    : "Lịch sử chỉnh sửa"}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  border: "none",
                  background: "rgba(0,0,0,0.06)",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              {/* Loading */}
              {loading && (
                <p
                  style={{
                    color: "rgba(0,0,0,0.45)",
                    fontSize: 14,
                    textAlign: "center",
                    padding: "32px 0",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  Đang tải lịch sử…
                </p>
              )}

              {/* Error */}
              {!loading && error && (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <p
                    style={{
                      color: "#F84D43",
                      fontSize: 14,
                      marginBottom: 12,
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={load}
                    style={{
                      padding: "6px 16px",
                      border: "1px solid rgba(0,0,0,0.15)",
                      borderRadius: 8,
                      background: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      color: "#1A685B",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {/* Empty */}
              {!loading && !error && revisions.length === 0 && (
                <p
                  style={{
                    color: "rgba(0,0,0,0.45)",
                    fontSize: 14,
                    textAlign: "center",
                    padding: "32px 0",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  Bài viết chưa được chỉnh sửa lần nào.
                </p>
              )}

              {/* Detail view */}
              {!loading && selectedIdx !== null && selectedRev && (
                <DetailPanel
                  revision={selectedRev}
                  after={afterStates[selectedIdx]}
                  editIndex={editNumber!}
                />
              )}

              {/* List view (reverse chron) */}
              {!loading && selectedIdx === null && revisions.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* "Current version" header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      borderRadius: 10,
                      background: "rgba(26,104,91,0.05)",
                      border: "1px solid rgba(26,104,91,0.15)",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#1A685B",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#1A685B",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    >
                      Phiên bản hiện tại
                    </span>
                  </div>

                  {displayOrder.map((i) => {
                    const rev = revisions[i];
                    const tags = changeTags[i];
                    const editNo = i + 1;
                    return (
                      <button
                        key={rev.id}
                        type="button"
                        onClick={() => setSelectedIdx(i)}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          padding: "11px 13px",
                          border: "1px solid rgba(0,0,0,0.08)",
                          borderRadius: 12,
                          background: "#fafafa",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.16s ease",
                          width: "100%",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            "rgba(26,104,91,0.04)";
                          (e.currentTarget as HTMLButtonElement).style.borderColor =
                            "rgba(26,104,91,0.22)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "#fafafa";
                          (e.currentTarget as HTMLButtonElement).style.borderColor =
                            "rgba(0,0,0,0.08)";
                        }}
                      >
                        {/* Edit number badge */}
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: "rgba(26,104,91,0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#1A685B",
                          }}
                        >
                          #{editNo}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Time + editor */}
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#1a1a1a",
                              fontFamily: "var(--font-dm-sans)",
                              marginBottom: 3,
                            }}
                          >
                            {fmtDate(rev.createdAt)}
                            {rev.editedByName && (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 400,
                                  color: "rgba(0,0,0,0.45)",
                                  marginLeft: 6,
                                }}
                              >
                                · {rev.editedByName}
                              </span>
                            )}
                          </div>

                          {/* Change tags */}
                          <ChangeBadges tags={tags} />

                          {/* editNote if present */}
                          {rev.editNote && (
                            <div
                              style={{
                                marginTop: 4,
                                fontSize: 11,
                                color: "rgba(0,0,0,0.4)",
                                fontStyle: "italic",
                                fontFamily: "var(--font-dm-sans)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              "{rev.editNote}"
                            </div>
                          )}
                        </div>

                        {/* Arrow indicator */}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ color: "rgba(0,0,0,0.25)", flexShrink: 0, marginTop: 6 }}
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
