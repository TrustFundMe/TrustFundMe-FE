"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Heart, MessageCircle, Send, MoreHorizontal, Flag, X, AlertTriangle, Check, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import FeedPostHeader from "./FeedPostHeader";
import CommentItem from "./CommentItem";
import ImageZoomModal, { type ZoomImage } from "./ImageZoomModal";
import type { FeedPost, FeedPostComment } from "@/types/feedPost";
import type { CampaignInfo } from "@/components/feed-post/CampaignCard";
import type { Expenditure } from "@/types/expenditure";
import { likeService } from "@/services/likeService";
import { commentService, CommentDto } from "@/services/commentService";
import { useAuth } from "@/contexts/AuthContextProxy";

interface FeedPostDetailProps {
  post: FeedPost & { campaign?: CampaignInfo };
  expenditure?: Expenditure | null;
  onToggleLike?: () => void;
  onToggleFlag?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onVisibilityChange?: () => void;
  canEdit?: boolean;
}

function commentDtoToFeedPostComment(dto: CommentDto): FeedPostComment {
  return {
    id: String(dto.id),
    userId: String(dto.userId),
    user: {
      id: String(dto.userId),
      name: dto.authorName ?? `Thành viên #${dto.userId}`,
      avatar: dto.authorAvatar ?? "",
    },
    content: dto.content,
    createdAt: dto.createdAt,
    liked: dto.isLiked ?? false,
    likeCount: dto.likeCount ?? 0,
    parentCommentId: dto.parentCommentId ? String(dto.parentCommentId) : null,
    replies: (dto.replies ?? []).map(commentDtoToFeedPostComment),
  };
}

export default function FeedPostDetail({
  post,
  expenditure,
  onToggleLike,
  onToggleFlag,
  onEdit,
  onDelete,
  onVisibilityChange,
  canEdit = false,
}: FeedPostDetailProps) {
  const { isAuthenticated, user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [comments, setComments] = useState<FeedPostComment[]>(post.comments ?? []);
  const [commentCount, setCommentCount] = useState(post.replyCount ?? 0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  // Reply state
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  // Inline edit state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const COMMENTS_PREVIEW = 4;
  // Image zoom modal state (used for post attachments)
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomImages, setZoomImages] = useState<ZoomImage[]>([]);
  const [zoomIndex, setZoomIndex] = useState(0);

  const handleOpenZoom = (images: ZoomImage[], index: number) => {
    setZoomImages(images);
    setZoomIndex(index);
    setZoomOpen(true);
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setLiked(post.liked);
    setLikeCount(post.likeCount);
  }, [post.liked, post.likeCount]);

  const loadComments = useCallback(async () => {
    try {
      const dtos = await commentService.getComments(post.id);
      // Sort oldest first (ascending createdAt) so newest appears at the bottom
      const sorted = [...dtos].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      const mapped = sorted.map(commentDtoToFeedPostComment);
      setComments(mapped);
      setCommentCount(mapped.length);
      setCommentsLoaded(true);
    } catch {
      // keep existing
    }
  }, [post.id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleLike = async () => {
    if (!isAuthenticated || post.isLocked) return;
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 400);
    try {
      const res = await likeService.toggleLike(post.id);
      setLiked(res.liked);
      setLikeCount(res.likeCount);
      onToggleLike?.();
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  const handleToggleCommentLike = async (commentId: string) => {
    if (!isAuthenticated || post.isLocked) return;

    // Optimistic update helper — works for root comments and nested replies
    const updateLike = (list: FeedPostComment[]): FeedPostComment[] =>
      list.map((c) => {
        if (c.id === commentId) {
          const wasLiked = c.liked ?? false;
          return {
            ...c,
            liked: !wasLiked,
            likeCount: wasLiked ? Math.max(0, (c.likeCount ?? 0) - 1) : (c.likeCount ?? 0) + 1,
          };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: updateLike(c.replies) };
        }
        return c;
      });

    setComments((prev) => updateLike(prev));

    try {
      const { likeCount: newCount, isLiked } = await commentService.toggleCommentLike(commentId);
      // Reconcile with server value
      const reconcile = (list: FeedPostComment[]): FeedPostComment[] =>
        list.map((c) => {
          if (c.id === commentId) return { ...c, liked: isLiked, likeCount: newCount };
          if (c.replies && c.replies.length > 0) return { ...c, replies: reconcile(c.replies) };
          return c;
        });
      setComments((prev) => reconcile(prev));
    } catch {
      // Revert on error — reload comments
      loadComments();
    }
  };

  const handleReply = (commentId: string, authorName: string) => {
    setReplyingTo({ id: commentId, name: authorName });
    setCommentText(`@${authorName} `);
    // Focus textarea via a tiny timeout to let state settle
    setTimeout(() => {
      document.getElementById("comment-input")?.focus();
    }, 50);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setCommentText("");
  };

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditingContent(currentContent);
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const handleSaveEdit = async () => {
    if (!editingCommentId || !editingContent.trim() || isSavingEdit) return;
    setIsSavingEdit(true);
    const prevComments = comments;
    const updateContent = (list: FeedPostComment[]): FeedPostComment[] =>
      list.map((c) => {
        if (c.id === editingCommentId) return { ...c, content: editingContent.trim() };
        if (c.replies?.length) return { ...c, replies: updateContent(c.replies) };
        return c;
      });
    setComments(updateContent(comments));
    try {
      await commentService.updateComment(editingCommentId, editingContent.trim());
      setEditingCommentId(null);
      setEditingContent("");
    } catch {
      setComments(prevComments);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    const prevComments = comments;
    const removeComment = (list: FeedPostComment[]): FeedPostComment[] =>
      list
        .filter((c) => c.id !== commentId)
        .map((c) => ({ ...c, replies: c.replies ? removeComment(c.replies) : [] }));
    setComments(removeComment(comments));
    setCommentCount((c) => Math.max(0, c - 1));
    try {
      await commentService.deleteComment(commentId);
    } catch {
      setComments(prevComments);
      setCommentCount((c) => c + 1);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || isSubmittingComment || !isAuthenticated || post.isLocked) return;
    setIsSubmittingComment(true);
    const tempId = `temp-${Date.now()}`;
    const isReply = replyingTo !== null;
    const parentId = replyingTo?.id ?? null;

    const tempComment: FeedPostComment = {
      id: tempId,
      user: {
        id: String(user?.id ?? "me"),
        name: user?.fullName ?? "Bạn",
        avatar: user?.avatarUrl
          ? user.avatarUrl
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName ?? "B")}&background=6366f1&color=fff`,
      },
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
      liked: false,
      likeCount: 0,
      parentCommentId: parentId,
      replies: [],
    };

    if (isReply && parentId) {
      // Append as reply under the parent
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies ?? []), tempComment] }
            : c
        )
      );
    } else {
      // Append at bottom — newest last (Facebook style)
      setComments((prev) => [...prev, tempComment]);
      // Auto expand so user sees their new comment
      setShowAllComments(true);
    }
    setCommentCount((c) => c + 1);

    const text = commentText.trim();
    const parentCommentId = parentId ? Number(parentId) : null;
    setCommentText("");
    setReplyingTo(null);

    try {
      const dto = await commentService.createComment(post.id, text, parentCommentId);
      const newComment = commentDtoToFeedPostComment(dto);
      if (isReply && parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? {
                  ...c,
                  replies: (c.replies ?? []).map((r) =>
                    r.id === tempId ? newComment : r
                  ),
                }
              : c
          )
        );
      } else {
        setComments((prev) =>
          prev.map((c) => (c.id === tempId ? newComment : c))
        );
      }
    } catch {
      if (isReply && parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: (c.replies ?? []).filter((r) => r.id !== tempId) }
              : c
          )
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== tempId));
      }
      setCommentCount((c) => Math.max(0, c - 1));
      setCommentText(text);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const visibleComments = useMemo(() => {
    if (showAllComments || comments.length <= COMMENTS_PREVIEW) return comments;
    return comments.slice(0, COMMENTS_PREVIEW);
  }, [comments, showAllComments]);

  const hiddenCount = comments.length - COMMENTS_PREVIEW;

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
      {/* Author Banned Warning */}
      {post.author.isActive === false && (
        <div style={{
          background: "#F84D43",
          color: "#fff",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "var(--font-dm-sans)",
        }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          Bài viết này thuộc về một tài khoản đã bị vô hiệu hóa do vi phạm chính sách hoặc báo cáo.
        </div>
      )}

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
                width: 36, height: 36, borderRadius: "50%", border: "none",
                background: "rgba(0,0,0,0.06)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              title="Cài đặt bài viết"
            >
              <MoreHorizontal className="w-5 h-5 text-zinc-600" />
            </button>
            {settingsOpen && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setSettingsOpen(false)} />
                <div style={{
                  position: "absolute", top: "100%", right: 0, marginTop: 4,
                  background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  minWidth: 160, zIndex: 10, overflow: "hidden",
                }}>
                  {onEdit && (
                    <button type="button" onClick={() => { setSettingsOpen(false); onEdit(); }}
                      style={{ display: "block", width: "100%", padding: "10px 16px", border: "none", background: "none", textAlign: "left", cursor: "pointer", fontSize: 14, color: "#1a1a1a" }}>
                      Chỉnh sửa
                    </button>
                  )}
                  {onDelete && (
                    <button type="button" onClick={() => { setSettingsOpen(false); onDelete(); }}
                      style={{ display: "block", width: "100%", padding: "10px 16px", border: "none", background: "none", textAlign: "left", cursor: "pointer", fontSize: 14, color: "#F84D43" }}>
                      Xóa bài viết
                    </button>
                  )}
                  {onVisibilityChange && (
                    <button type="button" onClick={() => { setSettingsOpen(false); onVisibilityChange(); }}
                      style={{ display: "block", width: "100%", padding: "10px 16px", border: "none", background: "none", textAlign: "left", cursor: "pointer", fontSize: 14, color: "#1a1a1a" }}>
                      Đổi đối tượng xem
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        <FeedPostHeader post={post} expenditure={expenditure} onToggleLike={onToggleLike} onToggleFlag={onToggleFlag} />
      </fieldset>

      {/* Media Field */}
      {post.attachments && post.attachments.length > 0 && (() => {
        const imageAttachments = post.attachments!.filter((a) => a.type === "image");
        const seenUrls = new Set<string>();
        const uniqueImages = imageAttachments.filter((a) => {
          if (seenUrls.has(a.url)) return false;
          seenUrls.add(a.url);
          return true;
        });
        const fileAttachments = post.attachments!.filter((a) => a.type !== "image");
        const zoomImages: ZoomImage[] = uniqueImages.map((a) => ({
          url: a.url,
          alt: a.name ?? post.title ?? "Ảnh",
        }));
        return (
          <fieldset style={{ margin: 0, padding: 0, border: "none", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            {uniqueImages.length > 0 && (
              <Swiper modules={[Pagination]} spaceBetween={0} slidesPerView={1} pagination={{ clickable: true }}
                className="post-detail-image-swiper"
                style={{ width: "100%", aspectRatio: "3/4", maxHeight: isMobile ? "100vw" : 480, background: "#000" }}>
                {uniqueImages.map((attachment, index) => (
                  <SwiperSlide key={`${attachment.url}-${index}`}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenZoom(zoomImages, index);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenZoom(zoomImages, index);
                        }
                      }}
                      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#000", cursor: "zoom-in" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={attachment.url}
                        alt={`Ảnh ${index + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "contain", filter: "none" }}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
            {fileAttachments.map((attachment, index) => (
              <div key={`file-${index}`} style={{ padding: "20px" }}>
                <a href={attachment.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3"
                  style={{ padding: 16, border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, background: "#fafafa", textDecoration: "none", color: "inherit", transition: "all 0.2s" }}>
                  <div className="flex items-center justify-center flex-shrink-0"
                    style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(0,0,0,0.05)" }}>
                    <span style={{ opacity: 0.75, fontSize: 20 }}>📎</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-dm-sans)" }}>{attachment.name || "Tệp đính kèm"}</div>
                    <div style={{ opacity: 0.6, fontSize: 13, fontFamily: "var(--font-dm-sans)" }}>Nhấn để tải xuống</div>
                  </div>
                </a>
              </div>
            ))}
          </fieldset>
        );
      })()}

      {/* Action Bar */}
      <fieldset style={{ margin: 0, padding: "12px 20px", border: "none", borderBottom: "1px solid rgba(0,0,0,0.08)", background: "#ffffff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          {/* Like button with animation */}
          <button
            type="button"
            onClick={handleLike}
            disabled={!isAuthenticated || post.isLocked}
            style={{
              border: "none", background: "transparent", padding: "8px 0",
              cursor: isAuthenticated && !post.isLocked ? "pointer" : "not-allowed",
              color: liked ? "#F84D43" : "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", gap: 6,
              fontSize: 14, fontWeight: 600, position: "relative",
              opacity: post.isLocked ? 0.45 : 1,
            }}
            title={
              post.isLocked
                ? "Bài đang khóa tương tác — không thể thích"
                : !isAuthenticated
                  ? "Đăng nhập để thích bài viết"
                  : undefined
            }
          >
            <motion.span
              animate={likeAnimating ? { scale: [1, 1.5, 0.9, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ display: "flex", alignItems: "center" }}
            >
              <Heart
                className="w-5 h-5"
                style={{ fill: liked ? "#F84D43" : "none", stroke: liked ? "#F84D43" : "currentColor" }}
              />
            </motion.span>
            <AnimatePresence mode="wait">
              <motion.span
                key={likeCount}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 8, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {likeCount > 0 ? `${likeCount.toLocaleString("vi-VN")} thích` : "Thích"}
              </motion.span>
            </AnimatePresence>
          </button>

          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "rgba(0,0,0,0.8)" }}>
            <MessageCircle className="w-5 h-5" />
            Bình luận {commentCount > 0 && `(${commentCount})`}
          </span>

          <button type="button" style={{ border: "none", background: "transparent", padding: "8px 0", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", gap: 6 }} title="Chia sẻ (sắp ra mắt)">
            <Send className="w-5 h-5" /> Chia sẻ
          </button>

          {!canEdit && isAuthenticated && (
            <button
              type="button"
              onClick={onToggleFlag}
              style={{ border: "none", background: "transparent", padding: "8px 0", cursor: "pointer", fontSize: 14, fontWeight: 600, color: post.flagged ? "#F84D43" : "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}
              title="Báo cáo bài viết"
            >
              <Flag className="w-4 h-4" style={{ fill: post.flagged ? "#F84D43" : "none" }} />
              Báo cáo
            </button>
          )}
        </div>
      </fieldset>

      {/* Comments Field */}
      <fieldset style={{ margin: 0, padding: 20, border: "none", borderBottom: canEdit ? "1px solid rgba(0,0,0,0.08)" : "none", background: "#ffffff" }}>
        <legend style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#1A685B", padding: "0 8px", marginBottom: 16, fontFamily: "var(--font-dm-sans)" }}>
          Bình luận ({commentCount})
        </legend>

        {/* "Xem thêm" — Facebook style — appears at top when collapsed */}
        {!showAllComments && hiddenCount > 0 && commentsLoaded && (
          <button
            type="button"
            onClick={() => setShowAllComments(true)}
            style={{
              border: "none", background: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 700, color: "rgba(0,0,0,0.6)",
              padding: "0 0 12px 0", display: "block",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Xem thêm {hiddenCount} bình luận
          </button>
        )}

        {comments.length === 0 ? (
          <p style={{ color: "rgba(0,0,0,0.5)", fontSize: 14, margin: 0, fontFamily: "var(--font-dm-sans)" }}>
            {commentsLoaded ? "Chưa có bình luận nào." : "Đang tải..."}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <AnimatePresence initial={false}>
              {visibleComments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.18 }}
                >
                  {editingCommentId === comment.id ? (
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", flex: "0 0 auto", background: "rgba(0,0,0,0.05)" }}>
                        <img src={comment.user.avatar || "/assets/img/defaul.jpg"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1, background: "#f0faf8", border: "1px solid rgba(26,104,91,0.25)", borderRadius: 12, padding: "10px 14px" }}>
                        <textarea
                          ref={editInputRef}
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); } if (e.key === "Escape") handleCancelEdit(); }}
                          style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: 14, lineHeight: 1.5, resize: "none", fontFamily: "var(--font-dm-sans)", color: "#1a1a1a", minHeight: 56 }}
                        />
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                          <button type="button" onClick={handleCancelEdit} style={{ border: "1px solid rgba(0,0,0,0.12)", background: "#fff", borderRadius: 8, padding: "4px 12px", fontSize: 12, cursor: "pointer", color: "rgba(0,0,0,0.5)", fontFamily: "var(--font-dm-sans)" }}>Hủy</button>
                          <button type="button" onClick={handleSaveEdit} disabled={isSavingEdit || !editingContent.trim()}
                            style={{ border: "none", background: "#1A685B", color: "#fff", borderRadius: 8, padding: "4px 12px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-dm-sans)", opacity: isSavingEdit || !editingContent.trim() ? 0.6 : 1 }}>
                            <Check size={11} />
                            {isSavingEdit ? "Đang lưu..." : "Lưu"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                  <CommentItem
                    comment={comment}
                    currentUserId={user ? String(user.id) : undefined}
                    onToggleLike={!post.isLocked ? handleToggleCommentLike : undefined}
                    onReply={!post.isLocked ? handleReply : undefined}
                    onEdit={isAuthenticated && !post.isLocked ? handleEditComment : undefined}
                    onDelete={isAuthenticated && !post.isLocked ? handleDeleteComment : undefined}
                    isAuthenticated={isAuthenticated}
                  />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Reply indicator */}
        {replyingTo && (
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginTop: 12, padding: "6px 12px", borderRadius: 8,
              background: "rgba(26,104,91,0.08)", border: "1px solid rgba(26,104,91,0.2)",
            }}
          >
            <span style={{ fontSize: 13, color: "#1A685B", fontFamily: "var(--font-dm-sans)" }}>
              Đang phản hồi <strong>{replyingTo.name}</strong>
            </span>
            <button type="button" onClick={handleCancelReply} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 2, color: "#1A685B" }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Comment Input Bar */}
        {post.isLocked ? (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", justifyContent: "center" }}>
            <span style={{ fontSize: 13, color: "#F84D43", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, opacity: 0.9, textAlign: "center", flexWrap: "wrap", justifyContent: "center", maxWidth: 420 }}>
              <Lock className="w-4 h-4 shrink-0" />
              Bài đang khóa tương tác — không thể thích, bình luận, trả lời hoặc thích bình luận
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            <input
              id="comment-input"
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmitComment(); } }}
              placeholder={
                !isAuthenticated
                  ? "Đăng nhập để bình luận..."
                  : replyingTo
                    ? `Phản hồi ${replyingTo.name}...`
                    : "Thêm bình luận..."
              }
              disabled={!isAuthenticated || isSubmittingComment}
              style={{ flex: 1, border: "none", outline: "none", fontSize: 14, background: "transparent", color: "#1a1a1a", fontFamily: "var(--font-dm-sans)" }}
            />
            <button
              type="button"
              disabled={!commentText.trim() || isSubmittingComment || !isAuthenticated}
              onClick={handleSubmitComment}
              style={{
                border: "none",
                background: "transparent",
                cursor: (commentText.trim() && !isSubmittingComment && isAuthenticated) ? "pointer" : "not-allowed",
                padding: 0, fontSize: 14, color: "#1A685B", fontWeight: 600,
                opacity: (commentText.trim() && !isSubmittingComment && isAuthenticated) ? 1 : 0.5,
                transition: "opacity 0.2s", fontFamily: "var(--font-dm-sans)",
              }}
            >
              {isSubmittingComment ? "..." : "Đăng"}
            </button>
          </div>
        )}
      </fieldset>
      <ImageZoomModal
        open={zoomOpen}
        onOpenChange={setZoomOpen}
        images={zoomImages}
        initialIndex={zoomIndex}
      />
    </article>
  );
}
